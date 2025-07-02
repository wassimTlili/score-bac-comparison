import { PrismaClient } from '@prisma/client';
import { ComparisonModel } from './comparison-model.js';

// Initialize Prisma client
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

// Database-backed storage for comparisons
class ComparisonStorage {
  constructor() {
    this.prisma = prisma;
  }

  // Create a new comparison
  async create(comparisonData) {
    try {
      const comparison = new ComparisonModel(comparisonData);
      
      if (!comparison.isValid()) {
        throw new Error('Invalid comparison data');
      }

      // Store in database
      const savedComparison = await this.prisma.comparison.create({
        data: {
          id: comparison.id,
          orientation1Id: comparison.orientation1.id || comparison.orientation1.code,
          orientation2Id: comparison.orientation2.id || comparison.orientation2.code,
          userBacType: comparison.userProfile.bacType,
          userScore: comparison.userProfile.score,
          analysis: comparison.aiAnalysis ? JSON.stringify(comparison.aiAnalysis) : null,
          metadata: JSON.stringify({
            userProfile: comparison.userProfile,
            orientation1: comparison.orientation1,
            orientation2: comparison.orientation2,
            createdAt: comparison.createdAt
          })
        }
      });

      return comparison;
    } catch (error) {
      console.error('❌ Error creating comparison:', error);
      throw error;
    }
  }

  // Get comparison by ID
  async getById(id) {
    try {
      const dbComparison = await this.prisma.comparison.findUnique({
        where: { id }
      });

      if (!dbComparison) {
        return null;
      }

      // Parse metadata and reconstruct comparison object
      const metadata = typeof dbComparison.metadata === 'string' 
        ? JSON.parse(dbComparison.metadata) 
        : dbComparison.metadata;

      const analysis = dbComparison.analysis 
        ? (typeof dbComparison.analysis === 'string' 
           ? JSON.parse(dbComparison.analysis) 
           : dbComparison.analysis)
        : null;

      // Create ComparisonModel instance
      const comparison = new ComparisonModel({
        id: dbComparison.id,
        userProfile: metadata.userProfile,
        orientation1: metadata.orientation1,
        orientation2: metadata.orientation2,
        aiAnalysis: analysis,
        createdAt: dbComparison.createdAt
      });

      return comparison;
    } catch (error) {
      console.error('❌ Error getting comparison:', error);
      return null;
    }
  }

  // Update comparison
  async update(id, updateData) {
    try {
      const existingComparison = await this.getById(id);
      if (!existingComparison) {
        throw new Error('Comparison not found');
      }

      // Update the comparison object
      Object.assign(existingComparison, updateData);

      // Update in database
      await this.prisma.comparison.update({
        where: { id },
        data: {
          analysis: existingComparison.aiAnalysis ? JSON.stringify(existingComparison.aiAnalysis) : null,
          metadata: JSON.stringify({
            userProfile: existingComparison.userProfile,
            orientation1: existingComparison.orientation1,
            orientation2: existingComparison.orientation2,
            createdAt: existingComparison.createdAt
          }),
          updatedAt: new Date()
        }
      });

      return existingComparison;
    } catch (error) {
      console.error('❌ Error updating comparison:', error);
      throw error;
    }
  }

  // Update AI analysis for a comparison
  async updateAiAnalysis(id, aiAnalysis) {
    try {
      const existingComparison = await this.getById(id);
      if (!existingComparison) {
        throw new Error('Comparison not found');
      }

      existingComparison.updateAiAnalysis(aiAnalysis);

      // Update in database
      await this.prisma.comparison.update({
        where: { id },
        data: {
          analysis: JSON.stringify(aiAnalysis),
          updatedAt: new Date()
        }
      });

      return existingComparison;
    } catch (error) {
      console.error('❌ Error updating AI analysis:', error);
      throw error;
    }
  }

  // Delete comparison
  async delete(id) {
    try {
      await this.prisma.comparison.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('❌ Error deleting comparison:', error);
      return false;
    }
  }

  // Get all comparisons (admin function)
  async getAll() {
    try {
      const dbComparisons = await this.prisma.comparison.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return dbComparisons.map(dbComparison => {
        const metadata = typeof dbComparison.metadata === 'string' 
          ? JSON.parse(dbComparison.metadata) 
          : dbComparison.metadata;

        const analysis = dbComparison.analysis 
          ? (typeof dbComparison.analysis === 'string' 
             ? JSON.parse(dbComparison.analysis) 
             : dbComparison.analysis)
          : null;

        return new ComparisonModel({
          id: dbComparison.id,
          userProfile: metadata.userProfile,
          orientation1: metadata.orientation1,
          orientation2: metadata.orientation2,
          aiAnalysis: analysis,
          createdAt: dbComparison.createdAt
        });
      });
    } catch (error) {
      console.error('❌ Error getting all comparisons:', error);
      return [];
    }
  }

  // Search comparisons by criteria
  async search(criteria) {
    try {
      const allComparisons = await this.getAll();
      
      return allComparisons.filter(comparison => {
        // Search by orientation names
        if (criteria.orientation) {
          const searchTerm = criteria.orientation.toLowerCase();
          const hasOrientation = 
            comparison.orientation1.name.toLowerCase().includes(searchTerm) ||
            comparison.orientation2.name.toLowerCase().includes(searchTerm);
          if (!hasOrientation) return false;
        }

        // Filter by user location
        if (criteria.location) {
          if (comparison.userProfile.location !== criteria.location) return false;
        }

        // Filter by score range
        if (criteria.minScore !== undefined) {
          if (comparison.userProfile.score < criteria.minScore) return false;
        }
        if (criteria.maxScore !== undefined) {
          if (comparison.userProfile.score > criteria.maxScore) return false;
        }

        // Filter by date range
        if (criteria.startDate) {
          if (comparison.createdAt < new Date(criteria.startDate)) return false;
        }
        if (criteria.endDate) {
          if (comparison.createdAt > new Date(criteria.endDate)) return false;
        }

        return true;
      });
    } catch (error) {
      console.error('❌ Error searching comparisons:', error);
      return [];
    }
  }

  // Get statistics
  async getStats() {
    try {
      const allComparisons = await this.getAll();
      
      const stats = {
        total: allComparisons.length,
        byLocation: {},
        byOrientation: {},
        averageScore: 0,
        recentComparisons: 0
      };

      if (allComparisons.length === 0) return stats;

      // Calculate statistics
      let totalScore = 0;
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      allComparisons.forEach(comparison => {
        // Location stats
        const location = comparison.userProfile.location;
        stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;

        // Orientation stats
        const ori1 = comparison.orientation1.name;
        const ori2 = comparison.orientation2.name;
        stats.byOrientation[ori1] = (stats.byOrientation[ori1] || 0) + 1;
        stats.byOrientation[ori2] = (stats.byOrientation[ori2] || 0) + 1;

        // Score stats
        totalScore += comparison.userProfile.score;

        // Recent comparisons
        if (comparison.createdAt > oneWeekAgo) {
          stats.recentComparisons++;
        }
      });

      stats.averageScore = totalScore / allComparisons.length;

      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return {
        total: 0,
        byLocation: {},
        byOrientation: {},
        averageScore: 0,
        recentComparisons: 0
      };
    }
  }

  // Export data (for backup/migration)
  async exportData() {
    try {
      const allComparisons = await this.getAll();
      return {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        comparisons: allComparisons.map(c => c.toJSON())
      };
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }

  // Import data (for backup/migration)
  async importData(data) {
    try {
      if (!data.comparisons || !Array.isArray(data.comparisons)) {
        throw new Error('Invalid import data format');
      }

      let imported = 0;
      let errors = 0;

      for (const compData of data.comparisons) {
        try {
          const comparison = ComparisonModel.fromJSON(compData);
          await this.create(comparison);
          imported++;
        } catch (error) {
          console.error('❌ Error importing comparison:', error);
          errors++;
        }
      }

      return { imported, errors };
    } catch (error) {
      console.error('❌ Error importing data:', error);
      throw error;
    }
  }
}

// Singleton instance
const comparisonStorage = new ComparisonStorage();

export default comparisonStorage;

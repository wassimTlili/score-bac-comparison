import { prisma } from './prisma.js';

// Database-backed storage for comparisons
class ComparisonStorage {
  constructor() {
    this.prisma = prisma;
  }

  // Create a new comparison with a completely different approach
  async create(comparisonData) {
    try {
      // Validate data
      if (!comparisonData.id || !comparisonData.orientation1 || !comparisonData.orientation2) {
        throw new Error('Invalid comparison data: missing required fields');
      }

      console.log('💾 Creating comparison with minimal fields:', comparisonData.id);

      // Use absolute minimal fields to avoid any schema conflicts
      const comparisonRecord = await this.prisma.comparison.create({
        data: {
          id: comparisonData.id,
          userId: comparisonData.userId,
          userScore: Number(comparisonData.userProfile?.score || comparisonData.userProfile?.fsScore || 0),
          userBacType: comparisonData.userProfile?.bacType || comparisonData.userProfile?.filiere || 'unknown',
          userLocation: comparisonData.userProfile?.location || comparisonData.userProfile?.wilaya || 'تونس',
          // Store ALL data in aiAnalysis JSON field to avoid schema issues
          aiAnalysis: {
            orientation1: comparisonData.orientation1,
            orientation2: comparisonData.orientation2,
            userProfile: comparisonData.userProfile,
            analysis: comparisonData.aiAnalysis,
            createdAt: comparisonData.createdAt
          },
          analysisStatus: 'pending',
          isPublic: false,
          title: `مقارنة بين ${comparisonData.orientation1?.name || comparisonData.orientation1?.licence || 'تخصص 1'} و ${comparisonData.orientation2?.name || comparisonData.orientation2?.licence || 'تخصص 2'}`
        }
      });

      console.log('✅ Comparison created successfully with minimal approach');
      return comparisonData;

    } catch (error) {
      console.error('❌ Error creating comparison:', error);
      throw new Error(`Failed to store comparison: ${error.message}`);
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

      // Extract data from aiAnalysis JSON field
      const aiAnalysisData = dbComparison.aiAnalysis || {};
      
      // Ensure userProfile is always present with fallback data
      const userProfile = aiAnalysisData.userProfile || {
        score: dbComparison.userScore || 0,
        fsScore: dbComparison.userScore || 0,
        bacType: dbComparison.userBacType || 'unknown',
        filiere: dbComparison.userBacType || 'unknown',
        location: dbComparison.userLocation || 'تونس',
        wilaya: dbComparison.userLocation || 'تونس'
      };
      
      // Return plain object with the structure expected by the client
      return {
        id: dbComparison.id,
        userId: dbComparison.userId,
        userProfile: userProfile,
        orientation1: aiAnalysisData.orientation1 || {},
        orientation2: aiAnalysisData.orientation2 || {},
        aiAnalysis: aiAnalysisData.analysis || null,
        analysisStatus: dbComparison.analysisStatus || 'pending',
        title: dbComparison.title,
        createdAt: dbComparison.createdAt
      };
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
          aiAnalysis: existingComparison.aiAnalysis ? JSON.stringify(existingComparison.aiAnalysis) : null,
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
      const existingComparison = await this.prisma.comparison.findUnique({
        where: { id }
      });
      
      if (!existingComparison) {
        throw new Error('Comparison not found');
      }

      // Update the aiAnalysis field while preserving existing data
      const currentAiAnalysis = existingComparison.aiAnalysis || {};
      const updatedAiAnalysis = {
        ...currentAiAnalysis,
        analysis: aiAnalysis
      };

      // Update in database
      await this.prisma.comparison.update({
        where: { id },
        data: {
          aiAnalysis: updatedAiAnalysis,
          analysisStatus: 'completed'
        }
      });

      return {
        ...existingComparison,
        aiAnalysis: aiAnalysis,
        analysisStatus: 'completed'
      };
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

        return {
          id: dbComparison.id,
          userProfile: metadata.userProfile,
          orientation1: metadata.orientation1,
          orientation2: metadata.orientation2,
          aiAnalysis: analysis,
          createdAt: dbComparison.createdAt
        };
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
            (comparison.orientation1.name || comparison.orientation1.licence || '').toLowerCase().includes(searchTerm) ||
            (comparison.orientation2.name || comparison.orientation2.licence || '').toLowerCase().includes(searchTerm);
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
        const ori1 = comparison.orientation1.name || comparison.orientation1.licence;
        const ori2 = comparison.orientation2.name || comparison.orientation2.licence;
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
        comparisons: allComparisons
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
          await this.create(compData);
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

// Export only the database version - no localStorage fallback
const comparisonStorage = new ComparisonStorage();

const comparisonStorageAPI = {
  async create(data) {
    return await comparisonStorage.create(data);
  },
  
  async getById(id) {
    return await comparisonStorage.getById(id);
  },
  
  async updateAiAnalysis(id, analysis) {
    return await comparisonStorage.updateAiAnalysis(id, analysis);
  }
};

export default comparisonStorageAPI;

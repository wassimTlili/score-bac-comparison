import { ComparisonModel } from './comparison-model.js';

// Global storage that persists across hot reloads in development
if (!global.comparisonStorageInstance) {
  global.comparisonStorageInstance = new Map();
}

// In-memory storage (replace with database in production)
class ComparisonStorage {
  constructor() {
    // Use global storage to persist across Next.js hot reloads
    this.comparisons = global.comparisonStorageInstance;
  }

  // Create a new comparison
  async create(comparisonData) {
    try {
      const comparison = new ComparisonModel(comparisonData);
      
      if (!comparison.isValid()) {
        throw new Error('Invalid comparison data');
      }

      this.comparisons.set(comparison.id, comparison);
      
      return comparison;
    } catch (error) {
      console.error('❌ Error creating comparison:', error);
      throw error;
    }
  }

  // Get comparison by ID
  async getById(id) {
    try {
      const comparison = this.comparisons.get(id);
      return comparison || null;
    } catch (error) {
      console.error('❌ Error getting comparison:', error);
      return null;
    }
  }

  // Update comparison
  async update(id, updateData) {
    try {
      const comparison = this.comparisons.get(id);
      if (!comparison) {
        throw new Error('Comparison not found');
      }

      // Update fields
      Object.assign(comparison, updateData);
      comparison.updatedAt = new Date();

      this.comparisons.set(id, comparison);
      return comparison;
    } catch (error) {
      console.error('Error updating comparison:', error);
      throw error;
    }
  }

  // Update AI analysis for a comparison
  async updateAiAnalysis(id, aiAnalysis) {
    try {
      const comparison = this.comparisons.get(id);
      if (!comparison) {
        throw new Error('Comparison not found');
      }

      comparison.updateAiAnalysis(aiAnalysis);
      this.comparisons.set(id, comparison);
      return comparison;
    } catch (error) {
      console.error('Error updating AI analysis:', error);
      throw error;
    }
  }

  // Delete comparison
  async delete(id) {
    try {
      const deleted = this.comparisons.delete(id);
      return deleted;
    } catch (error) {
      console.error('Error deleting comparison:', error);
      return false;
    }
  }

  // Get all comparisons (admin function)
  async getAll() {
    try {
      return Array.from(this.comparisons.values());
    } catch (error) {
      console.error('Error getting all comparisons:', error);
      return [];
    }
  }

  // Search comparisons by criteria
  async search(criteria) {
    try {
      const allComparisons = Array.from(this.comparisons.values());
      
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
      console.error('Error searching comparisons:', error);
      return [];
    }
  }

  // Get statistics
  async getStats() {
    try {
      const allComparisons = Array.from(this.comparisons.values());
      
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
      console.error('Error getting stats:', error);
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
      const allComparisons = Array.from(this.comparisons.values());
      return {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        comparisons: allComparisons.map(c => c.toJSON())
      };
    } catch (error) {
      console.error('Error exporting data:', error);
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
          this.comparisons.set(comparison.id, comparison);
          imported++;
        } catch (error) {
          console.error('Error importing comparison:', error);
          errors++;
        }
      }

      return { imported, errors };
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Singleton instance
const comparisonStorage = new ComparisonStorage();

export default comparisonStorage;

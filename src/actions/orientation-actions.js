'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================
// ORIENTATION DATA ACTIONS
// ============================================

/**
 * Get all orientations with filtering and pagination
 */
export async function getOrientations(filters = {}, options = {}) {
  try {
    const {
      bacTypeId,
      universityId,
      fieldOfStudyId,
      search,
      minScore,
      maxScore,
      region,
      limit = 50,
      offset = 0,
      orderBy = 'popularity',
      orderDirection = 'desc'
    } = { ...filters, ...options };

    // Build where clause
    const where = {
      isActive: true,
      ...(bacTypeId && { bacTypeId }),
      ...(universityId && { universityId }),
      ...(fieldOfStudyId && { fieldOfStudyId }),
      ...(search && {
        OR: [
          { specialization: { contains: search, mode: 'insensitive' } },
          { university: { name: { contains: search, mode: 'insensitive' } } },
          { institution: { name: { contains: search, mode: 'insensitive' } } }
        ]
      }),
      ...(region && { university: { region } })
    };

    // Add score filtering if provided
    if (minScore || maxScore) {
      where.historicalScores = {};
      // This would need custom logic based on your historicalScores JSON structure
    }

    const orientations = await prisma.orientation.findMany({
      where,
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true,
        _count: {
          select: {
            favorites: true,
            comparisons1: true,
            comparisons2: true
          }
        }
      },
      orderBy: {
        [orderBy]: orderDirection
      },
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.orientation.count({ where });

    return {
      success: true,
      orientations,
      totalCount,
      hasMore: offset + limit < totalCount
    };
  } catch (error) {
    console.error('Error getting orientations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get orientation by ID with full details
 */
export async function getOrientationById(orientationId) {
  try {
    const orientation = await prisma.orientation.findUnique({
      where: { id: orientationId },
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true,
        embeddings: true,
        _count: {
          select: {
            favorites: true,
            comparisons1: true,
            comparisons2: true
          }
        }
      }
    });

    if (!orientation) {
      return { success: false, error: 'Orientation not found' };
    }

    // Increment popularity (view count)
    await prisma.orientation.update({
      where: { id: orientationId },
      data: {
        popularity: {
          increment: 1
        }
      }
    });

    return { success: true, orientation };
  } catch (error) {
    console.error('Error getting orientation by ID:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get orientation by ramz code
 */
export async function getOrientationByRamzCode(ramzCode) {
  try {
    const orientation = await prisma.orientation.findUnique({
      where: { ramzCode },
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true
      }
    });

    if (!orientation) {
      return { success: false, error: 'Orientation not found' };
    }

    return { success: true, orientation };
  } catch (error) {
    console.error('Error getting orientation by ramz code:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Search orientations with advanced filters
 */
export async function searchOrientations(query, filters = {}) {
  try {
    const {
      bacTypes = [],
      universities = [],
      fields = [],
      regions = [],
      scoreRange = {},
      limit = 20
    } = filters;

    const where = {
      isActive: true,
      OR: [
        { specialization: { contains: query, mode: 'insensitive' } },
        { university: { name: { contains: query, mode: 'insensitive' } } },
        { institution: { name: { contains: query, mode: 'insensitive' } } },
        { bacType: { name: { contains: query, mode: 'insensitive' } } },
        { fieldOfStudy: { name: { contains: query, mode: 'insensitive' } } }
      ],
      ...(bacTypes.length > 0 && { bacTypeId: { in: bacTypes } }),
      ...(universities.length > 0 && { universityId: { in: universities } }),
      ...(fields.length > 0 && { fieldOfStudyId: { in: fields } }),
      ...(regions.length > 0 && { university: { region: { in: regions } } })
    };

    const orientations = await prisma.orientation.findMany({
      where,
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true,
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: [
        { popularity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return { success: true, orientations };
  } catch (error) {
    console.error('Error searching orientations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get recommended orientations for user
 */
export async function getRecommendedOrientations(userProfileId, limit = 10) {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: userProfileId }
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get orientations matching user's bac type
    const orientations = await prisma.orientation.findMany({
      where: {
        isActive: true,
        bacType: {
          name: profile.filiere // This mapping might need adjustment
        }
      },
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true,
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: [
        { popularity: 'desc' },
        { _count: { favorites: 'desc' } }
      ],
      take: limit
    });

    return { success: true, orientations };
  } catch (error) {
    console.error('Error getting recommended orientations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get popular orientations
 */
export async function getPopularOrientations(limit = 10) {
  try {
    const orientations = await prisma.orientation.findMany({
      where: { isActive: true },
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true,
        _count: {
          select: {
            favorites: true,
            comparisons1: true,
            comparisons2: true
          }
        }
      },
      orderBy: {
        popularity: 'desc'
      },
      take: limit
    });

    return { success: true, orientations };
  } catch (error) {
    console.error('Error getting popular orientations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get orientations by university
 */
export async function getOrientationsByUniversity(universityId) {
  try {
    const orientations = await prisma.orientation.findMany({
      where: {
        universityId,
        isActive: true
      },
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true
      },
      orderBy: {
        specialization: 'asc'
      }
    });

    return { success: true, orientations };
  } catch (error) {
    console.error('Error getting orientations by university:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get orientations by field of study
 */
export async function getOrientationsByField(fieldOfStudyId) {
  try {
    const orientations = await prisma.orientation.findMany({
      where: {
        fieldOfStudyId,
        isActive: true
      },
      include: {
        university: true,
        bacType: true,
        fieldOfStudy: true,
        institution: true
      },
      orderBy: {
        popularity: 'desc'
      }
    });

    return { success: true, orientations };
  } catch (error) {
    console.error('Error getting orientations by field:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get universities
 */
export async function getUniversities() {
  try {
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { orientations: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, universities };
  } catch (error) {
    console.error('Error getting universities:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get bac types
 */
export async function getBacTypes() {
  try {
    const bacTypes = await prisma.bacType.findMany({
      include: {
        _count: {
          select: { orientations: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, bacTypes };
  } catch (error) {
    console.error('Error getting bac types:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get fields of study
 */
export async function getFieldsOfStudy() {
  try {
    const fields = await prisma.fieldOfStudy.findMany({
      include: {
        _count: {
          select: { orientations: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, fields };
  } catch (error) {
    console.error('Error getting fields of study:', error);
    return { success: false, error: error.message };
  }
}

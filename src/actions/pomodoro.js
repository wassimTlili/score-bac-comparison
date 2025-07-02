'use server'

import { prisma } from '@/lib/prisma';

export async function savePomodoroSettings(userId, settings, tasks = []) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Upsert the pomodoro settings
    const result = await prisma.pomodoroSettings.upsert({
      where: {
        userId: userId,
      },
      update: {
        settings: settings,
        tasks: tasks,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        settings: settings,
        tasks: tasks,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving pomodoro settings:', error);
    return { success: false, error: error.message };
  }
}

export async function getPomodoroSettings(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const settings = await prisma.pomodoroSettings.findUnique({
      where: {
        userId: userId,
      },
    });

    return settings;
  } catch (error) {
    console.error('Error getting pomodoro settings:', error);
    return null;
  }
}

export async function saveLofiSettings(userId, settings) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const result = await prisma.lofiSettings.upsert({
      where: {
        userId: userId,
      },
      update: {
        settings: settings,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        settings: settings,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving lofi settings:', error);
    return { success: false, error: error.message };
  }
}

export async function getLofiSettings(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const settings = await prisma.lofiSettings.findUnique({
      where: {
        userId: userId,
      },
    });

    return settings?.settings || null;
  } catch (error) {
    console.error('Error getting lofi settings:', error);
    return null;
  }
}

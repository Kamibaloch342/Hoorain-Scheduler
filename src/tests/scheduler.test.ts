import { describe, it, expect, beforeEach } from 'vitest';
import { PLATFORMS, buildPlatformLaunchData } from '../data/platforms';
import { DEFAULT_DESTINATIONS } from '../data/defaultDestinations';
import { storage } from '../services/storageService';
import { Task, Destination, RecurringRule } from '../types';

describe('1. 6 Platforms Registry & Smart Launcher', () => {
  it('should support all 6 requested platforms', () => {
    const platformIds = Object.keys(PLATFORMS);
    expect(platformIds).toContain('facebook');
    expect(platformIds).toContain('whatsapp');
    expect(platformIds).toContain('x');
    expect(platformIds).toContain('linkedin');
    expect(platformIds).toContain('pinterest');
    expect(platformIds).toContain('meta_business_suite');
    expect(platformIds.length).toBe(6);
  });

  it('should build proper intent URLs and clipboard text for X/Twitter', () => {
    const dest: Destination = {
      id: 'test-x',
      platformId: 'x',
      name: 'X Brand',
      category: 'profile',
      targetUrl: 'https://twitter.com/test',
      isActive: true,
      defaultPostCountTarget: 1,
    };
    const task: Task = {
      id: 't-1',
      destinationId: 'test-x',
      platformId: 'x',
      title: 'Announcement',
      content: 'Hello World',
      tags: ['ai', 'growth'],
      scheduledAt: new Date().toISOString(),
      status: 'scheduled',
      postTarget: 1,
      postCompletedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = buildPlatformLaunchData(dest, task);
    expect(result.clipboardText).toBe('Hello World\n\n#ai #growth');
    expect(result.url).toContain('https://twitter.com/intent/tweet?text=');
    expect(result.url).toContain(encodeURIComponent('Hello World\n\n#ai #growth'));
  });

  it('should build proper intent URLs for WhatsApp', () => {
    const dest: Destination = {
      id: 'test-wa',
      platformId: 'whatsapp',
      name: 'WA VIP',
      category: 'group',
      targetUrl: 'https://web.whatsapp.com/',
      isActive: true,
      defaultPostCountTarget: 1,
    };
    const task: Task = {
      id: 't-2',
      destinationId: 'test-wa',
      platformId: 'whatsapp',
      title: 'VIP Promo',
      content: 'Get 50% discount today',
      scheduledAt: new Date().toISOString(),
      status: 'scheduled',
      postTarget: 1,
      postCompletedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = buildPlatformLaunchData(dest, task);
    expect(result.url).toContain('https://web.whatsapp.com/send?text=');
    expect(result.url).toContain(encodeURIComponent('Get 50% discount today'));
  });
});

describe('2. 25+ Preconfigured Destinations', () => {
  it('should contain at least 25 destinations across all platforms', () => {
    expect(DEFAULT_DESTINATIONS.length).toBeGreaterThanOrEqual(25);
    expect(DEFAULT_DESTINATIONS.length).toBe(27);
  });

  it('should have valid structure for all destinations', () => {
    DEFAULT_DESTINATIONS.forEach(dest => {
      expect(dest.id).toBeTruthy();
      expect(dest.name).toBeTruthy();
      expect(dest.category).toBeTruthy();
      expect(dest.targetUrl).toMatch(/^https?:\/\//);
      expect(dest.defaultPostCountTarget).toBeGreaterThanOrEqual(1);
      expect(['facebook', 'whatsapp', 'x', 'linkedin', 'pinterest', 'meta_business_suite']).toContain(dest.platformId);
    });
  });
});

describe('3. Automated Missed-Task Detection Engine', () => {
  it('should automatically flag past uncompleted tasks as missed', () => {
    const pastTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    const futureTime = new Date(Date.now() + 3600000).toISOString(); // 1 hour ahead

    const tasks: Task[] = [
      {
        id: 'task-overdue',
        destinationId: 'fb-main-page',
        platformId: 'facebook',
        title: 'Overdue Post',
        content: 'Content',
        scheduledAt: pastTime,
        status: 'scheduled',
        postTarget: 1,
        postCompletedCount: 0,
        createdAt: pastTime,
        updatedAt: pastTime,
      },
      {
        id: 'task-future',
        destinationId: 'fb-main-page',
        platformId: 'facebook',
        title: 'Future Post',
        content: 'Content',
        scheduledAt: futureTime,
        status: 'scheduled',
        postTarget: 1,
        postCompletedCount: 0,
        createdAt: pastTime,
        updatedAt: pastTime,
      },
      {
        id: 'task-completed-past',
        destinationId: 'fb-main-page',
        platformId: 'facebook',
        title: 'Already Completed',
        content: 'Content',
        scheduledAt: pastTime,
        status: 'completed',
        postTarget: 1,
        postCompletedCount: 1,
        createdAt: pastTime,
        updatedAt: pastTime,
      }
    ];

    const result = storage.runMissedTaskCheck(tasks);
    expect(result.newlyMissedCount).toBe(1);

    const overdueUpdated = result.updatedTasks.find(t => t.id === 'task-overdue');
    const futureUpdated = result.updatedTasks.find(t => t.id === 'task-future');
    const completedUpdated = result.updatedTasks.find(t => t.id === 'task-completed-past');

    expect(overdueUpdated?.status).toBe('missed');
    expect(futureUpdated?.status).toBe('scheduled');
    expect(completedUpdated?.status).toBe('completed');
  });
});

describe('4. Metrics Calculation Engine', () => {
  it('should calculate accurate metrics and completion rates', () => {
    const destinations = DEFAULT_DESTINATIONS;
    const tasks: Task[] = [
      {
        id: '1',
        destinationId: 'fb-main-page',
        platformId: 'facebook',
        title: 'P1',
        content: 'C1',
        scheduledAt: new Date().toISOString(),
        status: 'completed',
        postTarget: 1,
        postCompletedCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        destinationId: 'x-official-brand',
        platformId: 'x',
        title: 'P2',
        content: 'C2',
        scheduledAt: new Date().toISOString(),
        status: 'scheduled',
        postTarget: 1,
        postCompletedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        destinationId: 'wa-official-channel',
        platformId: 'whatsapp',
        title: 'P3',
        content: 'C3',
        scheduledAt: new Date().toISOString(),
        status: 'missed',
        postTarget: 1,
        postCompletedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    const metrics = storage.calculateMetrics(tasks, destinations);
    expect(metrics.totalTasks).toBe(3);
    expect(metrics.completedTasks).toBe(1);
    expect(metrics.scheduledTasks).toBe(1);
    expect(metrics.missedTasks).toBe(1);
    expect(metrics.completionRate).toBe(33); // 1/3 = 33%
    expect(metrics.totalDestinations).toBe(27);
  });
});

describe('5. CSV & JSON Data Portability', () => {
  it('should export and parse CSV with commas and quotes properly', () => {
    const destinations = DEFAULT_DESTINATIONS;
    const tasks: Task[] = [
      {
        id: 't-csv-1',
        destinationId: 'fb-main-page',
        platformId: 'facebook',
        title: 'Post, with comma',
        content: 'Content "with quotes" and multiple lines',
        scheduledAt: '2026-10-10T14:30:00.000Z',
        status: 'scheduled',
        postTarget: 2,
        postCompletedCount: 0,
        tags: ['news', 'update'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    const csvOutput = storage.exportTasksToCsv(tasks, destinations);
    expect(csvOutput).toContain('Date,Time,Platform,Destination,Status,Title,Content,Tags,PostTarget,CompletedCount');
    expect(csvOutput).toContain('"Post, with comma"');

    const importResult = storage.importTasksFromCsv(csvOutput, destinations);
    expect(importResult.success).toBe(true);
    expect(importResult.addedCount).toBeGreaterThanOrEqual(1);
  });
});

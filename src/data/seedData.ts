import { Task, RecurringRule } from '../types';

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const date = now.getDate();

function formatIso(d: Date, hours: number, minutes: number = 0): string {
  const target = new Date(d);
  target.setHours(hours, minutes, 0, 0);
  return target.toISOString();
}

const todayDate = new Date(year, month, date);
const yesterdayDate = new Date(year, month, date - 1);
const tomorrowDate = new Date(year, month, date + 1);
const dayAfterTomorrow = new Date(year, month, date + 2);
const threeDaysLater = new Date(year, month, date + 3);

export const DEFAULT_RECURRING_RULES: RecurringRule[] = [
  {
    id: 'rule-daily-morning-x',
    title: 'Daily Morning Industry Thought on X',
    destinationId: 'x-official-brand',
    frequency: 'daily',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    timeSlots: ['09:00', '14:30', '19:00'],
    postsPerSlot: 1,
    contentTemplate: 'Daily tip: Focus on distribution as much as product quality. 🚀',
    tags: ['buildinpublic', 'saas', 'growth'],
    isActive: true,
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
  },
  {
    id: 'rule-weekday-linkedin',
    title: 'B2B Founder Insights on LinkedIn',
    destinationId: 'li-founder-profile',
    frequency: 'weekdays',
    daysOfWeek: [1, 2, 3, 4, 5],
    timeSlots: ['10:00'],
    postsPerSlot: 1,
    contentTemplate: 'Here are 3 fundamental shifts happening in multi-platform social management this quarter...',
    tags: ['leadership', 'productivity', 'management'],
    isActive: true,
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
  },
  {
    id: 'rule-wa-announcements',
    title: 'WhatsApp VIP Channel Daily Broadcast',
    destinationId: 'wa-official-channel',
    frequency: 'daily',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    timeSlots: ['12:30', '18:00'],
    postsPerSlot: 1,
    contentTemplate: '📢 Community Bulletin: Today’s live AMA session starts at 4 PM GMT. Join here: https://meet.hoorain.app/ama',
    tags: ['community', 'bulletin'],
    isActive: true,
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
  },
  {
    id: 'rule-pinterest-infographics',
    title: 'Pinterest Infographics Weekly Drop',
    destinationId: 'pin-infographics',
    frequency: 'custom_days',
    daysOfWeek: [1, 3, 5],
    timeSlots: ['15:00'],
    postsPerSlot: 2,
    contentTemplate: 'The 2026 Social Scheduling Architecture Diagram: High-resolution visual framework.',
    tags: ['infographic', 'socialmedia', 'strategy'],
    isActive: true,
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
  },
  {
    id: 'rule-mbs-cross-post',
    title: 'Meta Business Suite Feed & Reels Planner',
    destinationId: 'mbs-cross-feed',
    frequency: 'weekdays',
    daysOfWeek: [1, 2, 3, 4, 5],
    timeSlots: ['16:00'],
    postsPerSlot: 1,
    contentTemplate: 'Mastering consistency across 6 major networks without burning out. Full walkthrough below 👇',
    tags: ['marketing', 'creators', 'reels'],
    isActive: true,
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
  }
];

export const INITIAL_TASKS: Task[] = [
  // 1. Overdue / Missed Task (from yesterday) to demonstrate automatic missed task detection & recovery
  {
    id: 'task-missed-1',
    destinationId: 'fb-main-page',
    platformId: 'facebook',
    title: 'Product Feature Showcase: Hoorain 2.0 Launch',
    content: 'We are thrilled to unveil Hoorain 2.0 with instant multi-destination synchronization! Check out the interactive demo link.',
    scheduledAt: formatIso(yesterdayDate, 14, 0),
    status: 'missed',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['productlaunch', 'update', 'facebook'],
    notes: 'Automatically flagged as missed because scheduled time passed before completion.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 2. Today - Morning: Completed
  {
    id: 'task-today-1',
    destinationId: 'x-official-brand',
    platformId: 'x',
    title: 'Morning Thread: The 5 Pillars of Omnichannel Reach',
    content: '1/ How top creators manage 25+ distribution channels without going crazy. Thread 🧵👇',
    scheduledAt: formatIso(todayDate, 8, 30),
    status: 'completed',
    completedAt: formatIso(todayDate, 8, 35),
    postTarget: 2,
    postCompletedCount: 2,
    tags: ['thread', 'marketing', 'creators'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 3. Today - Morning / Midday: Scheduled
  {
    id: 'task-today-2',
    destinationId: 'wa-official-channel',
    platformId: 'whatsapp',
    title: 'Midday Community Alert: Live Q&A Room Opening',
    content: '🚨 Reminder: The live engineering Q&A session starts in 1 hour. Tap to prepare your questions!',
    scheduledAt: formatIso(todayDate, 11, 0),
    status: 'scheduled',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['whatsapp', 'live', 'community'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 4. Today - Afternoon: Scheduled
  {
    id: 'task-today-3',
    destinationId: 'li-founder-profile',
    platformId: 'linkedin',
    title: 'Founder Perspective: Why Offline-First Matters in 2026',
    content: 'Why should your tools stop functioning just because your internet connection drops? We built Hoorain with complete local persistence and automatic background reconciliation.',
    scheduledAt: formatIso(todayDate, 14, 0),
    status: 'scheduled',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['b2b', 'engineering', 'leadership'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 5. Today - Afternoon: Scheduled
  {
    id: 'task-today-4',
    destinationId: 'pin-infographics',
    platformId: 'pinterest',
    title: 'Infographic Pin: Weekly Content Repurposing Matrix',
    content: 'Pin of the day: Turn 1 core blog post into 12 micro-assets across Pinterest, X, and LinkedIn. Save this pin for your team.',
    scheduledAt: formatIso(todayDate, 16, 30),
    status: 'scheduled',
    postTarget: 2,
    postCompletedCount: 0,
    tags: ['infographic', 'pinterest', 'cheat_sheet'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 6. Today - Evening: Scheduled
  {
    id: 'task-today-5',
    destinationId: 'mbs-cross-feed',
    platformId: 'meta_business_suite',
    title: 'Evening Instagram & Facebook Reels Cross-Post',
    content: 'Behind the scenes: Behind the scenes of our workflow setup. Which platform drives your highest ROI?',
    scheduledAt: formatIso(todayDate, 19, 0),
    status: 'scheduled',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['reels', 'behindthescenes', 'meta'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 7. Tomorrow - Scheduled
  {
    id: 'task-tomorrow-1',
    destinationId: 'x-founder-voice',
    platformId: 'x',
    title: 'Vision Statement: Decentralized Content Orchestration',
    content: 'Simplicity is the ultimate sophistication. When creators own their schedule, output 10x with zero friction.',
    scheduledAt: formatIso(tomorrowDate, 9, 30),
    status: 'scheduled',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['vision', 'productivity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-tomorrow-2',
    destinationId: 'fb-community-group',
    platformId: 'facebook',
    title: 'Weekly Community Challenge Kickoff',
    content: 'Happy Wednesday! What is your single biggest social distribution goal for this week? Share in the comments below!',
    scheduledAt: formatIso(tomorrowDate, 13, 0),
    status: 'scheduled',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['community', 'discussion'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 8. Day after tomorrow
  {
    id: 'task-day3-1',
    destinationId: 'li-corporate-page',
    platformId: 'linkedin',
    title: 'Corporate Milestone Announcement',
    content: 'We are proud to celebrate 25,000 active schedules orchestrated through our platform this quarter.',
    scheduledAt: formatIso(dayAfterTomorrow, 10, 0),
    status: 'scheduled',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['milestone', 'growth', 'b2b'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-day4-1',
    destinationId: 'wa-vip-community',
    platformId: 'whatsapp',
    title: 'Weekend Early Access Code Drop',
    content: 'Exclusive VIP perk: use promo code VIP2026 for 40% off annual upgrades before Monday.',
    scheduledAt: formatIso(threeDaysLater, 15, 0),
    status: 'scheduled',
    postTarget: 1,
    postCompletedCount: 0,
    tags: ['vip', 'discount', 'whatsapp'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

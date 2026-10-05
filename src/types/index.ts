export type PlatformId = 
  | 'facebook' 
  | 'whatsapp' 
  | 'x' 
  | 'linkedin' 
  | 'pinterest' 
  | 'meta_business_suite';

export type TaskStatus = 'scheduled' | 'completed' | 'missed' | 'draft';

export type DestinationCategory = 
  | 'page' 
  | 'group' 
  | 'profile' 
  | 'channel' 
  | 'broadcast'
  | 'board' 
  | 'suite_planner';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  brandColor: string;
  accentBg: string;
  badgeColor: string;
  iconName: string;
  characterLimit?: number;
  description: string;
  composerUrl: string;
}

export interface Destination {
  id: string;
  platformId: PlatformId;
  name: string;
  category: DestinationCategory;
  targetUrl: string;
  handleOrGroup?: string;
  avatarUrl?: string;
  isActive: boolean;
  notes?: string;
  defaultPostCountTarget: number;
}

export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom_days';

export interface RecurringRule {
  id: string;
  title: string;
  destinationId: string;
  frequency: FrequencyType;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeSlots: string[]; // ["09:00", "14:00", "18:30"]
  postsPerSlot: number;
  contentTemplate?: string;
  tags?: string[];
  isActive: boolean;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
}

export interface Task {
  id: string;
  destinationId: string;
  platformId: PlatformId;
  title: string;
  content: string;
  mediaUrls?: string[];
  scheduledAt: string; // ISO 8601 string
  status: TaskStatus;
  completedAt?: string;
  recurringRuleId?: string;
  postTarget: number;
  postCompletedCount: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  scheduledTasks: number;
  missedTasks: number;
  completionRate: number;
  postsToday: number;
  postsCompletedToday: number;
  totalDestinations: number;
  activeDestinations: number;
  platformBreakdown: Record<PlatformId, { total: number; completed: number; missed: number; scheduled: number }>;
}

export interface ExportPayload {
  version: string;
  exportedAt: string;
  destinations: Destination[];
  tasks: Task[];
  recurringRules: RecurringRule[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

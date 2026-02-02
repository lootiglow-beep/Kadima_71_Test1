export type ResourceType = 'form' | 'sheet' | 'doc' | 'video' | 'native' | 'other';
export type UserRole = 'admin' | 'manager' | 'user'; // manager = מנהל עבודה

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  token?: string;
  expiryDate?: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: ResourceType;
  iconName?: string;
  createdAt: number;
}

// --- Dashboard Types ---
export interface DashboardShortcut {
  id: string;
  title: string;
  subtitle?: string;
  iconName: string; // Lucide icon name
  path: string;
  roles: UserRole[]; // Who can see this
  colorTheme: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
}

// --- Work Item Types ---

export type Priority = 'low' | 'normal' | 'high' | 'critical';
export type WorkItemStatus = 'pending' | 'in_progress' | 'done' | 'archived';
export type WorkItemType = 'message' | 'task' | 'update';

export interface LocationData {
  address: string;
  link?: string; // Waze/Maps link
}

export interface AutomationRule {
  id: string;
  triggerDate: string;
  actionType: 'setStatus' | 'setPriority' | 'archive';
  newValue: string;
}

export interface UserOverride {
  userId: string;
  priority?: Priority;
  dueDate?: string;
  customNote?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  content: string; // Markdown supported
  type: WorkItemType;
  backgroundColor?: string;
  status: WorkItemStatus;
  publishDate: number;
  expiryDate?: string;
  archiveDate?: string;
  priority: Priority;
  ownerId: string;
  executorIds: string[];
  viewPermission: 'all' | 'admin' | 'manager' | string[];
  editPermission: 'all' | 'admin' | 'manager' | string[];
  commentPermission: 'all' | 'admin' | 'manager' | string[];
  location?: LocationData;
  customNotes?: string;
  automationRules?: AutomationRule[];
  userOverrides?: UserOverride[];
  readBy: string[];
  completedBy: string[];
  createdBy: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  workItemId?: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  context?: string;
  type: 'text' | 'image' | 'audio';
}

// --- Chat System Types ---

export type ChatType = 'general' | 'coordinator' | 'private' | 'context';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio';
}

export interface ChatSession {
  id: string;
  type: ChatType;
  title?: string; // For groups or context
  participants: string[]; // User IDs
  messages: Message[];
  isFrozen: boolean; // Admin can freeze
  hiddenFor: string[]; // Users who hid this chat
  lastMessageAt: number;
  contextItemId?: string; // If linked to a WorkItem
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTrackUrl: string;
}

export interface Expense {
  id?: string;
  employeeName: string;
  supplierName: string;
  date: string;
  amount: string | number;
  category: string;
  description: string;
  paymentMethod: string;
}
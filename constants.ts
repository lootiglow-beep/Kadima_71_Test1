import { Resource, WorkItem, Message, User, Comment, DashboardShortcut, ChatSession } from './types';

// *** הנחיות לשימוש בשרת / GITHUB ***
// הקישור הזה אומר לאתר לחפש קובץ בשם welcome.mp3 שנמצא באותה תיקייה של האתר
export const DEFAULT_TRACK = "./welcome.mp3";

export const MOCK_USERS: User[] = [
    { id: '1', username: 'admin', name: 'מנהל מערכת', role: 'admin' },
    { id: '2', username: 'manager1', name: 'מנהל עבודה', role: 'manager' },
    { id: '3', username: 'user1', name: 'ישראל ישראלי', role: 'user' },
    { id: '4', username: 'user2', name: 'שרה כהן', role: 'user' },
];

export const DEFAULT_SHORTCUTS: DashboardShortcut[] = [
  {
    id: 'repair',
    title: 'דיווח תיקונים',
    subtitle: 'פתיחת קריאת שירות',
    iconName: 'Wrench',
    path: '/resource/repair-form', // Mock path
    roles: ['admin', 'manager', 'user'],
    colorTheme: 'red'
  },
  {
    id: 'shortage',
    title: 'דיווח חסרים',
    subtitle: 'הזמנת ציוד ומלאי',
    iconName: 'ShoppingCart',
    path: '/resource/shortage-form',
    roles: ['admin', 'manager'],
    colorTheme: 'orange'
  },
  {
    id: 'various',
    title: 'דיווחים שונים',
    subtitle: 'טפסים כלליים',
    iconName: 'FileText',
    path: '/resource/general-form',
    roles: ['admin', 'manager', 'user'],
    colorTheme: 'blue'
  },
  {
    id: 'expenses',
    title: 'דיווח הוצאות',
    subtitle: 'החזרים וקופה קטנה',
    iconName: 'CreditCard',
    path: '/resource/expense-report',
    roles: ['admin', 'manager', 'user'],
    colorTheme: 'green'
  },
  {
    id: 'general',
    title: 'כללי',
    subtitle: 'כל דיווח',
    iconName: 'Info',
    path: '/wiki',
    roles: ['admin', 'manager', 'user'],
    colorTheme: 'gray'
  }
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'expense-report',
    title: 'דיווח הוצאות',
    description: 'טופס דיווח הוצאות חודשי (פנימי)',
    url: '', 
    type: 'native',
    iconName: 'CreditCard',
    createdAt: Date.now()
  },
  {
    id: '1',
    title: 'טופס רישום (דוגמה)',
    description: 'טופס Google Form להרשמה לאירועים',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfv7y1a-7K2y4K1y_4y7y1a-7K2y4K1y/viewform?embedded=true', 
    type: 'form',
    iconName: 'FileText',
    createdAt: Date.now()
  },
];

export const MOCK_WORK_ITEMS: WorkItem[] = [
  { 
    id: '101', 
    title: 'הכנת חדר ישיבות', 
    content: 'יש לדאוג לניקיון, שתייה קרה וכיבוד קל לקראת ישיבת הדירקטוריון.', 
    type: 'task',
    status: 'pending',
    priority: 'high',
    publishDate: Date.now(),
    ownerId: '2', // Manager
    executorIds: ['3', '4'],
    viewPermission: 'all',
    editPermission: 'manager',
    commentPermission: 'all',
    location: { address: 'חדר ישיבות ראשי, קומה 2' },
    customNotes: 'נא לא לשכוח מקרן פועל',
    readBy: ['2'],
    completedBy: [],
    createdBy: '1',
    createdAt: Date.now()
  }
];

export const MOCK_COMMENTS: Comment[] = [];

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'general_chat',
    type: 'general',
    title: 'צ\'אט כללי',
    participants: ['1', '2', '3', '4'],
    messages: [
      { id: 'm1', senderId: '1', senderName: 'מנהל מערכת', content: 'ברוכים הבאים למערכת החדשה!', timestamp: Date.now() - 1000000, type: 'text' }
    ],
    isFrozen: false,
    hiddenFor: [],
    lastMessageAt: Date.now()
  },
  {
    id: 'coord_chat',
    type: 'coordinator',
    title: 'רכזים ומנהלים',
    participants: ['1', '2'],
    messages: [
      { id: 'm2', senderId: '2', senderName: 'מנהל עבודה', content: 'עדכון לגבי המשמרות', timestamp: Date.now() - 500000, type: 'text' }
    ],
    isFrozen: false,
    hiddenFor: [],
    lastMessageAt: Date.now()
  }
];

export const RESOURCE_TYPES_LABELS: Record<string, string> = {
  form: 'טופס (Google)',
  sheet: 'גיליון',
  doc: 'מסמך',
  video: 'וידאו',
  native: 'טופס מובנה',
  other: 'אחר'
};

export const PRIORITY_LABELS: Record<string, string> = {
    low: 'נמוכה',
    normal: 'רגילה',
    high: 'גבוהה',
    critical: 'קריטית'
};

export const STATUS_LABELS: Record<string, string> = {
    pending: 'ממתין',
    in_progress: 'בתהליך',
    done: 'בוצע',
    archived: 'ארכיון'
};
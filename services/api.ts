import { Expense, WorkItem, User, UserRole } from '../types';

// הכתובת שסיפקת
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkdShoSTorf_j8xde2wrrRrB4SXGpGYwzKeQITECm1fOucSbt-nUJOYcu7gSg3q7Nn/exec";

interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  user?: User; // For login response
  id?: string; // For create response
}

export const api = {
  /**
   * התחברות למערכת
   */
  login: async (username: string, password: string): Promise<{ user: User } | { error: string }> => {
    try {
      // אנחנו משתמשים ב-POST כדי לא לחשוף סיסמאות ב-URL, אבל בגלל CORS ו-Apps Script
      // לעיתים קרובות משתמשים בטכניקת שליחה ללא קריאת תשובה ישירה בדפדפן, 
      // אך כאן אנחנו צריכים תשובה. Apps Script תומך ב-CORS עם redirect.
      // הפתרון הכי יציב ב-React מול Apps Script הוא לשלוח כ-POST form data.
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', username, password })
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (result.status === 'success' && result.user) {
        return { user: result.user };
      } else {
        return { error: result.message || 'שגיאת התחברות' };
      }
    } catch (e) {
      console.error("Login Error:", e);
      return { error: 'שגיאת תקשורת עם השרת' };
    }
  },

  /**
   * שליפת נתונים (משימות והוצאות) לפי הרשאת משתמש
   */
  getData: async (user: User): Promise<{ tasks: WorkItem[], expenses: Expense[] } | null> => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getData&userId=${user.id}&role=${user.role}`);
      const result: ApiResponse<{ tasks: WorkItem[], expenses: Expense[] }> = await response.json();
      
      if (result.status === 'success' && result.data) {
        return result.data;
      }
      return null;
    } catch (e) {
      console.error("Fetch Data Error:", e);
      return null;
    }
  },

  /**
   * הוספת משימה חדשה
   */
  addTask: async (task: Partial<WorkItem>): Promise<boolean> => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // שיטת "שגר ושכח" לביצועים מהירים יותר
        body: JSON.stringify({ action: 'addTask', ...task })
      });
      return true;
    } catch (e) {
      return false;
    }
  }
};
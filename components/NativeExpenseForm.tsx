import React, { useState } from 'react';
import { Send, CheckCircle, Calendar, DollarSign, Tag, FileText, User, Store, AlertTriangle } from 'lucide-react';

// *** חשוב: החלף את הכתובת הזו בכתובת ה-Web App URL שקיבלת מ-Google Apps Script ***
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkdShoSTorf_j8xde2wrrRrB4SXGpGYwzKeQITECm1fOucSbt-nUJOYcu7gSg3q7Nn/exec"; 

export const NativeExpenseForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    employeeName: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'food',
    description: '',
    paymentMethod: 'credit'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation to check if user updated the URL
    if (GOOGLE_SCRIPT_URL.includes("YOUR_SCRIPT_ID_HERE")) {
      setError("נא להגדיר את כתובת הסקריפט (GOOGLE_SCRIPT_URL) בקוד המקור.");
      setIsSubmitting(false);
      return;
    }

    try {
      // We use mode: 'no-cors' because Google Scripts doesn't support CORS headers fully for simple POSTs.
      // This means we won't get a readable JSON response, but the data WILL arrive if the URL is correct.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      // Since we use no-cors, we assume success if no network error occurred.
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form logic
      setTimeout(() => {
        setIsSuccess(false);
        setFormData(prev => ({
          ...prev,
          supplierName: '',
          amount: '',
          description: ''
        }));
      }, 3000);

    } catch (err) {
      console.error("Submission error:", err);
      setError("אירעה שגיאה בשליחת הנתונים. אנא בדוק את החיבור לאינטרנט.");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-xl shadow-sm border border-green-100 p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">הדיווח נקלט בהצלחה!</h3>
        <p className="text-gray-500">הנתונים נשמרו ב-Google Sheets.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-blue-600 hover:text-blue-800 font-medium"
        >
          שלח דיווח נוסף
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto animate-fade-in">
      <div className="bg-blue-600 px-6 py-4 text-white">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileText size={20} />
          דיווח הוצאות
        </h3>
        <p className="text-blue-100 text-sm mt-1">מלא את הפרטים ונשמור אותם ב-Google Sheets</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Employee & Supplier Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <User size={16} /> שם המגיש
            </label>
            <input
              type="text"
              required
              placeholder="ישראל ישראלי"
              value={formData.employeeName}
              onChange={e => setFormData({...formData, employeeName: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Store size={16} /> שם בית העסק / ספק
            </label>
            <input
              type="text"
              required
              placeholder="למשל: ארומה, דלק פז..."
              value={formData.supplierName}
              onChange={e => setFormData({...formData, supplierName: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Date & Amount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Calendar size={16} /> תאריך ההוצאה
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <DollarSign size={16} /> סכום (בש"ח)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Category & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Tag size={16} /> קטגוריה
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
              >
                <option value="food">אוכל ומסעדות</option>
                <option value="travel">נסיעות ודלק</option>
                <option value="office">ציוד משרדי</option>
                <option value="equipment">רכש ציוד</option>
                <option value="marketing">שיווק ופרסום</option>
                <option value="other">אחר</option>
              </select>
              <div className="absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">אמצעי תשלום</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input 
                  type="radio" 
                  name="payment" 
                  value="credit"
                  checked={formData.paymentMethod === 'credit'}
                  onChange={() => setFormData({...formData, paymentMethod: 'credit'})}
                  className="accent-blue-600"
                />
                <span>אשראי</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={() => setFormData({...formData, paymentMethod: 'cash'})}
                  className="accent-blue-600"
                />
                <span>מזומן</span>
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">תיאור / הערות</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
            placeholder="פרט על ההוצאה..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              שולח נתונים...
            </>
          ) : (
            <>
              <Send size={20} />
              שמור הוצאה
            </>
          )}
        </button>

      </form>
    </div>
  );
};
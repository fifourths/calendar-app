import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Grid, LayoutGrid, BarChart2, 
  Plus, Trash2, Settings, Download, Upload, RotateCcw, 
  AlertCircle, ArrowRightLeft, Calendar as CalendarIcon, Moon, Sun, 
  Globe, AlertTriangle, X, Eraser, Info, HelpCircle
} from 'lucide-react';

// --- 1. Constants & Helper Functions ---

const COLOR_DEFINITIONS = {
  red:    { id: 'red',    light: 'bg-red-300',    dark: 'bg-red-400/80', pastel: 'bg-red-100',    pastelDark: 'bg-red-900/30' },
  orange: { id: 'orange', light: 'bg-orange-300', dark: 'bg-orange-400/80', pastel: 'bg-orange-100', pastelDark: 'bg-orange-900/30' },
  yellow: { id: 'yellow', light: 'bg-yellow-300', dark: 'bg-yellow-400/80', pastel: 'bg-yellow-100', pastelDark: 'bg-yellow-900/30' },
  green:  { id: 'green',  light: 'bg-emerald-300', dark: 'bg-emerald-400/80', pastel: 'bg-emerald-100', pastelDark: 'bg-emerald-900/30' },
  blue:   { id: 'blue',   light: 'bg-blue-300',   dark: 'bg-blue-400/80',   pastel: 'bg-blue-100',   pastelDark: 'bg-blue-900/30' },
  purple: { id: 'purple', light: 'bg-purple-300', dark: 'bg-purple-400/80', pastel: 'bg-purple-100', pastelDark: 'bg-purple-900/30' },
};

const FALLBACK_COLOR = { 
  id: 'gray', light: 'bg-slate-300', dark: 'bg-slate-600', pastel: 'bg-slate-100', pastelDark: 'bg-slate-800' 
};

const getColorDef = (id) => {
  return (id && COLOR_DEFINITIONS[id]) ? COLOR_DEFINITIONS[id] : FALLBACK_COLOR;
};

const INITIAL_CATEGORIES = [
  { id: 'red', defaultLabel: '重要' },
  { id: 'orange', defaultLabel: '運動' },
  { id: 'yellow', defaultLabel: '閱讀' },
  { id: 'green', defaultLabel: '健康' },
  { id: 'blue', defaultLabel: '工作' },
  { id: 'purple', defaultLabel: '休閒' },
];

const TRANSLATIONS = {
  zh: {
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    langName: '繁體中文',
    titlePlaceholder: '自定義標題',
    today: 'Today',
    settingsTitle: '設定與資料',
    lastBackup: '上次: ',
    neverBackedUp: '尚未備份',
    backupOverdue: '建議立即匯出備份',
    switchLang: '切換語言',
    export: '匯出資料備份',
    import: '匯入資料',
    resetMonth: '重置本月紀錄',
    confirmResetTitle: '確定重置？',
    confirmResetMsg: '將清除本月所有打卡紀錄，此動作無法復原。',
    resetKeepNotesHint: '僅重置當月曆打卡記錄，當月筆記不會重置',
    cancel: '取消',
    confirm: '確認重置',
    placeholderNote: '寫點什麼...',
    swapHint: '點擊以交換順序',
    categoryHeader: 'Categories',
    memoHeader: 'Memo',
    editHint: '(雙擊文字編輯)',
    statsFreq: '頻率',
    statsTotal: '總計',
    statsMonthCount: '本月次數',
    statsVsLast: 'vs 上月',
    perMonth: '/ 月',
    monthSuffix: '月',
    dayCardTitle: '詳細記錄',
    helpTitle: '操作說明',
    helpContent: '• 長按日期：編輯詳細紀錄\n• 點選顏色：再點日期進行標記\n• 雙擊文字：編輯分類或標題\n• 左右滑動：切換月份\n• 備份資料：建議每週匯出一次',
    btnYes: '是的，刪除',
    btnNo: '取消'
  },
  jp: {
    weekDays: ['月', '火', '水', '木', '金', '土', '日'],
    langName: '日本語',
    titlePlaceholder: 'タイトルを入力',
    today: '今日',
    settingsTitle: '設定とデータ',
    lastBackup: '前回: ',
    neverBackedUp: '未バックアップ',
    backupOverdue: 'バックアップ推奨',
    switchLang: '言語切り替え',
    export: 'バックアップ保存',
    import: 'データを復元',
    resetMonth: '今月の記録をリセット',
    confirmResetTitle: 'リセットしますか？',
    confirmResetMsg: '今月の全ての記録が消去されます。この操作は取り消せません。',
    resetKeepNotesHint: 'カレンダーの記録のみリセットされます。メモは保持されます。',
    cancel: 'キャンセル',
    confirm: 'リセット',
    placeholderNote: 'メモを入力...',
    swapHint: 'タップして順序を入れ替え',
    categoryHeader: 'カテゴリー',
    memoHeader: 'メモ',
    editHint: '(ダブルクリックで編集)',
    statsFreq: '頻度',
    statsTotal: '累計',
    statsMonthCount: '今月の回数',
    statsVsLast: '先月比',
    perMonth: '/ 月',
    monthSuffix: '月',
    dayCardTitle: '詳細記録',
    helpTitle: '操作説明',
    helpContent: '• 日付長押し：詳細を編集\n• 色を選択：日付をタップしてマーク\n• ダブルクリック：テキスト編集\n• 左右スワイプ：月を切り替え\n• バックアップ：週1回推奨',
    btnYes: 'はい、削除します',
    btnNo: 'キャンセル'
  },
  en: {
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    langName: 'English',
    titlePlaceholder: 'Custom Title',
    today: 'Today',
    settingsTitle: 'Settings & Data',
    lastBackup: 'Last: ',
    neverBackedUp: 'Never',
    backupOverdue: 'Backup Recommended',
    switchLang: 'Language',
    export: 'Export Backup',
    import: 'Import Data',
    resetMonth: 'Reset Month',
    confirmResetTitle: 'Reset Month?',
    confirmResetMsg: 'This will clear all records for this month. Cannot be undone.',
    resetKeepNotesHint: 'Only calendar records are reset. Notes remain.',
    cancel: 'Cancel',
    confirm: 'Reset',
    placeholderNote: 'Write something...',
    swapHint: 'Click to swap',
    categoryHeader: 'Categories',
    memoHeader: 'Memo',
    editHint: '(Double click to edit)',
    statsFreq: 'Freq',
    statsTotal: 'Total',
    statsMonthCount: 'Month Count',
    statsVsLast: 'vs Last',
    perMonth: '/ mo',
    monthSuffix: '',
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayCardTitle: 'Details',
    helpTitle: 'Instructions',
    helpContent: '• Long Press Date: Edit details\n• Pick Color: Tap date to mark\n• Double Click: Edit text\n• Swipe: Switch months\n• Backup: Recommended weekly',
    btnYes: 'Yes, Reset',
    btnNo: 'Cancel'
  }
};

const DEFAULT_NOTES = [
  { id: 'def-0', text: '' },
  { id: 'def-1', text: '' },
  { id: 'def-2', text: '' },
];

const BACKUP_REMINDER_DAYS = 7;

function useStickyState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null && item !== 'undefined' && item !== "undefined") {
        const parsed = JSON.parse(item);
        if (Array.isArray(defaultValue)) {
            return Array.isArray(parsed) ? parsed : defaultValue;
        }
        if (typeof defaultValue === 'object' && defaultValue !== null) {
            return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : defaultValue;
        }
        return parsed;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { console.warn('LocalStorage Write Error'); }
    }
  }, [key, value]);

  return [value, setValue];
}

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; 
};
const formatDateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const getMonthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;

const getNextDayKey = (dateKey) => {
    try {
        const [y, m, d] = dateKey.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        date.setDate(date.getDate() + 1);
        return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    } catch(e) { return dateKey; }
};

const getPrevDayKey = (dateKey) => {
    try {
        const [y, m, d] = dateKey.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        date.setDate(date.getDate() - 1);
        return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    } catch(e) { return dateKey; }
};

// --- Sub-Components ---

const DayCardModal = ({ dateKey, gridMode, records, categories, dayNotes, onClose, onSaveNote, onNext, onPrev, isDark, t }) => {
  const cellRecord = (records && records[dateKey]) ? records[dateKey] : {};
  const currentNotes = (dayNotes && dayNotes[dateKey]) ? dayNotes[dateKey] : {};

  // Swipe logic (Next/Prev only, NO Delete)
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) { 
        if (diff > 0) onNext();
        else onPrev(); 
    }
    touchStartX.current = null;
  };

  let title = dateKey;
  try {
      const [y, m, d] = dateKey.split('-');
      title = `${y}/${parseInt(m)}/${parseInt(d)}`;
  } catch(e) {}

  const cells = [];
  for (let i = 0; i < gridMode; i++) {
    const colorId = cellRecord[i];
    const cat = Array.isArray(categories) ? categories.find(c => c.id === colorId) : null;
    const style = getColorDef(cat?.id);
    const bgClass = cat ? (isDark ? style.pastelDark : style.pastel) : (isDark ? 'bg-slate-800' : 'bg-slate-50');
    
    cells.push(
      <div key={i} className={`relative p-2 pt-6 rounded-xl border transition-colors flex flex-col ${bgClass} ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        {cat && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
             <div className={`w-2 h-2 rounded-full ${isDark ? style.dark : style.light}`}></div>
             <span className={`text-[9px] font-bold opacity-80 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{cat.defaultLabel}</span>
          </div>
        )}
        <textarea 
          className={`flex-1 w-full bg-transparent resize-none outline-none text-xs leading-relaxed ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}
          placeholder="..."
          value={currentNotes[i] || ''}
          onChange={(e) => onSaveNote(dateKey, i, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
       <div 
         className={`w-full max-w-xs p-5 rounded-[32px] shadow-2xl transform transition-all scale-100 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-white/60'}`} 
         onClick={(e) => e.stopPropagation()}
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
       >
          <div className="flex justify-between items-center mb-4 px-1">
             <div className="flex items-center gap-2">
                 <button onClick={onPrev} className={`p-1 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><ChevronLeft size={18} /></button>
                 <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
                 <button onClick={onNext} className={`p-1 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><ChevronRight size={18} /></button>
             </div>
             <button onClick={onClose} className={`p-1.5 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20} /></button>
          </div>
          <div className={`grid gap-2 h-64 ${gridMode === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'}`}>{cells}</div>
       </div>
    </div>
  );
};

const GridOverlay = ({ gridMode, isDark }) => {
  const lineColor = isDark ? 'bg-slate-700' : 'bg-slate-200';
  const borderColor = isDark ? 'border-slate-500' : 'border-slate-400';
  return (
    <div className={`absolute inset-0 pointer-events-none z-10 rounded-lg border ${borderColor}`}>
       <div className={`absolute top-1/2 left-0 right-0 h-[1px] ${lineColor}`}></div>
       {gridMode === 4 ? (
          <div className={`absolute left-1/2 top-0 bottom-0 w-[1px] ${lineColor}`}></div>
       ) : (
          <>
            <div className={`absolute left-1/3 top-0 bottom-0 w-[1px] ${lineColor}`}></div>
            <div className={`absolute left-2/3 top-0 bottom-0 w-[1px] ${lineColor}`}></div>
          </>
       )}
    </div>
  );
};

const AutoResizingTextarea = ({ value, onChange, placeholder, isDark }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 76)}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full text-center text-[10px] bg-transparent border-none focus:ring-0 p-0 transition-colors outline-none font-bold resize-none leading-tight overflow-hidden whitespace-pre-wrap break-all ${isDark ? 'text-slate-400 placeholder-slate-700' : 'text-slate-600 placeholder-slate-200'}`}
      style={{ height: 'auto', touchAction: 'manipulation' }}
    />
  );
};

const CustomDatePicker = ({ currentYear, currentMonth, onClose, onSelect, isDark, t }) => {
  const [viewYear, setViewYear] = useState(currentYear);
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ${isDark ? 'bg-slate-900/60' : 'bg-slate-900/20'}`} onClick={onClose}>
      <div className={`rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/50'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 px-2">
          <button onClick={() => setViewYear(viewYear - 1)} className={`p-2 rounded-full outline-none ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}><ChevronLeft size={20} /></button>
          <span className={`text-xl font-bold font-sans ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{viewYear}</span>
          <button onClick={() => setViewYear(viewYear + 1)} className={`p-2 rounded-full outline-none ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <button key={i} onClick={() => { onSelect(viewYear, i); onClose(); }} className={`py-3 rounded-2xl text-sm font-bold transition-all duration-200 outline-none font-sans ${viewYear === currentYear && i === currentMonth ? (isDark ? 'bg-slate-100 text-slate-900 shadow-lg scale-105' : 'bg-slate-800 text-white shadow-lg scale-105') : (isDark ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:scale-105')}`}>{i + 1}{t.monthSuffix}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

const NoteRow = ({ note, onChange, onDelete, isReordering, isSelected, onReorderSelect, isDark, t }) => {
  const inputRef = useRef(null);
  return (
    <div 
      className={`group flex items-end gap-2 relative transition-all duration-200 ${isReordering ? 'p-2 -mx-2 rounded-lg border border-transparent' : ''} ${isReordering && !isSelected ? (isDark ? 'hover:bg-slate-800 border-slate-700' : 'hover:bg-slate-50 border-slate-100') : ''} ${isSelected ? (isDark ? 'bg-blue-900/30 border-blue-800 ring-1 ring-blue-700' : 'bg-blue-50 border-blue-200 ring-1 ring-blue-300') + ' z-10' : ''}`}
      onClick={(e) => { if (isReordering) { e.stopPropagation(); onReorderSelect(note.id); } else { inputRef.current && inputRef.current.focus(); } }}
    >
       <div className={`h-full w-0.5 absolute left-0 top-1 bottom-1 rounded-full transition-colors ${isDark ? 'bg-slate-600 group-focus-within:bg-slate-400' : 'bg-slate-300 group-focus-within:bg-slate-500'}`}></div>
       <input ref={inputRef} value={note.text} onChange={onChange} onTouchStart={(e) => !isReordering && e.stopPropagation()} className={`flex-1 text-sm bg-transparent border-b focus:ring-0 px-3 pb-2 transition-all outline-none ${isDark ? 'text-slate-100 border-slate-700 focus:border-slate-500 placeholder:text-slate-600' : 'text-slate-900 border-slate-200 focus:border-slate-400 placeholder:text-slate-400'} ${isReordering ? 'pointer-events-none' : ''}`} placeholder={isReordering ? t.swapHint : t.placeholderNote} readOnly={isReordering} />
       {!isReordering && (
         <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className={`opacity-0 group-hover:opacity-100 transition-all p-1 outline-none ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-400'}`}><Trash2 size={14} /></button>
       )}
    </div>
  );
};

const SettingsModal = ({ onClose, onReset, onExport, onImport, toggleLanguage, t, isDark, lastBackupDate, isBackupOverdue }) => {
   const [showConfirmReset, setShowConfirmReset] = useState(false);

   if (showConfirmReset) {
       // Custom Confirm UI matching the App style
       return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ${isDark ? 'bg-slate-900/60' : 'bg-slate-900/20'}`} onClick={() => setShowConfirmReset(false)}>
            <div className={`rounded-[32px] p-6 shadow-2xl w-80 transform transition-all scale-100 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/50'}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-1">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t.confirmResetTitle}</h3>
                    <p className={`text-sm opacity-80 mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} dangerouslySetInnerHTML={{__html: t.confirmResetMsg}}></p>
                    
                    <button onClick={onReset} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
                        {t.btnYes}
                    </button>
                    <button onClick={() => setShowConfirmReset(false)} className={`w-full py-3 font-bold rounded-xl transition-colors ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {t.btnNo}
                    </button>
                </div>
            </div>
        </div>
       );
   }

   return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ${isDark ? 'bg-slate-900/60' : 'bg-slate-900/20'}`} onClick={onClose}>
      <div className={`rounded-[32px] p-6 shadow-2xl w-80 transform transition-all scale-100 border relative overflow-hidden flex flex-col max-h-[85vh] ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/50'}`} onClick={(e) => e.stopPropagation()}>
         <div className="flex items-center gap-2 mb-6 flex-shrink-0">
            <Settings className={isDark ? "text-slate-400" : "text-slate-500"} size={20} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t.settingsTitle}</h2>
         </div>
         
         <div className="space-y-3 overflow-y-auto no-scrollbar pb-2">
             {/* Backup Section */}
             <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex justify-between items-center mb-2">
                   <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Backup</span>
                   {isBackupOverdue && <div className="flex items-center gap-1 text-orange-500"><AlertTriangle size={12} /><span className="text-[10px] font-bold">{t.backupOverdue}</span></div>}
                </div>
                <div className="mb-3">
                   <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t.lastBackup} {lastBackupDate ? new Date(lastBackupDate).toLocaleDateString() : t.neverBackedUp}
                   </p>
                </div>
                <div className="flex gap-2">
                   {/* FIXED: Added whitespace-nowrap and smaller font for JP button fix */}
                   <button onClick={onExport} className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold whitespace-nowrap transition-colors ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}><Download size={14} />{t.export}</button>
                   <label className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                      <Upload size={14} />{t.import}
                      <input type="file" accept=".json" onChange={(e) => { if(e.target.files?.[0]) onImport(e.target.files[0]); }} className="hidden" />
                   </label>
                </div>
             </div>

             {/* Language */}
             <button onClick={toggleLanguage} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${isDark ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                 <div className="flex items-center gap-3">
                    <Globe size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{t.switchLang}</span>
                 </div>
                 <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>{t.langName}</span>
             </button>

             {/* Help Section (Added in V82) */}
             <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <HelpCircle size={14} className={isDark ? "text-slate-400" : "text-slate-500"} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.helpTitle}</span>
                </div>
                <p className={`text-[10px] whitespace-pre-line leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.helpContent}
                </p>
             </div>

             {/* Reset */}
             <div className={`p-4 rounded-2xl border ${isDark ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                <h3 className={`text-xs font-bold mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{t.resetMonth}</h3>
                <p className={`text-[10px] mb-3 opacity-70 ${isDark ? 'text-red-300' : 'text-red-500'}`}>{t.resetKeepNotesHint}</p>
                {/* Changed to trigger custom confirmation */}
                <button onClick={() => setShowConfirmReset(true)} className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-white text-red-500 border border-red-200 hover:bg-red-50'}`}><RotateCcw size={14} />{t.confirm}</button>
             </div>
         </div>
      </div>
    </div>
   );
};

// --- 4. Main Application ---

export default function NewCalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Using 'v80' keys as requested for data persistence
  const [appTitle, setAppTitle] = useStickyState('v80_title', 'My Life Log');
  const [gridMode, setGridMode] = useStickyState('v80_gridMode', 4);
  const [categories, setCategories] = useStickyState('v80_categories', INITIAL_CATEGORIES);
  const [records, setRecords] = useStickyState('v80_records', {});
  const [weekNotes, setWeekNotes] = useStickyState('v80_weekNotes', {});
  const [dayNotes, setDayNotes] = useStickyState('v80_dayNotes', {});
  const [allFooterNotes, setAllFooterNotes] = useStickyState('v80_allFooterNotes', {});
  const [langIndex, setLangIndex] = useStickyState('v80_langIndex', 0);
  const [darkMode, setDarkMode] = useStickyState('v80_darkMode', false);
  const [lastBackupDate, setLastBackupDate] = useStickyState('v80_lastBackupDate', null);
  
  const [view, setView] = useState('calendar'); 
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoomedDateKey, setZoomedDateKey] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [tempLabel, setTempLabel] = useState('');
  
  const [reorderMode, setReorderMode] = useState(null);
  const [swapSourceId, setSwapSourceId] = useState(null);

  // --- SWIPE LOGIC (Main Calendar) ---
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const onTouchStartSwipe = (e) => { touchStartX.current = e.targetTouches[0].clientX; touchEndX.current = null; };
  const onTouchMoveSwipe = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchEndSwipe = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    touchStartX.current = null; touchEndX.current = null;
    if (distance > 100) handleNextMonth();
    if (distance < -100) handlePrevMonth();
  };

  // --- LONG PRESS LOGIC ---
  const longPressTimer = useRef(null);
  const startLongPress = (dateKey) => {
    longPressTimer.current = setTimeout(() => {
        setZoomedDateKey(dateKey);
    }, 500);
  };
  const cancelLongPress = () => {
     if (longPressTimer.current) {
         clearTimeout(longPressTimer.current);
         longPressTimer.current = null;
     }
  };

  // Auto-Inject Icon
  useEffect(() => {
    const injectIcon = () => {
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        existingIcons.forEach(el => el.remove());
        const canvas = document.createElement('canvas'); canvas.width = 180; canvas.height = 180; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 180, 180);
        const dotColors = ['#fca5a5', '#fdba74', '#fde047', '#6ee7b7', '#93c5fd', '#d8b4fe', '#f1f5f9', '#f1f5f9', '#f1f5f9'];
        const radius = 20; const gap = 45; const startX = 45; const startY = 45;
        dotColors.forEach((color, i) => { const row = Math.floor(i / 3); const col = i % 3; const x = startX + col * gap; const y = startY + row * gap; ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI, false); ctx.fillStyle = color; ctx.fill(); });
        const iconUrl = canvas.toDataURL('image/png');
        const link = document.createElement('link'); link.type = 'image/png'; link.rel = 'icon';
        link.href = iconUrl; document.head.appendChild(link);
        const appleLink = document.createElement('link'); appleLink.rel = 'apple-touch-icon'; appleLink.href = iconUrl; document.head.appendChild(appleLink);
    };
    const timer = setTimeout(injectIcon, 1000);
    return () => clearTimeout(timer);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = getMonthKey(year, month);
  const today = new Date();
  const isToday = (d, m, y) => d === today.getDate() && m === today.getMonth() && y === today.getFullYear();

  const footerNotes = allFooterNotes[monthKey] || DEFAULT_NOTES;
  
  const isBackupOverdue = useMemo(() => {
      if (!lastBackupDate) return false; 
      const diffTime = Math.abs(new Date() - new Date(lastBackupDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > BACKUP_REMINDER_DAYS;
  }, [lastBackupDate]);

  const langKey = Object.keys(TRANSLATIONS)[langIndex]; 
  const t = TRANSLATIONS[langKey];
  const currentWeekLabels = t.weekDays;

  // Handlers
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleJumpToToday = (e) => { e.stopPropagation(); setCurrentDate(new Date()); };
  const handleBackgroundClick = () => setSelectedColor(null);
  const toggleLanguage = () => setLangIndex((prev) => (prev + 1) % 3);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleCellClick = (dateKey, subIndex) => {
    if (selectedColor === null) return;
    const currentRecs = records || {};
    const currentRecord = currentRecs[dateKey] || {};
    const currentColor = currentRecord[subIndex];
    const newRecord = { ...currentRecord };
    
    if (selectedColor === 'ERASER') {
        if (currentColor) delete newRecord[subIndex];
    } else {
        if (currentColor === selectedColor) delete newRecord[subIndex]; 
        else newRecord[subIndex] = selectedColor;
    }
    
    setRecords(prev => ({ ...prev, [dateKey]: newRecord }));
  };

  const updateCategoryLabel = (id, newLabel) => { setCategories(prev => prev.map(c => c.id === id ? { ...c, defaultLabel: newLabel } : c)); };
  const saveCategoryLabel = (id) => { updateCategoryLabel(id, tempLabel); setEditingCategoryId(null); };

  const handleUpdateNote = (idx, text) => { const newNotes = [...footerNotes]; newNotes[idx] = { ...newNotes[idx], text }; setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes })); };
  const handleAddNote = () => { const newNotes = [...footerNotes, { id: Date.now().toString(), text: '' }]; setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes })); };
  const handleDeleteNote = (id) => { const newNotes = footerNotes.filter(n => n.id !== id); setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes })); };

  const handleSaveDayNote = (dateKey, idx, text) => {
      setDayNotes(prev => ({ ...prev, [dateKey]: { ...(prev[dateKey] || {}), [idx]: text } }));
  };

  const handleResetCurrentMonth = () => {
     const newRecords = { ...records };
     const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
     Object.keys(newRecords).forEach(key => { if (key.startsWith(currentMonthPrefix)) delete newRecords[key]; });
     setRecords(newRecords); setShowSettings(false); setView('calendar');
  };

  const handleExportData = () => {
    const now = new Date().toISOString();
    setLastBackupDate(now);
    const data = { appTitle, gridMode, categories, records, weekNotes, dayNotes, allFooterNotes, langIndex, exportedAt: now };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `calendar_backup_${now.slice(0, 10)}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setShowSettings(false);
  };

  const handleImportData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (typeof data !== 'object') throw new Error('Invalid format');
        if (data.appTitle) setAppTitle(data.appTitle);
        if (data.gridMode) setGridMode(data.gridMode);
        if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
        if (data.records) setRecords(data.records);
        if (data.weekNotes) setWeekNotes(data.weekNotes);
        if (data.dayNotes) setDayNotes(data.dayNotes);
        if (data.allFooterNotes) setAllFooterNotes(data.allFooterNotes);
        if (data.langIndex !== undefined) setLangIndex(data.langIndex);
        setLastBackupDate(new Date().toISOString());
        setShowSettings(false);
      } catch (error) { alert('匯入失敗：檔案格式錯誤'); setShowSettings(false); }
    };
    reader.readAsText(file);
  };

  const toggleReorderMode = (mode) => { if (reorderMode === mode) { setReorderMode(null); setSwapSourceId(null); } else { setReorderMode(mode); setSwapSourceId(null); } };
  const handleItemSwap = (targetId, listType) => {
    if (!reorderMode || reorderMode !== listType) return;
    if (swapSourceId === null) { setSwapSourceId(targetId); } 
    else if (swapSourceId === targetId) { setSwapSourceId(null); } 
    else {
      if (listType === 'color') {
         const newCats = [...categories];
         const srcIdx = newCats.findIndex(c => c.id === swapSourceId);
         const tgtIdx = newCats.findIndex(c => c.id === targetId);
         if (srcIdx !== -1 && tgtIdx !== -1) { [newCats[srcIdx], newCats[tgtIdx]] = [newCats[tgtIdx], newCats[srcIdx]]; setCategories(newCats); }
      } else {
         const newNotes = [...footerNotes];
         const srcIdx = newNotes.findIndex(n => n.id === swapSourceId);
         const tgtIdx = newNotes.findIndex(n => n.id === targetId);
         if (srcIdx !== -1 && tgtIdx !== -1) { [newNotes[srcIdx], newNotes[tgtIdx]] = [newNotes[tgtIdx], newNotes[srcIdx]]; setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes })); }
      }
      setSwapSourceId(null);
    }
  };

  const calendarDays = useMemo(() => {
    try {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month); 
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push({ type: 'empty' });
        for (let i = 1; i <= daysInMonth; i++) { days.push({ type: 'current', day: i, dateKey: formatDateKey(year, month, i) }); }
        const totalCells = days.length;
        const nextMonthNeeded = (Math.ceil(totalCells / 7) * 7) - totalCells;
        for (let i = 1; i <= nextMonthNeeded; i++) { days.push({ type: 'next', day: i, dateKey: formatDateKey(year, month + 1, i) }); }
        return days;
    } catch (e) { return []; }
  }, [year, month]);

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) weeks.push(calendarDays.slice(i, i + 7));

  const safeCategories = useMemo(() => {
    if (!Array.isArray(categories)) return INITIAL_CATEGORIES;
    const valid = categories.filter(c => c && typeof c.id === 'string');
    return valid.length > 0 ? valid : INITIAL_CATEGORIES;
  }, [categories]);

  const stats = useMemo(() => {
    try {
        const safeRecords = (records && typeof records === 'object') ? records : {};
        const currentMonthKey = getMonthKey(year, month);
        const prevMonthDate = new Date(year, month - 1, 1);
        const prevMonthKey = getMonthKey(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
        
        const calcCounts = (monthKeyFilter = null) => {
          const counts = {}; 
          safeCategories.forEach(c => counts[c.id] = 0);
          Object.keys(safeRecords).forEach(dateKey => {
            if (monthKeyFilter && !dateKey.startsWith(monthKeyFilter)) return;
            const rec = safeRecords[dateKey];
            if (rec) {
                Object.values(rec).forEach(colorId => { if (counts[colorId] !== undefined) counts[colorId]++; });
            }
          });
          return counts;
        };
        
        const range = {}; 
        safeCategories.forEach(c => range[c.id] = { min: null, max: null, minVal: Infinity, maxVal: -Infinity, hasData: false });
        Object.keys(safeRecords).forEach(dateKey => {
            if (!dateKey) return;
            const parts = dateKey.split('-');
            if (parts.length < 2) return;
            const [y, m] = parts.map(Number);
            const monthVal = y * 12 + (m - 1); 
            if (isNaN(monthVal)) return;
            const monthStr = `${y}.${String(m).padStart(2, '0')}`;
            const rec = safeRecords[dateKey];
            if (rec) {
                 Object.values(rec).forEach(colorId => {
                      if (range[colorId]) {
                          range[colorId].hasData = true;
                          if (monthVal < range[colorId].minVal) { range[colorId].minVal = monthVal; range[colorId].min = monthStr; }
                          if (monthVal > range[colorId].maxVal) { range[colorId].maxVal = monthVal; range[colorId].max = monthStr; }
                      }
                 });
            }
        });

        const currentCounts = calcCounts(currentMonthKey);
        const maxCount = Math.max(1, ...Object.values(currentCounts));
        return { currentCounts, prevCounts: calcCounts(prevMonthKey), totalCounts: calcCounts(null), maxCount, range };
    } catch(e) {
        console.error("Stats Error:", e);
        return { currentCounts: {}, prevCounts: {}, totalCounts: {}, maxCount: 1, range: {} };
    }
  }, [records, year, month, safeCategories]);

  const memoMonthLabel = langKey === 'en' ? t.monthNames[month] : `${month + 1}${t.monthSuffix}`;

  // handle delete date (logic kept for data integrity, UI button removed)
  const handleDeleteDate = (dateKey) => {
    setRecords(prev => {
      const newRec = {...prev};
      delete newRec[dateKey];
      return newRec;
    });
    setDayNotes(prev => {
      const newNotes = {...prev};
      delete newNotes[dateKey];
      return newNotes;
    });
    setZoomedDateKey(null);
  };

  return (
    <>
    <style dangerouslySetInnerHTML={{__html: `
      * { -webkit-tap-highlight-color: transparent; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .hoverable:active { transform: scale(0.95); transition: transform 0.1s; }
    `}} />
    <div 
      onClick={handleBackgroundClick} 
      className={`flex justify-center px-1 font-sans selection:bg-slate-200 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-700'} min-h-screen py-4`}
    >
      <div 
        className={`w-full max-w-md shadow-2xl flex flex-col relative border transition-colors duration-300 h-auto min-h-[80vh] rounded-[40px] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white/60'}`} 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Modals */}
        {showDatePicker && <CustomDatePicker currentYear={year} currentMonth={month} onClose={() => setShowDatePicker(false)} onSelect={(y, m) => { setCurrentDate(new Date(y, m, 1)); setShowDatePicker(false); }} isDark={darkMode} t={t} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onReset={handleResetCurrentMonth} onExport={handleExportData} onImport={handleImportData} toggleLanguage={toggleLanguage} t={t} isDark={darkMode} lastBackupDate={lastBackupDate} isBackupOverdue={isBackupOverdue} />}
        {zoomedDateKey && (
            <DayCardModal 
                dateKey={zoomedDateKey} 
                gridMode={gridMode} 
                records={records} 
                categories={safeCategories} 
                dayNotes={dayNotes} 
                onClose={() => setZoomedDateKey(null)} 
                onSaveNote={handleSaveDayNote} 
                onNext={() => setZoomedDateKey(getNextDayKey(zoomedDateKey))}
                onPrev={() => setZoomedDateKey(getPrevDayKey(zoomedDateKey))}
                isDark={darkMode} 
                t={t} 
            />
        )}

        {/* Header */}
        <div className="pt-8 pb-2 px-5 flex justify-between items-start">
          <div className="flex flex-col items-start gap-0.5 flex-1">
            <input value={appTitle} onChange={(e) => setAppTitle(e.target.value)} className={`text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full outline-none ${darkMode ? 'text-slate-100 placeholder-slate-600' : 'text-slate-800 placeholder-slate-300'}`} placeholder={t.titlePlaceholder} />
            <div className="flex items-center gap-2 mt-1">
                <div className="group cursor-pointer flex items-center outline-none" onClick={() => setShowDatePicker(true)}>
                   <h2 className={`text-lg font-medium transition-colors ${darkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'}`}>{year}.{month + 1}</h2>
                </div>
                <button onClick={handleJumpToToday} className={`flex items-center gap-1 pl-2 pr-3 py-1 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`} title="回到今天">
                  <CalendarIcon size={14} /><span className="text-[10px] font-bold">{t.today}</span>
                </button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setGridMode(prev => prev === 4 ? 6 : 4)} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border outline-none ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-200'}`}>{gridMode === 4 ? <LayoutGrid size={18} /> : <Grid size={18} />}</button>
              <button onClick={toggleDarkMode} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border outline-none ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-200'}`}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView(view === 'calendar' ? 'stats' : 'calendar')} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 border outline-none ${view === 'stats' ? (darkMode ? 'bg-slate-100 text-slate-900 border-slate-100' : 'bg-slate-800 text-white border-slate-800') : (darkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200')}`}><BarChart2 size={18} /></button>
              <button onClick={() => setShowSettings(true)} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border outline-none relative ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-200'}`}><Settings size={18} />{isBackupOverdue && (<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse"></span>)}</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-2 pb-6 outline-none overflow-visible" onClick={() => setSelectedColor(null)}>
          {view === 'calendar' ? (
            <>
              {/* Calendar Grid Area */}
              <div onTouchStart={onTouchStartSwipe} onTouchMove={onTouchMoveSwipe} onTouchEnd={onTouchEndSwipe}>
                  <div className="grid grid-cols-[1fr_auto] gap-1 mb-1">
                     <div className="grid grid-cols-7 gap-1">
                         {currentWeekLabels.map((day, i) => (<div key={i} className={`text-center text-[11px] font-bold uppercase tracking-wide py-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{day}</div>))}
                     </div>
                     <div className="w-8"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex gap-1">
                        <div className="grid grid-cols-7 gap-1 flex-1">
                           {week.map((cell, dayIndex) => {
                            if (cell.type === 'empty') return <div key={dayIndex} className="h-20" />;
                            const isCurrent = cell.type === 'current';
                            const isTodayDate = isCurrent && isToday(cell.day, month, year);
                            const cellNotes = dayNotes?.[cell.dateKey];
                            const hasNote = isCurrent && cellNotes && Object.values(cellNotes).some(t => t && t.trim().length > 0);
                            
                            const handlePressStart = () => isCurrent && startLongPress(cell.dateKey);
                            const handlePressEnd = () => cancelLongPress();

                            const subCells = [];
                            const cellRecord = (records && records[cell.dateKey]) ? records[cell.dateKey] : {};
                            for (let i = 0; i < gridMode; i++) {
                               const colorId = cellRecord[i];
                               const activeCatState = safeCategories.find(c => c.id === colorId);
                               const style = getColorDef(activeCatState?.id);
                               const finalColor = activeCatState ? (darkMode ? style.dark : style.light) : 'bg-transparent';
                               
                               subCells.push(
                                 <div 
                                    key={i} 
                                    onClick={(e) => { 
                                        if (!isCurrent) return; 
                                        e.stopPropagation(); 
                                        handleCellClick(cell.dateKey, i); 
                                    }}
                                    className={`relative w-full h-full outline-none hoverable ${finalColor} hover:opacity-80`}
                                 />
                               );
                            }
                            
                            const textColor = isTodayDate ? (darkMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-white') : (darkMode ? 'text-slate-200' : 'text-slate-500');
                            const dashColor = isTodayDate ? (darkMode ? 'bg-slate-100' : 'bg-slate-800') : (darkMode ? 'bg-slate-200' : 'bg-slate-500');

                            return (
                              <div key={dayIndex} 
                                   className={`relative rounded-lg overflow-hidden flex flex-col h-20 transition-colors select-none ring-1 ring-inset ${isCurrent ? (darkMode ? 'bg-slate-800 ring-slate-500' : 'bg-white ring-slate-400') : (darkMode ? 'bg-slate-800/30 ring-slate-800 opacity-40' : 'bg-white/50 ring-slate-200 opacity-40')}`}
                                   onTouchStart={handlePressStart}
                                   onTouchEnd={handlePressEnd}
                                   onMouseDown={handlePressStart}
                                   onMouseUp={handlePressEnd}
                                   onMouseLeave={handlePressEnd}
                               >
                                 <GridOverlay gridMode={gridMode} isDark={darkMode} />
                                 <div className={`flex-1 grid w-full h-full gap-0 ${gridMode === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'}`}>{subCells}</div>
                                 <div className="absolute bottom-[3px] right-[3px] pointer-events-none z-20">
                                   <span className={`text-[9px] font-bold leading-none flex items-center justify-center w-4 h-4 rounded-full transition-all ${textColor}`}>{cell.day}</span>
                                 </div>
                                 {hasNote && (
                                     <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 rounded-full z-20 ${dashColor}`}></div>
                                  )}
                              </div>
                            );
                           })}
                        </div>
                        <div className={`w-8 flex flex-col items-center justify-center h-20 cursor-text overflow-hidden`} onClick={(e) => { e.stopPropagation(); const textarea = e.currentTarget.querySelector('textarea'); if(textarea) textarea.focus(); }}>
                           <AutoResizingTextarea value={weekNotes[`${year}-${month}-W${weekIndex}`] || ''} onChange={(val) => setWeekNotes({...weekNotes, [`${year}-${month}-W${weekIndex}`]: val})} placeholder={`W${weekIndex + 1}`} isDark={darkMode} />
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
              
              {/* Spacer */}
              <div className="h-6 w-full" /> 

              {/* Color Palette */}
              <div className="px-1">
                 <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-3">
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            {t.categoryHeader} 
                            <span className="text-[9px] font-normal opacity-60 ml-1">{t.editHint}</span>
                        </h3>
                        <button onClick={(e) => { e.stopPropagation(); toggleReorderMode('color'); }} className={`p-1.5 rounded-full transition-colors ${reorderMode === 'color' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') : (darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500')}`}><ArrowRightLeft size={14} /></button>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedColor(prev => prev === 'ERASER' ? null : 'ERASER'); }}
                        className={`p-1.5 rounded-full transition-all ${selectedColor === 'ERASER' ? (darkMode ? 'bg-slate-600 text-white ring-1 ring-slate-400' : 'bg-slate-800 text-white ring-1 ring-slate-600') : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}
                        title="Eraser"
                    >
                        <Eraser size={14} />
                    </button>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {safeCategories.map((cat) => {
                      const style = getColorDef(cat.id);
                      const isSelected = selectedColor === cat.id;
                      return (
                      <div 
                        key={cat.id} 
                        onClick={(e) => { e.stopPropagation(); reorderMode === 'color' ? handleItemSwap(cat.id, 'color') : setSelectedColor(prev => prev === cat.id ? null : cat.id); }}
                        onDoubleClick={(e) => { if(!reorderMode) { e.stopPropagation(); setEditingCategoryId(cat.id); setTempLabel(cat.defaultLabel); } }}
                        className={`
                           flex items-center gap-3 p-2 rounded-2xl border transition-all cursor-pointer outline-none select-none relative
                           ${reorderMode === 'color' ? (darkMode ? 'border-dashed border-blue-800' : 'border-dashed border-blue-200') : ''}
                           ${swapSourceId === cat.id ? (darkMode ? 'bg-blue-900/20 ring-2 ring-blue-700' : 'bg-blue-50 ring-2 ring-blue-300') : ''}
                           ${!reorderMode && isSelected ? (darkMode ? 'border-slate-100 bg-slate-800 shadow-md scale-[1.02]' : 'border-slate-800 bg-white shadow-md scale-[1.02]') : (darkMode ? 'border-slate-800 bg-slate-800 hover:border-slate-600' : 'border-slate-100 bg-white hover:border-slate-300')}
                           ${selectedColor === 'ERASER' ? 'opacity-50' : 'opacity-100'}
                        `}
                      >
                         <div className={`w-6 h-6 rounded-full flex-shrink-0 ring-1 shadow-inner ${darkMode ? style.dark + ' ring-white/10' : style.light + ' ring-black/5'}`}></div>
                         {editingCategoryId === cat.id && !reorderMode ? (
                           <input autoFocus value={tempLabel} onChange={(e) => setTempLabel(e.target.value)} onBlur={() => saveCategoryLabel(cat.id)} onKeyDown={(e) => e.key === 'Enter' && saveCategoryLabel(cat.id)} onClick={(e) => e.stopPropagation()} className={`w-full text-xs border-b focus:ring-0 p-0 font-medium outline-none ${darkMode ? 'text-slate-100 bg-slate-800 border-blue-500' : 'text-slate-800 bg-white border-blue-500'}`} />
                         ) : (
                            <span className={`w-full text-xs font-medium truncate min-h-[16px] block ${darkMode ? 'text-slate-200' : 'text-slate-700'} ${reorderMode ? 'pointer-events-none' : ''}`} title="雙擊編輯">{cat.defaultLabel}</span>
                         )}
                      </div>
                    )})}
                 </div>
              </div>

              {/* Footer Notes */}
              <div className="mt-8 mb-4 px-1">
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{memoMonthLabel} {t.memoHeader} <span className="text-[9px] font-normal opacity-60 ml-1">{t.editHint}</span></h3>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); toggleReorderMode('note'); }} className={`p-1.5 rounded-full transition-colors ${reorderMode === 'note' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') : (darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500')}`}><ArrowRightLeft size={14} /></button>
                      </div>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); handleAddNote(); }} className={`p-1 rounded-full transition-colors outline-none ${darkMode ? 'text-slate-500 hover:text-slate-300 bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-slate-100'}`}><Plus size={12} /></button>
                 </div>
                 <div className="space-y-4">
                    {footerNotes.map((note, idx) => (
                      <NoteRow key={note.id} note={note} onChange={(e) => handleUpdateNote(idx, e.target.value)} onDelete={() => handleDeleteNote(note.id)} isReordering={reorderMode === 'note'} isSelected={swapSourceId === note.id} onReorderSelect={(id) => handleItemSwap(id, 'note')} isDark={darkMode} t={t} />
                    ))}
                 </div>
              </div>
            </>
          ) : (
             <div className="h-full flex flex-col justify-start pt-2 pb-4 animate-in fade-in zoom-in duration-300 px-2" onClick={(e) => e.stopPropagation()}>
               <div className="flex flex-col h-full gap-2">
                 {safeCategories.map((cat) => {
                    const current = (stats && stats.currentCounts) ? (stats.currentCounts[cat.id] || 0) : 0;
                    const prev = (stats && stats.prevCounts) ? (stats.prevCounts[cat.id] || 0) : 0;
                    const diff = current - prev;
                    const maxCount = (stats && stats.maxCount) ? stats.maxCount : 1;
                    const barWidth = maxCount > 0 ? (current / maxCount) * 100 : 0;
                    const rangeInfo = (stats && stats.range && stats.range[cat.id]) ? stats.range[cat.id] : { hasData: false, minVal: 0, maxVal: 0 };
                    const style = getColorDef(cat.id);
                    
                    let freqText = `0${t.perMonth}`;
                    if (rangeInfo.hasData) {
                        const monthsDiff = (rangeInfo.maxVal - rangeInfo.minVal) + 1;
                        const total = (stats && stats.totalCounts) ? (stats.totalCounts[cat.id] || 0) : 0; 
                        const avg = Math.floor(total / Math.max(1, monthsDiff));
                        freqText = `${avg}${t.perMonth}`;
                    }
                    let diffColorClass = darkMode ? 'text-slate-500' : 'text-slate-400'; 
                    if (diff > 0) { diffColorClass = darkMode ? 'text-emerald-400' : 'text-emerald-600'; } 
                    else if (diff < 0) { diffColorClass = darkMode ? 'text-red-400' : 'text-red-600'; }

                    return (
                      <div key={cat.id} className={`flex-1 w-full p-3 rounded-2xl border ${darkMode ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-white/60'} shadow-sm flex items-center justify-between gap-4`}>
                         <div className="flex flex-col justify-center items-start w-28 flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1"><div className={`w-2 h-2 rounded-full ${darkMode ? style.dark : style.light}`}></div><span className={`font-bold text-xs ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{cat.defaultLabel}</span></div>
                            <span className={`text-4xl font-black leading-none tracking-tighter ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{current}</span>
                            <span className={`text-[9px] font-medium mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.statsMonthCount}</span>
                         </div>
                         <div className="flex-1 flex flex-col justify-center gap-1.5">
                            <div className="flex justify-between items-end"><span className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.statsFreq}: {freqText}</span><span className={`text-[10px] font-bold ${diffColorClass}`}>{diff >= 0 ? (diff > 0 ? '▲' : '-') : '▼'} {Math.abs(diff)} {t.statsVsLast}</span></div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden relative ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}><div className={`h-full rounded-full transition-all duration-500 ease-out ${darkMode ? style.dark : style.light}`} style={{ width: `${Math.max(barWidth, 2)}%` }}></div></div>
                            <div className="flex justify-end items-center"><span className={`text-[9px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.statsTotal}: {(stats && stats.totalCounts) ? (stats.totalCounts[cat.id] || 0) : 0}{rangeInfo.hasData && <span className="opacity-70 ml-1">({rangeInfo.min} ~ {rangeInfo.max})</span>}</span></div>
                         </div>
                      </div>
                    )
                 })}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

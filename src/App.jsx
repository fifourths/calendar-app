import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Grid, LayoutGrid, BarChart2, 
  Plus, Trash2, Settings, Download, Upload, RotateCcw, 
  AlertCircle, ArrowRightLeft, Calendar as CalendarIcon, Moon, Sun, 
  Globe, AlertTriangle, Clock, X, Eraser
} from 'lucide-react';

// --- 1. Constants & Config ---

const COLOR_DEFINITIONS = {
  red:    { id: 'red',    light: 'bg-red-300',    dark: 'bg-red-400/80', modalLight: 'bg-red-100',    modalDark: 'bg-red-400/20', borderLight: 'border-red-300',    borderDark: 'border-red-500/50',    textLight: 'text-red-500',    textDark: 'text-red-300' },
  orange: { id: 'orange', light: 'bg-orange-300', dark: 'bg-orange-400/80', modalLight: 'bg-orange-100', modalDark: 'bg-orange-400/20', borderLight: 'border-orange-300', borderDark: 'border-orange-500/50', textLight: 'text-orange-500', textDark: 'text-orange-300' },
  yellow: { id: 'yellow', light: 'bg-yellow-300', dark: 'bg-yellow-400/80', modalLight: 'bg-yellow-100', modalDark: 'bg-yellow-400/20', borderLight: 'border-yellow-300', borderDark: 'border-yellow-500/50', textLight: 'text-yellow-600', textDark: 'text-yellow-300' },
  green:  { id: 'green',  light: 'bg-emerald-300', dark: 'bg-emerald-400/80', modalLight: 'bg-emerald-100', modalDark: 'bg-emerald-400/20', borderLight: 'border-emerald-300', borderDark: 'border-emerald-500/50', textLight: 'text-emerald-500', textDark: 'text-emerald-300' },
  blue:   { id: 'blue',   light: 'bg-blue-300',   dark: 'bg-blue-400/80',   modalLight: 'bg-blue-100',   modalDark: 'bg-blue-400/20',   borderLight: 'border-blue-300',   borderDark: 'border-blue-500/50',   textLight: 'text-blue-500',   textDark: 'text-blue-300' },
  purple: { id: 'purple', light: 'bg-purple-300', dark: 'bg-purple-400/80', modalLight: 'bg-purple-100', modalDark: 'bg-purple-400/20', borderLight: 'border-purple-300', borderDark: 'border-purple-500/50', textLight: 'text-purple-500', textDark: 'text-purple-300' },
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
    confirmResetMsg: '將清除本月所有打卡紀錄。<br/>此動作無法復原。',
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
    cardHint: '點擊輸入文字內容'
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
    export: 'バックアップを保存',
    import: 'データを復元',
    resetMonth: '今月の記録をリセット',
    confirmResetTitle: 'リセットしますか？',
    confirmResetMsg: '今月の全ての記録が消去されます。<br/>この操作は取り消せません。',
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
    cardHint: 'タップして入力'
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
    confirmResetMsg: 'This will clear all records for this month.<br/>Cannot be undone.',
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
    cardHint: 'Tap to type'
  }
};

const DEFAULT_NOTES = [
  { id: 'def-0', text: '' },
  { id: 'def-1', text: '' },
  { id: 'def-2', text: '' },
];

const BACKUP_REMINDER_DAYS = 7;

// --- 2. Helper Functions ---

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
};

const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getMonthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;

// --- 3. Sub-Components ---

// Auto-Resizing Textarea
const AutoResizingTextarea = ({ value, onChange, placeholder, isDark }) => {
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 76)}px`;
    }
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    const oldVal = value || '';
    
    if (newVal.length < oldVal.length) {
        onChange(newVal);
        return;
    }

    const target = e.target;
    const prevHeight = target.style.height;
    target.style.height = 'auto';
    const newHeight = target.scrollHeight;
    target.style.height = prevHeight; 

    if (newHeight > 76) {
        return;
    }
    
    onChange(newVal);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={1}
      className={`w-full text-center text-[10px] bg-transparent border-none focus:ring-0 p-0 transition-colors outline-none font-bold resize-none leading-tight overflow-hidden whitespace-pre-wrap break-all ${isDark ? 'text-slate-400 placeholder-slate-700' : 'text-slate-600 placeholder-slate-200'}`}
      style={{ height: 'auto' }}
    />
  );
};

// Date Picker Modal
const CustomDatePicker = ({ currentYear, currentMonth, onClose, onSelect, isDark, t }) => {
  const [viewYear, setViewYear] = useState(currentYear);
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ${isDark ? 'bg-slate-900/60' : 'bg-slate-900/20'}`} onClick={onClose}>
      <div 
        className={`rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/50'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 px-2">
          <button 
            onClick={() => setViewYear(viewYear - 1)}
            className={`p-2 rounded-full transition-colors outline-none ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className={`text-xl font-bold tracking-tight font-sans ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{viewYear}</span>
          <button 
            onClick={() => setViewYear(viewYear + 1)}
            className={`p-2 rounded-full transition-colors outline-none ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(viewYear, i);
                onClose();
              }}
              className={`
                py-3 rounded-2xl text-sm font-bold transition-all duration-200 outline-none font-sans
                ${viewYear === currentYear && i === currentMonth 
                  ? (isDark ? 'bg-slate-100 text-slate-900 shadow-lg scale-105' : 'bg-slate-800 text-white shadow-lg scale-105')
                  : (isDark ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:scale-105')}
              `}
            >
              {i + 1}{t.monthSuffix}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Day Card Modal (Expanded View)
const DayCardModal = ({ dateKey, day, year, month, gridMode, records, notes, categories, onClose, onUpdateNote, isDark, t }) => {
  const dayRecord = records[dateKey] || {};
  const dayNotes = notes[dateKey] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={onClose}>
      <div 
        className={`w-full max-w-sm rounded-[32px] shadow-2xl transform transition-all scale-100 overflow-hidden flex flex-col max-h-[85vh]
          ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-white/60'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
           <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
             {year}.{month + 1}.{day}
           </h3>
           <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
             <X size={20} />
           </button>
        </div>

        {/* Big Grid Content */}
        <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
           <div className={`grid gap-3 ${gridMode === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'}`} style={{ minHeight: '320px' }}>
              {Array.from({ length: gridMode }).map((_, i) => {
                  const colorId = dayRecord[i];
                  const cat = categories.find(c => c.id === colorId);
                  const style = cat ? COLOR_DEFINITIONS[cat.id] : null;
                  
                  // Use modalLight / modalDark for softer backgrounds
                  const bgClass = style ? (isDark ? style.modalDark : style.modalLight) : (isDark ? 'bg-slate-800/50' : 'bg-slate-50');
                  const borderClass = style ? (isDark ? style.borderDark : style.borderLight) : (isDark ? 'border-slate-700' : 'border-slate-200');
                  
                  return (
                    <div key={i} className={`relative rounded-2xl border-2 flex flex-col p-3 transition-colors ${bgClass} ${borderClass}`}>
                       {/* Label if colored */}
                       {cat && (
                         <div className={`text-[10px] font-bold uppercase mb-1 opacity-70 truncate ${isDark ? 'text-white' : 'text-black'}`}>
                            {cat.defaultLabel}
                         </div>
                       )}
                       
                       {/* Text Input Area (No Scrollbar class added) */}
                       <textarea
                          className={`flex-1 w-full bg-transparent border-none resize-none outline-none text-sm leading-relaxed p-0 no-scrollbar
                            ${style ? (isDark ? 'text-white placeholder-white/50' : 'text-slate-900 placeholder-slate-700/40') : (isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400')}
                          `}
                          placeholder={t.placeholderNote}
                          value={dayNotes[i] || ''}
                          onChange={(e) => onUpdateNote(dateKey, i, e.target.value)}
                       />
                       
                    </div>
                  )
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

// Settings Modal
const SettingsModal = ({ 
  onClose, onReset, onExport, onImport, toggleLanguage, t, isDark, lastBackupDate, isBackupOverdue 
}) => {
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('menu'); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  const containerClass = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/60';
  const titleClass = isDark ? 'text-slate-100' : 'text-slate-800';
  const buttonClass = isDark 
    ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' 
    : 'bg-slate-50 hover:bg-slate-100 text-slate-600';
  const iconBgClass = isDark ? 'bg-slate-600 text-slate-200' : 'bg-white text-slate-400';
  const dividerClass = isDark ? 'bg-slate-700' : 'bg-slate-100';
  const dangerClass = isDark 
    ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400' 
    : 'bg-red-50 hover:bg-red-100 text-red-600';
  
  let formattedLastBackup = t.neverBackedUp;
  try {
      if (lastBackupDate) {
          const date = new Date(lastBackupDate);
          if (!isNaN(date.getTime())) {
              formattedLastBackup = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          }
      }
  } catch (e) {
      formattedLastBackup = 'Error';
  }

  if (mode === 'confirm_reset') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
        <div className={`rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border ${isDark ? 'bg-slate-800 border-red-900/30' : 'bg-white border-red-100'}`} onClick={(e) => e.stopPropagation()}>
           <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-500'}`}>
                 <AlertCircle size={24} />
              </div>
              <h3 className={`text-lg font-bold ${titleClass}`}>{t.confirmResetTitle}</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`} dangerouslySetInnerHTML={{__html: t.confirmResetMsg}}></p>
              
              <p className={`text-[10px] bg-slate-100 dark:bg-slate-900/50 p-2 rounded-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                 {t.resetKeepNotesHint}
              </p>
           </div>
           
           <div className="flex gap-3">
              <button 
                onClick={() => setMode('menu')}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-colors outline-none ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t.cancel}
              </button>
              <button 
                onClick={onReset}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors outline-none shadow-lg shadow-red-200 dark:shadow-none"
              >
                {t.confirm}
              </button>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border ${containerClass}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 px-1">
           <h3 className={`text-lg font-bold ${titleClass}`}>{t.settingsTitle}</h3>
        </div>
        
        <div className={`mb-3 px-3 py-2 rounded-xl flex items-center gap-2 text-xs 
            ${isBackupOverdue && lastBackupDate 
              ? (isDark ? 'bg-red-900/20 text-red-400 ring-1 ring-red-900/50' : 'bg-red-50 text-red-600 ring-1 ring-red-200') 
              : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')}
        `}>
             {isBackupOverdue && lastBackupDate ? <AlertTriangle size={14} /> : <Clock size={14} />}
             <span className="font-medium">{t.lastBackup}{formattedLastBackup}</span>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors outline-none group ${buttonClass}`}
          >
            <div className={`p-2 rounded-xl group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors shadow-sm ${iconBgClass}`}>
               <Globe size={18} />
            </div>
            <span className="text-sm font-medium flex-1 text-left">{t.switchLang}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-500'}`}>{t.langName}</span>
          </button>

          <button 
            onClick={onExport}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors outline-none group ${isBackupOverdue && lastBackupDate ? (isDark ? 'ring-1 ring-red-400/50 bg-red-900/20 text-red-300' : 'ring-1 ring-red-400 bg-red-50 text-red-600') : buttonClass}`}
          >
            <div className={`p-2 rounded-xl group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors shadow-sm ${iconBgClass}`}>
               <Download size={18} className={isBackupOverdue && lastBackupDate ? (isDark ? 'text-red-400' : 'text-red-500') : ''} />
            </div>
            <span className={`text-sm font-medium ${isBackupOverdue && lastBackupDate ? 'font-bold' : ''}`}>
                {isBackupOverdue && lastBackupDate ? t.backupOverdue : t.export}
            </span>
          </button>

          <button 
            onClick={() => fileInputRef.current.click()}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors outline-none group ${buttonClass}`}
          >
             <div className={`p-2 rounded-xl group-hover:text-green-500 dark:group-hover:text-green-300 transition-colors shadow-sm ${iconBgClass}`}>
               <Upload size={18} />
             </div>
            <span className="text-sm font-medium">{t.import}</span>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </button>

          <div className={`h-px my-2 ${dividerClass}`}></div>

          <button 
            onClick={() => setMode('confirm_reset')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors outline-none group ${dangerClass}`}
          >
             <div className={`p-2 rounded-xl group-hover:text-red-600 transition-colors shadow-sm ${isDark ? 'bg-slate-600 text-red-400' : 'bg-white/80 text-red-400'}`}>
               <RotateCcw size={18} />
             </div>
            <span className="text-sm font-medium">{t.resetMonth}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Note Row Component
const NoteRow = ({ note, onChange, onDelete, isReordering, isSelected, onReorderSelect, isDark, t }) => {
  const inputRef = useRef(null);
  return (
    <div 
      className={`group flex items-end gap-2 relative transition-all duration-200 
        ${isReordering ? 'p-2 -mx-2 rounded-lg border border-transparent' : ''}
        ${isReordering && !isSelected ? (isDark ? 'hover:bg-slate-800 border-slate-700' : 'hover:bg-slate-50 border-slate-100') : ''}
        ${isSelected ? (isDark ? 'bg-blue-900/30 border-blue-800 ring-1 ring-blue-700' : 'bg-blue-50 border-blue-200 ring-1 ring-blue-300') + ' z-10' : ''}
      `}
      onClick={(e) => {
         if (isReordering) {
            e.stopPropagation();
            onReorderSelect(note.id);
        } else {
            inputRef.current && inputRef.current.focus();
        }
      }}
    >
       <div className={`h-full w-0.5 absolute left-0 top-1 bottom-1 rounded-full transition-colors ${isDark ? 'bg-slate-600 group-focus-within:bg-slate-400' : 'bg-slate-300 group-focus-within:bg-slate-500'}`}></div>
       <input 
         ref={inputRef}
         value={note.text}
         onChange={onChange}
         onTouchStart={(e) => !isReordering && e.stopPropagation()}
         className={`flex-1 text-sm bg-transparent border-b focus:ring-0 px-3 pb-2 transition-all outline-none 
            ${isDark ? 'text-slate-100 border-slate-700 focus:border-slate-500 placeholder:text-slate-600' : 'text-slate-900 border-slate-200 focus:border-slate-400 placeholder:text-slate-400'} 
            ${isReordering ? 'pointer-events-none' : ''}`}
         placeholder={isReordering ? t.swapHint : t.placeholderNote}
         readOnly={isReordering}
       />
       {!isReordering && (
         <button 
           onClick={(e) => {
             e.stopPropagation();
             onDelete();
           }}
           className={`opacity-0 group-hover:opacity-100 transition-all p-1 outline-none ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-400'}`}
         >
            <Trash2 size={14} />
         </button>
       )}
    </div>
  );
};


// --- 4. Main Application ---

export default function NewCalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appTitle, setAppTitle] = useState('My Life Log');
  const [gridMode, setGridMode] = useState(4); 
  const [view, setView] = useState('calendar');
  const [langIndex, setLangIndex] = useState(0); 
  
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [records, setRecords] = useState({});
  const [recordNotes, setRecordNotes] = useState({}); 
  const [weekNotes, setWeekNotes] = useState({});
  const [allFooterNotes, setAllFooterNotes] = useState({});
  
  // Set default color back to first category
  const [selectedColor, setSelectedColor] = useState(INITIAL_CATEGORIES[0].id);
  
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [tempLabel, setTempLabel] = useState('');
  
  const [reorderMode, setReorderMode] = useState(null);
  const [swapSourceId, setSwapSourceId] = useState(null);
  
  const [expandedDate, setExpandedDate] = useState(null); 

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  
  // Backup Status
  const [lastBackupDate, setLastBackupDate] = useState(null);

  // --- AUTO-INJECT ICON ON MOUNT ---
  useEffect(() => {
    const injectIcon = () => {
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        existingIcons.forEach(el => el.remove());
        
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 180, 180);
        const dotColors = [
            '#fca5a5', '#fdba74', '#fde047', 
            '#6ee7b7', '#93c5fd', '#d8b4fe', 
            '#f1f5f9', '#f1f5f9', '#f1f5f9'
        ];
        const radius = 20;
        const gap = 45;
        const startX = 45;
        const startY = 45;
        dotColors.forEach((color, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const x = startX + col * gap;
            const y = startY + row * gap;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        });
        const iconUrl = canvas.toDataURL('image/png');

        const link = document.createElement('link');
        link.type = 'image/png';
        link.rel = 'icon';
        link.href = iconUrl;
        document.head.appendChild(link);

        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = iconUrl;
        document.head.appendChild(appleLink);
    };
    const timer = setTimeout(injectIcon, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Persistence
  useEffect(() => {
    const load = (key, setter, defaultVal) => {
      const saved = localStorage.getItem(`calendar_app_v70_${key}`);
      if (saved) {
        try { setter(JSON.parse(saved)); } catch (e) { if(defaultVal) setter(defaultVal); }
      } else if (defaultVal !== undefined) {
        setter(defaultVal);
      }
    };
    load('title', setAppTitle);
    load('gridMode', setGridMode);
    load('categories', setCategories, INITIAL_CATEGORIES);
    load('records', setRecords);
    load('recordNotes', setRecordNotes); 
    load('weekNotes', setWeekNotes);
    load('langIndex', setLangIndex);
    load('darkMode', setDarkMode, false);
    load('lastBackupDate', setLastBackupDate, null);
    
    const savedNewNotes = localStorage.getItem('calendar_app_v70_allFooterNotes');
    if (savedNewNotes) {
      setAllFooterNotes(JSON.parse(savedNewNotes));
    } else {
      const savedOldNotes = localStorage.getItem('calendar_app_v70_footerNotes');
      if (savedOldNotes) {
        try {
          const parsedOld = JSON.parse(savedOldNotes);
          if (Array.isArray(parsedOld)) {
            const currentKey = getMonthKey(new Date().getFullYear(), new Date().getMonth());
            setAllFooterNotes({ [currentKey]: parsedOld });
          }
        } catch(e) {}
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar_app_v70_title', JSON.stringify(appTitle));
    localStorage.setItem('calendar_app_v70_gridMode', JSON.stringify(gridMode));
    localStorage.setItem('calendar_app_v70_categories', JSON.stringify(categories));
    localStorage.setItem('calendar_app_v70_records', JSON.stringify(records));
    localStorage.setItem('calendar_app_v70_recordNotes', JSON.stringify(recordNotes)); 
    localStorage.setItem('calendar_app_v70_weekNotes', JSON.stringify(weekNotes));
    localStorage.setItem('calendar_app_v70_allFooterNotes', JSON.stringify(allFooterNotes));
    localStorage.setItem('calendar_app_v70_langIndex', JSON.stringify(langIndex));
    localStorage.setItem('calendar_app_v70_darkMode', JSON.stringify(darkMode));
    localStorage.setItem('calendar_app_v70_lastBackupDate', JSON.stringify(lastBackupDate));
    localStorage.setItem('calendar_app_v70_categoryOrder', JSON.stringify(categories.map(c => c.id)));
  }, [appTitle, gridMode, categories, records, recordNotes, weekNotes, allFooterNotes, langIndex, darkMode, lastBackupDate]);

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

  // --- Handlers ---
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const handleJumpToToday = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date()); 
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };
  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    touchStartX.current = null;
    touchEndX.current = null;
    if (distance > 100) handleNextMonth();
    if (distance < -100) handlePrevMonth();
  };

  const toggleLanguage = () => setLangIndex((prev) => (prev + 1) % 3);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleCellClick = (dateKey, subIndex) => {
    const currentRecord = records[dateKey] || {};
    const currentColor = currentRecord[subIndex];
    const newRecord = { ...currentRecord };
    
    // Toggle logic: if clicked color is same as selected, remove it. Otherwise overwrite.
    if (currentColor === selectedColor) {
      delete newRecord[subIndex];
    } else {
      if (selectedColor) {
          newRecord[subIndex] = selectedColor;
      }
    }
    setRecords(prev => ({ ...prev, [dateKey]: newRecord }));
  };

  const handleUpdateRecordNote = (dateKey, subIndex, text) => {
    setRecordNotes(prev => {
      const dayNotes = prev[dateKey] || {};
      const newDayNotes = { ...dayNotes, [subIndex]: text };
      return { ...prev, [dateKey]: newDayNotes };
    });
  };

  const updateCategoryLabel = (id, newLabel) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, defaultLabel: newLabel } : c));
  };
  
  const saveCategoryLabel = (id) => {
    updateCategoryLabel(id, tempLabel);
    setEditingCategoryId(null);
  };

  const handleUpdateNote = (idx, text) => {
    const newNotes = [...footerNotes];
    newNotes[idx] = { ...newNotes[idx], text };
    setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes }));
  };

  const handleAddNote = () => {
    const newNotes = [...footerNotes, { id: Date.now().toString(), text: '' }];
    setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes }));
  };

  const handleDeleteNote = (id) => {
    const newNotes = footerNotes.filter(n => n.id !== id);
    setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes }));
  };

  const handleResetCurrentMonth = () => {
     const newRecords = { ...records };
     const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
     Object.keys(newRecords).forEach(key => {
       if (key.startsWith(currentMonthPrefix)) delete newRecords[key];
     });
     setRecords(newRecords);
     setShowSettings(false);
     setView('calendar');
  };

  const handleExportData = () => {
    const now = new Date().toISOString();
    setLastBackupDate(now);
    const data = {
      appTitle, gridMode, categories, records, recordNotes, weekNotes, allFooterNotes, langIndex,
      exportedAt: now
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar_backup_${now.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        if (data.categories) setCategories(data.categories);
        if (data.records) setRecords(data.records);
        if (data.recordNotes) setRecordNotes(data.recordNotes);
        if (data.weekNotes) setWeekNotes(data.weekNotes);
        if (data.allFooterNotes) setAllFooterNotes(data.allFooterNotes);
        else if (data.footerNotes) {
            const importKey = getMonthKey(new Date().getFullYear(), new Date().getMonth());
            setAllFooterNotes({ [importKey]: data.footerNotes });
        }
        if (data.langIndex !== undefined) setLangIndex(data.langIndex);
        setLastBackupDate(new Date().toISOString());
        setShowSettings(false);
      } catch (error) {
        alert('匯入失敗：檔案格式錯誤');
        setShowSettings(false);
      }
    };
    reader.readAsText(file);
  };

  const toggleReorderMode = (mode) => {
    if (reorderMode === mode) {
        setReorderMode(null);
        setSwapSourceId(null);
    } else {
        setReorderMode(mode);
        setSwapSourceId(null);
    }
  };

  const handleItemSwap = (targetId, listType) => {
    if (!reorderMode || reorderMode !== listType) return;
    if (swapSourceId === null) {
      setSwapSourceId(targetId);
    } else if (swapSourceId === targetId) {
      setSwapSourceId(null);
    } else {
      if (listType === 'color') {
         const newCats = [...categories];
         const srcIdx = newCats.findIndex(c => c.id === swapSourceId);
         const tgtIdx = newCats.findIndex(c => c.id === targetId);
         if (srcIdx !== -1 && tgtIdx !== -1) {
            [newCats[srcIdx], newCats[tgtIdx]] = [newCats[tgtIdx], newCats[srcIdx]];
            setCategories(newCats);
         }
      } else {
         const newNotes = [...footerNotes];
         const srcIdx = newNotes.findIndex(n => n.id === swapSourceId);
         const tgtIdx = newNotes.findIndex(n => n.id === targetId);
         if (srcIdx !== -1 && tgtIdx !== -1) {
            [newNotes[srcIdx], newNotes[tgtIdx]] = [newNotes[tgtIdx], newNotes[srcIdx]];
            setAllFooterNotes(prev => ({ ...prev, [monthKey]: newNotes }));
         }
      }
      setSwapSourceId(null);
    }
  };

  // --- Stats Logic & Grid Construction ---
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); 
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ type: 'empty' });
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ type: 'current', day: i, dateKey: formatDateKey(year, month, i) });
    }
    const totalCells = days.length;
    
    // Auto height
    const nextMonthNeeded = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let i = 1; i <= nextMonthNeeded; i++) {
       days.push({ type: 'next', day: i, dateKey: formatDateKey(year, month + 1, i) });
    }
    return days;
  }, [year, month]);

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const stats = useMemo(() => {
    const currentMonthKey = getMonthKey(year, month);
    const prevMonthDate = new Date(year, month - 1, 1);
    const prevMonthKey = getMonthKey(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

    const calcCounts = (monthKeyFilter = null) => {
      const counts = {};
      categories.forEach(c => counts[c.id] = 0);
      Object.keys(records).forEach(dateKey => {
        if (monthKeyFilter && !dateKey.startsWith(monthKeyFilter)) return;
        Object.values(records[dateKey]).forEach(colorId => {
           if (counts[colorId] !== undefined) counts[colorId]++;
        });
      });
      return counts;
    };

    const range = {}; 
    categories.forEach(c => range[c.id] = { min: null, max: null, minVal: Infinity, maxVal: -Infinity, hasData: false });

    Object.keys(records).forEach(dateKey => {
        const date = new Date(dateKey);
        const timestamp = date.getTime();
        const monthStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;

        Object.values(records[dateKey]).forEach(colorId => {
            if (range[colorId]) {
                range[colorId].hasData = true;
                if (timestamp < range[colorId].minVal) {
                    range[colorId].minVal = timestamp;
                    range[colorId].min = monthStr;
                }
                if (timestamp > range[colorId].maxVal) {
                    range[colorId].maxVal = timestamp;
                    range[colorId].max = monthStr;
                }
            }
        });
    });
    
    const currentCounts = calcCounts(currentMonthKey);
    const maxCount = Math.max(1, ...Object.values(currentCounts));
    return { 
      currentCounts, 
      prevCounts: calcCounts(prevMonthKey), 
      totalCounts: calcCounts(null),
      maxCount,
      range 
    };
  }, [records, year, month, categories]);

  const memoMonthLabel = langKey === 'en' 
    ? t.monthNames[month] 
    : `${month + 1}${t.monthSuffix}`;

  return (
    <>
    <style dangerouslySetInnerHTML={{__html: `
      * { -webkit-tap-highlight-color: transparent; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @media (hover: none) {
        .hover\\:bg-opacity-80:hover { background-opacity: 1; }
      }
    `}} />

    <div className={`flex justify-center px-1 font-sans selection:bg-slate-200 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-700'} min-h-screen py-4`}>
      {/* Auto Height for Mobile Full View */}
      <div 
        className={`w-full max-w-md shadow-2xl flex flex-col relative border transition-colors duration-300 h-auto min-h-[80vh] rounded-[40px]
         ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white/60'}
        `}
      >
        
        {/* Modals */}
        {showDatePicker && <CustomDatePicker currentYear={year} currentMonth={month} onClose={() => setShowDatePicker(false)} onSelect={(y, m) => { setCurrentDate(new Date(y, m, 1)); setShowDatePicker(false); }} isDark={darkMode} t={t} />}
        {showSettings && (
            <SettingsModal 
                onClose={() => setShowSettings(false)} 
                onReset={handleResetCurrentMonth} 
                onExport={handleExportData} 
                onImport={handleImportData} 
                toggleLanguage={toggleLanguage}
                t={t}
                isDark={darkMode}
                lastBackupDate={lastBackupDate}
                isBackupOverdue={isBackupOverdue}
            />
        )}

        {/* Day Card Modal (Expanded View) */}
        {expandedDate && (
          <DayCardModal 
             dateKey={expandedDate.dateKey}
             day={expandedDate.day}
             year={year}
             month={month}
             gridMode={gridMode}
             records={records}
             notes={recordNotes}
             categories={categories}
             onClose={() => setExpandedDate(null)}
             onUpdateNote={handleUpdateRecordNote}
             isDark={darkMode}
             t={t}
          />
        )}
      
        {/* Header Section */}
        <div className="pt-8 pb-2 px-5 flex justify-between items-start">
          <div className="flex flex-col items-start gap-0.5 flex-1">
            <input
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full outline-none ${darkMode ? 'text-slate-100 placeholder-slate-600' : 'text-slate-800 placeholder-slate-300'}`}
              placeholder={t.titlePlaceholder}
            />
            
            <div className="flex items-center gap-2 mt-1">
                <div 
                  className="group cursor-pointer flex items-center outline-none"
                  onClick={(e) => { e.stopPropagation(); setShowDatePicker(true); }}
                >
                   <h2 className={`text-lg font-medium transition-colors ${darkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'}`}>
                     {year}.{month + 1}
                   </h2>
                </div>
                
                {/* Today Button */}
                <button 
                  onClick={handleJumpToToday}
                  className={`flex items-center gap-1 pl-2 pr-3 py-1 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                  title="回到今天"
                >
                  <CalendarIcon size={14} />
                  <span className="text-[10px] font-bold">{t.today}</span>
                </button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setGridMode(prev => prev === 4 ? 6 : 4); }} 
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border outline-none ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-200'}`}
              >
                {gridMode === 4 ? <LayoutGrid size={18} /> : <Grid size={18} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleDarkMode(); }} 
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border outline-none ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-200'}`}
              >
                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setView(view === 'calendar' ? 'stats' : 'calendar'); }} 
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 border outline-none ${view === 'stats' ? (darkMode ? 'bg-slate-100 text-slate-900 border-slate-100' : 'bg-slate-800 text-white border-slate-800') : (darkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200')}`}
              >
                <BarChart2 size={18} />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} 
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border outline-none relative ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-transparent hover:border-slate-200'}`}
              >
                <Settings size={18} />
                {isBackupOverdue && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-2 pb-6 outline-none overflow-visible">
          
          {view === 'calendar' ? (
            <>
              {/* SWIPE AREA */}
              <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                  {/* Calendar Header */}
                  <div className="grid grid-cols-[1fr_auto] gap-1 mb-1">
                      <div className="grid grid-cols-7 gap-1">
                        {currentWeekLabels.map((day, i) => (
                          <div key={i} className={`text-center text-[11px] font-bold uppercase tracking-wide py-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{day}</div>
                        ))}
                     </div>
                     {/* SPACER FOR WEEK COLUMN HEADER */}
                     <div className="w-8"></div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="flex flex-col gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex gap-1">
                         <div className="grid grid-cols-7 gap-1 flex-1">
                          {week.map((cell, dayIndex) => {
                            if (cell.type === 'empty') return <div key={dayIndex} className="h-20" />;
                            const isCurrent = cell.type === 'current';
                            const isTodayDate = isCurrent && isToday(cell.day, month, year);
                            const hasNotes = recordNotes[cell.dateKey] && Object.values(recordNotes[cell.dateKey]).some(v => v);
                            const cellRecord = records[cell.dateKey] || {};
                            
                            // LONG PRESS LOGIC
                            const pressTimer = useRef(null);
                            const isLongPress = useRef(false);

                            const startPress = () => {
                                isLongPress.current = false;
                                pressTimer.current = setTimeout(() => {
                                    isLongPress.current = true;
                                    setExpandedDate({ dateKey: cell.dateKey, day: cell.day });
                                }, 500); // 500ms for long press
                            };

                            const endPress = (subIndex) => {
                                clearTimeout(pressTimer.current);
                                if (!isLongPress.current) {
                                    if(subIndex !== -1) { 
                                        handleCellClick(cell.dateKey, subIndex);
                                    }
                                }
                            };

                            // Subcells
                            const subCells = Array.from({ length: gridMode }).map((_, i) => {
                                const colorId = cellRecord[i];
                                const activeCatState = categories?.find(c => c.id === colorId);
                                const activeStyle = activeCatState ? COLOR_DEFINITIONS[activeCatState.id] : null;
                                const finalColor = activeStyle ? (darkMode ? activeStyle.dark : activeStyle.light) : 'bg-transparent';
                                
                                return (
                                  <div 
                                    key={i} 
                                    onMouseDown={startPress}
                                    onMouseUp={() => endPress(i)}
                                    onTouchStart={startPress}
                                    onTouchEnd={(e) => { e.preventDefault(); endPress(i); }}
                                    className={`relative w-full h-full outline-none hoverable ${finalColor} hover:opacity-80`}
                                  >
                                    <div className={`absolute inset-0 pointer-events-none 
                                       ${darkMode ? 'border-slate-500' : 'border-slate-400/70'}
                                       ${gridMode === 4 && i === 0 ? 'border-r border-b' : ''}
                                       ${gridMode === 4 && i === 1 ? 'border-b' : ''}
                                       ${gridMode === 4 && i === 2 ? 'border-r' : ''}
                                       ${gridMode === 6 && (i === 0 || i === 1) ? 'border-r border-b' : ''}
                                       ${gridMode === 6 && i === 2 ? 'border-b' : ''}
                                       ${gridMode === 6 && (i === 3 || i === 4) ? 'border-r' : ''}
                                    `}></div>
                                  </div>
                                );
                            });

                            return (
                              <div key={dayIndex} className="relative h-20 cursor-pointer group">
                                 {/* Inner Content Card */}
                                 <div className={`
                                     absolute inset-0 rounded-lg overflow-hidden flex flex-col transition-colors
                                     ${isCurrent 
                                        ? (darkMode ? 'bg-slate-800 border-2 border-slate-500' : 'bg-white border-2 border-slate-400')
                                        : (darkMode ? 'bg-slate-800/30 border-2 border-slate-800 opacity-40' : 'bg-white/50 border-2 border-slate-200 opacity-40')
                                     }
                                 `}>
                                     {/* Subcells Container */}
                                     <div className={`flex-1 grid ${gridMode === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'}`}>
                                         {subCells}
                                     </div>

                                     {/* Date Number - Simple Text Only (No Circle/Shadow) */}
                                     <div className="absolute bottom-[3px] right-[3px] pointer-events-none z-10 flex items-center gap-0.5">
                                       <span className={`
                                         text-[10px] font-bold flex items-center justify-center w-5 h-5 rounded-full transition-all
                                         ${isTodayDate 
                                            ? (darkMode ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-slate-800 text-white shadow-sm')
                                            : (darkMode ? 'text-slate-300' : 'text-slate-600')
                                         }
                                       `}>
                                         {cell.day}
                                       </span>
                                     </div>
                                 </div>
                                 
                                 {/* NOTE INDICATOR: Solid White in Dark Mode */}
                                 {hasNotes && !isTodayDate && (
                                     <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-[3px] z-20 pointer-events-none">
                                        <div className={`w-full h-full rounded-full ${darkMode ? 'bg-white' : 'bg-slate-600'}`}></div>
                                     </div>
                                 )}
                              </div>
                            );
                        })}
                        </div>
                        
                        <div 
                          className={`w-8 flex flex-col items-center justify-center h-20 cursor-text overflow-hidden`}
                          onClick={(e) => {
                             e.stopPropagation(); 
                             const textarea = e.currentTarget.querySelector('textarea');
                             if(textarea) textarea.focus();
                          }}
                        >
                           <AutoResizingTextarea 
                              value={weekNotes[`${year}-${month}-W${weekIndex}`] || ''}
                              onChange={(val) => setWeekNotes({...weekNotes, [`${year}-${month}-W${weekIndex}`]: val})}
                              placeholder={`W${weekIndex + 1}`}
                              isDark={darkMode}
                           />
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Color Palette */}
              <div className="mt-6 px-1">
                 <div className="flex items-center justify-start gap-2 mb-3">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {t.categoryHeader} 
                        <span className="text-[9px] font-normal opacity-60 ml-1">{t.editHint}</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleReorderMode('color'); }}
                        className={`p-1.5 rounded-full transition-colors ${reorderMode === 'color' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') : (darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500')}`}
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                      {reorderMode === 'color' && (
                        <span className={`text-xs font-medium animate-in fade-in slide-in-from-left-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {t.swapHint}
                        </span>
                      )}
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const style = COLOR_DEFINITIONS[cat.id];
                      return (
                      <div 
                        key={cat.id} 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            if (reorderMode === 'color') {
                                handleItemSwap(cat.id, 'color');
                            } else {
                                setSelectedColor(cat.id);
                            }
                        }}
                        onDoubleClick={(e) => {
                            if(!reorderMode) {
                              e.stopPropagation();
                              setEditingCategoryId(cat.id);
                              setTempLabel(cat.defaultLabel);
                            }
                        }}
                        className={`
                           flex items-center gap-3 p-2 rounded-2xl border transition-all cursor-pointer outline-none select-none relative
                           ${reorderMode === 'color' ? (darkMode ? 'border-dashed border-blue-800' : 'border-dashed border-blue-200') : ''}
                           ${swapSourceId === cat.id ? (darkMode ? 'bg-blue-900/20 ring-2 ring-blue-700' : 'bg-blue-50 ring-2 ring-blue-300') : ''}
                           ${!reorderMode && selectedColor === cat.id ? (darkMode ? 'border-slate-100 bg-slate-800 shadow-md scale-[1.02]' : 'border-slate-800 bg-white shadow-md scale-[1.02]') : (darkMode ? 'border-slate-800 bg-slate-800 hover:border-slate-600' : 'border-slate-100 bg-white hover:border-slate-300')}
                        `}
                      >
                         <div className={`w-6 h-6 rounded-full flex-shrink-0 ring-1 shadow-inner ${darkMode ? style.dark + ' ring-white/10' : style.light + ' ring-black/5'}`}></div>
                         
                         {editingCategoryId === cat.id && !reorderMode ? (
                           <input 
                             autoFocus
                             value={tempLabel}
                             onChange={(e) => setTempLabel(e.target.value)}
                             onBlur={() => saveCategoryLabel(cat.id)}
                             onKeyDown={(e) => e.key === 'Enter' && saveCategoryLabel(cat.id)}
                             onClick={(e) => e.stopPropagation()} 
                             className={`w-full text-xs border-b focus:ring-0 p-0 font-medium outline-none ${darkMode ? 'text-slate-100 bg-slate-800 border-blue-500' : 'text-slate-800 bg-white border-blue-500'}`}
                           />
                         ) : (
                           <span 
                             className={`w-full text-xs font-medium truncate min-h-[16px] block ${darkMode ? 'text-slate-200' : 'text-slate-700'} ${reorderMode ? 'pointer-events-none' : ''}`}
                             title="雙擊編輯"
                           >
                             {cat.defaultLabel}
                           </span>
                         )}
                      </div>
                    )})}
                 </div>
              </div>

              {/* Footer Notes */}
              <div className="mt-8 mb-4 px-1">
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {memoMonthLabel} {t.memoHeader} <span className="text-[9px] font-normal opacity-60 ml-1">{t.editHint}</span>
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleReorderMode('note'); }}
                          className={`p-1.5 rounded-full transition-colors ${reorderMode === 'note' ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') : (darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500')}`}
                        >
                          <ArrowRightLeft size={14} />
                        </button>
                        {reorderMode === 'note' && (
                          <span className={`text-xs font-medium animate-in fade-in slide-in-from-left-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {t.swapHint}
                          </span>
                        )}
                      </div>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); handleAddNote(); }} className={`p-1 rounded-full transition-colors outline-none ${darkMode ? 'text-slate-500 hover:text-slate-300 bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-slate-100'}`}>
                     <Plus size={12} />
                   </button>
                 </div>
                 <div className="space-y-4">
                     {footerNotes.map((note, idx) => (
                      <NoteRow 
                        key={note.id} 
                        note={note} 
                        onChange={(e) => handleUpdateNote(idx, e.target.value)} 
                        onDelete={() => handleDeleteNote(note.id)}
                        isReordering={reorderMode === 'note'}
                        isSelected={swapSourceId === note.id}
                        onReorderSelect={(id) => handleItemSwap(id, 'note')}
                        isDark={darkMode}
                        t={t}
                      />
                    ))}
                 </div>
              </div>
            </>
          ) : (
            // --- Statistics View ---
            <div className="h-full flex flex-col justify-start pt-2 pb-4 animate-in fade-in zoom-in duration-300 px-2">
               <div className="flex flex-col h-full gap-2">
                 {categories.map((cat) => {
                    const current = stats.currentCounts[cat.id];
                    const prev = stats.prevCounts[cat.id];
                    const diff = current - prev;
                    const barWidth = stats.maxCount > 0 ? (current / stats.maxCount) * 100 : 0;
                    const rangeInfo = stats.range[cat.id];
                    const style = COLOR_DEFINITIONS[cat.id];
                    
                    let freqText = `0${t.perMonth}`;
                    if (rangeInfo.hasData) {
                        const startDate = new Date(rangeInfo.minVal);
                        const endDate = new Date(rangeInfo.maxVal);
                        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
                        const total = stats.totalCounts[cat.id];
                        const avg = Math.floor(total / Math.max(1, monthsDiff));
                        freqText = `${avg}${t.perMonth}`;
                    }

                    let diffColorClass = darkMode ? 'text-slate-500' : 'text-slate-400'; 
                    if (diff > 0) {
                        diffColorClass = darkMode ? 'text-emerald-400' : 'text-emerald-600';
                    } else if (diff < 0) {
                        diffColorClass = darkMode ? 'text-red-400' : 'text-red-600';
                    }

                    return (
                      <div key={cat.id} className={`flex-1 w-full p-3 rounded-2xl border ${darkMode ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-white/60'} shadow-sm flex items-center justify-between gap-4`}>
                         
                         <div className="flex flex-col justify-center items-start w-28 flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1">
                               <div className={`w-2 h-2 rounded-full ${darkMode ? style.dark : style.light}`}></div>
                               <span className={`font-bold text-xs ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{cat.defaultLabel}</span>
                            </div>
                            <span className={`text-4xl font-black leading-none tracking-tighter ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                               {current}
                            </span>
                            <span className={`text-[9px] font-medium mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.statsMonthCount}</span>
                         </div>

                         <div className="flex-1 flex flex-col justify-center gap-1.5">
                            <div className="flex justify-between items-end">
                               <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {t.statsFreq}: {freqText}
                               </span>
                               <span className={`text-[10px] font-bold ${diffColorClass}`}>
                                  {diff >= 0 ? (diff > 0 ? '▲' : '-') : '▼'} {Math.abs(diff)} {t.statsVsLast}
                               </span>
                            </div>
                            
                            <div className={`h-1.5 w-full rounded-full overflow-hidden relative ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                <div 
                                   className={`h-full rounded-full transition-all duration-500 ease-out ${darkMode ? style.dark : style.light}`}
                                   style={{ width: `${Math.max(barWidth, 2)}%` }} 
                                ></div>
                            </div>

                            <div className="flex justify-end items-center">
                                <span className={`text-[9px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                   {t.statsTotal}: {stats.totalCounts[cat.id]}
                                   {rangeInfo.hasData && <span className="opacity-70 ml-1">({rangeInfo.min} ~ {rangeInfo.max})</span>}
                                 </span>
                            </div>
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

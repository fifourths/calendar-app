import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Grid, LayoutGrid, BarChart2, 
  Plus, Trash2, Settings, Download, Upload, RotateCcw, 
  AlertCircle, ArrowRightLeft, Calendar as CalendarIcon, Moon, Sun, 
  Globe
} from 'lucide-react';

// --- Constants & Config ---

const INITIAL_COLORS = [
  { id: 'red',    tw: 'bg-red-300',    darkTw: 'dark:bg-red-400/80', border: 'border-red-300 dark:border-red-500/50',    text: 'text-red-500 dark:text-red-300',    defaultLabel: '重要' },
  { id: 'orange', tw: 'bg-orange-300', darkTw: 'dark:bg-orange-400/80', border: 'border-orange-300 dark:border-orange-500/50', text: 'text-orange-500 dark:text-orange-300', defaultLabel: '運動' },
  { id: 'yellow', tw: 'bg-yellow-300', darkTw: 'dark:bg-yellow-400/80', border: 'border-yellow-300 dark:border-yellow-500/50', text: 'text-yellow-600 dark:text-yellow-300', defaultLabel: '閱讀' },
  { id: 'green',  tw: 'bg-emerald-300', darkTw: 'dark:bg-emerald-400/80', border: 'border-emerald-300 dark:border-emerald-500/50', text: 'text-emerald-500 dark:text-emerald-300', defaultLabel: '健康' },
  { id: 'blue',   tw: 'bg-blue-300',   darkTw: 'dark:bg-blue-400/80',   border: 'border-blue-300 dark:border-blue-500/50',   text: 'text-blue-500 dark:text-blue-300',   defaultLabel: '工作' },
  { id: 'purple', tw: 'bg-purple-300', darkTw: 'dark:bg-purple-400/80', border: 'border-purple-300 dark:border-purple-500/50', text: 'text-purple-500 dark:text-purple-300', defaultLabel: '休閒' },
];

const WEEK_LABELS = {
  zh: ['一', '二', '三', '四', '五', '六', '日'],
  jp: ['月', '火', '水', '木', '金', '土', '日'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const DEFAULT_NOTES = [
  { id: 'def-0', text: '' },
  { id: 'def-1', text: '' },
  { id: 'def-2', text: '' },
];

// --- Helper Functions ---

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
};

const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getMonthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;

// --- Sub-Components ---

const CustomDatePicker = ({ currentYear, currentMonth, onClose, onSelect }) => {
  const [viewYear, setViewYear] = useState(currentYear);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border border-white/50 dark:border-slate-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 px-2">
          <button 
            onClick={() => setViewYear(viewYear - 1)}
            className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 transition-colors outline-none"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight font-sans">{viewYear}</span>
          <button 
            onClick={() => setViewYear(viewYear + 1)}
            className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 transition-colors outline-none"
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
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg scale-105' 
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-105'}
              `}
            >
              {i + 1}月
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ onClose, onReset, onExport, onImport, toggleLanguage, currentLang }) => {
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('menu'); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  if (mode === 'confirm_reset') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border border-red-100 dark:border-red-900/30" onClick={(e) => e.stopPropagation()}>
           <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-1">
                 <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">確定重置？</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                將清除本月所有打卡紀錄。<br/>此動作無法復原。
              </p>
           </div>
           
           <div className="flex gap-3">
              <button 
                onClick={() => setMode('menu')}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors outline-none"
              >
                取消
              </button>
              <button 
                onClick={onReset}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors outline-none shadow-lg shadow-red-200 dark:shadow-none"
              >
                確認重置
              </button>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border border-white/60 dark:border-slate-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 px-1">設定與資料</h3>
        
        <div className="space-y-3">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors outline-none group"
          >
            <div className="p-2 bg-white dark:bg-slate-600 rounded-xl text-slate-400 dark:text-slate-200 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors shadow-sm">
               <Globe size={18} />
            </div>
            {/* Updated Text Label */}
            <span className="text-sm font-medium flex-1 text-left">切換星期顯示語言</span>
            <span className="text-xs font-bold bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-md text-slate-500 dark:text-slate-300">{currentLang}</span>
          </button>

          {/* Export Image Removed as requested in v40, keeping data export */}
          {/* Removed export image button */}

          <button 
            onClick={onExport}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors outline-none group"
          >
            <div className="p-2 bg-white dark:bg-slate-600 rounded-xl text-slate-400 dark:text-slate-200 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors shadow-sm">
               <Download size={18} />
            </div>
            <span className="text-sm font-medium">匯出資料備份</span>
          </button>

          <button 
            onClick={() => fileInputRef.current.click()}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors outline-none group"
          >
             <div className="p-2 bg-white dark:bg-slate-600 rounded-xl text-slate-400 dark:text-slate-200 group-hover:text-green-500 dark:group-hover:text-green-300 transition-colors shadow-sm">
               <Upload size={18} />
             </div>
            <span className="text-sm font-medium">匯入資料</span>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>

          <button 
            onClick={() => setMode('confirm_reset')}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors outline-none group"
          >
             <div className="p-2 bg-white/80 dark:bg-slate-600 rounded-xl text-red-400 group-hover:text-red-600 transition-colors shadow-sm">
               <RotateCcw size={18} />
             </div>
            <span className="text-sm font-medium">重置本月紀錄</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Note Row Component ---
const NoteRow = ({ note, onChange, onDelete, isReordering, isSelected, onReorderSelect }) => {
  const inputRef = useRef(null);

  return (
    <div 
      className={`group flex items-end gap-2 relative transition-all duration-200 
        ${isReordering ? 'p-2 -mx-2 rounded-lg border border-transparent' : ''}
        ${isReordering && !isSelected ? 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-700' : ''}
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 ring-1 ring-blue-300 dark:ring-blue-700 z-10' : ''}
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
       <div className="h-full w-0.5 bg-slate-300 dark:bg-slate-600 absolute left-0 top-1 bottom-1 rounded-full group-focus-within:bg-slate-500 dark:group-focus-within:bg-slate-400 transition-colors"></div>
       <input 
         ref={inputRef}
         value={note.text}
         onChange={onChange}
         onTouchStart={(e) => !isReordering && e.stopPropagation()}
         className={`flex-1 text-sm text-slate-700 dark:text-slate-200 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-0 px-3 pb-2 transition-all outline-none ${isReordering ? 'pointer-events-none' : ''} placeholder:text-slate-300 dark:placeholder:text-slate-600`}
         placeholder={isReordering ? "點擊以交換順序" : "寫點什麼..."}
         readOnly={isReordering}
       />
       {!isReordering && (
         <button 
           onClick={(e) => {
             e.stopPropagation();
             onDelete();
           }}
           className="text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 outline-none"
         >
            <Trash2 size={14} />
         </button>
       )}
    </div>
  );
};


// --- Main Application ---

export default function NewCalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appTitle, setAppTitle] = useState('My Life Log');
  const [gridMode, setGridMode] = useState(4); 
  const [view, setView] = useState('calendar'); 
  const [langIndex, setLangIndex] = useState(0); 
  const [categories, setCategories] = useState(INITIAL_COLORS);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [records, setRecords] = useState({});
  const [weekNotes, setWeekNotes] = useState({});
  const [allFooterNotes, setAllFooterNotes] = useState({});
  
  const [selectedColor, setSelectedColor] = useState(INITIAL_COLORS[0].id);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  
  const [reorderMode, setReorderMode] = useState(null);
  const [swapSourceId, setSwapSourceId] = useState(null);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const load = (key, setter, defaultVal) => {
      const saved = localStorage.getItem(`calendar_app_v42_${key}`);
      if (saved) {
        try { setter(JSON.parse(saved)); } catch (e) { if(defaultVal) setter(defaultVal); }
      } else if (defaultVal) {
        setter(defaultVal);
      }
    };
    load('title', setAppTitle);
    load('gridMode', setGridMode);
    load('categories', setCategories, INITIAL_COLORS);
    load('records', setRecords);
    load('weekNotes', setWeekNotes);
    load('langIndex', setLangIndex);
    load('darkMode', setDarkMode, false);

    const savedNewNotes = localStorage.getItem('calendar_app_v42_allFooterNotes');
    if (savedNewNotes) {
      setAllFooterNotes(JSON.parse(savedNewNotes));
    } else {
      const savedOldNotes = localStorage.getItem('calendar_app_v42_footerNotes');
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
    localStorage.setItem('calendar_app_v42_title', JSON.stringify(appTitle));
    localStorage.setItem('calendar_app_v42_gridMode', JSON.stringify(gridMode));
    localStorage.setItem('calendar_app_v42_categories', JSON.stringify(categories));
    localStorage.setItem('calendar_app_v42_records', JSON.stringify(records));
    localStorage.setItem('calendar_app_v42_weekNotes', JSON.stringify(weekNotes));
    localStorage.setItem('calendar_app_v42_allFooterNotes', JSON.stringify(allFooterNotes));
    localStorage.setItem('calendar_app_v42_langIndex', JSON.stringify(langIndex));
    localStorage.setItem('calendar_app_v42_darkMode', JSON.stringify(darkMode));
  }, [appTitle, gridMode, categories, records, weekNotes, allFooterNotes, langIndex, darkMode]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const monthKey = getMonthKey(year, month);
  const today = new Date();
  const isToday = (d, m, y) => d === today.getDate() && m === today.getMonth() && y === today.getFullYear();

  const footerNotes = allFooterNotes[monthKey] || DEFAULT_NOTES;

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
    
    if (currentColor === selectedColor) {
      delete newRecord[subIndex]; 
    } else {
      newRecord[subIndex] = selectedColor; 
    }
    setRecords(prev => ({ ...prev, [dateKey]: newRecord }));
  };

  const updateCategoryLabel = (id, newLabel) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, defaultLabel: newLabel } : c));
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
    const data = {
      appTitle, gridMode, categories, records, weekNotes, allFooterNotes, langIndex,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
        if (data.weekNotes) setWeekNotes(data.weekNotes);
        if (data.allFooterNotes) setAllFooterNotes(data.allFooterNotes);
        else if (data.footerNotes) {
            const importKey = getMonthKey(new Date().getFullYear(), new Date().getMonth());
            setAllFooterNotes({ [importKey]: data.footerNotes });
        }
        if (data.langIndex !== undefined) setLangIndex(data.langIndex);
        setShowSettings(false);
      } catch (error) {
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

  const langKey = Object.keys(WEEK_LABELS)[langIndex];
  const currentWeekLabels = WEEK_LABELS[langKey];

  return (
    <>
    <style dangerouslySetInnerHTML={{__html: `
      * { -webkit-tap-highlight-color: transparent; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @media (hover: none) {
        .hover\\:bg-opacity-80:hover { background-opacity: 1; }
      }
      .shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both infinite; }
      @keyframes shake {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(1deg); }
        75% { transform: rotate(-1deg); }
        100% { transform: rotate(0deg); }
      }
    `}} />

    <div className={`flex justify-center px-1 font-sans selection:bg-slate-200 transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-700'} min-h-screen py-4`}>
      <div className={`w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col relative border border-white/60 dark:border-slate-800 transition-colors duration-300 h-auto min-h-[80vh] rounded-[40px]`}>
        
        {/* Modals */}
        {showDatePicker && <CustomDatePicker currentYear={year} currentMonth={month} onClose={() => setShowDatePicker(false)} onSelect={(y, m) => { setCurrentDate(new Date(y, m, 1)); setShowDatePicker(false); }} />}
        {showSettings && (
            <SettingsModal 
                onClose={() => setShowSettings(false)} 
                onReset={handleResetCurrentMonth} 
                onExport={handleExportData} 
                onImport={handleImportData} 
                toggleLanguage={toggleLanguage}
                currentLang={langKey.toUpperCase()}
            />
        )}
        
        {/* Reorder Hint */}
        {reorderMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in flex items-center gap-2">
             <ArrowRightLeft size={14} />
             <span>點擊項目以交換順序</span>
          </div>
        )}

        {/* Header Section */}
        <div className="pt-8 pb-2 px-5 flex justify-between items-start">
          <div className="flex flex-col items-start gap-0.5 flex-1">
            <input
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-800 dark:text-slate-100 placeholder-slate-300 w-full outline-none"
              placeholder="自定義標題"
            />
            
            <div className="flex items-center gap-2 mt-1">
                <div 
                  className="group cursor-pointer flex items-center outline-none"
                  onClick={() => setShowDatePicker(true)}
                >
                   <h2 className="text-lg font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                     {year}年 {month + 1}月
                   </h2>
                </div>
                
                {/* Today Button */}
                <button 
                  onClick={handleJumpToToday}
                  className="flex items-center gap-1 pl-2 pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  title="回到今天"
                >
                  <CalendarIcon size={14} />
                  <span className="text-[10px] font-bold">Today</span>
                </button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setGridMode(prev => prev === 4 ? 6 : 4)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 outline-none">
                {gridMode === 4 ? <LayoutGrid size={18} /> : <Grid size={18} />}
              </button>
              <button onClick={toggleDarkMode} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 outline-none">
                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView(view === 'calendar' ? 'stats' : 'calendar')} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 border outline-none ${view === 'stats' ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                <BarChart2 size={18} />
              </button>
              
              <button onClick={() => setShowSettings(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 outline-none">
                <Settings size={18} />
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
                          <div key={i} className="text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide py-2">{day}</div>
                        ))}
                     </div>
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
                            
                            const subCells = [];
                            const cellRecord = records[cell.dateKey] || {};
                            
                            for (let i = 0; i < gridMode; i++) {
                               const colorId = cellRecord[i];
                               const colorData = categories.find(c => c.id === colorId);
                               const twColor = colorData ? (darkMode ? colorData.darkTw : colorData.tw) : 'bg-transparent';

                               subCells.push(
                                 <div 
                                    key={i} 
                                    onClick={(e) => {
                                       if (!isCurrent) return;
                                       e.stopPropagation();
                                       handleCellClick(cell.dateKey, i);
                                    }}
                                    className={`
                                      relative w-full h-full cursor-pointer outline-none hoverable
                                      ${twColor} hover:opacity-80
                                    `}
                                 >
                                    <div className={`absolute inset-0 pointer-events-none border-slate-200 dark:border-slate-700/50
                                       ${gridMode === 4 && i === 0 ? 'border-r-[0.5px] border-b-[0.5px]' : ''}
                                       ${gridMode === 4 && i === 1 ? 'border-b-[0.5px]' : ''}
                                       ${gridMode === 4 && i === 2 ? 'border-r-[0.5px]' : ''}
                                       
                                       ${gridMode === 6 && (i === 0 || i === 1) ? 'border-r-[0.5px] border-b-[0.5px]' : ''}
                                       ${gridMode === 6 && i === 2 ? 'border-b-[0.5px]' : ''}
                                       ${gridMode === 6 && (i === 3 || i === 4) ? 'border-r-[0.5px]' : ''}
                                    `}></div>
                                 </div>
                               );
                            }

                            return (
                              <div key={dayIndex} 
                                   className={`
                                     relative rounded-lg overflow-hidden flex flex-col h-20 transition-colors
                                     ${isCurrent ? 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600' : 'bg-white/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 opacity-40'}
                                   `}>
                                 <div className={`flex-1 grid ${gridMode === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'}`}>
                                    {subCells}
                                 </div>
                                 <div className="absolute bottom-[3px] right-[3px] pointer-events-none z-10">
                                   <span className={`
                                     text-[9px] font-bold leading-none flex items-center justify-center w-4 h-4 rounded-full transition-all
                                     ${isTodayDate 
                                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                                        : 'text-slate-500 dark:text-slate-400'}
                                   `}>
                                     {cell.day}
                                   </span>
                                 </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="w-8 flex flex-col items-center justify-center">
                           <input 
                              type="text"
                              value={weekNotes[`${year}-${month}-W${weekIndex}`] || ''}
                              onChange={(e) => setWeekNotes({...weekNotes, [`${year}-${month}-W${weekIndex}`]: e.target.value})}
                              placeholder={`W${weekIndex + 1}`}
                              className="w-full h-full text-center text-[10px] text-slate-400 dark:text-slate-500 placeholder-slate-200 dark:placeholder-slate-700 bg-transparent border-none focus:ring-0 p-0 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors outline-none"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Color Palette */}
              <div className="mt-6 px-1">
                 <div className="flex items-center justify-start gap-2 mb-3">
                    <h3 className="text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">Categories</h3>
                    <button 
                      onClick={() => toggleReorderMode('color')}
                      className={`p-1.5 rounded-full transition-colors ${reorderMode === 'color' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-500 dark:hover:text-slate-300'}`}
                    >
                      <ArrowRightLeft size={14} />
                    </button>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <div 
                        key={cat.id} 
                        onClick={() => reorderMode === 'color' ? handleItemSwap(cat.id, 'color') : setSelectedColor(cat.id)}
                        className={`
                           flex items-center gap-3 p-2 rounded-2xl border transition-all cursor-pointer outline-none select-none relative
                           ${reorderMode === 'color' ? 'border-dashed border-blue-200 dark:border-blue-800' : ''}
                           ${swapSourceId === cat.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-700' : ''}
                           ${!reorderMode && selectedColor === cat.id ? 'border-slate-800 dark:border-slate-100 bg-white dark:bg-slate-800 shadow-md transform scale-[1.02]' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}
                        `}
                      >
                         <div className={`w-6 h-6 rounded-full ${darkMode ? cat.darkTw : cat.tw} flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10 shadow-inner`}></div>
                         
                         {editingCategoryId === cat.id && !reorderMode ? (
                           <input 
                             autoFocus
                             value={cat.defaultLabel}
                             onChange={(e) => updateCategoryLabel(cat.id, e.target.value)}
                             onBlur={() => setEditingCategoryId(null)}
                             onKeyDown={(e) => e.key === 'Enter' && setEditingCategoryId(null)}
                             onClick={(e) => e.stopPropagation()} 
                             className="w-full text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border-b border-blue-500 focus:ring-0 p-0 font-medium outline-none"
                           />
                         ) : (
                           <span 
                             onDoubleClick={(e) => {
                               if(!reorderMode) {
                                 e.stopPropagation();
                                 setEditingCategoryId(cat.id);
                               }
                             }}
                             className={`w-full text-xs text-slate-600 dark:text-slate-300 font-medium truncate ${reorderMode ? 'pointer-events-none' : ''}`}
                             title="雙擊編輯"
                           >
                             {cat.defaultLabel}
                           </span>
                         )}
                      </div>
                    ))}
                 </div>
              </div>

              {/* Footer Notes */}
              <div className="mt-8 mb-4 px-1">
                 <div className="flex justify-between items-end mb-2">
                   <div className="flex items-center gap-2">
                      <h3 className="text-[10px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">Memo ({month + 1}月)</h3>
                      <button 
                        onClick={() => toggleReorderMode('note')}
                        className={`p-1.5 rounded-full transition-colors ${reorderMode === 'note' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-500 dark:hover:text-slate-300'}`}
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                   </div>
                   <button onClick={handleAddNote} className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 p-1 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors outline-none">
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
                      />
                    ))}
                 </div>
              </div>
            </>
          ) : (
            // --- Statistics View ---
            <div className="h-full flex flex-col justify-center pb-8 animate-in fade-in zoom-in duration-300 px-3">
               <div className="space-y-4">
                 {categories.map((cat) => {
                    const current = stats.currentCounts[cat.id];
                    const prev = stats.prevCounts[cat.id];
                    const diff = current - prev;
                    const barWidth = stats.maxCount > 0 ? (current / stats.maxCount) * 100 : 0;
                    const rangeInfo = stats.range[cat.id];
                    
                    let freqText = "0.0 / m";
                    if (rangeInfo.hasData) {
                        const startDate = new Date(rangeInfo.minVal);
                        const endDate = new Date(rangeInfo.maxVal);
                        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
                        const total = stats.totalCounts[cat.id];
                        const avg = total / Math.max(1, monthsDiff);
                        freqText = `${avg.toFixed(1)} / m`;
                    }

                    return (
                      <div key={cat.id} className="w-full">
                         <div className="flex justify-between items-end mb-1.5">
                            <div className="flex items-center gap-2">
                               <div className={`w-3 h-3 rounded-full ${darkMode ? cat.darkTw : cat.tw}`}></div>
                               <span className="font-bold text-xs text-slate-600 dark:text-slate-300">{cat.defaultLabel}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-none">{current}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">/ {stats.totalCounts[cat.id]}</span>
                                </div>
                                <span className="text-[8px] text-slate-600 dark:text-slate-300 font-bold mt-0.5">
                                    Avg: {freqText}
                                </span>
                            </div>
                         </div>
                         
                         <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                            <div 
                               className={`h-full rounded-full ${darkMode ? cat.darkTw : cat.tw} transition-all duration-500 ease-out`}
                               style={{ width: `${Math.max(barWidth, 2)}%` }} 
                            ></div>
                         </div>

                         <div className="mt-1 flex justify-end">
                            <span className={`text-[9px] font-bold ${diff >= 0 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                               {diff >= 0 ? '+' : ''}{diff} <span className="font-normal text-slate-400 dark:text-slate-500">vs last month</span>
                            </span>
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

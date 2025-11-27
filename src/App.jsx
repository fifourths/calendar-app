import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Grid, LayoutGrid, BarChart2, Plus, Trash2, Settings, Download, Upload, RotateCcw, AlertCircle } from 'lucide-react';

// --- Constants & Config ---

const COLORS = [
  { id: 'red',    tw: 'bg-red-300',    border: 'border-red-300',    text: 'text-red-500',    defaultLabel: '重要' },
  { id: 'orange', tw: 'bg-orange-300', border: 'border-orange-300', text: 'text-orange-500', defaultLabel: '運動' },
  { id: 'yellow', tw: 'bg-yellow-300', border: 'border-yellow-300', text: 'text-yellow-600', defaultLabel: '閱讀' },
  { id: 'green',  tw: 'bg-emerald-300', border: 'border-emerald-300', text: 'text-emerald-500', defaultLabel: '健康' },
  { id: 'blue',   tw: 'bg-blue-300',   border: 'border-blue-300',   text: 'text-blue-500',   defaultLabel: '工作' },
  { id: 'purple', tw: 'bg-purple-300', border: 'border-purple-300', text: 'text-purple-500', defaultLabel: '休閒' },
];

const WEEK_LABELS = {
  zh: ['一', '二', '三', '四', '五', '六', '日'],
  jp: ['月', '火', '水', '木', '金', '土', '日'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

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

// 1. Custom Date Picker Modal
const CustomDatePicker = ({ currentYear, currentMonth, onClose, onSelect }) => {
  const [viewYear, setViewYear] = useState(currentYear);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 px-2">
          <button 
            onClick={() => setViewYear(viewYear - 1)}
            className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors outline-none"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xl font-bold text-slate-800 tracking-tight font-mono">{viewYear}</span>
          <button 
            onClick={() => setViewYear(viewYear + 1)}
            className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors outline-none"
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
                py-3 rounded-2xl text-sm font-bold transition-all duration-200 outline-none
                ${viewYear === currentYear && i === currentMonth 
                  ? 'bg-slate-800 text-white shadow-lg scale-105' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:scale-105'}
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Settings Modal
const SettingsModal = ({ onClose, onReset, onExport, onImport }) => {
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
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-white rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border border-red-100" onClick={(e) => e.stopPropagation()}>
           <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-1">
                 <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">確定重置？</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                將清除本月所有打卡紀錄。<br/>此動作無法復原。
              </p>
           </div>
           
           <div className="flex gap-3">
              <button 
                onClick={() => setMode('menu')}
                className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors outline-none"
              >
                取消
              </button>
              <button 
                onClick={onReset}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors outline-none shadow-lg shadow-red-200"
              >
                確認重置
              </button>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-[32px] p-6 shadow-2xl w-72 transform transition-all scale-100 border border-white/60" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-800 mb-6 px-1">設定與資料</h3>
        
        <div className="space-y-3">
          <button 
            onClick={onExport}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors outline-none group"
          >
            <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
               <Download size={18} />
            </div>
            <span className="text-sm font-medium">匯出資料備份</span>
          </button>

          <button 
            onClick={() => fileInputRef.current.click()}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors outline-none group"
          >
             <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-green-500 transition-colors shadow-sm">
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

          <div className="h-px bg-slate-100 my-2"></div>

          <button 
            onClick={() => setMode('confirm_reset')}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors outline-none group"
          >
             <div className="p-2 bg-white/80 rounded-xl text-red-400 group-hover:text-red-600 transition-colors shadow-sm">
               <RotateCcw size={18} />
             </div>
            <span className="text-sm font-medium">重置本月紀錄</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Application ---

export default function NewCalendarApp() {
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appTitle, setAppTitle] = useState('My Life Log');
  const [gridMode, setGridMode] = useState(4); 
  const [view, setView] = useState('calendar'); 
  const [langIndex, setLangIndex] = useState(0); 
  const [categories, setCategories] = useState(COLORS);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Data State
  const [records, setRecords] = useState({});
  const [weekNotes, setWeekNotes] = useState({});
  const [footerNotes, setFooterNotes] = useState([{ id: 1, text: '' }, { id: 2, text: '' }, { id: 3, text: '' }]);
  
  const [selectedColor, setSelectedColor] = useState(COLORS[0].id);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Persistence
  useEffect(() => {
    const load = (key, setter) => {
      const saved = localStorage.getItem(`calendar_app_v9_${key}`);
      if (saved) setter(JSON.parse(saved));
    };
    load('title', setAppTitle);
    load('gridMode', setGridMode);
    load('categories', setCategories);
    load('records', setRecords);
    load('weekNotes', setWeekNotes);
    load('footerNotes', setFooterNotes);
    load('langIndex', setLangIndex);
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar_app_v9_title', JSON.stringify(appTitle));
    localStorage.setItem('calendar_app_v9_gridMode', JSON.stringify(gridMode));
    localStorage.setItem('calendar_app_v9_categories', JSON.stringify(categories));
    localStorage.setItem('calendar_app_v9_records', JSON.stringify(records));
    localStorage.setItem('calendar_app_v9_weekNotes', JSON.stringify(weekNotes));
    localStorage.setItem('calendar_app_v9_footerNotes', JSON.stringify(footerNotes));
    localStorage.setItem('calendar_app_v9_langIndex', JSON.stringify(langIndex));
  }, [appTitle, gridMode, categories, records, weekNotes, footerNotes, langIndex]);

  // Derived Values
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const today = new Date();
  const isToday = (d, m, y) => d === today.getDate() && m === today.getMonth() && y === today.getFullYear();

  // --- Handlers ---

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNextMonth();
    if (distance < -50) handlePrevMonth();
  };

  const toggleLanguage = () => setLangIndex((prev) => (prev + 1) % 3);

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

  // --- Reset & Data Handlers ---

  const handleResetCurrentMonth = () => {
     const newRecords = { ...records };
     const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
     
     Object.keys(newRecords).forEach(key => {
       if (key.startsWith(currentMonthPrefix)) {
         delete newRecords[key];
       }
     });
     
     setRecords(newRecords);
     setShowSettings(false);
     setView('calendar');
  };

  const handleExportData = () => {
    const data = {
      appTitle,
      gridMode,
      categories,
      records,
      weekNotes,
      footerNotes,
      langIndex,
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
        if (data.footerNotes) setFooterNotes(data.footerNotes);
        if (data.langIndex !== undefined) setLangIndex(data.langIndex);
        
        setShowSettings(false);
      } catch (error) {
        console.error("Import failed:", error);
        setShowSettings(false);
      }
    };
    reader.readAsText(file);
  };

  // --- Grid Construction ---
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

  // Stats Logic
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
    return { 
      currentCounts: calcCounts(currentMonthKey), 
      prevCounts: calcCounts(prevMonthKey), 
      totalCounts: calcCounts(null) 
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
    `}} />

    <div className="min-h-screen bg-slate-50 flex justify-center py-4 px-1 font-sans text-slate-700 selection:bg-slate-200">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border border-white/60">
        
        {/* Modals */}
        {showDatePicker && (
          <CustomDatePicker 
            currentYear={year} 
            currentMonth={month}
            onClose={() => setShowDatePicker(false)}
            onSelect={(y, m) => {
              setCurrentDate(new Date(y, m, 1));
              setShowDatePicker(false);
            }}
          />
        )}

        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)}
            onReset={handleResetCurrentMonth}
            onExport={handleExportData}
            onImport={handleImportData}
          />
        )}

        {/* Header Section */}
        <div className="pt-8 pb-2 px-5 flex justify-between items-start">
          {/* Left: Title & Date */}
          <div className="flex flex-col items-start gap-0.5 flex-1">
            <input
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-800 placeholder-slate-300 w-full outline-none"
              placeholder="自定義標題"
            />
            <div 
              className="group cursor-pointer flex items-center py-1 outline-none"
              onClick={() => setShowDatePicker(true)}
            >
               <h2 className="text-lg font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                 {year}年 {month + 1}月
               </h2>
            </div>
          </div>

          {/* Right: Icons (Optimized Layout 2x2) */}
          <div className="flex flex-col items-end gap-2">
            {/* Row 1: Grid & Language */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setGridMode(prev => prev === 4 ? 6 : 4)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200 outline-none"
                title="切換網格"
              >
                {gridMode === 4 ? <LayoutGrid size={18} /> : <Grid size={18} />}
              </button>

              <button 
                onClick={toggleLanguage}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200 outline-none"
                title="切換語言"
              >
                 {langKey.toUpperCase()}
              </button>
            </div>

            {/* Row 2: Stats & Settings */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setView(view === 'calendar' ? 'stats' : 'calendar')}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 border outline-none ${view === 'stats' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600 hover:border-slate-200'}`}
                title="統計圖表"
              >
                <BarChart2 size={18} />
              </button>

              <button 
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200 outline-none"
                title="資料設定"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-2 pb-6 no-scrollbar scroll-smooth outline-none"
             onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          
          {view === 'calendar' ? (
            <>
              {/* Calendar Header (Days) */}
              <div className="grid grid-cols-[1fr_auto] gap-1 mb-1">
                 <div className="grid grid-cols-7 gap-1">
                    {currentWeekLabels.map((day, i) => (
                      <div key={i} className="text-center text-[11px] font-bold text-slate-300 uppercase tracking-wide py-2">
                        {day}
                      </div>
                    ))}
                 </div>
                 <div className="w-8"></div>
              </div>

              {/* Calendar Grid */}
              <div className="flex flex-col gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex gap-1">
                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1 flex-1">
                      {week.map((cell, dayIndex) => {
                        if (cell.type === 'empty') return <div key={dayIndex} className="aspect-square" />;
                        
                        const isCurrent = cell.type === 'current';
                        const isTodayDate = isCurrent && isToday(cell.day, month, year);
                        
                        const subCells = [];
                        const cellRecord = records[cell.dateKey] || {};
                        
                        for (let i = 0; i < gridMode; i++) {
                           const colorId = cellRecord[i];
                           const colorData = categories.find(c => c.id === colorId);
                           
                           subCells.push(
                             <div 
                                key={i} 
                                onClick={(e) => {
                                   if (!isCurrent) return;
                                   e.stopPropagation();
                                   handleCellClick(cell.dateKey, i);
                                }}
                                className={`
                                  relative w-full h-full cursor-pointer outline-none
                                  ${colorData ? colorData.tw : 'bg-transparent'}
                                  hover:bg-opacity-80
                                `}
                             >
                                <div className={`absolute inset-0 pointer-events-none border-slate-100
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
                                 aspect-square relative rounded-lg overflow-hidden flex flex-col bg-white
                                 ${isCurrent ? 'border border-slate-100' : 'border border-slate-50 opacity-30'}
                               `}>
                             <div className={`flex-1 grid ${gridMode === 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'}`}>
                                {subCells}
                             </div>
                             <div className="absolute bottom-[3px] right-[3px] pointer-events-none z-10">
                               <span className={`
                                 text-[9px] font-bold leading-none flex items-center justify-center w-4 h-4 rounded-full transition-all
                                 ${isTodayDate 
                                    ? 'border border-slate-800 text-slate-800'
                                    : 'text-slate-400'}
                               `}>
                                 {cell.day}
                               </span>
                             </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Week Note */}
                    <div className="w-8 flex flex-col items-center justify-center">
                       <input 
                          type="text"
                          value={weekNotes[`${year}-${month}-W${weekIndex}`] || ''}
                          onChange={(e) => setWeekNotes({...weekNotes, [`${year}-${month}-W${weekIndex}`]: e.target.value})}
                          placeholder={`W${weekIndex + 1}`}
                          className="w-full h-full text-center text-[10px] text-slate-400 placeholder-slate-200 bg-transparent border-none focus:ring-0 p-0 rounded hover:bg-slate-50 transition-colors outline-none"
                       />
                    </div>
                  </div>
                ))}
              </div>

              {/* Color Palette (Double Click) */}
              <div className="mt-6 px-1">
                 <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3">Categories (Double click to edit)</h3>
                 <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <div 
                        key={cat.id} 
                        onClick={() => setSelectedColor(cat.id)}
                        className={`
                           flex items-center gap-3 p-2 rounded-2xl border transition-all cursor-pointer outline-none select-none
                           ${selectedColor === cat.id ? 'border-slate-800 bg-white shadow-md transform scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300'}
                        `}
                      >
                         <div className={`w-6 h-6 rounded-full ${cat.tw} flex-shrink-0 ring-1 ring-black/5 shadow-inner`}></div>
                         
                         {editingCategoryId === cat.id ? (
                           <input 
                             autoFocus
                             value={cat.defaultLabel}
                             onChange={(e) => updateCategoryLabel(cat.id, e.target.value)}
                             onBlur={() => setEditingCategoryId(null)}
                             onKeyDown={(e) => e.key === 'Enter' && setEditingCategoryId(null)}
                             onClick={(e) => e.stopPropagation()}
                             className="w-full text-xs text-slate-800 bg-white border-b border-blue-500 focus:ring-0 p-0 font-medium outline-none"
                           />
                         ) : (
                           <span 
                             onDoubleClick={(e) => {
                               e.stopPropagation();
                               setEditingCategoryId(cat.id);
                             }}
                             className="w-full text-xs text-slate-600 font-medium truncate"
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
                   <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Memo</h3>
                   <button onClick={() => setFooterNotes([...footerNotes, {id: Date.now(), text: ''}])} className="text-slate-400 hover:text-slate-800 p-1 bg-slate-100 rounded-full transition-colors outline-none">
                     <Plus size={12} />
                   </button>
                 </div>
                 <div className="space-y-4">
                    {footerNotes.map((note, idx) => (
                      <div key={note.id} className="group flex items-end gap-2 relative">
                         <div className="h-full w-0.5 bg-slate-100 absolute left-0 top-1 bottom-1 rounded-full group-focus-within:bg-slate-300 transition-colors"></div>
                         <input 
                           value={note.text}
                           onChange={(e) => {
                             const newNotes = [...footerNotes];
                             newNotes[idx].text = e.target.value;
                             setFooterNotes(newNotes);
                           }}
                           className="flex-1 text-sm text-slate-600 bg-transparent border-b border-slate-100 focus:border-slate-300 focus:ring-0 px-3 pb-2 transition-all outline-none"
                           placeholder="寫點什麼..."
                         />
                         <button 
                           onClick={() => setFooterNotes(footerNotes.filter(n => n.id !== note.id))}
                           className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 outline-none"
                         >
                            <Trash2 size={14} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            </>
          ) : (
            // --- Statistics View (Redesigned Style) ---
            <div className="h-full flex flex-col justify-center pb-8 animate-in fade-in zoom-in duration-300">
               <div className="grid grid-cols-2 gap-4 px-2">
                 {categories.map((cat) => {
                    const current = stats.currentCounts[cat.id];
                    const prev = stats.prevCounts[cat.id];
                    const diff = current - prev;
                    
                    return (
                      <div key={cat.id} className={`bg-white rounded-[24px] p-4 border-2 ${cat.border} flex flex-col justify-between h-28 relative overflow-hidden transition-all hover:scale-[1.02]`}>
                         {/* Header: Label + Dot */}
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">{cat.defaultLabel}</span>
                            <div className={`w-2 h-2 rounded-full ${cat.tw}`}></div>
                         </div>
                         
                         {/* Body: Big Number */}
                         <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-bold text-slate-800 tracking-tighter leading-none">{current}</span>
                         </div>

                         {/* Footer: Trend Pill */}
                         <div className="flex justify-between items-end mt-2">
                            <span className="text-[9px] text-slate-300 font-medium">All: {stats.totalCounts[cat.id]}</span>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${cat.tw} bg-opacity-20`}>
                                <span className={`text-[10px] font-bold ${diff > 0 ? 'text-slate-700' : 'text-slate-500'}`}>
                                   {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)}
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

import React, { useState, useEffect, useRef } from 'react';
import {
  Grid3X3,
  LayoutGrid,
  BarChart2,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Settings,
  Plus,
  Trash2,
  X,
  Download,
  Upload,
} from 'lucide-react';

// --- 工具函數 ---

const generateCalendarDays = (year, month) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 調整為週一開始 (0 是週日, 1 是週一)
  let startDay = firstDayOfMonth.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  const days = [];

  // 上個月的填充日期
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < startDay; i++) {
    days.push({
      day: prevMonthDays - startDay + 1 + i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // 當月日期
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // 下個月填充日期 (補滿 42 格)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  return days;
};

// --- 常數設定 ---

const WEEKDAY_LANGS = {
  zh: ['一', '二', '三', '四', '五', '六', '日'],
  jp: ['月', '火', '水', '木', '金', '土', '日'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const DEFAULT_COLORS = [
  { id: 'c1', hex: '#FCA5A5', darkHex: '#7F1D1D', label: '工作' },
  { id: 'c2', hex: '#FDBA74', darkHex: '#7C2D12', label: '運動' },
  { id: 'c3', hex: '#FDE047', darkHex: '#713F12', label: '閱讀' },
  { id: 'c4', hex: '#86EFAC', darkHex: '#14532D', label: '休息' },
  { id: 'c5', hex: '#93C5FD', darkHex: '#1E3A8A', label: '社交' },
  { id: 'c6', hex: '#D8B4FE', darkHex: '#581C87', label: '其他' },
];

// --- 主組件 ---

export default function CalendarApp() {
  // 狀態管理
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appTitle, setAppTitle] = useState('我的月曆紀錄');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [gridMode, setGridMode] = useState(4);
  const [viewMode, setViewMode] = useState('calendar');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [weekdayLang, setWeekdayLang] = useState('zh');
  const [showSettings, setShowSettings] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // 資料儲存狀態
  const [calendarData, setCalendarData] = useState({});
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [weeklyNotes, setWeeklyNotes] = useState({});
  const [bottomNotes, setBottomNotes] = useState(['', '', '']);

  // 觸控處理參考
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 初始載入
  useEffect(() => {
    const savedData = localStorage.getItem('calendarAppData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAppTitle(parsed.appTitle || '我的月曆紀錄');
        setGridMode(parsed.gridMode || 4);
        setIsDarkMode(parsed.isDarkMode || false);
        setCalendarData(parsed.calendarData || {});
        setColors(parsed.colors || DEFAULT_COLORS);
        setWeeklyNotes(parsed.weeklyNotes || {});
        setBottomNotes(parsed.bottomNotes || ['', '', '']);
        setWeekdayLang(parsed.weekdayLang || 'zh');
      } catch (e) {
        console.error('Data load error', e);
      }
    }
  }, []);

  // 資料變動自動儲存
  useEffect(() => {
    const dataToSave = {
      appTitle,
      gridMode,
      isDarkMode,
      calendarData,
      colors,
      weeklyNotes,
      bottomNotes,
      weekdayLang,
    };
    localStorage.setItem('calendarAppData', JSON.stringify(dataToSave));
  }, [
    appTitle,
    gridMode,
    isDarkMode,
    calendarData,
    colors,
    weeklyNotes,
    bottomNotes,
    weekdayLang,
  ]);

  // 邏輯處理
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleSwipe = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distanceX = touchStartRef.current.x - touchEndRef.current.x;
    const distanceY = touchStartRef.current.y - touchEndRef.current.y;

    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY) * 2;
    const isBigEnough = Math.abs(distanceX) > 100;

    if (isHorizontalSwipe && isBigEnough) {
      if (distanceX > 0) handleNextMonth();
      else handlePrevMonth();
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const cycleLanguage = () => {
    const order = ['zh', 'jp', 'en'];
    const currentIndex = order.indexOf(weekdayLang);
    setWeekdayLang(order[(currentIndex + 1) % order.length]);
  };

  const handleCellClick = (dayObj, slotIndex) => {
    const dateKey = `${dayObj.year}-${dayObj.month}-${dayObj.day}`;
    setCalendarData((prev) => {
      const dayData = prev[dateKey] || {};
      const currentColorIdx = dayData[slotIndex];
      const newDayData = { ...dayData };
      if (currentColorIdx === selectedColorIdx) {
        delete newDayData[slotIndex];
      } else {
        newDayData[slotIndex] = selectedColorIdx;
      }
      return { ...prev, [dateKey]: newDayData };
    });
  };

  const handleConfirmReset = () => {
    setCalendarData({});
    setWeeklyNotes({});
    setBottomNotes(['', '', '']);
    setShowResetConfirm(false);
    setShowSettings(false);
    setViewMode('calendar');
  };

  // --- 匯出 / 匯入 邏輯 ---
  const handleExport = () => {
    const dataToExport = {
      appTitle,
      gridMode,
      isDarkMode,
      calendarData,
      colors,
      weeklyNotes,
      bottomNotes,
      weekdayLang,
      backupDate: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.download = `calendar_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleImportTrigger = () => fileInputRef.current.click();

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!importedData.colors || !importedData.calendarData)
          throw new Error('Invalid backup file format');
        if (window.confirm('匯入將會覆蓋您目前的紀錄，確定要繼續嗎？')) {
          setAppTitle(importedData.appTitle || appTitle);
          setGridMode(importedData.gridMode || gridMode);
          setIsDarkMode(
            importedData.isDarkMode !== undefined
              ? importedData.isDarkMode
              : isDarkMode
          );
          setCalendarData(importedData.calendarData || {});
          setColors(importedData.colors || DEFAULT_COLORS);
          setWeeklyNotes(importedData.weeklyNotes || {});
          setBottomNotes(importedData.bottomNotes || ['', '', '']);
          setWeekdayLang(importedData.weekdayLang || weekdayLang);
          setShowSettings(false);
          setViewMode('calendar');
        }
      } catch (error) {
        alert('匯入失敗：檔案格式錯誤或損毀。');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  // 渲染輔助
  const days = generateCalendarDays(year, month);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // 統計計算
  const getStats = () => {
    let totalClicks = 0;
    const colorCounts = new Array(6).fill(0);
    const monthlyCounts = new Array(6).fill(0);
    const lastMonthCounts = new Array(6).fill(0);

    const prevDate = new Date(year, month - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();

    Object.keys(calendarData).forEach((dateKey) => {
      const [dYear, dMonth] = dateKey.split('-').map(Number);
      const dayData = calendarData[dateKey];
      Object.values(dayData).forEach((colorIdx) => {
        if (colorIdx >= 0 && colorIdx < 6) {
          totalClicks++;
          colorCounts[colorIdx]++;
          if (dYear === year && dMonth === month) monthlyCounts[colorIdx]++;
          if (dYear === prevYear && dMonth === prevMonth)
            lastMonthCounts[colorIdx]++;
        }
      });
    });
    return { totalClicks, colorCounts, monthlyCounts, lastMonthCounts };
  };

  const stats = getStats();
  const getColor = (idx) =>
    isDarkMode ? colors[idx].darkHex : colors[idx].hex;
  const getLabel = (idx) => colors[idx].label;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 font-sans select-none overflow-x-hidden
        ${
          isDarkMode
            ? 'bg-slate-900 text-slate-100'
            : 'bg-gray-50 text-slate-800'
        }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleSwipe}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 relative">
        {/* 標題與導航區 */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col items-start space-y-1">
            {viewMode === 'calendar' ? (
              isEditingTitle ? (
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  autoFocus
                  className={`text-xl font-bold bg-transparent border-b-2 outline-none w-48
                    ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xl font-bold cursor-pointer hover:opacity-70 transition-opacity"
                >
                  {appTitle}
                </h1>
              )
            ) : (
              <h1 className="text-xl font-bold">統計數據</h1>
            )}

            <div
              onClick={() => setShowDatePicker(true)}
              className={`text-base font-medium tracking-wide cursor-pointer hover:opacity-70 transition-opacity
                 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              {year}年 {month + 1}月
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGridMode(gridMode === 4 ? 6 : 4)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              {gridMode === 4 ? (
                <LayoutGrid size={18} />
              ) : (
                <Grid3X3 size={18} />
              )}
            </button>
            <button
              onClick={() =>
                setViewMode(viewMode === 'calendar' ? 'stats' : 'calendar')
              }
              className={`p-2 rounded-full transition ${
                viewMode === 'stats' ? 'text-blue-500' : ''
              } hover:bg-black/5 dark:hover:bg-white/10`}
            >
              {viewMode === 'calendar' ? (
                <BarChart2 size={18} />
              ) : (
                <CalendarIcon size={18} />
              )}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* 主要內容區 */}
        <div className="flex-grow flex flex-col">
          {viewMode === 'calendar' ? (
            /* ================= 月曆模式 ================= */
            <>
              {/* 星期列 */}
              <div className="flex mb-1 pr-[10%]">
                {WEEKDAY_LANGS[weekdayLang].map((day, i) => (
                  <div
                    key={i}
                    onClick={cycleLanguage}
                    className={`flex-1 text-center text-[10px] py-1 cursor-pointer select-none font-medium
                      ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 月曆表格 */}
              <div className="flex flex-col w-full">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex w-full h-14 md:h-16">
                    <div
                      className={`flex flex-1 border-b border-l border-r border-opacity-50 overflow-hidden
                         ${wIndex === 0 ? 'border-t rounded-t-lg' : ''}
                         ${wIndex === weeks.length - 1 ? 'rounded-b-lg' : ''}`}
                      style={{
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      }}
                    >
                      {week.map((dayObj, dIndex) => {
                        const isToday =
                          dayObj.day === today.getDate() &&
                          dayObj.month === today.getMonth() &&
                          dayObj.year === today.getFullYear();
                        const dateKey = `${dayObj.year}-${dayObj.month}-${dayObj.day}`;
                        const cellData = calendarData[dateKey] || {};

                        const slots = Array.from({ length: gridMode }).map(
                          (_, sIdx) => {
                            const colorIdx = cellData[sIdx];
                            const bgColor =
                              colorIdx !== undefined
                                ? getColor(colorIdx)
                                : 'transparent';
                            return (
                              <div
                                key={sIdx}
                                onClick={() => handleCellClick(dayObj, sIdx)}
                                className={`w-full h-full cursor-pointer transition-colors duration-200 border-opacity-30
                                  ${
                                    isDarkMode
                                      ? 'border-slate-700'
                                      : 'border-gray-200'
                                  }`}
                                style={{
                                  backgroundColor: bgColor,
                                  borderRightWidth:
                                    sIdx % 2 === 0 ? '1px' : '0px',
                                  borderBottomWidth:
                                    sIdx < gridMode - 2 ? '1px' : '0px',
                                }}
                              />
                            );
                          }
                        );

                        return (
                          <div
                            key={dIndex}
                            className={`relative flex-1 border-r border-opacity-50 last:border-r-0
                                ${
                                  isDarkMode
                                    ? 'border-slate-700 bg-slate-900'
                                    : 'border-gray-200 bg-white'
                                }`}
                            style={{
                              opacity: dayObj.isCurrentMonth ? 1 : 0.4,
                            }}
                          >
                            <div
                              className={`grid w-full h-full ${
                                gridMode === 6 ? 'grid-rows-3' : 'grid-rows-2'
                              } grid-cols-2`}
                            >
                              {slots}
                            </div>
                            <div className="absolute bottom-0.5 right-0.5 pointer-events-none">
                              <span
                                className={`text-[10px] font-semibold flex items-center justify-center w-4 h-4 rounded-full
                                    ${
                                      isToday
                                        ? isDarkMode
                                          ? 'border border-white text-white'
                                          : 'border border-gray-800 text-gray-800'
                                        : isDarkMode
                                        ? 'text-slate-400'
                                        : 'text-slate-500'
                                    }`}
                              >
                                {dayObj.day}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className={`w-[10%] flex items-center justify-center`}>
                      <input
                        type="text"
                        placeholder={`W${wIndex + 1}`}
                        value={weeklyNotes[`${year}-${month}-${wIndex}`] || ''}
                        onChange={(e) =>
                          setWeeklyNotes({
                            ...weeklyNotes,
                            [`${year}-${month}-${wIndex}`]: e.target.value,
                          })
                        }
                        className={`w-full h-full text-center bg-transparent outline-none text-[10px]
                            placeholder:text-opacity-30
                            ${
                              isDarkMode
                                ? 'text-slate-400 placeholder:text-slate-600'
                                : 'text-slate-500 placeholder:text-slate-300'
                            }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 顏色選擇區 */}
              <div className="mt-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
                  {colors.map((color, idx) => (
                    <div key={color.id} className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`w-6 h-6 rounded shrink-0 shadow-sm transition-transform active:scale-95 border-2
                             ${
                               selectedColorIdx === idx
                                 ? isDarkMode
                                   ? 'border-white'
                                   : 'border-gray-800'
                                 : 'border-transparent'
                             }`}
                        style={{
                          backgroundColor: isDarkMode
                            ? color.darkHex
                            : color.hex,
                        }}
                      />
                      <input
                        type="text"
                        value={color.label}
                        onChange={(e) => {
                          const newColors = [...colors];
                          newColors[idx].label = e.target.value;
                          setColors(newColors);
                        }}
                        className={`flex-1 min-w-0 text-xs bg-transparent border-b border-transparent focus:border-gray-400 outline-none
                            ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ================= 統計模式 ================= */
            /* 設定 min-h-[28rem] 讓它佔據與月曆差不多高，防止版面跳動 */
            <div className="flex flex-col w-full gap-4 animate-fade-in min-h-[28rem]">
              {stats.totalClicks === 0 ? (
                // --- 空狀態顯示 ---
                <div className="flex flex-col items-center justify-center flex-grow opacity-50">
                  <BarChart2
                    size={64}
                    className="mb-4 text-gray-300 dark:text-gray-600"
                  />
                  <p className="text-sm">尚無紀錄資料</p>
                  <p className="text-xs mt-1">請切換回月曆點擊日期進行紀錄</p>
                </div>
              ) : (
                // --- 有資料時的顯示 ---
                <>
                  <div
                    className={`w-full p-4 rounded-xl shadow-sm ${
                      isDarkMode ? 'bg-slate-800' : 'bg-white'
                    }`}
                  >
                    <div className="text-sm opacity-70 mb-4">截至今日總計</div>
                    <div className="grid grid-cols-2 gap-4">
                      {colors.map((color, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: isDarkMode
                                ? color.darkHex
                                : color.hex,
                            }}
                          />
                          <span className="text-xs opacity-80 w-12 truncate">
                            {color.label}
                          </span>
                          <span className="text-lg font-bold">
                            {stats.colorCounts[idx]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`w-full p-4 rounded-xl shadow-sm ${
                      isDarkMode ? 'bg-slate-800' : 'bg-white'
                    }`}
                  >
                    <h3 className="text-md font-semibold mb-4 flex justify-between">
                      <span>本月分佈 ({month + 1}月)</span>
                      <span className="text-xs opacity-50 self-center">
                        與上月比較
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {stats.monthlyCounts.map((count, idx) => {
                        const diff = count - stats.lastMonthCounts[idx];
                        const diffStr =
                          diff > 0 ? `+${diff}` : diff === 0 ? '-' : `${diff}`;
                        const diffColor =
                          diff > 0
                            ? 'text-green-500'
                            : diff < 0
                            ? 'text-red-500'
                            : 'opacity-30';
                        const widthPercent =
                          stats.totalClicks > 0
                            ? (count / stats.totalClicks) * 100
                            : 0;

                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: getColor(idx) }}
                            />
                            <span className="text-sm w-16 truncate">
                              {getLabel(idx)}
                            </span>
                            <div className="flex-grow h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(widthPercent, 0)}%`,
                                  backgroundColor: getColor(idx),
                                }}
                              />
                            </div>
                            <div className="w-16 text-right text-xs flex flex-col items-end">
                              <span className="font-bold">{count}</span>
                              <span className={`font-medium ${diffColor}`}>
                                {diffStr}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 底部筆記 */}
          <div className="mt-4 mb-20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-70">備註</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBottomNotes([...bottomNotes, ''])}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {bottomNotes.map((note, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => {
                      const newNotes = [...bottomNotes];
                      newNotes[idx] = e.target.value;
                      setBottomNotes(newNotes);
                    }}
                    className={`w-full bg-transparent border-b outline-none py-1 text-xs
                       ${
                         isDarkMode
                           ? 'border-slate-700 text-slate-300'
                           : 'border-gray-200 text-slate-700'
                       }`}
                  />
                  <button
                    onClick={() => {
                      const newNotes = bottomNotes.filter((_, i) => i !== idx);
                      setBottomNotes(newNotes);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 彈出視窗：年月選擇 */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-xs rounded-2xl p-6 shadow-2xl
            ${
              isDarkMode
                ? 'bg-slate-800 text-slate-100'
                : 'bg-white text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">選擇年月</h3>
              <button onClick={() => setShowDatePicker(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-4 justify-center items-center h-48">
              <div className="flex flex-col items-center gap-2 overflow-y-auto h-full scrollbar-hide snap-y snap-mandatory py-16">
                {Array.from({ length: 10 }).map((_, i) => {
                  const y = year - 5 + i;
                  return (
                    <button
                      key={y}
                      onClick={() => setCurrentDate(new Date(y, month, 1))}
                      className={`text-xl font-bold py-2 px-4 rounded-lg snap-center transition-all
                           ${
                             y === year
                               ? isDarkMode
                                 ? 'bg-slate-700 text-white'
                                 : 'bg-gray-200 text-black'
                               : 'opacity-40'
                           }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col items-center gap-2 overflow-y-auto h-full scrollbar-hide snap-y snap-mandatory py-16">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentDate(new Date(year, i, 1));
                      setShowDatePicker(false);
                    }}
                    className={`text-xl font-bold py-2 px-4 rounded-lg snap-center transition-all
                          ${
                            i === month
                              ? isDarkMode
                                ? 'bg-slate-700 text-white'
                                : 'bg-gray-200 text-black'
                              : 'opacity-40'
                          }`}
                  >
                    {i + 1}月
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 彈出視窗：設定 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-xs rounded-2xl p-6 shadow-2xl
            ${
              isDarkMode
                ? 'bg-slate-800 text-slate-100'
                : 'bg-white text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">設定</h3>
              <button onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>星期語言</span>
                <button
                  onClick={cycleLanguage}
                  className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-md"
                >
                  {weekdayLang.toUpperCase()}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <span className="text-xs font-semibold opacity-60 mb-2 block">
                  資料備份與還原
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExport}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition
                        ${
                          isDarkMode
                            ? 'bg-slate-700 hover:bg-slate-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                  >
                    <Download size={16} />
                    匯出備份
                  </button>

                  <button
                    onClick={handleImportTrigger}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition
                        ${
                          isDarkMode
                            ? 'bg-slate-700 hover:bg-slate-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                  >
                    <Upload size={16} />
                    匯入備份
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFile}
                    className="hidden"
                    accept=".json"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  重置當前月曆紀錄
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 彈出視窗：重置確認 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`w-full max-w-xs rounded-2xl p-6 shadow-2xl text-center
            ${
              isDarkMode
                ? 'bg-slate-800 text-slate-100'
                : 'bg-white text-slate-800'
            }`}
          >
            <h3 className="text-lg font-bold mb-2">確定要重置嗎？</h3>
            <p className="text-sm opacity-70 mb-6">
              此動作將清除所有已填寫的顏色紀錄與筆記，且
              <span className="font-bold text-red-500">無法復原</span>。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`flex-1 py-2 rounded-lg font-medium
                  ${
                    isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                取消
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600"
              >
                確認重置
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .grid-rows-7 { grid-template-rows: repeat(7, minmax(0, 1fr)); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // 假設您有對應的 CSS 檔案

const App = () => {
  // --- State 定義 ---
  const [appData, setAppData] = useState({
    title: '',
    notes: [],
    dateNotes: {}, // { '2023-10-01': 'content' }
    dateColors: {}, // { '2023-10-01': '#ffaaaa' }
    weekNotes: {}, // { '2023-10-W1': 'text' }
    darkMode: false,
    lastBackup: '尚未備份',
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState(null);
  
  // Modals 控制
  const [modalState, setModalState] = useState({
    dateNote: false,
    settings: false,
    help: false,
  });
  
  // 編輯中的日期
  const [editingDateStr, setEditingDateStr] = useState(null);
  const [tempNoteContent, setTempNoteContent] = useState('');

  // 顏色列表
  const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ffffff'];
  const DB_KEY = 'lifeLogData_v83';

  // --- Effect: 初始化與讀取 ---
  useEffect(() => {
    // 讀取存檔
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAppData(prev => ({ ...prev, ...parsed }));
    }

    // 第一次啟動檢查 (Onboarding)
    const hasLaunched = localStorage.getItem('hasLaunched_v83');
    if (!hasLaunched) {
      setModalState(prev => ({ ...prev, help: true }));
      localStorage.setItem('hasLaunched_v83', 'true');
    }
  }, []);

  // --- Effect: 存檔 ---
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(appData));
    // 深色模式切換 Class
    if (appData.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [appData]);

  // --- 邏輯函數 ---

  // 1. 月曆邏輯
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 is Sunday
    
    const days = [];
    // 空白格
    for (let i = 0; i < startingDay; i++) {
      days.push({ id: `empty-${i}`, day: null });
    }
    // 日期格
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ id: dateStr, day: d, dateStr });
    }
    return days;
  };

  // 2. 日期格互動
  const handleDayClick = (dateStr) => {
    if (selectedColor) {
      setAppData(prev => ({
        ...prev,
        dateColors: { ...prev.dateColors, [dateStr]: selectedColor }
      }));
    }
  };

  // 長按模擬
  const timerRef = useRef(null);
  const handleTouchStart = (dateStr) => {
    timerRef.current = setTimeout(() => openDateEditor(dateStr), 500);
  };
  const handleTouchEnd = () => clearTimeout(timerRef.current);

  // 3. 筆記管理
  const addNote = () => {
    setAppData(prev => ({ ...prev, notes: [...prev.notes, "新筆記..."] }));
  };
  const updateNote = (index, text) => {
    const newNotes = [...appData.notes];
    newNotes[index] = text;
    setAppData(prev => ({ ...prev, notes: newNotes }));
  };
  const deleteNote = (index) => {
    if (window.confirm('確定刪除此筆記？')) {
      const newNotes = appData.notes.filter((_, i) => i !== index);
      setAppData(prev => ({ ...prev, notes: newNotes }));
    }
  };

  // 4. Modal 開關
  const openDateEditor = (dateStr) => {
    setEditingDateStr(dateStr);
    setTempNoteContent(appData.dateNotes[dateStr] || '');
    setModalState(prev => ({ ...prev, dateNote: true }));
  };

  const saveDateNote = () => {
    setAppData(prev => {
      const newDateNotes = { ...prev.dateNotes };
      if (tempNoteContent.trim() === '') delete newDateNotes[editingDateStr];
      else newDateNotes[editingDateStr] = tempNoteContent;
      return { ...prev, dateNotes: newDateNotes };
    });
    setModalState(prev => ({ ...prev, dateNote: false }));
  };

  // 5. 備份功能
  const exportData = () => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
    const newAppData = { ...appData, lastBackup: timeStr };
    setAppData(newAppData); // Update state to trigger save

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newAppData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "life_log_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Render ---
  return (
    <div className={`app-container ${appData.darkMode ? 'dark' : ''}`}>
      
      {/* 標題區 */}
      <div className="header">
        <input 
          type="text" 
          className="app-title-input"
          placeholder="自定義標題" 
          value={appData.title}
          onChange={(e) => setAppData({...appData, title: e.target.value})}
        />
        <div className="controls">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>&lt;</button>
          <span className="current-date-text">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </span>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>&gt;</button>
          <button onClick={() => setModalState(p => ({...p, settings: true}))}>⚙️</button>
        </div>
      </div>

      {/* 顏色選擇器 */}
      <div className="color-picker">
        {colors.map(color => (
          <div 
            key={color}
            className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #ddd' : 'none' }}
            onClick={() => setSelectedColor(prev => prev === color ? null : color)}
          />
        ))}
      </div>

      {/* 月曆主體 */}
      <div className="main-container">
        <div className="calendar-card">
          <div className="calendar-grid">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="weekday">{d}</div>
            ))}
            
            {getCalendarDays().map(item => (
              <div 
                key={item.id} 
                className={`day-cell ${!item.day ? 'other-month' : ''} ${
                   item.day && 
                   item.day === new Date().getDate() && 
                   currentDate.getMonth() === new Date().getMonth() && 
                   currentDate.getFullYear() === new Date().getFullYear() 
                   ? 'today' : ''
                }`}
                style={{ backgroundColor: item.day ? (appData.dateColors[item.dateStr] || 'transparent') : 'transparent' }}
                onClick={() => item.day && handleDayClick(item.dateStr)}
                onMouseDown={() => item.day && handleTouchStart(item.dateStr)}
                onMouseUp={handleTouchEnd}
                onTouchStart={() => item.day && handleTouchStart(item.dateStr)}
                onTouchEnd={handleTouchEnd}
              >
                {item.day && <span>{item.day}</span>}
                {item.day && appData.dateNotes[item.dateStr] && <div className="dot-indicator" />}
              </div>
            ))}
          </div>
        </div>

        {/* 週筆記區 (簡化示意，根據月曆行數生成) */}
        <div className="week-notes">
           {/* 這裡可以根據實際月曆行數用 map 生成 */}
           {[1, 2, 3, 4, 5, 6].map(weekNum => (
             <textarea 
               key={weekNum}
               className="week-note-input"
               placeholder={`W${weekNum}`}
               value={appData.weekNotes[`${currentDate.getFullYear()}-${currentDate.getMonth()}-W${weekNum}`] || ''}
               onChange={(e) => {
                 const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-W${weekNum}`;
                 setAppData(p => ({...p, weekNotes: {...p.weekNotes, [key]: e.target.value}}));
               }}
             />
           ))}
        </div>
      </div>

      {/* 筆記列表 */}
      <div className="notes-section">
        <div className="notes-header">
          <h3>筆記</h3>
          <button onClick={addNote}>+ 新增</button>
        </div>
        {appData.notes.map((note, idx) => (
          <div key={idx} className="note-item">
            <span 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => updateNote(idx, e.target.innerText)}
            >
              {note}
            </span>
            <button className="delete-btn" onClick={() => deleteNote(idx)}>刪除</button>
          </div>
        ))}
      </div>

      {/* Modal: 日期編輯 */}
      {modalState.dateNote && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingDateStr}</h3>
              <button onClick={() => setModalState(p => ({...p, dateNote: false}))}>×</button>
            </div>
            <textarea 
              value={tempNoteContent} 
              onChange={(e) => setTempNoteContent(e.target.value)}
              placeholder="在此輸入詳細記錄..."
            />
            <button onClick={saveDateNote}>儲存</button>
          </div>
        </div>
      )}

      {/* Modal: 設定 */}
      {modalState.settings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>設定</h3>
              <button onClick={() => setModalState(p => ({...p, settings: false}))}>×</button>
            </div>
            <button className="settings-btn" onClick={() => setAppData(p => ({...p, darkMode: !p.darkMode}))}>
              切換深色模式 🌓
            </button>
            <button className="settings-btn highlight" onClick={() => setModalState(p => ({...p, help: true}))}>
              操作說明 ℹ️
            </button>
            <div className="backup-section">
               <p style={{textAlign: 'center', color: '#666'}}>上次: {appData.lastBackup}</p>
               <button onClick={exportData}>匯出資料</button>
            </div>
            <button className="settings-btn danger" onClick={() => {
               if(window.confirm('清除所有資料？')) {
                 localStorage.removeItem(DB_KEY);
                 localStorage.removeItem('hasLaunched_v83');
                 window.location.reload();
               }
            }}>清除所有資料</button>
          </div>
        </div>
      )}

      {/* Modal: 操作說明 */}
      {modalState.help && (
        <div className="modal-overlay">
          <div className="modal-content">
             <div className="modal-header">
              <h3>操作說明</h3>
              <button onClick={() => setModalState(p => ({...p, help: false}))}>×</button>
            </div>
            <ul className="help-list">
                <li><strong>日期</strong>：自選年月、月曆左右滑動換月</li>
                <li><strong>長按月曆日期格</strong>：編輯便利貼詳細紀錄</li>
                <li><strong>顏色區分</strong>：點選顏色後，再點擊日期格進行填色</li>
                <li><strong>週數顯示</strong>：月曆右側，可直接點擊填入文字</li>
                <li><strong>筆記</strong>：可無限增加，也可刪除</li>
                <li><strong>顯示設定</strong>：深色模式、統計數據顯示</li>
                <li><strong>備份資料</strong>：建議每週匯出一次</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

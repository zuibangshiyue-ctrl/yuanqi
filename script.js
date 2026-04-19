// ========== 原有功能：打卡、计时、日历、番茄钟等（完整保留） ==========
let punches = JSON.parse(localStorage.getItem('punches') || '[]');
let editMode = false;
let editingIndex = null;
let longPressTimer = null;

let recentIcons = JSON.parse(localStorage.getItem('recentIcons') || '["📋","🎯","🏃","📚","💧","🍎","💤","✏️"]');

let globalTimerInterval = null;

let hideInactivePlans = JSON.parse(localStorage.getItem('hideInactivePlans') || 'false');
const showExpiredReminders = true;
const autoSort = true;

let punchAudio = null;

let timerSessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');

const fixedColors = [
  '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
  '#118AB2', '#EF476F', '#073B4C', '#7209B7',
  '#F15BB5', '#00BBF9', '#00F5D4', '#FF9E00',
  '#9B5DE5', '#00F5D4', '#FEE440', '#00BBF9',
  '#F15BB5', '#FF6B6B', '#4ECDC4', '#FFD166'
];
let cardColorMap = JSON.parse(localStorage.getItem('cardColorMap') || '{}');

let currentCalendarDate = new Date();
let selectedDateForDetails = null;

let yearMonthPickerModal = document.getElementById('year-month-picker-modal');
let closeYearMonthPickerBtn = document.getElementById('close-year-month-picker');
let prevYearBtn = document.getElementById('prev-year');
let nextYearBtn = document.getElementById('next-year');
let currentYearEl = document.getElementById('current-year');
let monthItems = document.querySelectorAll('.month-item');
let confirmYearMonthBtn = document.getElementById('confirm-year-month');

let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth() + 1;

const editTimerModal = document.getElementById('edit-timer-modal');
const closeEditTimerBtn = document.getElementById('close-edit-timer');
const deleteTimerRecordBtn = document.getElementById('delete-timer-record');
const saveTimerRecordBtn = document.getElementById('save-timer-record');

const addTimerModal = document.getElementById('add-timer-modal');
const closeAddTimerBtn = document.getElementById('close-add-timer');
const saveNewTimerRecordBtn = document.getElementById('save-new-timer-record');

const addStartDate = document.getElementById('add-start-date');
const addStartTime = document.getElementById('add-start-time');
const addEndDate = document.getElementById('add-end-date');
const addEndTime = document.getElementById('add-end-time');
const editStartDate = document.getElementById('edit-start-date');
const editStartTime = document.getElementById('edit-start-time');
const editEndDate = document.getElementById('edit-end-date');
const editEndTime = document.getElementById('edit-end-time');

const editTimeWarning = document.getElementById('edit-time-warning');
const addTimeWarning = document.getElementById('add-time-warning');

let currentEditingParentId = null;
let currentEditingSessionIds = [];

const navPunch = document.getElementById('nav-punch');
const navTime = document.getElementById('nav-time');
const navCalendar = document.getElementById('nav-calendar');
const navJournal = document.getElementById('nav-journal');
const punchSection = document.getElementById('punch-section');
const timeSection = document.getElementById('time-section');
const calendarSection = document.getElementById('calendar-section');
const journalSection = document.getElementById('journal-section');

let customWeekdays = [];
let customMonthDay = 1;
let customWeekNumber = 1;
let customWeekday = 1;
let customMonthDayType = 'day';

let frequencyOptions = document.querySelectorAll('.frequency-option');
let timerTypeOptions = document.querySelectorAll('.timer-type-option');

const punchHeaderButtons = document.getElementById('punch-header-buttons');
const todayHeaderBtn = document.getElementById('today-header-btn');
const journalAddBookBtn = document.getElementById('journal-add-book-btn');

const endPlanBtn = document.getElementById('end-plan-btn');
const savePlanBtn = document.getElementById('save-plan-btn');

let selectedDayForActions = null;
let selectedPlanForActions = null;
let selectedDayPunchItems = [];

let timeChartUpdateInterval = null;
let lastUpdateTime = Date.now();

const backupModal = document.getElementById('backup-modal');
const closeBackupModalBtn = document.getElementById('close-backup-modal');
const closeBackupBtn = document.getElementById('close-backup-btn');
const exportDataBtn = document.getElementById('export-data-btn');
const importDataBtn = document.getElementById('import-data-btn');
const importDataInput = document.getElementById('import-data-input');
const importFileInput = document.getElementById('import-file-input');
const exportAllDataBtn = document.getElementById('export-all-data');
const importAllDataBtn = document.getElementById('import-all-data');

let recentIconsEditMode = false;
let recentIconLongPressTimer = null;

const clearAllDataBtn = document.getElementById('clear-all-data-btn');

const retroactiveSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><path d="M510.964926 81.298608c-239.21522 0-433.834756 194.641025-433.834756 433.831686 0 239.240803 194.619536 433.855222 433.834756 433.855222 239.213173 0 433.855222-194.615443 433.855222-433.855222C944.820148 275.939633 750.178099 81.298608 510.964926 81.298608zM510.964926 893.165186c-208.445426 0-378.01238-169.570024-378.01238-378.035916 0-208.416773 169.566954-378.011356 378.01238-378.011356 208.442356 0 378.034892 169.594583 378.034892 378.011356C888.999818 723.595162 735.407282 893.165186 510.964926 893.165186z" fill="#ff7f50"></path><path d="M389.732817 354.579691c4.137227 7.976672 12.313443 12.58769 20.762883 12.58769 3.617387 0 7.28287-0.844228 10.701736-2.626827 11.449773-5.921873 15.932878-20.019962 9.985422-31.466666l-26.879184-51.782364c-5.947456-11.470239-20.094664-15.880689-31.468712-10.008958-11.44568 5.972015-15.927761 20.018939-9.958816 31.515784L389.732817 354.579691z" fill="#ff7f50"></path><path d="M521.24506 494.341828c-10.256598-7.803733-24.877597-5.898337-32.751938 4.312212l-38.132482 49.673329c-6.566556-4.062526-12.090363-7.380084-16.551978-9.933233l0-31.984459c0-1.438769-0.568958-2.677992-0.840134-4.064572 41.59842-49.725518 55.969733-84.535325 56.886615-86.915535 4.706185-11.941983-1.116427-25.421996-13.057387-30.176276-3.269463-1.339508-6.639211-1.710968-9.911744-1.538029-0.418532 0-0.766456-0.198521-1.139963-0.198521L314.436924 383.516744c-12.883425 0-23.363104 10.457166-23.363104 23.340591 0 12.93152 10.479679 23.338544 23.363104 23.338544l114.021893 0c-21.457708 33.027208-64.742537 87.832418-143.776567 146.528238-10.354835 7.728008-12.487406 22.347984-4.780887 32.654724 4.558829 6.217608 11.618619 9.442046 18.755156 9.442046 4.856611 0 9.735735-1.486864 13.925151-4.612041 29.211299-21.680788 53.713342-42.887786 74.526367-62.956867l0 187.012278c0 12.883425 10.457166 23.341614 23.339568 23.341614 12.883425 0 23.36208110.458189 23.362081-23.341614L433.809685 593.173764c19.574824 12.68695 42.046628 29.163203 55.449893 44.797275 4.63353 5.373381 11.17348 8.124028 17.740036 8.124028 5.377474 0 10.777461-1.809205 15.188934-5.573949 9.784854-8.401344 10.924817-23.11751 2.551102-32.951483-9.838066-11.472286-22.74298-22.595624-35.849486-32.680307l36.642548-47.76998C533.362029 516.863774 531.479145 502.195703 521.24506 494.341828z" fill="#ff7f50"></path><path d="M588.11812 268.680299c-12.883425 0-23.340591 10.480702-23.340591 23.364127l0 446.219831c0 12.883425 10.457166 23.341614 23.340591 23.341614s23.312962-10.458189 23.312962-23.341614L611.431082 292.043403c0-12.883425-10.47056-23.363104-23.312962-23.363104z" fill="#ff7f50"></path><path d="M660.288836 438.867376c-9.116635-9.141194-23.882943-9.116635-33.000602-0.024559-9.144264 9.144264-9.144264 23.909549 0 33.027208l79.530334 79.533404c4.556783 4.558829 10.483772 6.837732 16.501836 6.837732 5.969968 0 11.94403-2.278903 16.502859-6.837732 9.117658-9.121751 9.117658-23.887037 0-33.003672L660.288836 438.867376z" fill="#ff7f50"></path></svg>`;
const undoSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="981" width="200" height="200"><path d="M512.002558 65.340147c-246.729357 0-446.662923 199.932542-446.662923 446.662923 0 246.724241 199.932542 446.656783 446.662923 446.656783 246.724241 0 446.656783-199.932542 446.656783-446.656783C958.659341 265.272689 758.726799 65.340147 512.002558 65.340147L512.002558 65.340147zM512.002558 916.122037c-223.331461 0-404.125107-180.793646-404.125107-404.119991 0-223.331461 180.793646-404.125107 404.125107-404.125107 221.200938 0 404.119991 180.793646 404.119991 404.125107C916.121526 735.328391 735.32788 916.122037 512.002558 916.122037L512.002558 916.122037z" fill="#ff7f50" p-id="982"></path><path d="M703.428356 358.858134" fill="#ff7f50" p-id="983"></path><path d="M489.236042 283.931654 288.234145 488.331951 489.236042 690.592514 489.236042 562.250474c0 0 233.490845-119.05656 213.377762 177.816848 0 0 157.733441-282.95542-214.916814-338.63965L489.236042 283.931654 489.236042 283.931654zM489.236042 283.931654" fill="#ff7f50" p-id="984"></path></svg>`;

let imageDB = null;
const IMAGE_DB_NAME = 'PunchImageDB';
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE_NAME = 'images';
const CACHE_LIMIT = 100;

const imageCache = new Map();

function initImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);
    
    request.onerror = () => {
      console.error('IndexedDB初始化失败');
      resolve(false);
    };
    
    request.onsuccess = (event) => {
      imageDB = event.target.result;
      console.log('IndexedDB初始化成功');
      resolve(true);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        const store = db.createObjectStore(IMAGE_STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function saveImageToDB(imageId, imageData) {
  if (!imageDB) {
    const initialized = await initImageDB();
    if (!initialized) return null;
  }
  
  return new Promise((resolve, reject) => {
    const transaction = imageDB.transaction([IMAGE_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    
    const imageRecord = {
      id: imageId,
      data: imageData,
      timestamp: Date.now()
    };
    
    const request = store.put(imageRecord);
    
    request.onsuccess = () => {
      console.log('图片保存成功:', imageId);
      imageCache.set(imageId, imageData);
      cleanupOldImages();
      resolve(imageId);
    };
    
    request.onerror = () => {
      console.error('图片保存失败:', imageId);
      reject(new Error('图片保存失败'));
    };
  });
}

async function getImageFromDB(imageId) {
  if (imageCache.has(imageId)) {
    return imageCache.get(imageId);
  }
  
  if (!imageDB) {
    const initialized = await initImageDB();
    if (!initialized) return null;
  }
  
  return new Promise((resolve, reject) => {
    const transaction = imageDB.transaction([IMAGE_STORE_NAME], 'readonly');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    
    const request = store.get(imageId);
    
    request.onsuccess = () => {
      if (request.result) {
        const imageData = request.result.data;
        imageCache.set(imageId, imageData);
        updateImageTimestamp(imageId);
        resolve(imageData);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      reject(new Error('图片获取失败'));
    };
  });
}

async function updateImageTimestamp(imageId) {
  if (!imageDB) return;
  
  const transaction = imageDB.transaction([IMAGE_STORE_NAME], 'readwrite');
  const store = transaction.objectStore(IMAGE_STORE_NAME);
  
  const request = store.get(imageId);
  
  request.onsuccess = () => {
    if (request.result) {
      request.result.timestamp = Date.now();
      store.put(request.result);
    }
  };
}

async function cleanupOldImages() {
  if (!imageDB) return;
  
  const transaction = imageDB.transaction([IMAGE_STORE_NAME], 'readwrite');
  const store = transaction.objectStore(IMAGE_STORE_NAME);
  const index = store.index('timestamp');
  
  const countRequest = store.count();
  
  countRequest.onsuccess = () => {
    const count = countRequest.result;
    if (count > CACHE_LIMIT) {
      let toDelete = count - CACHE_LIMIT;
      
      const cursorRequest = index.openCursor();
      
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && toDelete > 0) {
          const imageId = cursor.primaryKey;
          imageCache.delete(imageId);
          store.delete(imageId);
          toDelete--;
          cursor.continue();
        }
      };
    }
  };
}

function generateImageId() {
  return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function processImageData(imageData) {
  if (!imageData.startsWith('data:image') && imageData.length < 100) {
    return imageData;
  }
  
  if (imageData.startsWith('data:image')) {
    try {
      const imageId = generateImageId();
      await saveImageToDB(imageId, imageData);
      return `db:${imageId}`;
    } catch (error) {
      console.error('图片保存失败，使用默认图标:', error);
      return '📋';
    }
  }
  
  return imageData;
}

async function getImageData(imageRef) {
  if (imageRef && imageRef.startsWith('db:')) {
    const imageId = imageRef.substring(3);
    try {
      const imageData = await getImageFromDB(imageId);
      return imageData || '📋';
    } catch (error) {
      console.error('图片获取失败:', error);
      return '📋';
    }
  }
  
  return imageRef;
}

async function migrateImagesToIndexedDB() {
  let migrated = false;
  
  for (let i = 0; i < punches.length; i++) {
    const punch = punches[i];
    if (punch.icon && punch.icon.startsWith('data:image')) {
      const newIconRef = await processImageData(punch.icon);
      punch.icon = newIconRef;
      migrated = true;
    }
  }
  
  for (let i = 0; i < recentIcons.length; i++) {
    if (recentIcons[i].startsWith('data:image')) {
      const newIconRef = await processImageData(recentIcons[i]);
      recentIcons[i] = newIconRef;
      migrated = true;
    }
  }
  
  if (migrated) {
    saveToLocalStorage();
    console.log('图片数据已迁移到IndexedDB');
  }
}

async function prepareDataForExport() {
  console.log('开始准备导出数据...');
  
  const exportData = {
    version: '2.1',
    exportDate: new Date().toISOString(),
    punches: [],
    recentIcons: [],
    hideInactivePlans: hideInactivePlans,
    timerSessions: timerSessions,
    cardColorMap: cardColorMap,
    books: books,  // 新增日记本数据
    images: {}
  };
  
  for (let i = 0; i < punches.length; i++) {
    const punch = JSON.parse(JSON.stringify(punches[i]));
    
    if (punch.icon && punch.icon.startsWith('db:')) {
      const imageId = punch.icon.substring(3);
      try {
        const imageData = await getImageFromDB(imageId);
        if (imageData) {
          exportData.images[imageId] = imageData;
          punch.icon = `db:${imageId}`;
        } else {
          punch.icon = '📋';
        }
      } catch (error) {
        console.error('获取图片失败:', error);
        punch.icon = '📋';
      }
    }
    
    exportData.punches.push(punch);
  }
  
  for (let i = 0; i < recentIcons.length; i++) {
    const icon = recentIcons[i];
    
    if (icon && icon.startsWith('db:')) {
      const imageId = icon.substring(3);
      try {
        const imageData = await getImageFromDB(imageId);
        if (imageData) {
          exportData.images[imageId] = imageData;
          exportData.recentIcons.push(`db:${imageId}`);
        } else {
          exportData.recentIcons.push('📋');
        }
      } catch (error) {
        console.error('获取最近图标失败:', error);
        exportData.recentIcons.push('📋');
      }
    } else {
      exportData.recentIcons.push(icon);
    }
  }
  
  console.log('导出数据准备完成，包含图片数量:', Object.keys(exportData.images).length);
  return exportData;
}

async function processImportedData(backupData) {
  console.log('开始处理导入的数据...');
  
  const version = backupData.version || '1.0';
  
  if (version === '1.0') {
    console.log('检测到旧版本数据(1.0)，迁移图片数据到IndexedDB...');
    
    for (let i = 0; i < backupData.punches.length; i++) {
      const punch = backupData.punches[i];
      if (punch.icon && punch.icon.startsWith('data:image')) {
        const newIconRef = await processImageData(punch.icon);
        punch.icon = newIconRef;
      }
    }
    
    for (let i = 0; i < backupData.recentIcons.length; i++) {
      if (backupData.recentIcons[i].startsWith('data:image')) {
        const newIconRef = await processImageData(backupData.recentIcons[i]);
        backupData.recentIcons[i] = newIconRef;
      }
    }
  } else if (version === '2.0' || version === '2.1') {
    console.log('检测到新版本数据，恢复图片数据到IndexedDB...');
    
    if (backupData.images) {
      for (const [imageId, imageData] of Object.entries(backupData.images)) {
        try {
          await saveImageToDB(imageId, imageData);
          console.log('图片恢复成功:', imageId);
        } catch (error) {
          console.error('图片恢复失败:', imageId, error);
        }
      }
    }
    
    for (let i = 0; i < backupData.punches.length; i++) {
      const punch = backupData.punches[i];
      if (punch.icon && punch.icon.startsWith('db:')) {
        const imageId = punch.icon.substring(3);
        if (!backupData.images || !backupData.images[imageId]) {
          punch.icon = '📋';
        }
      }
    }
    
    for (let i = 0; i < backupData.recentIcons.length; i++) {
      if (backupData.recentIcons[i].startsWith('db:')) {
        const imageId = backupData.recentIcons[i].substring(3);
        if (!backupData.images || !backupData.images[imageId]) {
          backupData.recentIcons[i] = '📋';
        }
      }
    }
  }
  
  // 导入日记本数据
  if (backupData.books && Array.isArray(backupData.books) && backupData.books.length > 0) {
    books = backupData.books;
    saveBooksToLocal();
    if (journalSection && journalSection.classList.contains('active')) {
      renderBookshelfUI();
    }
  } else if (backupData.journalEntries) {
    // 兼容旧版本
    journalData = backupData.journalEntries;
    localStorage.setItem('journalEntries', JSON.stringify(journalData));
  }
  
  return backupData;
}

function getFrequencyLabel(p) {
  if (!p.frequency) return '';
  switch(p.frequency) {
    case 'daily':
      if (p.dailyTimes && p.dailyTimes > 1) {
        return `${p.dailyTimes}次/天`;
      }
      return '每天';
      
    case 'weekly':
      if (p.days && p.days.length > 0) {
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const selectedDays = p.days.map(day => weekdays[day]);
        
        if (selectedDays.length === 7) {
          return '每天';
        }
        
        if (selectedDays.length > 1) {
          return `周${selectedDays.join(',')}`;
        }
        
        if (selectedDays.length === 1) {
          return `周${selectedDays[0]}`;
        }
        
        return '每周';
      }
      return '每周';
      
    case 'monthly':
      return '每月';
    case 'yearly':
      return '每年';
      
    case 'once':
      return '一次';
    case 'custom':
      if (p.customUnit) {
        switch(p.customUnit) {
          case 'days':
            return `每${p.customInterval || 1}天`;
          case 'weeks':
            if (p.customWeekdays && p.customWeekdays.length > 0) {
              const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
              const daysText = p.customWeekdays.map(day => weekdays[day]).join(',');
              return `每${p.customInterval || 1}周${daysText}`;
            }
            return `每${p.customInterval || 1}周`;
          case 'months':
            return `每${p.customInterval || 1}月`;
          case 'years':
            return `每${p.customInterval || 1}年`;
          default:
            return '自定义';
        }
      }
      return '自定义';
    default:
      return '';
  }
}

function showToast(message, duration = 2000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, duration);
}

function initBackupFunction() {
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', exportBackupData);
  }

  if (importDataBtn && importDataInput) {
    importDataBtn.addEventListener('click', () => {
      importDataInput.click();
    });
    importDataInput.addEventListener('change', importBackupData);
  }

  if (exportAllDataBtn) {
    exportAllDataBtn.addEventListener('click', exportBackupData);
  }

  if (importAllDataBtn && importFileInput) {
    importAllDataBtn.addEventListener('click', () => {
      importFileInput.click();
    });
    importFileInput.addEventListener('change', importBackupData);
  }

  if (closeBackupModalBtn) {
    closeBackupModalBtn.addEventListener('click', () => {
      backupModal.style.display = 'none';
    });
  }

  if (closeBackupBtn) {
    closeBackupBtn.addEventListener('click', () => {
      backupModal.style.display = 'none';
    });
  }

  if (backupModal) {
    backupModal.addEventListener('click', (e) => {
      if (e.target === backupModal) {
        backupModal.style.display = 'none';
      }
    });
  }
}

async function exportBackupData() {
  try {
    const backupData = await prepareDataForExport();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `元气打卡备份_${new Date().toISOString().slice(0, 10)}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('数据导出成功！');
  } catch (error) {
    console.error('导出数据时出错:', error);
    showToast('导出失败：' + (error.message || '请重试'));
  }
}

async function importBackupData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const fileContent = e.target.result;
      // 注意：此处已改为 readAsText，因此 fileContent 是纯文本 JSON
      const backupData = JSON.parse(fileContent);
      if (!backupData.punches || !Array.isArray(backupData.punches)) {
        throw new Error('无效的备份文件格式：缺少punches数组');
      }
      
      if (confirm('导入数据将覆盖当前所有数据，确定要导入吗？')) {
        const processedData = await processImportedData(backupData);
        
        punches = processedData.punches || [];
        recentIcons = processedData.recentIcons || [];
        hideInactivePlans = processedData.hideInactivePlans || false;
        timerSessions = processedData.timerSessions || [];
        cardColorMap = processedData.cardColorMap || {};
        
        saveToLocalStorage();
        renderPunchList();
        if (timeSection.classList.contains('active')) {
          renderTimeSummaryForDate(currentTimeViewDate);
        }
        if (calendarSection.classList.contains('active')) {
          renderCalendar();
        }
        if (journalSection && journalSection.classList.contains('active')) {
          if (typeof refreshJournalOnShow === 'function') refreshJournalOnShow();
        }
        
        backupModal.style.display = 'none';
        settingsModal.style.display = 'none';
        showToast('数据导入成功！');
      }
    } catch (error) {
      console.error('导入数据时出错:', error);
      showToast('导入失败：' + (error.message || '文件格式不正确'));
    }
  };
  
  reader.onerror = function() {
    showToast('读取文件失败，请重试');
  };
  
  // 关键修复：使用 readAsText 代替 readAsDataURL
  reader.readAsText(file);
  event.target.value = '';
}

function initClearAllDataFunction() {
  if (clearAllDataBtn) {
    clearAllDataBtn.addEventListener('click', clearAllData);
  }
}

function clearAllData() {
  if (!confirm('警告：这将删除所有打卡记录（包括历史记录、计时记录等），但会保留卡片计划数据。此操作不可恢复！确定要继续吗？')) {
    return;
  }
  
  try {
    punches.forEach(p => {
      p.history = {};
      
      if (p.timerInterval) {
        clearInterval(p.timerInterval);
        p.timerInterval = null;
      }
      
      p.timer = null;
      p.timerStatus = 'init';
      p.paused = false;
      p.timed = false;
      
      const today = getTodayDateString();
      p.history[today] = {
        checked: false,
        checkedTime: null,
        lastUpdate: getCurrentTimeString(),
        punches: 0,
        maxPunches: p.dailyTimes || 1
      };
    });
    
    timerSessions = [];
    
    editMode = false;
    editingIndex = null;
    
    localStorage.setItem('punches', JSON.stringify(punches));
    localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
    
    renderPunchList();
    if (timeSection.classList.contains('active')) {
      renderTimeSummaryForDate(currentTimeViewDate);
    }
    
    if (calendarSection.classList.contains('active')) {
      renderCalendar();
    }
    
    settingsModal.style.display = 'none';
    showToast('打卡记录已清空');
    
    console.log('所有打卡记录已清空，卡片计划数据已保留');
  } catch (error) {
    console.error('清空数据时出错:', error);
    showToast('清空失败，请重试');
  }
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentTimeString() {
  const now = new Date();
  return now.toISOString();
}

function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayStart() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
}

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function getFixedColorForCard(cardName) {
  if (cardColorMap[cardName]) {
    return cardColorMap[cardName];
  }
  
  const usedColors = Object.values(cardColorMap);
  let availableColorIndex = 0;
  
  while (availableColorIndex < fixedColors.length) {
    const color = fixedColors[availableColorIndex];
    if (!usedColors.includes(color)) {
      cardColorMap[cardName] = color;
      localStorage.setItem('cardColorMap', JSON.stringify(cardColorMap));
      return color;
    }
    availableColorIndex++;
  }
  
  const hash = cardName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const colorIndex = Math.abs(hash) % fixedColors.length;
  const color = fixedColors[colorIndex];
  cardColorMap[cardName] = color;
  localStorage.setItem('cardColorMap', JSON.stringify(cardColorMap));
  
  return color;
}

function generateParentId() {
  return 'parent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function splitTimerRangeIntoDays(startTime, endTime, punchName, parentId) {
  const sessions = [];
  let currentStart = new Date(startTime);
  const finalEnd = new Date(endTime);
  
  while (currentStart < finalEnd) {
    let currentEnd = new Date(currentStart);
    currentEnd.setHours(23, 59, 59, 999);
    if (currentEnd > finalEnd) {
      currentEnd = new Date(finalEnd);
    }
    
    const dateStr = formatDate(currentStart);
    const durationMs = currentEnd - currentStart;
    
    sessions.push({
      id: 'ts_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '_' + sessions.length,
      parentId: parentId,
      date: dateStr,
      name: punchName,
      startHour: currentStart.getHours(),
      startMinute: currentStart.getMinutes(),
      endHour: currentEnd.getHours(),
      endMinute: currentEnd.getMinutes(),
      duration: durationMs,
      startTime: new Date(currentStart),
      endTime: new Date(currentEnd)
    });
    
    currentStart = new Date(currentStart);
    currentStart.setDate(currentStart.getDate() + 1);
    currentStart.setHours(0, 0, 0, 0);
  }
  
  return sessions;
}

function addTimerSessions(startTime, endTime, punchName) {
  const parentId = generateParentId();
  const sessions = splitTimerRangeIntoDays(startTime, endTime, punchName, parentId);
  timerSessions.push(...sessions);
  localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
  
  const affectedDates = [...new Set(sessions.map(s => s.date))];
  affectedDates.forEach(date => {
    updatePunchStatusFromSessions(punchName, date);
  });
  
  return sessions;
}

function deleteTimerSessionsByParentId(parentId) {
  const toRemove = timerSessions.filter(s => s.parentId === parentId).map(s => s.id);
  if (toRemove.length === 0) return false;
  
  const affected = new Map(); // name -> Set of dates
  timerSessions.forEach(s => {
    if (s.parentId === parentId) {
      if (!affected.has(s.name)) affected.set(s.name, new Set());
      affected.get(s.name).add(s.date);
    }
  });
  
  timerSessions = timerSessions.filter(s => s.parentId !== parentId);
  localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
  
  for (let [name, dates] of affected.entries()) {
    dates.forEach(date => {
      updatePunchStatusFromSessions(name, date);
    });
  }
  return true;
}

function deleteTimerSessions(sessionIds) {
  const sessionsToDelete = timerSessions.filter(s => sessionIds.includes(s.id));
  const affected = new Map(); // name -> Set of dates
  sessionsToDelete.forEach(s => {
    if (!affected.has(s.name)) affected.set(s.name, new Set());
    affected.get(s.name).add(s.date);
  });
  
  timerSessions = timerSessions.filter(s => !sessionIds.includes(s.id));
  localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
  
  for (let [name, dates] of affected.entries()) {
    dates.forEach(date => {
      updatePunchStatusFromSessions(name, date);
    });
  }
}

function modifyTimerSessions(oldParentId, newStartTime, newEndTime, newPunchName) {
  deleteTimerSessionsByParentId(oldParentId);
  return addTimerSessions(newStartTime, newEndTime, newPunchName);
}

function migrateCrossDaySessions() {
  let changed = false;
  const newSessions = [];
  
  for (const session of timerSessions) {
    if (session.parentId) {
      newSessions.push(session);
      continue;
    }
    session.parentId = generateParentId();
    newSessions.push(session);
    changed = true;
  }
  
  if (changed) {
    timerSessions = newSessions;
    localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
    console.log('已为计时记录添加parentId');
  }
}

function recordTimerSession(punchName, startTime, endTime, duration) {
  addTimerSessions(startTime, endTime, punchName);
}

function removeTimerSessionsForToday(punchName) {
  const today = getTodayDateString();
  const toRemove = timerSessions.filter(s => s.date === today && s.name === punchName).map(s => s.parentId);
  [...new Set(toRemove)].forEach(pid => deleteTimerSessionsByParentId(pid));
}

function removeTimerSessionsForDate(punchName, date) {
  const toRemove = timerSessions.filter(s => s.date === date && s.name === punchName).map(s => s.parentId);
  [...new Set(toRemove)].forEach(pid => deleteTimerSessionsByParentId(pid));
}

function initPunchHistory(punch) {
  if (!punch.id) {
    punch.id = 'punch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  if (!punch.history) {
    punch.history = {};
  }

  const today = getTodayDateString();
  const todayStart = getTodayStart();
  
  const todayRecord = punch.history[today];
  
  const historyDates = Object.keys(punch.history).sort();
  
  let lastRecordDate = null;
  if (historyDates.length > 0) {
    lastRecordDate = new Date(historyDates[historyDates.length - 1] + 'T00:00:00');
  }
  
  const shouldReset = !todayRecord || 
                     (lastRecordDate && !isSameDay(lastRecordDate, todayStart));
  if (shouldReset && isInCurrentPeriod(punch)) {
    if (punch.enableTimer && punch.timed) {
      punch.timed = false;
      punch.timer = null;
      punch.timerStatus = 'init';
    }
    
    punch.history[today] = {
      checked: false,
      checkedTime: null,
      lastUpdate: getCurrentTimeString(),
      punches: 0,
      maxPunches: punch.dailyTimes || 1
    };
  } else if (!todayRecord) {
    punch.history[today] = {
      checked: false,
      checkedTime: null,
      lastUpdate: getCurrentTimeString(),
      punches: 0,
      maxPunches: punch.dailyTimes || 1
    };
  }
}

function calculateStreak(punch) {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  let streak = 0;
  let isCurrentStreakChecked = false;

  const dates = Object.keys(punch.history || {}).sort();
  if (dates.length === 0) return { currentStreak: 0, missedStreak: 0 };

  const todayRecord = punch.history[today];
  const todayChecked = todayRecord && 
                      ((punch.dailyTimes && punch.dailyTimes > 1 && 
                        todayRecord.punches >= todayRecord.maxPunches) ||
                       ((!punch.dailyTimes || punch.dailyTimes === 1) && todayRecord.checked));
  if (todayChecked) {
    let checkDate = new Date(today);
    let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayRecord = punch.history[dateStr];

      let dayChecked = false;
      if (dayRecord) {
        if (punch.dailyTimes && punch.dailyTimes > 1) {
          dayChecked = dayRecord.punches >= dayRecord.maxPunches;
        } else {
          dayChecked = dayRecord.checked;
        }
      }

      if (dayChecked) {
        currentStreak++;
      } else {
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { currentStreak: currentStreak, missedStreak: 0 };
  }

  let checkDate = new Date(yesterday);
  let missedStreak = 0;

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayRecord = punch.history[dateStr];

    let dayCompleted = false;
    if (dayRecord) {
      if (punch.dailyTimes && punch.dailyTimes > 1) {
        dayCompleted = dayRecord.punches >= dayRecord.maxPunches;
      } else {
        dayCompleted = dayRecord.checked;
      }
    }

    if (dayRecord) {
      if (!dayCompleted) {
        missedStreak++;
      } else {
        break;
      }
    } else {
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { currentStreak: 0, missedStreak: missedStreak };
}

function checkCountdownCompletion(p) {
  if (p.enableTimer && p.timerType === 'countdown' && p.countdown) {
    const totalCountdownMs = (p.countdown.h * 3600 + p.countdown.m * 60 + p.countdown.s) * 1000;
    if (p.timer && p.timerStatus === 'running') {
      const elapsed = Date.now() - p.timer.startTime;
      if (elapsed >= totalCountdownMs) {
        console.log('倒计时完成，自动打卡:', p.name, 'ID:', p.id);
        if (p.timer.startTime) {
          const startTime = new Date(p.timer.startTime);
          const endTime = new Date();
          recordTimerSession(p.name, startTime, endTime, elapsed);
        }
        
        p.timed = true;
        p.timerStatus = 'init';
        p.timer = null;
        
        const today = getTodayDateString();
        initPunchHistory(p);
        p.history[today] = {
          checked: true,
          checkedTime: getCurrentTimeString(),
          lastUpdate: getCurrentTimeString(),
          isTimed: true,
          punches: 1,
          maxPunches: p.dailyTimes || 1
        };
        
        saveAndRender();
        return true;
      }
    }
  }
  return false;
}

function updateRunningTimers() {
  const currentTime = Date.now();
  punches.forEach((p, index) => {
    checkCountdownCompletion(p);
    
    if (p.enableTimer && p.timerStatus === 'running' && p.timer && p.timer.startTime) {
      const currentElapsed = currentTime - p.timer.startTime;
      
      if (currentElapsed >= 0) {
        p.timer.elapsed = currentElapsed;
      } else {
        p.timer.elapsed = 0;
      }
      
      const listItems = document.querySelectorAll('.punch-item');
      let foundCard = false;
      
      for (let i = 0; i < listItems.length; i++) {
        const nameElement = listItems[i].querySelector('.name');
        if (nameElement && nameElement.textContent === p.name) {
          const cardId = listItems[i].dataset.punchId;
          if (cardId && cardId === p.id) {
            foundCard = true;
            
            let timerDisplay = listItems[i].querySelector('.timer-display');
            if (!timerDisplay) {
              updateCardTimerUI(listItems[i], p);
              timerDisplay = listItems[i].querySelector('.timer-display');
            }
            
            if (timerDisplay) {
              let displayText = '';
              let displayColor = '';
              
              if (p.timerStatus === 'running') {
                if (p.timerType === 'countup') {
                  displayColor = '#4a90e2';
                } else if (p.timerType === 'countdown') {
                  displayColor = '#ED62ED';
                }
              }
              
              if (p.timerType === 'countup') {
                const elapsed = p.timer.elapsed;
                const h = Math.floor(elapsed / 3600000);
                const m = Math.floor((elapsed % 3600000) / 60000);
                const s = Math.floor((elapsed % 60000) / 1000);
                displayText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
              } else if (p.timerType === 'countdown' && p.countdown) {
                const totalCountdownMs = (p.countdown.h * 3600 + p.countdown.m * 60 + p.countdown.s) * 1000;
                const elapsed = p.timer.elapsed || 0;
                const remaining = Math.max(0, totalCountdownMs - elapsed);
                
                const h = Math.floor(remaining / 3600000);
                const m = Math.floor((remaining % 3600000) / 60000);
                const s = Math.floor((remaining % 60000) / 1000);
                displayText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
              }
              
              timerDisplay.textContent = displayText;
              timerDisplay.style.color = displayColor;
            }
            break;
          }
        }
      }
      
      if (p.timer.updateCount) {
        p.timer.updateCount++;
        if (p.timer.updateCount % 30 === 0) {
          saveToLocalStorage();
        }
      } else {
        p.timer.updateCount = 1;
      }
    }
  });
}

function startTimeChartUpdate() {
  if (timeChartUpdateInterval) {
    clearInterval(timeChartUpdateInterval);
  }
  
  timeChartUpdateInterval = setInterval(() => {
    if (timeSection && timeSection.classList.contains('active')) {
      renderTimeSummaryForDate(currentTimeViewDate);
    }
  }, 60000);
  
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && timeSection && timeSection.classList.contains('active')) {
      renderTimeSummaryForDate(currentTimeViewDate);
    }
  });
}

function startGlobalTimer() {
  if (globalTimerInterval) {
    cancelAnimationFrame(globalTimerInterval);
  }

  let lastUpdateTime = Date.now();
  function updateTimersWithPrecision() {
    const currentTime = Date.now();
    const delta = currentTime - lastUpdateTime;
    if (delta >= 900) {
      updateRunningTimers();
      lastUpdateTime = currentTime;
    }
    
    globalTimerInterval = requestAnimationFrame(updateTimersWithPrecision);
  }
  
  globalTimerInterval = requestAnimationFrame(updateTimersWithPrecision);
}

function saveToLocalStorage() {
  try {
    const dataToSave = punches.map(p => {
      const cleanP = { ...p };
      if (cleanP.timer) {
        cleanP.timer = { ...cleanP.timer };
        delete cleanP.timer.updateCount;
      }
      return cleanP;
    });
    localStorage.setItem('punches', JSON.stringify(dataToSave));
    localStorage.setItem('recentIcons', JSON.stringify(recentIcons));
    localStorage.setItem('hideInactivePlans', JSON.stringify(hideInactivePlans));
    localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
    localStorage.setItem('cardColorMap', JSON.stringify(cardColorMap));
  } catch (e) {
    console.error('保存数据时出错:', e);
  }
}

function isInCurrentPeriod(p) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();
  const todayStr = getTodayDateString();
  const todayRecord = p.history && p.history[todayStr];
  
  if (p.frequency === 'once' && todayRecord && todayRecord.checked) {
    return false;
  }
  
  switch(p.frequency) {
    case 'daily':
      return true;
    case 'once':
      return !(todayRecord && todayRecord.checked);
    case 'weekly':
      if (p.days && p.days.length > 0) {
        return p.days.includes(dayOfWeek);
      }
      return true;
      
    case 'monthly':
      return dayOfMonth === 1;
    case 'yearly':
      const month = today.getMonth() + 1;
      const date = today.getDate();
      return month === 1 && date === 1;
      
    case 'custom':
      return isInCustomPeriod(p, today);
    default:
      return true;
  }
}

function isInCustomPeriod(p, today) {
  if (!p.customInterval || !p.customUnit) return true;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayTimestamp = todayStart.getTime();
  
  let startDate;
  if (p.lastCheckDate) {
    startDate = new Date(p.lastCheckDate);
  } else if (p.createdDate) {
    startDate = new Date(p.createdDate);
  } else {
    const firstCheckDate = p.history && Object.keys(p.history)
      .sort()
      .find(dateStr => {
        const record = p.history[dateStr];
        if (p.dailyTimes && p.dailyTimes > 1) {
          return record.punches >= record.maxPunches;
        } else {
          return record.checked === true;
        }
      });
    
    if (firstCheckDate) {
      startDate = new Date(firstCheckDate + 'T00:00:00');
    } else {
      startDate = todayStart;
    }
  }
  
  startDate.setHours(0, 0, 0, 0);
  const startTimestamp = startDate.getTime();
  const daysDiff = Math.floor((todayTimestamp - startTimestamp) / (1000 * 60 * 60 * 24));
  
  switch(p.customUnit) {
    case 'days':
      return daysDiff % p.customInterval === 0;
    case 'weeks':
      if (!p.customWeekdays || p.customWeekdays.length === 0) {
        return daysDiff % (p.customInterval * 7) === 0;
      }
      
      if (!p.customWeekdays.includes(today.getDay())) {
        return false;
      }
      
      const weeksDiff = Math.floor(daysDiff / 7);
      return weeksDiff % p.customInterval === 0;
      
    case 'months':
      const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                         (today.getMonth() - startDate.getMonth());
      if (monthsDiff % p.customInterval !== 0) {
        return false;
      }
      
      if (p.customMonthDayType === 'day') {
        return today.getDate() === p.customDayOfMonth;
      } else {
        return isNthWeekdayOfMonth(today, p.customWeekNumber, p.customWeekday);
      }
      
    case 'years':
      const yearsDiff = today.getFullYear() - startDate.getFullYear();
      if (yearsDiff % p.customInterval !== 0) {
        return false;
      }
      
      return today.getMonth() + 1 === p.customMonthOfYear && 
             today.getDate() === p.customDayOfYear;
    default:
      return true;
  }
}

function isNthWeekdayOfMonth(date, weekNumber, targetWeekday) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  if (date.getDay() !== targetWeekday) {
    return false;
  }
  
  const targetDays = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === targetWeekday) {
      targetDays.push(new Date(d));
    }
  }
  
  if (weekNumber === -1) {
    const lastTargetDay = targetDays[targetDays.length - 1];
    return day === lastTargetDay.getDate();
  } else {
    const nthTargetDay = targetDays[weekNumber - 1];
    return nthTargetDay && day === nthTargetDay.getDate();
  }
}

function shouldShowPunch(p) {
  const inPeriod = isInCurrentPeriod(p);
  if (!inPeriod) {
    return !hideInactivePlans;
  }
  
  if (p.frequency === 'once' && isPunchDoneToday(p)) {
    return !hideInactivePlans;
  }
  
  return true;
}

let dragStartX = 0, dragStartY = 0, dragStartElement = null, dragStartIndex = -1, isDraggingCard = false;
let dragClone = null;
let dragOriginal = null;
let autoScrollInterval = null;
let autoScrollSpeed = 0;
let latestDragClientX = 0, latestDragClientY = 0;

function createDragClone(element) {
  const clone = element.cloneNode(true);
  clone.classList.add('punch-drag-clone');
  clone.style.position = 'fixed';
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  clone.style.opacity = '1';
  clone.style.transform = 'none';
  clone.style.transition = 'none';
  clone.style.boxShadow = 'none';
  clone.style.filter = 'none';
  clone.style.width = element.offsetWidth + 'px';
  clone.style.height = element.offsetHeight + 'px';
  clone.style.left = element.getBoundingClientRect().left + 'px';
  clone.style.top = element.getBoundingClientRect().top + 'px';
  
  clone.querySelectorAll('.delete-btn, .edit-btn').forEach(btn => btn.remove());
  
  document.body.appendChild(clone);
  return clone;
}

function removeDragClone() {
  if (dragClone) {
    dragClone.remove();
    dragClone = null;
  }
}

function updateClonePosition(x, y) {
  if (!dragClone) return;
  dragClone.style.left = x - dragClone.offsetWidth / 2 + 'px';
  dragClone.style.top = y - dragClone.offsetHeight / 2 + 'px';
}

function getTargetIndex(clientX, clientY, list) {
  const elements = document.elementsFromPoint(clientX, clientY);
  let targetCard = null;
  for (let el of elements) {
    if (el.classList && el.classList.contains('punch-item') && el !== dragStartElement) {
      targetCard = el;
      break;
    }
  }
  
  if (targetCard) {
    const children = Array.from(list.children);
    return children.indexOf(targetCard);
  }
  
  const listRect = list.getBoundingClientRect();
  if (clientY < listRect.top + 50) {
    return 0;
  } else if (clientY > listRect.bottom - 50) {
    return list.children.length - 1;
  }
  
  return -1;
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  autoScrollSpeed = 0;
}

function startAutoScroll() {
  if (autoScrollInterval) return;
  autoScrollInterval = setInterval(() => {
    if (autoScrollSpeed !== 0 && dragStartElement && isDraggingCard) {
      const scrollContainer = document.querySelector('#punch-section');
      if (scrollContainer) {
        scrollContainer.scrollTop += autoScrollSpeed;
        refreshDragOrder(latestDragClientX, latestDragClientY);
      } else {
        stopAutoScroll();
      }
    } else {
      stopAutoScroll();
    }
  }, 20);
}

function refreshDragOrder(clientX, clientY) {
  if (!dragStartElement || !isDraggingCard) return;
  const list = document.getElementById('punch-list');
  const targetIndex = getTargetIndex(clientX, clientY, list);
  if (targetIndex !== -1 && targetIndex !== dragStartIndex) {
    const children = Array.from(list.children);
    const targetElement = children[targetIndex];
    if (targetIndex < dragStartIndex) {
      list.insertBefore(dragStartElement, targetElement);
    } else {
      list.insertBefore(dragStartElement, targetElement.nextSibling);
    }
    dragStartIndex = targetIndex;
  }
}

function onDragMove(e) {
  e.preventDefault();
  if (!dragStartElement) return;

  const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
  const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);
  latestDragClientX = clientX;
  latestDragClientY = clientY;

  const dx = clientX - dragStartX;
  const dy = clientY - dragStartY;

  if (!isDraggingCard && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
    isDraggingCard = true;
    dragClone = createDragClone(dragStartElement);
    dragStartElement.style.opacity = '0';
    dragStartElement.style.pointerEvents = 'none';
    stopAutoScroll();
  }

  if (!isDraggingCard) return;

  updateClonePosition(clientX, clientY);

  const list = document.getElementById('punch-list');
  const targetIndex = getTargetIndex(clientX, clientY, list);
  
  if (targetIndex !== -1 && targetIndex !== dragStartIndex) {
    const children = Array.from(list.children);
    const targetElement = children[targetIndex];
    
    if (targetIndex < dragStartIndex) {
      list.insertBefore(dragStartElement, targetElement);
    } else {
      list.insertBefore(dragStartElement, targetElement.nextSibling);
    }
    
    dragStartIndex = targetIndex;
  }

  if (isDraggingCard) {
    const scrollContainer = document.querySelector('#punch-section');
    if (scrollContainer) {
      const rect = scrollContainer.getBoundingClientRect();
      const topThreshold = 70;
      const bottomThreshold = 70;
      const maxSpeed = 12;
      let speed = 0;
      if (clientY < rect.top + topThreshold) {
        speed = -Math.min(maxSpeed, (rect.top + topThreshold - clientY) / 8);
      } else if (clientY > rect.bottom - bottomThreshold) {
        speed = Math.min(maxSpeed, (clientY - (rect.bottom - bottomThreshold)) / 8);
      }
      if (speed !== 0) {
        autoScrollSpeed = speed;
        startAutoScroll();
      } else {
        stopAutoScroll();
      }
    } else {
      stopAutoScroll();
    }
  }
}

function onDragEnd(e) {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchmove', onDragMove);
  document.removeEventListener('touchend', onDragEnd);

  if (isDraggingCard && dragStartElement) {
    dragStartElement.style.opacity = '';
    dragStartElement.style.pointerEvents = '';
    
    removeDragClone();

    const list = document.getElementById('punch-list');
    const newOrder = [];
    for (let child of list.children) {
      const id = child.dataset.punchId;
      const punch = punches.find(p => p.id === id);
      if (punch) newOrder.push(punch);
    }
    punches = newOrder;
    saveToLocalStorage();
  }
  stopAutoScroll();
  dragStartElement = null;
  dragStartIndex = -1;
  isDraggingCard = false;
  removeDragClone();
}

function getTimerBottomHTML(p) {
    const today = getTodayDateString();
    const todayRecord = p.history[today] || {};
    const todayPunches = todayRecord.punches || 0;
    const maxPunches = todayRecord.maxPunches || p.dailyTimes || 1;
    const isDoneToday = isPunchDoneToday(p);
    const streakInfo = calculateStreak(p);

    if (isDoneToday || p.timed) {
        if (streakInfo.currentStreak > 0) {
            return `<div class="streak">已打卡${streakInfo.currentStreak}天</div>`;
        } else {
            return `<div class="streak">已完成</div>`;
        }
    } 
    else if (p.enableTimer) {
        if (p.timerStatus === 'running' || p.timerStatus === 'paused') {
            let displayText = '';
            let displayColor = '';
            if (p.timerType === 'countup') {
                const elapsed = p.timer?.elapsed || 0;
                const h = Math.floor(elapsed / 3600000);
                const m = Math.floor((elapsed % 3600000) / 60000);
                const s = Math.floor((elapsed % 60000) / 1000);
                displayText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                displayColor = '#4a90e2';
            } else if (p.timerType === 'countdown' && p.countdown) {
                const totalCountdownMs = (p.countdown.h * 3600 + p.countdown.m * 60 + p.countdown.s) * 1000;
                const elapsed = p.timer?.elapsed || 0;
                const remaining = Math.max(0, totalCountdownMs - elapsed);
                const h = Math.floor(remaining / 3600000);
                const m = Math.floor((remaining % 3600000) / 60000);
                const s = Math.floor((remaining % 60000) / 1000);
                displayText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                displayColor = '#ED62ED';
            }
            if (p.timerStatus === 'paused') {
                displayColor = '#ff4d4d';
            }
            return `<div class="timer-display" style="color: ${displayColor};">${displayText}</div>`;
        } 
        else {
            if (streakInfo.missedStreak > 0) {
                return `<div class="streak">未打卡${streakInfo.missedStreak}天</div>`;
            } else {
                return `<div class="streak" style="visibility: hidden;">&nbsp;</div>`;
            }
        }
    } 
    else {
        if (p.dailyTimes && p.dailyTimes > 1) {
            if (todayPunches > 0) {
                return `<div class="streak">${todayPunches}/${maxPunches}次</div>`;
            } else {
                if (streakInfo.missedStreak > 0) {
                    return `<div class="streak">未打卡${streakInfo.missedStreak}天</div>`;
                } else {
                    return `<div class="streak">${todayPunches}/${maxPunches}次</div>`;
                }
            }
        } 
        else {
            if (p.frequency === 'once' && isDoneToday) {
                return `<div class="streak">计划已结束</div>`;
            } else if (streakInfo.currentStreak > 0) {
                return `<div class="streak">已打卡${streakInfo.currentStreak}天</div>`;
            } else if (streakInfo.missedStreak > 0 && !isDoneToday) {
                return `<div class="streak">未打卡${streakInfo.missedStreak}天</div>`;
            } else {
                return `<div class="streak" style="visibility: hidden;">&nbsp;</div>`;
            }
        }
    }
}

function updateCardTimerUI(cardLi, p) {
    const desc = cardLi.querySelector('.desc');
    if (!desc) return;
    let bottomElement = desc.nextElementSibling;
    const bottomHTML = getTimerBottomHTML(p);
    if (!bottomElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bottomHTML;
        const newElem = tempDiv.firstChild;
        desc.insertAdjacentElement('afterend', newElem);
    } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bottomHTML;
        const newElem = tempDiv.firstChild;
        bottomElement.replaceWith(newElem);
    }
}

function bindSwipeAnimation(cardLi, punch) {
  if (!punch.enableTimer) return;
  let startX = 0, startY = 0;
  let isSwiping = false;
  let animationFrame = null;
  const resetTransform = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    cardLi.style.transition = 'transform 0.2s ease-out';
    cardLi.style.transform = 'translateX(0px)';
    setTimeout(() => {
      cardLi.style.transition = '';
    }, 200);
  };
  const animateSwipe = (deltaX) => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      const maxSwipe = -80;
      let newX = Math.max(maxSwipe, Math.min(0, deltaX));
      cardLi.style.transform = `translateX(${newX}px)`;
      animationFrame = null;
    });
  };
  const onTouchStart = (e) => {
    if (editMode) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwiping = false;
    cardLi.style.transition = 'none';
  };
  const onTouchMove = (e) => {
    if (editMode) return;
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    if (!isSwiping && Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -10) {
      isSwiping = true;
      e.preventDefault();
      animateSwipe(deltaX);
    } else if (isSwiping) {
      e.preventDefault();
      animateSwipe(deltaX);
    }
  };
  const onTouchEnd = (e) => {
    if (editMode) return;
    if (isSwiping) {
      const deltaX = e.changedTouches[0].clientX - startX;
      if (deltaX < -30) {
        openTomatoModal(punch);
      }
      resetTransform();
    }
    isSwiping = false;
    cardLi.style.transition = '';
  };
  cardLi.addEventListener('touchstart', onTouchStart, { passive: false });
  cardLi.addEventListener('touchmove', onTouchMove, { passive: false });
  cardLi.addEventListener('touchend', onTouchEnd);
  cardLi.addEventListener('touchcancel', resetTransform);
  let mouseStartX = 0, mouseStartY = 0;
  let mouseSwiping = false;
  cardLi.addEventListener('mousedown', (e) => {
    if (editMode) return;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    mouseSwiping = false;
    cardLi.style.transition = 'none';
    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - mouseStartX;
      const deltaY = moveEvent.clientY - mouseStartY;
      if (!mouseSwiping && Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -10) {
        mouseSwiping = true;
        animateSwipe(deltaX);
      } else if (mouseSwiping) {
        animateSwipe(deltaX);
      }
    };
    const onMouseUp = (upEvent) => {
      if (mouseSwiping) {
        const deltaX = upEvent.clientX - mouseStartX;
        if (deltaX < -30) {
          openTomatoModal(punch);
        }
        resetTransform();
      }
      mouseSwiping = false;
      cardLi.style.transition = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

async function renderPunchList(forceRender = false) {
  const list = document.getElementById('punch-list');
  if (!list) return;
  
  console.log('开始渲染卡片列表，卡片数量:', punches.length, '隐藏非周期计划:', hideInactivePlans, '强制渲染:', forceRender);
  
  if (editMode && !forceRender) {
    console.log('编辑模式下只更新按钮状态');
    const punchItems = list.querySelectorAll('.punch-item');
    punchItems.forEach(item => {
      if (editMode) {
        item.classList.add('edit-mode');
      } else {
        item.classList.remove('edit-mode');
      }
    });
    return;
  }
  
  if (!editMode || forceRender) {
    list.innerHTML = '';
  }
  
  punches.forEach(p => {
    initPunchHistory(p);
  });
  
  const sorted = [...punches].sort((a, b) => {
    const aDone = isPunchDoneToday(a);
    const bDone = isPunchDoneToday(b);
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (a.timed !== b.timed) return a.timed ? 1 : -1;
    return 0;
  });
  
  for (const p of sorted) {
    if (!shouldShowPunch(p) && hideInactivePlans) {
      continue;
    }

    const streakInfo = calculateStreak(p);

    const today = getTodayDateString();
    const todayRecord = p.history[today] || {};
    const todayPunches = todayRecord.punches || 0;
    const maxPunches = todayRecord.maxPunches || p.dailyTimes || 1;

    const isDoneToday = isPunchDoneToday(p);
    const isInPeriod = isInCurrentPeriod(p);
    
    let bottomHTML = getTimerBottomHTML(p);

    const li = document.createElement('li');
    li.className = 'punch-item';
    li.dataset.punchId = p.id;
    if (!isInPeriod && !isDoneToday) {
      li.classList.add('not-in-period');
    }

    if (editMode) li.classList.add('edit-mode');
    if (isDoneToday || p.timed) li.classList.add('done');
    if (p.desc && p.desc.length > 50) li.classList.add('long-desc');
    
    let reminderHTML = '';
    if (p.reminderTime) {
      const now = new Date();
      const [reminderHour, reminderMinute] = p.reminderTime.split(':').map(Number);
      const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), reminderHour, reminderMinute);
      
      let reminderText = p.reminderTime;
      let reminderStyle = '';
      
      if (reminderDate < now) {
        reminderStyle = 'style="color:#ff4d4d;"';
        reminderHTML = `<div class="reminder-time" ${reminderStyle}>${reminderText}</div>`;
      } else {
        reminderHTML = `<div class="reminder-time" style="color:#4a90e2;">${reminderText}</div>`;
      }
    } else {
      reminderHTML = '<div class="reminder-time"></div>';
    }

    let iconHTML = '';
    if (p.icon && p.icon.startsWith('db:')) {
      iconHTML = `<div class="icon-container"><img src="" alt="${p.name}" loading="lazy" data-image-id="${p.icon.substring(3)}" class="lazy-image"></div>`;
    } else if (p.icon && p.icon.startsWith('data:image')) {
      iconHTML = `<div class="icon-container"><img src="${p.icon}" alt="${p.name}" loading="lazy"></div>`;
    } else {
      const iconToShow = p.icon || '📋';
      iconHTML = `<div class="icon-container"><span class="emoji-icon">${iconToShow}</span></div>`;
    }

    const frequencyLabel = getFrequencyLabel(p);
    const isLongTag = frequencyLabel.length > 2;
    const tagClass = isLongTag ? 'frequency-tag long-text' : 'frequency-tag';
    
    const timerBadgeHTML = p.enableTimer ? '<span class="timer-badge"></span>' : '';
    
    li.innerHTML = `
      ${reminderHTML}
      ${frequencyLabel ? `<div class="${tagClass}">${frequencyLabel}</div>` : ''}
      ${iconHTML}
      <span class="name">${p.name}</span>
      <div class="desc">${p.desc || ''}</div>
      ${bottomHTML}
      <button class="delete-btn">×</button>
      <button class="edit-btn">✎</button>
      ${timerBadgeHTML}
    `;
    
    if (p.icon && p.icon.startsWith('db:')) {
      const img = li.querySelector('img');
      if (img) {
        const imageId = p.icon.substring(3);
        if (imageCache.has(imageId)) {
          img.src = imageCache.get(imageId);
        } else {
          getImageData(p.icon).then(imageData => {
            if (imageData && img.parentNode) {
              img.src = imageData;
            }
          });
        }
      }
    }
    
    li.querySelector('.delete-btn').onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      const originalIndex = punches.findIndex(item => item.id === p.id);
      if (originalIndex !== -1) {
        if (p.timerInterval) {
          clearInterval(p.timerInterval);
        }
        punches.splice(originalIndex, 1);
        saveAndRender();
      }
    };
    
    li.querySelector('.edit-btn').onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();

      const originalIndex = punches.findIndex(item => item.id === p.id);
      if (originalIndex !== -1) {
        editingIndex = originalIndex;
        showNewPlanPage(p);
      }
    };

    let clickCount = 0;
    let clickTimer = null;
    li.onclick = e => {
      e.stopPropagation();
      if (editMode || isDraggingCard) return;

      clickCount++;
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        console.log('点击卡片:', p.name, 'ID:', p.id, '点击次数:', clickCount, '当前状态:', {
          done: isDoneToday,
          timed: p.timed,
          enableTimer: p.enableTimer,
          dailyTimes: p.dailyTimes,
          frequency: p.frequency,
          inPeriod: isInCurrentPeriod(p)
        });

        const today = getTodayDateString();

        if (!isDoneToday && !p.timed && !isInCurrentPeriod(p)) {
          alert('不在计划周期内，无法打卡');
          clickCount = 0;
          return;
        }

        if (p.timed || isDoneToday) {
          let confirmMsg = '';
        
          if (p.frequency === 'once' && isDoneToday) {
            confirmMsg = '确定要取消已结束吗？';
          } else {
            confirmMsg = p.timed ? '确定要取消已计时吗？' : '确定要取消已完成吗？';
          }
          
          if (confirm(confirmMsg)) {
            if (p.timerInterval) {
              clearInterval(p.timerInterval);
            }
            p.timer = null;
            p.timerStatus = 'init';
            p.paused = false;
            p.timed = false;

            if (p.enableTimer) {
              removeTimerSessionsForToday(p.name);
            }

            initPunchHistory(p);
            if (p.dailyTimes && p.dailyTimes > 1) {
              p.history[today].punches = 0;
              p.history[today].checked = false;
            } else {
              p.history[today] = {
                checked: false,
                checkedTime: null,
                lastUpdate: getCurrentTimeString(),
                punches: 0,
                maxPunches: p.dailyTimes || 1
              };
            }

            saveAndRender();
          }
        } 
        else if (p.enableTimer) {
          if (clickCount === 1) {
            if (!p.timer) {
              p.timer = { 
                elapsed: 0,
                startTime: Date.now(),
                updateCount: 0
              };
              p.timerStatus = 'running';
            } else if (p.timerStatus === 'init' || p.timerStatus === 'paused') {
              p.timer.startTime = Date.now() - (p.timer.elapsed || 0);
              p.timerStatus = 'running';
              
              checkCountdownCompletion(p);
            } else if (p.timerStatus === 'running') {
              if (p.timer.startTime) {
                p.timer.elapsed = Date.now() - p.timer.startTime;
              }
              p.timerStatus = 'paused';
            }
            
            saveToLocalStorage();
            updateCardTimerUI(li, p);
          } else if (clickCount === 2) {
            if (p.timerInterval) {
              clearInterval(p.timerInterval);
            }
            p.timed = true;
            p.timerStatus = 'init';
            p.paused = false;
            
            if (p.timer && p.timer.startTime) {
              const startTime = new Date(p.timer.startTime);
              const endTime = new Date();
              const duration = p.timer.elapsed || (Date.now() - p.timer.startTime);
              recordTimerSession(p.name, startTime, endTime, duration);
            }
            
            p.timer = null;
            initPunchHistory(p);
            p.history[today] = {
              checked: true,
              checkedTime: getCurrentTimeString(),
              lastUpdate: getCurrentTimeString(),
              isTimed: true,
              punches: 1,
              maxPunches: p.dailyTimes || 1
            };

            playPunchSound();
            
            saveAndRender();
          } else if (clickCount >= 3) {
            if (p.timerInterval) {
              clearInterval(p.timerInterval);
            }
            p.timer = null;
            p.timerStatus = 'init';
            p.paused = false;

            if (p.timed) {
              removeTimerSessionsForToday(p.name);
            }

            initPunchHistory(p);
            p.history[today] = {
              checked: false,
              checkedTime: null,
              lastUpdate: getCurrentTimeString(),
              punches: 0,
              maxPunches: p.dailyTimes || 1
            };

            saveAndRender();
          }
        } 
        else {
          const today = getTodayDateString();
          initPunchHistory(p);

          if (p.dailyTimes && p.dailyTimes > 1) {
            if (isDoneToday) {
              if (confirm("确定要取消已打卡吗？所有今天打卡次数将被重置")) {
                p.history[today].punches = 0;
                p.history[today].checked = false;
                p.history[today].checkedTime = null;
                saveAndRender();
              }
            } else {
              p.history[today].punches = (p.history[today].punches || 0) + 1;
              p.history[today].lastUpdate = getCurrentTimeString();

              playPunchSound();

              if (p.history[today].punches >= (p.history[today].maxPunches || p.dailyTimes || 1)) {
                p.history[today].checked = true;
                p.history[today].checkedTime = getCurrentTimeString();
              }

              saveAndRender();
            }
          } else {
            if (isDoneToday) {
              let confirmMsg = '';
              if (p.frequency === 'once') {
                confirmMsg = "确定要取消已结束吗？";
              } else {
                confirmMsg = "确定要取消已打卡吗？";
              }
              
              if (confirm(confirmMsg)) {
                p.history[today].checked = false;
                p.history[today].checkedTime = null;
                saveAndRender();
              }
            } else {
              p.history[today].checked = true;
              p.history[today].checkedTime = getCurrentTimeString();

              playPunchSound();

              saveAndRender();
            }
          }
        }
        clickCount = 0;
      }, 250);
    };

    bindSwipeAnimation(li, p);

    li.addEventListener('touchstart', function(e) {
      if (e.target.closest('.delete-btn') || e.target.closest('.edit-btn')) return;

      e.stopPropagation();
      
      if (editMode) {
        e.preventDefault();
      }

      if (editMode) {
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartElement = this;
        dragStartIndex = Array.from(this.parentNode.children).indexOf(this);
        isDraggingCard = false;
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
      } else {
        longPressTimer = setTimeout(() => {
          enterEditMode();
        }, 500);

        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isMoving = false;
      }
    }, { passive: false });

    li.addEventListener('touchmove', function(e) {
      if (editMode) {
        e.preventDefault();
        return;
      }

      if (!this.touchStartX || !this.touchStartY) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const diffX = Math.abs(touchX - this.touchStartX);
      const diffY = Math.abs(touchY - this.touchStartY);

      if (diffX > 10 || diffY > 10) {
        this.isMoving = true;
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (this.isMoving) {
        e.stopPropagation();
      }
    }, { passive: false });

    li.addEventListener('touchend', function(e) {
      if (editMode) {
        return;
      }

      clearTimeout(longPressTimer);
      longPressTimer = null;

      if (this.isMoving) {
        e.stopPropagation();
        e.preventDefault();
        this.isMoving = false;
      }

      this.touchStartX = null;
      this.touchStartY = null;
    });

    li.addEventListener('mousedown', function(e) {
      if (e.target.closest('.delete-btn') || e.target.closest('.edit-btn')) return;

      e.stopPropagation();
      e.preventDefault();

      if (editMode) {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartElement = this;
        dragStartIndex = Array.from(this.parentNode.children).indexOf(this);
        isDraggingCard = false;
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
      } else {
        longPressTimer = setTimeout(() => {
          enterEditMode();
        }, 500);
      }
    });

    li.addEventListener('mouseup', function() {
      if (editMode) {
        return;
      }
      clearTimeout(longPressTimer);
    });

    li.addEventListener('mouseleave', function() {
      if (editMode) {
        return;
      }
      clearTimeout(longPressTimer);
    });

    list.appendChild(li);
  }

  console.log('卡片列表渲染完成');
}

function isPunchDoneToday(p) {
  const today = getTodayDateString();
  const todayRecord = p.history[today];
  if (!todayRecord) return false;

  if (p.dailyTimes && p.dailyTimes > 1) {
    const maxPunches = todayRecord.maxPunches || p.dailyTimes || 1;
    return (todayRecord.punches || 0) >= maxPunches;
  }

  return todayRecord.checked === true;
}

function enterEditMode() {
  editMode = true;
  console.log('进入编辑模式');

  const punchItems = document.querySelectorAll('.punch-item');
  punchItems.forEach(item => {
    item.classList.add('edit-mode');
  });
}

function exitEditMode() {
  editMode = false;
  console.log('退出编辑模式');

  const punchItems = document.querySelectorAll('.punch-item');
  punchItems.forEach(item => {
    item.classList.remove('edit-mode');
  });
}

document.addEventListener('click', function(e) {
  if (!editMode) return;

  const punchItem = e.target.closest('.punch-item');
  const isInPunchItem = punchItem !== null;
  const isDeleteBtn = e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn');
  const isEditBtn = e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn');
  const isNavButton = e.target.closest('#nav-punch') ||
                      e.target.closest('#nav-time') ||
                      e.target.closest('#nav-calendar') ||
                      e.target.closest('#add-task');
  const isNewPlanPage = e.target.closest('#new-plan-page');

  if (isDeleteBtn || isEditBtn || isNavButton || isNewPlanPage) {
    return;
  }

  if (isInPunchItem) {
    return;
  }

  exitEditMode();
});

function saveAndRender() {
  console.log('开始保存数据，卡片数量:', punches.length);
  try {
    const dataToSave = punches.map(p => {
      const { timerInterval, ...cleanP } = p;
      return cleanP;
    });
    localStorage.setItem('punches', JSON.stringify(dataToSave));
    console.log('数据保存成功');
    renderPunchList(true);

    if (calendarSection && calendarSection.classList.contains('active')) {
      renderCalendar();
    }
  } catch (e) {
    console.error('保存数据时出错:', e);
    try {
      const compressedPunches = punches.map(p => {
        const compressed = {
          id: p.id,
          name: p.name,
          icon: p.icon,
          desc: p.desc,
          frequency: p.frequency || 'daily',
          dailyTimes: p.dailyTimes || 1,
          days: p.days || [],
          enableTimer: p.enableTimer || false,
          reminderTime: p.reminderTime || '',
          timerType: p.timerType || 'countup',
          timer: p.timer || null,
          timerStatus: p.timerStatus || 'init',
          paused: p.paused || false,
          timed: p.timed || false,
          countdown: p.countdown || null,
          history: p.history || {},
          customInterval: p.customInterval,
          customUnit: p.customUnit,
          customWeekdays: p.customWeekdays,
          customMonthDayType: p.customMonthDayType,
          customDayOfMonth: p.customDayOfMonth,
          customWeekNumber: p.customWeekNumber,
          customWeekday: p.customWeekday,
          customMonthOfYear: p.customMonthOfYear,
          customDayOfYear: p.customDayOfYear
        };
        return compressed;
      });

      localStorage.setItem('punches', JSON.stringify(compressedPunches));
      punches = compressedPunches;
      console.log('数据压缩后保存成功');
      renderPunchList(true);

      if (calendarSection && calendarSection.classList.contains('active')) {
        renderCalendar();
      }
    } catch (e2) {
      console.error('压缩后保存仍然失败:', e2);
      alert('保存数据时出错。可能是存储空间不足，请尝试删除一些卡片或清除浏览器缓存。');
    }
  }
}

const newPlanPage = document.getElementById('new-plan-page');
const addBtn = document.getElementById('add-task');
const backBtn = document.getElementById('back-btn');
const planFrequency = document.getElementById('plan-frequency');
const weekdaysContainer = document.getElementById('weekdays-container');
const weekdaysBtns = weekdaysContainer ? weekdaysContainer.querySelectorAll('button') : [];
const dailyTimesContainer = document.getElementById('daily-times-container');
const countdownContainer = document.getElementById('countdown-container');
let selectedDays = [];

const selectedIconPreview = document.getElementById('selected-icon-preview');
const uploadIconBtn = document.getElementById('upload-icon-btn');
const iconUploadInput = document.getElementById('icon-upload-input');
const recentIconsContainer = document.getElementById('recent-icons-container');
let currentIcon = '📋';

const customFrequencyContainer = document.getElementById('custom-frequency-container');
const customUnit = document.getElementById('custom-unit');
const customWeekdaysContainer = document.getElementById('custom-weekdays-container');
const customMonthdayContainer = document.getElementById('custom-monthday-container');
const customMonthdayType = document.getElementById('custom-monthday-type');
const customWeekdaysBtns = customWeekdaysContainer ? customWeekdaysContainer.querySelectorAll('.weekdays button') : [];

let countdownWheel = null;

function initRecentIcons() {
  if (!recentIconsContainer) return;

  recentIconsContainer.innerHTML = '';
  recentIcons.forEach(async (icon, index) => {
    const iconItem = document.createElement('div');
    iconItem.className = 'recent-icon-item';
    iconItem.dataset.iconIndex = index;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-icon-btn';
    deleteBtn.innerHTML = '×';

    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      removeRecentIcon(index);
    });

    if (icon && icon.startsWith('db:')) {
      const img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      iconItem.appendChild(img);
      iconItem.appendChild(deleteBtn);

      getImageData(icon).then(imageData => {
        if (imageData && img.parentNode) {
          img.src = imageData;
        }
      });
    } else if (icon && icon.startsWith('data:image')) {
      const img = document.createElement('img');
      img.src = icon;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      iconItem.appendChild(img);
      iconItem.appendChild(deleteBtn);
    } else {
      iconItem.textContent = icon || '📋';
      iconItem.appendChild(deleteBtn);
    }

    let longPressTimer = null;

    iconItem.addEventListener('touchstart', function(e) {
      e.stopPropagation();
      longPressTimer = setTimeout(() => {
        recentIconsEditMode = true;
        recentIconsContainer.classList.add('edit-mode');
      }, 500);
    });

    iconItem.addEventListener('touchend', function(e) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (!recentIconsEditMode) {
        e.stopPropagation();
        addToRecentIcons(icon);
        selectIcon(icon);
      }
    });

    iconItem.addEventListener('touchmove', function(e) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    iconItem.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      longPressTimer = setTimeout(() => {
        recentIconsEditMode = true;
        recentIconsContainer.classList.add('edit-mode');
      }, 500);
    });

    iconItem.addEventListener('mouseup', function(e) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (!recentIconsEditMode) {
        e.stopPropagation();
        addToRecentIcons(icon);
        selectIcon(icon);
      }
    });

    iconItem.addEventListener('mouseleave', function() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    recentIconsContainer.appendChild(iconItem);
  });

  document.addEventListener('click', function(e) {
    if (recentIconsEditMode && !e.target.closest('.recent-icon-item')) {
      recentIconsEditMode = false;
      recentIconsContainer.classList.remove('edit-mode');
    }
  });

  document.addEventListener('touchstart', function(e) {
    if (recentIconsEditMode && !e.target.closest('.recent-icon-item')) {
      recentIconsEditMode = false;
      recentIconsContainer.classList.remove('edit-mode');
    }
  });
}

async function removeRecentIcon(index) {
  if (index >= 0 && index < recentIcons.length) {
    const icon = recentIcons[index];
    recentIcons.splice(index, 1);
    localStorage.setItem('recentIcons', JSON.stringify(recentIcons));
    initRecentIcons();
  }
}

async function selectIcon(icon) {
  currentIcon = icon;
  if (!selectedIconPreview) return;

  selectedIconPreview.innerHTML = '';

  if (icon && icon.startsWith('db:')) {
    const img = document.createElement('img');
    img.alt = '图标';
    selectedIconPreview.appendChild(img);

    const imageData = await getImageData(icon);
    if (imageData) {
      img.src = imageData;
    }
  } else if (icon && icon.startsWith('data:image')) {
    const img = document.createElement('img');
    img.src = icon;
    img.alt = '图标';
    selectedIconPreview.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.className = 'default-icon';
    span.textContent = icon || '📋';
    selectedIconPreview.appendChild(span);
  }

  document.querySelectorAll('.recent-icon-item').forEach(item => {
    item.classList.remove('selected');
  });
}

async function addToRecentIcons(icon) {
  const processedIcon = await processImageData(icon);

  const existingIndex = recentIcons.findIndex(item => item === processedIcon);

  if (existingIndex !== -1) {
    recentIcons.splice(existingIndex, 1);
  }

  recentIcons.unshift(processedIcon);

  if (recentIcons.length > 50) {
    recentIcons.pop();
  }

  try {
    localStorage.setItem('recentIcons', JSON.stringify(recentIcons));
    initRecentIcons();
  } catch (e) {
    console.error('保存最近图标时出错:', e);
    if (recentIcons.length > 40) {
      recentIcons.splice(40);
      localStorage.setItem('recentIcons', JSON.stringify(recentIcons));
      initRecentIcons();
    }
  }
}

if (uploadIconBtn) {
  uploadIconBtn.onclick = () => iconUploadInput.click();
}

if (iconUploadInput) {
  iconUploadInput.onchange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB，请选择较小的图片');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        if (file.size < 300 * 1024) {
          const processedIcon = await processImageData(event.target.result);
          selectIcon(processedIcon);
          addToRecentIcons(processedIcon);
          return;
        }

        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let targetSize = 512;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > targetSize) {
              height = Math.round((height * targetSize) / width);
              width = targetSize;
            }
          } else {
            if (height > targetSize) {
              width = Math.round((width * targetSize) / height);
              height = targetSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          let compressedDataUrl;
          if (file.type === 'image/png') {
            compressedDataUrl = canvas.toDataURL('image/png', 0.95);
          } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            compressedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          } else {
            compressedDataUrl = canvas.toDataURL('image/png');
          }

          if (compressedDataUrl.length > 150 * 1024) {
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
              compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            } else {
              compressedDataUrl = canvas.toDataURL('image/png', 0.9);
            }
          }

          const processedIcon = await processImageData(compressedDataUrl);
          selectIcon(processedIcon);
          addToRecentIcons(processedIcon);
        } catch (error) {
          console.error('图片处理失败:', error);
          alert('图片处理失败，请选择其他图片');
          const processedIcon = await processImageData(event.target.result);
          selectIcon(processedIcon);
          addToRecentIcons(processedIcon);
        }
      };
      img.onerror = () => {
        alert('图片加载失败，请选择其他图片');
      };

      img.src = event.target.result;
    };
    reader.onerror = () => {
      alert('读取文件失败');
    };

    reader.readAsDataURL(file);
  };
}

if (addBtn) addBtn.onclick = () => {
  editingIndex = null;
  resetPlanPage();
  newPlanPage.style.display = 'flex';
  console.log('打开新增计划页面');
  scrollNewPlanPageToTop();
};

if (backBtn) backBtn.onclick = () => {
  newPlanPage.style.display = 'none';
  console.log('关闭新增计划页面');
};

if (planFrequency) {
  planFrequency.onchange = () => {
    const value = planFrequency.value;
    frequencyOptions.forEach(option => {
      if (option.dataset.value === value) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    if (weekdaysContainer) weekdaysContainer.style.display = value === 'weekly' ? 'block' : 'none';
    if (customFrequencyContainer) customFrequencyContainer.style.display = value === 'custom' ? 'block' : 'none';
    if (dailyTimesContainer) dailyTimesContainer.style.display = value === 'daily' ? 'block' : 'none';

    selectedDays = [];
    customWeekdays = [];
    weekdaysBtns.forEach(b => b.classList.remove('active'));
    if (value === 'custom') {
      const unit = customUnit.value;
      updateCustomFrequencyUI(unit);
    }
  };
}

function updateCustomFrequencyUI(unit) {
  const weekdaysContainer = document.getElementById('custom-weekdays-container');
  const monthDayContainer = document.getElementById('custom-monthday-container');
  const yearDayContainer = document.getElementById('custom-yearday-container');
  const monthDayType = document.getElementById('custom-monthday-type');
  const specificDay = document.getElementById('custom-specific-day');
  const weekdayOption = document.getElementById('custom-weekday-option');

  if (!weekdaysContainer || !monthDayContainer) return;

  switch(unit) {
    case 'days':
      weekdaysContainer.style.display = 'none';
      monthDayContainer.style.display = 'none';
      if (yearDayContainer) yearDayContainer.style.display = 'none';
      break;
    case 'weeks':
      weekdaysContainer.style.display = 'block';
      monthDayContainer.style.display = 'none';
      if (yearDayContainer) yearDayContainer.style.display = 'none';
      break;
    case 'months':
      weekdaysContainer.style.display = 'none';
      monthDayContainer.style.display = 'block';
      if (yearDayContainer) yearDayContainer.style.display = 'none';
      if (monthDayType) {
        if (monthDayType.value === 'day') {
          if (specificDay) specificDay.style.display = 'flex';
          if (weekdayOption) weekdayOption.style.display = 'none';
        } else {
          if (specificDay) specificDay.style.display = 'none';
          if (weekdayOption) weekdayOption.style.display = 'flex';
        }
      }
      break;
    case 'years':
      weekdaysContainer.style.display = 'none';
      monthDayContainer.style.display = 'none';
      if (yearDayContainer) yearDayContainer.style.display = 'block';
      break;
  }
}

if (customUnit) {
  customUnit.onchange = () => {
    const unit = customUnit.value;
    updateCustomFrequencyUI(unit);
  };
}

if (customWeekdaysBtns.length > 0) {
  customWeekdaysBtns.forEach(btn => {
    btn.onclick = () => {
      btn.classList.toggle('active');
      const day = parseInt(btn.dataset.day);
      if (btn.classList.contains('active')) {
        customWeekdays.push(day);
      } else {
        customWeekdays = customWeekdays.filter(d => d !== day);
      }
    };
  });
}

if (customMonthdayType) {
  customMonthdayType.onchange = () => {
    const type = customMonthdayType.value;
    const specificDay = document.getElementById('custom-specific-day');
    const weekdayOption = document.getElementById('custom-weekday-option');

    if (type === 'day') {
      if (specificDay) specificDay.style.display = 'flex';
      if (weekdayOption) weekdayOption.style.display = 'none';
    } else {
      if (specificDay) specificDay.style.display = 'none';
      if (weekdayOption) weekdayOption.style.display = 'flex';
    }
  };
}

weekdaysBtns.forEach(btn => btn.onclick = () => {
  btn.classList.toggle('active');
  const day = parseInt(btn.dataset.day);
  if (btn.classList.contains('active')) selectedDays.push(day);
  else selectedDays = selectedDays.filter(d => d !== day);
});

function initCountdownInputs() {
  // 倒计时控件已改为滚轮，无需额外初始化
}

if (savePlanBtn) {
  savePlanBtn.onclick = async () => {
    console.log('点击保存按钮');

    const name = document.getElementById('plan-name').value.trim();
    if (!name) {
      alert('请输入卡片名称');
      return;
    }

    const today = getTodayDateString();

    const dailyTimesInput = document.getElementById('daily-times').value;
    const dailyTimes = planFrequency.value === 'daily' ? (parseInt(dailyTimesInput) || 1) : 1;

    let countdownObj = null;
    const timerTypeValue = document.getElementById('timer-type').value;
    if (timerTypeValue === 'countdown') {
      let hours = 0, minutes = 0;
      if (countdownWheel) {
        hours = countdownWheel.getHour();
        minutes = countdownWheel.getMinute();
      } else {
        const durationInput = document.getElementById('countdown-duration');
        if (durationInput && durationInput.value) {
          const parts = durationInput.value.split(':');
          if (parts.length === 2) {
            hours = parseInt(parts[0]) || 0;
            minutes = parseInt(parts[1]) || 0;
          }
        }
      }
      countdownObj = {
        h: hours,
        m: minutes,
        s: 0
      };
    }

    const processedIcon = await processImageData(currentIcon);

    const plan = {
      name,
      icon: processedIcon,
      desc: document.getElementById('plan-desc').value,
      frequency: planFrequency.value,
      dailyTimes: dailyTimes,
      days: [...selectedDays],
      enableTimer: timerTypeValue !== '',
      reminderTime: document.getElementById('reminder-time').value,
      timerType: timerTypeValue || 'countup',
      timer: null,
      timerStatus: 'init',
      timerInterval: null,
      paused: false,
      timed: false,
      countdown: countdownObj,
      history: {
        [today]: {
          checked: false,
          checkedTime: null,
          lastUpdate: getCurrentTimeString(),
          punches: 0,
          maxPunches: dailyTimes
        }
      }
    };

    console.log('创建计划对象:', {
      name: plan.name,
      frequency: plan.frequency,
      dailyTimes: plan.dailyTimes,
      enableTimer: plan.enableTimer,
      timerType: plan.timerType,
      iconType: plan.icon.startsWith('db:') ? 'IndexedDB图片' : (plan.icon.startsWith('data:image') ? 'Base64图片' : 'emoji')
    });

    if (planFrequency.value === 'custom') {
      plan.customInterval = parseInt(document.getElementById('custom-interval').value) || 1;
      plan.customUnit = document.getElementById('custom-unit').value;
      if (plan.customUnit === 'weeks') {
        plan.customWeekdays = [...customWeekdays];
      } else if (plan.customUnit === 'months') {
        plan.customMonthDayType = document.getElementById('custom-monthday-type').value;
        if (plan.customMonthDayType === 'day') {
          plan.customDayOfMonth = parseInt(document.getElementById('custom-day-of-month').value) || 1;
        } else {
          plan.customWeekNumber = parseInt(document.getElementById('custom-week-number').value) || 1;
          plan.customWeekday = parseInt(document.getElementById('custom-weekday').value) || 1;
        }
      } else if (plan.customUnit === 'years') {
        plan.customMonthOfYear = parseInt(document.getElementById('custom-month-of-year').value) || 1;
        plan.customDayOfYear = parseInt(document.getElementById('custom-day-of-year').value) || 1;
      }
    }

    if (editingIndex !== null) {
      const existingHistory = punches[editingIndex].history || {};
      const existingTimer = punches[editingIndex].timer;
      const existingTimerStatus = punches[editingIndex].timerStatus;
      const existingTimed = punches[editingIndex].timed;
      const existingId = punches[editingIndex].id;
      const mergedHistory = { ...existingHistory, ...plan.history };

      if (existingHistory[today]) {
        mergedHistory[today] = {
          ...existingHistory[today],
          maxPunches: dailyTimes
        };
      }

      plan.history = mergedHistory;
      plan.timer = existingTimer || plan.timer;
      plan.timerStatus = existingTimerStatus || plan.timerStatus;
      plan.timed = existingTimed || plan.timed;
      plan.id = existingId;

      punches[editingIndex] = { ...punches[editingIndex], ...plan };
      console.log('修改计划，索引:', editingIndex, 'ID:', plan.id);
    } else {
      plan.id = 'punch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      punches.unshift(plan);
      console.log('新增计划，ID:', plan.id);
    }

    if (processedIcon) {
      console.log('添加新图标到最近使用列表');
      await addToRecentIcons(processedIcon);
    }

    saveAndRender();
    newPlanPage.style.display = 'none';

    punchSection.classList.add('active');
    timeSection.classList.remove('active');
    calendarSection.classList.remove('active');
    journalSection.classList.remove('active');
    navPunch.classList.add('active');
    navTime.classList.remove('active');
    navCalendar.classList.remove('active');
    if (navJournal) navJournal.classList.remove('active');

    console.log('保存完成，返回打卡页面');
  };
}

if (endPlanBtn) {
  endPlanBtn.onclick = async () => {
    const name = document.getElementById('plan-name').value.trim();
    if (!name) {
      alert('请输入卡片名称');
      return;
    }

    if (!confirm('确定要结束这个计划吗？结束后将无法再打卡，但历史记录会保留。')) {
      return;
    }

    const today = getTodayDateString();

    const processedIcon = await processImageData(currentIcon);

    const plan = {
      name,
      icon: processedIcon,
      desc: document.getElementById('plan-desc').value,
      frequency: 'once',
      dailyTimes: 1,
      days: [],
      enableTimer: false,
      reminderTime: '',
      timerType: 'countup',
      timer: null,
      timerStatus: 'init',
      timerInterval: null,
      paused: false,
      timed: false,
      countdown: null,
      history: {
        [today]: {
          checked: true,
          checkedTime: getCurrentTimeString(),
          lastUpdate: getCurrentTimeString(),
          punches: 1,
          maxPunches: 1
        }
      },
      isEnded: true
    };

    if (editingIndex !== null) {
      const existingHistory = punches[editingIndex].history || {};
      const existingId = punches[editingIndex].id;
      plan.history = { ...existingHistory, ...plan.history };
      plan.id = existingId;
      punches[editingIndex] = { ...punches[editingIndex], ...plan };
    } else {
      plan.id = 'punch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      punches.unshift(plan);
    }

    if (processedIcon) {
      await addToRecentIcons(processedIcon);
    }

    saveAndRender();
    newPlanPage.style.display = 'none';

    punchSection.classList.add('active');
    timeSection.classList.remove('active');
    calendarSection.classList.remove('active');
    journalSection.classList.remove('active');
    navPunch.classList.add('active');
    navTime.classList.remove('active');
    navCalendar.classList.remove('active');
    if (navJournal) navJournal.classList.remove('active');

    showToast('计划已结束');
  };
}

async function showNewPlanPage(plan) {
  if (!newPlanPage) return;

  newPlanPage.style.display = 'flex';
  if (plan) {
    document.getElementById('plan-name').value = plan.name || '';
    document.getElementById('plan-desc').value = plan.desc || '';
    planFrequency.value = plan.frequency || 'once';
    planFrequency.onchange();
    frequencyOptions.forEach(option => {
      if (option.dataset.value === plan.frequency) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    if (plan.frequency === 'weekly' && plan.days) {
      selectedDays = [];
      plan.days.forEach(d => {
        const dayInt = parseInt(d);
        if (!isNaN(dayInt)) {
          weekdaysBtns.forEach(btn => {
            if (parseInt(btn.dataset.day) === dayInt) {
              btn.classList.add('active');
              selectedDays.push(dayInt);
            }
          });
        }
      });
    }

    if (plan.frequency === 'custom') {
      if (plan.customInterval) {
        document.getElementById('custom-interval').value = plan.customInterval;
      }

      if (plan.customUnit) {
        const unitSelect = document.getElementById('custom-unit');
        unitSelect.value = plan.customUnit;
        updateCustomFrequencyUI(plan.customUnit);

        if (plan.customUnit === 'weeks' && plan.customWeekdays) {
          customWeekdays = [...plan.customWeekdays];
          customWeekdaysBtns.forEach(btn => {
            const day = parseInt(btn.dataset.day);
            if (plan.customWeekdays.includes(day)) {
              btn.classList.add('active');
            }
          });
        }

        if (plan.customUnit === 'months') {
          if (plan.customMonthDayType) {
            document.getElementById('custom-monthday-type').value = plan.customMonthDayType;
            if (plan.customMonthDayType === 'day' && plan.customDayOfMonth) {
              document.getElementById('custom-day-of-month').value = plan.customDayOfMonth;
            } else if (plan.customMonthDayType === 'weekday') {
              if (plan.customWeekNumber) {
                document.getElementById('custom-week-number').value = plan.customWeekNumber;
              }
              if (plan.customWeekday) {
                document.getElementById('custom-weekday').value = plan.customWeekday;
              }
            }

            const event = new Event('change');
            document.getElementById('custom-monthday-type').dispatchEvent(event);
          }
        }

        if (plan.customUnit === 'years') {
          if (plan.customMonthOfYear) {
            document.getElementById('custom-month-of-year').value = plan.customMonthOfYear;
          }
          if (plan.customDayOfYear) {
            document.getElementById('custom-day-of-year').value = plan.customDayOfYear;
          }
        }
      }
    }

    if (plan.dailyTimes) {
      document.getElementById('daily-times').value = plan.dailyTimes;
    }

    const timerTypeValue = plan.enableTimer ? (plan.timerType || 'countup') : '';
    document.getElementById('timer-type').value = timerTypeValue;
    timerTypeOptions.forEach(option => {
      if (option.dataset.value === timerTypeValue) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    if (timerTypeValue === 'countdown' && plan.countdown) {
      if (countdownContainer) countdownContainer.style.display = 'block';
      if (countdownWheel) {
        const h = plan.countdown.h || 0;
        const m = plan.countdown.m || 0;
        countdownWheel.setTime(h, m);
      }
    } else {
      if (countdownContainer) countdownContainer.style.display = 'none';
    }

    document.getElementById('reminder-time').value = plan.reminderTime || '';
    editingIndex = punches.indexOf(plan);
    if (plan.icon) {
      await selectIcon(plan.icon);
    } else {
      currentIcon = '📋';
      await selectIcon(currentIcon);
    }
  }

  scrollNewPlanPageToTop();
}

async function resetPlanPage() {
  document.getElementById('plan-name').value = '';
  document.getElementById('plan-desc').value = '';
  planFrequency.value = 'once';

  const event = new Event('change');
  planFrequency.dispatchEvent(event);

  frequencyOptions.forEach(option => {
    if (option.dataset.value === 'once') {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });

  timerTypeOptions.forEach(option => option.classList.remove('selected'));
  document.getElementById('timer-type').value = '';

  if (countdownContainer) countdownContainer.style.display = 'none';
  if (countdownWheel) {
    countdownWheel.setTime(0, 0);
  }

  selectedDays = [];
  weekdaysBtns.forEach(b => b.classList.remove('active'));
  document.getElementById('daily-times').value = '1';
  document.getElementById('reminder-time').value = '';
  if (customFrequencyContainer) {
    customFrequencyContainer.style.display = 'none';
  }

  customWeekdays = [];
  if (customWeekdaysBtns.length > 0) {
    customWeekdaysBtns.forEach(b => b.classList.remove('active'));
  }

  if (editingIndex === null) {
    if (recentIcons.length > 0) {
      currentIcon = recentIcons[0];
    } else {
      currentIcon = '📋';
    }
  } else {
    currentIcon = '📋';
  }

  await selectIcon(currentIcon);
}

function formatTime(hour, minute) {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟`;
  } else {
    return `${seconds}秒`;
  }
}

function formatDurationPrecise(ms) {
  const totalMinutes = Math.round(ms / 60000);

  if (totalMinutes < 60) {
    return `${totalMinutes}分钟`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) {
      return `${hours}小时`;
    } else {
      return `${hours}小时${minutes}分钟`;
    }
  }
}

function validateTimeNotExceedCurrent(startHour, startMinute, endHour, endMinute) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const currentTimeStr = formatTime(currentHour, currentMinute);
  if (startTotalMinutes > currentTotalMinutes) {
    return { valid: false, message: `开始时间不能超过当前时间 ${currentTimeStr}` };
  }

  if (endTotalMinutes > currentTotalMinutes) {
    return { valid: false, message: `结束时间不能超过当前时间 ${currentTimeStr}` };
  }

  return { valid: true, message: '' };
}

const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthEl = document.getElementById('current-month');
const calendarGrid = document.getElementById('calendar-grid');
const dayDetailsModal = document.getElementById('day-details-modal');
const closeDayDetailsBtn = document.getElementById('close-day-details');
const selectedDateTitle = document.getElementById('selected-date-title');

function bindCalendarHeaderEvents() {
  if (currentMonthEl) {
    currentMonthEl.onclick = openYearMonthPicker;
  }

  if (prevMonthBtn) {
    prevMonthBtn.onclick = () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      renderCalendar();
    };
  }

  if (nextMonthBtn) {
    nextMonthBtn.onclick = () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      renderCalendar();
    };
  }
}

if (closeDayDetailsBtn) {
  closeDayDetailsBtn.onclick = () => {
    dayDetailsModal.style.display = 'none';
  };
}

if (dayDetailsModal) {
  dayDetailsModal.onclick = (e) => {
    if (e.target === dayDetailsModal) {
      dayDetailsModal.style.display = 'none';
    }
  };
}

async function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const today = new Date();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                     '七月', '八月', '九月', '十月', '十一月', '十二月'];

  if (currentMonthEl) {
    currentMonthEl.textContent = `${year}年 ${monthNames[month]}`;
  }

  bindCalendarHeaderEvents();

  if (!calendarGrid) return;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let firstDayOfWeek = firstDay.getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 7;
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const daysFromPrevMonth = firstDayOfWeek - 1;

  calendarGrid.innerHTML = '';

  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    createCalendarDay(date, true, today);
  }

  const daysInMonth = lastDay.getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    createCalendarDay(date, false, today);
  }

  const totalCells = 42;
  const cellsUsed = daysFromPrevMonth + daysInMonth;
  const daysFromNextMonth = totalCells - cellsUsed;

  for (let day = 1; day <= daysFromNextMonth; day++) {
    const date = new Date(year, month + 1, day);
    createCalendarDay(date, true, today);
  }
}

function createCalendarDay(date, isOtherMonth, today) {
  if (!calendarGrid) return;

  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';

  const dayNumber = date.getDate();
  const dateString = formatDate(date);
  const todayString = formatDate(today);

  if (dateString === todayString) {
    dayElement.classList.add('today');
  }

  if (isOtherMonth) {
    dayElement.classList.add('other-month');
  }

  const dayData = getDayPunchData(dateString);
  const totalPlans = dayData.totalPlans;
  const completedPlans = dayData.completedPlans;
  const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  const dayNumberElement = document.createElement('div');
  dayNumberElement.className = 'day-number';
  dayNumberElement.textContent = dayNumber;
  dayElement.appendChild(dayNumberElement);

  if (totalPlans > 0) {
    const statsElement = document.createElement('div');
    statsElement.className = 'day-stats';

    const rateElement = document.createElement('div');
    rateElement.className = 'completion-rate';
    rateElement.textContent = `${completionRate}%`;

    statsElement.appendChild(rateElement);
    dayElement.appendChild(statsElement);

    dayElement.classList.add('has-data');

    if (completionRate === 100) {
      rateElement.style.background = '#4caf50';
    } else if (completionRate >= 50) {
      rateElement.style.background = '#ff9800';
    } else if (completionRate > 0) {
      rateElement.style.background = '#ff7f50';
    }
  }

  dayElement.onclick = () => {
    showDayDetails(date, dateString, dayData);
  };

  calendarGrid.appendChild(dayElement);
}

function getDayPunchData(dateString) {
  let totalPlans = 0;
  let completedPlans = 0;
  const dayPunchItems = [];

  punches.forEach(punch => {
    const dayRecord = punch.history && punch.history[dateString];

    if (dayRecord) {
      totalPlans++;

      let isCompleted = false;
      if (punch.dailyTimes && punch.dailyTimes > 1) {
        const maxPunches = dayRecord.maxPunches || punch.dailyTimes || 1;
        isCompleted = (dayRecord.punches || 0) >= maxPunches;
      } else {
        isCompleted = dayRecord.checked === true;
      }

      if (isCompleted) {
        completedPlans++;
      }

      dayPunchItems.push({
        name: punch.name,
        icon: punch.icon,
        isCompleted: isCompleted,
        punches: dayRecord.punches || 0,
        maxPunches: dayRecord.maxPunches || punch.dailyTimes || 1,
        isTimed: dayRecord.isTimed || false,
        checkedTime: dayRecord.checkedTime,
        dailyTimes: punch.dailyTimes || 1,
        frequency: punch.frequency || 'daily',
        punch: punch
      });
    }
  });

  return {
    totalPlans,
    completedPlans,
    completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
    dayPunchItems
  };
}

async function showDayDetails(date, dateString, dayData) {
  if (!dayDetailsModal || !selectedDateTitle) return;

  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  selectedDateTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${dayOfWeek}`;

  document.getElementById('total-plans').textContent = dayData.totalPlans;
  document.getElementById('completed-plans').textContent = dayData.completedPlans;
  document.getElementById('completion-rate').textContent = `${Math.round(dayData.completionRate)}%`;

  const dayPunchItemsContainer = document.getElementById('day-punch-items');
  if (!dayPunchItemsContainer) return;

  dayPunchItemsContainer.innerHTML = '';

  selectedDayPunchItems = dayData.dayPunchItems;

  if (dayData.dayPunchItems.length === 0) {
    const noDataElement = document.createElement('div');
    noDataElement.className = 'day-punch-item';
    noDataElement.style.justifyContent = 'center';
    noDataElement.style.color = '#999';
    noDataElement.innerHTML = '<span>该日期没有打卡记录</span>';
    dayPunchItemsContainer.appendChild(noDataElement);
  } else {
    for (const item of dayData.dayPunchItems) {
      const punchItemElement = document.createElement('div');
      punchItemElement.className = `day-punch-item ${item.isCompleted ? 'completed' : 'not-completed'}`;
      punchItemElement.dataset.planName = item.name;
      punchItemElement.dataset.itemIndex = dayData.dayPunchItems.indexOf(item);

      let statusText = '';
      if (item.isTimed) {
        statusText = '已计时';
      } else if (item.maxPunches > 1) {
        statusText = `${item.punches}/${item.maxPunches}次`;
      } else {
        statusText = item.isCompleted ? '已完成' : '未完成';
      }

      if (item.checkedTime && item.isCompleted) {
        const time = new Date(item.checkedTime);
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        statusText += ` ${hours}:${minutes}`;
      }

      let iconHTML = '';
      if (item.icon && item.icon.startsWith('db:')) {
        iconHTML = `<img src="" alt="${item.name}" style="width:24px;height:24px;border-radius:4px;" data-image-id="${item.icon.substring(3)}" class="lazy-image">`;
      } else if (item.icon && item.icon.startsWith('data:image')) {
        iconHTML = `<img src="${item.icon}" alt="${item.name}" style="width:24px;height:24px;border-radius:4px;">`;
      } else {
        iconHTML = `<span>${item.icon || '📋'}</span>`;
      }

      const actionsHTML = `
        <div class="day-punch-item-actions">
          <button class="day-punch-action-btn day-punch-retroactive-btn" data-action="retroactive" data-index="${dayData.dayPunchItems.indexOf(item)}" title="补签">
            ${retroactiveSVG}
          </button>
          <button class="day-punch-action-btn day-punch-undo-btn" data-action="undo" data-index="${dayData.dayPunchItems.indexOf(item)}" title="撤销">
            ${undoSVG}
          </button>
        </div>
      `;

      punchItemElement.innerHTML = `
        <div class="day-punch-item-content">
          <div class="day-punch-item-icon">${iconHTML}</div>
          <div class="day-punch-item-info">
            <div class="day-punch-item-name">${item.name}</div>
            <div class="day-punch-item-status">${statusText}</div>
          </div>
        </div>
        ${actionsHTML}
      `;

      if (item.icon && item.icon.startsWith('db:')) {
        const img = punchItemElement.querySelector('img');
        if (img) {
          getImageData(item.icon).then(imageData => {
            if (imageData && img.parentNode) {
              img.src = imageData;
            }
          });
        }
      }

      dayPunchItemsContainer.appendChild(punchItemElement);

      const retroactiveBtn = punchItemElement.querySelector('.day-punch-retroactive-btn');
      const undoBtn = punchItemElement.querySelector('.day-punch-undo-btn');

      const today = new Date();
      const selectedDate = new Date(dateString);
      if (selectedDate > today) {
        retroactiveBtn.disabled = true;
        retroactiveBtn.style.opacity = '0.5';
        retroactiveBtn.style.cursor = 'not-allowed';
      }

      if (item.isCompleted) {
        retroactiveBtn.disabled = true;
        retroactiveBtn.style.opacity = '0.5';
        retroactiveBtn.style.cursor = 'not-allowed';
      }

      retroactiveBtn.onclick = function(e) {
        e.stopPropagation();
        const itemIndex = parseInt(this.dataset.index);
        retroactivePunch(itemIndex, dateString);
      };

      undoBtn.onclick = function(e) {
        e.stopPropagation();
        const itemIndex = parseInt(this.dataset.index);
        undoPunch(itemIndex, dateString);
      };
    }
  }

  selectedDayForActions = dateString;
  dayDetailsModal.style.display = 'flex';
}

function retroactivePunch(itemIndex, dateString) {
  if (itemIndex < 0 || itemIndex >= selectedDayPunchItems.length) {
    alert('无效的计划索引');
    return;
  }

  const item = selectedDayPunchItems[itemIndex];

  if (item.isCompleted) {
    alert('该计划已打卡，无法补签');
    return;
  }

  const today = new Date();
  const selectedDate = new Date(dateString);
  if (selectedDate > today) {
    alert('不能为未来日期补签');
    return;
  }

  if (!confirm(`确定要为 ${dateString} 的"${item.name}"计划补签吗？`)) {
    return;
  }

  const punch = punches.find(p => p.name === item.name);
  if (!punch) {
    alert('未找到该计划');
    return;
  }

  if (!punch.history) {
    punch.history = {};
  }

  const dayRecord = punch.history[dateString] || {
    punches: 0,
    maxPunches: punch.dailyTimes || 1,
    lastUpdate: getCurrentTimeString()
  };

  if (punch.dailyTimes && punch.dailyTimes > 1) {
    dayRecord.punches = dayRecord.maxPunches;
    dayRecord.checked = true;
  } else {
    dayRecord.checked = true;
  }

  dayRecord.checkedTime = getCurrentTimeString();
  dayRecord.lastUpdate = getCurrentTimeString();

  punch.history[dateString] = dayRecord;

  saveAndRender();

  const date = new Date(dateString);
  const dayData = getDayPunchData(dateString);
  showDayDetails(date, dateString, dayData);

  showToast('补签成功');
}

function undoPunch(itemIndex, dateString) {
  if (itemIndex < 0 || itemIndex >= selectedDayPunchItems.length) {
    alert('无效的计划索引');
    return;
  }

  const item = selectedDayPunchItems[itemIndex];

  if (!item.punch) {
    alert('未找到该计划');
    return;
  }

  const punch = item.punch;

  if (punch.dailyTimes && punch.dailyTimes > 1) {
    if (!item.punches || item.punches === 0) {
      alert('该计划今日尚未打卡，无需撤销');
      return;
    }

    if (!confirm(`确定要撤销 ${dateString} 的"${item.name}"计划的1次打卡吗？\n当前: ${item.punches}/${item.maxPunches}次`)) {
      return;
    }

    if (!punch.history || !punch.history[dateString]) {
      alert('该日期没有打卡记录');
      return;
    }

    const dayRecord = punch.history[dateString];
    const newPunches = Math.max(0, dayRecord.punches - 1);
    dayRecord.punches = newPunches;
    dayRecord.checked = newPunches >= dayRecord.maxPunches;
    dayRecord.lastUpdate = getCurrentTimeString();
    if (newPunches === 0) {
      dayRecord.checkedTime = null;
    }

    saveAndRender();

    const date = new Date(dateString);
    const dayData = getDayPunchData(dateString);
    showDayDetails(date, dateString, dayData);

    showToast(`打卡已撤销，剩余 ${newPunches}/${dayRecord.maxPunches}次`);
  } else {
    if (!item.isCompleted) {
      alert('该计划未打卡，无需撤销');
      return;
    }

    if (!confirm(`确定要撤销 ${dateString} 的"${item.name}"计划打卡记录吗？`)) {
      return;
    }

    if (punch.history && punch.history[dateString]) {
      const dayRecord = punch.history[dateString];
      dayRecord.checked = false;
      dayRecord.checkedTime = null;
      dayRecord.lastUpdate = getCurrentTimeString();

      if (dayRecord.isTimed) {
        removeTimerSessionsForDate(punch.name, dateString);
      }

      saveAndRender();

      const date = new Date(dateString);
      const dayData = getDayPunchData(dateString);
      showDayDetails(date, dateString, dayData);

      showToast('打卡记录已撤销');
    } else {
      alert('该日期没有打卡记录');
    }
  }
}

function removeTimerSessionsForDate(punchName, date) {
  const toRemove = timerSessions.filter(s => s.date === date && s.name === punchName).map(s => s.parentId);
  [...new Set(toRemove)].forEach(pid => deleteTimerSessionsByParentId(pid));
}

function openYearMonthPicker() {
  selectedYear = currentCalendarDate.getFullYear();
  selectedMonth = currentCalendarDate.getMonth() + 1;

  if (currentYearEl) {
    currentYearEl.textContent = selectedYear;
  }

  monthItems.forEach(item => {
    item.classList.remove('selected');
    if (parseInt(item.dataset.month) === selectedMonth) {
      item.classList.add('selected');
    }
  });

  if (yearMonthPickerModal) {
    yearMonthPickerModal.style.display = 'flex';
  }
}

function closeYearMonthPicker() {
  if (yearMonthPickerModal) {
    yearMonthPickerModal.style.display = 'none';
  }
}

function initYearMonthPicker() {
  if (closeYearMonthPickerBtn) {
    closeYearMonthPickerBtn.onclick = closeYearMonthPicker;
  }

  if (prevYearBtn) {
    prevYearBtn.onclick = () => {
      selectedYear--;
      if (currentYearEl) currentYearEl.textContent = selectedYear;
    };
  }

  if (nextYearBtn) {
    nextYearBtn.onclick = () => {
      selectedYear++;
      if (currentYearEl) currentYearEl.textContent = selectedYear;
    };
  }

  if (monthItems.length > 0) {
    monthItems.forEach(item => {
      item.onclick = () => {
        monthItems.forEach(m => m.classList.remove('selected'));
        item.classList.add('selected');
        selectedMonth = parseInt(item.dataset.month);
      };
    });
  }

  if (confirmYearMonthBtn) {
    confirmYearMonthBtn.onclick = () => {
      currentCalendarDate = new Date(selectedYear, selectedMonth - 1, 1);
      renderCalendar();
      closeYearMonthPicker();
    };
  }

  if (yearMonthPickerModal) {
    yearMonthPickerModal.onclick = (e) => {
      if (e.target === yearMonthPickerModal) {
        closeYearMonthPicker();
      }
    };
  }
}

function renderCardCapsules(containerId, selectedCardName = null, isAddMode = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (punches.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-capsule-msg';
    emptyMsg.textContent = '暂无卡片，请先创建打卡计划';
    emptyMsg.style.color = '#999';
    emptyMsg.style.padding = '12px';
    container.appendChild(emptyMsg);
    
    if (isAddMode) {
      const saveBtn = document.getElementById('save-new-timer-record');
      if (saveBtn) saveBtn.disabled = true;
    }
    return;
  } else {
    if (isAddMode) {
      const saveBtn = document.getElementById('save-new-timer-record');
      if (saveBtn) saveBtn.disabled = false;
    }
  }
  
  const uniqueCardNames = [...new Set(punches.map(p => p.name))];
  
  uniqueCardNames.forEach(name => {
    const capsule = document.createElement('div');
    capsule.className = 'card-capsule';
    capsule.dataset.cardName = name;
    capsule.textContent = name;
    
    const color = getFixedColorForCard(name);
    capsule.style.backgroundColor = `rgba(${hexToRgb(color)}, 0.2)`;
    capsule.style.borderColor = color;
    
    if (selectedCardName === name) {
      capsule.classList.add('selected');
      capsule.style.backgroundColor = color;
      capsule.style.color = '#fff';
    }
    
    capsule.addEventListener('click', function(e) {
      container.querySelectorAll('.card-capsule').forEach(c => {
        c.classList.remove('selected');
        const origColor = getFixedColorForCard(c.dataset.cardName);
        c.style.backgroundColor = `rgba(${hexToRgb(origColor)}, 0.2)`;
        c.style.color = '#333';
      });
      this.classList.add('selected');
      this.style.backgroundColor = color;
      this.style.color = '#fff';
    });
    
    container.appendChild(capsule);
  });
}

function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `${r},${g},${b}`;
}

function initWheelControl(container, config) {
  const valueDisplay = container.querySelector('.wheel-value');
  if (!valueDisplay) return;
  let currentValue = config.initialValue;
  const min = config.min;
  const max = config.max;
  const step = config.step || 1;
  const onUpdate = config.onUpdate;
  const formatDisplay = config.formatDisplay || ((val) => val.toString());

  function setValue(newVal) {
    let val = Math.min(max, Math.max(min, newVal));
    if (config.type === 'hour' && val === 24) {
      val = 24;
    }
    if (config.type === 'minute' && config.hourValue && config.hourValue() === 24) {
      val = 0;
    }
    currentValue = val;
    valueDisplay.textContent = formatDisplay(val);
    if (onUpdate) onUpdate(val);
    if (config.type === 'minute' && config.hourValue && config.hourValue() === 24) {
      if (currentValue !== 0) setValue(0);
    }
  }

  function increment() {
    let newVal = currentValue + step;
    if (config.type === 'hour' && newVal > 24) newVal = 0;
    setValue(newVal);
  }

  function decrement() {
    let newVal = currentValue - step;
    if (config.type === 'hour' && newVal < 0) newVal = 24;
    setValue(newVal);
  }

  let startY = 0;
  let startVal = 0;
  valueDisplay.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    startVal = currentValue;
    e.preventDefault();
  });
  valueDisplay.addEventListener('touchmove', (e) => {
    const deltaY = e.touches[0].clientY - startY;
    const deltaVal = Math.floor(deltaY / 15) * step;
    let newVal = startVal - deltaVal;
    if (config.type === 'hour' && newVal > 24) newVal = 0;
    if (config.type === 'hour' && newVal < 0) newVal = 24;
    setValue(newVal);
    e.preventDefault();
  });
  valueDisplay.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      increment();
    } else {
      decrement();
    }
  });

  setValue(currentValue);
  return { setValue, getValue: () => currentValue };
}

function initDateWheel(container, initialDate, onUpdate) {
  const yearPart = container.querySelector('[data-part="year"]');
  const monthPart = container.querySelector('[data-part="month"]');
  const dayPart = container.querySelector('[data-part="day"]');
  let currentYear = initialDate.getFullYear();
  let currentMonth = initialDate.getMonth() + 1;
  let currentDay = initialDate.getDate();
  const today = new Date();
  const maxYear = today.getFullYear();

  function formatNumber(val, digits = 2) {
    return val.toString().padStart(digits, '0');
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function updateDayLimits() {
    const maxDay = getDaysInMonth(currentYear, currentMonth);
    if (currentDay > maxDay) currentDay = maxDay;
    if (dayPart) dayPart.textContent = formatNumber(currentDay);
  }

  function updateHidden() {
    const dateStr = `${currentYear}-${formatNumber(currentMonth)}-${formatNumber(currentDay)}`;
    if (onUpdate) onUpdate(dateStr);
  }

  initWheelControl({ querySelector: () => yearPart, ...yearPart.parentElement }, {
    initialValue: currentYear,
    min: 2000,
    max: maxYear,
    step: 1,
    type: 'year',
    formatDisplay: (val) => val.toString(),
    onUpdate: (val) => { currentYear = val; updateDayLimits(); updateHidden(); }
  });
  initWheelControl({ querySelector: () => monthPart, ...monthPart.parentElement }, {
    initialValue: currentMonth,
    min: 1,
    max: 12,
    step: 1,
    type: 'month',
    formatDisplay: (val) => formatNumber(val),
    onUpdate: (val) => { currentMonth = val; updateDayLimits(); updateHidden(); }
  });
  initWheelControl({ querySelector: () => dayPart, ...dayPart.parentElement }, {
    initialValue: currentDay,
    min: 1,
    max: getDaysInMonth(currentYear, currentMonth),
    step: 1,
    type: 'day',
    formatDisplay: (val) => formatNumber(val),
    onUpdate: (val) => { currentDay = val; updateDayLimits(); updateHidden(); }
  });

  updateDayLimits();
  updateHidden();
  return { setDate: (d) => { currentYear = d.getFullYear(); currentMonth = d.getMonth()+1; currentDay = d.getDate(); updateDayLimits(); updateHidden(); } };
}

function initTimeWheel(container, initialHour, initialMinute, onUpdate) {
  const hourPart = container.querySelector('[data-part="hour"]');
  const minutePart = container.querySelector('[data-part="minute"]');
  let currentHour = initialHour;
  let currentMinute = initialMinute;

  function formatHour(val) {
    return val.toString().padStart(2, '0');
  }
  function formatMinute(val) {
    return val.toString().padStart(2, '0');
  }

  function updateHidden() {
    if (onUpdate) onUpdate(currentHour, currentMinute);
  }

  let hourControl = initWheelControl({ querySelector: () => hourPart, ...hourPart.parentElement }, {
    initialValue: currentHour,
    min: 0,
    max: 24,
    step: 1,
    type: 'hour',
    formatDisplay: formatHour,
    onUpdate: (val) => {
      currentHour = val;
      if (currentHour === 24) {
        currentMinute = 0;
        minuteControl.setValue(0);
      }
      updateHidden();
    }
  });
  let minuteControl = initWheelControl({ querySelector: () => minutePart, ...minutePart.parentElement }, {
    initialValue: currentMinute,
    min: 0,
    max: 59,
    step: 1,
    type: 'minute',
    formatDisplay: formatMinute,
    hourValue: () => currentHour,
    onUpdate: (val) => { currentMinute = val; updateHidden(); }
  });
  updateHidden();
  return { setTime: (h,m) => { currentHour=h; currentMinute=m; hourControl.setValue(h); minuteControl.setValue(m); updateHidden(); }, getHour: () => currentHour, getMinute: () => currentMinute };
}

let addStartDateWheel, addStartTimeWheel, addEndDateWheel, addEndTimeWheel;
let editStartDateWheel, editStartTimeWheel, editEndDateWheel, editEndTimeWheel;

function initAllWheels() {
  const addStartDateContainer = document.querySelector('#add-timer-modal .date-wheel-container[data-type="add-start-date"]');
  const addStartTimeContainer = document.querySelector('#add-timer-modal .time-wheel-container[data-type="add-start-time"]');
  const addEndDateContainer = document.querySelector('#add-timer-modal .date-wheel-container[data-type="add-end-date"]');
  const addEndTimeContainer = document.querySelector('#add-timer-modal .time-wheel-container[data-type="add-end-time"]');
  if (addStartDateContainer) {
    addStartDateWheel = initDateWheel(addStartDateContainer, new Date(), (dateStr) => { if (addStartDate) addStartDate.value = dateStr; });
  }
  if (addStartTimeContainer) {
    addStartTimeWheel = initTimeWheel(addStartTimeContainer, 0, 0, (h,m) => { if (addStartTime) addStartTime.value = formatTime(h,m); });
  }
  if (addEndDateContainer) {
    addEndDateWheel = initDateWheel(addEndDateContainer, new Date(), (dateStr) => { if (addEndDate) addEndDate.value = dateStr; });
  }
  if (addEndTimeContainer) {
    addEndTimeWheel = initTimeWheel(addEndTimeContainer, 0, 0, (h,m) => { if (addEndTime) addEndTime.value = formatTime(h,m); });
  }
  const editStartDateContainer = document.querySelector('#edit-timer-modal .date-wheel-container[data-type="edit-start-date"]');
  const editStartTimeContainer = document.querySelector('#edit-timer-modal .time-wheel-container[data-type="edit-start-time"]');
  const editEndDateContainer = document.querySelector('#edit-timer-modal .date-wheel-container[data-type="edit-end-date"]');
  const editEndTimeContainer = document.querySelector('#edit-timer-modal .time-wheel-container[data-type="edit-end-time"]');
  if (editStartDateContainer) {
    editStartDateWheel = initDateWheel(editStartDateContainer, new Date(), (dateStr) => { if (editStartDate) editStartDate.value = dateStr; });
  }
  if (editStartTimeContainer) {
    editStartTimeWheel = initTimeWheel(editStartTimeContainer, 0, 0, (h,m) => { if (editStartTime) editStartTime.value = formatTime(h,m); });
  }
  if (editEndDateContainer) {
    editEndDateWheel = initDateWheel(editEndDateContainer, new Date(), (dateStr) => { if (editEndDate) editEndDate.value = dateStr; });
  }
  if (editEndTimeContainer) {
    editEndTimeWheel = initTimeWheel(editEndTimeContainer, 0, 0, (h,m) => { if (editEndTime) editEndTime.value = formatTime(h,m); });
  }

  const countdownWheelContainer = document.getElementById('countdown-wheel');
  if (countdownWheelContainer) {
    countdownWheel = initTimeWheel(countdownWheelContainer, 0, 0, (h, m) => {});
  }
}

function updateAddModalDateValues(startDateObj, endDateObj, startHour, startMinute, endHour, endMinute) {
  if (addStartDateWheel && startDateObj) addStartDateWheel.setDate(startDateObj);
  if (addStartTimeWheel) addStartTimeWheel.setTime(startHour, startMinute);
  if (addEndDateWheel && endDateObj) addEndDateWheel.setDate(endDateObj);
  if (addEndTimeWheel) addEndTimeWheel.setTime(endHour, endMinute);
}

function updateEditModalDateValues(startDateObj, endDateObj, startHour, startMinute, endHour, endMinute) {
  if (editStartDateWheel && startDateObj) editStartDateWheel.setDate(startDateObj);
  if (editStartTimeWheel) editStartTimeWheel.setTime(startHour, startMinute);
  if (editEndDateWheel && endDateObj) editEndDateWheel.setDate(endDateObj);
  if (editEndTimeWheel) editEndTimeWheel.setTime(endHour, endMinute);
}

function openAddTimerModal(startHour = 0, startMinute = 0, endHour = 0, endMinute = 0, dateObj = null) {
  const viewDate = dateObj instanceof Date ? dateObj : currentTimeViewDate;
  const today = new Date();
  const isToday = viewDate.toDateString() === today.toDateString();
  
  let startDateObj = new Date(viewDate);
  startDateObj.setHours(0, 0, 0, 0);
  let endDateObj = new Date(viewDate);
  
  let displayStartHour = startHour;
  let displayStartMinute = startMinute;
  let displayEndHour = endHour;
  let displayEndMinute = endMinute;
  
  if (startHour !== 0 || startMinute !== 0 || endHour !== 0 || endMinute !== 0) {
    startDateObj.setHours(startHour, startMinute, 0, 0);
    if (endHour === 24) {
      endDateObj.setHours(23, 59, 59, 999);
      displayEndHour = 24;
      displayEndMinute = 0;
    } else {
      endDateObj.setHours(endHour, endMinute, 0, 0);
    }
  } else {
    if (isToday) {
      const now = new Date();
      endDateObj.setHours(now.getHours(), now.getMinutes(), 0, 0);
      if (endDateObj <= startDateObj) {
        endDateObj.setMinutes(endDateObj.getMinutes() + 1);
      }
    } else {
      endDateObj.setHours(23, 59, 0, 0);
    }
    displayEndHour = endDateObj.getHours();
    displayEndMinute = endDateObj.getMinutes();
  }

  if (endDateObj.toDateString() !== startDateObj.toDateString()) {
    endDateObj = new Date(startDateObj);
    endDateObj.setHours(23, 59, 59, 999);
    displayEndHour = 24;
    displayEndMinute = 0;
  }
  if (endDateObj <= startDateObj) {
    endDateObj = new Date(startDateObj);
    endDateObj.setHours(23, 59, 59, 999);
    displayEndHour = 24;
    displayEndMinute = 0;
  }

  updateAddModalDateValues(startDateObj, endDateObj, displayStartHour, displayStartMinute, displayEndHour, displayEndMinute);
  addTimeWarning.style.display = 'none';
  
  let defaultCard = punches.length > 0 ? punches[0].name : null;
  renderCardCapsules('add-card-capsule-container', defaultCard, true);
  
  if (addTimerModal) {
    addTimerModal.style.display = 'flex';
  }
}

function openEditTimerModal(sessionOrParentId, sessionsList) {
  let parentId, startDateObj, endDateObj, cardName;
  
  if (typeof sessionOrParentId === 'string') {
    parentId = sessionOrParentId;
    const relatedSessions = timerSessions.filter(s => s.parentId === parentId);
    if (relatedSessions.length === 0) return;
    const sorted = relatedSessions.sort((a,b) => new Date(a.date + 'T' + formatTime(a.startHour,a.startMinute)) - new Date(b.date + 'T' + formatTime(b.startHour,b.startMinute)));
    const first = sorted[0];
    const last = sorted[sorted.length-1];
    startDateObj = new Date(first.date + 'T' + formatTime(first.startHour, first.startMinute));
    endDateObj = new Date(last.date + 'T' + formatTime(last.endHour, last.endMinute));
    cardName = first.name;
  } else if (sessionOrParentId && sessionOrParentId.id) {
    const s = sessionOrParentId;
    parentId = s.parentId || s.id;
    startDateObj = new Date(s.date + 'T' + formatTime(s.startHour, s.startMinute));
    endDateObj = new Date(s.date + 'T' + formatTime(s.endHour, s.endMinute));
    if (endDateObj < startDateObj) {
      endDateObj.setDate(endDateObj.getDate() + 1);
    }
    cardName = s.name;
  } else {
    return;
  }
  
  let displayEndHour = endDateObj.getHours();
  let displayEndMinute = endDateObj.getMinutes();
  if (displayEndHour === 23 && displayEndMinute === 59) {
    displayEndHour = 24;
    displayEndMinute = 0;
  }
  
  updateEditModalDateValues(startDateObj, endDateObj, startDateObj.getHours(), startDateObj.getMinutes(), displayEndHour, displayEndMinute);
  currentEditingParentId = parentId;
  renderCardCapsules('edit-card-capsule-container', cardName, false);
  editTimerModal.style.display = 'flex';
  editTimeWarning.style.display = 'none';
}

function updatePunchStatusFromSessions(cardName, date) {
  const punchesToUpdate = punches.filter(p => p.name === cardName);
  if (punchesToUpdate.length === 0) return;

  const sessionsForCard = timerSessions.filter(s => s.date === date && s.name === cardName);
  const hasSessions = sessionsForCard.length > 0;

  punchesToUpdate.forEach(punch => {
    initPunchHistory(punch);
    if (!punch.history[date]) {
      punch.history[date] = {
        checked: false,
        checkedTime: null,
        lastUpdate: getCurrentTimeString(),
        punches: 0,
        maxPunches: punch.dailyTimes || 1
      };
    }
    const dayRecord = punch.history[date];
    if (hasSessions) {
      dayRecord.checked = true;
      dayRecord.isTimed = true;
      dayRecord.checkedTime = dayRecord.checkedTime || getCurrentTimeString();
      dayRecord.lastUpdate = getCurrentTimeString();
      dayRecord.punches = dayRecord.maxPunches || 1;
      if (punch.enableTimer) {
        punch.timer = null;
        punch.timerStatus = 'init';
        punch.timed = false;
      }
    } else {
      if (dayRecord.isTimed) {
        dayRecord.checked = false;
        dayRecord.isTimed = false;
        dayRecord.checkedTime = null;
        dayRecord.lastUpdate = getCurrentTimeString();
        dayRecord.punches = 0;
        if (punch.enableTimer) {
          punch.timer = null;
          punch.timerStatus = 'init';
          punch.timed = false;
        }
      }
    }
  });
}

function saveNewTimerRecord() {
  const startHour = addStartTimeWheel.getHour();
  const startMinute = addStartTimeWheel.getMinute();
  let endHour = addEndTimeWheel.getHour();
  let endMinute = addEndTimeWheel.getMinute();
  const startDateStr = addStartDate.value;
  const endDateStr = addEndDate.value;
  
  if (!startDateStr || !endDateStr) {
    addTimeWarning.textContent = '请填写完整的时间';
    addTimeWarning.style.display = 'block';
    return;
  }
  
  let startDateTime = new Date(startDateStr);
  startDateTime.setHours(startHour, startMinute, 0, 0);
  let endDateTime = new Date(endDateStr);
  
  if (endHour === 24) {
    endDateTime.setHours(23, 59, 59, 999);
  } else {
    endDateTime.setHours(endHour, endMinute, 0, 0);
  }
  
  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    addTimeWarning.textContent = '请输入有效的时间';
    addTimeWarning.style.display = 'block';
    return;
  }
  
  if (endDateTime <= startDateTime) {
    addTimeWarning.textContent = '结束时间必须晚于开始时间';
    addTimeWarning.style.display = 'block';
    return;
  }
  
  const now = new Date();
  if (endDateTime > now) {
    addTimeWarning.textContent = '结束时间不能超过当前时间';
    addTimeWarning.style.display = 'block';
    return;
  }
  
  const addContainer = document.getElementById('add-card-capsule-container');
  const selectedCapsule = addContainer ? addContainer.querySelector('.card-capsule.selected') : null;
  if (!selectedCapsule) {
    addTimeWarning.textContent = '请选择事件类型';
    addTimeWarning.style.display = 'block';
    return;
  }
  const cardName = selectedCapsule.dataset.cardName;
  
  addTimerSessions(startDateTime, endDateTime, cardName);
  
  saveToLocalStorage();
  
  if (timeSection && timeSection.classList.contains('active')) {
    renderTimeSummaryForDate(currentTimeViewDate);
  }
  renderPunchList(true);
  
  addTimerModal.style.display = 'none';
  addStartDate.value = '';
  addEndDate.value = '';
  addTimeWarning.style.display = 'none';
  
  showToast('计时记录已添加');
}

if (saveTimerRecordBtn) {
  saveTimerRecordBtn.onclick = () => {
    if (!currentEditingParentId) return;
    
    const startHour = editStartTimeWheel.getHour();
    const startMinute = editStartTimeWheel.getMinute();
    let endHour = editEndTimeWheel.getHour();
    let endMinute = editEndTimeWheel.getMinute();
    const startDateStr = editStartDate.value;
    const endDateStr = editEndDate.value;
    
    if (!startDateStr || !endDateStr) {
      editTimeWarning.textContent = '请填写完整的时间';
      editTimeWarning.style.display = 'block';
      return;
    }
    
    let startDateTime = new Date(startDateStr);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    let endDateTime = new Date(endDateStr);
    if (endHour === 24) {
      endDateTime.setHours(23, 59, 59, 999);
    } else {
      endDateTime.setHours(endHour, endMinute, 0, 0);
    }
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      editTimeWarning.textContent = '请输入有效的时间';
      editTimeWarning.style.display = 'block';
      return;
    }
    
    if (endDateTime <= startDateTime) {
      editTimeWarning.textContent = '结束时间必须晚于开始时间';
      editTimeWarning.style.display = 'block';
      return;
    }
    
    const now = new Date();
    if (endDateTime > now) {
      editTimeWarning.textContent = '结束时间不能超过当前时间';
      editTimeWarning.style.display = 'block';
      return;
    }
    
    const editContainer = document.getElementById('edit-card-capsule-container');
    const selectedCapsule = editContainer ? editContainer.querySelector('.card-capsule.selected') : null;
    if (!selectedCapsule) {
      editTimeWarning.textContent = '请选择事件类型';
      editTimeWarning.style.display = 'block';
      return;
    }
    const newCardName = selectedCapsule.dataset.cardName;
    
    modifyTimerSessions(currentEditingParentId, startDateTime, endDateTime, newCardName);
    
    saveToLocalStorage();
    
    if (timeSection && timeSection.classList.contains('active')) {
      renderTimeSummaryForDate(currentTimeViewDate);
    }
    renderPunchList(true);
    
    editTimerModal.style.display = 'none';
    resetEditTimerForm();
    
    showToast('记录已更新');
  };
}

function mergeSegments(segments, currentTimeInHours) {
  if (segments.length === 0) return [];

  const sorted = segments.sort((a, b) => a.start - b.start);
  const merged = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const segment = sorted[i];
    if (segment.start <= current.end) {
      current.end = Math.max(current.end, segment.end);
    } else {
      merged.push(current);
      current = { ...segment };
    }
  }

  merged.push(current);
  return merged.map(seg => ({
    start: seg.start,
    end: Math.min(seg.end, currentTimeInHours)
  }));
}

function renderTimeList(container, date) {
  const dateString = formatDate(date);
  const allSessions = timerSessions.filter(session => session.date === dateString);
  
  const groups = new Map();
  allSessions.forEach(s => {
    if (!groups.has(s.parentId)) groups.set(s.parentId, []);
    groups.get(s.parentId).push(s);
  });
  
  const today = new Date();
  const isToday = dateString === formatDate(today);
  let currentTimeInHours;
  if (isToday) {
    const now = new Date();
    currentTimeInHours = now.getHours() + now.getMinutes() / 60;
  } else {
    currentTimeInHours = 24;
  }
  
  const allTimerSessions = timerSessions;
  const parentAllSessionsMap = new Map();
  allTimerSessions.forEach(s => {
    if (!parentAllSessionsMap.has(s.parentId)) parentAllSessionsMap.set(s.parentId, []);
    parentAllSessionsMap.get(s.parentId).push(s);
  });
  
  const aggregatedItems = [];
  const processedParentsForAggregation = new Set();
  
  for (let [parentId, sessionsAll] of parentAllSessionsMap.entries()) {
    if (sessionsAll.length === 0) continue;
    const sorted = sessionsAll.slice().sort((a,b) => {
      const aStart = new Date(a.date + 'T' + formatTime(a.startHour, a.startMinute));
      const bStart = new Date(b.date + 'T' + formatTime(b.startHour, b.startMinute));
      return aStart - bStart;
    });
    const first = sorted[0];
    const last = sorted[sorted.length-1];
    const overallStart = new Date(first.date + 'T' + formatTime(first.startHour, first.startMinute));
    const overallEnd = new Date(last.date + 'T' + formatTime(last.endHour, last.endMinute));
    const overallDurationMs = overallEnd - overallStart;
    const overallStartDateStr = formatDate(overallStart);
    const overallEndDateStr = formatDate(overallEnd);
    if (overallStartDateStr !== overallEndDateStr && overallEndDateStr === dateString) {
      let endHour = last.endHour;
      let endMinute = last.endMinute;
      let endForBar = endHour + endMinute / 60;
      if (endHour === 23 && endMinute === 59) {
        endForBar = 24;
      }
      if (isToday && endForBar > currentTimeInHours) {
        endForBar = currentTimeInHours;
      }
      if (endForBar > 0) {
        const dayDurationMs = (endForBar - 0) * 60 * 60 * 1000;
        aggregatedItems.push({
          start: 0,
          end: endForBar,
          name: first.name,
          dayDurationMs: dayDurationMs,
          totalDurationMs: overallDurationMs,
          color: getFixedColorForCard(first.name),
          parentId: parentId,
          isRecorded: true,
          isAggregated: true,
          durationMs: dayDurationMs
        });
        processedParentsForAggregation.add(parentId);
      }
    }
  }
  
  const timeSlots = [];
  let recordedIntervals = [];
  
  aggregatedItems.forEach(item => {
    timeSlots.push(item);
    recordedIntervals.push({ start: item.start, end: item.end });
  });
  
  groups.forEach((sessions, parentId) => {
    if (processedParentsForAggregation.has(parentId)) return;
    
    const segments = sessions.map(s => {
      let start = s.startHour + s.startMinute / 60;
      let end = s.endHour + s.endMinute / 60;
      if (s.endHour === 23 && s.endMinute === 59) {
        end = 24.0;
      }
      return {
        start: start,
        end: end,
        parentId: parentId,
        name: s.name,
        session: s
      };
    }).filter(seg => seg.start < currentTimeInHours);
    
    if (segments.length === 0) return;
    const merged = mergeSegments(segments, currentTimeInHours);
    merged.forEach(seg => {
      const durationMs = (seg.end - seg.start) * 60 * 60 * 1000;
      const color = getFixedColorForCard(segments[0].name);
      timeSlots.push({
        start: seg.start,
        end: seg.end,
        name: segments[0].name,
        durationMs,
        color,
        parentId: parentId,
        isRecorded: true,
        isAggregated: false
      });
      recordedIntervals.push({ start: seg.start, end: seg.end });
    });
  });
  
  recordedIntervals.sort((a,b) => a.start - b.start);
  let current = 0;
  const unrecordedSegments = [];
  for (let interval of recordedIntervals) {
    if (interval.start > current) {
      unrecordedSegments.push({ start: current, end: interval.start });
    }
    current = Math.max(current, interval.end);
  }
  if (current < currentTimeInHours) {
    unrecordedSegments.push({ start: current, end: currentTimeInHours });
  }
  
  let unrecordedTotalMinutes = 0;
  unrecordedSegments.forEach(seg => {
    const durationHours = seg.end - seg.start;
    unrecordedTotalMinutes += durationHours * 60;
    const durationMs = durationHours * 60 * 60 * 1000;
    timeSlots.push({
      start: seg.start,
      end: seg.end,
      name: '未记录',
      durationMs,
      color: '#D0D0D0',
      parentId: null,
      isRecorded: false
    });
  });
  
  timeSlots.sort((a, b) => a.start - b.start);
  
  container.innerHTML = '';
  const totalMinutesToday = currentTimeInHours * 60;
  
  if (unrecordedTotalMinutes > 0) {
    const totalUnrecordedDuration = Math.round(unrecordedTotalMinutes * 60 * 1000);
    const unrecordedPercentage = (unrecordedTotalMinutes / totalMinutesToday) * 100;
    const totalItem = document.createElement('div');
    totalItem.className = 'legend-item time-slot-item unrecorded-total-item';
    totalItem.innerHTML = `
      <div style="width: 100%;">
        <div class="slot-header">
          <span class="slot-time">未记录总计</span>
          <span class="slot-name" style="color: #777;">全天未记录时长</span>
          <span class="slot-duration">${formatDurationPrecise(totalUnrecordedDuration)}</span>
        </div>
        <div class="horizontal-bar-container">
          <div class="horizontal-bar-fill" style="width: ${unrecordedPercentage}%; background-color: #B0B0B0;"></div>
        </div>
      </div>
    `;
    container.appendChild(totalItem);
  }
  
  function formatHourFloat(hourFloat) {
    if (hourFloat >= 23.98333 && hourFloat <= 24) {
      return "24:00";
    }
    const h = Math.floor(hourFloat);
    const m = Math.round((hourFloat - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  
  if (timeSlots.length === 0) {
    const noDataItem = document.createElement('div');
    noDataItem.className = 'legend-item';
    noDataItem.style.justifyContent = 'center';
    noDataItem.style.color = '#999';
    noDataItem.innerHTML = '<span>该日期暂无计时记录</span>';
    container.appendChild(noDataItem);
  } else {
    timeSlots.forEach(slot => {
      const startStr = formatHourFloat(slot.start);
      const endStr = formatHourFloat(slot.end);
      let durationText;
      if (slot.isAggregated && slot.totalDurationMs) {
        const dayDuration = slot.dayDurationMs || slot.durationMs;
        durationText = `${formatDurationPrecise(dayDuration)} (总计${formatDurationPrecise(slot.totalDurationMs)})`;
      } else {
        durationText = formatDurationPrecise(slot.durationMs);
      }
      const color = slot.color;
      const slotMinutes = (slot.end - slot.start) * 60;
      const percentage = totalMinutesToday > 0 ? (slotMinutes / totalMinutesToday) * 100 : 0;
      
      const slotItem = document.createElement('div');
      slotItem.className = 'legend-item time-slot-item';
      slotItem.innerHTML = `
        <div style="width: 100%;">
          <div class="slot-header">
            <span class="slot-time">${startStr} - ${endStr}</span>
            <span class="slot-name" style="color: ${color};">${slot.name}</span>
            <span class="slot-duration">${durationText}</span>
          </div>
          <div class="horizontal-bar-container">
            <div class="horizontal-bar-fill" style="width: ${percentage}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
      
      slotItem.addEventListener('click', () => {
        if (slot.isRecorded && slot.parentId) {
          openEditTimerModal(slot.parentId);
        } else if (!slot.isRecorded) {
          const startHour = Math.floor(slot.start);
          const startMinute = Math.round((slot.start - startHour) * 60);
          const endHour = Math.floor(slot.end);
          const endMinute = Math.round((slot.end - endHour) * 60);
          openAddTimerModal(startHour, startMinute, endHour, endMinute, date);
        }
      });
      
      container.appendChild(slotItem);
    });
  }
}

let currentTimeViewDate = new Date();
const timeHeader = document.getElementById('time-header');
const prevTimeDayBtn = document.getElementById('prev-time-day');
const nextTimeDayBtn = document.getElementById('next-time-day');
const currentTimeDateEl = document.getElementById('current-time-date');
const timeDatePicker = document.getElementById('time-date-picker');

function updateTimeHeader() {
  if (currentTimeDateEl) {
    const today = new Date();
    const year = currentTimeViewDate.getFullYear();
    const month = currentTimeViewDate.getMonth() + 1;
    const day = currentTimeViewDate.getDate();
    const isToday = currentTimeViewDate.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = currentTimeViewDate.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      currentTimeDateEl.textContent = '今日';
    } else if (isYesterday) {
      currentTimeDateEl.textContent = '昨日';
    } else {
      currentTimeDateEl.textContent = `${year}年${month}月${day}日`;
    }
  }
  if (timeDatePicker) {
    timeDatePicker.value = formatDate(currentTimeViewDate);
  }
}

function renderTimeSummaryForDate(date) {
  const legendContainer = document.getElementById('chart-legend');
  if (!legendContainer) return;
  renderTimeList(legendContainer, date);
}

if (prevTimeDayBtn) {
  prevTimeDayBtn.addEventListener('click', () => {
    currentTimeViewDate.setDate(currentTimeViewDate.getDate() - 1);
    updateTimeHeader();
    renderTimeSummaryForDate(currentTimeViewDate);
  });
}

if (nextTimeDayBtn) {
  nextTimeDayBtn.addEventListener('click', () => {
    const newDate = new Date(currentTimeViewDate);
    newDate.setDate(newDate.getDate() + 1);
    const today = new Date();
    if (newDate > today) {
      showToast('不能查看未来日期');
      return;
    }
    currentTimeViewDate = newDate;
    updateTimeHeader();
    renderTimeSummaryForDate(currentTimeViewDate);
  });
}

const datePickerModal = document.getElementById('date-picker-modal');
const closeDatePickerBtn = document.getElementById('close-date-picker');
const dpPrevMonth = document.getElementById('dp-prev-month');
const dpNextMonth = document.getElementById('dp-next-month');
const dpCurrentMonth = document.getElementById('dp-current-month');
const datePickerGrid = document.getElementById('date-picker-grid');
const confirmDatePickerBtn = document.getElementById('confirm-date-picker');

let tempSelectedDate = new Date();
let currentPickerYearMonth = new Date();

function initDatePicker() {
  if (!datePickerModal) return;

  if (closeDatePickerBtn) {
    closeDatePickerBtn.onclick = closeDatePickerModal;
  }

  datePickerModal.onclick = (e) => {
    if (e.target === datePickerModal) {
      closeDatePickerModal();
    }
  };

  if (dpPrevMonth) {
    dpPrevMonth.onclick = () => {
      currentPickerYearMonth.setMonth(currentPickerYearMonth.getMonth() - 1);
      renderDatePickerCalendar();
    };
  }
  if (dpNextMonth) {
    dpNextMonth.onclick = () => {
      currentPickerYearMonth.setMonth(currentPickerYearMonth.getMonth() + 1);
      renderDatePickerCalendar();
    };
  }

  if (confirmDatePickerBtn) {
    confirmDatePickerBtn.onclick = () => {
      currentTimeViewDate = new Date(tempSelectedDate);
      updateTimeHeader();
      renderTimeSummaryForDate(currentTimeViewDate);
      closeDatePickerModal();
    };
  }
}

function openDatePickerModal() {
  tempSelectedDate = new Date(currentTimeViewDate);
  currentPickerYearMonth = new Date(tempSelectedDate);
  renderDatePickerCalendar();
  datePickerModal.style.display = 'flex';
}

function closeDatePickerModal() {
  datePickerModal.style.display = 'none';
}

function renderDatePickerCalendar() {
  if (!datePickerGrid || !dpCurrentMonth) return;

  const year = currentPickerYearMonth.getFullYear();
  const month = currentPickerYearMonth.getMonth();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                     '七月', '八月', '九月', '十月', '十一月', '十二月'];

  dpCurrentMonth.textContent = year + '年 ' + monthNames[month];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let firstDayOfWeek = firstDay.getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 7;
  const daysInMonth = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const daysFromPrevMonth = firstDayOfWeek - 1;

  datePickerGrid.innerHTML = '';

  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const cell = document.createElement('div');
    cell.className = 'calendar-day other-month';
    cell.textContent = day;
    datePickerGrid.appendChild(cell);
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    cell.textContent = day;

    if (tempSelectedDate && date.toDateString() === tempSelectedDate.toDateString()) {
      cell.classList.add('today');
    }

    if (date > today) {
      cell.classList.add('other-month');
      cell.style.pointerEvents = 'none';
    } else {
      cell.onclick = () => {
        document.querySelectorAll('#date-picker-grid .calendar-day.today').forEach(el => el.classList.remove('today'));
        cell.classList.add('today');
        tempSelectedDate = new Date(date);
      };
    }

    datePickerGrid.appendChild(cell);
  }

  const totalCells = 42;
  const currentCells = datePickerGrid.children.length;
  const daysFromNextMonth = totalCells - currentCells;
  for (let day = 1; day <= daysFromNextMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day other-month';
    cell.textContent = day;
    datePickerGrid.appendChild(cell);
  }
}

if (currentTimeDateEl) {
  currentTimeDateEl.onclick = openDatePickerModal;
}

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const hideInactivePlansCheckbox = document.getElementById('hide-inactive-plans');
const saveSettingsBtn = document.getElementById('save-settings');

if (settingsBtn) {
  settingsBtn.onclick = () => {
    if (hideInactivePlansCheckbox) hideInactivePlansCheckbox.checked = hideInactivePlans;
    if (settingsModal) settingsModal.style.display = 'flex';
  };
}

if (closeSettingsBtn) {
  closeSettingsBtn.onclick = () => {
    if (settingsModal) settingsModal.style.display = 'none';
  };
}

if (settingsModal) {
  settingsModal.onclick = (e) => {
    if (e.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  };
}

if (saveSettingsBtn) {
  saveSettingsBtn.onclick = () => {
    if (hideInactivePlansCheckbox) hideInactivePlans = hideInactivePlansCheckbox.checked;

    localStorage.setItem('hideInactivePlans', JSON.stringify(hideInactivePlans));

    saveAndRender();

    if (settingsModal) settingsModal.style.display = 'none';
  };
}

if (closeEditTimerBtn) {
  closeEditTimerBtn.onclick = () => {
    editTimerModal.style.display = 'none';
    resetEditTimerForm();
  };
}

if (editTimerModal) {
  editTimerModal.onclick = (e) => {
    if (e.target === editTimerModal) {
      editTimerModal.style.display = 'none';
      resetEditTimerForm();
    }
  };
}

if (deleteTimerRecordBtn) {
  deleteTimerRecordBtn.onclick = () => {
    if (!currentEditingParentId) return;
    
    if (confirm('确定要删除这条计时记录吗？')) {
      deleteTimerSessionsByParentId(currentEditingParentId);
      
      saveToLocalStorage();
      
      if (timeSection && timeSection.classList.contains('active')) {
        renderTimeSummaryForDate(currentTimeViewDate);
      }
      renderPunchList(true);
      
      editTimerModal.style.display = 'none';
      resetEditTimerForm();
      
      showToast('记录已删除');
    }
  };
}

function resetEditTimerForm() {
  editStartDate.value = '';
  editEndDate.value = '';
  editTimeWarning.style.display = 'none';
  currentEditingParentId = null;
}

if (closeAddTimerBtn) {
  closeAddTimerBtn.onclick = () => {
    addTimerModal.style.display = 'none';
    addStartDate.value = '';
    addEndDate.value = '';
    addTimeWarning.style.display = 'none';
  };
}

if (addTimerModal) {
  addTimerModal.onclick = (e) => {
    if (e.target === addTimerModal) {
      addTimerModal.style.display = 'none';
      addStartDate.value = '';
      addEndDate.value = '';
      addTimeWarning.style.display = 'none';
    }
  };
}

if (saveNewTimerRecordBtn) {
  saveNewTimerRecordBtn.onclick = saveNewTimerRecord;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (editTimerModal && editTimerModal.style.display === 'flex') {
      editTimerModal.style.display = 'none';
      resetEditTimerForm();
    }

    if (addTimerModal && addTimerModal.style.display === 'flex') {
      addTimerModal.style.display = 'none';
      addStartDate.value = '';
      addEndDate.value = '';
      addTimeWarning.style.display = 'none';
    }

    if (yearMonthPickerModal && yearMonthPickerModal.style.display === 'flex') {
      closeYearMonthPicker();
    }

    if (datePickerModal && datePickerModal.style.display === 'flex') {
      closeDatePickerModal();
    }
  }

  if (e.key === 'Enter' && editTimerModal && editTimerModal.style.display === 'flex' &&
      document.activeElement.tagName !== 'BUTTON') {
    saveTimerRecordBtn.click();
  }

  if (e.key === 'Enter' && addTimerModal && addTimerModal.style.display === 'flex' &&
      document.activeElement.tagName !== 'BUTTON') {
    saveNewTimerRecordBtn.click();
  }
});

const remainingEl = document.getElementById('remaining-time');
function updateRemainingTime() {
  if (!remainingEl) return;
  
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const diff = end - now;
  if (diff <= 0) {
    remainingEl.textContent = `今日剩余 0小时00分钟`;
    return;
  }
  
  const totalMinutes = Math.ceil(diff / (1000 * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const formattedMinutes = m < 10 ? '0' + m : m;
  remainingEl.textContent = `今日剩余 ${h}小时${formattedMinutes}分钟`;
}

updateRemainingTime();
setInterval(updateRemainingTime, 60000);

function updateHeaderButtons() {
  if (punchSection && punchSection.classList.contains('active')) {
    punchHeaderButtons.style.display = 'flex';
    if (todayHeaderBtn) todayHeaderBtn.style.display = 'none';
    if (journalAddBookBtn) journalAddBookBtn.style.display = 'none';
    document.getElementById('header').classList.remove('journal-header');
  } else if (timeSection && timeSection.classList.contains('active')) {
    if (punchHeaderButtons) punchHeaderButtons.style.display = 'none';
    if (todayHeaderBtn) todayHeaderBtn.style.display = 'flex';
    if (journalAddBookBtn) journalAddBookBtn.style.display = 'none';
    document.getElementById('header').classList.remove('journal-header');
  } else if (calendarSection && calendarSection.classList.contains('active')) {
    if (punchHeaderButtons) punchHeaderButtons.style.display = 'none';
    if (todayHeaderBtn) todayHeaderBtn.style.display = 'flex';
    if (journalAddBookBtn) journalAddBookBtn.style.display = 'none';
    document.getElementById('header').classList.remove('journal-header');
  } else if (journalSection && journalSection.classList.contains('active')) {
    if (punchHeaderButtons) punchHeaderButtons.style.display = 'none';
    if (todayHeaderBtn) todayHeaderBtn.style.display = 'none';
    if (journalAddBookBtn) journalAddBookBtn.style.display = 'flex';
    document.getElementById('header').classList.add('journal-header');
  }
}

if (navPunch) navPunch.onclick = () => {
  punchSection.classList.add('active');
  timeSection.classList.remove('active');
  calendarSection.classList.remove('active');
  journalSection.classList.remove('active');
  navPunch.classList.add('active');
  navTime.classList.remove('active');
  navCalendar.classList.remove('active');
  if (navJournal) navJournal.classList.remove('active');
  updateHeaderButtons();
};

if (navTime) navTime.onclick = () => {
  punchSection.classList.remove('active');
  timeSection.classList.add('active');
  calendarSection.classList.remove('active');
  journalSection.classList.remove('active');
  navPunch.classList.remove('active');
  navTime.classList.add('active');
  navCalendar.classList.remove('active');
  if (navJournal) navJournal.classList.remove('active');
  updateTimeHeader();
  renderTimeSummaryForDate(currentTimeViewDate);
  updateHeaderButtons();
};

if (navCalendar) navCalendar.onclick = () => {
  punchSection.classList.remove('active');
  timeSection.classList.remove('active');
  calendarSection.classList.add('active');
  journalSection.classList.remove('active');
  navPunch.classList.remove('active');
  navTime.classList.remove('active');
  navCalendar.classList.add('active');
  if (navJournal) navJournal.classList.remove('active');
  renderCalendar();
  updateHeaderButtons();
};

if (navJournal) {
  navJournal.onclick = () => {
    punchSection.classList.remove('active');
    timeSection.classList.remove('active');
    calendarSection.classList.remove('active');
    journalSection.classList.add('active');
    navPunch.classList.remove('active');
    navTime.classList.remove('active');
    navCalendar.classList.remove('active');
    navJournal.classList.add('active');
    if (typeof refreshJournalOnShow === 'function') refreshJournalOnShow();
    updateHeaderButtons();
  };
}

if (todayHeaderBtn) {
  todayHeaderBtn.onclick = function() {
    if (timeSection && timeSection.classList.contains('active')) {
      currentTimeViewDate = new Date();
      updateTimeHeader();
      renderTimeSummaryForDate(currentTimeViewDate);
    } else if (calendarSection && calendarSection.classList.contains('active')) {
      currentCalendarDate = new Date();
      renderCalendar();
    } else if (journalSection && journalSection.classList.contains('active')) {
      if (typeof onJournalToday === 'function') onJournalToday();
    }
  };
}

function initPunchAudio() {
  punchAudio = new Audio('https://cdn.pixabay.com/download/audio/2025/06/12/audio_7ed2bad56c.mp3?filename=ui-sounds-pack-2-sound-1-358893.mp3');
  punchAudio.preload = 'auto';
  punchAudio.volume = 0.3;
  
  punchAudio.muted = true;
  const playPromise = punchAudio.play();
  
  if (playPromise !== undefined) {
    playPromise.then(_ => {
      punchAudio.pause();
      punchAudio.muted = false;
      punchAudio.currentTime = 0;
    }).catch(error => {
      console.log("音效预加载完成");
      punchAudio.muted = false;
    });
  }
}

function playPunchSound() {
  if (!punchAudio) return;
  
  try {
    punchAudio.currentTime = 0;
    punchAudio.play().catch(e => {
      console.log("音效播放失败，可能是浏览器策略限制:", e);
    });
  } catch (e) {
    console.log("播放音效时出错:", e);
  }
}

function scrollNewPlanPageToTop() {
  setTimeout(() => {
    const contentWrapper = document.querySelector('#new-plan-page .content-wrapper');
    if (contentWrapper) {
      contentWrapper.scrollTop = 0;
      const planNameInput = document.getElementById('plan-name');
      if (planNameInput) {
        planNameInput.focus();
        planNameInput.select();
      }
    }
  }, 0);
}

function initFrequencyCards() {
  frequencyOptions.forEach(option => {
    option.addEventListener('click', function() {
      const value = this.dataset.value;
      
      frequencyOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      document.getElementById('plan-frequency').value = value;
      
      const event = new Event('change');
      document.getElementById('plan-frequency').dispatchEvent(event);
    });
  });
  
  const onceOption = document.querySelector('.frequency-option[data-value="once"]');
  if (onceOption) {
    onceOption.classList.add('selected');
  }
}

function initTimerTypeCards() {
  timerTypeOptions.forEach(option => {
    option.addEventListener('click', function() {
      const value = this.dataset.value;
      const timerTypeInput = document.getElementById('timer-type');
      
      if (this.classList.contains('selected')) {
        this.classList.remove('selected');
        timerTypeInput.value = '';
        
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) {
          countdownContainer.style.display = 'none';
        }
      } else {
        timerTypeOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        timerTypeInput.value = value;
        
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) {
          countdownContainer.style.display = value === 'countdown' ? 'block' : 'none';
        }
      }
    });
  });
}

// ========== 番茄钟功能 ==========
let currentTomatoPunch = null;
let tomatoTimerInterval = null;
let tomatoAnimationFrame = null;

const tomatoModal = document.getElementById('tomato-modal');
const tomatoCardNameSpan = document.getElementById('tomato-card-name');
const tomatoTimeDisplaySpan = document.getElementById('tomato-time-display');
const tomatoStartBtn = document.getElementById('tomato-start');
const tomatoPauseBtn = document.getElementById('tomato-pause');
const tomatoResetBtn = document.getElementById('tomato-reset');
const tomatoCompleteBtn = document.getElementById('tomato-complete');
const closeTomatoBtn = document.getElementById('close-tomato');
const tomatoProgressRing = document.getElementById('tomato-progress-ring');

const CIRCUMFERENCE = 2 * Math.PI * 95;

function formatTomatoTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTomatoRing(progress) {
  if (!tomatoProgressRing) return;
  const dashArray = CIRCUMFERENCE * progress;
  tomatoProgressRing.setAttribute('stroke-dasharray', `${dashArray} ${CIRCUMFERENCE}`);
}

function updateTomatoDisplayAndRing() {
  if (!currentTomatoPunch) return;
  let elapsed = 0;
  if (currentTomatoPunch.timer && currentTomatoPunch.timerStatus === 'running') {
    elapsed = Date.now() - currentTomatoPunch.timer.startTime;
  } else if (currentTomatoPunch.timer && currentTomatoPunch.timer.elapsed) {
    elapsed = currentTomatoPunch.timer.elapsed;
  }
  let displayMs = 0;
  let totalMs = 0;
  let progress = 0;
  if (currentTomatoPunch.timerType === 'countup') {
    displayMs = elapsed;
    totalMs = 3600000;
    progress = Math.min(1, elapsed / totalMs);
  } else if (currentTomatoPunch.timerType === 'countdown' && currentTomatoPunch.countdown) {
    totalMs = (currentTomatoPunch.countdown.h * 3600 + currentTomatoPunch.countdown.m * 60 + currentTomatoPunch.countdown.s) * 1000;
    displayMs = Math.max(0, totalMs - elapsed);
    progress = totalMs > 0 ? (totalMs - elapsed) / totalMs : 0;
    if (progress < 0) progress = 0;
  }
  const timeText = formatTomatoTime(displayMs);
  if (tomatoTimeDisplaySpan) tomatoTimeDisplaySpan.textContent = timeText;
  updateTomatoRing(progress);
}

function startTomatoTimer() {
  if (tomatoTimerInterval) clearInterval(tomatoTimerInterval);
  if (tomatoAnimationFrame) cancelAnimationFrame(tomatoAnimationFrame);
  let lastUpdate = performance.now();
  function updateLoop(now) {
    if (currentTomatoPunch && currentTomatoPunch.timerStatus === 'running') {
      updateTomatoDisplayAndRing();
      if (currentTomatoPunch.timerType === 'countdown' && currentTomatoPunch.countdown) {
        const totalMs = (currentTomatoPunch.countdown.h * 3600 + currentTomatoPunch.countdown.m * 60 + currentTomatoPunch.countdown.s) * 1000;
        const elapsed = Date.now() - currentTomatoPunch.timer.startTime;
        if (elapsed >= totalMs) {
          const today = getTodayDateString();
          if (!isPunchDoneToday(currentTomatoPunch)) {
            currentTomatoPunch.timed = true;
            currentTomatoPunch.timerStatus = 'init';
            currentTomatoPunch.timer = null;
            initPunchHistory(currentTomatoPunch);
            currentTomatoPunch.history[today] = {
              checked: true,
              checkedTime: getCurrentTimeString(),
              lastUpdate: getCurrentTimeString(),
              isTimed: true,
              punches: 1,
              maxPunches: currentTomatoPunch.dailyTimes || 1
            };
            saveToLocalStorage();
            renderPunchList(true);
            showToast('🍅 番茄钟完成，自动打卡！');
            closeTomatoModal();
            return;
          }
        }
      }
    }
    tomatoAnimationFrame = requestAnimationFrame(updateLoop);
  }
  tomatoAnimationFrame = requestAnimationFrame(updateLoop);
}

function openTomatoModal(punch) {
  if (!punch.enableTimer) return;
  currentTomatoPunch = punch;
  tomatoCardNameSpan.textContent = `🍅 ${punch.name}`;
  updateTomatoDisplayAndRing();
  tomatoModal.style.display = 'flex';
  startTomatoTimer();
}

function closeTomatoModal() {
  if (tomatoAnimationFrame) {
    cancelAnimationFrame(tomatoAnimationFrame);
    tomatoAnimationFrame = null;
  }
  tomatoModal.style.display = 'none';
  currentTomatoPunch = null;
}

function tomatoStart() {
  if (!currentTomatoPunch) return;
  if (currentTomatoPunch.timerStatus === 'running') return;
  if (currentTomatoPunch.timerStatus === 'paused' || currentTomatoPunch.timerStatus === 'init') {
    if (!currentTomatoPunch.timer) {
      currentTomatoPunch.timer = { elapsed: 0, startTime: Date.now(), updateCount: 0 };
    } else {
      currentTomatoPunch.timer.startTime = Date.now() - (currentTomatoPunch.timer.elapsed || 0);
    }
    currentTomatoPunch.timerStatus = 'running';
    saveToLocalStorage();
    updateTomatoDisplayAndRing();
    renderPunchList(true);
  }
}

function tomatoPause() {
  if (!currentTomatoPunch) return;
  if (currentTomatoPunch.timerStatus === 'running') {
    if (currentTomatoPunch.timer && currentTomatoPunch.timer.startTime) {
      currentTomatoPunch.timer.elapsed = Date.now() - currentTomatoPunch.timer.startTime;
    }
    currentTomatoPunch.timerStatus = 'paused';
    saveToLocalStorage();
    updateTomatoDisplayAndRing();
    renderPunchList(true);
  }
}

function tomatoReset() {
  if (!currentTomatoPunch) return;
  if (currentTomatoPunch.timerInterval) clearInterval(currentTomatoPunch.timerInterval);
  currentTomatoPunch.timer = null;
  currentTomatoPunch.timerStatus = 'init';
  currentTomatoPunch.timed = false;
  currentTomatoPunch.paused = false;
  saveToLocalStorage();
  updateTomatoDisplayAndRing();
  renderPunchList(true);
}

function tomatoComplete() {
  if (!currentTomatoPunch) return;
  const today = getTodayDateString();
  if (!isPunchDoneToday(currentTomatoPunch)) {
    if (currentTomatoPunch.enableTimer && currentTomatoPunch.timer && currentTomatoPunch.timer.startTime) {
      const startTime = new Date(currentTomatoPunch.timer.startTime);
      const endTime = new Date();
      const duration = currentTomatoPunch.timer.elapsed || (Date.now() - currentTomatoPunch.timer.startTime);
      recordTimerSession(currentTomatoPunch.name, startTime, endTime, duration);
    }
    currentTomatoPunch.timed = true;
    currentTomatoPunch.timerStatus = 'init';
    currentTomatoPunch.timer = null;
    initPunchHistory(currentTomatoPunch);
    currentTomatoPunch.history[today] = {
      checked: true,
      checkedTime: getCurrentTimeString(),
      lastUpdate: getCurrentTimeString(),
      isTimed: true,
      punches: 1,
      maxPunches: currentTomatoPunch.dailyTimes || 1
    };
    saveToLocalStorage();
    renderPunchList(true);
    showToast('✅ 打卡完成！');
    closeTomatoModal();
  } else {
    showToast('今日已完成打卡');
    closeTomatoModal();
  }
}

if (tomatoStartBtn) tomatoStartBtn.onclick = tomatoStart;
if (tomatoPauseBtn) tomatoPauseBtn.onclick = tomatoPause;
if (tomatoResetBtn) tomatoResetBtn.onclick = tomatoReset;
if (tomatoCompleteBtn) tomatoCompleteBtn.onclick = tomatoComplete;
if (closeTomatoBtn) closeTomatoBtn.onclick = closeTomatoModal;
if (tomatoModal) {
  tomatoModal.onclick = (e) => {
    if (e.target === tomatoModal) closeTomatoModal();
  };
}

// ========== 日记模块：多书架翻页日记本（含拖拽排序） ==========
let books = [];
let activeBookId = null;
let activeBook = null;
let isAnimating = false;
let autoSaveTimer = null;
let isGlobalEditMode = false;
let longPressTimerGlobal = null;

// DOM 元素
const bookshelfView = document.getElementById('bookshelfView');
const notebookView = document.getElementById('notebookView');
const booksGrid = document.getElementById('booksGrid');
const pageCard = document.getElementById('pageCard');
const diaryTitle = document.getElementById('diaryTitle');
const diaryContent = document.getElementById('diaryContent');
const pageNumDisplay = document.getElementById('pageNumDisplay');
const pageCounterSpan = document.getElementById('pageCounter');
const lastEditedSpan = document.getElementById('lastEditedTime');
const fontSelect = document.getElementById('fontSelect');
const quickPageSlider = document.getElementById('quickPageSlider');
const quickPageValue = document.getElementById('quickPageValue');
const sliderBubble = document.getElementById('sliderBubble');
const bubbleLine1 = document.getElementById('bubbleLine1');
const bubbleLine2 = document.getElementById('bubbleLine2');
const editModeTip = document.getElementById('editModeTip');

function formatShortDate(dateObj) {
    const d = new Date(dateObj);
    return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function formatTimeDiary(dateObj) {
    const d = new Date(dateObj);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function saveBooksToLocal() {
    localStorage.setItem('paper_multi_books', JSON.stringify(books));
}
function syncActiveBookToBooks() {
    if (!activeBookId || !activeBook) return;
    const index = books.findIndex(b => b.id === activeBookId);
    if (index !== -1) {
        books[index] = JSON.parse(JSON.stringify(activeBook));
        saveBooksToLocal();
    }
}
function renderActiveBookUI() {
    if (!activeBook || activeBook.pages.length === 0) return;
    const page = activeBook.pages[activeBook.currentPageIndex];
    if (!page) return;
    diaryTitle.value = page.title;
    diaryContent.value = page.content;
    pageNumDisplay.innerText = `第 ${activeBook.currentPageIndex + 1} 页`;
    pageCounterSpan.innerText = `${activeBook.currentPageIndex + 1} / ${activeBook.pages.length}`;
    quickPageSlider.min = 1;
    quickPageSlider.max = activeBook.pages.length;
    quickPageSlider.value = activeBook.currentPageIndex + 1;
    quickPageValue.innerText = `${activeBook.currentPageIndex + 1} / ${activeBook.pages.length}`;
    updateLastEditedTime(page.updatedAt);
    applyFontSetting();
}
function updateLastEditedTime(isoString) {
    if (isoString) lastEditedSpan.innerHTML = `<i class="far fa-clock"></i> ${formatTimeDiary(isoString)}`;
    else lastEditedSpan.innerHTML = `<i class="far fa-clock"></i> ${formatTimeDiary(new Date())}`;
}
function syncCurrentPageFromUI() {
    if (!activeBook || !activeBook.pages[activeBook.currentPageIndex]) return;
    const newTitle = diaryTitle.value.trim() === "" ? "无题日记" : diaryTitle.value;
    const newContent = diaryContent.value;
    const currPage = activeBook.pages[activeBook.currentPageIndex];
    if (currPage.title !== newTitle || currPage.content !== newContent) {
        currPage.title = newTitle;
        currPage.content = newContent;
        currPage.updatedAt = new Date().toISOString();
        updateLastEditedTime(currPage.updatedAt);
        syncActiveBookToBooks();
    }
}
function flipToPage(targetIndex, skipIfSame = false) {
    if (isAnimating) return Promise.reject("动画中");
    if (!activeBook) return Promise.reject();
    if (targetIndex === activeBook.currentPageIndex && skipIfSame) return Promise.resolve();
    if (targetIndex < 0 || targetIndex >= activeBook.pages.length) return Promise.reject("越界");
    syncCurrentPageFromUI();
    return new Promise((resolve) => {
        isAnimating = true;
        pageCard.classList.add('flip-out');
        const finishOut = () => {
            pageCard.classList.remove('flip-out');
            activeBook.currentPageIndex = targetIndex;
            renderActiveBookUI();
            pageCard.classList.add('flip-in');
            setTimeout(() => {
                pageCard.classList.remove('flip-in');
                isAnimating = false;
                syncActiveBookToBooks();
                resolve();
            }, 260);
            pageCard.removeEventListener('transitionend', finishOut);
        };
        pageCard.addEventListener('transitionend', finishOut, { once: true });
        setTimeout(() => {
            if (isAnimating) {
                pageCard.classList.remove('flip-out');
                activeBook.currentPageIndex = targetIndex;
                renderActiveBookUI();
                pageCard.classList.add('flip-in');
                setTimeout(() => {
                    pageCard.classList.remove('flip-in');
                    isAnimating = false;
                    syncActiveBookToBooks();
                    resolve();
                }, 250);
            }
        }, 320);
    });
}
function nextPageDiary() {
    if (isAnimating || !activeBook) return;
    if (activeBook.currentPageIndex + 1 < activeBook.pages.length) flipToPage(activeBook.currentPageIndex + 1);
    else { pageCard.style.transform = "translateX(2px)"; setTimeout(() => { if(pageCard) pageCard.style.transform = ""; }, 120); }
}
function prevPageDiary() {
    if (isAnimating || !activeBook) return;
    if (activeBook.currentPageIndex - 1 >= 0) flipToPage(activeBook.currentPageIndex - 1);
    else { pageCard.style.transform = "translateX(-2px)"; setTimeout(() => { if(pageCard) pageCard.style.transform = ""; }, 120); }
}
function addNewDiaryPage() {
    if (isAnimating || !activeBook) return;
    syncCurrentPageFromUI();
    const newPage = { id: Date.now() + Math.random(), title: "✨ 新的一页", content: "", updatedAt: new Date().toISOString() };
    activeBook.pages.push(newPage);
    flipToPage(activeBook.pages.length - 1, true).then(() => syncActiveBookToBooks());
}
function deleteCurrentPage() {
    if (isAnimating || !activeBook) return;
    if (activeBook.pages.length <= 1) {
        const confirmReset = confirm("这是最后一页日记，无法删除。\n是否清空内容并重置为空白页？");
        if (confirmReset) {
            syncCurrentPageFromUI();
            activeBook.pages[activeBook.currentPageIndex].title = "新的起点";
            activeBook.pages[activeBook.currentPageIndex].content = "";
            activeBook.pages[activeBook.currentPageIndex].updatedAt = new Date().toISOString();
            renderActiveBookUI();
            syncActiveBookToBooks();
        }
        return;
    }
    syncCurrentPageFromUI();
    activeBook.pages.splice(activeBook.currentPageIndex, 1);
    let newIndex = activeBook.currentPageIndex;
    if (newIndex >= activeBook.pages.length) newIndex = activeBook.pages.length - 1;
    flipToPage(newIndex, true).then(() => syncActiveBookToBooks());
}
function applyFontSetting() {
    const selected = fontSelect.value;
    if (selected === 'mashanzheng') {
        diaryContent.style.fontFamily = "'Ma Shan Zheng', '华文行书', 'KaiTi', cursive";
        diaryTitle.style.fontFamily = "'Ma Shan Zheng', '华文行书', 'KaiTi', cursive";
    } else {
        diaryContent.style.fontFamily = "'Inter', 'Segoe UI', system-ui";
        diaryTitle.style.fontFamily = "'Caveat', cursive";
    }
    diaryContent.style.lineHeight = "32px";
}
function initQuickSlider() {
    const slider = quickPageSlider;
    let pendingPage = null;
    let bubbleTimeout = null;
    const updateBubble = (pageNum) => {
        if (!activeBook) return;
        const pageIndex = pageNum - 1;
        if (pageIndex >= 0 && pageIndex < activeBook.pages.length) {
            const page = activeBook.pages[pageIndex];
            const dateStr = page.updatedAt ? formatShortDate(page.updatedAt) : "无日期";
            let title = page.title || "无标题";
            if (title.length > 14) title = title.substring(0, 12) + "...";
            bubbleLine1.textContent = `第${pageNum}页 · ${dateStr}`;
            bubbleLine2.textContent = title;
        } else {
            bubbleLine1.textContent = `第${pageNum}页`;
            bubbleLine2.textContent = "—";
        }
        sliderBubble.style.opacity = '1';
        if (bubbleTimeout) clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => {
            sliderBubble.style.opacity = '0';
        }, 800);
    };
    slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        quickPageValue.innerText = `${val} / ${activeBook.pages.length}`;
        pendingPage = val - 1;
        updateBubble(val);
    });
    slider.addEventListener('change', () => {
        if (pendingPage !== null && activeBook && !isAnimating && pendingPage !== activeBook.currentPageIndex) {
            flipToPage(pendingPage);
            pendingPage = null;
        }
        sliderBubble.style.opacity = '0';
    });
    slider.addEventListener('touchend', () => {
        if (pendingPage !== null && activeBook && !isAnimating && pendingPage !== activeBook.currentPageIndex) {
            flipToPage(pendingPage);
            pendingPage = null;
        }
        sliderBubble.style.opacity = '0';
    });
}
let touchStartXDiary = 0, touchStartYDiary = 0, isSwipingDiary = false;
function initTouchSwipeDiary() {
    const card = document.getElementById('pageCard');
    if (!card) return;
    card.addEventListener('touchstart', onTouchStartDiary, { passive: false });
    card.addEventListener('touchmove', onTouchMoveDiary, { passive: false });
    card.addEventListener('touchend', onTouchEndDiary);
}
function removeTouchSwipeDiary() {
    const card = document.getElementById('pageCard');
    if (card) {
        card.removeEventListener('touchstart', onTouchStartDiary);
        card.removeEventListener('touchmove', onTouchMoveDiary);
        card.removeEventListener('touchend', onTouchEndDiary);
    }
}
function onTouchStartDiary(e) {
    if (isAnimating || !activeBook) return;
    const touch = e.touches[0];
    touchStartXDiary = touch.clientX;
    touchStartYDiary = touch.clientY;
    isSwipingDiary = true;
}
function onTouchMoveDiary(e) {
    if (!isSwipingDiary || isAnimating || !activeBook) return;
    const deltaX = e.touches[0].clientX - touchStartXDiary;
    const deltaY = e.touches[0].clientY - touchStartYDiary;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) e.preventDefault();
}
function onTouchEndDiary(e) {
    if (!isSwipingDiary || isAnimating || !activeBook) { isSwipingDiary = false; return; }
    const deltaX = e.changedTouches[0].clientX - touchStartXDiary;
    if (Math.abs(deltaX) > 35) deltaX > 0 ? prevPageDiary() : nextPageDiary();
    isSwipingDiary = false;
}
function exitEditModeDiary() {
    if (!isGlobalEditMode) return;
    isGlobalEditMode = false;
    document.body.classList.remove('edit-mode-active');
    if (editModeTip) editModeTip.innerHTML = '';
    document.removeEventListener('click', handleOutsideClickDiary);
    document.removeEventListener('touchstart', handleOutsideClickDiary);
    disableDiaryDragSort();
}
function enterEditModeDiary() {
    if (isGlobalEditMode) return;
    isGlobalEditMode = true;
    document.body.classList.add('edit-mode-active');
    if (editModeTip) editModeTip.innerHTML = ''; // 去除提示文字
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClickDiary);
        document.addEventListener('touchstart', handleOutsideClickDiary);
    }, 100);
    enableDiaryDragSort();
}
function handleOutsideClickDiary(e) {
    if (!isGlobalEditMode) return;
    const isBookCard = e.target.closest('.book-card');
    if (!isBookCard) {
        exitEditModeDiary();
    }
}
function bindLongPressOnBooks() {
    const cards = document.querySelectorAll('.book-card');
    cards.forEach(card => {
        let pressTimer = null;
        const startLongPress = () => {
            if (isGlobalEditMode) return;
            pressTimer = setTimeout(() => {
                enterEditModeDiary();
            }, 500);
        };
        const cancelLongPress = () => {
            if (pressTimer) clearTimeout(pressTimer);
        };
        card.addEventListener('touchstart', startLongPress);
        card.addEventListener('touchend', cancelLongPress);
        card.addEventListener('touchmove', cancelLongPress);
        card.addEventListener('mousedown', startLongPress);
        card.addEventListener('mouseup', cancelLongPress);
        card.addEventListener('mouseleave', cancelLongPress);
    });
}
function openBookDiary(bookId) {
    if (isGlobalEditMode) return;
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    activeBookId = book.id;
    activeBook = JSON.parse(JSON.stringify(book));
    activeBook.pages = activeBook.pages.map(p => ({ ...p, content: p.content || "", title: p.title || "无题" }));
    if (!activeBook.currentPageIndex) activeBook.currentPageIndex = 0;
    renderActiveBookUI();
    bookshelfView.style.display = 'none';
    notebookView.style.display = 'block';
    removeTouchSwipeDiary();
    initTouchSwipeDiary();
    syncActiveBookToBooks();
}
function closeNotebookDiary() {
    if (activeBook) {
        syncCurrentPageFromUI();
        const idx = books.findIndex(b => b.id === activeBookId);
        if (idx !== -1) books[idx] = JSON.parse(JSON.stringify(activeBook));
        saveBooksToLocal();
    }
    activeBook = null; activeBookId = null;
    bookshelfView.style.display = 'block';
    notebookView.style.display = 'none';
    removeTouchSwipeDiary();
    renderBookshelfUI();
    exitEditModeDiary();
}

// ========== 修复：新建日记本，取消时不应创建 ==========
function createNewBook() {
    let bookName = prompt("📓 给新日记本起个名字吧", "手札·时光集");
    // 如果用户点击取消（bookName === null），则直接返回，不创建日记本
    if (bookName === null) return;
    if (!bookName.trim()) bookName = "未名日记";
    const newBook = { id: Date.now(), name: bookName.slice(0, 20), coverColor: "#faf2e4", pages: [{ id: Date.now()+1, title: "扉页 · 新旅程", content: "翻开崭新的日记本，记录此刻的心情。\n愿每一页都充满温度。", updatedAt: new Date().toISOString() }], currentPageIndex: 0, createdAt: new Date().toISOString() };
    books.push(newBook);
    saveBooksToLocal();
    renderBookshelfUI();
}

function deleteBook(bookId, event) {
    event.stopPropagation();
    if (!isGlobalEditMode) return;
    if (books.length <= 1) { alert("至少保留一本日记本，无法删除。"); return; }
    books = books.filter(b => b.id !== bookId);
    if (activeBookId === bookId) closeNotebookDiary();
    saveBooksToLocal();
    renderBookshelfUI();
}
function renderBookshelfUI() {
    if (!booksGrid) return;
    if (books.length === 0) { booksGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem;">✨ 点击上方按钮创建你的第一本日记 ✨</div>`; return; }
    booksGrid.innerHTML = books.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover-icon"><i class="fas fa-journal-whills"></i></div>
            <div class="book-title">${escapeHtml(book.name)}</div>
            <div class="book-meta"><span><i class="far fa-file-alt"></i> ${book.pages.length}页</span></div>
            <button class="delete-book-btn" data-id="${book.id}" title="删除日记本"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');
    document.querySelectorAll('.book-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        card.addEventListener('click', (e) => {
            if (e.target.closest('.delete-book-btn')) return;
            openBookDiary(id);
        });
        const delBtn = card.querySelector('.delete-book-btn');
        if (delBtn) delBtn.addEventListener('click', (e) => deleteBook(id, e));
    });
    bindLongPressOnBooks();
    if (isGlobalEditMode) {
        enableDiaryDragSort();
    }
}
function escapeHtml(str) { return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }
function initDataDiary() {
    const stored = localStorage.getItem('paper_multi_books');
    if (stored) { try { books = JSON.parse(stored); if (!books.length) throw new Error(); } catch(e) { books = []; } }
    if (!books || books.length === 0) {
        const examplePages = [
            { id: Date.now()+1, title: "午后 · 咖啡与光", content: "窗外的梧桐叶被风吹得很轻，\n翻开新笔记本的第一页，仿佛能听见纸张纤维舒展的声音。\n今天用这支新墨水写日记，心情忽然变得柔软。\n\n希望往后的日子，都能在这里种下星星。", updatedAt: new Date().toISOString() },
            { id: Date.now()+2, title: "雨天的灵感", content: "淅淅沥沥的雨，最适合窝在沙发里。\n读了半本诗集，决定把偶然想到的短句记下来：\n「记忆是倒着飞的雨滴，落进瞳孔里长成森林」\n\n写日记本身，就是一种治愈。", updatedAt: new Date().toISOString() },
            { id: Date.now()+3, title: "今日小确幸", content: "收到一束朋友寄来的干花，压在日记本的末页。\n翻页时会闻到淡淡的薰衣草气味。\n生活需要这样的仪式感，每一页都值得被温柔对待。\n\n明天也要好好记录 ✨", updatedAt: new Date().toISOString() }
        ];
        const demoBook = { id: 1001, name: "纸间·旧时光", coverColor: "#f8efdc", pages: examplePages, currentPageIndex: 0, createdAt: new Date().toISOString() };
        const secondBook = { id: 1002, name: "灵感手札", coverColor: "#f2e8d4", pages: [{ id: Date.now(), title: "开始", content: "新的故事，从今天启程。", updatedAt: new Date().toISOString() }], currentPageIndex: 0, createdAt: new Date().toISOString() };
        books = [demoBook, secondBook];
        saveBooksToLocal();
    }
    renderBookshelfUI();
}
function bindDiaryEvents() {
    document.getElementById('prevPageBtn').addEventListener('click', prevPageDiary);
    document.getElementById('nextPageBtn').addEventListener('click', nextPageDiary);
    document.getElementById('addPageBtn').addEventListener('click', addNewDiaryPage);
    document.getElementById('deletePageBtn').addEventListener('click', deleteCurrentPage);
    document.getElementById('backToShelfBtn').addEventListener('click', closeNotebookDiary);
    fontSelect.addEventListener('change', applyFontSetting);
    initQuickSlider();
    window.addEventListener('keydown', (e) => {
        if (notebookView.style.display !== 'block') return;
        if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); prevPageDiary(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); nextPageDiary(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && activeBook) syncCurrentPageFromUI(); });
    window.addEventListener('beforeunload', () => { if (activeBook) syncCurrentPageFromUI(); });
    setInterval(() => { if (activeBook && !isAnimating) syncCurrentPageFromUI(); }, 2500);
}
function setupAutoSaveDiary() {
    const saveDelayed = () => { if (autoSaveTimer) clearTimeout(autoSaveTimer); autoSaveTimer = setTimeout(() => { if (activeBook) syncCurrentPageFromUI(); }, 180); };
    diaryTitle.addEventListener('input', saveDelayed);
    diaryContent.addEventListener('input', saveDelayed);
}
function initJournalModule() {
    if (!bookshelfView || !notebookView) return;
    initDataDiary();
    setupAutoSaveDiary();
    bindDiaryEvents();
    bookshelfView.style.display = 'block';
    notebookView.style.display = 'none';
    // 绑定顶部新建日记本按钮
    if (journalAddBookBtn) {
        journalAddBookBtn.onclick = () => {
            createNewBook();
        };
    }
}
function refreshJournalOnShow() {
    if (journalSection && journalSection.classList.contains('active')) {
        if (!bookshelfView || bookshelfView.style.display === 'none') return;
    }
}
window.refreshJournalOnShow = refreshJournalOnShow;

// ========== 日记本拖拽排序功能（优化克隆样式，完全复制原始卡片样式） ==========
const diaryDragState = {
    active: false,
    dragElement: null,
    startIndex: -1,
    clone: null,
    startX: 0,
    startY: 0,
    isDragging: false,
    container: null,
    currentIndex: -1
};

function enableDiaryDragSort() {
    if (!isGlobalEditMode) return;
    const cards = document.querySelectorAll('#booksGrid .book-card');
    cards.forEach(card => {
        card.setAttribute('data-drag-enabled', 'true');
        card.removeEventListener('mousedown', onDiaryDragStart);
        card.removeEventListener('touchstart', onDiaryDragStart);
        card.addEventListener('mousedown', onDiaryDragStart);
        card.addEventListener('touchstart', onDiaryDragStart, { passive: false });
    });
}

function disableDiaryDragSort() {
    const cards = document.querySelectorAll('#booksGrid .book-card');
    cards.forEach(card => {
        card.removeEventListener('mousedown', onDiaryDragStart);
        card.removeEventListener('touchstart', onDiaryDragStart);
        card.setAttribute('data-drag-enabled', 'false');
    });
    if (diaryDragState.isDragging) {
        cleanupDiaryDrag();
    }
}

function cleanupDiaryDrag() {
    if (diaryDragState.clone && diaryDragState.clone.parentNode) {
        diaryDragState.clone.parentNode.removeChild(diaryDragState.clone);
    }
    if (diaryDragState.dragElement) {
        diaryDragState.dragElement.style.opacity = '';
        diaryDragState.dragElement.style.pointerEvents = '';
    }
    diaryDragState.isDragging = false;
    diaryDragState.dragElement = null;
    diaryDragState.clone = null;
    diaryDragState.startIndex = -1;
    diaryDragState.currentIndex = -1;
    document.removeEventListener('mousemove', onDiaryDragMove);
    document.removeEventListener('mouseup', onDiaryDragEnd);
    document.removeEventListener('touchmove', onDiaryDragMove);
    document.removeEventListener('touchend', onDiaryDragEnd);
}

function onDiaryDragStart(e) {
    if (!isGlobalEditMode) return;
    if (e.target.closest('.delete-book-btn')) return;
    e.preventDefault();
    const card = e.target.closest('.book-card');
    if (!card) return;

    let clientX, clientY;
    if (e.type === 'mousedown') {
        clientX = e.clientX;
        clientY = e.clientY;
        document.addEventListener('mousemove', onDiaryDragMove);
        document.addEventListener('mouseup', onDiaryDragEnd);
    } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        document.addEventListener('touchmove', onDiaryDragMove, { passive: false });
        document.addEventListener('touchend', onDiaryDragEnd);
    }

    diaryDragState.dragElement = card;
    diaryDragState.startX = clientX;
    diaryDragState.startY = clientY;
    diaryDragState.startIndex = Array.from(card.parentNode.children).indexOf(card);
    diaryDragState.currentIndex = diaryDragState.startIndex;
    diaryDragState.isDragging = false;
    diaryDragState.active = true;
}

function onDiaryDragMove(e) {
    if (!diaryDragState.active || !diaryDragState.dragElement) return;

    let clientX, clientY;
    if (e.type === 'mousemove') {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    }

    const dx = clientX - diaryDragState.startX;
    const dy = clientY - diaryDragState.startY;

    if (!diaryDragState.isDragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        diaryDragState.isDragging = true;
        const original = diaryDragState.dragElement;
        const rect = original.getBoundingClientRect();
        const clone = original.cloneNode(true);
        clone.classList.add('drag-clone');
        const delBtn = clone.querySelector('.delete-book-btn');
        if (delBtn) delBtn.style.display = 'none';
        clone.style.position = 'fixed';
        clone.style.top = rect.top + 'px';
        clone.style.left = rect.left + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.margin = '0';
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.transition = 'none';
        document.body.appendChild(clone);
        diaryDragState.clone = clone;
        original.style.opacity = '0';
        original.style.pointerEvents = 'none';
    }

    if (!diaryDragState.isDragging) return;

    if (diaryDragState.clone) {
        const rect = diaryDragState.dragElement.getBoundingClientRect();
        diaryDragState.clone.style.left = (clientX - rect.width / 2) + 'px';
        diaryDragState.clone.style.top = (clientY - rect.height / 2) + 'px';
    }

    const elementsAtCursor = document.elementsFromPoint(clientX, clientY);
    let targetCard = null;
    for (let el of elementsAtCursor) {
        if (el.classList && el.classList.contains('book-card') && el !== diaryDragState.dragElement) {
            targetCard = el;
            break;
        }
    }

    if (targetCard) {
        const container = document.getElementById('booksGrid');
        const children = Array.from(container.children);
        const targetIndex = children.indexOf(targetCard);
        if (targetIndex !== -1 && targetIndex !== diaryDragState.currentIndex) {
            if (targetIndex < diaryDragState.currentIndex) {
                container.insertBefore(diaryDragState.dragElement, targetCard);
            } else {
                container.insertBefore(diaryDragState.dragElement, targetCard.nextSibling);
            }
            const newOrder = [];
            for (let child of container.children) {
                const id = parseInt(child.dataset.id);
                const book = books.find(b => b.id === id);
                if (book) newOrder.push(book);
            }
            books = newOrder;
            diaryDragState.currentIndex = targetIndex;
        }
    }
}

function onDiaryDragEnd(e) {
    if (!diaryDragState.active) return;
    if (diaryDragState.isDragging && diaryDragState.dragElement) {
        diaryDragState.dragElement.style.opacity = '';
        diaryDragState.dragElement.style.pointerEvents = '';
        saveBooksToLocal();
        renderBookshelfUI();
        if (isGlobalEditMode) {
            enableDiaryDragSort();
        }
        // 已移除 showToast('日记本顺序已更新');
    }
    cleanupDiaryDrag();
    diaryDragState.active = false;
}

async function initApp() {
  try {
    const storedPunches = localStorage.getItem('punches');
    if (storedPunches) {
      punches = JSON.parse(storedPunches);
      console.log('从localStorage加载数据成功，卡片数量:', punches.length);

      const today = getTodayDateString();
      punches.forEach(p => {
        if (!p.id) {
          p.id = 'punch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        if (!p.history) {
          p.history = {};
        }

        initPunchHistory(p);

        Object.keys(p.history).forEach(date => {
          if (!p.history[date].maxPunches) {
            p.history[date].maxPunches = p.dailyTimes || 1;
          }
        });
      });
      saveToLocalStorage();
    }

    const storedSessions = localStorage.getItem('timerSessions');
    if (storedSessions) {
      timerSessions = JSON.parse(storedSessions);
      timerSessions = timerSessions.map(s => {
        if (!s.id) {
          s.id = 'ts_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return s;
      });
      localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
      console.log('加载计时器时间段数据:', timerSessions.length);
      
      migrateCrossDaySessions();
    }

    const storedColorMap = localStorage.getItem('cardColorMap');
    if (storedColorMap) {
      cardColorMap = JSON.parse(storedColorMap);
    }
  } catch (e) {
    console.error('加载数据时出错:', e);
    punches = [];
    localStorage.setItem('punches', JSON.stringify(punches));
  }

  await initImageDB();
  await migrateImagesToIndexedDB();

  startGlobalTimer();
  initPunchAudio();
  startTimeChartUpdate();

  initRecentIcons();
  renderPunchList();
  renderCalendar();

  initBackupFunction();
  initClearAllDataFunction();

  updateHeaderButtons();
  bindCalendarHeaderEvents();

  setTimeout(() => {
    initFrequencyCards();
    initTimerTypeCards();
    initAllWheels();
    initYearMonthPicker();
    initCountdownInputs();
    initDatePicker();
    initJournalModule();
  }, 200);

  if (timeDatePicker) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    timeDatePicker.max = `${year}-${month}-${day}`;
  }
  updateTimeHeader();
  
  if (currentTimeDateEl) {
    currentTimeDateEl.onclick = openDatePickerModal;
  }
}

document.addEventListener('DOMContentLoaded', initApp);

function resetAllPeriodicPlans() {
  const today = getTodayDateString();
  const todayStart = getTodayStart();

  punches.forEach(p => {
    if (isInCurrentPeriod(p)) {
      const todayRecord = p.history && p.history[today];
      const historyDates = Object.keys(p.history || {}).sort();

      if (historyDates.length > 0) {
        const lastRecordDate = new Date(historyDates[historyDates.length - 1] + 'T00:00:00');

        if (!isSameDay(lastRecordDate, todayStart)) {
          console.log(`重置卡片 ${p.name} 的打卡状态（新的一天）`);

          if (p.enableTimer && p.timed) {
            p.timed = false;
            p.timer = null;
            p.timerStatus = 'init';
          }

          p.history[today] = {
            checked: false,
            checkedTime: null,
            lastUpdate: getCurrentTimeString(),
            punches: 0,
            maxPunches: p.dailyTimes || 1
          };
        }
      }
    }
  });

  saveAndRender();
}

setTimeout(resetAllPeriodicPlans, 100);

// ========== 新增：全局阻止移动端长按弹出菜单（输入框保留） ==========
document.addEventListener('contextmenu', function(e) {
    let target = e.target;
    if (target.isContentEditable || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('input, textarea, [contenteditable="true"]')) {
        return;
    }
    e.preventDefault();
});
/* ============================================
   LITTLEBIRD — EVENTS JS
   Event CRUD, localStorage persistence, search
   ============================================ */

const Events = (() => {
  const STORAGE_KEY = 'littlebird_events';
  let events = [];
  let listeners = [];

  function init() {
    load();
  }

  // ---- Persistence ----
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      events = raw ? JSON.parse(raw) : getSampleEvents();
      if (!raw) save(); // Save samples on first load
    } catch {
      events = getSampleEvents();
      save();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    notify();
  }

  // ---- CRUD ----
  function getAll() {
    return [...events];
  }

  function getByDate(dateStr) {
    return events.filter(e => e.date === dateStr);
  }

  function getUpcoming(count = 10) {
    const today = formatDate(new Date());
    return events
      .filter(e => e.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || '');
      })
      .slice(0, count);
  }

  function getTodayCount() {
    const today = formatDate(new Date());
    return events.filter(e => e.date === today).length;
  }

  function getWeekCount() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const start = formatDate(startOfWeek);
    const end = formatDate(endOfWeek);
    return events.filter(e => e.date >= start && e.date <= end).length;
  }

  function getMonthCount(year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return events.filter(e => e.date.startsWith(prefix)).length;
  }

  function add(event) {
    event.id = generateId();
    event.createdAt = new Date().toISOString();
    events.push(event);
    save();
    return event;
  }

  function update(id, updates) {
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...updates };
    save();
    return events[idx];
  }

  function remove(id) {
    events = events.filter(e => e.id !== id);
    save();
  }

  function search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return getAll();
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      e.category.toLowerCase().includes(q)
    );
  }

  function filterByCategory(category) {
    if (!category || category === 'all') return getAll();
    return events.filter(e => e.category === category);
  }

  // ---- Change listeners ----
  function onChange(fn) {
    listeners.push(fn);
  }

  function notify() {
    listeners.forEach(fn => fn(events));
  }

  // ---- Helpers ----
  function generateId() {
    return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getSampleEvents() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return [
      { id: 'sample1', title: 'Team Standup', date: formatDate(new Date(y, m, now.getDate())), time: '09:00', category: 'meeting', notes: 'Daily sync with dev team' },
      { id: 'sample2', title: 'Design Review', date: formatDate(new Date(y, m, now.getDate())), time: '14:00', category: 'meeting', notes: 'Review Q3 dashboard mockups' },
      { id: 'sample3', title: 'Gym Session', date: formatDate(new Date(y, m, now.getDate() + 1)), time: '07:00', category: 'personal', notes: 'Leg day' },
      { id: 'sample4', title: 'Project Deadline', date: formatDate(new Date(y, m, now.getDate() + 3)), time: '17:00', category: 'deadline', notes: 'Submit final deliverables' },
      { id: 'sample5', title: 'Dentist Appointment', date: formatDate(new Date(y, m, now.getDate() + 5)), time: '10:30', category: 'personal', notes: 'Regular checkup' },
      { id: 'sample6', title: 'Sprint Planning', date: formatDate(new Date(y, m, now.getDate() + 2)), time: '11:00', category: 'meeting', notes: 'Plan next sprint backlog' },
      { id: 'sample7', title: 'Pay Rent', date: formatDate(new Date(y, m + 1, 1)), time: '09:00', category: 'reminder', notes: '' },
      { id: 'sample8', title: 'BD Sync', date: formatDate(new Date(y, m, now.getDate() - 1)), time: '15:00', category: 'meeting', notes: '3 action items, 2 decisions, 1 commitment to follow up Friday.' },
    ];
  }

  // ---- Natural Language Parser (Quick Add) ----
  function parseQuickAdd(text) {
    const lower = text.toLowerCase();
    const today = new Date();
    let date = new Date(today);
    let time = "09:00"; // default time
    
    // Simple Date Parsing
    if (lower.includes("tomorrow")) {
      date.setDate(date.getDate() + 1);
    } else if (lower.includes("next week")) {
      date.setDate(date.getDate() + 7);
    } else if (lower.match(/(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/)) {
      // Very basic specific date matching "5th oct"
      const match = lower.match(/(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
      const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
      date.setMonth(months.indexOf(match[3]));
      date.setDate(parseInt(match[1]));
    }
    
    // Simple Time Parsing
    const timeMatch = lower.match(/(\d{1,2})(:\d{2})?\s*(am|pm)/);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const min = timeMatch[2] ? timeMatch[2].substring(1) : "00";
      const ampm = timeMatch[3];
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      time = `${String(hour).padStart(2, '0')}:${min}`;
    }

    // Cleanup Title (Remove time/date words for cleaner title)
    let title = text
      .replace(/tomorrow/i, '')
      .replace(/today/i, '')
      .replace(/next week/i, '')
      .replace(/at\s+\d{1,2}(:\d{2})?\s*(am|pm)/i, '')
      .replace(/(\d{1,2})(:\d{2})?\s*(am|pm)/i, '')
      .replace(/on\s+\w+/i, '')
      .trim();

    // Default category matching based on keywords
    let category = "personal";
    if (title.toLowerCase().match(/meet|sync|call|review|standup/)) category = "meeting";
    if (title.toLowerCase().match(/deadline|due|submit/)) category = "deadline";
    if (title.toLowerCase().match(/remind|pay|buy/)) category = "reminder";

    return { title: title || "New Event", date: formatDate(date), time, category };
  }

  return { init, getAll, getByDate, getUpcoming, getTodayCount, getWeekCount, getMonthCount, add, update, remove, search, filterByCategory, onChange, formatDate, parseQuickAdd };
})();

/* ============================================
   LITTLEBIRD — TASKS JS
   ============================================ */
const Tasks = (() => {
  const STORAGE_KEY = 'littlebird_tasks';
  let tasks = [];
  let listeners = [];

  function init() { load(); }
  
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [{id: 't1', title: 'Update resume'}, {id: 't2', title: 'Buy groceries'}];
      if (!raw) save();
    } catch { tasks = []; }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    notify();
  }

  function getAll() { return [...tasks]; }
  
  function add(title) {
    const task = { id: 'tsk_' + Date.now().toString(36), title };
    tasks.push(task);
    save();
    return task;
  }
  
  function remove(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
  }

  function onChange(fn) { listeners.push(fn); }
  function notify() { listeners.forEach(fn => fn(tasks)); }

  return { init, getAll, add, remove, onChange };
})();

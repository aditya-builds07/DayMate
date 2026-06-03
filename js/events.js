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

  return { init, getAll, getByDate, getUpcoming, getTodayCount, getWeekCount, getMonthCount, add, update, remove, search, filterByCategory, onChange, formatDate };
})();

// js/api.js

/**
 * ============================================
 * LOCAL STORAGE API ABSTRACTION
 * ============================================
 * Handles CRUD operations with LocalStorage seamlessly,
 * ensuring maximum privacy and offline availability.
 */

const API = (() => {
  const EVENTS_KEY = 'littlebird_events';
  const TASKS_KEY = 'littlebird_tasks';

  function getLocalData(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  function setLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function generateId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  // --- EVENTS ---
  async function fetchEvents() {
    return getLocalData(EVENTS_KEY);
  }

  async function addEvent(data) {
    const events = getLocalData(EVENTS_KEY);
    const newEvent = { id: generateId('evt'), ...data };
    events.push(newEvent);
    setLocalData(EVENTS_KEY, events);
    return newEvent;
  }

  async function updateEvent(id, data) {
    const events = getLocalData(EVENTS_KEY);
    const idx = events.findIndex(e => e.id === id);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...data };
      setLocalData(EVENTS_KEY, events);
      return events[idx];
    }
    return null;
  }

  async function deleteEvent(id) {
    let events = getLocalData(EVENTS_KEY);
    events = events.filter(e => e.id !== id);
    setLocalData(EVENTS_KEY, events);
  }

  // --- TASKS ---
  async function fetchTasks() {
    return getLocalData(TASKS_KEY);
  }

  async function addTask(data) {
    const tasks = getLocalData(TASKS_KEY);
    const newTask = { id: generateId('tsk'), ...data };
    tasks.push(newTask);
    setLocalData(TASKS_KEY, tasks);
    return newTask;
  }

  async function updateTask(id, data) {
    const tasks = getLocalData(TASKS_KEY);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...data };
      setLocalData(TASKS_KEY, tasks);
      return tasks[idx];
    }
    return null;
  }

  async function deleteTask(id) {
    let tasks = getLocalData(TASKS_KEY);
    tasks = tasks.filter(t => t.id !== id);
    setLocalData(TASKS_KEY, tasks);
  }

  // Fallbacks for profile/reminders just in case
  async function fetchReminders() { return []; }
  async function addReminder(data) { return data; }
  async function fetchUserProfile() { return null; }
  async function updateUserProfile(data) {}

  return {
    fetchEvents, addEvent, updateEvent, deleteEvent,
    fetchTasks, addTask, updateTask, deleteTask,
    fetchReminders, addReminder,
    fetchUserProfile, updateUserProfile
  };
})();

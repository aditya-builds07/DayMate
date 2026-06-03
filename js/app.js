/* ============================================
   LITTLEBIRD — APP JS
   Main app initialization, modal, sidebar
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Init modules
  Events.init();
  Animations.init();

  // Init calendar
  Calendar.init('.calendar-grid', '.calendar-month-title', handleCellClick);

  // Re-render when events change
  Events.onChange(() => {
    Calendar.render();
    renderSidebar();
  });

  // Navigation buttons
  document.getElementById('btn-prev').addEventListener('click', () => Calendar.prevMonth());
  document.getElementById('btn-next').addEventListener('click', () => Calendar.nextMonth());
  document.getElementById('btn-today').addEventListener('click', () => Calendar.goToToday());

  // Add event button
  document.getElementById('btn-add-event').addEventListener('click', () => {
    openModal(Events.formatDate(new Date()));
  });

  // Sidebar toggle
  document.getElementById('btn-sidebar').addEventListener('click', toggleSidebar);
  document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Modal save
  document.getElementById('modal-save').addEventListener('click', handleSaveEvent);

  // Modal delete
  document.getElementById('modal-delete').addEventListener('click', handleDeleteEvent);

  // Category picker
  document.querySelectorAll('.category-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Search
  const searchInput = document.getElementById('search-input');
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = searchInput.value;
      if (query.trim()) {
        highlightSearchResults(query);
      } else {
        Calendar.render();
      }
    }, 300);
  });

  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      // Trigger re-render (filters handled in render)
      Calendar.render();
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowLeft':
        Calendar.prevMonth();
        break;
      case 'ArrowRight':
        Calendar.nextMonth();
        break;
      case 't':
      case 'T':
        Calendar.goToToday();
        break;
      case 'n':
      case 'N':
        openModal(Events.formatDate(new Date()));
        break;
      case 's':
      case 'S':
        toggleSidebar();
        break;
      case 'Escape':
        closeModal();
        closeSidebar();
        break;
    }
  });

  // Initial sidebar render
  renderSidebar();
});

/* ---- State ---- */
let editingEventId = null;
let selectedDate = '';

/* ---- Cell Click ---- */
function handleCellClick(dateStr, events) {
  selectedDate = dateStr;
  if (events.length > 0) {
    // Open first event for editing
    openModal(dateStr, events[0]);
  } else {
    openModal(dateStr);
  }
}

/* ---- Modal ---- */
function openModal(dateStr, event = null) {
  const backdrop = document.getElementById('modal-backdrop');
  const titleInput = document.getElementById('event-title');
  const dateInput = document.getElementById('event-date');
  const timeInput = document.getElementById('event-time');
  const notesInput = document.getElementById('event-notes');
  const modalTitle = document.getElementById('modal-title-text');
  const deleteBtn = document.getElementById('modal-delete');

  // Reset
  titleInput.value = '';
  dateInput.value = dateStr;
  timeInput.value = '09:00';
  notesInput.value = '';
  document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
  document.querySelector('.category-option[data-cat="meeting"]').classList.add('selected');

  if (event) {
    editingEventId = event.id;
    modalTitle.textContent = 'Edit Event';
    titleInput.value = event.title;
    dateInput.value = event.date;
    timeInput.value = event.time || '09:00';
    notesInput.value = event.notes || '';
    const catOpt = document.querySelector(`.category-option[data-cat="${event.category}"]`);
    if (catOpt) {
      document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
      catOpt.classList.add('selected');
    }
    deleteBtn.style.display = 'block';
  } else {
    editingEventId = null;
    modalTitle.textContent = 'New Event';
    deleteBtn.style.display = 'none';
  }

  backdrop.classList.add('open');
  setTimeout(() => titleInput.focus(), 200);
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  backdrop.classList.remove('open');
  editingEventId = null;
}

function handleSaveEvent() {
  const title = document.getElementById('event-title').value.trim();
  const date = document.getElementById('event-date').value;
  const time = document.getElementById('event-time').value;
  const notes = document.getElementById('event-notes').value.trim();
  const selectedCat = document.querySelector('.category-option.selected');
  const category = selectedCat ? selectedCat.dataset.cat : 'meeting';

  if (!title) {
    document.getElementById('event-title').style.borderColor = '#d45b5b';
    setTimeout(() => {
      document.getElementById('event-title').style.borderColor = '';
    }, 1500);
    return;
  }

  if (editingEventId) {
    Events.update(editingEventId, { title, date, time, notes, category });
    Animations.showToast('Event updated successfully', 'check');
  } else {
    Events.add({ title, date, time, notes, category });
    Animations.showToast('Event created successfully', 'check');
  }

  closeModal();
}

function handleDeleteEvent() {
  if (!editingEventId) return;
  Events.remove(editingEventId);
  Animations.showToast('Event deleted', 'trash');
  closeModal();
}

/* ---- Sidebar ---- */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const appMain = document.querySelector('.app-main');
  const isOpening = !sidebar.classList.contains('open');

  sidebar.classList.toggle('open');

  if (isOpening) {
    // Small delay so sidebar starts sliding first, then calendar shifts
    requestAnimationFrame(() => {
      appMain.classList.add('sidebar-active');
    });
  } else {
    appMain.classList.remove('sidebar-active');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const appMain = document.querySelector('.app-main');
  sidebar.classList.remove('open');
  appMain.classList.remove('sidebar-active');
}

function renderSidebar() {
  const body = document.getElementById('sidebar-body');
  if (!body) return;

  const upcoming = Events.getUpcoming(8);
  body.innerHTML = '';

  if (upcoming.length === 0) {
    body.innerHTML = `
      <div class="sidebar-empty">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>No upcoming events</p>
      </div>
    `;
    return;
  }

  upcoming.forEach((evt, i) => {
    const card = document.createElement('div');
    card.className = `event-card cat-${evt.category}`;
    card.style.animationDelay = `${i * 0.05}s`;
    card.style.animation = 'fadeInUp 0.4s var(--ease-out) both';
    card.style.animationDelay = `${i * 0.06}s`;

    const dateObj = new Date(evt.date + 'T00:00:00');
    const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    card.innerHTML = `
      <div class="event-card-title">${evt.title}</div>
      <div class="event-card-time">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        ${evt.time || 'All day'}
      </div>
      <div class="event-card-date">${dateLabel}</div>
    `;

    card.addEventListener('click', () => {
      openModal(evt.date, evt);
    });

    body.appendChild(card);
  });
}

/* ---- Search highlight ---- */
function highlightSearchResults(query) {
  // Simple: just re-render and let the user see matching events
  // A more advanced version would highlight cells
  Calendar.render();
}

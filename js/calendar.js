/* ============================================
   LITTLEBIRD — CALENDAR JS
   Calendar grid rendering & navigation
   ============================================ */

const Calendar = (() => {
  let currentYear, currentMonth;
  let gridEl, titleEl;
  let onCellClick = null;

  function init(gridSelector, titleSelector, cellClickCb) {
    gridEl = document.querySelector(gridSelector);
    titleEl = document.querySelector(titleSelector);
    onCellClick = cellClickCb;

    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();

    render();
  }

  function render(direction = null) {
    if (!gridEl) return;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (titleEl) {
      titleEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Clear grid
    gridEl.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

    const today = new Date();
    const todayStr = Events.formatDate(today);

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrev - i;
      const cell = createCell(day, true);
      gridEl.appendChild(cell);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = Events.getByDate(dateStr);
      const isToday = dateStr === todayStr;
      const cell = createCell(d, false, isToday, dayEvents, dateStr);
      gridEl.appendChild(cell);
    }

    // Next month leading days
    const totalCells = gridEl.children.length;
    const remaining = totalCells <= 35 ? (35 - totalCells) : (42 - totalCells);
    for (let d = 1; d <= remaining; d++) {
      const cell = createCell(d, true);
      gridEl.appendChild(cell);
    }

    // Animate cells
    const allCells = gridEl.querySelectorAll('.cal-cell');
    if (direction) {
      gridEl.style.animation = direction === 'next'
        ? 'slideCalendarLeft 0.35s var(--ease-out) both'
        : 'slideCalendarRight 0.35s var(--ease-out) both';

      setTimeout(() => { gridEl.style.animation = ''; }, 400);
    }
    Animations.animateCells(allCells);

    // Update stats
    updateStats();
  }

  function createCell(day, isOutside, isToday = false, events = [], dateStr = '') {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';

    if (isOutside) {
      cell.classList.add('outside');
    } else {
      if (isToday) cell.classList.add('is-today');
      if (events.length > 0) cell.classList.add('has-events');

      cell.addEventListener('click', () => {
        if (onCellClick) onCellClick(dateStr, events);
      });
    }

    // Date number
    const dateEl = document.createElement('div');
    dateEl.className = 'cell-date';
    dateEl.textContent = day;
    cell.appendChild(dateEl);

    // Event tags (max 3 shown)
    if (!isOutside && events.length > 0) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'cell-events';

      events.slice(0, 3).forEach(evt => {
        const tag = document.createElement('div');
        tag.className = `cell-event-tag cat-${evt.category}`;
        tag.textContent = evt.title;
        eventsContainer.appendChild(tag);
      });

      if (events.length > 3) {
        const more = document.createElement('div');
        more.className = 'cell-event-tag cat-meeting';
        more.textContent = `+${events.length - 3} more`;
        more.style.opacity = '0.6';
        eventsContainer.appendChild(more);
      }

      cell.appendChild(eventsContainer);
    }

    return cell;
  }

  function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    render('prev');
  }

  function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    render('next');
  }

  function goToToday() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    render();
  }

  function getCurrentMonth() {
    return { year: currentYear, month: currentMonth };
  }

  function updateStats() {
    const todayCountEl = document.getElementById('stat-today');
    const weekCountEl = document.getElementById('stat-week');
    const monthCountEl = document.getElementById('stat-month');

    if (todayCountEl) {
      const count = Events.getTodayCount();
      animateNumber(todayCountEl, count);
    }
    if (weekCountEl) {
      const count = Events.getWeekCount();
      animateNumber(weekCountEl, count);
    }
    if (monthCountEl) {
      const count = Events.getMonthCount(currentYear, currentMonth);
      animateNumber(monthCountEl, count);
    }

    // Update next upcoming
    const nextEl = document.getElementById('stat-next');
    if (nextEl) {
      const upcoming = Events.getUpcoming(1);
      nextEl.textContent = upcoming.length > 0 ? upcoming[0].title : 'None';
    }
  }

  function animateNumber(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const span = el.querySelector('span') || el;
    span.style.animation = 'none';
    void span.offsetWidth;
    span.textContent = target;
    span.style.animation = 'countUp 0.4s var(--ease-out) both';
  }

  return { init, render, prevMonth, nextMonth, goToToday, getCurrentMonth };
})();

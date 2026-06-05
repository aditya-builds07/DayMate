# DayMate (Littlebird) - Website Status Overview

**DayMate** (internally known as Littlebird) is a smart, beautifully designed calendar application that runs entirely in your browser. It features a stunning dark-mode interface with glassmorphism effects, fluid animations, and a focus on keyboard accessibility.

## 📊 Current Project Status: **Stable & Feature-Complete (v1.0)**

The application is fully functional for local use and has recently been upgraded to support multi-user profiles and mobile responsiveness.

### 🌟 Implemented Features
- **Smart Calendar Engine:** Navigate months with fluid animations. Today is always highlighted with a pulsing glow.
- **User Identification & Multi-Profile Support:** 
  - Users are prompted for their name on the first visit.
  - Data is safely scoped to normalized user IDs (e.g., `aditya_desai`), ensuring robust isolation between different users sharing the same browser.
  - Seamless "Switch User" and "Log Out" functionality built into the top navigation.
- **Responsive Design:** 
  - **Desktop:** Full-width, side-by-side components.
  - **Tablet (≤900px):** Center-aligned navigation and adaptive grids.
  - **Mobile (≤600px & ≤400px):** Gracefully stacked topbars, scalable calendar grids, and full-screen optimized modal overlays.
- **Legacy Data Migration:** Built-in safeguards that detect old generic calendar data and offer users a seamless one-time import into their new personal profile.
- **Event & Task Management:** 
  - Add events dynamically with categorized color-coded tags.
  - Drag-and-drop task sidebar.
  - "Quick Add" natural language parsing (e.g., *“Lunch at 1pm tomorrow”*).
- **Search & Filter:** Find any event in milliseconds and filter by categories (Meeting, Personal, Reminder, Deadline).
- **Local Storage Architecture:** No backend required. All data persists securely within the browser's LocalStorage.

## 🛠️ Technology Stack
- **Frontend Core:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Styling Methodology:** CSS Variables (`base.css`), BEM-like component structuring (`calendar.css`, `components.css`, `hero.css`).
- **Dependencies:** 
  - Vanilla JS for logic (`app.js`, `events.js`, `calendar.js`, `animations.js`)
  - Chart.js (Loaded via CDN for Time Insights analytics)
  - Google Fonts (Inter, DM Serif Display)

## 📁 File Structure Overview
- `/index.html`: The beautiful hero/landing page.
- `/app.html`: The main calendar application interface.
- `/guide.html`: User documentation and feature walkthroughs.
- `/css/`: Modular stylesheets covering resets, animations, calendars, hero pages, and components.
- `/js/`: Modular JavaScript files separating application boot logic, event/task storage, calendar rendering, and animations.

## 🚀 Getting Started
Because DayMate relies entirely on client-side technologies, no complex build process or local server is required.
1. Clone or download the repository.
2. Double-click `index.html` to open the landing page in your favorite modern web browser.
3. Click **"Open Calendar"**, enter your name to create your local profile, and start adding events!

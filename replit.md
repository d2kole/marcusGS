# Marcus Savings Tracker

## Overview
Marcus Savings Tracker is a comprehensive Progressive Web App (PWA) designed for independent contractors to manage both personal and business finances with real-time insights, celebrations, and social features. This is a pure frontend application that uses local storage for data persistence.

## Current State
✅ **Successfully configured for Replit environment**
- HTTP server running on port 5000 (0.0.0.0 host)
- All static assets properly served
- Application tested and fully functional
- Cache disabled for development environment

## Recent Changes
- **September 24, 2025**: Initial import and Replit setup
  - Created Node.js HTTP server (server.js) to properly serve static files
  - Configured workflow for port 5000 with webview output
  - Disabled caching for development environment
  - Verified all application functionality works correctly

## Project Architecture

### Technology Stack
- **Frontend**: Pure HTML, CSS, JavaScript
- **Styling**: TailwindCSS (CDN) + Custom CSS
- **Data Storage**: Local Storage (browser-based)
- **Server**: Simple Node.js HTTP server for static file serving
- **No Build Process**: Direct file serving, no compilation needed

### File Structure
```
├── index.html          # Dashboard page (main entry)
├── goals.html          # Goals management page
├── friends.html        # Social features page
├── profile.html        # User profile and settings
├── server.js           # HTTP server for Replit
├── css/
│   └── styles.css      # Custom styles and responsive design
├── js/
│   ├── app.js          # Main application controller
│   ├── storage.js      # LocalStorage data layer
│   ├── utils.js        # Utility functions and theme management
│   ├── goals.js        # Goals management logic
│   ├── celebration.js  # Animation and celebration system
│   ├── friends.js      # Social features and demo data
│   └── profile.js      # Profile management and achievements
└── assets/
    └── icons/          # Application icons
```

### Key Features
1. **Savings Goal Management**
   - Create, track, and complete savings goals
   - Progress visualization with percentage tracking
   - Category-based organization

2. **Celebration System**
   - Confetti animations for milestones (25%, 50%, 75%, 100%)
   - Success notifications and visual feedback
   - Achievement unlocking system

3. **Social Features**
   - Friends system with demo data
   - Goal sharing functionality
   - Progress comparison and motivation

4. **Theme System**
   - Light/Dark mode toggle available on all pages
   - Persistent theme preferences
   - Smooth transitions between themes

5. **Responsive Design**
   - Mobile-first approach
   - Progressive enhancement for larger screens
   - Touch-friendly interface

### Data Persistence
- **Local Storage Keys**:
  - `marcus_goals`: User's savings goals
  - `marcus_progress`: Progress entries
  - `marcus_settings`: App preferences
  - `marcus_achievements`: Unlocked achievements
  - `marcus_profile`: User profile data

### Development Setup
1. **Server**: Node.js HTTP server serves static files
2. **Port**: 5000 (configured for Replit proxy)
3. **Host**: 0.0.0.0 (allows Replit iframe access)
4. **Cache Control**: Disabled for development

### Deployment Notes
- Ready for static hosting (Vercel, Netlify, GitHub Pages)
- No build process required
- All assets are self-contained
- Consider migrating from Tailwind CDN to local build for production

## User Preferences
- No specific coding style preferences documented yet
- Application follows standard JavaScript patterns
- Uses modern ES6+ features
- Responsive design with mobile-first approach

## Technical Decisions
- **September 24, 2025**: Used Node.js HTTP server instead of live-server or python -m http.server for better control and Replit compatibility
- **Cache Control**: Disabled during development to ensure changes are immediately visible
- **Port 5000**: Required for Replit proxy functionality
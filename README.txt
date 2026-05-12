# Diabetes Tracker - Static HTML/CSS/JavaScript App

A comprehensive diabetes management application built with pure HTML, CSS, and JavaScript (no frameworks, no TypeScript).

## ✨ Features

### 📝 Log Entry
- Record daily blood glucose levels (BGL)
- Track insulin doses (Bolus Rapid, Bolus Medium, Basal Slow)
- Log food intake with multipliers
- Record exercise intensity (0-5 scale)
- Navigate between dates
- Manage multiple timezone labels

### 📊 Statistics

#### Box 7: Insulin Speed Models
- Create and manage custom insulin speed calculation models
- Define time to kick in and time to stop for different insulin types
- Full CRUD operations (Create, Read, Update, Delete)

#### Box 8: Default Values  
- Configure default insulin speed profiles (source of truth)
- Set time to kick in and total hours for Rapid, Medium, and Slow insulin
- Used by meal and exercise statistics for calculations

#### Meal Statistics
- Analyze how food affects blood glucose levels
- Filter data by exercise intensity (only entries with 0 intensity)
- Calculate estimated insulin action percentages
- Visualize data with scatter plots and regression lines

#### Exercise Statistics
- Track exercise impact on BGL
- Filter by intensity levels (1-5)
- Calculate insulin action percentages
- Visualize correlations between exercise and BGL changes

### ⚙️ Settings
- Manage timezone labels
- Export all data to JSON (backup)
- Import data from backup file
- Clear all data

## 🚀 How to Run

The app is completely static and requires no build step.

1. **Start a web server** (any of these options):
   
   Using Python 3:
   ```bash
   python3 -m http.server 5000
   ```
   
   Using Node.js:
   ```bash
   npx http-server -p 5000
   ```
   
   Or use any static file server

2. **Open in browser**: Navigate to `http://localhost:5000`

## 📁 File Structure

```
├── index.html                 # Main HTML file
├── styles/
│   ├── main.css              # Global styles and CSS variables
│   ├── layout.css            # Navigation and layout
│   └── components.css        # Reusable UI components
├── js/
│   ├── app.js                # Application entry point and routes
│   ├── router.js             # Hash-based routing system
│   ├── data/
│   │   └── storage.js        # localStorage service layer
│   ├── utils/
│   │   ├── helpers.js        # Utility functions
│   │   └── dateHelpers.js    # Date manipulation
│   ├── components/
│   │   └── chart.js          # SVG chart rendering
│   └── views/
│       ├── home.js           # Dashboard view
│       ├── log.js            # Log entry management
│       ├── settings.js       # App settings
│       └── statistics/
│           ├── insulinSpeed.js    # Box 7: Insulin Speed Models
│           ├── defaultValues.js   # Box 8: Default Values
│           ├── meal.js            # Meal Statistics
│           └── exercise.js        # Exercise Statistics
```

## 💾 Data Storage

All data is stored locally in your browser using localStorage. No server or database required!

**Storage Keys:**
- `bgl_readings_{date}` - Blood glucose readings
- `insulin_readings_{date}` - Insulin doses
- `food_entries_{date}` - Food intake records
- `exercise_data_{date}` - Exercise sessions
- `day_timezones_{date}` - Timezone labels per day
- `insulin_speed_profiles` - Default insulin speed settings (Box 8)
- `insulin_speed_models` - Custom calculation models (Box 7)
- `preferences` - App preferences and settings

### Data Backup & Restore

Navigate to **Settings** to:
- **Export All Data**: Downloads a JSON file with all your data
- **Import Data**: Restore from a previously exported JSON file
- **Clear All Data**: Permanently delete everything (use with caution!)

## 🔧 Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - No frameworks, no TypeScript
- **localStorage** - Client-side data persistence
- **SVG** - Custom chart visualizations
- **Hash Routing** - Client-side navigation without page reloads

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Requires JavaScript enabled
- ⚠️ Requires localStorage support

## 📖 Usage Guide

### Adding a Log Entry

1. Click **Log Entry** in the navigation
2. Select date (defaults to today)
3. Enter time and BGL reading
4. Add insulin doses if applicable
5. Add food name and multiplier (if eating)
6. Record exercise intensity (0 = rest, 1-5 = activity level)
7. Click **Add Entry**

### Analyzing Meal Statistics

1. Go to **Statistics > Box 8: Default Values**
2. Set insulin speed profiles (time to kick in, total hours)
3. Click **Save Default Values**
4. Navigate to **Statistics > Meal Statistics**
5. Click **Calculate Data** to analyze entries

### Managing Settings

- **Timezones**: Add custom labels (Morning, Evening, etc.)
- **Export**: Backup your data before making major changes
- **Import**: Restore from a backup file
- **Clear**: Remove all data (permanent!)

## 🎯 Key Features

✅ **No Build Required** - Pure HTML/CSS/JS, runs directly in browser  
✅ **Offline First** - All data stored locally, works without internet  
✅ **Privacy Focused** - Your data never leaves your browser  
✅ **Mobile Friendly** - Responsive design works on all screen sizes  
✅ **Export/Import** - Full control over your data  

## 🔄 Migrated from React Native

This app was converted from a React Native/TypeScript/Expo application to pure HTML/CSS/JavaScript:

**Changes:**
- ❌ Removed React Native, TypeScript, Expo
- ✅ Built with vanilla JavaScript (ES6+)
- ✅ Replaced AsyncStorage with localStorage
- ✅ Created custom SVG chart components
- ✅ Implemented hash-based routing
- ✅ Zero build step required

## 📝 Notes

- The app uses **hash-based routing** (URLs like `/#/log`) which work entirely client-side
- Some automated testing tools may show 404 errors for hash routes, but real browsers handle them correctly
- All calculations happen in the browser - no server processing needed
- Data persists across sessions using localStorage

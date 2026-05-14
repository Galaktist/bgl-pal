# BGL-PAL - Static HTML/CSS/JavaScript App

A comprehensive diabetes management application built with pure and delicious
HTML, CSS, and JavaScript.

# FEATURES #

- Record data which is the biggest bang for the buck: blood sugar,
insulin doses, food servings, exercise intensity (0-5), etc.
- Exchange-rate method for calculating insulin vs carbs vs BGL
- Visual linear algebra approach (SVG regression lines on x-y axes)
- Test insulin speed and make your own models
- Various SETTINGS to tweak like theme, timezone names, hemisphere, and more
- CSV export and import
- See the ABOUT page for how to use the app


# HOW TO RUN #

The app is completely static and requires no build step.

1. Start a web session and go to https://www.bglpal.com

2. Add it to your mobile's home screen, or your computer's desktop

3. Your data stored locally - no internet connection needed

```text
# FILE STRUCTURE #
├── index.html                # Main HTML file
│
├── styles/
│   └── style.css             # Global styles and CSS variables
│
├── fonts/                    # Old school fonts
│
├── images/                   # Nice images
│
├── html/
│   ├── a1Home.html
│   ├── a2LogEntry.html
│   ├── a3Settings.html
│   ├── a5About.html
│   │
│   ├── b1Meal.html
│   ├── b2Exercise.html
│   ├── b3Calculator.html
│   ├── b4WeekPattern.html
│   ├── b5FoodDatabase.html
│   ├── b6TimeOfDayRatio.html
│   ├── b7InsulinSpeed.html
│   └── b8Sleep.html
│
├── js/
│   ├── app.js                # Application entry point and routes
│   ├── router.js             # Hash-based routing system
│   ├── utils/
│   │   ├── chart.js          # SVG chart rendering
│   │   ├── chartHelpers.js        # Utility functions
│   │   ├── helpers.js        # Utility functions
│   │   ├── dateHelpers.js    # Date manipulation
│   │   └── storage.js        # localStorage service layer
│   │
│   └── views/
│       ├── about.js          # How to use
│       ├── home.js           # Splashboard with real data
│       ├── log.js            # Daily log entry
│       ├── settings.js       # App settings
│       └── statistics/
│           ├── meal.js           # deduce carbs with algebra: insulin vs BGL
│           ├── exercise.js       # deduce exercise insulin-reduction factors
│           ├── calculator.js     # predict BGL in upcoming hours
│           ├── weekPattern.js    # see what's been happening with BGLs
│           ├── foodDatabase.js   # assemble your "food dictionary" to look up
│           ├── timeOfDayRatio.js # work out "exchange rates" for BGL v insulin
│           ├── insulinSpeed.js   # make your own simple models for bolusing
│           └── sleep.js          # sleep rated good, OK, not great
├── package-lock.json
├── package.json
├── README.md                 # self-referential wormhole
└── serve.py                  # pythonhole
```

# DATA STORAGE #
All data is stored locally in your browser using localStorage.

## Data Backup & Restore
Navigate to SETTINGS to:
* Export All Data: Downloads a JSON file with all your data
* Import Data: Restore from a previously exported JSON file
* Clear All Data: Permanently delete everything

Navigate to LOG ENTRY to:
* Export Log Data: export csv, tweak, re-import csv
* Import Log Data: import file rather than manually enter

# USAGE GUIDE #
See ABOUT page for instructions

/*  STORAGE STRUCTURE  
**  ============================================================================
**  HELPERS
**  get(key) ->
**  set(key, value) ->
**  
**  ============================================================================
**  PREFERENCES
**  savePreferences(prefs) -> used copiously
**
**  default prefs needed for app to work (not divide by zero) initially
**  plus many useful defaults, such as food info
**  some arrays won't change, like days of week
**  
**  ============================================================================
**  NON-DEFAULT STORAGE
**  
**  INSULIN SPEED PAGE FUNCTIONS 1
**  HOME PG TALKING TO WEEK PATTERN PG FUNCTIONS 2
**  ANYWHERE NEW FOOD ENTERED FUNCTIONS 3
**  LOG DAY DATA FUNCTIONS 4
**  FLAGGING OUTLIERS IN STORAGE AND LOCAL FUNCTIONS 5
**  
**  ============================================================================
**  GETTING LOG DATA: MAIN FUNCTION
**  
**  function is 250 lines!! Covers many cases
**  
**  User can select 'type' to get: all, no blanks, exercise, time of day, meal,
**  basal overnight, bolus no food
**  
**  User can set start/end date/time to get a range (or leave blank)
**  
**  Function inserts a few cheeky extras, like timezone name (not hard-coded
**  to log), season, tz & season factors
**  
**  ============================================================================
**  GETTING LOG DATA: HELPERS
**  
**  extra helper function (or main function too massive) to get the log data
**  in time range, or all data
**
**  sort data helper too
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpDateTime,
    HelpLog,
    HelpSeason,
    HelpTz,

} from './helpers.js';

export const StorageService = {
    //==========================================================================
    //------------------       [      HELPERS    ]       -----------------------
    //==========================================================================
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    },

    // unused currently *****
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    },

    getAllKeys() {
        return Object.keys(localStorage);
    },

    //==========================================================================
    //------------------     [      PREFERENCES    ]       ---------------------
    //==========================================================================
    
    //---------------- [SAVE] ------------------
    savePreferences(prefs) {
        return this.set('preferences', prefs);
    },

    //---------------- [DEFAULTS] ------------------
    getPreferences() {
        //when making array of objects, better to put keys INSIDE the objects, not outside
        //default prefs exist until overwritten by storageservice.setprefs
        const defaultPrefs = {            
            
            // --------   [NEVER TO OVERWRITE]    ----------
            dayNames:  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysInTimeRange: [
                {time:'week', days: 5, inclWeekends: false},
                {time:'week', days: 7, inclWeekends: true},
                {time:'month', days: 20, inclWeekends: false},
                {time:'month', days: 28, inclWeekends: true},
                {time:'season', days: 65, inclWeekends: false},
                {time:'season', days: 91, inclWeekends: true},
                {time:'year', days: 260, inclWeekends: false},
                {time:'year', days: 365, inclWeekends: true}
            ],
            daysInLongRange: [
                {time:'week', days: 7, isSelected: true},
                {time:'month', days: 28, isSelected: false},
                {time:'season', days: 91, isSelected: false},
                {time:'year', days: 365, isSelected: false}
            ],
            monthSeason: [
                {month: 'Dec', northern: 'Winter', southern: 'Summer'},
                {month: 'Jan', northern: 'Winter', southern: 'Summer'},
                {month: 'Feb', northern: 'Winter', southern: 'Summer'},
                {month: 'Mar', northern: 'Spring', southern: 'Autumn'},
                {month: 'Apr', northern: 'Spring', southern: 'Autumn'},
                {month: 'May', northern: 'Spring', southern: 'Autumn'},
                {month: 'Jun', northern: 'Summer', southern: 'Winter'},
                {month: 'Jul', northern: 'Summer', southern: 'Winter'},
                {month: 'Aug', northern: 'Summer', southern: 'Winter'},
                {month: 'Sep', northern: 'Autumn', southern: 'Spring'},
                {month: 'Oct', northern: 'Autumn', southern: 'Spring'},
                {month: 'Nov', northern: 'Autumn', southern: 'Spring'}                
            ],

            // ---------    [OK TO OVERWRITE]     ---------            
            //  BGL       ---------------------------------
            bglStepMin: [
                {glucoseUnit: 'mmol/L', min: 3, step: 0.1, max: 33.3, minIndexed: 3, stepIndexed: 0.1, maxIndexed: 33.3},
                {glucoseUnit: 'mg/dL', min: 54, step: 1, max: 600, minIndexed: 54/18, stepIndexed: 1/18, maxIndexed: 600/18},
            ],
            bglWeekPattern: [
                {id: 'hypo', value: 4.5, glucoseUnit: 'mmol/L', toTrack: 2},
                {id: 'target', value: 6.5, glucoseUnit: 'mmol/L'},
                {id: 'hyper', value: 10, glucoseUnit: 'mmol/L', toTrack: 3},
            ],

            //  EXERCISE ARRAY    ------------------------------
            exFactorArray: [
                {intensity: 0, name: '0 none', factor: 1,  color: '#999'},
                {intensity: 1, name: '1 slow', factor: 0.95, color: '#15d815ff'},
                {intensity: 2, name: '2 lite', factor: 0.9,  color: '#4beec5ff'},
                {intensity: 3, name: '3 midi', factor: 0.85, color: '#0ea88fff'},
                {intensity: 4, name: '4 fast', factor: 0.8,  color: '#006aa8ff'},
                {intensity: 5, name: '5 HUGE', factor: 0.75, color: '#f86437ff'}
            ],

            //  LOG ENTRY       -------------------------------
            //for more efficient getting of logData            
            // filteredLogData: [],


            //==================================================================
            // FOOD STUFF
            // static size
            //pre-load a database of food info and food dictionary
            foodArray: [
                {name: 'bagel', glucoseGPerServing: 35, serving: 'medium', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'fast', notes: ''},
                {name: 'banana cake', glucoseGPerServing: 35, serving: 'slice', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'medium', notes: ''},
                {name: 'bread (rye)', glucoseGPerServing: 12, serving: 'slice', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'slow', notes: ''},
                {name: 'bread (wheat)', glucoseGPerServing: 15, serving: 'slice', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'medium', notes: ''},
                {name: 'cookie', glucoseGPerServing: 20, serving: 'medium', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'medium', notes: ''},
                {name: 'cracker', glucoseGPerServing: 15, serving: 'medium', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'medium', notes: ''},
                {name: 'croissant', glucoseGPerServing: 26, serving: 'medium', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'medium', notes: ''},
                {name: 'donut', glucoseGPerServing: 23, serving: 'medium', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'fast', notes: ''},
                {name: 'muffin', glucoseGPerServing: 30, serving: 'small', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'medium', notes: ''},
                {name: 'rice cake', glucoseGPerServing: 20, serving: 'medium', category: '', group: 'bread, cake, biscuit, pastry', foodGI: 'very fast', notes: ''},
                {name: 'tortilla', glucoseGPerServing: 26, serving: 'slice', category: 'dinner', group: 'bread, cake, biscuit, pastry', foodGI: 'slow', notes: ''},
                {name: 'choc rice puffs', glucoseGPerServing: 25, serving: 'bowl', category: 'breakfast', group: 'cereal', foodGI: 'fast', notes: ''},
                {name: 'cornflakes', glucoseGPerServing: 25, serving: 'bowl', category: 'breakfast', group: 'cereal', foodGI: 'fast', notes: ''},
                {name: 'froot loops', glucoseGPerServing: 26, serving: 'bowl', category: 'breakfast', group: 'cereal', foodGI: 'fast', notes: ''},
                {name: 'muesli', glucoseGPerServing: 25, serving: 'bowl', category: 'breakfast', group: 'cereal', foodGI: 'fast', notes: ''},
                {name: 'porridge', glucoseGPerServing: 25, serving: 'bowl', category: 'breakfast', group: 'cereal', foodGI: 'fast', notes: ''},
                {name: 'wheat biscuit', glucoseGPerServing: 20, serving: 'bowl', category: 'breakfast', group: 'cereal', foodGI: 'fast', notes: ''},
                {name: 'ice cream', glucoseGPerServing: 13, serving: 'bowl', category: '', group: 'dairy', foodGI: 'medium', notes: ''},
                {name: 'milk', glucoseGPerServing: 12, serving: 'cup', category: '', group: 'dairy', foodGI: 'slow', notes: ''},
                {name: 'yoghurt (sweetened)', glucoseGPerServing: 12, serving: 'pottle', category: '', group: 'dairy', foodGI: 'slow', notes: ''},
                {name: 'yoghurt (unsweetened)', glucoseGPerServing: 6, serving: 'pottle', category: '', group: 'dairy', foodGI: 'slow', notes: ''},
                {name: 'choc milk', glucoseGPerServing: 26, serving: 'small', category: '', group: 'drinks', foodGI: 'medium', notes: ''},
                {name: 'cola', glucoseGPerServing: 35, serving: 'can', category: '', group: 'drinks', foodGI: 'fast', notes: ''},
                {name: 'fruit juice', glucoseGPerServing: 29, serving: 'small', category: '', group: 'drinks', foodGI: 'medium', notes: ''},
                {name: 'sport drink', glucoseGPerServing: 15, serving: 'small', category: '', group: 'drinks', foodGI: 'very fast', notes: ''},
                {name: 'apple', glucoseGPerServing: 15, serving: 'medium', category: '', group: 'fruit & veg', foodGI: 'slow', notes: ''},
                {name: 'baked beans', glucoseGPerServing: 20, serving: 'half-can', category: 'dinner', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'banana', glucoseGPerServing: 24, serving: 'medium', category: '', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'carrot', glucoseGPerServing: 5, serving: 'medium', category: 'dinner', group: 'fruit & veg', foodGI: 'slow', notes: ''},
                {name: 'grapes', glucoseGPerServing: 18, serving: 'handful', category: '', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'kiwifruit', glucoseGPerServing: 6, serving: 'medium', category: '', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'mango', glucoseGPerServing: 20, serving: 'medium', category: '', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'orange', glucoseGPerServing: 11, serving: 'medium', category: '', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'peach', glucoseGPerServing: 13, serving: 'medium', category: '', group: 'fruit & veg', foodGI: 'slow', notes: ''},
                {name: 'pear', glucoseGPerServing: 11, serving: 'medium', category: '', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'peas', glucoseGPerServing: 7, serving: 'plate', category: 'dinner', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'potato (boiled)', glucoseGPerServing: 30, serving: 'large', category: 'dinner', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'sweet corn', glucoseGPerServing: 16, serving: 'medium', category: 'dinner', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'sweet potato', glucoseGPerServing: 30, serving: 'large', category: 'dinner', group: 'fruit & veg', foodGI: 'medium', notes: ''},
                {name: 'fish', glucoseGPerServing: 5, serving: '100g', category: '', group: 'meats', foodGI: 'very slow', notes: ''},
                {name: 'red meat', glucoseGPerServing: 10, serving: '100g', category: '', group: 'meats', foodGI: 'very slow', notes: ''},
                {name: 'macaroni & cheese', glucoseGPerServing: 51, serving: 'bowl', category: 'dinner', group: 'rice, pasta, noodles', foodGI: 'medium', notes: ''},
                {name: 'noodles (instant)', glucoseGPerServing: 40, serving: 'bowl', category: 'dinner', group: 'rice, pasta, noodles', foodGI: 'slow', notes: ''},
                {name: 'spaghetti (boiled)', glucoseGPerServing: 48, serving: 'bowl', category: 'dinner', group: 'rice, pasta, noodles', foodGI: 'slow', notes: ''},
                {name: 'spaghetti (canned in tomato)', glucoseGPerServing: 27, serving: 'half-can', category: 'dinner', group: 'rice, pasta, noodles', foodGI: 'fast', notes: ''},
                {name: 'cashews', glucoseGPerServing: 13, serving: 'handful', category: '', group: 'salty snacks', foodGI: 'slow', notes: ''},
                {name: 'corn chips', glucoseGPerServing: 26, serving: 'handful', category: '', group: 'salty snacks', foodGI: 'medium', notes: ''},
                {name: 'peanuts', glucoseGPerServing: 4, serving: 'handful', category: '', group: 'salty snacks', foodGI: 'very slow', notes: ''},
                {name: 'popcorn', glucoseGPerServing: 11, serving: 'handful', category: '', group: 'salty snacks', foodGI: 'medium', notes: ''},
                {name: 'ketchup', glucoseGPerServing: 10, serving: '1 tbsp', category: '', group: 'sauces', foodGI: 'medium', notes: ''},
                {name: 'honey', glucoseGPerServing: 8, serving: '2 tsp', category: '', group: 'spreads', foodGI: 'slow', notes: ''},
                {name: 'apricots (dried)', glucoseGPerServing: 30, serving: 'handful', category: '', group: 'sweets', foodGI: 'slow', notes: ''},
                {name: 'chocolate', glucoseGPerServing: 15, serving: '1 row (4 blocks)', category: '', group: 'sweets', foodGI: 'slow', notes: ''},
                {name: 'glucose', glucoseGPerServing: 10, serving: '2 tsp', category: '', group: 'sweets', foodGI: 'very fast', notes: 'this is my reference'},
                {name: 'jelly beans', glucoseGPerServing: 28, serving: 'handful', category: '', group: 'sweets', foodGI: 'fast', notes: ''},
                {name: 'skittles', glucoseGPerServing: 20, serving: 'handful', category: '', group: 'sweets', foodGI: 'very fast', notes: ''},
                {name: 'sucrose', glucoseGPerServing: 10, serving: '2 tsp', category: '', group: 'sweets', foodGI: 'fast', notes: ''},
                {name: 'burger, chips, drink', glucoseGPerServing: 150, serving: 'combo', category: 'dinner', group: 'takeout', foodGI: 'medium', notes: ''},
                {name: 'chicken nuggets', glucoseGPerServing: 40, serving: 'bowl', category: 'dinner', group: 'takeout', foodGI: 'medium', notes: ''},
                {name: 'pizza', glucoseGPerServing: 22, serving: 'slice', category: 'dinner', group: 'takeout', foodGI: 'slow', notes: ''},
                {name: 'sushi', glucoseGPerServing: 20, serving: 'piece', category: 'lunch', group: 'takeout', foodGI: 'medium', notes: ''},
            ],
            
            foodDictionary: 
                ['apple', 'apricots (dried)', 'bagel', 'baked beans', 'banana', 'banana cake', 'bread (rye)', 'bread (wheat)', 'burger, chips, drink',
                    'carrot', 'cashews', 'chicken nuggets', 'choc milk', 'choc rice puffs', 'chocolate', 'cola', 'cookie', 'corn chips', 'cornflakes',
                    'cracker', 'croissant', 'donut', 'fish', 'froot loops', 'fruit juice', 'glucose', 'grapes', 'honey',
                    'ice cream', 'jelly beans', 'ketchup', 'kiwifruit', 'macaroni & cheese', 'mango', 'milk', 'muesli', 'muffin',
                    'noodles (instant)', 'orange', 'peach', 'peanuts', 'pear', 'peas', 'pizza', 'popcorn', 'porridge', 'potato (boiled)',
                    'red meat', 'rice cake', 'skittles', 'spaghetti (canned in tomato)', 'spaghetti (boiled)', 'sport drink', 'sucrose', 'sushi',
                    'sweet corn', 'sweet potato', 'tortilla', 'wheat biscuit', 'yoghurt (sweetened)', 'yoghurt (unsweetened)'
                ],

            //adjust times in settings
            foodMealTimes: [
                {category: 'breakfast', time: '06:00'},
                {category: 'morning tea', time: '10:30'},
                {category: 'lunch', time: '12:00'},
                {category: 'general', time: '13:00'},
                {category: 'afternoon tea', time: '15:30'},
                {category: 'dinner', time: '18:00'},
                {category: 'dessert', time: '20:00'},
                {category: 'midnight snack', time: '00:00'},                
            ],
            foodGroups: [
                {group: 'bread, cake, biscuit, pastry'},
                {group: 'cereal'},
                {group: 'drinks'},
                {group: 'dairy'},
                {group: 'fruit & veg'},
                {group: 'meats'},
                {group: 'rice, pasta, noodles'},
                {group: 'salty snacks'},
                {group: 'sauces'},
                {group: 'spreads'},
                {group: 'sweets'},
                {group: 'takeout'},
            ],
            giArray: [
                {speed: 0, name: 'very slow',   hours: 4, isDefault: false},
                {speed: 1, name: 'slow',        hours: 3, isDefault: false},
                {speed: 2, name: 'medium',      hours: 2, isDefault: true},
                {speed: 3, name: 'fast',        hours: 1, isDefault: false},
                {speed: 4, name: 'very fast',   hours: 0.5, isDefault: false},
            ],

            // // size enlarges
            // foodDictionary: [],  //any food will be checked from log and go in here to be printed on rule of thumb page
            referenceFood:
                {name: 'glucose', glucoseGPerServing: 10, serving: '2 tsp', category: '', group: 'sweets', foodGI: 'very fast', notes: 'this is my reference'},
            // {name: 'banana', serving: 'a big one', glucoseGPerServing: 50, category: 'lunch', notes: 'use actrapid'},,
            //==================================================================
           
            //  -----   INSULIN   ---------------------------
            insulinArray: [
                {name: 'novorapid', isRef: true,  type: 'bolus', speed: 'rapid',  timeToKickIn: 0.5, totalHours: 4 },
                {name: 'actrapid',  isRef: false, type: 'bolus', speed: 'medium', timeToKickIn: 1, totalHours: 6 },
                {name: 'lantus',    isRef: false, type: 'basal', speed: 'slow',   timeToKickIn: 2, totalHours: 12},
            ],            
            
            //  -----   TIMEZONES -> color based on index in helpers, selected on start time 'index' ---------------------------
            logArray: ['06:30', '09:30', '12:30', '15:30', '17:30', '21:30'],
            timezones: ['early', 'morning', 'midday', 'evening'],   //used for checking if name exists already
            timezoneArray: [
                {start: '00:00', name: 'early',     isRef: true,  glucosePer1U: 10, bglDropPer1U: 2, glucoseUnit: 'mmol/L', factor: 1, color: '#5cff7fff'},
                {start: '08:00', name: 'morning',   isRef: false, glucosePer1U: 10, bglDropPer1U: 2, glucoseUnit: 'mmol/L', factor: 1, color: '#00a3a8ff',},
                {start: '12:00', name: 'midday',    isRef: false, glucosePer1U: 10, bglDropPer1U: 2, glucoseUnit: 'mmol/L', factor: 1, color: '#b700ffff',},
                {start: '18:00', name: 'evening',   isRef: false, glucosePer1U: 10, bglDropPer1U: 2, glucoseUnit: 'mmol/L', factor: 1, color: '#0026ffff',},
            ],

            //  -----   SELECTION/SETTINGS OBJECTS - OK TO MERGE -> 'MERGING' MUTATES ARRAYS INTO OBJECTS, THOUGH...  ------            
            userSelections: {
                darkMode: true,
                eightiesMode: true,
                hemisphere: 'southern',
                glucoseUnit: 'mmol/L',
                season: 'Summer',
                timezone: 'early',
                showInsulinRapidLog: true,
                showInsulinMediumLog: true,
                showInsulinSlowLog: true,
                food: 'glucose',
                showExerciseData: true,
                showMealData: true,
                inclWeekends: true,
                showWeekPatternData: true,
                showRawSeasonData: true,
                showRawTimezoneData: true,
                showBolusSeasonData: true,
                showBolusTimezoneData: true,
                showBasalSeasonData: true,
                weekPatternRange: 'week',
                insulinPrecision: 2,
                showHalfHourData: true,
                dashboardMessage: {},
                logoAnimationPlayedOnce: false,
                CSVoverwriteImport: false,
                CSVincludeBlanks: true,
            },
            backgroundSettings: {
                giSpeed: 'medium',
                haslogDataChanged: true,                
            },

            //  SEASON ARRAY            
            seasonArray: [
                {name: 'Summer', factor: 1, isRef: true,  color: '#fa0303e0'},
                {name: 'Autumn', factor: 1.1, isRef: false, color: '#d35106c4'},
                {name: 'Winter', factor: 1.2, isRef: false, color: '#0480b1'},
                {name: 'Spring', factor: 1.1, isRef: false, color: '#03fa0f93'},
            ],            
        };

        //Remove ! by storedPrefs to update defaults
        const storedPrefs = this.get('preferences');
        if (!storedPrefs) {
            this.set('preferences', defaultPrefs);
            return defaultPrefs;
        }

        //all arrays in default Prefs are copied into merged first
        //then all arrays in storedPrefs
        //if stored prefs exists, it overwrites anything with same name in default prefs
        //because stored prefs is 2nd, it overwrites default prefs which is first
        const merged = { ...defaultPrefs, ...storedPrefs };
        // if (storedPrefs.bglStepMin) {
        //     merged.bglStepMin = { ...defaultPrefs.bglStepMin, ...storedPrefs.bglStepMin };
        // }
        // if (storedPrefs.bglWeekPattern) {
        //     merged.bglWeekPattern = { ...defaultPrefs.bglWeekPattern, ...storedPrefs.bglWeekPattern };
        // }
        // if (storedPrefs.exFactorArray) {
        //     merged.exFactorArray = { ...defaultPrefs.exFactorArray, ...storedPrefs.exFactorArray };
        // }
        // if (storedPrefs.foodDictionary) {
        //     merged.foodDictionary = { ...defaultPrefs.foodDictionary, ...storedPrefs.foodDictionary };
        // }
        // if (storedPrefs.foodsArray) {
        //     merged.foodsArray = { ...defaultPrefs.foodsArray, ...storedPrefs.foodsArray };
        // }
        // if (storedPrefs.filteredLogData) {
        //     merged.filteredLogData = { ...defaultPrefs.filteredLogData, ...storedPrefs.filteredLogData };
        // }
        // if (storedPrefs.giArray) {
        //     merged.giArray = { ...defaultPrefs.giArray, ...storedPrefs.giArray };
        // }
        // if (storedPrefs.insulinArray) {
        //     merged.insulinArray = { ...defaultPrefs.insulinArray, ...storedPrefs.insulinArray };
        // }
        if (storedPrefs.userSelections) {
            merged.userSelections = { ...defaultPrefs.userSelections, ...storedPrefs.userSelections };
        }
        if (storedPrefs.backgroundSettings) {
            merged.backgroundSettings = { ...defaultPrefs.backgroundSettings, ...storedPrefs.backgroundSettings };
        }
        // if (storedPrefs.seasonArray) {
        //     merged.seasonArray = { ...defaultPrefs.seasonArray, ...storedPrefs.seasonArray };
        // }
        // if (storedPrefs.logArray) {
        //     merged.logArray = { ...defaultPrefs.logArray, ...storedPrefs.logArray };
        // }
        // if (storedPrefs.timezones) {
        //     merged.timezones = { ...defaultPrefs.timezones, ...storedPrefs.timezones };
        // }
        // if (storedPrefs.timezoneArray) {
        //     merged.timezoneArray = { ...defaultPrefs.timezoneArray, ...storedPrefs.timezoneArray };
        // }

        this.set('preferences', merged);
        return merged;
    },

    //==========================================================================
    //-----------       [      NON-DEFAULT STORAGE    ]       ------------------
    //==========================================================================

    //--------- [INSULIN SPEED PAGE FUNCTIONS 1] -----------
    //--------- [MODEL FUNCTIONS 1.1] -----------
    getInsulinSpeedModels() {
        return this.get('insulin_speed_models')?? [];
    },

    saveInsulinSpeedModels(models) {
        return this.set('insulin_speed_models', models);
    },

    //--------- [TEST FUNCTIONS 1.2] -----------
    getInsulinSpeedTests() {
        return this.get('insulin_speed_tests')?? [];
    },

    saveInsulinSpeedTests(tests) {
        return this.set('insulin_speed_tests', tests);
    },

    //--------- [HOME PG TALKING TO WEEK PATTERN PG FUNCTIONS 2] -----------
    getChartData() {
        return this.get('chart_data')?? [];
    },

    saveChartData(chart) {  
        console.log(chart);      
        return this.set('chart_data', chart);
    },

    //--------- [ANYWHERE NEW FOOD ENTERED FUNCTIONS 3] -----------
    saveFoodToDictionary(food) {
        const prefs = StorageService.getPreferences();
        const foodDictionary = prefs.foodDictionary;
        console.log(food, foodDictionary);
        foodDictionary.includes(food)? console.log('BBQ exists') : console.log('bbq does not exist');
        
        if(foodDictionary.includes(food)) return;
        else foodDictionary.push(food);
        
        console.log('saving food dictionary');

        StorageService.savePreferences(prefs);

        console.log(prefs, foodDictionary);
        
        return foodDictionary;
    },

    //--------- [LOG DAY DATA FUNCTIONS 4] -----------
    getRowData(dateKey) {
        const data = this.get(`dailyLogData_${dateKey}`)?? {};
        return data;
    },

    saveRowData(data, dateKey) {
        this.set(`dailyLogData_${dateKey}`, data);
    },

    //----- [FLAGGING OUTLIERS IN STORAGE AND LOCAL FUNCTIONS 5] -----
    flagLogOutlier(logId, localArray) {
        const [logDate, ] = logId.split('_');
        console.log(`dailyLogData_${logDate}`);
        const dayData = this.get(`dailyLogData_${logDate}`)?? {};

        const objectToFlag = dayData.find(obj => obj.id === logId);
        const chartObjectToFlag = localArray.find(obj => obj.id === logId);

        const isItOutlier = objectToFlag?.outlier;
        //case 1 - outlier flagged as true - change to false
        //case 2 - outlier flagged as false - change to true
        //case 3 - outlier not flagged (and therefore true 1st time)
        const outlierFlag = isItOutlier === undefined? true : !objectToFlag.outlier;
        
        objectToFlag.outlier = outlierFlag;
        chartObjectToFlag.outlier = outlierFlag;

        this.set(`dailyLogData_${logDate}`, dayData);
    },
    
    //==========================================================================
    //----------  [      GETTING LOG DATA: MAIN FUNCTION    ]   ----------------
    //==========================================================================
    //--------- [MAIN ALL-IN-1 FUNCTION -> 250 LINES!] -----------
    getLogData(type, date1, date2, time1, time2) {        
        // 1st cut is get between dates OR date/times
        const unsortedData = this.getLogDataInTimeRange(date1, date2, time1, time2);

        //SORT TO BEGIN WITH
        const logData = this.sortLogData(unsortedData);
        
        if(type === 'all') {
            return logData;
        }

        const exFactorArray = (type === 'exercise')? StorageService.getPreferences().exFactorArray : null;
        const refFoodArray = (type === 'time of day')? StorageService.getPreferences().referenceFood : null;

        //otherwise we're filtering
        const logDataFiltered = [];

        // NOW FOR LOOP TO APPLY FILTERS
        for(let i = 0 ; i < logData.length ; ++i){
            const startEntry = logData[i]; 

            //***** check for anywhere else a switch function be good *****
            switch (type) {
                case 'no blanks': {
                    const length = Object.keys(startEntry).length;
                    if(length === 3) break;
                    logDataFiltered.push(startEntry); 
                    break;
                }

                case 'meal': {
                    //***** "truthy - different in every language" ignore anything without food or with 2 foods
                    if(!startEntry.food || startEntry.food[1]) break;

                    //ignore anything with exercise > 0 && no bgl
                    if(startEntry.exercise > 0) break;
                    
                    //need start/end bgls
                    if (!startEntry.bgl) break;
                    let endEntry = null;
                    for (let j = i + 1; j < logData.length; ++j) {
                        if (logData[j].bgl) {
                            endEntry = logData[j];
                            // console.log('i:', i,startEntry.date, 'j:', j, endEntry.date);
                            break;
                        }
                    }
                    if (!endEntry) break;
                    // console.log(endEntry);

                    //push in end info for comparison
                    startEntry.endBgl = endEntry.bgl;
                    startEntry.endLogTime = endEntry.logTime;
                    startEntry.endDate = endEntry.date;
                    startEntry.bglChange = startEntry.endBgl - startEntry.bgl;

                    logDataFiltered.push(startEntry);

                    break;
                }

                case 'exercise': {
                    //don't want points that don't have insulin...
                    if(startEntry.rapidU === undefined && startEntry.mediumU === undefined) break;
                    //ignore anything with food - ie anything defined gets ignored
                    if(startEntry.food !== undefined) break;
                    //need exercise = 0 as an index of 1.0 and always regression
                    //ignore anything with 0 or undefined exercise
                    if (startEntry.exercise === undefined || startEntry.exercise === 0) startEntry.exercise = 0;
                    
                    //need start/end bgls
                    if (!startEntry.bgl) break;
                    let endEntry = null;
                    for (let j = i + 1; j < logData.length; ++j) {
                        if (logData[j].bgl) {
                            endEntry = logData[j];
                            break;
                        }
                    }
                    if (!endEntry) break;

                    //push in end info for comparison
                    startEntry.endBgl = endEntry.bgl;
                    startEntry.endLogTime = endEntry.logTime;
                    startEntry.endDate = endEntry.date;
                    startEntry.bglChange = startEntry.endBgl - startEntry.bgl;

                    //get name of the exercise for the matching number
                    const exIdObj = exFactorArray.find(obj => obj.intensity === startEntry.exercise);
                    const exId = exIdObj.name;
                    startEntry.exId = exId;

                    logDataFiltered.push(startEntry);

                    break;
                }

                case 'time of day': {               
                    const refFoodName = refFoodArray.name;
                    const refFoodGlucoseGrams = refFoodArray.glucoseGPerServing;
                    
                    //ignore anything without food or with 2 foods
                    if(startEntry.food === undefined || startEntry.food[1] !== undefined) break;

                    //ignore anything not equal to refFood
                    if(startEntry.food[0].name !== refFoodName) break;

                    //ignore anything with exercise > 0 && no bgl
                    if(startEntry.exercise > 0) break;
                    
                    //need start/end bgls
                    if (!startEntry.bgl) break;
                    let endEntry = null;
                    for (let j = i + 1; j < logData.length; ++j) {
                        if (logData[j].bgl) {
                            endEntry = logData[j];
                            console.log('i:', i,startEntry.date, 'j:', j, endEntry.date);
                            break;
                        }
                    }
                    if (!endEntry) break;
                    console.log(endEntry);

                    //push in end info for comparison
                    startEntry.endBgl = endEntry.bgl;
                    startEntry.endLogTime = endEntry.logTime;
                    startEntry.endDate = endEntry.date;
                    startEntry.bglChange = startEntry.endBgl - startEntry.bgl;

                    //push in other stuff
                    startEntry.glucoseGPerServing = refFoodGlucoseGrams;

                    logDataFiltered.push(startEntry);

                    break;
                }

                // for checking overnight basal dose
                case 'basal overnight': {
                    const tomorrow = HelpDateTime.addDays(startEntry.date, 1);
                    const tomoKey = HelpDateTime.dateToDateStrKey(tomorrow);
                    
                    //if there are 2+ basals in a day, can colour things for different times of day later
                    if(!startEntry.slowU || startEntry.slowU === 0) break;

                    //ignore anything with exercise > 0 && no bgl
                    // if(startEntry.exercise > 0) continue;

                    //need start/end bgls - want next basal recorded
                    if (!startEntry.bgl) break;
                    
                    let endEntry = null;
                    let snackCount = 0;
                    for (let j = i + 1; j < logData.length; ++j) {
                        if(logData[j].date > tomoKey) break;
                        
                        if (logData[j].slowU && logData[j].date <= tomoKey) {
                            endEntry = logData[j];
                            // console.log('i:', i,startEntry.date, 'j:', j, endEntry.date);
                            break;
                        }

                        //record if any food eaten between basals, during "nighttime"
                        if(logData[j].food !== undefined && HelpLog.isLogFrom8pmTo5am(logData[j].logTime)) ++snackCount;
                        
                        //record/average a middle-of-night bgl
                        if(logData[j].bgl && HelpLog.isLogFrom12pmTo4am(logData[j].logTime)) {
                            startEntry.midNightBgl = logData[j].bgl;
                            startEntry.midNightLogTime = logData[j].logTime;
                            startEntry.midNightDate = logData[j].date;
                        }
                    }
                    if (!endEntry) break;
                    
                    //push in end info for comparison
                    startEntry.endBgl = endEntry.bgl;
                    startEntry.endLogTime = endEntry.logTime;
                    startEntry.endDate = endEntry.date;
                    startEntry.bglChange = startEntry.endBgl - startEntry.bgl;

                    //push in food count
                    startEntry.foodCount = snackCount;          

                    logDataFiltered.push(startEntry);

                    break;
                }

                // for checking correction dose when no food
                case 'bolus no food': {
                    
                    //ignore anything with food
                    if(startEntry.food !== undefined) break;

                    //ignore anything without bolus
                    if(!startEntry.rapidU && !startEntry.mediumU) break;

                    //ignore anything with exercise > 0 && no bgl
                    if(startEntry.exercise > 0) break;
                    
                    //need start/end bgls
                    if (!startEntry.bgl) break;
                    let endEntry = null;
                    for (let j = i + 1; j < logData.length; ++j) {
                        if (logData[j].bgl) {
                            endEntry = logData[j];
                            console.log('i:', i,startEntry.date, 'j:', j, endEntry.date);
                            break;
                        }
                    }
                    if (!endEntry) break;
                    console.log(endEntry);

                    //push in end info for comparison
                    startEntry.endBgl = endEntry.bgl;
                    startEntry.endLogTime = endEntry.logTime;
                    startEntry.endDate = endEntry.date;
                    startEntry.bglChange = startEntry.endBgl - startEntry.bgl;

                    logDataFiltered.push(startEntry);

                    break;
                }
            }
        }

        // ADD TIMEZONE/SEASON INFO
        for(let i = 0 ; i < logDataFiltered.length ; ++i) {
            const logObj = logDataFiltered[i];
            
            const seasonName = HelpSeason.getDatesSeason(logObj.date);
            const seasonFactor = HelpSeason.getDatesSeasonFactor(logObj.date);
            const tzName = HelpTz.getTimesTzName(logObj.logTime);
            const tzFactor = HelpTz.getTimesTzUnit(logObj.logTime, 'factor');

            logObj.season = seasonName;
            logObj.seasonFactor = seasonFactor;
            logObj.timezone = tzName;
            logObj.tzFactor = tzFactor;
        }
     
        return logDataFiltered;

        //sort data by date_time id
        // const sortedFilteredData = this.sortLogData(logDataFiltered);
        // return sortedFilteredData;
    },

    //==========================================================================
    //----------       [      GETTING LOG DATA: HELPERS    ]    ----------------
    //==========================================================================

    //----- [HELPER 1 - works even if no time/date range] -------
    getLogDataInTimeRange(startDate, endDate, startTime, endTime) {
        const dataInRange = [];
        const startDateKey = typeof startDate === 'string'? startDate : HelpDateTime.dateToDateStrKey(startDate);
        const endDateKey = typeof endDate === 'string'? endDate : HelpDateTime.dateToDateStrKey(endDate);
        const dateTimeIdStart = startTime? `${startDateKey}_${startTime}` : `${startDateKey}_00:00`;
        const dateTimeIdEnd = endTime? `${endDateKey}_${endTime}` : `${endDateKey}_23:59`;

        //GET ALL LOG DATA IF NO DATE/TIME
        if(!(startDate && endDate && startTime && endTime)) {         
            for(let i = 0; i < localStorage.length; ++i) {
                const key = localStorage.key(i);
                
                if(key && key.startsWith('dailyLogData_')) {
                    try{
                        const logDataKey = JSON.parse(localStorage.getItem(key));
                    
                        for(let j = 0 ; j < logDataKey.length ; ++j) {
                            dataInRange.push(logDataKey[j]);
                        }
                    } catch (error) {
                        const logDataKeyAlt = localStorage.getItem(key);
                        dataInRange.push(logDataKeyAlt);
                        console.error(`Could not parse JSON for ${logDataKeyAlt}. Storing as raw string`, error);
                    }                    
                }
            }
            return dataInRange;
        }

        //ELSE GET DATA WITHIN DATE/TIME RANGE
        for(let i = 0; i < localStorage.length; ++i) {
            const key = localStorage.key(i);

            if(key && key.startsWith('dailyLogData_')) {
                try{
                    const logDataKey = JSON.parse(localStorage.getItem(key));
                
                    for(let j = 0 ; j < logDataKey.length ; ++j) {
                        //if earlier or later than ids, continue
                        const idToCheck = logDataKey[j].id;
                        if(idToCheck < dateTimeIdStart || idToCheck > dateTimeIdEnd) continue;
                        
                        dataInRange.push(logDataKey[j]);
                    }
                } catch (error) {
                    const logDataKeyAlt = localStorage.getItem(key);
                    dataInRange.push(logDataKeyAlt);
                    console.error(`Could not parse JSON for ${logDataKeyAlt}. Storing as raw string`, error);
                }
            }
        }
        return dataInRange;
    },

    //----- [HELPER 2] -------
    sortLogData(data) {
        //sort data by date_time id
        data.sort((a, b) => {
            if(a.id < b.id) {
                return -1;  //a comes first
            }
            if(a.id > b.id) {
                return 1;   //b comes first
            }
            return 0; //they are equal
        });

        return data;
    },
    
    //----- [HELPER 3 - need all the keys for CSV stuff] -------
    getAllLogData(){
        const start1 = performance.now();
        const logData = {};
        for(let i = 0; i < localStorage.length; ++i) {
            const key = localStorage.key(i);
            if(key && key.startsWith('dailyLogData_')) {
                try{
                    logData[key] = JSON.parse(localStorage.getItem(key));

                } catch (error) {
                    logData[key] = localStorage.getItem(key);
                    console.error(`Could not parse JSON for key ${key}. Storing as a raw string`, error);
                }
            }
        }
        const end1 = performance.now();

        console.log(`execution time GetAllLogData: ${end1-start1} ms`);

        return logData;
    },

    //----- [HELPER 4 - delete all blank logs] -------
    //method was to create new object, delete old object from localStorage
    //replace old object with new object
    deleteAllLogBlanks(){

        for(let i = 0; i < localStorage.length; ++i) {
            const key = localStorage.key(i);
            if(key && key.startsWith('dailyLogData_')) {
                try{
                    const logDataKey = JSON.parse(localStorage.getItem(key));

                    const newDayLog = [];
                    let dateKey = '2026-04-01'; //April 1st
                    let isArrayChanged = false;
                
                    for(let j = 0 ; j < logDataKey.length ; ++j) {
                        
                        const logEntry = logDataKey[j];
                        dateKey = logEntry['date'];
                        const length = Object.keys(logEntry).length;
                        
                        if(length <= 3) {
                            isArrayChanged = true;
                            continue;
                        }

                        newDayLog.push(logEntry);
                    }

                    if(!isArrayChanged) continue;

                    localStorage.removeItem(key);
                    this.saveRowData(newDayLog, dateKey);                

                } catch (warn) {
                    const logDataKey = localStorage.getItem(key);
                    console.log(logDataKey, key);
                    console.warn(`Could not parse JSON for key ${key}. Storing as a raw string`, warn);
                }
            }
        }
    },
};

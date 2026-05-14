/*  SETTINGS STRUCTURE  
**  ============================================================================
**  DECLARE
**  preferences  -> access Stored data and update as needed
**  current date -> to show latest date only
**  logData      -> get all non-blank data from Storage
**  
**  ============================================================================
**  RENDERING
**  10 sections to render
**  section 9 + 10 include attaching dynamic event listeners
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC (placement known ahead of time)
**  
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  toggleTheme(choice)
**  toggleHemisphere(value)
**  toggleBGLunit(targetUnit)
**  adjustThreshold(type, action)
**  adjustTrend(type, action)
**
**  saveInsulinNames(speed, name)
**  saveInsulinLogBools(speed, showType)
**  updateInsulinPrecision(step)
**  
**  saveChangedGI(item)
**  
**  addTimezone()
**  addLog()
**  
**  handleImportFile(event)
**  exportData()
**  resetAllDataToDefault()
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC 1 (placement changeable based on eg number of rows)
**  timezones
**  
**  ============================================================================
**  FUNCTIONS - DYNAMIC 1
**  
**  changeTimezoneName(newName, startIndex)
**  changeTimezoneStart(val, tzName)
**  removeTimezone(index)
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC 2
**  log times
**  
**  ============================================================================
**  FUNCTIONS - DYNAMIC 2
**  
**  changeLogTime(val, index)
**  removeLog(index)
**  
**  ============================================================================
**  OTHER HELPERS
**  updateTzNamesArray(tzArray) - used for static and dynamic events
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpConvert,
    HelpDateTime,
    HelpTz,
    HelpLog,
    HelpTheme,

} from '../utils/helpers.js';

import { StorageService } from '../utils/storage.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================


export const SettingsView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    preferences: null,

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');

        fetch('../../html/a3Settings.html')
            .then(myResponse => {
                if(!myResponse.ok) throw new Error('HTTP Error');
                return myResponse.text();
            })

            .then(htmlContent => {
                container.innerHTML = htmlContent;
                
                // run function nested in here because of fetch() function running asynchronously
                this.loadPreferences();
            })

            .catch(error => {
                console.error('Error fetching or processing HTML:', error);
            });
    },

    //==========================================================================
    //------------------      [LOAD PREFERENCES SETUP]      --------------------
    //==========================================================================
    loadPreferences() {
        this.preferences = StorageService.getPreferences();
        
        //change timezone array to ensure starts at 00:00 if user didn't set correctly
        const tzArray = this.preferences.timezoneArray;
        tzArray[0].start = '00:00';

        this.renderAllSections();
        this.attachStaticEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {        
        this.renderThemeSection();
        this.renderHemisphereSection();
        this.renderBGLunitsSection();
        this.renderBGLThresholdSection();
        this.renderBGLflagsSection();
        this.renderInsulinShowToggles();
        this.renderInsulinNamesPrecisionSection();        
        this.renderGlycemicIndexSection();
        this.renderTimezoneDefaults();
        this.renderLogDefaults();
    },

    //---------------- [RENDER 1] ------------------
    renderThemeSection() {
        const prefUser = this.preferences.userSelections;
        const lightButton = document.querySelector('[data-value="light"]');
        const darkButton = document.querySelector('[data-value="dark"]');
        const modernButton = document.querySelector('[data-value="modern"]');
        const eightiesButton = document.querySelector('[data-value="eighties"]');        

        lightButton.classList.toggle('active', !prefUser.darkMode);
        darkButton.classList.toggle('active', prefUser.darkMode);
        modernButton.classList.toggle('active', !prefUser.eightiesMode);
        eightiesButton.classList.toggle('active', prefUser.eightiesMode);
    },

    //---------------- [RENDER 2] ------------------
    renderHemisphereSection() {
        const hemisphere = this.preferences.userSelections.hemisphere;        
        const northButton = document.querySelector('.toggle-option[data-value="northern"]');
        const southButton = document.querySelector('.toggle-option[data-value="southern"]');
        
        northButton.classList.toggle('active', hemisphere === 'northern');
        southButton.classList.toggle('active', hemisphere === 'southern');

        //convert table cell colours too
        const northSeasons = document.querySelectorAll('#hemisphere-table [data-value="northern"]');
        const southSeasons = document.querySelectorAll('#hemisphere-table [data-value="southern"]');

        for(const element of northSeasons) {
            element.classList.toggle('active', hemisphere === 'northern');
        }
        for(const element of southSeasons) {
            element.classList.toggle('active', hemisphere === 'southern');
        }
    },

    //---------------- [RENDER 3] ------------------
    renderBGLunitsSection() {
        const glucUnit = this.preferences.userSelections.glucoseUnit;
        const mmolButton = document.querySelector('[data-value="mmol/L"]');
        const mgdlButton = document.querySelector('[data-value="mg/dL"]');        

        mmolButton.classList.toggle('active', glucUnit === 'mmol/L');
        mgdlButton.classList.toggle('active', glucUnit === 'mg/dL');
    },

    //---------------- [RENDER 4] ------------------
    renderBGLThresholdSection() {
        const prefs = this.preferences;
        const unit = prefs.userSelections.glucoseUnit;
        const thresholds = HelpConvert.getBglStepMinFigurative();
        const lowValue = thresholds.hypo;
        const targetValue = thresholds.target;
        const highValue = thresholds.hyper;

        //insert values into html
        document.querySelector('[data-threshold="hypo"] span[data-value="value"]').textContent = lowValue;
        document.querySelector('[data-threshold="target"] span[data-value="value"]').textContent = targetValue;
        document.querySelector('[data-threshold="hyper"] span[data-value="value"]').textContent = highValue;

        //insert unit into html
        const myElements = document.querySelectorAll('[data-threshold] span[data-value="unit"]');
        for(const element of myElements) {
            element.textContent = unit;
        }
    },

    //---------------- [RENDER 5] ------------------
    renderBGLflagsSection() {
        const prefs = this.preferences;
        const trends = prefs.bglWeekPattern; 
        const trendHypos = trends.find(obj => obj.id === 'hypo').toTrack;
        const trendHypers = trends.find(obj => obj.id === 'hyper').toTrack;

        document.querySelector('span[data-trend="hypo"]').textContent = trendHypos;
        document.querySelector('span[data-trend="hyper"]').textContent = trendHypers;
    },

    //---------------- [RENDER 6] ------------------
    renderInsulinShowToggles() {
        const prefsUser = this.preferences.userSelections;
        const rapidShowOrNo = prefsUser.showInsulinRapidLog;
        const medShowOrNo = prefsUser.showInsulinMediumLog;
        const sloShowOrNo = prefsUser.showInsulinSlowLog;
        
        const rapidYes = document.querySelector('button[data-value="yes-show"][data-index="rapid"]');
        const rapidNo = document.querySelector('button[data-value="no-show"][data-index="rapid"]');
        const medYes = document.querySelector('button[data-value="yes-show"][data-index="medium"]');
        const medNo = document.querySelector('button[data-value="no-show"][data-index="medium"]');
        const sloYes = document.querySelector('button[data-value="yes-show"][data-index="slow"]');
        const sloNo = document.querySelector('button[data-value="no-show"][data-index="slow"]');

        rapidYes.classList.toggle('active', rapidShowOrNo);
        rapidNo.classList.toggle('active', !rapidShowOrNo);
        medYes.classList.toggle('active', medShowOrNo);
        medNo.classList.toggle('active', !medShowOrNo);
        sloYes.classList.toggle('active', sloShowOrNo);
        sloNo.classList.toggle('active', !sloShowOrNo);

        return;
    },

    //---------------- [RENDER 7] ------------------
    renderInsulinNamesPrecisionSection() {
        // RENDER INSULIN NAMES
        const prefs = this.preferences;
        const insulinArr = prefs.insulinArray;
        const bolus1 = insulinArr.find(obj => obj.speed === 'rapid').name;
        const bolus2 = insulinArr.find(obj => obj.speed === 'medium').name;
        const basal = insulinArr.find(obj => obj.speed === 'slow').name;

        document.getElementById('rapid-insulin').value = bolus1;
        document.getElementById('medium-insulin').value = bolus2;
        document.getElementById('slow-insulin').value = basal;

        // const prefsUser = prefs.userSelections;
        // prefsUser.insulinPrecision = 2;
        // StorageService.savePreferences(this.preferences);

        // RENDER INSULIN PRECISION
        const precision = prefs.userSelections.insulinPrecision;
        console.log(precision);
        const tenthsHtml = document.querySelector('button[data-value="tenths"]');
        console.log(tenthsHtml);
        const halfHtml = document.querySelector('button[data-value="half"]');
        const intHtml = document.querySelector('button[data-value="integer"]');

        tenthsHtml.classList.toggle('active', precision === 10);
        halfHtml.classList.toggle('active', precision === 2);
        intHtml.classList.toggle('active', precision === 1);
    },
    
    //---------------- [RENDER 8] ------------------
    renderGlycemicIndexSection() {
        const prefs = this.preferences;
        const giArray = prefs.giArray;
        const gi0 = giArray.find(obj => obj.speed === 0).hours;
        const gi1 = giArray.find(obj => obj.speed === 1).hours;
        const gi2 = giArray.find(obj => obj.speed === 2).hours;
        const gi3 = giArray.find(obj => obj.speed === 3).hours;
        const gi4 = giArray.find(obj => obj.speed === 4).hours;

        document.querySelector('#glycemic-index-tbody [data-index="0"]').value = gi0;
        document.querySelector('#glycemic-index-tbody [data-index="1"]').value = gi1;
        document.querySelector('#glycemic-index-tbody [data-index="2"]').value = gi2;
        document.querySelector('#glycemic-index-tbody [data-index="3"]').value = gi3;
        document.querySelector('#glycemic-index-tbody [data-index="4"]').value = gi4;
    },

    //---------------- [RENDER 9] ------------------
    renderTimezoneDefaults() {  
        const prefs = this.preferences;      
        const tzArray = prefs.timezoneArray;

        // ensure 1st Tz is 00:00 after sorting
        if(tzArray[0].start !== '00:00') {
            HelpHtml.showMessage('Please ensure 1 timezone begins at 00:00', 'warning');
        }

        //the whole table body from html
        const tableBody = document.getElementById('timezone-defaults-tbody');
        tableBody.innerHTML = tzArray.map((element) => {
            return `
            <tr class="timezone-row" data-row-id="${element['name']}">
                <td>
                    <input type="text" data-index="${element['start']}" data-row-id="${element['name']}" value="${element['name']}">
                </td>
                <td>
                    <input type="time" data-index="start" data-row-id="${element['name']}" value="${element['start']}">
                </td>
                <td>
                    <button class="icon-button delete" data-action="delete" data-row-id="${element['name']}" title="Delete"></button>
                </td>
            </tr>
            `;
        }).join('');
        
        // RE-ATTACH DYNAMIC EVENT LISTENERS every time things are reset
        this.attachDynamicTimezoneEventListener();
    },

    //---------------- [RENDER 10] ------------------
    renderLogDefaults() {
        const prefs = this.preferences;
        const logArray = prefs.logArray;
        const tableBody = document.getElementById('log-defaults-tbody');

        tableBody.innerHTML = logArray.map((element, index) => {
            const displayIndex = index + 1;
            const colorLog = HelpLog.getLogsTimeofDayColorClass(element);
            return `
            <tr class="log-row" data-row-id="${index}">
                <td>
                    <button class="icon-button non-symbol badge-style fullfat ${colorLog}" data-index="log-order" data-row-id="${index}">${displayIndex}</button>
                </td>
                <td>
                    <input type="time" data-index="log-time" data-row-id="${index}" value="${element}">
                </td>
                <td>
                    <button class="icon-button delete" data-action="delete" data-row-id="${index}" title="Delete"></button>
                </td>
            </tr>
            `;
        }).join('');
        
        console.log(tableBody);

        // RE-ATTACH DYNAMIC EVENT LISTENERS every time things are reset
        this.attachDynamicLogEventListener();
    },

    //==========================================================================
    //-----------   [        EVENT LISTENERS - STATIC        ]  ----------------
    //==========================================================================
    attachStaticEventListeners() {        
        const themeButtons = document.querySelectorAll('#toggle-theme .toggle-option');
        for(const btn of themeButtons) {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.value;   //eg dark or light
                this.toggleTheme(choice);
            });
        }
        
        const fontTheme = document.querySelectorAll('#toggle-font .toggle-option');
        for(const btn of fontTheme) {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.value;   //eg 80s or not
                this.toggleTheme(choice);
            });
        }

        //------------------------------------------------------
        const hemisphereButtons = document.querySelectorAll('#toggle-hemisphere .toggle-option');
        for(const btn of hemisphereButtons) {
            btn.addEventListener('click', () => {
                this.toggleHemisphere(btn.dataset.value);
            });
        }

        //------------------------------------------------------
        const bglunitButtons = document.querySelectorAll('#toggle-bglunit .toggle-option');
        for(const btn of bglunitButtons) {
            btn.addEventListener('click', () => {
                this.toggleBGLunit(btn.dataset.value);
            });
        }

        //------------------------------------------------------
        const adjustThresholdButtons = document.querySelectorAll('#bgl-thresholds button');
        for(const btn of adjustThresholdButtons) {
            btn.addEventListener('click', () => {
                const threshold = btn.dataset.threshold; //eg low, high
                const action = btn.dataset.action; //eg decr, incr
                this.adjustThreshold(threshold, action);
            });
        }

        //------------------------------------------------------
        const trendButtons = document.querySelectorAll('#bgl-trends button');
        for(const btn of trendButtons) {
            btn.addEventListener('click', () => {
                const trend = btn.dataset.trend; //eg hypo
                const action = btn.dataset.action; //eg decrease or increase
                this.adjustTrend(trend, action);
            });
        }

        //------------------------------------------------------
        const insulinTypesText = document.querySelectorAll('#insulin-types-form input');
        for(const inpt of insulinTypesText) {
            inpt.addEventListener('input', () => {                
                this.saveInsulinNames(inpt.dataset.index, inpt.value);
            });
        }

        const insulinShowOrNo = document.querySelectorAll('.toggle-switch.insulin button');
        for(const button of insulinShowOrNo) {
            button.addEventListener('click', () => {
                const speed = button.dataset.index;
                const showType = button.dataset.value;
                this.saveInsulinLogBools(speed, showType);
            });
        }

        const insulinPrecision = document.querySelectorAll('.toggle-switch.precision button');
        for(const button of insulinPrecision) {
            button.addEventListener('click', () => {
                const precision = Number.parseFloat(button.textContent);
                this.updateInsulinPrecision(precision);

                console.log(precision);
            });
        }

        //------------------------------------------------------
        const changeGIbuttons = document.querySelectorAll('.glycemic-index-input');
        for(const speed of changeGIbuttons) {
            speed.addEventListener('blur', (event) => {
                console.log(event.target);
                this.saveChangedGI(event.target);
            });
        }

        //------------------------------------------------------
        const addTimezoneButton = document.getElementById('add-timezone');
        addTimezoneButton.addEventListener('click', () => {
            this.addTimezone();
        });

        const addLogButton = document.getElementById('add-log');
        addLogButton.addEventListener('click', () => {
            this.addLog();
        });        

        //------------------------------------------------------
        //for file import, had to split up the button event from the file importing event
        const dataImportButton = document.getElementById('data-import');
        dataImportButton.addEventListener('click', () => {
            dataImportFile.click();
        });

        const dataImportFile = document.getElementById('import-file');
        dataImportFile.addEventListener('change', (event) => {
            this.handleImportFile(event);            
        });

        //------------------------------------------------------
        const dataExportButton = document.getElementById('data-export');
        dataExportButton.addEventListener('click', () => {
            this.exportData();
        });

        //------------------------------------------------------
        const clearDataButton = document.getElementById('data-clear');
        clearDataButton.addEventListener('click', () => {
            this.resetAllDataToDefault();
        });
    }, 

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    toggleTheme(choice) {
        const prefUser = this.preferences.userSelections;

        if(choice === 'dark' || choice === 'light') {
            prefUser.darkMode = (choice === 'dark'); //updates darkmode? to be true or false
        }
        if(choice === 'modern' || choice === 'eighties') {
            prefUser.eightiesMode = (choice === 'eighties'); //updates 80smode? to be true or false
        }        
        
        StorageService.savePreferences(this.preferences);
        HelpTheme.applyTheme(prefUser.darkMode, prefUser.eightiesMode);
        this.renderAllSections();

        const darkOrLight = prefUser.darkMode? 'dark' : 'light';
        const eightiesOrModern = prefUser.eightiesMode? 'eighties' : 'modern';
        const theme = darkOrLight + '-' + eightiesOrModern;

        switch(theme) {
            case 'dark-eighties': {
                HelpHtml.showMessage('Extremely wise choice');
                break;    
            }

            case 'light-eighties': {
                HelpHtml.showMessage('Oooooh yeah - dig it!');
                break;    
            }

            case 'dark-modern': {
                HelpHtml.showMessage('A solid option');
                break;    
            }

            case 'light-modern': {
                HelpHtml.showMessage('A bold selection');
                break;    
            }

            default: HelpHtml.showMessage('great');
        }

        return;
    },

    //---------------- [FUNCTION STATIC 2] ------------------
    toggleHemisphere(value) {
        this.preferences.userSelections.hemisphere = value; //updates hemisphere to be northern or southern
        StorageService.savePreferences(this.preferences);
        // this.renderAllSections();
        this.renderHemisphereSection();

        switch(value) {
            case 'northern': {
                // eslint-disable-next-line quotes
                HelpHtml.showMessage("How's she boutin', eh?", 'northern');
                break;
            }

            case 'southern': {
                HelpHtml.showMessage('Chuck a shrimp on the barbie mate!', 'southern');
                break;
            }
        }        
    },

    //---------------- [FUNCTION STATIC 3] ------------------
    toggleBGLunit(targetUnit) {
        this.preferences.userSelections.glucoseUnit = targetUnit;
        StorageService.savePreferences(this.preferences);

        this.renderBGLunitsSection();
        this.renderBGLThresholdSection();
        HelpHtml.showMessage('BGL unit updated');
    },

    //---------------- [FUNCTION STATIC 4] ------------------
    adjustThreshold(type, action) { //eg hypo increase
        const bglArr = this.preferences.bglWeekPattern;

        // literal as in indexed - mmol/L is index unit
        const thresholdsLit = HelpConvert.getBglStepMinLiteral();
        const stepLit = thresholdsLit.step;   //need the correct step for -/+

        const myStoredObj = bglArr.find(item => item.id === type);  //eg look up hypo to get 6.0
        const valIndexed = myStoredObj.value;   //ie in mmol/L

        const newValIndexed = action === 'increase' ?
            valIndexed + stepLit :
            Math.max(1, valIndexed - stepLit);

        // keep storing as floating mmol/L as indexed
        myStoredObj.value = newValIndexed;
        
        StorageService.savePreferences(this.preferences);
        this.renderBGLThresholdSection();
    },
    //---------------- [FUNCTION STATIC 5] ------------------
    adjustTrend(type, action) {
        const bglArr = this.preferences.bglWeekPattern;
        const valLookup = bglArr.find(obj => obj.id === type);    //eg 2 in current storage
        const current = valLookup.toTrack;

        const newValue = action === 'increase'?
            Math.min(5, current + 1) :
            Math.max(1, current - 1);

        valLookup.toTrack = newValue;

        StorageService.savePreferences(this.preferences);
        this.renderBGLflagsSection();
    },
    
    //---------------- [6: INSULIN SECTION] -------------------
    //---------------- [FUNCTION STATIC 6.1] ------------------
    saveInsulinNames(speed, name) {
        if(name.length === 0) return;

        const insulinArr = this.preferences.insulinArray;
        const insObj = insulinArr.find(obj => obj.speed === speed);    //eg novorapid
        insObj.name = name;

        StorageService.savePreferences(this.preferences);
        this.renderInsulinNamesPrecisionSection();
    },

    //---------------- [FUNCTION STATIC 6.2] ------------------
    saveInsulinLogBools(speed, showType) {
        const prefsUser = this.preferences.userSelections;

        const isShow = (showType === 'yes-show');

        switch(speed) {
            case 'rapid': {
                prefsUser.showInsulinRapidLog = isShow;
                break;
            }

            case 'medium': {
                prefsUser.showInsulinMediumLog = isShow;
                break;
            }

            case 'slow': {
                prefsUser.showInsulinSlowLog = isShow;
                break;
            }
        }

        if(!prefsUser.showInsulinRapidLog && !prefsUser.showInsulinMediumLog && speed === 'rapid') {
            //rapid just clicked, so set medium to be true
            prefsUser.showInsulinMediumLog = true;
            HelpHtml.showMessage('at least 1 bolus insulin should show on Log screen');
        } else if(!prefsUser.showInsulinRapidLog && !prefsUser.showInsulinMediumLog && speed === 'medium') {
            //medium just clicked, so set rapid to be true
            prefsUser.showInsulinRapidLog = true;
            HelpHtml.showMessage('at least 1 bolus insulin should show on Log screen');
        }

        StorageService.savePreferences(this.preferences);
        this.renderInsulinShowToggles();
    },

    //---------------- [FUNCTION STATIC 6.3] ------------------
    updateInsulinPrecision(step) {
        const prefs = this.preferences;
        const prefsUser = prefs.userSelections;
        const precision = Number.parseInt(1/step);

        prefsUser.insulinPrecision = precision;

        StorageService.savePreferences(prefs);
        this.renderInsulinNamesPrecisionSection();
    },

    //---------------- [FUNCTION STATIC 7] ------------------
    saveChangedGI(item) {
        const prefs = this.preferences;
        const giArray = prefs.giArray;
        const newHours = item.value;
        const speed = Number.parseInt(item.dataset.index);

        //find object in stored array to change
        const giObj = giArray.find(obj => obj.speed === speed);
        console.log(giObj);
        giObj.hours = newHours;

        //save
        StorageService.savePreferences(this.preferences);
    },

    //---------------- [FUNCTION STATIC 8] ------------------
    addTimezone() {
        const input = document.getElementById('new-timezone');
        const timezone = input.value.trim();
        
        if (!timezone) {
            HelpHtml.showMessage('Please enter a timezone name', 'error');
            return;
        }

        if (this.preferences.timezones.includes(timezone)) {
            HelpHtml.showMessage('This timezone already exists', 'error');
            return;
        }
        //Fill in default with 11:59 etc.
        const newTimezoneObject = {
            start: '23:59',
            name: timezone,
            isRef: false,
            glucosePer1U: 10,
            bglDropPer1U: 2,
            glucoseUnit: 'mmol/L',
            factor: 1        
        };

        this.preferences.timezoneArray.push(newTimezoneObject);        
        
        //also update array of just timezone names
        this.updateTzNamesArray(this.preferences.timezoneArray);

        StorageService.savePreferences(this.preferences);
        
        input.value = '';
        HelpHtml.showMessage('timezone added');
        this.renderTimezoneDefaults();
    },

    //---------------- [FUNCTION STATIC 9] ------------------
    addLog() {
        const logArr = this.preferences.logArray;
        const input = document.getElementById('new-log');
        const val = input.value.trim();

        //if this log time is = another one in array, have to reject
        if(logArr.includes(obj => obj === val)) {
            console.log('this log already exists');
            HelpHtml.showMessage('log time already exists', 'warning');
            return;
        }

        logArr.push(val);
        HelpDateTime.sortLogTimes(logArr);

        StorageService.savePreferences(this.preferences);

        this.renderLogDefaults();
    },
    
    //---------------- [10: DATA MANAGEMENT] -------------------
    //---------------- [FUNCTION STATIC 10.1] ------------------
    handleImportFile(event) {
        console.log('running handleFileImport');
        const file = event.target.files[0];
        if (!file) return;

        const isImported = this.parseImportFile(file, event);
        return isImported;        
    },

    async parseImportFile(file, event) {
        const csvText = await file.text();

        try {
            const data = JSON.parse(csvText);
            
            if (!HelpHtml.confirm('This will overwrite ALL existing data. Continue?')) {
                return;
            }

            StorageService.importData(data);
            HelpHtml.showMessage('Data imported successfully');
            setTimeout(() => globalThis.location.reload(), 1000);

        } catch (error) {
            console.error('Import error:', error);
            HelpHtml.showMessage('Error importing data. Please check the file format.', 'error');
        }
        
        event.target.value = '';
        return true;
    },
    
    //---------------- [FUNCTION STATIC 10.2] ------------------
    exportData() {
        console.log('exporting data');

        const data = StorageService.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `diabetes-tracker-backup-${HelpDateTime.getTodayKey()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        HelpHtml.showMessage('Data exported successfully');
    },

    //---------------- [FUNCTION STATIC 10.3] ------------------
    resetAllDataToDefault() {
        if (!HelpHtml.confirm('This will reset ALL data. This cannot be undone. Are you sure?')) {
            return;
        }

        localStorage.clear();
        HelpHtml.showMessage('All data reset');
        setTimeout(() => globalThis.location.reload(), 1000);
    },    

    //==========================================================================
    //-----------   [        EVENT LISTENERS - DYNAMIC 1       ]  --------------
    //==========================================================================
    attachDynamicTimezoneEventListener() {
        const changeTzNameButtons = document.querySelectorAll('#timezone-defaults-tbody [type="text"]');
        for(const input of changeTzNameButtons) {
            input.addEventListener('change', () => {
                const startIndex = input.dataset.index;
                const newName = input.value.trim();
                this.changeTimezoneName(newName, startIndex); //eg earlyish
            });
        }
                
        const changeTzStartButtons = document.querySelectorAll('#timezone-defaults-tbody [data-index="start"]');
        for(const inpt of changeTzStartButtons) {
            inpt.addEventListener('blur', (event) => {
                // const element = event.target; //gives element on which box clicked eg range-start for early
                const val = event.target.value;  //gives the new user value eg 07:30
                const tzName = event.target.closest('tr').dataset.rowId; //check parentElement val comes through
                this.changeTimezoneStart(val, tzName);
            });
        }

        const deleteTimezoneButtons = document.querySelectorAll('.timezone-row button.icon-button.delete');
        for(const btn of deleteTimezoneButtons) {
            btn.addEventListener('click', () => {
                const tzName = btn.dataset.rowId;
                this.removeTimezone(tzName); //eg early
            });
        }
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - DYNAMIC 1        ]  --------------
    //==========================================================================   

    //---------------- [FUNCTION DYNAMIC 1.1] ------------------
    changeTimezoneName(newName, startIndex) {
        if (newName.length === 0) {
            HelpHtml.showMessage('I pity the fool! Blank names are not saved', 'error');
            return;
        }

        const tzArray = this.preferences.timezoneArray;

        if (tzArray.some(obj => obj.name === newName)) {
            HelpHtml.showMessage('timezone name already exists', 'error');
            return;
        }

        //Overwrite old name using index for tzArray
        const tzToChange = tzArray.find(obj => obj.start === startIndex);
        tzToChange.name = newName;

        //also update array of just timezone names
        this.updateTzNamesArray(tzArray);
        
        StorageService.savePreferences(this.preferences);
        this.renderTimezoneDefaults();
    },

    //---------------- [FUNCTION DYNAMIC 1.2] ------------------
    changeTimezoneStart(val, tzName) {//eg: 04:00, 'early'
        const tzArr = this.preferences.timezoneArray;

        //earliest timezone must begin at 00:00
        const myStoredObj = tzArr.find(item => item.name === tzName);
        myStoredObj['start'] = val; //newVal after logic

        //get new index color to add to array based on startTime/2 index
        const tzColor = HelpTz.getTzTimesColor(val);
        myStoredObj['color'] = tzColor;

        //also update array of just timezone names (checks names are unique)
        this.updateTzNamesArray(tzArr);
        StorageService.savePreferences(this.preferences);
        this.renderTimezoneDefaults();
    },

    //---------------- [FUNCTION DYNAMIC 1.3] ------------------
    removeTimezone(index) {
        const tzArr = this.preferences.timezoneArray;
        const refElement = tzArr.find(item => item.isRef === true);
        const thisElement = tzArr.find(item => item.name === index);

        if (refElement.name === thisElement.name) {
            HelpHtml.showMessage('select a different reference timezone (Statistics: time of day ratio) before deleting');
            return;
        }

        const isConfirmed = HelpHtml.confirm('remove this timezone?');
        if (!isConfirmed) return;

        //must be at least 1 timezone!
        if(tzArr.length < 2){
            HelpHtml.showMessage('at least 1 column must remain per day', 'warning');
            return;
        };

        //splice(index, 1) changes original array
        const indexToDelete = tzArr.findIndex(obj => obj.name === index);
        if(indexToDelete !== -1) {
            tzArr.splice(indexToDelete, 1); //remove 1 element at found index
        }
        
        //also update array of just timezone names
        this.updateTzNamesArray(tzArr);

        StorageService.savePreferences(this.preferences);

        //Have to dynamically re-render because of unknown row numbers
        this.renderTimezoneDefaults();
    },

    //==========================================================================
    //-----------   [        EVENT LISTENERS - DYNAMIC 2       ]  --------------
    //==========================================================================

    attachDynamicLogEventListener() {
        //this is for saving the table's td values in place
        const changeLogTimeButtons = document.querySelectorAll('#log-defaults-tbody [data-index="log-time"]');
        for(const inpt of changeLogTimeButtons) {
            inpt.addEventListener('blur', (event) => {
                const element = event.target; //gives element on which box clicked eg range-start for early
                const val = event.target.value;  //gives the new user value eg 07:30
                const parent = event.target.closest('tr').dataset.rowId; //check parentElement val comes through
                console.log(element, val, parent);
                this.changeLogTime(val, parent);
            });
        }

        const deleteLogButtons = document.querySelectorAll('.log-row button.icon-button.delete');
        for(const btn of deleteLogButtons) {
            btn.addEventListener('click', () => {
                const index = btn.dataset.rowId;
                this.removeLog(index); //eg early
            });
        }
    },
    //==========================================================================
    //----------------   [        FUNCTIONS - DYNAMIC 2        ]  --------------
    //==========================================================================

    //---------------- [FUNCTION DYNAMIC 2.1] ------------------
    changeLogTime(val, index) {//new value eg: 04:00, 1
        const logArr = this.preferences.logArray;
        logArr[index] = val;
        HelpDateTime.sortLogTimes(logArr);

        StorageService.savePreferences(this.preferences);

        this.renderLogDefaults();
    },

    //---------------- [FUNCTION DYNAMIC 2.2] ------------------
    removeLog(index) {
        const logArr = this.preferences.logArray;

        const isConfirmed = HelpHtml.confirm('remove this log?');
        if (!isConfirmed) return;

        //must be at least 1 log!
        if(logArr.length < 2){
            HelpHtml.showMessage('at least 1 column must remain per day', 'warning');
            return;
        };

        //splice(index, 1) changes original array
        if(index !== -1) {
            logArr.splice(index, 1); //remove 1 element at found index
        }
        
        StorageService.savePreferences(this.preferences);

        this.renderLogDefaults();
    },

    //==========================================================================
    //----------------       [        OTHER HELPERS        ]      --------------
    //==========================================================================
    //---------------- [HELPER 1] ------------------
    updateTzNamesArray(tzArray) {
        const tzNameArray = [];
        
        for(const tz of tzArray) {
            tzNameArray.push(tz.name);
        }

        this.preferences.timezones = tzNameArray;
    },    
};

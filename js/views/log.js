/*  LOG STRUCTURE  
**  ============================================================================
**  DECLARE
**  preferences -> access Stored data and update as needed
**  bglStepMin  -> min, max, step etc for blood sugar data validation
**  current date -> show latest date on entry
**  dayLogsArray -> holds relevant day's data to display
**  
**  ============================================================================
**  RENDERING
**  v simple -> SelectedDate, CSVtoggle
**  Table    -> renders dayLogsArray, attaches button listeners, hides columns
**  if selected so by user in 'Settings', uses bglStepMin for blood sugar data
**  validation
**
**  ============================================================================
**  RENDER HELPERS
**  loadFoodDictionary -> for selecting food entries from drop-down box
**  loadNewOrExistingData(dateKey) -> works out if dateKey is new date and 
**  either loads from Storage or creates new
**
**  ============================================================================
**  EVENT LISTENERS - STATIC (placement known ahead of time)
**  
**  date buttons & picker
**
**  csv buttons -> importing, exporting, including blanks or not. Including 
**  blanks for export means you'll get empty rows, which might be useful for
**  then filling in and re-importing. Including blanks for import means 
**
**  column/all copiers -> number of columns already known, copy all is static
**  button (rows has to be dynamic)
**
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  copyYesterdayAll() -> clicking top-left copies everything over from yesterday
**  
**  copyYesterdayCol(col) -> copies over a particular column heading: only for
**  times that match
**  
**  importButtonClick() -> records file event and leads into next function ->  
**  importCsv(event)
**  
**  toggleBlanks(choice) -> whether to include blanks or not - e.g. exporting
**  empty rows
**  
**  changeDate(days), changeDatePickerDate(date)
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC (placement changeable based on eg number of rows)
**  
**  add/deleteRow ->
**  logTimeButtons -> for saving log time
**  bglButtons, exercise, insulin -> same as logTime
**  
**  food buttons -> addFood, deleteFood, food text, multiplier/serving,
**  toolTip for serve
**
**  ============================================================================
**  FUNCTIONS - DYNAMIC
**  
**  addRowAfter(idx)
**  deleteRow(idx)
**  
**  saveLogTime(val, index)
**  logBglData(idx, val)
**  logExerciseData(idx, val)
**  logInsulinData(idx, naming, val)
**  
**  addFood(idx)
**  updateFoodText(rowIdx, entryIdx, val, entryTest)    -> feeds into Tooltip
**  updateFoodMultiplier(rowIdx, entryIdx, val)         -> feeds into Tooltip
**  deleteFood(rowIdx, entryIdx)
**  updateTooltip(rowIdx, foodIdx)
**  
**  copyYesterdayRow(rowLog)
**  
**  recordLogDataChanged() -> experimental global boolean for speeding up, i.e.
**  don't re-get log data in different pages if log data hasn't changed
*/

/* eslint-disable indent */

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpConvert,
    HelpDateTime,
    HelpNum,
    HelpTz,
    HelpLog,

} from '../utils/helpers.js';

import { StorageService } from '../utils/storage.js';
import { CSVService } from '../utils/csvService.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================
export const LogView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    currentDate: HelpDateTime.getTodayKey(),
    dayLogsArray: [],    //for rendering table with new array
    preferences: null, //declared so everywhere can access once defined
    bglStepMin: [], //call once to get the relevant step/min stuff

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('../../html/a2LogEntry.html')
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
    //------------------ [LOAD PREFERENCES SETUP] ------------------------------
    //==========================================================================
    loadPreferences() {
        this.preferences = StorageService.getPreferences();
        this.bglStepMin = HelpConvert.getBglStepMinFigurative();
        this.attachStaticEventListeners();        
        this.loadFoodDictionary();  //loading foods to pick from
        this.renderAllSections();        
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {    
        this.renderSelectedDate();
        this.renderCSVtoggle();
        this.renderTable();
    },

    //---------------- [RENDER 1] ------------------
    renderSelectedDate() {
        const datePick = document.getElementById('date-picker');
        datePick.value = this.currentDate;

        const dateHeaders = document.querySelector('#today-heading span');

        dateHeaders.innerHTML = HelpDateTime.formatDayDateMonth(this.currentDate);
        // const dateHeaders = document.querySelectorAll('h2 span[data-index="date"]');
        // for(const head of dateHeaders) {
        //     head.innerHTML = HelpDateTime.formatDayDateMonth(this.currentDate);
        // }
    },

    //---------------- [RENDER 2] ------------------
    renderCSVtoggle(){
        const prefs = this.preferences;
        const prefUser = prefs.userSelections;
        
        //BLANKS TOGGLE
        const blanks = document.querySelector('[data-value="yes-blanks"]');
        const noBlanks = document.querySelector('[data-value="no-blanks"]');        

        blanks.className = 'toggle-option' +
            (prefUser.CSVincludeBlanks? ' active' : '');

        noBlanks.className = 'toggle-option' +
            (prefUser.CSVincludeBlanks? '' : ' active');
    },
    
    //---------------- [RENDER 3] ------------------
    renderTable() {
        console.log('rendering table');
        const prefs = StorageService.getPreferences();
        const prefsUser = prefs.userSelections;

        //glucose unit from Settings
        const bglUnitSettings = prefsUser.glucoseUnit;
        const bglStepMin = this.bglStepMin;

        //insulin precision from Settings
        const insStepMin = HelpConvert.getInsulinPrecisionStep();

        //show basal or bolus settings
        const showRapid = prefsUser.showInsulinRapidLog;
        const showMed = prefsUser.showInsulinMediumLog;
        const showSlow = prefsUser.showInsulinSlowLog;

        //this is fine
        const insulinTypes = prefs.insulinArray;
        const insRapid = insulinTypes.find(item => item.speed === 'rapid');
        const insMed = insulinTypes.find(item => item.speed === 'medium');
        const insSlow = insulinTypes.find(item => item.speed === 'slow');
        
        //html sections
        // const thead = document.getElementById('log-thead');
        const tbody = document.getElementById('log-tbody');

        //get the array - either composed of empty data rows or fully set-up filled in rows
        //loading the default time columns to be used in timeColumns
        const dateKey = this.currentDate;
        const dayLogsArray = this.loadNewOrExistingData(dateKey);
        this.dayLogsArray = dayLogsArray;

        
        // INSULIN NAMES/SHOW COLUMNS
        const thRapid = document.querySelector('#log-thead [data-value="rapidU"]');
        const thMed = document.querySelector('#log-thead [data-value="mediumU"]');
        const thSlow = document.querySelector('#log-thead [data-value="slowU"]');
        thRapid.innerHTML = insRapid.name;
        thMed.innerHTML = insMed.name;
        thSlow.innerHTML = insSlow.name;

        thRapid.classList.toggle('hidden', !showRapid);
        thMed.classList.toggle('hidden', !showMed);
        thSlow.classList.toggle('hidden', !showSlow);

        // FOOD INFO
        //get multiplier + glucose grams
        const foodArray = prefs.foodArray;

        // ***** error comes up about NaN cannot be parsed for empty days - need it to stop *****
        tbody.innerHTML = dayLogsArray.map((row, idx) => {
            // console.log(row, idx);
            const timezone = HelpTz.getTimesTzName(row.logTime);
            const colorClass = HelpLog.getLogsTimeofDayColorClass(row.logTime);
            const valueBgl = HelpConvert.displayAsCorrectGlucoseUnit(row.bgl)?? '';
            const valueRap = row.rapidU?? '';
            const valueMed = row.mediumU?? '';
            const valueSlo = row.slowU?? '';
            const entries = row.food?? [];
            const intensity = row.exercise?? '';
            
            return `
            <tr class="data-row">
                <th class="${colorClass}">
                    <div class="">
                        <div class="">
                            <button class="icon-button small danger" data-action="delete-row" data-index="${idx}" title="Delete row">x</button>
                            <div class="copy-function badge background ${colorClass}" data-action="copy-yesterday-row" data-value="${row.logTime}">${timezone}</div>
                            <button class="icon-button small" data-action="add-row" data-index="${idx}" title="Add row">+</button>
                        </div>                        
                        <input type="time" class="tz-default-input" data-index="${idx}" value="${row.logTime}">
                    </div>
                </th>

                <td class="${valueBgl ? 'has-data' : ''} bgl-col" data-index="${idx}">
                    <input type="number"
                        value="${valueBgl}"
                        placeholder="${bglUnitSettings}"
                        max="${bglStepMin.max}" 
                        min="${bglStepMin.min}"
                        step="${bglStepMin.step}">
                </td>

                <td data-value="food-cell" class="${entries.length > 0 ? 'has-data' : ''} food-col" data-index="${idx}">
                    <div class="multi-box-container column squished">
                        ${entries.map((entry, foodIdx) => {
                            console.log(entries);
                            const food = entry.name;
                            const multiplier = entry.multiplier;
                            const foodObj = foodArray.find(obj => obj.name === food);
                            const glucoseGrams = foodObj? foodObj.glucoseGPerServing : null;
                            const totalGlucose = foodObj? Math.round(glucoseGrams * multiplier): null;
                        
                            return `
                                <div class="input-with-tooltip" data-index="${foodIdx}">
                                    <input list="all-foods-list"
                                        value="${food}" 
                                        placeholder="food">                                
                                    <input type="number" 
                                        value="${multiplier}" 
                                        step="1.0" 
                                        placeholder="1.0">
                                    <span class="tooltip">${multiplier}x serving${glucoseGrams === null? '' : `= ${totalGlucose} grams`}</span>
                                    <button class="icon-button small danger" 
                                        data-action="delete-food">x</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button data-action="add-food" class="big-and-wide dashed">+</button>
                </td>

                <td class="${valueRap ? 'has-data' : ''} ${showRapid? '': ' hidden'} insulin-col" data-index="${idx}" name="bolusRapid">
                    <input type="number" 
                            value="${valueRap}" 
                            placeholder="-" 
                            min="${insStepMin}" 
                            step="${insStepMin}">
                </td>

                <td class="${valueMed ? 'has-data' : ''} ${showMed? '': ' hidden'} insulin-col" data-index="${idx}" name="bolusMedium">
                    <input type="number" 
                            value="${valueMed}" 
                            placeholder="-" 
                            min="${insStepMin}" 
                            step="${insStepMin}">
                </td>

                <td class="${valueSlo ? 'has-data' : ''} ${showSlow? '': ' hidden'} insulin-col" data-index="${idx}" name="basalSlow">
                    <input type="number"
                            value="${valueSlo}" 
                            placeholder="-" 
                            min="${insStepMin}" 
                            step="${insStepMin}">
                </td>

                <td class="${intensity ? 'has-data' : ''} exercise-col">
                    <select data-index="${idx}">
                        ${[0, 1, 2, 3, 4, 5].map(i => `
                        <option value="${i}" ${intensity == i ? 'selected' : ''}>${i}</option>
                        `).join('')}
                    </select>
                </td>
            </tr>
        `;}).join('');

        this.attachDynamicEventListeners();
    },

    //==========================================================================
    //--------------------       [RENDER HELPERS]        -----------------------
    //==========================================================================

    //---------------- [HELPER 1] ------------------
    loadFoodDictionary(){
        const prefs = this.preferences;
        const datalist = document.getElementById('all-foods-list');
        const foodDictionary = prefs.foodDictionary;

        console.log(foodDictionary);

        datalist.innerHTML = foodDictionary.map(food => {
            return `
            <option value = "${food}"></option>
            `;

        }).join('');
        console.log(datalist);
    },

    //---------------- [HELPER 2] ------------------


    //---------------- [HELPER 3] ------------------   
    loadNewOrExistingData(dateKey) {
        // IF DATA EXISTS FOR SELECTED DAY
        const dayLogsData = StorageService.getRowData(dateKey);
        
        if(Array.isArray(dayLogsData)) {            
            return dayLogsData;
        }
        
        //create empty data columns set-up
        //only need to do this stuff if completely empty for the dayLogsArray
        const prefs = StorageService.getPreferences();
        const logArr = prefs.logArray;
        
        const blankLogsArray = logArr.map(logTime => {
            return {
                date: dateKey,
                logTime: logTime,
                id: `${dateKey}_${logTime}`, //reject any rows which would have same date_log key - done in addColumn function
            };
        });

        return blankLogsArray;
    },

    //==========================================================================
    //-----------   [        EVENT LISTENERS - STATIC        ]  ----------------
    //==========================================================================

    attachStaticEventListeners() {
        console.log('add els');
        //change day left and right
        const dateButton = document.querySelectorAll('#date-change-box button');
        for(const element of dateButton) {
            const action = element.dataset.action;
            element.addEventListener('click', () => {
                action === 'increase'? this.changeDate(1): this.changeDate(-1);
            });           
        }

        const datePicker = document.getElementById('date-picker');
        datePicker.addEventListener('change', () => {
            console.log(datePicker.value);
            this.changeDatePickerDate(datePicker.value);

        });

        //toggles including blanks or not
        const blanksButtons = document.querySelectorAll('#toggle-blanks .toggle-option');
        for(const btn of blanksButtons) {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.value;   //yes-blanks or no-blanks
                this.toggleBlanks(choice);
            });
        }

        //delete all blank log entries -> eg imported blanks by mistake
        const deleteBlanksButtons = document.querySelector('button[data-action="delete-empties"]');
        deleteBlanksButtons.addEventListener('click', () => {
            this.deleteAllBlankLogs();
        });

        const csvButtons = document.querySelectorAll('#csv-holder button.secondary');
        for(const element of csvButtons) {
            const action = element.dataset.action;
            element.addEventListener('click', () => {
                switch(action) {
                    case 'export-csv': {
                        CSVService.exportCSV();
                        break;
                    }

                    case 'import-csv': {
                        this.importButtonClick();   //this records a file event
                        break;
                    }
                    default: return;
                }
            });
        }

        //something about handling event for file import
        const handleFileEvent = document.getElementById('csv-file-input');
        handleFileEvent.addEventListener('change', (event) => {
            // this.importCSV(event, this.currentDate);
            const isImported = CSVService.importCsv(event);
            if(isImported) this.render();
        });

        const colCopiers = document.querySelectorAll('th[data-action="copy-yesterday-column"]');
        for(const heading of colCopiers) {
            heading.addEventListener('click', (element) => {
                const col = element.target.dataset.value;
                this.copyYesterdayCol(col);
            });
        }
        
        const allCopier = document.querySelector('th[data-action="copy-yesterday-all"]');
        allCopier.addEventListener('click', () => {
            this.copyYesterdayAll();
        });
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================

    deleteAllBlankLogs() {
        const confirmMessage = 'this will delete all log times with zero data';
        if (!confirm(confirmMessage)) {
            return;
        }

        StorageService.deleteAllLogBlanks();
    },


    //---------------- [FUNCTION STATIC 1] ------------------
    copyYesterdayAll() {
        // eslint-disable-next-line quotes
        const confirmMessage = "paste ALL yesterday's data?";
        if (!confirm(confirmMessage)) {
            return;
        }
        
        const yesterday = HelpDateTime.addDays(this.currentDate, -1);
        const dateKey = HelpDateTime.dateToDateStrKey(yesterday);
        const dataYesterday = this.loadNewOrExistingData(dateKey);
        const todayKey = this.currentDate;

        //have to change dates and IDs
        for(let i = 0 ; i < dataYesterday.length ; ++i) {
            const obj = dataYesterday[i];
            
            obj.date = todayKey;
            obj.id = `${todayKey}_${obj.logTime}`;
        }

        //finally save to key-data in storage
        StorageService.saveRowData(dataYesterday, this.currentDate);
        this.renderTable();
    },

    //---------------- [FUNCTION STATIC 2] ------------------
    copyYesterdayCol(col) {
        console.log(col);
        const yesterday = HelpDateTime.addDays(this.currentDate, -1);
        const dateKey = HelpDateTime.dateToDateStrKey(yesterday);
        const dataYesterday = this.loadNewOrExistingData(dateKey);
        const todayKey = this.currentDate;
        const dataToday = this.dayLogsArray;

        //check if any column exists in same log - highly likely though so maybe just skip
        let counter = 0;

        //eg bgl from yesterday - want to get log time and bgl
        for(let i = 0 ; i  < dataYesterday.length ; ++i) {
            const obj = dataYesterday[i];
            console.log(obj);
            const log = obj.logTime;
            const yesterdayValue = obj[col];

            console.log(obj, log, yesterdayValue);

            //check if this log exists in today's and overwrite if so
            const todayObj = dataToday.find(obj => obj.logTime === log);
            
            //need to have both a value from yesterday and a matching log to put it
            if(!(todayObj && yesterdayValue)) continue;
            
            todayObj[col] = yesterdayValue;
            ++counter;
        }
        console.log(counter);

        if(counter === 0) {
            HelpHtml.showMessage('no values (or matching log times) to copy in');
            return;
        }

        console.log(dataToday);

        StorageService.saveRowData(dataToday, todayKey);
        this.renderTable();
    },

    //---------------- [FUNCTION STATIC 3] ------------------
    importButtonClick() {
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) {
            fileInput.click();
        }
    },

    //---------------- [FUNCTION STATIC 4] ------------------
    importCsvOLD(event) {
        CSVService.handleImportCsv(event);
        this.render();
    },

    //---------------- [FUNCTION STATIC 5] ------------------
    toggleBlanks(choice) {
        const prefUser = this.preferences.userSelections;

        prefUser.CSVincludeBlanks = choice === 'yes-blanks'? true : false;
        
        StorageService.savePreferences(this.preferences);
        this.renderCSVtoggle();
    },

    //---------------- [FUNCTION STATIC 6] ------------------
    changeDate(days) {
        this.currentDate = HelpDateTime.addDays(this.currentDate, days);
        // this.render();
        this.renderAllSections();
    },

    //---------------- [FUNCTION STATIC 7] ------------------
    changeDatePickerDate(date) {
        this.currentDate = date;
        // this.render();
        this.renderAllSections();
    },


    //==========================================================================
    //-----------   [        EVENT LISTENERS - DYNAMIC        ]  ---------------
    //==========================================================================

    attachDynamicEventListeners() {        
        const addRowButtons = document.querySelectorAll('button[data-action="add-row"]');
        for(const btn of addRowButtons) {
            btn.addEventListener('click', () => {
                const idx = Number.parseInt(btn.dataset.index);  //was using string and not working
                this.addRowAfter(idx); //this is the element's row index
            });
        }
        
        const deleteRowButtons = document.querySelectorAll('button[data-action="delete-row"]');
        for(const btn of deleteRowButtons) {
            btn.addEventListener('click', () => {
                const idx = Number.parseInt(btn.dataset.index);//eg 0 NB! gives string which doesn't work for calculations
                this.deleteRow(idx); //this is the element's row index
            });
        }
        
        const logTimeButtons = document.querySelectorAll('.tz-default-input[data-index]');
        for(const inpt of logTimeButtons) {
            inpt.addEventListener('blur', (event) => {
                const val = event.target.value;  //gives the new user value eg 07:30
                const index = event.target.dataset.index; //check parentElement val comes through
                this.saveLogTime(val, index); 
            });
        }
        
        const logBglButtons = document.querySelectorAll('.bgl-col input');
        for(const btn of logBglButtons) {
            btn.addEventListener('change', (event) => {
                const idx = event.target.closest('td').dataset.index;//eg 0 NB! gives string which doesn't work for calculations
                const val = btn.value;  //important difference between .value and .dataset.value - better always to log here
                this.logBglData(idx, val);
                this.recordLogDataChanged();
            });
        }
        
        const logExerciseButtons = document.querySelectorAll('.exercise-col select');
        for(const btn of logExerciseButtons) {
            btn.addEventListener('change', () => {
                const idx = btn.dataset.index; //eg 0 NB! gives string which doesn't work for calculations
                const val = btn.value;  //eg selection of exercise=3
                this.logExerciseData(idx, val);
                this.recordLogDataChanged();
            });
        }

        const logInsulinButtons = document.querySelectorAll('.insulin-col input');
        for(const btn of logInsulinButtons) {
            btn.addEventListener('change', () => {
                const naming = btn.parentElement.getAttribute('name');  //eg 'bolusRapid' EVENTUALLY WANT insulin1 - keep it generic as possible
                const idx = btn.parentElement.dataset.index;//eg 0 NB! gives string which doesn't work for calculations
                const val = btn.value;  //eg selection of exercise=3
                this.logInsulinData(idx, naming, val);
                this.recordLogDataChanged();
            });
        }

        const addFoodButtons = document.querySelectorAll('td[data-value="food-cell"] button[data-action="add-food"]');
        for(const btn of addFoodButtons) {
            btn.addEventListener('click', () => {
                const idx = btn.parentElement.dataset.index;//eg 0 NB! gives string which doesn't work for calculations
                this.addFood(idx);
            });
        }
        
        const inputFoodText = document.querySelectorAll('td[data-value="food-cell"] input[list="all-foods-list"]');
        for(const btn of inputFoodText) {
            btn.addEventListener('change', (event) => {
                const parentTd = event.target.closest('td'); //gets a specific parent element's details
                const rowIdx = parentTd.dataset.index; //eg need 1
                const entryTest = btn.parentElement;
                const entryIdx = btn.parentElement.dataset.index; //need the div's food entry particular index
                const val = btn.value;    //eg cookie
                this.updateFoodText(rowIdx, entryIdx, val, entryTest);
                this.recordLogDataChanged();
            });
        }

        const inputFoodMultiplier = document.querySelectorAll('td[data-value="food-cell"] input[type="number"]');
        for(const btn of inputFoodMultiplier) {
            btn.addEventListener('change', (event) => {
                const parentTd = event.target.closest('td'); //gets a specific parent element's details
                const rowIdx = parentTd.dataset.index; //eg need 1
                const entryIdx = btn.parentElement.dataset.index; //need the div's food entry particular index
                // const entryTest = btn.parentElement;
                const val = btn.value;    //eg 5.0
                this.updateFoodMultiplier(rowIdx, entryIdx, val);                
                this.recordLogDataChanged();
            });
        }
        
        const deleteFoodEntries = document.querySelectorAll('td[data-value="food-cell"] button[data-action="delete-food"]');
        for(const btn of deleteFoodEntries) {
            btn.addEventListener('click', (event) =>{
                const parentTd = event.target.closest('td'); //gets a specific parent element's details
                const rowIdx = parentTd.dataset.index; //eg need 1
                const entryIdx = btn.parentElement.dataset.index; //need the div's food entry particular index
                this.deleteFood(rowIdx, entryIdx);
                this.recordLogDataChanged();
            });
        }

        //copy over yesterday's stuff
        const RowCopiers = document.querySelectorAll('[data-action="copy-yesterday-row"]');
        for(const heading of RowCopiers) {
            heading.addEventListener('click', (element) => {
                const rowLog = element.target.dataset.value;
                this.copyYesterdayRow(rowLog);
            });
        }
    },

    //==========================================================================
    //-----------      [        FUNCTIONS - DYNAMIC        ]     ---------------
    //==========================================================================

    //---------------- [1: ADD/DELETE ROWS] -------------------
    //---------------- [FUNCTION DYNAMIC 1A] ------------------
    addRowAfter(rowIdx) {
        const dayLogsArr = this.dayLogsArray;
        // const logTime = prompt(`Enter time for new row (format is 24-hour, eg 07:00 or 15:00):`);    
    
        //reject if same date_log id
        // if(dayLogsArr.find(item => item.logTime === logTime)){
        //     HelpHtml.showMessage('time must be unique', 'warning');
        //     return;
        // }

        // //logic check on HH:MM format
        // if (!logTime || !/^\d{1,2}:\d{2}$/.test(logTime)) {            
        //     if (logTime !== null) HelpHtml.showMessage('Invalid time format. Use HH:MM', 'warning');
        //     // this.addColumnAfter(rowIdx); would be nice to call again, but couldn't cancel
        //     return;
        // }

        //correction if time is in eg 7:30 format without 0 on front
        // const adjLogTime = logTime.length === 4? '0' + logTime : logTime;

        const object = dayLogsArr[rowIdx];
        const thisLogTime = object.logTime;
        const nextObject = dayLogsArr[rowIdx + 1];
        const nextLogTime = nextObject? nextObject.logTime : '24:00';

        const minsDiff = HelpDateTime.calculateMinutesDifference(nextLogTime, thisLogTime);

        const adjLogTime =  HelpDateTime.addMinsToStringTime(thisLogTime, minsDiff / 2);

        // create time object to add
        const newDayLog = {
            date: this.currentDate,
            logTime: adjLogTime,
            id: `${this.currentDate}_${adjLogTime}`, //need to reject any rows which would have same date_log key
        };

        // splice into the array
        dayLogsArr.splice(rowIdx + 1, 0, newDayLog); //was using string which doesn't work for calcs

        //sort array if not already done (will put code to save area later
        // this.sortTimes(dayLogsArr, 'log');
        HelpDateTime.sortTimes(dayLogsArr, 'logTime');

        //save set-up
        StorageService.saveRowData(dayLogsArr, this.currentDate);
        this.renderTable();
    },

    //---------------- [FUNCTION DYNAMIC 1B] ------------------
    deleteRow(rowIdx) {
        //don't delete if last column left
        const dayLogsArr = this.dayLogsArray;

        if(dayLogsArr.length < 2){
            HelpHtml.showMessage('at least 1 row must remain per day', 'warning');
            return;
        };

        const data = StorageService.getRowData(this.currentDate);
        delete data[rowIdx];
        
        dayLogsArr.splice(rowIdx, 1);

        //save data
        StorageService.saveRowData(dayLogsArr, this.currentDate);
        this.renderTable();
    },

    //---------------- [2: SAVING LOG ENTRIES] ----------------
    //---------------- [FUNCTION DYNAMIC 2A] ------------------
    saveLogTime(val, index) {//'03:01', index 0
        const dayLogsArr = this.dayLogsArray;
        const indexInt = Number.parseInt(index);

        //if it fails any tests, it won't save
        for(let i = 0; i<dayLogsArr.length; ++i ){
            //dont check against own column
            if(i===indexInt) continue;

            const logi = dayLogsArr[i].logTime;

            console.log(i, index, logi);

            if(val === logi) {
                HelpHtml.showMessage('time should be unique', 'warning');
                return;
            }
        }

        dayLogsArr[indexInt].logTime = val;
        dayLogsArr[indexInt].id = `${dayLogsArr[indexInt].date}_${val}`;        

        //SORT LOGTIMES - only want to sort and re-render if order changed
        //only need to re-sort if out of order
        let inOrder = true;
        for(let i=0 ; i<dayLogsArr.length - 1; ++i) {
            const thisTime = dayLogsArr[i].logTime;
            const nextTime = dayLogsArr[i+1].logTime;
            if(thisTime > nextTime) inOrder = false;
        }

        if(!inOrder) HelpDateTime.sortTimes(dayLogsArr, 'logTime');
        
        StorageService.saveRowData(dayLogsArr, this.currentDate);
        
        if(!inOrder) this.renderTable();
    },

    //---------------- [FUNCTION DYNAMIC 2B] ------------------
    logBglData(rowIdx, value) {
        console.log(rowIdx, value);
        const dayLogsArr = this.dayLogsArray;

        //ensure bgl > 0 if it has been entered, otherwise 'delete' it?
        if (Number.parseFloat(value) > 0) {
            dayLogsArr[rowIdx].bgl = HelpConvert.storeAsCorrectGlucoseUnit(value);
            dayLogsArr[rowIdx].glucoseUnit = 'mmol/L';

        } else {
            delete dayLogsArr[rowIdx].bgl;
            delete dayLogsArr[rowIdx].glucoseUnit;
        }
        StorageService.saveRowData(dayLogsArr, this.currentDate);
    },

    //---------------- [FUNCTION DYNAMIC 2C] ------------------
    logExerciseData(rowIdx, value) {
        const dayLogsArr = this.dayLogsArray;

        //ensure bgl > 0 if it has been entered, otherwise 'delete' it?
        dayLogsArr[rowIdx].exercise =
            (Number.parseInt(value) >= 0 && Number.parseInt(value) <= 5)?
            Number.parseInt(value) : 0;

        StorageService.saveRowData(dayLogsArr, this.currentDate);
    },

    //---------------- [FUNCTION DYNAMIC 2D] ------------------
    logInsulinData(rowIdx, name, val) {
        const dayLogsArr = this.dayLogsArray;

        //ensure units > 0 if it has been entered
        if (Number.parseFloat(val) > 0 && name === 'bolusRapid') {
            dayLogsArr[rowIdx].rapidU = Number.parseFloat(val);

        } else if (Number.parseFloat(val) > 0 && name === 'bolusMedium') {
            dayLogsArr[rowIdx].mediumU = Number.parseFloat(val);

        } else if (Number.parseFloat(val) > 0 && name === 'basalSlow') {
            dayLogsArr[rowIdx].slowU = Number.parseFloat(val);

        } else {
            delete dayLogsArr[rowIdx].rapidU;
            delete dayLogsArr[rowIdx].mediumU;
            delete dayLogsArr[rowIdx].slowU;
        }
        StorageService.saveRowData(dayLogsArr, this.currentDate);
    },


    //---------------- [3: FOOD ENTRIES] ----------------------
    //---------------- [FUNCTION DYNAMIC 3A] ------------------
    addFood(rowIdx) {
        const dayLogsArr = this.dayLogsArray;

        //define empty array
        if(!dayLogsArr[rowIdx].food) dayLogsArr[rowIdx].food = [];

        //now fill the empty array
        dayLogsArr[rowIdx].food.push({ name: '', multiplier: 1 });

        console.log(dayLogsArr[rowIdx]);

        //save and re-render
        StorageService.saveRowData(dayLogsArr, this.currentDate);
        this.renderTable();
    },
    
    //---------------- [FUNCTION DYNAMIC 3B] ------------------
    updateFoodText(rowIdx, foodIdx, value) {
        console.log(value);
        const dayLogsArr = this.dayLogsArray;

        if(dayLogsArr[rowIdx].food[foodIdx]) {
            dayLogsArr[rowIdx].food[foodIdx].name = value;
        }

        // this.saveFoodToDictionary(value);
        this.saveFoodToDictionary(value);
        
        
        StorageService.saveRowData(dayLogsArr, this.currentDate);
        this.updateTooltip(rowIdx, foodIdx);

        this.loadFoodDictionary();
    },

    //---------------- [FUNCTION DYNAMIC 3C] ------------------
    saveFoodToDictionary(food) {
        if(this.preferences.foodDictionary.includes(food)) return;

        this.preferences = StorageService.getPreferences();
        const foodDictionary = this.preferences.foodDictionary;
        
        foodDictionary.push(food);
        HelpNum.sortNumbers(foodDictionary);

        StorageService.savePreferences(this.preferences);
    },

    //---------------- [FUNCTION DYNAMIC 3D -> 3B/3C HELPER] ------
    updateTooltip(rowIdx, foodIdx) {
        // HTML
        const foodText = document.querySelector(`[data-value="food-cell"][data-index="${rowIdx}"] [data-index="${foodIdx}"] input[list="all-foods-list"]`).value;
        const foodMultiplier = document.querySelector(`[data-value="food-cell"][data-index="${rowIdx}"] [data-index="${foodIdx}"] input[type="number"]`).value;
        const tooltip = document.querySelector(`[data-value="food-cell"][data-index="${rowIdx}"] [data-index="${foodIdx}"] span.tooltip`);
        console.log(foodText, foodMultiplier, tooltip, foodIdx, rowIdx);

        //get multiplier + glucose grams
        const prefs = this.preferences;
        const foodArray = prefs.foodArray;
        const foodObj = foodArray.find(obj => obj.name === foodText);
        const glucoseGrams = foodObj? foodObj.glucoseGPerServing : null;

        const totalGlucose = foodObj? Math.round(glucoseGrams * foodMultiplier): null;

        //give message
        const tipMsg = glucoseGrams === null? `${foodMultiplier}x serving` : `${foodMultiplier}x serving= ${totalGlucose} grams`;
        console.log(tipMsg, foodObj);

        tooltip.innerHTML = tipMsg;
    },

    // //--------------------------
    // saveFoodToDictionary(food) {
    //     const foodDictionary = StorageService.getFoodDictionary();
        
    //     if(!foodDictionary.includes(food)) foodDictionary.push(food);

    //     StorageService.saveFoodDictionary(foodDictionary);
    // },

    //---------------- [FUNCTION DYNAMIC 3E] ------------------
    updateFoodMultiplier(rowIdx, foodIdx, value) {
        const dayLogsArr = this.dayLogsArray;

        //reject if value < 0
        if(Number.parseFloat(value) < 0){
            return;
        }

        if(dayLogsArr[rowIdx].food[foodIdx]) {
            dayLogsArr[rowIdx].food[foodIdx].multiplier =
                Number.parseFloat(value)?? 1;
        }

        StorageService.saveRowData(dayLogsArr, this.currentDate);

        this.updateTooltip(rowIdx, foodIdx);
    },


    //---------------- [FUNCTION DYNAMIC 3F] ------------------
    deleteFood(rowIdx, foodIdx) {
        const dayLogsArr = this.dayLogsArray;
        
        if (dayLogsArr[rowIdx].food) {
            dayLogsArr[rowIdx].food.splice(foodIdx, 1);
            if (dayLogsArr[rowIdx].food.length === 0) {
                delete dayLogsArr[rowIdx].food;
            }
            
            StorageService.saveRowData(dayLogsArr, this.currentDate);
            this.renderTable();
        }
    },

    //---------------- [FUNCTION DYNAMIC 4] ------------------
    copyYesterdayRow(row) {
        const yesterday = HelpDateTime.addDays(this.currentDate, -1);
        const dateKey = HelpDateTime.dateToDateStrKey(yesterday);
        const dataYesterday = this.loadNewOrExistingData(dateKey);        
        const todayKey = this.currentDate;
        const dataToday = this.dayLogsArray;

        //check if log exists yesterday - return if it doesn't
        const yesterdaySameLog = dataYesterday.find(obj => obj.logTime === row);
        if (!yesterdaySameLog) {
            // eslint-disable-next-line quotes
            HelpHtml.showMessage("this log time doesn't exist yesterday");
            return;
        }

        // update yesterday's date/id to today
        yesterdaySameLog.date = todayKey;
        yesterdaySameLog.id = `${todayKey}_${row}`;

        //save over today's existing using index
        const todayIndex = dataToday.findIndex(obj => obj.logTime === row);
        dataToday[todayIndex] = yesterdaySameLog;

        StorageService.saveRowData(dataToday, todayKey);
        this.renderTable();
    },    
    
    //---------------- [FUNCTION DYNAMIC 5] ------------------
    recordLogDataChanged(){ //EXPERIMENTAL
        this.preferences.userSelections.haslogDataChanged = true;
        StorageService.savePreferences(this.preferences);
    },    
};

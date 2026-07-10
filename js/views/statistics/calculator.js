/*  CALCULATOR STRUCTURE  
**  ============================================================================
**  DECLARE
**  
**  preferences  -> access Stored data and update as needed
**  currentDate
**  currentTime
**  preferenceS
**  bglStepMinFigurative
**  bglStepMinLiteral
**  bglNowIndexed -> bgl now
**  bglEndIndexed -> bgl at end
**  dashboardMessage -> goes on the home screen, based on bglNow, bglEnd
**  
**  chartData -> 
**  recentLoggedData -> 
**  calculatedBglData-> 
**  indExerciseArray -> 
**  insulinUarray    -> 
**  foodGlucoseArray -> 
**  previewObjects   -> 
**  
**  ============================================================================
**  RENDERING
**  
**  TodaysDateTime
**  HalfHourDataButtons -> which data to show
**  HeadingsAndUnits    -> simple names of things
**  calculateCalculatorData -> not rendering per se, but stuff will be rendered
**  after calculations done
**  
**  ============================================================================
**  RENDERING CALCS
**  
**  RecentLoggedData
**  EstimateActions
**  CalculatedBglData
**  ChartPastFutureBgl
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC: CALC INDEPENDENT
**  
**  ============================================================================
**  FUNCTIONS - STATIC: CALC INDEPENDENT
**  
**  resetFood -> very simply to reset estimate area to blank
**  renderFoodDropDown(index) -> options for each food drop down
**  changeShowPreference(action) -> showing data table
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC: CALCULATIONS
**  
**  ============================================================================
**  FUNCTIONS - STATIC: CALCULATIONS
**  
**  createEstimatedObject() -> pseudo Log Entry for user to test FX
**  addToLogEntry(logObject) -> make the pseudo an actual Log Entry
**  matchCalcBglToSelectedTime -> indexes to 1/2 hr whatever time user has entered
**  estimateInsulinRequirement -> estimate insulin/food requirements for user FYI
**  
**  ============================================================================
**    ->  SUB(!) HELPERS FOR ESTIMATE INSULIN REQUIREMENTS
**  
**  foodsAndMultipliersInto1Object
**  combineFoodIntoSalad(salad)
**  sumBglsOnBoard(now)
**  
**  ============================================================================
**  MAIN CALC FUNCTION
**  
**  ============================================================================
**  MAIN CALCULATION HELPERS
**  
**  getSomeHoursAgoData(todayDate, todayTime, hoursGoBack) -> eg go back 12 hrs
**  
**  getExFactorArray(data, endDate) -> use a few points of exercise to fill in
**  each 1/2 hr slot. There's a further helper which calculates the range of a
**  timezone to apply a good range forward (not just to end of the timezone)
**  
**  fixTimesGetHalfHourActions(data) -> uses index feature from Helpers to turn
**  every time into exactly on the 30 mins apart
**  
**  combineInsFoodEx(data) -> the BIG KAHUNA function for creating good chart data
**  
**  createDashboardMessage -> e.g. 'holding steady' on dashboard
**  
**  ============================================================================
**    ->  SUB(!) HELPERS FOR EX FACTOR ARRAY
**  
**  logExFactor(item)
**  
**  addDummyExFactorToNextTimezone(array, startDate, endDate) - or else the last
**  used exFactor auto carries on to the end, this puts a '1' - assumed '0 none'
**  
**  ============================================================================
**    ->  SUB(!) HELPERS FOR BIG KAHUNA: COMBINE INSFOODEX
**  
**  fillRealOrDefaultDataToArray(data, newArray)
**  
**  fillCalcedBglsToArray(newArray, seasonFactor)
**  
**  ============================================================================
**    ->  SUB(!) HELPERS FOR DASHBOARD MESSAGE
**  checks what range a bgl falls inside
*/

/* eslint-disable indent */

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpConvert,
    HelpDateTime,
    HelpLog,
    HelpTz,
    HelpSeason,
    HelpComplex,

} from '../../utils/helpers.js';

import { StorageService } from '../../utils/storage.js';
import { ChartComponent } from '../../utils/chart.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================
export const CalculatorView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    currentDate: null,
    currentTime: null,
    preferences: null,
    bglStepMinFigurative: [],
    bglStepMinLiteral: [],
    bglNowIndexed: null,
    bglEndIndexed: null,
    dashboardMessage: null,

    chartData: [],
    recentLoggedData: [],
    calculatedBglData: [],
    indExerciseArray: [],    
    insulinUarray: [],
    foodGlucoseArray: [],
    previewObjects: [],
    

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('../../../html/b3Calculator.html')
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
        this.currentDate = HelpDateTime.getTodayKey(),
        this.currentTime = HelpDateTime.getNowTime(),
        this.preferences = StorageService.getPreferences();
        this.previewObjects = [];   //for adding multiple preview items
        this.bglStepMinFigurative = HelpConvert.getBglStepMinFigurative();
        this.bglStepMinLiteral = HelpConvert.getBglStepMinLiteral();
        this.renderAllSections();
        this.attachCalcIndependentStaticEventListeners();
        this.attachCalcActionStaticEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {  
        this.renderTodaysDateTime();
        this.renderHalfHourDataButtons();
        this.renderHeadingsAndUnits();
        this.calculateCalculatorData();
    },

    //---------------- [RENDER 1] ------------------
    renderTodaysDateTime() {
        const dateHeaders = document.querySelector('#today-heading span');

        dateHeaders.innerHTML = HelpDateTime.formatDayDateMonth(this.currentDate);
        
        // for(const head of dateHeaders) {
        //     head.innerHTML = HelpDateTime.formatDayDateMonth(this.currentDate);
        // }
        
        // dateHeaders.forEach(head => {
        //     head.innerHTML = HelpDateTime.formatDayDateMonth(this.currentDate);
        // });

        const now = this.currentTime;   //eg 10:03
        console.log(now);
    },

    //---------------- [RENDER 2] ------------------
    renderHalfHourDataButtons() {
        const prefs = this.preferences;
        const isShowData = prefs.userSelections.showHalfHourData;

        const showButton = document.querySelector('[data-action="show-data"]');
        const hideButton = document.querySelector('[data-action="hide-data"]');
        const showTable = document.getElementById('calculated-log-table');
        const showInfo = document.getElementById('calc-info-show');

        if(isShowData) {
            showButton.classList.add('active');
            hideButton.classList.remove('active');
            showTable.classList.remove('hidden');
            showInfo.classList.remove('hidden');
        } else {
            showButton.classList.remove('active');
            hideButton.classList.add('active');
            showTable.classList.add('hidden');
            showInfo.classList.add('hidden');
        }
    },

    //---------------- [RENDER 3] ------------------
    renderHeadingsAndUnits() {
        const prefs = this.preferences;

        //glucose unit from Settings for headings
        const bglUnitSettings = prefs.userSelections.glucoseUnit;
        const bglUnitHeadings = document.querySelectorAll('.bgl-heading');
        
        for(const heading of bglUnitHeadings) {
            heading.innerHTML = `bgl`;
        }
        
        // bglUnitHeadings.forEach(heading => {
        //     heading.innerHTML = `bgl (${bglUnitSettings})`;
        // });

        //insulin names for headings
        const insulinArray = prefs.insulinArray;
        const rapidName = insulinArray.find(obj => obj.speed === 'rapid').name;
        const mediumName = insulinArray.find(obj => obj.speed === 'medium').name;
        const rapidNameHeadings = document.querySelectorAll('.rapid-text');
        const mediumNameHeadings = document.querySelectorAll('.medium-text');
        
        for(const heading of rapidNameHeadings) {
            heading.innerHTML = rapidName;
        }
        for(const heading of mediumNameHeadings) {
            heading.innerHTML = mediumName;
        }
        
        // rapidNameHeadings.forEach(heading => {
        //     heading.innerHTML = rapidName;
        // });
        // mediumNameHeadings.forEach(heading => {
        //     heading.innerHTML = mediumName;
        // });
    },

    //==========================================================================
    //-----------------   [       RENDERING CALCS       ]  ---------------------
    //==========================================================================
    renderAllCalcSections() {
        this.renderRecentLoggedData();
        this.renderEstimateActions();
        this.renderCalculatedBglData();
        this.renderChartPastFutureBgl();
    },
    
    //----- [CALC RENDER 1] -----
    renderRecentLoggedData() {
        console.log('recent logged data rerendered');
        const tbodyLog = document.getElementById('daily-log-tbody');

        //get the array - either composed of empty data rows or fully set-up filled in rows
        const data = this.recentLoggedData;
        console.log(data);

        //logged data section
        tbodyLog.innerHTML = data.map((row, idx) => {
            let foodStr = '';
            if(row.food) for(const myFood of row.food) {
                foodStr += `${myFood.name}_`;
            }
                // row.food.forEach(myFood => foodStr += `${myFood.name}_`);            
            
            let foodMultiples = '';
            if(row.food) for(const myFood of row.food) {
                foodMultiples += `${myFood.multiplier}_`;
            }
                
                // row.food.forEach(myFood => foodMultiples += `${myFood.multiplier}_`);

            const colorClass = HelpLog.getLogsTimeofDayColorClass(row.logTime);
            console.log(colorClass);
            
            return `
            <tr data-index="${idx}">
                <td>
                    <input readonly type="text" class="${colorClass}" data-value="log-time" value="${row.logTime}">
                </td>
                <td>
                    <input readonly type="number" data-value="bgl-logged" value="${row.bgl? HelpConvert.displayAsCorrectGlucoseUnit(row.bgl) : ''}" placeholder="-">
                </td>
                <td>
                    <input readonly type="text" class="width-lg" data-value="food-name-logged" value="${row.food? foodStr : ''}" placeholder="-">
                </td>
                <td>
                    <input readonly type="text" data-value="food-multiplier-logged" value="${row.food? foodMultiples : ''}" placeholder="-">
                </td>
                <td>
                    <input readonly type="number" data-value="bolus-rapid-logged" value="${row.rapidU?? ''}" placeholder="-">
                </td>
                <td>
                    <input readonly type="number" data-value="bolus-medium-logged" value="${row.mediumU?? ''}" placeholder="-">
                </td>
                <td>
                    <input readonly type="text" data-value="exercise-intensity-logged" value="${row.exercise?? ''}" placeholder="-">
                </td>
            </tr>        
            `;
        }).join('');

        // this.attachDynamicEventListeners();
    },

    //----- [CALC RENDER 2] -----
    renderEstimateActions() {
        // DATA
        const bglStepMinFig = this.bglStepMinFigurative;
        const timeNow = this.currentTime;
        
        // get timeNow but in good format for nearest half-hour
        const objNow = this.calculatedBglData.find(obj => obj.time === timeNow);
        console.log(this.calculatedBglData);
        const myValue = objNow.bgl === null? objNow.bglCalced: objNow.bgl;
        this.bglNowIndexed = myValue;

        // HTML
        const bglNow = document.getElementById('bgl-now');
        const bglEstimate = document.getElementById('bgl-interpolated-estimate');
        const timeHtml = document.getElementById('time-estimate');

        // UPDATE HTML
        bglEstimate.textContent = `estimated bgl = ${HelpConvert.displayAsCorrectGlucoseUnit(myValue)}`;
        bglNow.value = HelpConvert.displayAsCorrectGlucoseUnit(myValue);    //get the interpolated value
        bglNow.min = bglStepMinFig.min;
        bglNow.max = bglStepMinFig.max;
        bglNow.step = bglStepMinFig.step;
        timeHtml.value = timeNow;

        console.log(this.currentTime, timeHtml);

        this.renderFoodDropDown(0);

        // PUT IN ESTIMATES
        this.estimateInsulinRequirement();
    },

    //----- [CALC RENDER 3] -----
    renderCalculatedBglData() {
        const tbodyCalculated = document.getElementById('calculated-log-tbody');

        //get the array - either composed of empty data rows or fully set-up filled in rows
        const data = this.calculatedBglData;

        //clear any previous chart data before filling
        this.chartData = [];

        //find index at which last real bgl available
        let indexNow;
        for(let i = 0 ; i < data.length ; ++i) {
            if(data[i].bgl !== null) indexNow = i;
        }

        //calculated data section
        tbodyCalculated.innerHTML = data.map((row, idx) => {
            let bglToDisplay;
            let classOfBgl = 'real-figure';
            let circleClass = 'radius-lg chart-color-3';
            let pathClass = 'chart-color-2';

            if(idx < indexNow && row.bgl === null) {
                classOfBgl = 'interpolated-figure';
                bglToDisplay = row.bglInterpolated;
                circleClass = 'radius-xs chart-color-2';
                pathClass = 'chart-color-2';

            } else if(idx > indexNow && row.bgl === null) {
                classOfBgl = 'calculated-figure';
                bglToDisplay = row.bglCalced;
                circleClass = 'radius-xs chart-color-1';
                pathClass = 'chart-color-1';

            } else bglToDisplay = row.bgl;

            //push in a starting path bit for the circleClass1
            if(idx === indexNow) this.chartData.push({
                x: row.x,
                y: bglToDisplay > 0? HelpConvert.displayAsCorrectGlucoseUnit(bglToDisplay) : 0,
                time: row.time,
                circleClass: circleClass,
                pathClass: 'chart-color-1',
            });            

            this.chartData.push({
                x: row.x,
                y: bglToDisplay > 0? HelpConvert.displayAsCorrectGlucoseUnit(bglToDisplay) : 0,
                time: row.time,
                circleClass: circleClass,
                pathClass: pathClass,
            });

            if(idx === data.length -1) this.bglEndIndexed = HelpConvert.storeAsCorrectGlucoseUnit(bglToDisplay);

            return `
                <tr data-index="${idx}" class="${row.time === this.currentTime? 'active' : ''}">
                    <td data-value="log-time" >${row.time}</td>
                    <td data-value="bgl-actual" class="${classOfBgl}"><span class="badge icon-style">${HelpConvert.displayAsCorrectGlucoseUnit(bglToDisplay)}</span></td>
                    <td data-value="glucose-calc-grams">${row.glucoseGrams?? ''}</td>
                    <td data-value="bgl-calc-up">
                        ${row.bglCalcUp === 0?
                            '' :
                            `<span class="badge icon-style">+${HelpConvert.displayAsCorrectGlucoseUnit(row.bglCalcUp)}</span>`
                        }
                    </td>
                    <td data-value="insulin-calc-units">${row.insulinU?? ''}</td>
                    <td data-value="bgl-calc-down">
                        ${row.bglCalcDown === 0?
                            '' :
                            `<span class="badge icon-style">-${HelpConvert.displayAsCorrectGlucoseUnit(row.bglCalcDown)}</span>`
                        }
                    </td>
                    <td data-value="exercise-factor">${row.exFactor}</td>
                </tr>        
            `;
        }).join('');

        console.log(this.chartData);
        
        console.log(tbodyCalculated);
    },
    
    //----- [CALC RENDER 4] -----
    renderChartPastFutureBgl(){
        // set up for charting - don't do that in the chart
        const data = this.chartData;
        const calcData = this.calculatedBglData;

        console.log(calcData);

        // find x for timeNOW
        const timeNow = this.currentTime;
        const timeNowX = calcData.find(obj => obj.time === timeNow).x;

        // VERTICAL LINE AT 'TIME NOW'
        const hoursY = data.map(d => d.y);
        const yMax = Math.ceil(Math.max(...hoursY));
        const lineVertical = {
            x1: timeNowX,
            x2: timeNowX,
            y1: 0,
            y2: yMax,
            lineClass: 'dashed color-plain',
        };

        // HORIZONTAL LINE AT HYPER & HYPO BGL
        const bglsX = data.map(d => d.x);
        const xMax = Math.ceil(Math.max(...bglsX));
        const hyperLineY = HelpConvert.displayAsCorrectGlucoseUnit(this.bglStepMinLiteral.hyper);
        const hypoLineY = HelpConvert.displayAsCorrectGlucoseUnit(this.bglStepMinLiteral.hypo);
        const linesHorizontal = [
            {x1: 0, x2: xMax, y1: hyperLineY, y2: hyperLineY, lineClass: 'dashed color-plain'},
            {x1: 0, x2: xMax, y1: hypoLineY, y2: hypoLineY, lineClass: 'dashed color-plain'}
        ];

        try{
            console.log(data);
            ChartComponent.lineChartPastFutureBgl('#bgl-predict-chart .full-state', data, linesHorizontal, lineVertical);
            
            document.querySelector('#bgl-predict-chart .empty-state').classList.add('hidden');

        } catch(error) {
            //REMOVE HALF-FORMED
            console.error('error:', error);
            HelpHtml.clearHtmlCode('#bgl-predict-chart .full-state');
        }        
    },

    //==========================================================================
    //----   [        EVENT LISTENERS - STATIC: CALC INDEPENDENT        ]  -----
    //==========================================================================
    attachCalcIndependentStaticEventListeners() {
        const resetFoodButton = document.getElementById('reset-future');
        resetFoodButton.addEventListener('click', () => {
            this.resetFood();
            this.previewObjects = [];
            // this.resetEstimateActions();
            this.renderEstimateActions();
            // this.renderFutureRow();
        });

        const addFoodButton = document.getElementById('add-foods');
        addFoodButton.addEventListener('click', () => {
            //get count of existing number of selects
            const selectCount = document.querySelectorAll('#food-selector-column select').length;
            this.renderFoodDropDown(selectCount);
        });

        const showOrNo = document.querySelectorAll('.toggle-option[data-action]');
        for(const button of showOrNo) {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.changeShowPreference(action);
            });
        }
    },

    //==========================================================================
    //--------   [        FUNCTIONS - STATIC: CALC INDEPENDENT        ]  -------
    //==========================================================================

    //---------------- [FUNCTION STATIC INDEPENDENT 1] ------------------
    resetFood() {
        HelpHtml.clearHtmlCode('#food-selector-column');
        HelpHtml.clearHtmlCode('#food-multiplier-column');
    },

    //---------------- [FUNCTION STATIC INDEPENDENT 2] ------------------
    renderFoodDropDown(index) {
        const prefs = this.preferences;
        const selectCount = document.querySelectorAll('#food-selector-column select').length;
        if(index === 0 && selectCount === 1) return;

        // ADD FOOD DROPDOWN
        const foodsArray = prefs.foodArray;
        const foodDropDown = document.getElementById('food-selector-column');
        const foodMultiplier = document.getElementById('food-multiplier-column');
        const dropDownOptions = [];

        for(const item of foodsArray) {
            dropDownOptions.push(item.name);
        }

        // foodsArray.forEach((item) => {});

        //add food dropDown
        const select = document.createElement('select');
        select.name = `row-${index}}`;
        select.dataset.action= 'dynamic-recalculate-bolus-on-change';
        select.innerHTML = `
            <option>...</option>
            ${
                dropDownOptions.map(food => {
                    return `<option>${food}</option>`;
                }).join('')
            }
        `;

        foodDropDown.append(select);

        //add multiplier box
        const multiplier = document.createElement('input');
        multiplier.name = `row-${index}`;
        multiplier.dataset.action= 'dynamic-recalculate-bolus-on-change';
        multiplier.type = 'number';
        multiplier.dataset.value = 'food-multiplier-estimate';
        multiplier.min = '0.0';
        multiplier.value = '1.0';        
        multiplier.step = '1.0';

        foodMultiplier.append(multiplier);
    },

    //---------------- [FUNCTION STATIC INDEPENDENT 3] ------------------
    changeShowPreference(action) {
        const prefs = this.preferences;
        const isShowData = (action === 'show-data');
        
        prefs.userSelections.showHalfHourData = isShowData;

        StorageService.savePreferences(prefs);
        this.renderHalfHourDataButtons();
    },

    //==========================================================================
    //----   [        EVENT LISTENERS - STATIC: CALCULATIONS        ]  ---------
    //==========================================================================
    attachCalcActionStaticEventListeners() {
        const addToChartButton = document.getElementById('add-to-chart');
        addToChartButton.addEventListener('click', () => {
            const estObject = this.createEstimatedObject();
            this.previewObjects.push(estObject);
            console.log(this.previewObjects);
            this.calculateCalculatorData(this.previewObjects);
        });

        const addToLogButton = document.getElementById('add-to-log');
        addToLogButton.addEventListener('click', () => {
            const estObject = this.createEstimatedObject();
            this.addToLogEntry(estObject);
            this.calculateCalculatorData();
        });

        const staticRecalculateOnChange = document.querySelectorAll('[data-action="static-recalculate-bolus-on-change"]');
        for(const item of staticRecalculateOnChange) {
            item.addEventListener('change', () => {
                this.matchCalcBglToSelectedTime();
                this.estimateInsulinRequirement();
            });
        }
        
        // staticRecalculateOnChange.forEach(item => {});
    },

    //==========================================================================
    //--------   [        FUNCTIONS - STATIC: CALCULATIONS        ]  -----------
    //==========================================================================
    
    //---------------- [FUNCTION STATIC CALCULATIONS 1] ------------------
    //for creating a pseudo Log Entry object
    createEstimatedObject() {
        // HTML VALUES
        const time = document.getElementById('time-estimate').value;
        const bgl = document.getElementById('bgl-now').value;
        const exInt = document.querySelector('#future-calculation-tbody [data-value="exercise-intensity"]').value;
        const rapidU = document.querySelector('#future-calculation-tbody [data-value="bolus-rapid-estimate"]').value;
        const mediumU = document.querySelector('#future-calculation-tbody [data-value="bolus-medium-estimate"]').value;


        console.log(Number.parseFloat(rapidU), Number.parseFloat(mediumU));
        if(Number.parseFloat(rapidU) < 0 || Number.parseFloat(mediumU) < 0) {
            HelpHtml.showMessage('insulin units must be > 0');
            return;
        }

        //create food array for all foods
        const foodArray = this.foodsAndMultipliersInto1Object();

        //definites
        const estObject = {};
        estObject.bgl = HelpConvert.storeAsCorrectGlucoseUnit(bgl);
        estObject.date = this.currentDate;
        estObject.logTime = time;
        estObject.id = `${this.currentDate}_${time}`;
        estObject.glucoseUnit = 'mmol/L';

        //optionals
        if(exInt > 0) estObject.exercise = Number.parseInt(exInt);
        if(foodArray.food.length > 0) estObject.food = foodArray.food;
        if(rapidU > 0) estObject.rapidU = Number.parseFloat(rapidU);
        if(mediumU > 0) estObject.mediumU = Number.parseFloat(mediumU);

        return estObject;
    },

    //---------------- [FUNCTION STATIC CALCULATIONS 2] ------------------
    addToLogEntry(logObject) {
        const dateKey = `dailyLogData_${logObject.date}`;
        const data = StorageService.get(dateKey);

        //check no data has same logtime
        const sameLogCheck = data.find(obj => obj.logTime === logObject.logTime);
        if(sameLogCheck) {
            HelpHtml.showMessage('this log time already exists');
            return;
        }

        data.push(logObject);
        HelpDateTime.sortTimes(data, 'logTime');

        StorageService.set(dateKey, data);
    },

    //---------------- [FUNCTION STATIC CALCULATIONS 3] ------------------
    matchCalcBglToSelectedTime() {
        const time = document.getElementById('time-estimate').value;
        const indexedTime = HelpDateTime.getTimesNearestIndexTime(this.currentTime, time);
        console.log(time, indexedTime);
        const object = this.chartData.find(obj => obj.time === indexedTime);
        console.log(object);
        const bglToDisplay = object.y;

        console.log(bglToDisplay);

        const bglNowRaw = document.getElementById('bgl-now');
        bglNowRaw.value = bglToDisplay;
    },

    //---------------- [FUNCTION STATIC CALCULATIONS 4] ------------------
    estimateInsulinRequirement() { 
        console.log('ran estimated requirements')       ;
        const bglNowRawValue = document.getElementById('bgl-now').value;
        const bglIndexedCorrectTo = this.bglStepMinLiteral.target;
        // const bglCorrectToRawValue = document.getElementById('bgl-correct-to').value;
        console.log(bglNowRawValue);
        //don't calculate if no 'NOW' value
        if(!bglNowRawValue) return;

        //update bgl indexed to latest values
        this.bglNowIndexed = HelpConvert.storeAsCorrectGlucoseUnit(bglNowRawValue);
        // this.bglIndexed.bglCorrectTo = bglCorrectToIndexed;

        //get timezone from time now
        const timeHtmlRaw = document.getElementById('time-estimate').value;
        console.log(timeHtmlRaw);
        if(!timeHtmlRaw) return;   //make sure there's a time

        const timeHtml = HelpDateTime.getTimesNearestIndexTime(this.currentTime, timeHtmlRaw);
        
        console.log('up to here?');
        //get pref arrays
        const prefs = this.preferences;
        const exFactors = prefs.exFactorArray;

        //look up insulin to bgl ratio for timezone
        const glucosePer1U = HelpTz.getTimesTzUnit(timeHtml, 'glucosePer1U');
        const bglDropPer1U = HelpTz.getTimesTzUnit(timeHtml, 'bglDropPer1U');
        
        //calculate initial bgl change desired
        // const bglIndexedCorrectTo = this.bglIndexed.bglCorrectTo;
        const bglIndexedChange = this.bglNowIndexed - bglIndexedCorrectTo;
        console.log(bglIndexedChange);

        //get foods and multipliers into 1 object and get bglUP
        const myFoodObj = this.foodsAndMultipliersInto1Object();
        const saladMixer = this.combineFoodIntoSalad(myFoodObj.food);
        const bglUpFromSalad = saladMixer.glucoseGrams * bglDropPer1U / glucosePer1U;

        //sum bgls changes on board (up and down)
        const bglsUpDown = this.sumBglsOnBoard(timeHtml);
        const bglUp = bglsUpDown.bglUpOnBoard;
        const bglDown = bglsUpDown.bglDownOnBoard;

        //get the factors
        const exSelected = document.getElementById('exercise-selector').value;
        const exFactor = exFactors.find(obj => obj.name === exSelected).factor;

        //
        const prevLog = HelpLog.getPreviousLogInLogArray(timeHtml);
        const prevLogIndexed = HelpDateTime.getTimesNearestIndexTime(this.currentTime, prevLog);
        console.log(prevLog, prevLogIndexed, timeHtml);
        // const prevTz = HelpTz.getTzTimesPrevTzName(timeHtml);
        // const prevTzLog = tzArray.find(obj => obj.name === prevTz).log;
        
        const prevExFactor = this.calculatedBglData.find(obj => obj.time === prevLogIndexed).exFactor;
        const today = this.currentDate;
        const seasonFactor = HelpSeason.getDatesSeasonFactor(today);
        
        //might need to get previous exercise to de-factor IOB and then re-factor with current tz exercise
        const bglChangeRequired = bglIndexedChange + bglUpFromSalad + bglUp - (bglDown * prevExFactor / exFactor); //correction + food + on-board Up - on-board down de-factored        
        const insulinRequired = Math.round(10 * bglChangeRequired * seasonFactor * exFactor / bglDropPer1U) / 10;

        const glucoseRequired = -insulinRequired * glucosePer1U;

        console.log(glucoseRequired, insulinRequired, glucosePer1U);

        //get the html values
        const htmlBolus = document.getElementById('bolus-calc-estimate');
        htmlBolus.innerHTML = insulinRequired >= 0?
            `estimated insulin = ${insulinRequired} (maybe)` :
            `estimated glucose = ${glucoseRequired} grams (maybe)`;
        const htmlRapid = document.querySelector('[data-value="bolus-rapid-estimate"]');
        htmlRapid.value = insulinRequired >= 0? insulinRequired : '';

        console.log(insulinRequired);
    },

    //==========================================================================
    //----   [   SUB(!) HELPERS FOR ESTIMATE INSULIN REQUIREMENTS    ]  --------
    //==========================================================================

    //--------- [SUB HELPER 4.1] ---------
    foodsAndMultipliersInto1Object() {
        const foodNames = document.querySelectorAll('select[data-action="dynamic-recalculate-bolus-on-change"]');
        const foodMultipliers = document.querySelectorAll('input[data-action="dynamic-recalculate-bolus-on-change"]');

        const foodData = [];

        for(let i = 0; i < foodNames.length; ++i) {
            
            const food = foodNames[i].value;
            if(food === '...') continue;
            const multiplier = foodMultipliers[i].value;

            foodData.push({
                name: food,
                multiplier: multiplier
            });
        }

        return {food: foodData};
    },

    //--------- [SUB HELPER 4.2] ---------
    combineFoodIntoSalad(salad){
        //for calculating weighted GI, insulin etc
        const prefs = this.preferences;
        const foodArr = prefs.foodArray;
        const giArray = prefs.giArray;
        // let foodRecord = '';
        let GIsum = 0;
        // eslint-disable-next-line no-useless-assignment
        let GIavgHours = 0;
        let foodGlucoseSum = 0;
    
        // COMBINE MULTIPLE FOODS IN SAME LOG INTO A SALAD
        for(let i = 0 ; i < salad.length ; ++i) {
            const foodName = salad[i].name;
            const foodMultiplier = salad[i].multiplier;
            console.log(foodName, foodMultiplier);
            const foodGlucoseRuleOfThumb = foodArr.some(obj => obj.name === foodName)?
                foodArr.find(obj => obj.name === foodName).glucoseGPerServing : 0;
            
            //combine foods into 1 meal for the insulin as well
            const foodGlucose = foodMultiplier * foodGlucoseRuleOfThumb;   //don't really want to assume here... 0 OK
            foodGlucoseSum += foodGlucose;
            // foodRecord += foodName + ' ';
        }

        // CALCULATE WEIGHTED AVG GI OF SAID SALAD
        for(let j = 0 ; j < salad.length ; ++j ) {
            const foodName = salad[j].name;
            const foodMultiplier = salad[j].multiplier;
            const foodGlucoseRuleOfThumb = foodArr.some(obj => obj.name === foodName)?
                foodArr.find(obj => obj.name === foodName).glucoseGPerServing : 0;
            const foodGI = foodArr.some(obj => obj.name === foodName)?
                foodArr.find(obj => obj.name === foodName).foodGI : 'medium';

            //depends on above for loop being completed to get glucoseSum
            const foodGlucose = foodMultiplier * foodGlucoseRuleOfThumb;   //don't really want to assume here... 0 OK
            const foodWeight = Number.isNaN(foodGlucose/foodGlucoseSum)? 0: foodGlucose/foodGlucoseSum;            
            const foodGIHours = giArray.find(obj => obj.name === foodGI).hours;
            const weightedHours = foodWeight * foodGIHours;

            GIsum += weightedHours;
        }

        // foodRecord = foodRecord.trim();  //trim any whitespace on end - have to reassign with the .trim function
        
        GIavgHours = Math.round(10 * GIsum ) / 10;
        
        return {giHours: GIavgHours, glucoseGrams: foodGlucoseSum};
    },

    //--------- [SUB HELPER 4.3] ---------
    sumBglsOnBoard(now) {
        const data = this.calculatedBglData;
        console.log(now, data);

        const indexToStart = data.findIndex(obj => obj.time === now);
        console.log(indexToStart);

        let bglUp = 0;
        let bglDown = 0;

        for(let i = indexToStart ; i < data.length ; ++i) {
            bglUp += data[i].bglCalcUp;
            bglDown += data[i].bglCalcDown;
        }

        return {bglUpOnBoard: bglUp, bglDownOnBoard: bglDown};
    },

    //==========================================================================
    //---------------   [       MAIN CALC FUNCTION        ]  -------------------
    //==========================================================================
    async calculateCalculatorData(estimatedObject) {
        this.loading = true;
        document.getElementById('loading-indicator').classList.remove('hidden');
        document.querySelector('#bgl-predict-chart .empty-state').classList.remove('hidden');
        document.getElementById('no-data-msg').classList.add('hidden');
        document.getElementById('daily-log-table').classList.remove('hidden');

        const prefs = this.preferences;        
        if(!estimatedObject) prefs.userSelections.dashboardMessage = '...';

        const startTime = performance.now();

        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const hoursToGoBack = -16;
            this.recentLoggedData = this.getSomeHoursAgoData(this.currentDate, this.currentTime, hoursToGoBack);

            // show msg if this precalculateddata length is zero
            console.log(this.recentLoggedData);
            if(this.recentLoggedData.length === 0) {
                document.getElementById('no-data-msg').classList.remove('hidden');
                document.getElementById('daily-log-table').classList.add('hidden');
                
                return;
            }
            
            // const preCalculatedData = this.getSomeHoursAgoData(this.currentDate, this.currentTime, -12);
            // console.log(preCalculatedData);

            // if precalculateddata length is zero, then 12 hours ago data is empty
            // this.recentLoggedData = preCalculatedData;

            const addEstimatedObject = structuredClone(this.recentLoggedData);
            console.log(addEstimatedObject);

            console.log(estimatedObject?.length);
            for(let i = 0; i< estimatedObject?.length ; ++i) {
                const obj = estimatedObject[i];
                addEstimatedObject.push(obj);
            }

            // if(estimatedObject !== undefined) addEstimatedObject.push(estimatedObject[0]);
            console.log(estimatedObject);
            console.log(addEstimatedObject);

            const indExerciseArray = this.getExFactorArray(addEstimatedObject, this.currentDate);
            console.log(indExerciseArray);
            this.indExerciseArray = indExerciseArray;

            const calculatedStep1Data = this.fixTimesGetHalfHourActions(addEstimatedObject);           
            
            this.calculatedBglData = this.combineInsFoodEx(calculatedStep1Data);

            this.renderAllCalcSections();

            if(!estimatedObject) {
                prefs.userSelections.dashboardMessage = this.createDashboardMessage();
                StorageService.savePreferences(prefs);
            }
            

        } catch (error) {
            console.error('Error calculating meal data:', error);
            HelpHtml.showMessage('Error calculating meal statistics', 'error');

        } finally {
            this.loading = false;
            // document.getElementById('loading-indicator').classList.add('hidden');
        }
        const End4 = performance.now();
        console.log(`Duration 4: ${End4 - startTime} ms`);

    },

    //==========================================================================
    //--------------   [       MAIN CALCULATION HELPERS        ]  ------------
    //==========================================================================

    //----- [HELPER 1: GET SEVERAL HOURS AGO DATA] -----
    getSomeHoursAgoData(todayDate, todayTime, hoursGoBack) {
        console.log(todayDate, todayTime, hoursGoBack);
        // DATE & TIME TO GO BACK
        const backDateTime = HelpDateTime.addHoursToDateTime(todayDate, todayTime, hoursGoBack);
        const backDate = HelpDateTime.dateToDateStrKey(backDateTime);
        const backTime = HelpDateTime.dateToTimeStr(backDateTime);

        // DATA WITHIN WINDOW
        // const data = HelpLog.getLogDataNoBlanksDateTime(backDate, todayDate, backTime, todayTime);        
        const data = StorageService.getLogData('no blanks', backDate, todayDate, backTime, todayTime);

        return data;
    },

    // [HELPER 1A: CREATE EXERCISE ARRAY TO THE SIDE]
    getExFactorArray(data, endDate) {
        console.log(data);
        // EVERY LOG NEEDS EXFACTOR (DEFAULT IS 1)
        const exIndexArray = [];
        const startDate = data[0].date;
        
        for(let i = 0 ; i < data.length ; ++i) {
            const obj = data[i];
            console.log(obj);
            const exerciseObj = this.logExFactor(obj);
            console.log(exerciseObj);

            if(i>0) {
                // exerciseObj.time = HelpDateTime.getNearestHalfHourTime(startDate, data[0].logTime, obj.date, obj.logTime);
                exerciseObj.time = HelpDateTime.getTimesNearestIndexTime(this.currentTime, obj.logTime);
                console.log(obj.logTime);
                console.log(exerciseObj.time);
            }
            console.log(exerciseObj);
            exIndexArray.push(exerciseObj);
        }
        // dummy in next timezone (ensures not eg 5 all the way to end)
        // don't need to set to empty first as gets overwritten
        this.addDummyExFactorToNextTimezone(exIndexArray, startDate, endDate);
        console.log(exIndexArray);
        return exIndexArray;
    },

    //----- [HELPER 2: MUTATE DATA INTO HALF-HOUR BOXES] -----
    // COMBINES ANY CLOSE LOGS TOGETHER IN SAME BOX
    fixTimesGetHalfHourActions(data) {
        const logFirst = data[0]['logTime'];
        const startDate = data[0]['date'];
        
        const tempRapidUArray = [];
        const tempMediumUArray = [];
        const tempFoodGlucoseArray = [];

        //set these to empty each time for push
        this.insulinUarray = [];
        this.foodGlucoseArray = [];

        for(let i = 0; i < data.length ; ++i ) {
            const object = data[i];
            console.log(object.logTime);
            //fix the time to be exactly a number of half-hours after 1st log
            // if(i >= 0) object.logTime = HelpDateTime.getNearestHalfHourTime(startDate, logFirst, object.date, object.logTime);
            object.logTime = HelpDateTime.getTimesNearestIndexTime(this.currentTime, object.logTime);
            console.log(startDate, logFirst, object.date, object.logTime);
            console.log(object.logTime);

            //fill in rapid & medium insulin objects
            if(object.rapidU) {
                console.log(object.rapidU, object.logTime);
                const insAction = HelpComplex.insulinArrayByHalfHour(object.rapidU, 'rapid' , object.logTime);
                tempRapidUArray.push(insAction);
            }
            if(object.mediumU) {
                const insAction = HelpComplex.insulinArrayByHalfHour(object.mediumU, 'medium' , object.logTime);
                tempMediumUArray.push(insAction);
            }

            //get food glucoseGrams action
            if(object.food) {
                const fruitSalad = this.combineFoodIntoSalad(object.food);
                const saladAction = HelpComplex.combinedFoodArrayByHalfHour(fruitSalad.giHours, fruitSalad.glucoseGrams, object.logTime);
                tempFoodGlucoseArray.push(saladAction);
            }
        }

        // combine any same log times together to only get unique times in 1 object
        if(tempRapidUArray.length > 0 || tempMediumUArray.length > 0){
            const combinedArray = tempRapidUArray.concat(tempMediumUArray);
            const tempArray = HelpComplex.filterComplexTimeObjects(combinedArray);
            this.insulinUarray = HelpComplex.addXObjectsByTime(tempArray, 'time', 'units');
        }
        if(tempFoodGlucoseArray.length > 0){
            const tempArray = HelpComplex.filterComplexTimeObjects(tempFoodGlucoseArray);
            this.foodGlucoseArray = HelpComplex.addXObjectsByTime(tempArray, 'time', 'glucoseGrams');
        }
        console.log(data);
        return data;
    },

    //----- [HELPER 3: THE BIG KAHUNA] -----
    combineInsFoodEx(data) {
        // DATES + TIMES
        const startDate = data[0]['date'];
        const startTime = data[0]['logTime'];        
        console.log(startDate);
        const seasonFactor = HelpSeason.getDatesSeasonFactor(startDate);

        //add 24 hours to get 12 hours back, 12 hours ahead
        const endDateTime = HelpDateTime.addHoursToDateTime(startDate, startTime, 24);
        const endDate = HelpDateTime.dateToDateStrKey(endDateTime);
        const endTime = HelpDateTime.dateToTimeStr(endDateTime);
        console.log(endTime);

        //create array to have room for everything
        const newArray = HelpComplex.insulinFxArrayByHalfHour(startDate, endDate, startTime, endTime);

        //FILL ARRAY WITH VARIOUS REAL/DEFAULT DATA
        console.log(data, newArray);
        this.fillRealOrDefaultDataToArray(data, newArray);

        //FILL ARRAY WITH INTERPOLATED/CALCED BGL        
        this.fillCalcedBglsToArray(newArray, seasonFactor);
        const bglCalcedArray = newArray;

        return bglCalcedArray;
    },

    //----- [HELPER 4: DASHBOARD MESSAGE] -----
    createDashboardMessage() {  //  LINK TO DASHBOARD
        // 9 different messages
        const bglNow = this.bglNowIndexed;
        const bglEnd = this.bglEndIndexed;

        if(this.inBglRange(bglNow) === 'target') {
            if(this.inBglRange(bglEnd) === 'target') return {msg: 'holding steady', color: '#00b400'};
            if(this.inBglRange(bglEnd) === 'hyper') return {msg: 'rising', color: '#c900c9'};
            if(this.inBglRange(bglEnd) === 'hypo') return {msg: 'dropping', color: '#ff6600'};
        } else if(this.inBglRange(bglNow) === 'hypo') {
            if(this.inBglRange(bglEnd) === 'target') return {msg: 'up to target', color: '#00b400'};
            if(this.inBglRange(bglEnd) === 'hyper') return {msg: 'shooting up', color: '#c900c9'};
            if(this.inBglRange(bglEnd) === 'hypo') return {msg: 'staying low', color: '#ff6600'};
        } else if(this.inBglRange(bglNow) === 'hyper') {
            if(this.inBglRange(bglEnd) === 'target') return {msg: 'down to target', color: '#00b400'};
            if(this.inBglRange(bglEnd) === 'hyper') return {msg: 'coasting high', color: '#c900c9'};
            if(this.inBglRange(bglEnd) === 'hypo') return {msg: 'crashing', color: '#ff6600'};
        }
    },

    //==========================================================================
    //--------       [      SUB(!) HELPERS FOR EX FACTOR ARRAY     ]      ------
    //==========================================================================
    //----- [SUB-HELPER 1A.1] -----
    logExFactor(item) {
        //exercise
        const exFactorArray = this.preferences.exFactorArray;
        const exFactorIndexValue = Number.parseFloat(exFactorArray.find(obj => obj.intensity === 0).factor);
        let exFactor;        
        
        if(!item.exercise) exFactor = exFactorIndexValue;
        if(item.exercise) exFactor = Number.parseFloat(exFactorArray.find(obj => obj.intensity === item.exercise).factor);

        console.log(item);
        
        return {
            time: item.logTime,
            exFactor: exFactor
        };
    },

    //----- [SUB-HELPER 1A.2] -----
    addDummyExFactorToNextTimezone(array, startDate, endDate) {
        const prefs = this.preferences;

        console.log(array);
        
        const exFactorIndexValue = Number.parseFloat(prefs.exFactorArray.find(obj => obj.intensity === 0).factor);        
        const startTime = array[0].time;
        const lastIndex = array.length - 1;
        const lastTime = array[lastIndex].time;

        const nextLogToUse = HelpLog.goForwardByHalfTzRange(lastTime);
        console.log(nextLogToUse, lastTime);
        console.log(startDate, startTime, endDate, nextLogToUse);
        // const correctedNextLog = HelpDateTime.getNearestHalfHourTime(startDate, startTime, endDate, nextLogToUse );
        const correctedNextLog = HelpDateTime.getTimesNearestIndexTime(this.currentTime, nextLogToUse);

        array.push({
            time: correctedNextLog,
            exFactor: exFactorIndexValue,
        });

        console.log(array);
    },

    //==========================================================================
    //----   [      SUB(!) HELPERS FOR BIG KAHUNA: COMBINE INSFOODEX   ]  ------
    //==========================================================================
    
    //----- [SUB-HELPER 3.1] -----
    fillRealOrDefaultDataToArray(data, newArray) {
        console.log(data, newArray);
        const bglStepMinLit = this.bglStepMinLiteral;
        const indExercise = this.indExerciseArray;
        console.log(indExercise);
        const insulinUArray = this.insulinUarray;
        const foodGlucoseArray = this.foodGlucoseArray;

        // REAL BGL - TARGET DEFAULT TO START
        for(let i = 0 ; i < data.length ; ++i) {
            const obj = data[i];
            const time = obj.logTime;
            let bgl = null;

            //set 1st value to target bgl if none exists
            if(i === 0 && !obj.bgl) {
                bgl = bglStepMinLit.target;
            } else if(obj.bgl) {
                bgl = obj.bgl;
            }

            //now put these values (if they exist) into the big new array
            if(bgl !== null) {
                const objToAddStuff = newArray.find(obj => obj.time === time);
                console.log(objToAddStuff, time);
                objToAddStuff.bgl = bgl;
            }
        }

        // INSULIN HALF-HOUR FX
        for(let i = 0 ; i < insulinUArray.length ; ++i) {
            const obj = insulinUArray[i];
            const time = obj.time;
            const insulinU = obj.units;

            //now put these values into the big new array            
            const objToAddStuff = newArray.find(obj => obj.time === time);
            objToAddStuff.insulinU = insulinU;
        }

        // FOOD (GLUCOSE) HALF-HOUR FX
        console.log(foodGlucoseArray);
        for(let i = 0 ; i < foodGlucoseArray.length ; ++i) {
            const obj = foodGlucoseArray[i];
            const time = obj.time;
            const glucoseGrams = obj.glucoseGrams;

            //now put these values into the big new array            
            const objToAddStuff = newArray.find(obj => obj.time === time);
            objToAddStuff.glucoseGrams = glucoseGrams;
        }

        // EXERCISE - REAL OR DEFAULT
        for(let i = 0 ; i < indExercise.length ; ++i) {
            const object = indExercise[i];
            const time = HelpDateTime.getTimesNearestIndexTime(this.currentTime, object.time);
            const exFactor = object.exFactor;

            console.log(time, newArray);

            const objToAddStuff = newArray.find(obj => obj.time === time);
            console.log(objToAddStuff, newArray, time);
            objToAddStuff.exFactor = exFactor;            
        }

        return;
    },

    //----- [SUB-HELPER 3.2] -----
    fillCalcedBglsToArray(newArray, seasonFactor) {
        // ADD INSULIN UNITS AND FOOD GLUCOSE TO ESTIMATE BGL
        const bglStepMinLit = this.bglStepMinLiteral;
        //will be added to each null bgl
        let bglSlope = 0;
        let bglY2;
        let prevObj;

        for(let i = 0 ; i < newArray.length ; ++i) {
            const obj = newArray[i];
            obj.seasonFactor = seasonFactor;
            let bglSteps = 0;

            //for interpolating bgl or following a calculated bgl, want to use real bgl in preference to fake bgl - ie re-index
            let prevBglInterpolatedOrReal;
            let prevBglCalcedOrReal;
            
            if(i > 0) {
                prevObj = newArray[i-1];
                prevBglInterpolatedOrReal = prevObj.bgl === null? prevObj.bglInterpolated : prevObj.bgl;
                prevBglCalcedOrReal = prevObj.bgl === null? prevObj.bglCalced : prevObj.bgl;
            }
            
            //if no exFactor, take the previous exFactor
            if(i > 0 && obj.exFactor === null) obj.exFactor = prevObj.exFactor;

            //calculated + bgl
            if(obj.glucoseGrams) obj.bglCalcUp = Math.round(10 * (obj.glucoseGrams * obj.bglDropPer1U) / (obj.glucosePer1U * seasonFactor)) / 10;

            //calculated - bgl
            if(obj.insulinU) {
                obj.insulinU = Math.round(10 * obj.insulinU) / 10;
                obj.bglCalcDown = Math.round(10 * (obj.insulinU * obj.bglDropPer1U) / (seasonFactor * obj.exFactor)) / 10;
            }

            if(!obj.bglCalcUp) obj.bglCalcUp = 0;
            if(!obj.bglCalcDown) obj.bglCalcDown = 0;

            

            //also get bglSlope for i>0
            if(obj.bgl !== null) {
                const bglY1 = obj.bgl;
                
                for(let j = 1 ; j < newArray.length - i ; ++j) {
                    if(newArray[i + j].bgl === null) {
                        ++bglSteps;
                        //if it gets to end, set y2= target value of 6.0
                        if(j === newArray.length - i -1) bglY2 = bglStepMinLit.target;
                    }
                    else if(newArray[i + j].bgl !== null) {
                        bglY2 = newArray[i + j].bgl;
                        ++bglSteps;
                        break;
                    }
                }
                
                bglSlope = Math.round(100 * (bglY2 - bglY1) / bglSteps) / 100;
            }
            if(i > 0) obj.bglSlope = bglSlope;
            
            if(obj.bgl === null && i > 0) obj.bglInterpolated = Math.round(100 *(prevBglInterpolatedOrReal + bglSlope))/100 ;
            
            //bglCalced will be prev bglCalced (or real bgl) +/- calculated bgl
            if(i > 0) {
                obj.bglCalced = Math.round(10 * (prevBglCalcedOrReal + prevObj.bglCalcUp - prevObj.bglCalcDown)) / 10;
                obj.bglCalcSlope = Math.round(100 * (obj.bglCalcUp - obj.bglCalcDown)) / 100;
            }

            //assume the bglCalcUp is correct (or = bglInterpolatedUp), get the bglInterpolatedDown value
            if(i > 0) obj.bglInterpolatedDown = obj.bglCalcUp - obj.bglSlope;
        }
    },

    //==========================================================================
    //----         [      SUB(!) HELPERS FOR DASHBOARD MESSAGE   ]        ------
    //==========================================================================
    inBglRange(bgl) {
        const bglStepMinLit = this.bglStepMinLiteral;
        const target = bglStepMinLit.target;
        const hyper = bglStepMinLit.hyper;
        const hypo = bglStepMinLit.hypo;

        if(bgl > target && bgl < hyper) return 'target';
        else if(bgl >= hyper) return 'hyper';
        else if(bgl <= hypo) return 'hypo';
    },    
};

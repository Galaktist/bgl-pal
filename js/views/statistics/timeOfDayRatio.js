/*  TIME OF DAY RATIO STRUCTURE  
**  ============================================================================
**  DECLARE
**  
**  preferences
**  bglStepMin
**  dataSeaTzFiltered
**  bolusNoFoodTzFiltered
**  timezoneRawTableData
**  seasonRawTableData
**  timezoneBolusTableData
**  seasonBolusTableData
**  loading -> boolean
**  
**  ============================================================================
**  RENDERING
**  renderNonRawSections - eg models etc. not dependent on calculations
**  
**  ============================================================================
**  RENDERING CALCS
**  
**  renderRawBolusNoFoodSections -> ends up calling on: renderBolusNoFoodStuff
**  renderRawRefFoodSections -> ends up calling on: renderBolusRefFoodStuff
**  
**  ============================================================================
**  RENDERING CALC HELPERS
**  
**  rendering calcs calls on:
**    -> calcAndRenderTimezoneLinearLineChart
**    -> renderTimezoneData
**    -> renderTimezoneDayLineChartFromHtml
**
**    -> calcAndRenderSeasonLinearLineChart
**    -> renderSeasonData
**    -> renderSeasonBarChartFromHtml
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC
**  
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  toggleShowData
**  saveSeasonFactorInput
**  toggleSeasonRef
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC: TIMEZONES
**  
**  ============================================================================
**  FUNCTIONS - DYNAMIC: TIMEZONE
**  
**  toggleTzRef
**  refactorTzInsulinGlucose
**  refactorTzInsulinBgl
**  refactorTzFactor
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC: BOLUS NO FOOD
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC: BOLUS REF FOOD
**  
**  ============================================================================
**  MAIN CALC FUNCTION
**  
**  ============================================================================
**  MAIN CALC FUNCTION HELPERS
**  
**  calculateBolusNoFoodData
**  calculateRefFoodData
**  
*/

/* eslint-disable indent */

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpConvert,
    HelpDateTime,
    HelpTz,
    HelpLog,
    HelpComplex,

} from '../../utils/helpers.js';

import { StorageService } from '../../utils/storage.js';
import { ChartComponent } from '../../utils/chart.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================
export const TimeOfDayRatioView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    preferences: [],
    bglStepMin: [], //call once to get the relevant step/min stuff
    dataSeaTzFiltered: [],
    bolusNoFoodTzFiltered: [],
    timezoneRawTableData: [],
    seasonRawTableData: [],
    timezoneBolusTableData: [],
    seasonBolusTableData: [],
    loading: false,

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        //fetch the html file's code with a helper function
        fetch('b6TimeOfDayRatio.html')
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
        this.bglStepMin = HelpConvert.getBglStepMinFigurative();
        this.attachStaticEventListeners();
        this.renderNonRawSections();        
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderNonRawSections() {
        this.renderHTMLheadings();
        this.renderTimezoneModelData();
        this.renderEmptyTimezoneData('raw-timezone');
        this.renderEmptyTimezoneData('bolus-timezone');

        //------- showOrNo  --------------------
        this.showOrNoData('raw-timezone', 'showRawTimezoneData');
        this.showOrNoData('raw-season', 'showRawSeasonData');
        this.showOrNoData('bolus-timezone', 'showBolusTimezoneData');
        this.showOrNoData('bolus-season', 'showBolusSeasonData');

        //------- render models always - DETAILS IN CALCS  -------- 
        this.renderTimezoneDayLineChartFromHtml('model');        
        this.renderSeasonModelData();
        this.renderSeasonBarChartFromHtml('model');

        //------- raw data  --------------------
        //async means must only call raw data charts at end of calculate function
        this.calculateAllRaw();
    },

    //==============================================
    //---------------- [STANDARD] ------------------
    //==============================================    
    //---------------- [RENDER 1] ------------------
    renderHTMLheadings() {
        const prefs = this.preferences;      

        //GET PREFS
        const tzArray = prefs.timezoneArray;
        // const foodArr = prefs.foodArray;      
        
        //GET REFS
        const refFood = prefs.referenceFood;
        const refFoodName = refFood.name;
        const refFoodGlucosePerServe = refFood.glucoseGPerServing;
        const tzRefName = tzArray.find(item => item.isRef === true).name;
        const tzColorClass = HelpTz.getTzNameColorClass(tzRefName);
        const refSeason = prefs.userSelections.season;

        // MAIN HEADING
        const insulinTimezoneHead = document.querySelector('#insulin-in-timezone-table');
        insulinTimezoneHead.innerHTML = `TIMEZONE Factors -> <span class="color-${refSeason}">${refSeason}</span>`;

        // REF FOOD HEADINGS/NOTES
        const rawSeasonHead = document.getElementById('seasonal-raw-heading');
        rawSeasonHead.innerHTML = `SEASON Analysis -> using ${refFoodGlucosePerServe}g of ${refFoodName} in <span class="${tzColorClass}">${tzRefName}</span> timezone`;

        const rawTzHead = document.getElementById('timezone-raw-heading');
        rawTzHead.innerHTML = `TIMEZONE Analysis -> using ${refFoodGlucosePerServe}g of ${refFoodName} in <span class="color-${refSeason}">${refSeason}</span>`;

        const rawTzNote = document.getElementById('use-highlight-season');
        rawTzNote.innerHTML = `Use highlighted cell values to estimate TIMEZONE Factors -> <span class="color-${refSeason}">${refSeason}</span> above`;

        // BOLUS NIL FOOD HEADINGS/NOTES
        const bolusSeasonHead = document.getElementById('bolus-season-heading');
        bolusSeasonHead.innerHTML = `SEASON Analysis -> using BOLUS-nil-food in <span class="${tzColorClass}">${tzRefName}</span> timezone`;

        const bolusTzHead = document.getElementById('bolus-timezone-heading');
        bolusTzHead.innerHTML = `TIMEZONE Analysis -> using BOLUS-nil-food in <span class="color-${refSeason}">${refSeason}</span>`;

        const bolusTzNote = document.getElementById('bolus-highlight-note');
        bolusTzNote.innerHTML = `Use highlighted cell values to estimate TIMEZONE Factors -> <span class="color-${refSeason}">${refSeason}</span> above`;
    },

    //---------------- [RENDER 2] ------------------
    renderTimezoneModelData() {  
        console.log('rendered tz defaults');
        const prefs = this.preferences;      

        const tzArray = prefs.timezoneArray;

        //dynamic table heading
        const mmolOrMgdlHeading = document.getElementById('mmol-or-mgdl-th');
        mmolOrMgdlHeading.innerHTML = '1U insulin drops BGL' + (
            prefs.userSelections.glucoseUnit === 'mmol/L'? ' (mmol/L)' : ' (mg/dL)');
         
        const tableBody = document.getElementById('timezone-defaults-tbody');

        tableBody.innerHTML = tzArray.map(element => {
            const colorClass = HelpLog.getLogsTimeofDayColorClass(element['start']);
            return `
            <tr class="timezone-row" data-row-id="${element['name']}">
                <td>
                    <button class="${ element['isRef'] === true ? 'toggle-option active' : 'toggle-option'} ${colorClass}" data-index="name">
                        <strong>${element['name']}</strong>
                    </button>
                </td>
                <td>
                    <input ${element['isRef'] === false ? 'readonly class="tz-carbs-input"' : 'class="tz-carbs-input active"'} type="number" data-index="glucosePer1U"  data-timezone="${element['name']}" 
                        value="${element['glucosePer1U']?? prefs.glucosePer1U}" step="1" min="1">
                </td>
                <td>
                    <input ${element['isRef'] === false ? 'readonly class="tz-bgl-drop-input"' : 'class="tz-bgl-drop-input active"'} type="number" data-index="bglDropPer1U" data-timezone="${element['name']}"
                           value="${HelpConvert.displayAsCorrectGlucoseUnit(element['bglDropPer1U'])}" 
                           step="${this.bglStepMin.step}"
                           min="${this.bglStepMin.step}">
                </td>
                <td>
                    <input ${element['isRef'] === true ? 'readonly class="tz-factor-input"' : 'class="tz-factor-input active"'} type="number" data-index="factor"  data-timezone="${element['name']}" 
                        value="${element['factor']?? 1}" step="0.1" min="0.1">
                </td>
            </tr>
            `;
        }).join('');
        
        // RE-ATTACH DYNAMIC EVENT LISTENERS every time things are reset
        this.attachDynamicEventListener();
    },

    //---------------- [RENDER 3] ------------------
    renderEmptyTimezoneData(containerId) {
        const prefs = this.preferences;      
        const tzArray = prefs.timezoneArray;
        // const rawData = prefs.dataSeaTzFiltered;
        // console.log(rawData);
        
        //the timezone data table
        const timezoneDataTableBody = document.getElementById(`${containerId}-tbody`);
        timezoneDataTableBody.innerHTML = tzArray.map(element => {
            console.log(element);
            const colorClass = HelpLog.getLogsTimeofDayColorClass(element.start);
            
            return `
                </tr>
                <tr class="timezone-factor" data-row-id="${element['name']}">
                    <td>
                        <button class="badge background ${colorClass}" data-timezone="${element['name']}">
                            <strong >${element['name']}</strong>
                        </button>
                    <td>
                        <input readonly type="number" class="timezone-insulin-zero-change" data-timezone="${element['name']}"
                            placeholder="TBC" value="1">
                    </td>
                    <td>
                        <input readonly type="number" class="timezone-bgl-rise" data-timezone="${element['name']}"
                            placeholder="TBC" value="">
                    </td>
                    ${containerId === 'raw-timezone'?
                        `<td>
                            <input readonly type="number" class="timezone-insulin-covers-glucose" data-timezone="${element['name']}"
                                placeholder="TBC" value="">
                        </td>`: ''
                    }                
                    <td>
                        <input readonly type="number" class="timezone-insulin-drops-bgl" data-timezone="${element['name']}"
                            placeholder="TBC" value="">
                    </td>
                    <td>
                        <input readonly type="number" class="calculated-timezone-factor active" data-timezone="${element['name']}"
                            placeholder="TBC" value="">
                    </td>
                </tr>
            `;
        }).join('');
    },

    //==============================================
    //--------------- [SHOW OR NO] -----------------
    //==============================================
    showOrNoData(containerId, prefId){
        const prefs = this.preferences;
        const show = prefs.userSelections[prefId];

        // set toggle-options for each button
        const showDataButton = document.querySelector(`#${containerId}-toggles button[data-action="show-data"]`);
        const hideDataButton = document.querySelector(`#${containerId}-toggles button[data-action="hide-data"]`);
        const rawTimezoneWrapper = document.querySelector(`#${containerId}-wrapper`);

        if(show) {
            showDataButton.classList.add('active');
            hideDataButton.classList.remove('active');
            rawTimezoneWrapper.classList.remove('hidden');
        } else {
            showDataButton.classList.remove('active');
            hideDataButton.classList.add('active');
            rawTimezoneWrapper.classList.add('hidden');
        }
    },

    //==============================================
    //--------------- [   MODEL  ] -----------------
    //==============================================
    renderSeasonModelData() {
        //first get the values for the seasons
        const prefs = this.preferences;
        const refSeason = prefs.userSelections.season;    //{eg Summer}
        const seasonArray = prefs.seasonArray;  //{eg Summer:1.0, Autumn:1.2 etc} object

        console.log(seasonArray);

        //then use query selector to replace with those values - don't need to create new constants
        const seasoButton = document.querySelectorAll('#seasonal-factors-tbody button.toggle-option[data-season]');
        for(const element of seasoButton) {
            element.classList.toggle('active', (refSeason === element.dataset.season));
        }

        //then use query selector to work on "value"
        const seasonFactorValue = document.querySelectorAll('#seasonal-factors-tbody input.seasonal-factor-input[data-season]');
        for(const element of seasonFactorValue) {
            const seasonObj = seasonArray.find(obj => obj.name === element.dataset.season);
            element.value = seasonObj['factor'];

            //disable the value of 1.0 for ref season
            refSeason === element.dataset.season? element.disabled = true : element.disabled = false;
        }
    },

    //==========================================================================
    //-----------------   [       RENDERING CALCS       ]  ---------------------
    //==========================================================================

    //----- [CALC RENDER 1] -----
    renderRawBolusNoFoodSections() {
        const refSeason = this.preferences.userSelections.season;
        const tzArray = this.preferences.timezoneArray;
        const tzRefName = tzArray.find(item => item.isRef === true).name;

        // bolus nil food
        this.timezoneBolusTableData = this.calcAndRenderTimezoneLinearLineChart('bolus-timezone', this.bolusNoFoodTzFiltered, refSeason);    //render only for the reference season
        this.renderTimezoneData('bolus-timezone', this.timezoneBolusTableData);
        this.renderTimezoneDayLineChartFromHtml('raw', 'bolus-timezone');
        
        this.seasonBolusTableData = this.calcAndRenderSeasonLinearLineChart('bolus-season', this.bolusNoFoodTzFiltered, tzRefName);    //render only for the reference timezone
        this.renderSeasonData('bolus-season', this.seasonBolusTableData);
        this.renderSeasonBarChartFromHtml('raw', 'bolus-season');

        this.renderBolusNoFoodStuff(tzRefName, refSeason);
    },

    renderRawRefFoodSections() {
        const refSeason = this.preferences.userSelections.season;
        const tzArray = this.preferences.timezoneArray;
        const tzRefName = tzArray.find(item => item.isRef === true).name;

        // bolus ref food
        this.timezoneRawTableData = this.calcAndRenderTimezoneLinearLineChart('raw-timezone', this.dataSeaTzFiltered, refSeason);    //render only for the reference season
        this.renderTimezoneData('raw-timezone', this.timezoneRawTableData);
        this.renderTimezoneDayLineChartFromHtml('raw', 'raw-timezone');

        this.seasonRawTableData = this.calcAndRenderSeasonLinearLineChart('raw-season', this.dataSeaTzFiltered, tzRefName);    //render only for the reference timezone
        this.renderSeasonData('raw-season', this.seasonRawTableData);
        this.renderSeasonBarChartFromHtml('raw', 'raw-season');

        this.renderBolusRefFoodStuff(tzRefName, refSeason);
    },

    //==========================================================================
    //-------------   [       RENDERING CALC HELPERS       ]  ------------------
    //==========================================================================

    //==========================================
    //----- [HELPER 1.1: TIMEZONE CHART ] ------
    //==========================================
    calcAndRenderTimezoneLinearLineChart(containerId, data, refSeason) {
        console.log(containerId, data, refSeason);
        // console.log('rendering tz raw...');
        const glucoseUnit = this.preferences.userSelections.glucoseUnit;
        // const tzArr = this.preferences.timezoneArray;

        console.log(data);
        //filter to reference season
        const refSeasonData = data.filter(item => item.season === refSeason);//the ref season has been set to isRegression = true
                
        const rawTzData = refSeasonData.map((row) => ({            
            x: row.estimatedInsulin,
            y: row.bglChange,
            season: row.season,
            opacity: 1,
            // color: row.tzColor,
            lineClass: `${HelpTz.getTzNameColorClass(row.timezone)} dashed${row.tzRegression? ' thick': ''}`,
            circleClass: `${HelpTz.getTzNameColorClass(row.timezone)} ${row.tzRegression? 'radius-lg' : 'radius-sm'} ${row.outlier? 'outlier': ''}`,
            glucoseGPerServing: row.glucoseGPerServing?? 0,
            isRegression: row.tzRegression,
            glucoseUnit: glucoseUnit,
            timezone: row.timezone
        }));
        console.log(rawTzData);

        if(rawTzData.length === 0) {
            const tableDataEmpty = [];
            
            // FINISH
            return tableDataEmpty;
        }        

        try{
            const tableData = ChartComponent.createTzInsulinBgl(`#${containerId}-line-chart .full-state`, rawTzData);
            // console.log(tableData, this.timezoneBolusTableData);
            
            // HIDE EMPTY CHART IF it works to display chart above
            document.querySelector(`#${containerId}-line-chart .empty-state`).classList.add('hidden');

            return tableData;

        } catch(error) {
            // REMOVE ANY HALF-FORMED STUFF
            console.error('error:', error);
            HelpHtml.clearHtmlCode(`#${containerId}-line-chart .full-state`);
            const tableDataEmptyError = [];
            
            // FINISH
            return tableDataEmptyError;
        }
    },

    //==========================================
    //----- [HELPER 1.2: TIMEZONE DATA  ] ------
    //==========================================
    renderTimezoneData(containerId, data) {
        console.log(containerId, data);
        //need to clear old values out
        // console.log('did this run?');
        const tableValuesToClear = document.querySelectorAll(`#${containerId}-tbody input`);
        // console.log(tableValuesToClear);
        for(const item of tableValuesToClear) {
            item.value='';
            switch(item.className) {
                case 'timezone-bgl-rise':{
                    item.classList.add('hidden');
                    item.classList.remove('active');
                    break;
                }

                case 'timezone-insulin-covers-glucose': {
                    item.classList.remove('active');
                    break;
                }

                case 'timezone-insulin-drops-bgl': {
                    item.classList.remove('active');
                    break;
                }
            }
        }

        for(const item of data) {
            const tz = item.timezone;

            const tzXintercept = document.querySelector(`#${containerId}-tbody .timezone-insulin-zero-change[data-timezone="${tz}"]`);
            const tzYintercept = document.querySelector(`#${containerId}-tbody .timezone-bgl-rise[data-timezone="${tz}"]`);
            const tz1UinsulinBgl = document.querySelector(`#${containerId}-tbody .timezone-insulin-drops-bgl[data-timezone="${tz}"]`);
            const tzFactor = document.querySelector(`#${containerId}-tbody .calculated-timezone-factor[data-timezone="${tz}"]`);

            //null for bolus
            const tz1UinsulinGlucose = containerId === 'raw-timezone'? document.querySelector(`#${containerId}-tbody .timezone-insulin-covers-glucose[data-timezone="${tz}"]`) : null;
            if(tz1UinsulinGlucose !== null) tz1UinsulinGlucose.value = item.glucosePer1U;


            tzXintercept.value = item.insulin;
            tzYintercept.value = HelpConvert.displayAsCorrectGlucoseUnit(item.bglRise);
            tz1UinsulinBgl.value = HelpConvert.displayAsCorrectGlucoseUnit(item.bglDropPer1U);
            tzFactor.value = item.factor;

            if(item.isRef) {
                tzYintercept.classList.remove('hidden');                
                tzYintercept.classList.add('active');
                tz1UinsulinBgl.classList.add('active');
                if(tz1UinsulinGlucose !== null) tz1UinsulinGlucose.classList.add('active');
            }
        }
    },

    //==========================================
    //----- [HELPER 1.3: TIMEZONE HTML  ] ------
    //==========================================
    renderTimezoneDayLineChartFromHtml(type, containerId) {
        console.log('rendertzdaylinechart', type);
        const tzFactors = type === 'raw'?
            document.querySelectorAll(`#${containerId}-tbody .calculated-timezone-factor`) :
            document.querySelectorAll('#timezone-defaults-tbody .tz-factor-input');
        console.log(type);

        const tzDayData = [];
        // const tzArray = this.preferences.timezoneArray;
        // const refTzObj = tzArray.find(obj => obj.isRef === true);
        // const refTz = refTzObj.name;

        // let regressionCountVals = 0;

        for(const item of tzFactors) {
            // if(item.dataset.timezone === refTz)
            // ++regressionCountVals;
            if(item.value > 0) {
                tzDayData.push({
                    timezone: item.dataset.timezone,
                    x: HelpTz.getTzNamesProportionOfDay(item.dataset.timezone),   //need to work out x by getting log time in mins/1440 mins
                    y: Number.parseFloat(item.value),  //the factor
                    // color: HelpTz.getTzNamesColor(item.dataset.timezone),
                    // radius: (item.dataset.timezone === refTz? 5 : 3.5),
                    circleClass: `${HelpTz.getTzNameColorClass(item.dataset.timezone)} ${item.tzRegression? 'radius-lg' : 'radius-sm'}`, 
                });
            }
        }

        //need to make sure it doesn't keep adding new graphs - have to empty container
        //also need to fix this counting thingamyjig
        // if(regressionCountVals <=1 ) HelpHtml.showMessage("not enough raw data to calculate regression for reference timezone");

        if(type === 'raw' && tzDayData.length === 0) {
            // FINISH
            HelpHtml.clearHtmlCode(`#${containerId}-day-chart .full-state`);
            return;
        }

        try{
            ChartComponent.createDayTimezoneInsulin(
                `${type === 'raw'? `#${containerId}-day-chart .full-state` : '#model-timezone-day-chart .full-state'}`
                , tzDayData, type === 'raw');

            // HIDE EMPTY IF SUCCESSFULLY DREW
            if(type === 'raw') document.querySelector(`#${containerId}-day-chart .empty-state`).classList.add('hidden');

        } catch(error) {
            // REMOVE HALF-FORMED RAW
            console.error('new error found:', error);
            if(type === 'raw') HelpHtml.clearHtmlCode(`#${containerId}-day-chart .full-state`);
        }
    },

    //==========================================
    //----- [  HELPER 2.1: SEASON CHART ] ------
    //==========================================
    calcAndRenderSeasonLinearLineChart(containerId, data, tzRef) { 
        console.log('calcAndRenderSeasonLinearLineChart', containerId, data, tzRef);
        //the problem might be that it's not deleting the html stuff if it doesn't exist
        //eg if changing to a different tz, need to iterate through all the timezones and delete what shouldn't be there or something

        //always works out nicely when first rendering and getting off the page then returning 
        
        console.log('showing season raw data');
        const glucoseUnit = this.preferences.userSelections.glucoseUnit;

        const refTzData = data.filter(item => item.timezone === tzRef);//the ref season has been set to isRegression = true

        console.log('returning, bro:', refTzData.length);
        
        const rawSeasonData = refTzData.map(row => ({
            x: row.estimatedInsulin,
            y: row.bglChange,
            season: row.season,
            opacity: 1,
            lineClass: `color-${row.season} dashed${row.seasonRegression? ' thick': ''}`,
            circleClass: `color-${row.season} ${row.seasonRegression? 'radius-lg' : 'radius-sm'} ${row.outlier? 'outlier': ''}`,
            // color: row.seasonColor,
            glucoseGPerServing: row.glucoseGPerServing?? 0,
            isRegression: row.seasonRegression,
            timezone: row.timezone,
            glucoseUnit: glucoseUnit
        }));

        console.log(containerId, rawSeasonData);

        
        // IF NULL DATA Leave as EMPTY AND REMOVE INNERHTML
        // const emptyStateContainer = document.querySelector('#raw-season-line-chart .empty-state');

        if(rawSeasonData.length === 0) {

            // SHOW EMPTY FOR RAW            
            // emptyStateContainer.classList.remove('hidden');
            
            const tableDataEmpty = [];
            
            // FINISH
            return tableDataEmpty;
        }        
 
        try{
            console.log(containerId);
            const tableData = ChartComponent.createSeasonInsulinBgl(`#${containerId}-line-chart .full-state`, rawSeasonData);
            
            // HIDE EMPTY CHART
            document.querySelector(`#${containerId}-line-chart .empty-state`).classList.add('hidden');  

            return tableData;

        } catch(error) {            
            // REMOVE ANY HALF-FORMED STUFF
            console.error('error found:', error);
            HelpHtml.clearHtmlCode(`#${containerId}-line-chart .full-state`);

            const tableDataEmptyError = [];
            
            // FINISH
            return tableDataEmptyError;
        }
    },

    //==========================================
    //----- [  HELPER 2.2: SEASON DATA  ] ------
    //==========================================
    renderSeasonData(containerId, data) {
        //need to clear old values out
        const tableValuesToClear = document.querySelectorAll(`#${containerId}-tbody input`);
        for(const item of tableValuesToClear) {
            item.value='';
            if(item.className === 'seasonal-bgl-rise') {
                item.classList.remove('active');
                item.classList.add('hidden');
            }
        }

        console.log(containerId, data);
        if(data.length === 0) return;

        for(const item of data) {
            const season = item.season;
            const seasonXintercept = document.querySelector(`#${containerId}-tbody .seasonal-insulin-zero-change[data-season="${season}"]`);
            const seasonYintercept = document.querySelector(`#${containerId}-tbody .seasonal-bgl-rise[data-season="${season}"]`);
            const season1UinsulinBgl = document.querySelector(`#${containerId}-tbody .seasonal-insulin-drops-bgl[data-season="${season}"]`);
            const seasonFactor = document.querySelector(`#${containerId}-tbody .calculated-seasonal-factor[data-season="${season}"]`);

            //null for bolus
            const season1UinsulinGlucose = containerId === 'raw-season'? document.querySelector(`#${containerId}-tbody .seasonal-insulin-covers-glucose[data-season="${season}"]`) : null;
            if(season1UinsulinGlucose !== null) season1UinsulinGlucose.value = item.glucosePer1U;

            seasonXintercept.value = item.insulin;
            seasonYintercept.value = item.bglRise;
            seasonYintercept.classList = item.isRef === true? 'seasonal-bgl-rise'  : 'seasonal-bgl-rise hidden';            
            season1UinsulinBgl.value = item.bglDropPer1U;
            seasonFactor.value = item.factor;

            if(item.isRef) {
                seasonYintercept.classList.add('active');
                seasonYintercept.classList.remove('hidden');
            }
        }
    },

    //==========================================
    //----- [  HELPER 2.3: SEASON HTML  ] ------
    //==========================================
    renderSeasonBarChartFromHtml(type, containerId) {
        if(type==='raw') console.log('renderSeasonBarChart', type);
        const seasonFactors = type === 'raw'?
            document.querySelectorAll(`#${containerId}-tbody .calculated-seasonal-factor`) :    
            document.querySelectorAll('#seasonal-factors-tbody .seasonal-factor-input');

        //do check to return if no data
        console.log(seasonFactors);

        const seasonYearData = [];
        const refSeason = this.preferences.userSelections.season;

        const order = [];

        switch(refSeason) {
            case 'Summer': {
                order.push('Summer', 'Autumn', 'Winter', 'Spring');
                break;
            }

            case 'Autumn': {
                order.push('Autumn', 'Winter', 'Spring', 'Summer');
                break;
            }

            case 'Winter': {
                order.push('Winter', 'Spring', 'Summer', 'Autumn');
                break;
            }

            case 'Spring': {
                order.push('Spring', 'Summer', 'Autumn', 'Winter');
                break;
            }
        }
        // let yCount = 0;

        for(const item of seasonFactors) {
            console.log(item, item.dataset.season, item.value);
            
            // if(type === 'raw' && item.value > 0)
            //     ++yCount;            

            seasonYearData.push({
                order: order.indexOf(item.dataset.season),
                season: item.dataset.season,
                y: item.value,
                barClass: `color-${item.dataset.season}`
            });
        }

        seasonYearData.sort((a, b) => {
            const orderA = a.order;
            const orderB = b.order;

            if (orderA < orderB) {
                return -1; // a comes first
            }
            if (orderA > orderB) {
                return 1; // b comes first
            }
            return 0; // names are equal, order unchanged
        });

        // this.clearSeasonRawYearContainer();        
        console.log(document.getElementById('model-season-year-chart'));

        console.log(seasonYearData);
        //if season y's are all blank, don't draw
        let barCount = 0;
        for(let i = 0 ; i < seasonYearData.length ; ++i) {
            if(seasonYearData[i].y > 0) ++barCount;
        }
        if(barCount === 0) {
            HelpHtml.clearHtmlCode(`#${containerId}-year-chart .full-state`);
            return;
        }

        try{
            ChartComponent.createYearSeasonInsulin(
                `${type === 'raw'? `#${containerId}-year-chart .full-state` : '#model-season-year-chart .full-state'}`
                , seasonYearData);

            // HIDE EMPTY IF SUCCESSFULLY DREW
            if(type === 'raw') document.querySelector(`#${containerId}-year-chart .empty-state`).classList.add('hidden');

        } catch(error) {
            // REMOVE HALF-FORMED RAW
            console.error('error:', error);
            if(type === 'raw') HelpHtml.clearHtmlCode(`#${containerId}-year-chart .full-state`);
        }        
    },

    
    //==========================================
    //-----[HELPER 3.1: BOLUS NO FOOD STUFF]----
    //==========================================
    renderBolusNoFoodStuff(refTz, refSeason) {
        const tbodyData = this.bolusNoFoodTzFiltered;
        if(tbodyData.length === 0) return;

        const tbodyTzRefSeasonData = tbodyData.filter(item => item.season === refSeason);//the ref season has been set to isRegression = true      
        const tbodySeasonRefTzData = tbodyData.filter(item => item.timezone === refTz);//the ref season has been set to isRegression = true

        const tbodyTimezone = document.getElementById('bolus-timezone-raw-stuff-tbody');
        tbodyTimezone.innerHTML = tbodyTzRefSeasonData.map(row => {
            const colorClass = HelpTz.getTzNameColorClass(row.timezone);
            return `
            <tr data-index="${row.timezone}" class="available ${row.outlier? 'outlier' : ''}">
                <td>${HelpDateTime.dateStrToShortDateStr(row.date)}</td>
                <td><button class="badge background toggle-option outset-md ${colorClass}" id="${row.id}" data-index="chart-cell">${row.timezone}</button></td>
                <td data-index="chart-cell" class="${colorClass}">${HelpConvert.displayAsCorrectGlucoseUnit(row.bglChange)}</td>
                <td>${row.bolusType}</td>
                <td>${row.bolusType === ''? '' : row.bolusUnits.toFixed(1)}</td>
                <td>${row.bolusType === ''? '' : `${(100*row.bolusInsulinAction).toFixed(0)}%`}</td>
                <td data-index="chart-cell" class="${colorClass}">${row.bolusType === ''? '' : row.estimatedInsulin.toFixed(1)}</td>
            </tr>
            `;
        }).join('');

        const tbodySeason = document.getElementById('bolus-season-raw-stuff-tbody');
        tbodySeason.innerHTML = tbodySeasonRefTzData.map(row => {
            const colorClass = `color-${row.season}`;
            return `
            <tr data-index="${row.season}" class="available ${row.outlier? 'outlier' : ''}">
                <td>${HelpDateTime.dateStrToShortDateStr(row.date)}</td>
                <td><button class="badge background toggle-option outset-md" data-season="${row.season}" id="${row.id}" data-index="chart-cell">${row.season}</button></td>
                <td data-index="chart-cell" class="${colorClass}">${HelpConvert.displayAsCorrectGlucoseUnit(row.bglChange)}</td>
                <td>${row.bolusType}</td>
                <td>${row.bolusType === ''? '' : row.bolusUnits.toFixed(1)}</td>
                <td>${row.bolusType === ''? '' : `${(100*row.bolusInsulinAction).toFixed(0)}%`}</td>
                <td data-index="chart-cell" class="${colorClass}">${row.bolusType === ''? '' : row.estimatedInsulin.toFixed(1)}</td>
            </tr>
            `;
        }).join('');

        this.attachBolusNoFoodEventListeners();
    },

    //==========================================
    //----[HELPER 3.2: BOLUS REF FOOD STUFF]----
    //==========================================
    renderBolusRefFoodStuff(refTz, refSeason) {
        const tbodyData = this.dataSeaTzFiltered;
        if(tbodyData.length === 0) return;

        const tbodyTzRefSeasonData = tbodyData.filter(item => item.season === refSeason);//the ref season has been set to isRegression = true      
        const tbodySeasonRefTzData = tbodyData.filter(item => item.timezone === refTz);//the ref season has been set to isRegression = true

        const tbody = document.getElementById('raw-timezone-raw-stuff-tbody');
        tbody.innerHTML = tbodyTzRefSeasonData.map(row => `
            <tr data-index="${row.timezone}" class="available ${row.outlier? 'outlier' : ''}">
                <td>${HelpDateTime.dateStrToShortDateStr(row.date)}</td>
                <td><button class="toggle-option outset-md" id="${row.id}"><span data-index="chart-cell">${row.timezone}</span></button></td>
                <td>${row.foodMultiplier.toFixed(1)}</td>
                <td data-index="chart-cell">${HelpConvert.displayAsCorrectGlucoseUnit(row.bglChange)}</td>
                <td>${row.bolusType}</td>
                <td>${row.bolusType === ''? '' : row.bolusUnits.toFixed(1)}</td>
                <td>${row.bolusType === ''? '' : `${(100*row.bolusInsulinAction).toFixed(0)}%`}</td>
                <td data-index="chart-cell">${row.bolusType === ''? '' : row.estimatedInsulin.toFixed(1)}</td>
            </tr>
        `).join('');

        const tbodySeason = document.getElementById('bolus-season-raw-stuff-tbody');
        tbodySeason.innerHTML = tbodySeasonRefTzData.map(row => {
            const colorClass = `color-${row.season}`;
            return `
            <tr data-index="${row.season}" class="available ${row.outlier? 'outlier' : ''}">
                <td>${HelpDateTime.dateStrToShortDateStr(row.date)}</td>
                <td><button class="badge background toggle-option outset-md" data-season="${row.season}" id="${row.id}" data-index="chart-cell">${row.season}</button></td>
                <td>${row.foodMultiplier.toFixed(1)}</td>
                <td data-index="chart-cell" class="${colorClass}">${HelpConvert.displayAsCorrectGlucoseUnit(row.bglChange)}</td>
                <td>${row.bolusType}</td>
                <td>${row.bolusType === ''? '' : row.bolusUnits.toFixed(1)}</td>
                <td>${row.bolusType === ''? '' : `${(100*row.bolusInsulinAction).toFixed(0)}%`}</td>
                <td data-index="chart-cell" class="${colorClass}">${row.bolusType === ''? '' : row.estimatedInsulin.toFixed(1)}</td>
            </tr>
            `;
        }).join('');

        this.attachBolusRefFoodEventListeners();
    },

    //==========================================================================
    //-------------   [        EVENT LISTENERS - STATIC        ]  --------------
    //==========================================================================
    attachStaticEventListeners() {
        console.log('attaching static event listeners...');

        const refSeasonButton = document.querySelectorAll('#seasonal-factors-tbody .toggle-option');
        for(const btn of refSeasonButton) {
            const seasonName = btn.textContent.trim();   //eg Summer, have to trim whitespace
            
            //get the 4 seasonal elements in a node to later get values from a forEach
            const elements = document.querySelectorAll('#seasonal-factors-tbody .seasonal-factor-input');
            
            //get the factor number of the element clicked in a node to later get values from a forEach
            const lookup = `#seasonal-factors-tbody .seasonal-factor-input[data-season="${seasonName}"]`;
            const newRefElement = document.querySelector(lookup);
            console.log(elements, seasonName, newRefElement);

            btn.addEventListener('click', () => this.toggleSeasonRef(elements, seasonName, newRefElement));
        }

        const SeasonFactorInput = document.querySelectorAll('#seasonal-factors-tbody .seasonal-factor-input');
        for(const inpt of SeasonFactorInput) {
            inpt.addEventListener('blur', (event) => {
                // const element = event.target; //gives element on which box clicked eg data-season=Summer
                const val = event.target.value;
                const season = event.target.dataset.season;
                this.saveSeasonFactorInput(season, val);   //using val to differentiate from .value used in function
            });
        }
        
        //------------            show or no buttons             ---------------
        const timezoneRawHide = document.querySelectorAll('#raw-timezone-toggles button');
        for(const button of timezoneRawHide) {
            button.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                const showOrNo = action === 'show-data'? true : false;
                this.toggleShowData('raw-timezone', 'showRawTimezoneData', showOrNo);
            });
        }

        const seasonRawHide = document.querySelectorAll('#raw-season-toggles button');
        for(const button of seasonRawHide) {
            button.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                const showOrNo = action === 'show-data'? true : false;
                this.toggleShowData('raw-season', 'showRawSeasonData', showOrNo);
            });
        }

        const timezoneBolusHide = document.querySelectorAll('#bolus-timezone-toggles button');
        for(const button of timezoneBolusHide) {
            button.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                const showOrNo = action === 'show-data'? true : false;
                this.toggleShowData('bolus-timezone', 'showBolusTimezoneData', showOrNo);
            });
        }

        const seasonBolusHide = document.querySelectorAll('#bolus-season-toggles button');
        for(const button of seasonBolusHide) {
            button.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                const showOrNo = action === 'show-data'? true : false;
                this.toggleShowData('bolus-season', 'showBolusSeasonData', showOrNo);
            });
        }
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    toggleShowData(containerId, prefId, show) {
        const prefs = this.preferences;
        
        // update prefs
        prefs.userSelections[prefId] = show;

        //save preferences
        StorageService.savePreferences(this.preferences);
        this.showOrNoData(containerId, prefId);
    },

    //---------------- [FUNCTION STATIC 2] ------------------
    saveSeasonFactorInput(season, value) {
        const seasonArray = this.preferences.seasonArray;
        const seasonObject = seasonArray.find(obj => obj.name === season);
        
        seasonObject.factor = value;

        StorageService.savePreferences(this.preferences);
        this.renderNonRawSections();
    },

    //---------------- [FUNCTION STATIC 3] ------------------
    toggleSeasonRef(elements, seasonName, newRefElement) {
        const prefs = this.preferences;
        const seasonFactorTable = prefs.seasonArray;
        console.log(seasonFactorTable, typeof newRefElement.value);
        const newRefElementVal = Number.parseFloat(newRefElement.value);

        // set clicked 'value' season to be the stored season ref
        prefs.userSelections.season = seasonName; // eg 'Summer'

        //also update season array table ref
        //access the previous thing with seasonIsRef=true and set that to false
        const myoldSeaIsRefObj = seasonFactorTable.find(item => item.isRef === true);
        myoldSeaIsRefObj.isRef = false;  //sets old element to false - ie seaArr is overwritten

        //access the current clicked thing and mutate array to give seasonIsRef=true
        //set clicked-button to be true
        const newSeaIsRefObj = seasonFactorTable.find(item => item.name === seasonName);
        newSeaIsRefObj.isRef = true;

        // re-index the values
        for(const element of elements) {
            //re-index each factor
            const elementVal = Number.parseFloat(element.value);
            const reFactor = Math.max(Math.round(elementVal/newRefElementVal*10)/10, 0.1);

            //overwrite for each element into stored prefs
            const indexName = element.dataset.season;    //eg Summer
            const overwriteObj = seasonFactorTable.find(item => item.name === indexName);
            overwriteObj.factor = reFactor;
        }       

        StorageService.savePreferences(this.preferences);
        console.log(this.preferences);
        this.renderSeasonData('raw-season', this.seasonRawTableData);
        this.renderSeasonData('bolus-season', this.seasonBolusTableData);
        // this.renderSeasonRawData();
        this.renderNonRawSections();
        // HelpHtml.showMessage('Reference season updated');
    },

    //==========================================================================
    //--------   [      EVENT LISTENERS - DYNAMIC: TIMEZONES        ]  ---------
    //==========================================================================
    attachDynamicEventListener() {
        // console.log('attaching dynamic event listeners...');
        // NEW button for updating reference timezone
        const refTzButtons = document.querySelectorAll('#timezone-defaults-tbody .toggle-option');
        for(const btn of refTzButtons) {
            btn.addEventListener('click', () => {
                // console.log('ran refButtons update');
                // console.log(btn.textContent.trim());
                this.toggleTzRef(btn.textContent.trim());//have to .trim() as there's a bunch of white space returned from html
            });
        }

        //this is for saving the table's td values in place
        const tzCarbButtons = document.querySelectorAll('#timezone-defaults-tbody input.tz-carbs-input');
        for(const inpt of tzCarbButtons) {
            inpt.addEventListener('change', (event) => {
                const element = event.target; //gives element on which box clicked eg range-start for early
                const val = event.target.value;  //gives the new user value eg 07:30
                const parent = event.target.closest('tr').dataset.rowId; //check parentElement val comes through
                this.refactorTzInsulinGlucose(element, val, parent);
            });
        }

        //this is for saving the table's td values in place
        const tzBglButtons = document.querySelectorAll('#timezone-defaults-tbody input.tz-bgl-drop-input');
        for(const inpt of tzBglButtons) {
            inpt.addEventListener('change', (event) => {
                const element = event.target; //gives element on which box clicked eg range-start for early
                const val = event.target.value;  //gives the new user value eg 07:30
                const parent = event.target.closest('tr').dataset.rowId; //check parentElement val comes through
                this.refactorTzInsulinBgl(element, val, parent);
            });
        }

        //this is for saving the factors and re-factoring after any changes
        const tzFactorButtons = document.querySelectorAll('#timezone-defaults-tbody input.tz-factor-input');
        for(const inpt of tzFactorButtons) {
            inpt.addEventListener('change', (event) => {
                const val = event.target.value;  //gives the new user value eg early
                const parent = event.target.closest('tr').dataset.rowId; //check parentElement val comes through
                this.refactorTzFactor(val, parent);
            });
        }
    },

    //==========================================================================
    //--------   [        FUNCTIONS - DYNAMIC: TIMEZONE        ]  --------------
    //==========================================================================

    //---------------- [FUNCTION DYNAMIC 1] ------------------
    toggleTzRef(value) {    //new value eg afternoon
        console.log(this.dataSeaTzFiltered);
        
        const tzArr = this.preferences.timezoneArray;

        //access the previous thing with tzIsRef=true and set that to false
        const myoldTzIsRefObj = tzArr.find(item => item.isRef === true);
        myoldTzIsRefObj.isRef = false;  //sets old element to false - ie tzArr is overwritten

        //access the current clicked thing and mutate array to give tzIsRef=true
        //set clicked-button to be true
        const newTzIsRefObj = tzArr.find(item => item.name === value);
        newTzIsRefObj.isRef = true;

        // value = new value to put in
        //if it's mg/dl or glucose, use parseInt
        const mgdlOrmmol = this.preferences.userSelections.glucoseUnit;

        const newBaseTzFactor = newTzIsRefObj.factor;
        const newGlucosePer1U = newTzIsRefObj.glucosePer1U;
        const newBglDropPer1U = newTzIsRefObj.bglDropPer1U;

        //go through each item - each tzfactor gets divided by ref tzfactor that existed before
        for(const item of tzArr) {
            item.factor = Math.round(10 * item.factor/newBaseTzFactor) / 10;
            item.bglDropPer1U = mgdlOrmmol === 'mg/dL'?
                Math.round(newBglDropPer1U / item.factor) :
                Math.round(10 * newBglDropPer1U / item.factor) / 10;
            item.glucosePer1U = Math.round(newGlucosePer1U / item.factor);
        }

        StorageService.savePreferences(this.preferences);
        this.renderNonRawSections();   //to ensure the ref data point is bigger...
        console.log('ran rendeeeeeerll secionts?');
        // HelpHtml.showMessage('Reference timezone updated');
    },

    //------------  [RE FACTORING TOP TABLE]    --------------------------------
    refactorTzInsulinGlucose(element, val, parent) {
        console.log(element, val, parent);  // eg element changed, 2.2, 'early'
        const lookupId = element.dataset.index; //eg 'blgDropPer1U', 'factor'
        const tzArr = this.preferences.timezoneArray;        

        //find 1 object in that array with a certain id=type
        const myObj = tzArr.find(item => item.name === parent);

        // value = new value to put in
        myObj[lookupId] = Number.parseInt(val); //newVal after logic
        const myObjVal = myObj[lookupId];
        const otherObjects = tzArr.filter(item => item.name !== parent);
        
        for(const item of otherObjects) {
            item[lookupId] = Number.parseInt(myObjVal / item.factor);
        }

        StorageService.savePreferences(this.preferences);

        //Have to dynamically re-render because of unknown row numbers
        this.renderTimezoneModelData();
        this.renderTimezoneDayLineChartFromHtml('model');
    },

    refactorTzInsulinBgl(element, val, parent) {
        console.log(element, val, parent);  // eg element changed, 2.2, 'early'
        const lookupId = element.dataset.index; //eg 'blgDropPer1U', 'factor'
        const tzArr = this.preferences.timezoneArray;

        //find 1 object in that array with a certain id=type
        const myObj = tzArr.find(item => item.name === parent);
        const otherObjects = tzArr.filter(item => item.name !== parent);

        // value = new value to put in
        //if it's mg/dl or glucose, use parseInt
        const mgdlOrmmol = this.preferences.userSelections.glucoseUnit;

        if(mgdlOrmmol === 'mg/dL') {
            myObj[lookupId] = HelpConvert.storeAsCorrectGlucoseUnit(val); //newVal after logic

            for(const item of otherObjects) {
                item[lookupId] = (myObj[lookupId] / item.factor);
            }
            
        } else {
            myObj[lookupId] = Number.parseFloat(val); //newVal after logic

            for(const item of otherObjects) {
                item[lookupId] = Number.parseFloat(Math.round(10 * myObj[lookupId] / item.factor) / 10);
            }
        }

        StorageService.savePreferences(this.preferences);

        //Have to dynamically re-render because of unknown row numbers
        this.renderTimezoneModelData();
        this.renderTimezoneDayLineChartFromHtml('model');
        // this.renderAllSections();
    },

    refactorTzFactor(val, parent) {
        // console.log(element, val, parent);  // eg element changed, 1.1, 'early'
        const tzArr = this.preferences.timezoneArray;        

        //if updating the 1U insulin covers glucose - convert all the other values based on their factor


        //same for updating the 1U insulin drops Bgl
        //find the reference timezone
        const refTz = tzArr.find(obj => obj.isRef === true);
        const glucosePer1U = refTz.glucosePer1U;
        const bglDropPer1U = refTz.bglDropPer1U;

        const myObj = tzArr.find(item => item.name === parent);
        myObj.factor = Number.parseFloat(val);
        myObj.glucosePer1U = Math.round(glucosePer1U / myObj.factor);
        myObj.bglDropPer1U = (bglDropPer1U / myObj.factor);

        StorageService.savePreferences(this.preferences);

        //Have to dynamically re-render because of unknown row numbers
        this.renderTimezoneModelData();
        this.renderTimezoneDayLineChartFromHtml('model');
    },

    //==========================================================================
    //------   [      EVENT LISTENERS - DYNAMIC: BOLUS NO FOOD        ]  -------
    //==========================================================================
    attachBolusNoFoodEventListeners() {
        const tzNoFoodButtons = document.querySelectorAll('#bolus-timezone-raw-stuff-tbody button');
        console.log(tzNoFoodButtons);
        for(const button of tzNoFoodButtons) {
            button.addEventListener('click', () => {
                const logId = button.id;
                StorageService.flagLogOutlier(logId, this.bolusNoFoodTzFiltered);
                this.renderRawBolusNoFoodSections();
            });
        }

        const seasonNoFoodButtons = document.querySelectorAll('#bolus-season-raw-stuff-tbody button');
        console.log(seasonNoFoodButtons);
        for(const button of seasonNoFoodButtons) {
            button.addEventListener('click', () => {
                const logId = button.id;
                StorageService.flagLogOutlier(logId, this.bolusNoFoodTzFiltered);
                this.renderRawBolusNoFoodSections();
            });
        }
    },

    //==========================================================================
    //------   [      EVENT LISTENERS - DYNAMIC: BOLUS REF FOOD        ]  -------
    //==========================================================================
    attachBolusRefFoodEventListeners() {
        const tzRefFoodButtons = document.querySelectorAll('#raw-timezone-raw-stuff-tbody button');
        console.log(tzRefFoodButtons);
        for(const button of tzRefFoodButtons) {
            button.addEventListener('click', () => {
                const logId = button.id;
                StorageService.flagLogOutlier(logId, this.dataSeaTzFiltered);
                this.renderRawRefFoodSections();
            });
        }

        const seasonRefFoodButtons = document.querySelectorAll('#raw-season-raw-stuff-tbody button');
        console.log(seasonRefFoodButtons);
        for(const button of seasonRefFoodButtons) {
            button.addEventListener('click', () => {
                const logId = button.id;
                StorageService.flagLogOutlier(logId, this.dataSeaTzFiltered);
                this.renderRawRefFoodSections();
            });
        }
    },
    
    //==========================================================================
    //---------------   [       MAIN CALC FUNCTION        ]  -------------------
    //==========================================================================
    async calculateAllRaw() {
        console.log('calculating all Raw');
        document.querySelector('#raw-timezone-day-chart .empty-state').classList.remove('hidden');
        document.querySelector('#raw-timezone-line-chart .empty-state').classList.remove('hidden');
        document.querySelector('#raw-season-year-chart .empty-state').classList.remove('hidden');        
        document.querySelector('#raw-season-line-chart .empty-state').classList.remove('hidden');
        
        document.querySelector('#bolus-timezone-day-chart .empty-state').classList.remove('hidden');
        document.querySelector('#bolus-timezone-line-chart .empty-state').classList.remove('hidden');
        document.querySelector('#bolus-season-year-chart .empty-state').classList.remove('hidden');        
        document.querySelector('#bolus-season-line-chart .empty-state').classList.remove('hidden');

        this.loading = true;
        document.getElementById('loading-indicator').classList.remove('hidden');

        this.dataSeaTzFiltered = [];
        this.bolusNoFoodTzFiltered = [];

        await new Promise(resolve => setTimeout(resolve, 100));

        try{
            this.bolusNoFoodTzFiltered = this.calculateBolusNoFoodData();
            console.log(this.bolusNoFoodTzFiltered);
            this.dataSeaTzFiltered = this.calculateRefFoodData();
            console.log(this.dataSeaTzFiltered);

            this.renderRawBolusNoFoodSections();
            this.renderRawRefFoodSections();

        } catch (error) {
            console.error('Error calculating time-of-day data:', error);
            HelpHtml.showMessage('Error calculating time-of-day data', 'error');
        } finally {
            this.loading = false;
            document.getElementById('loading-indicator').classList.add('hidden');
        }
    },

    //==========================================================================
    //-----------   [       MAIN CALC FUNCTION HELPERS       ]  ----------------
    //==========================================================================

    //==========================================
    //----- [  HELPER: BOLUS NO FOOD  ]  -------
    //==========================================
    calculateBolusNoFoodData(){
        const bolusNoFoodData = StorageService.getLogData('bolus no food');
        console.log(bolusNoFoodData);
        const data = [];

        const prefs = this.preferences;
        const tzArr = prefs.timezoneArray;
        const tzRef = tzArr.find(obj => obj.isRef === true);
        const tzRefName = tzRef.name;
        const refSeason = prefs.userSelections.season;
        
        for(let i = 0 ; i < bolusNoFoodData.length ; ++i) {
            const startEntry = bolusNoFoodData[i];
            const endEntry = {
                date: startEntry.endDate,
                logTime: startEntry.endLogTime,
                bgl: startEntry.endBgl,
            };

            const bolusComboObject = HelpComplex.getBolusComboAction(startEntry, endEntry);

            // ESTIMATED INSULIN WITH FACTORS
            //removed influence of seasonal factor - would be feedback loop I think
            const estimatedInsulin = bolusComboObject.bolusIOB;
            const insulinActionRatio = bolusComboObject.bolusRatio;
            const bolusU = bolusComboObject.bolusU;
            const bolusType = bolusComboObject.bolusType;

            // flags for charting
            const seasonRegression = startEntry.season === refSeason? true : false;
            const tzRegression = startEntry.timezone === tzRefName? true : false;
            console.log(tzRegression, startEntry.timezone, startEntry.tzName, tzRefName);

            // FILL DATA
            data.push({
                id: startEntry.id,
                date: startEntry.date,
                timezone: startEntry.timezone,
                season: startEntry.season,
                startTime: startEntry.logTime,
                endTime: endEntry.logTime,
                startBGL: startEntry.bgl,
                endBGL: endEntry.bgl,
                bglChange: startEntry.bglChange,
                glucoseUnit: startEntry.glucoseUnit,
                seasonFactor: startEntry.seasonFactor,
                bolusType: bolusType,
                bolusUnits: bolusU,
                bolusInsulinAction: insulinActionRatio,
                estimatedInsulin: estimatedInsulin,
                tzRegression: tzRegression,
                seasonRegression: seasonRegression,
                outlier: startEntry.outlier === true? true : false,
            });
        }

        return data;        
    },

    //==========================================
    //----- [  HELPER: BOLUS REF FOOD  ]  ------
    //==========================================
    calculateRefFoodData(){
        const TimeDayLogData = StorageService.getLogData('time of day');
        const data = [];
        
        const prefs = this.preferences;
        const tzArr = prefs.timezoneArray;
        const tzRef = tzArr.find(obj => obj.isRef === true);
        const tzRefName = tzRef.name;
        const refSeason = prefs.userSelections.season;
        
        // TIME OF DAY LOG
        for(let i = 0 ; i < TimeDayLogData.length ; ++i) {
            const startEntry = TimeDayLogData[i];
            const endEntry = {
                date: startEntry.endDate,
                logTime: startEntry.endLogTime,
                bgl: startEntry.endBgl,
            };

            // ESTIMATED INSULIN WITH FACTORS
            //removed influence of seasonal factor - would be feedback loop I think
            const bolusComboObject = HelpComplex.getBolusComboAction(startEntry, endEntry);
            const estimatedInsulin = bolusComboObject.bolusIOB/(startEntry.food[0].multiplier);
            const insulinActionRatio = bolusComboObject.bolusRatio;
            const bolusU = bolusComboObject.bolusU;
            const bolusType = bolusComboObject.bolusType;

            // INDEX BGL CHANGE WITH FOOD MULTIPLIER
            const bglChangeIndexed = startEntry.bglChange / startEntry.food[0].multiplier;

            // flags for charting
            const seasonRegression = startEntry.season === refSeason? true : false;
            const tzRegression = startEntry.timezone === tzRefName? true : false;
            console.log(tzRegression, startEntry.timezone, startEntry.tzName, tzRefName);

            // FILL DATA
            data.push({
                id: startEntry.id,
                foodName: startEntry.food[0].name,
                foodMultiplier: startEntry.food[0].multiplier,
                glucoseGPerServing: startEntry.glucoseGPerServing,
                date: startEntry.date,
                timezone: startEntry.timezone,
                season: startEntry.season,
                startTime: startEntry.logTime,
                endTime: endEntry.logTime,
                startBGL: startEntry.bgl,
                endBGL: endEntry.bgl,
                bglChange: bglChangeIndexed,
                glucoseUnit: startEntry.glucoseUnit,
                seasonFactor: startEntry.seasonFactor,
                bolusType: bolusType,
                bolusUnits: bolusU,
                bolusInsulinAction: insulinActionRatio,
                estimatedInsulin: estimatedInsulin,
                tzRegression: tzRegression,
                seasonRegression: seasonRegression,
                outlier: startEntry.outlier === true? true : false,
            });
        }
        return data;
    },    
};

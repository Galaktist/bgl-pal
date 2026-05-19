/*  SLEEP STRUCTURE  
**  ============================================================================
**  DECLARE
**  preferences
**  bglStepMin
**  rawSleepData
**  medianSleepData
**  loading -> boolean
**  
**  ============================================================================
**  RENDERING
**  showOrNoData
**  
**  ============================================================================
**  RENDERING CALCS
**  
**  renderSleepDataTable
**  renderMedianTable
**  
**  ============================================================================
**  RENDERING CALC HELPERS
**  getMedianValueForTable
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC
**  
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  toggleShowData
**  filterSelectedSleepSeason
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC
**  
**  ============================================================================
**  FUNCTIONS - DYNAMIC
**  
**  toggleSleepScoreBackground -> for add/delete wake-up during night
**  logBglData -> helper to above to interpolate a bgl and Log Enter it, then
**  recalculates everything
**  
**  ============================================================================
**  MAIN CALC FUNCTION
**  
**  ============================================================================
**  MAIN CALC HELPERS
**  
**  calculateBasalData -> does most of the calculation 'helping'
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpConvert,
    HelpDateTime,
    HelpSeason,
    HelpLog,
    HelpComplex,
    HelpNum,

} from '../../utils/helpers.js';

import { StorageService } from '../../utils/storage.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================

export const SleepView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    preferences: [],
    bglStepMin: [],
    rawSleepData: [],
    medianSleepData: [],
    loading: false,

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('../../../html/b8Sleep.html')
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
        this.showOrNoData();
        this.calculateAllRaw();
    },

    //---------------- [RENDER 1] ------------------
    showOrNoData(){
        const prefs = this.preferences;
        const show = prefs.userSelections.showBasalSeasonData;

        // set toggle-options for each button
        const showDataButton = document.querySelector('#sleep-data-toggles button[data-action="show-data"]');
        const hideDataButton = document.querySelector('#sleep-data-toggles button[data-action="hide-data"]');
        const rawTimezoneWrapper = document.querySelector('#sleep-data-wrapper');

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

    //==========================================================================
    //-----------------   [       RENDERING CALCS       ]  ---------------------
    //==========================================================================
    renderCalculatedSections() {
        this.renderSleepDataTable();
        this.renderMedianTable();
    },

    //----- [CALC RENDER 1] -----
    renderSleepDataTable() {
        const data = this.rawSleepData;
        console.log(data);
        const bglStepMin = HelpConvert.getBglStepMinLiteral();
        const bglHypo = bglStepMin.hypo;
        const bglHyper = bglStepMin.hyper;
        const tbody = document.getElementById('sleep-data-tbody');
        this.medianSleepData = [];

        tbody.innerHTML = data.map((row, index) => {
            let sleepScore = 2;
            let sleepName = 'good';

            console.log(row, bglHypo, bglHyper);

            if(Number.parseFloat(row.endBGL) <= bglHypo || Number.parseFloat(row.endBGL) >= bglHyper) --sleepScore;
            if(Number.parseFloat(row.midBGL) > 0) --sleepScore;
            
            if(sleepScore === 1) sleepName = 'okay';
            else if(sleepScore === 0) sleepName = 'poor';

            this.medianSleepData.push({
                season: HelpSeason.getDatesSeason(row.date),
                sleepScore: sleepName,
                basalU: row.basalUnits,
            });

            console.log(sleepScore);

            return `
            <tr data-index="${index}" data-sleepIndex="${sleepName}" data-seasonIndex="${HelpSeason.getDatesSeason(row.date)}">
                <td value="${row.date}">${HelpDateTime.dateStrToShortDateStr(row.date)}</td>
                <td>${HelpConvert.displayAsCorrectGlucoseUnit(row.startBGL)}</td>
                <td>${row.basalUnits}</td>
                <td data-index="mid-bgl">${row.midBGL === null? '' : HelpConvert.displayAsCorrectGlucoseUnit(row.midBGL)}</td>
                <td>
                    <button data-index="${index}" class="icon-button tick-style ${row.midBGL? 'active': ''}"></button>
                </td>
                <td data-index="end-bgl">${HelpConvert.displayAsCorrectGlucoseUnit(row.endBGL)}</td>
                <td data-index="sleep-score" class="color-sleep ${sleepName}">${sleepName}</td>
            </tr>
            `;
        }).join('');

        this.filterSelectedSleepSeason();
        this.attachDynamicEventListeners();
    },

    //----- [CALC RENDER 2] -----
    renderMedianTable() {
        const tdataCells = document.querySelectorAll('#median-tbody tr[data-season] td[data-index]');
        for(const item of tdataCells) {
            const element = item;
            const sleepScore = item.dataset.index;
            const season = item.parentElement.dataset.season;
            
            const median = this.getMedianValueForTable(season, sleepScore);
            element.innerHTML = median;
        }
    },

    //==========================================================================
    //--------------   [       RENDERING CALC HELPERS       ]  -----------------
    //==========================================================================
    getMedianValueForTable(season, sleepScore) {
        const dataAll = this.medianSleepData;
        const dataFiltered = [];

        for(let i = 0 ; i < dataAll.length ; ++i) {
            const object = dataAll[i];
            const objSeason = object.season;
            const objSleepScore = object.sleepScore;

            if(objSeason === season && objSleepScore === sleepScore) dataFiltered.push(object.basalU);

            // console.log(season, objSeason, sleepScore, objSleepScore);
        }

        if(dataFiltered.length === 0) return '';
        
        //now sort
        HelpNum.sortNumbers(dataFiltered);
        let median = 0;

        //get middle number in odd number, or middle 2 numbers in even number        
        if((dataFiltered.length % 2) === 1) {
            //ODD NUMBER - WILL WORK WITH ONLY 1
            const indexMid = Math.floor(dataFiltered.length/2);
            median = dataFiltered[indexMid];
            
        } else if((dataFiltered.length % 2) === 0) {
            //EVEN NUMBER - WILL WORK WITH ONLY 2
            const indexMid2 = dataFiltered.length/2;
            const indexMid1 = indexMid2 - 1;
            const med2 = dataFiltered[indexMid2];
            const med1 = dataFiltered[indexMid1];
            median = (med2 + med1)/2;
        }

        return median;
    },

    //==========================================================================
    //-------------   [        EVENT LISTENERS - STATIC        ]  --------------
    //==========================================================================
    attachStaticEventListeners() {
        //------------            show or no buttons             ---------------
        const sleepDataHide = document.querySelectorAll('#sleep-data-toggles button');
        for(const button of sleepDataHide) {
            button.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                const showOrNo = action === 'show-data'? true : false;
                this.toggleShowData(showOrNo);
            });
        }

        const sleepSelector = document.getElementById('sleep-score-selected');
        sleepSelector.addEventListener('change', () => {
            this.filterSelectedSleepSeason();
        });

        const seasonSelector = document.getElementById('season-selected');
        seasonSelector.addEventListener('change', () => {
            this.filterSelectedSleepSeason();
        });
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    toggleShowData(show) {
        const prefs = this.preferences;
        
        // update prefs
        prefs.userSelections.showBasalSeasonData = show;

        //save preferences
        StorageService.savePreferences(this.preferences);
        this.showOrNoData();
    },

    //---------------- [FUNCTION STATIC 2] ------------------
    filterSelectedSleepSeason() {
        const leftButton = document.getElementById('sleep-score-selected');
        const rightButton = document.getElementById('season-selected');
        const leftVal = leftButton.value;
        const rightVal = rightButton.value;
        const allRows = document.querySelectorAll('tr[data-index]');
        
        if(leftVal === '...' && rightVal ===  '...') {
            // case 1: '...' on left and '...' on right => un-hide everything            
            for(const element of allRows) {
                element.classList.remove('hidden');
            }

        } else if(leftVal !== '...' && rightVal === '...') {
            // case 2: cat on left and '...' on right => hide-all then unhide cat
            for(const element of allRows) {
                element.classList.add('hidden');
            }

            const leftToShow = document.querySelectorAll(`tr[data-sleepIndex="${leftVal}"]`);
            for(const element of leftToShow) {
                element.classList.remove('hidden');
            }

        } else if(leftVal === '...' && rightVal !== '...') {
            // case 3: '...' on left and group on right => hide-all then un-hide group
            for(const element of allRows) {
                element.classList.add('hidden');
            }

            const rightToShow = document.querySelectorAll(`tr[data-seasonIndex="${rightVal}"]`);
            for(const element of rightToShow) {
                element.classList.remove('hidden');
            }

        } else if (leftVal !== '...' && rightVal !== '...') {
            // case 4: cat/group means only show if logical && met
            for(const element of allRows) {
                element.classList.add('hidden');
            }

            const leftRightToShow = document.querySelectorAll(`tr[data-sleepIndex="${leftVal}"][data-seasonIndex="${rightVal}"]`);
            for(const element of leftRightToShow) {
                element.classList.remove('hidden');
            }
        }

        return;
    },

    //==========================================================================
    //-------------   [      EVENT LISTENERS - DYNAMIC        ]  ---------------
    //==========================================================================
    attachDynamicEventListeners() {
        //buttons for ticking
        const wokeButton = document.querySelectorAll('#sleep-data-tbody button');
        for(const btn of wokeButton) {
            btn.addEventListener('click', (event) => {
                const clicked = event.target;
                const rowIndex = event.target.dataset.index;

                //need date and logTime of mid also
                this.toggleSleepScoreBackground(clicked, rowIndex);               
            });
        }
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - DYNAMIC        ]  ----------------
    //==========================================================================

    //---------------- [FUNCTION DYNAMIC 1] ------------------
    toggleSleepScoreBackground(clicked, rowIndex) {
        const data = this.rawSleepData;
        const object = data[rowIndex];

        //tick or untick/interpolate to Log or delete
        if(clicked.className.includes('active')) {
            clicked.classList.remove('active');
            this.logBglData(object, 'delete');

        } else {
            clicked.classList.add('active');
            console.log('interpolating');
            this.logBglData(object, 'interpolate');

        }
    },

    //---------------- [HELPER 1.1] ------------------
    logBglData(object, action) {
        const dateKey = object.midNightDate;
        const logTime = object.midNightLogTime;
        const startBgl = object.startBGL;
        const endBgl = object.endBGL;
        const dayLogsArr = StorageService.getRowData(dateKey);
        console.log(dayLogsArr);

        //check if object exists for the 2am default/or real logTime
        const logObject = dayLogsArr.find(obj => obj.logTime === logTime);

        //ensure bgl > 0 if it has been entered, otherwise 'delete' it?
        if (action === 'delete') {
            delete logObject.bgl;
            delete logObject.glucoseUnit;

        } else if(action === 'interpolate' && logObject){
            const interpolatedBgl = 0.5*(startBgl + endBgl);

            logObject.bgl = HelpConvert.storeAsCorrectGlucoseUnit(interpolatedBgl);
            logObject.glucoseUnit = 'mmol/L';

        } else if(action === 'interpolate' && !logObject) {
            const interpolatedBgl = 0.5*(startBgl + endBgl);
            
            dayLogsArr.push({
                date: dateKey,
                logTime: '02:00',
                id: `${dateKey}_02:00`,
                bgl: HelpConvert.storeAsCorrectGlucoseUnit(interpolatedBgl),
                glucoseUnit: 'mmol/L',
            });
        }
        
        //sort to put earliest value at start
        HelpDateTime.sortTimes(dayLogsArr, 'logTime');
        StorageService.saveRowData(dayLogsArr, dateKey);
        this.calculateAllRaw();
    },

    //==========================================================================
    //---------------   [       MAIN CALC FUNCTION        ]  -------------------
    //==========================================================================
    async calculateAllRaw() {
        console.log('calculating all Raw');        
        // document.querySelector('#basal-season-year-chart .empty-state').classList.remove('hidden');        
        // document.querySelector('#basal-season-line-chart .empty-state').classList.remove('hidden');

        this.loading = true;
        document.getElementById('loading-indicator').classList.remove('hidden');

        this.rawSleepData = [];

        await new Promise(resolve => setTimeout(resolve, 100));

        try{
            this.rawSleepData = this.calculateBasalData();
            this.renderCalculatedSections();

        } catch (error) {
            console.error('Error calculating time-of-day data:', error);
            HelpHtml.showMessage('Error calculating time-of-day data', 'error');
        } finally {
            this.loading = false;
            document.getElementById('loading-indicator').classList.add('hidden');
        }
    },

    //==========================================================================
    //---------------   [       MAIN CALC HELPERS        ]  --------------------
    //==========================================================================

    //---------------- [CALC HELPER 1] ------------------    
    calculateBasalData(){
        const basalData = StorageService.getLogData('basal overnight');  
        console.log(basalData);
        const data = [];

        const prefs = this.preferences;
        const tzArr = prefs.timezoneArray;
        const tzRef = tzArr.find(obj => obj.isRef === true);
        const tzRefName = tzRef.name;
        const refSeason = prefs.userSelections.season;
        
        for(let i = 0 ; i < basalData.length ; ++i) {
            const startEntry = basalData[i];
            const basalFlag1 = HelpLog.isLogInMorning(startEntry.logTime)? 'morn' : 'eve';
            const basalFlag2 = HelpLog.isLogInMorning(startEntry.endLogTime)? 'morn' : 'eve';            
            const basalFlag = basalFlag1 + '-to-' + basalFlag2;
            if(basalFlag === 'morn-to-eve') continue;   //don't want day basal

            // INSULIN ACTION RATIO
            const endEntry = {
                date: startEntry.endDate,
                logTime: startEntry.endLogTime,
                bgl: startEntry.endBgl,
            };

            const slowUnits = startEntry.slowU;
            const slowActionRatio = HelpComplex.calculateInsulinAction(
                startEntry, endEntry, 'slow'
            );

            // ESTIMATED INSULIN WITH FACTORS
            //removed influence of seasonal factor - would be feedback loop I think
            const estimatedInsulin = (slowUnits * slowActionRatio);

            // flags for charting
            const seasonRegression = startEntry.season === refSeason? true : false;
            const tzRegression = startEntry.timezone === tzRefName? true : false;
            console.log(tzRegression, startEntry.timezone, tzRefName);

            // FILL DATA
            data.push({
                date: startEntry.date,
                timezone: startEntry.timezone,
                season: startEntry.season,
                startTime: startEntry.logTime,
                endTime: endEntry.logTime,
                startBGL: startEntry.bgl,
                midBGL: startEntry.midNightBgl?? null,
                midNightLogTime: startEntry.midNightLogTime?? '02:00',
                midNightDate: startEntry.midNightDate?? endEntry.date,
                endBGL: endEntry.bgl,
                midnightSnackCount: startEntry.foodCount,
                bglChange: startEntry.bglChange,
                glucoseUnit: startEntry.glucoseUnit,
                seasonFactor: startEntry.seasonFactor,
                basalUnits: slowUnits,
                basalInsulinAction: slowActionRatio,
                estimatedInsulin: estimatedInsulin,
                tzRegression: tzRegression,
                seasonRegression: seasonRegression,
                basalFlag: basalFlag
            });
        }
        return data;
    },    
};

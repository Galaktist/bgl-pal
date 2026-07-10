/*  WEEK PATTERN STRUCTURE  
**  ============================================================================
**  DECLARE
**  
**  currentDate
**  startDateChart
**  endDateChart
**  preferences
**  medianStepRawData
**  medianStepChartData
**  timeInRangeChartData
**  paretoChartData
**  bglStepMinLiteral
**  loading -> boolean
**  
**  ============================================================================
**  RENDERING
**  
**  renderWeekendsButton
**  renderTimeRangeButton
**  renderFromEndDate
**  renderChartDataButton
**  
**  ============================================================================
**  RENDERING CALCS: HTML
**  
**  displayMedianStepResults
**  displayTimeInRangeResults
**  displayParetoResults
**  
**  ============================================================================
**  RENDERING CALCS: CHARTS
**  
**  renderMedianStepChart
**  renderTimeInRangeChart
**  renderParetoPatternChart
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC
**  
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  toggleWeekends
**  toggleTimeRange
**  toggleShowCalcs
**  
**  ============================================================================
**  MAIN CALC FUNCTION
**  
**  ============================================================================
**  MAIN CALC FUNCTION HELPERS
**  
**  HELPER 1: FILL TIMEZONE NAMES
**  HELPER 2: GET AVG/NULL BGL
**  HELPER 3: GET EMPTY TZ ARRAY
**  HELPER 4: INTERPOLATE BGLS
**  HELPER 5: DEAL W WEEKENDS
**  
**  HELPER 7: SAVE CHART DATA
**  
**  ============================================================================
**  MAIN CALC FUNCTION HELPER 6: GET CHART OBJECTS
**  
**  getChartObjects
**    -> getMediansAndTime
**    -> getMedianStepChartData
**    -> getParetoChartData
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpConvert,
    HelpDateTime,
    HelpComplex,
    HelpNum,
    HelpTz,
    HelpSeason,

} from '../../utils/helpers.js';

import { StorageService } from '../../utils/storage.js';
import { ChartComponent } from '../../utils/chart.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================
export const WeekPatternView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    currentDate: null,
    startDateChart: null,
    endDateChart: null,
    preferences: [],
    medianStepRawData: [],
    medianStepChartData: [],
    timeInRangeChartData: [],
    paretoChartData: [],
    bglStepMinLiteral: [],
    loading: false,

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('../../../html/b4WeekPattern.html')
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
        this.bglStepMinLiteral = HelpConvert.getBglStepMinLiteral();
        console.log(this.bglStepMinLiteral);
        this.currentDate = HelpDateTime.getTodayKey();

        //DEFAULT TO TODAY & DUMMY 7 DAYS BACK
        //end date should be finding the last date existing in log data and re-set to max if user enters date after

        this.endDateChart = HelpDateTime.getTodayKey();
        this.startDateChart = HelpDateTime.addDays(this.endDateChart, -7);

        this.renderAllSections();
        this.attachStaticEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {
        this.renderWeekendsButton();
        this.renderTimeRangeButton();
        this.renderFromEndDate();
        this.renderChartDataButton();
        
        this.calculateWeekPattern();
    },

    //---------------- [RENDER 1] ------------------
    renderWeekendsButton() {
        //weekends
        const isIncludeWeekends = this.preferences.userSelections.inclWeekends;
        const yesButton = document.querySelector('#toggle-weekends button[data-value="incl-weekends"]');
        const noButton = document.querySelector('#toggle-weekends button[data-value="excl-weekends"]');

        yesButton.className = 'toggle-option' +
        (isIncludeWeekends? ' active' : '');

        noButton.className = 'toggle-option' +
        (isIncludeWeekends? '' : ' active');
    },

    //---------------- [RENDER 2] ------------------
    renderTimeRangeButton() {
        //time range
        const timeRange = this.preferences.userSelections.weekPatternRange;
        console.log(timeRange, typeof timeRange);
        const weekButton =   document.querySelector('#toggle-time-range button[data-value="week"]');
        const monthButton =  document.querySelector('#toggle-time-range button[data-value="month"]');
        const seasonButton = document.querySelector('#toggle-time-range button[data-value="season"]');
        const yearButton =   document.querySelector('#toggle-time-range button[data-value="year"]');

        weekButton.classList.toggle('active', weekButton.dataset.value === timeRange);
        monthButton.classList.toggle('active', monthButton.dataset.value === timeRange);
        seasonButton.classList.toggle('active', seasonButton.dataset.value === timeRange);
        yearButton.classList.toggle('active', yearButton.dataset.value === timeRange);
    },

    //---------------- [RENDER 3] ------------------
    renderFromEndDate() {
        const datePickEnd = document.getElementById('end-date-picker');
        datePickEnd.value = this.endDateChart;        

        //look up active value and get number of days from that
        const timeRange = this.preferences.userSelections.weekPatternRange;

        // eslint-disable-next-line no-useless-assignment
        let daysGoBack = 0;

        switch(timeRange) {
            case 'week': {
                daysGoBack = 7;
                break;
            }

            case 'month': {
                daysGoBack = 30;
                break;
            }

            case 'season': {
                daysGoBack = 90;
                break;
            }

            case 'year': {
                daysGoBack = 365;
                break;
            }
            default: daysGoBack = Number.parseInt(timeRange)?? 0;
        }

        const datePickStart = document.getElementById('start-date-picker');
        const dateStart = HelpDateTime.addDays(this.endDateChart, -daysGoBack);

        datePickStart.value = dateStart;
        this.startDateChart = dateStart;
        // console.log(datePickStart.value, this.endDateChart);
    },

    //---------------- [RENDER 4] ------------------
    renderChartDataButton() {
        //show chart data
        const isShowWeekCalcs = this.preferences.userSelections.showWeekPatternData;
        // this.toggleShowCalcs(isShowWeekCalcs);
        const showButton = document.querySelector('#toggle-show-data button[data-value="do-show-data"]');
        const noShowButton = document.querySelector('#toggle-show-data button[data-value="no-show-data"]');

        showButton.className = 'toggle-option' +
        (isShowWeekCalcs? ' active' : '');

        noShowButton.className = 'toggle-option' +
        (isShowWeekCalcs? '' : ' active');

        const data = document.getElementById('weekly-pattern-calculations');

        data.classList.toggle('hidden', !isShowWeekCalcs);
    },

    //==========================================================================
    //--------------   [       RENDERING CALCS: HTML      ]  -------------------
    //==========================================================================
    writeCalcsToHtml() {
        this.displayMedianStepResults();
        this.displayTimeInRangeResults();
        this.displayParetoResults();
    },

    //---------------- [RENDER HTML 1] ------------------
    displayMedianStepResults() {
        if(this.medianStepRawData.length === 0) return;

        const tbody = document.getElementById('step-data-tbody');

        tbody.innerHTML = this.medianStepRawData.map(row => `
            <tr>
                <td>${HelpDateTime.dateStrToDate(row.date)}</td>
                <td>${row.timezone}</td>
                <td style="color:${row.interpolated? '#FF9500' : ''}">${HelpConvert.displayAsCorrectGlucoseUnit(row.bgl)}</td>
                <td>${row.step}</td>
            </tr>
        `).join('');
    },

    //---------------- [RENDER HTML 2] ------------------
    displayTimeInRangeResults() {
        if(this.timeInRangeChartData.length === 0) return;

        console.log(this.timeInRangeChartData);

        const tbody = document.getElementById('time-in-range-data-tbody');

        tbody.innerHTML = this.timeInRangeChartData.map(row => `
            <tr>
                <td>${row.step}</td>    
                <td>${row.hours}</td>
            </tr>
        `).join('');

    },

    //---------------- [RENDER HTML 3] ------------------
    displayParetoResults() {
        if(this.paretoChartData.length === 0) return;

        const tbody = document.getElementById('pareto-tbody');

        tbody.innerHTML = this.paretoChartData.map(row => `
            <tr>
                <td>${row.pattern}</td>    
                <td>${row.count}</td>
            </tr>
        `).join('');
    },

    //==========================================================================
    //--------------   [       RENDERING CALCS: CHARTS    ]  -------------------
    //==========================================================================
    createCharts() {
        this.renderMedianStepChart();
        this.renderTimeInRangeChart();
        this.renderParetoPatternChart();
    },

    //---------------- [RENDER CHART 1] ------------------
    renderMedianStepChart() {
        const chartData = this.medianStepChartData;
        console.log(chartData);
        if(chartData.length === 0) return;

        try{
            ChartComponent.drawMedianStepChart('#step-chart .full-state', chartData);
            document.querySelector('#step-chart .empty-state').classList.add('hidden');
        } catch(error) {
            //REMOVE HALF-FORMED
            console.error('error:', error);
            HelpHtml.clearHtmlCode('#step-chart .full-state');
        }        
    },

    //---------------- [RENDER CHART 2] ------------------
    renderTimeInRangeChart() {
        const chartData = this.timeInRangeChartData;
        if(chartData.length === 0) return;

        try{
            ChartComponent.drawTimeInRangePercent('#time-in-range-chart .full-state', chartData);
            document.querySelector('#time-in-range-chart .empty-state').classList.add('hidden');
        }catch(error) {
            console.error('error:', error);
            HelpHtml.clearHtmlCode('#time-in-range-chart .full-state');
        }        
    },

    //---------------- [RENDER CHART 3] ------------------
    renderParetoPatternChart() {
        const chartData = this.paretoChartData;
        if(chartData.length === 0) return;

        try{
            ChartComponent.drawParetoChart('#pareto-chart .full-state', chartData);
            document.querySelector('#pareto-chart .empty-state').classList.add('hidden');
        } catch(error) {
            console.error('an error has occured:', error);
            HelpHtml.clearHtmlCode('#pareto-chart .full-state');
        }
    },

    //==========================================================================
    //-------------   [        EVENT LISTENERS - STATIC        ]  --------------
    //==========================================================================
    attachStaticEventListeners() {        
        //'include weekends'
        const weekendButtons = document.querySelectorAll('#toggle-weekends button');
        for(const btn of weekendButtons) {
            btn.addEventListener('click', () => {
                const action = btn.dataset.value; //excl-weekends or incl-weekends button
                this.toggleWeekends(action);
            });
        }
        
        // week, month, season, year
        const timeRangeButtons = document.querySelectorAll('#toggle-time-range button');
        console.log(timeRangeButtons);
        for(const btn of timeRangeButtons) {
            btn.addEventListener('click', () => {
                const timeRange = btn.dataset.value;
                this.toggleTimeRange(timeRange);
            });
        }

        const timeRangeInput = document.querySelector('#toggle-time-range input');
        console.log(timeRangeInput);
        timeRangeInput.addEventListener('change', (box) => {
            console.log(box.target);
            const timeRange = box.target.value;
            console.log(timeRange);
            this.toggleTimeRange(timeRange);
        });

        // want dashboard to always show latest end day?
        const endDateInput = document.getElementById('end-date-picker');
        endDateInput.addEventListener('change', (event) => {
            // const date = dateInput.value;
            console.log(event.target.value);
            this.endDateChart = event.target.value;
            
            this.renderTimeRangeButton();
            this.renderFromEndDate();
            this.calculateWeekPattern();
        });

        // toggle to show graph data
        const chartDataButtons = document.querySelectorAll('#toggle-show-data button');
        for(const btn of chartDataButtons) {
            btn.addEventListener('click', () => {
                const action = btn.dataset.value; //do-show-data or no-show-data
                this.toggleShowCalcs(action);
            });
        }
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    toggleWeekends(action) {
        console.log('toggled weekends');
        this.preferences.userSelections.inclWeekends = (action === 'incl-weekends');
        
        this.renderWeekendsButton();
        this.calculateWeekPattern();
        
        StorageService.savePreferences(this.preferences);
    },

    //---------------- [FUNCTION STATIC 2] ------------------
    toggleTimeRange(timeRange) {
        this.preferences.userSelections.weekPatternRange = timeRange;

        if(timeRange === 'week' || timeRange === 'month' || timeRange === 'season' || timeRange === 'year') {
            const customButton = document.querySelector('#toggle-time-range input[data-value="custom"]');
            customButton.value = '';
        }

        this.renderTimeRangeButton();
        this.renderFromEndDate();
        this.calculateWeekPattern();

        StorageService.savePreferences(this.preferences);
        console.log(this.preferences);
    },

    //---------------- [FUNCTION STATIC 3] ------------------
    toggleShowCalcs(action) {
        const doShowData = (action === 'do-show-data');        
        this.preferences.userSelections.showWeekPatternData = doShowData;
        this.renderChartDataButton();
        StorageService.savePreferences(this.preferences);
    },

    //==========================================================================
    //---------------   [       MAIN CALC FUNCTION        ]  -------------------
    //==========================================================================
    async calculateWeekPattern() {
        this.loading = true;

        document.getElementById('loading-indicator').classList.remove('hidden');
        document.querySelector('#pareto-chart .empty-state').classList.remove('hidden');
        document.querySelector('#time-in-range-chart .empty-state').classList.remove('hidden');
        document.querySelector('#step-chart .empty-state').classList.remove('hidden');

        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            this.medianStepRawData = [];
            this.medianStepChartData = [];
            this.timeInRangeChartData = [];
            this.paretoChartData = [];
            
            // ------ [       FILTER DATA        ] ------
            // 1 BY TIME RANGE
            //pull out number of days to calculate start date
            const numberOfDaysYear = 454;   // let's go for ~ 1 year, 3 months FOR NOW
            const endDate = this.endDateChart;
            const startDateYear = HelpDateTime.addDays(endDate, -numberOfDaysYear + 1);
            const today = this.currentDate;
            const filteredLogData = StorageService.getLogData('all');

            // 2 FILL TIMEZONE NAMES
            const tzFilledData = this.fillTimezoneNames(filteredLogData);

            // 3 REAL BGL AVGS + VALUES
            const bglFilledData = this.getAvgOrNullBgl(tzFilledData);

            // 4 EMPTY ARRAY WITH ALL TIMEZONES: OVERWRITE WITH REAL DATA IF AVAILABLE
            const dummyArray2 = this.getEmptyTzArray(startDateYear, numberOfDaysYear);
            const dummyArray = structuredClone(dummyArray2);

            // let counter = 0;
            // now take the dummy array and fill it in from the 1entryPerTzArray
            for(let i = 0; i < dummyArray.length; ++i ) {
                const dummyObj = dummyArray[i];
                const dummyTzId = dummyObj.tzId;

                //if last value = null, want to not overwrite
                if(i === dummyArray.length - 1 && bglFilledData.some(obj => obj.tzId === dummyTzId)) {
                    const realLastObj = bglFilledData.find(obj => obj.tzId === dummyTzId);
                    
                    if (realLastObj.bgl === null) {
                        dummyObj.interpolated = true;
                        break;
                    }
                }

                //look for ID in real data and overwrite dummy
                if(bglFilledData.some(obj => obj.tzId === dummyTzId)) {
                    const realObj = bglFilledData.find(obj => obj.tzId === dummyTzId);

                    dummyObj.bgl = realObj.bgl;
                    // ++counter;
                }
            }
            const dummyArray1 = structuredClone(dummyArray);
            
            // 5 INTERPOLATE MISSING BGLS
            //maybe doing whole year so it can fill in dashboard I suspect
            const interpolatedBgls = this.getInterpolatedBgls(dummyArray1);

            // ------ [     CHART DATA FUNCTIONS      ] -----
            
            // ========= STANDARD CHART DATA  ============
            //this is where to remove weekends if so desired
            const dataNoWeekendsMaybe = this.checkAndRemoveWeekends(interpolatedBgls);
            const objectStandard = this.getChartObjects(dataNoWeekendsMaybe, this.startDateChart, this.endDateChart, 'Standard');

            // get season dates
            const seasonObject = HelpSeason.getMostRecentSeasonStartEndDates(today);
            const summ = seasonObject.find(obj => obj.season === 'Summer');
            const wint = seasonObject.find(obj => obj.season === 'Winter');
            const autu = seasonObject.find(obj => obj.season === 'Autumn');
            const spri = seasonObject.find(obj => obj.season === 'Spring');

            const objSummer = this.getChartObjects(dataNoWeekendsMaybe, summ.start, summ.end, 'Summer');
            const objWinter = this.getChartObjects(dataNoWeekendsMaybe, wint.start, wint.end, 'Winter');
            const objAutumn = this.getChartObjects(dataNoWeekendsMaybe, autu.start, autu.end, 'Autumn');
            const objSpring = this.getChartObjects(dataNoWeekendsMaybe, spri.start, spri.end, 'Spring');

            const chartsToSave = [];
            chartsToSave.push(objectStandard, objSummer, objWinter, objAutumn, objSpring);
        
            StorageService.saveChartData(chartsToSave);            
            // const storedChartData = StorageService.getChartData();
            // console.log(storedChartData);

            //save each season's 3 charts
            this.medianStepRawData = objectStandard[1].medianStepRawData;
            this.medianStepChartData = objectStandard[1].medianStepChartData;
            this.timeInRangeChartData = objectStandard[1].timeInRangeChartData;
            this.paretoChartData = objectStandard[1].paretoChartData;

            this.writeCalcsToHtml();
            this.createCharts();
            
        } catch (error) {
            console.error('Error calculating data:', error);
            HelpHtml.showMessage('Error calculating statistics', 'error');
        } finally {
            this.loading = false;
            document.getElementById('loading-indicator').classList.add('hidden');
        }
    },

    //==========================================================================
    //-----------   [       MAIN CALC FUNCTION HELPERS       ]  ----------------
    //==========================================================================

    //==========================================
    //-----[HELPER 1: FILL TIMEZONE NAMES]------
    //==========================================
    fillTimezoneNames(dataUnfilledTzNames) {
        const data = dataUnfilledTzNames;
        // const inclWeekends = this.preferences.userSelections.inclWeekends;
        
        for(let i = 0; i < data.length ; ++i) {
            const object = data[i];

            const log = object.logTime;
            const timezone = HelpTz.getTimesTzName(log);
            object.timezone = timezone;
        }

        return data;
    },

    //==========================================
    //----- [HELPER 2: GET AVG/NULL BGL] -------
    //==========================================
    getAvgOrNullBgl(data) {        
        const oneEntryPerTz = [];
        for(let i = 0; i < data.length; ++i ) {
            const logObject = data[i];
            const date = logObject.date;
            const timezone = logObject.timezone;
            const bgl = logObject.bgl === undefined? null : logObject.bgl;
            const tzMidRange = HelpTz.getTzNamesMidRange(timezone);

            //check if tzId already in oneEntryArray and skip if so
            const tzId = `${date}_${timezone}`;
            const sortId = `${date}_${tzMidRange}`;
            if(oneEntryPerTz.some(obj => obj.tzId === tzId)) continue;           

            // count number of entries with same tz/date & count number of bgl entries
            const oneEntryArray = data.filter(item => {                
                return item.date === date && item.timezone === timezone && bgl !== null;
            });

            // if there's 0 or 1 entry for a timezone, push that 1 into the filtered array
            if(oneEntryArray.length <=1) {
                oneEntryPerTz.push({
                    tzId: tzId,
                    sortId: sortId,
                    date: date,
                    logTime: tzMidRange,
                    timezone: timezone,
                    bgl: bgl
                });
                continue;
            }

            //if length is 2+, want to get average bgl for that timezone if possible
            //then count number of bgl entries inside that filtered array
            let countRealBgls = 0;
            let sumBgls = 0;

            for(const item of oneEntryArray) {
                if(item.bgl && item.bgl !== null) {
                    ++countRealBgls;
                    sumBgls += item.bgl;
                }
            }
            
            if(sumBgls === 0 || countRealBgls === 0) {
                oneEntryPerTz.push({
                    tzId: tzId,
                    sortId: sortId,
                    date: date,
                    logTime: tzMidRange,
                    timezone: timezone,
                    bgl: null
                });
                continue;
                
            } else {
                const avgBgl = sumBgls/countRealBgls;

                oneEntryPerTz.push({
                    tzId: tzId,
                    sortId: sortId,
                    date: date,                    
                    logTime: tzMidRange,
                    timezone: timezone,
                    bgl: avgBgl,
                });
            }
        }
        return oneEntryPerTz;
    },

    //==========================================
    //-----[HELPER 3: GET EMPTY TZ ARRAY] ------
    //==========================================
    getEmptyTzArray(startDate, numberOfDays) {
        const prefs = this.preferences;
        const tzArray = prefs.timezoneArray;
        const tzNameTimeArray = [];
        const data = [];

        //push eg 4-8 names in
        for(let i = 0 ; i < tzArray.length ; ++i) {
            const tzObject = tzArray[i];
            const tzName = tzObject.name;
            const hours = HelpTz.getTzNamesHoursWeight(tzName);
            const night = HelpTz.isTimezoneMiddleAtNight(tzName);
            tzNameTimeArray.push({
                timezone: tzName,
                hours: hours,
                night: night
            });
        }

        //for each single day, push in eg 4-8 empty objects but not on weekends if not selected
        for(let i = 0 ; i < numberOfDays ; ++i) {
            const date = HelpDateTime.addDays(startDate, i);

            for (let j = 0 ; j < tzNameTimeArray.length ; ++j) {
                const tz = tzNameTimeArray[j].timezone;
                const tzMidRange = HelpTz.getTzNamesMidRange(tz);
                const hrs = tzNameTimeArray[j].hours;
                const ngt = tzNameTimeArray[j].night;

                data.push({
                    tzId: `${date}_${tz}`,
                    sortId: `${date}_${tzMidRange}`,
                    date: date,
                    bgl: null,
                    timezone: tz,
                    hours: hrs,
                    night: ngt
                });
            }
        }

        //finally overwrite 1st and last bgl values with target bgl (will get overwritten potentially)
        const targetBgl = this.bglStepMinLiteral.target;

        data[0].bgl = targetBgl;
        data[data.length - 1].bgl = targetBgl;

        return data;
    },

    //==========================================
    //------ [HELPER 4: INTERPOLATE BGLS] ------
    //==========================================
    getInterpolatedBgls(dataNotInterpolated) {
        const data = [...dataNotInterpolated];
        let yStart;
        // if there's an empty bgl, count the number of steps to the next existing bgl, and divide rise/run
        // then multiply to get the interpolation value
        for(let i = 0; i < data.length; ++i ) {
            const obj = data[i];
            //obj.interpolated is null/undefined/false -> set to false
            //obj.interpolated is true -> set to true
            // obj.interpolated = obj.interpolated !== true? false : true;
            // ***** hope this works *****
            obj.interpolated = obj.interpolated?? false;

            if(obj.bgl !== null) {
                yStart = obj.bgl; //will assign 1st value on 1st run through, then hopefully only update every now and then

            } else if(obj.bgl === null){ //will never run on i=0, as that will at least have targetBgl
                
                let yEnd;
                let xRun = 2;   //minimum x run (eg 1 null) is 2, ie real -> null -> real = 2
                
                //interpolate by counting steps to next existing bgl, and make a straight line to it from previous
                //count steps to next bgl and + 1 to get 'run'
                for( let j = 1 ; j < data.length - i ; ++j) {
                    if(data[i + j].bgl === null) {
                        ++xRun;  //if null value - eg run = 3 if there's 2 null in between real values
                    } else if (data[i + j].bgl !== null) {  //once it gets to a real bgl value, use it for interpolation and break out of loop
                        yEnd = data[i + j].bgl;
                        break;
                    }
                }

                //now we have number of steps to fill in with interpolated data
                const yArray = HelpNum.getYsBetweenXs(yEnd, yStart, xRun);
                // console.log(yEnd, yStart, xRun);
                for(let k = 0; k < yArray.length ; ++k) {
                    const index = i + k;
                    // console.log(index);
                    const objectToFill = data[index];
                    objectToFill.bgl = yArray[k];
                    objectToFill.interpolated = true; //to display as interpolated flag later
                }

                //update i so it skips a bunch
                i += yArray.length - 1;
                // console.log(i, yArray.length);
            }
        }
        // console.log('after interpolated: ', data);
        return data;
    },

    //==========================================
    //------ [HELPER 5: DEAL W WEEKENDS] -------
    //==========================================
    checkAndRemoveWeekends(dataWithWeekends) {
        const dataNoWeekends = [];
        const inclWeekends = this.preferences.userSelections.inclWeekends;
        if(inclWeekends) return dataWithWeekends;
        
        for(let i = 0; i < dataWithWeekends.length ; ++i) {
            const object = dataWithWeekends[i];

            // check days
            const dateObj = object.date;
            // const dateObj = new Date(dateStr);
            const dayOfWeek = HelpDateTime.getDayName(dateObj);
            if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
                continue;
            }

            dataNoWeekends.push(object);
        }
        return dataNoWeekends;
    },

    // SKIP TO '6: GET CHART OBJECTS' BELOW, AS LONG
    //==========================================
    //------ [HELPER 7: SAVE CHART DATA] -------
    //==========================================
    saveChartData(data, start, end, key) {
        const chartObjects = this.getChartObjects(data, start, end, key);
        const medianStepRawData = chartObjects.medianStepRawData;
        const medianStepChartData = chartObjects.medianStepChartData;
        const timeInRangeChartData = chartObjects.timeInRangeChartData;
        const paretoChartData = chartObjects.paretoChartData;

        const objectToAdd = [];
        objectToAdd.push(key, {
            medianStepRawData: medianStepRawData,
            medianStepChartData: medianStepChartData,
            timeInRangeChartData: timeInRangeChartData,
            paretoChartData: paretoChartData
        });

        const storedChartData = StorageService.getChartData();

        storedChartData.push(objectToAdd);        
        StorageService.saveChartData(storedChartData);
    },

    //==========================================================================
    //--------   [  MAIN CALC FUNCTION HELPER 6: GET CHART OBJECTS   ]  --------
    //==========================================================================
    getChartObjects(data, start, end, key) {
        // median/time raw
        const medianStepAndTimeInRangeChartData = this.getMediansAndTime(data, start, end);
        
        // median raw data to feed in
        const medianStepRawData = medianStepAndTimeInRangeChartData.medianStepRawData;
        const medianStepChartData = this.getMedianStepChartData(medianStepRawData);
        
        // time in range
        const timeInRangeChartData = medianStepAndTimeInRangeChartData.timeInRangeChartData;

        // pareto things
        const paretoChartData = this.getParetoChartData(medianStepRawData);

        const objectToAdd = [];
        objectToAdd.push(key, {
            medianStepRawData: medianStepRawData,
            medianStepChartData: medianStepChartData,
            timeInRangeChartData: timeInRangeChartData,
            paretoChartData: paretoChartData
        });

        return objectToAdd;
    },

    //================================
    //[SUB-HELPER 6.1: MEDIANS & TIME]
    //================================
    getMediansAndTime(longData, startDateShort, endDate) {
        // console.log(longData, startDateShort, endDate);
        const medianStepRawData = [];
        const timeInRangeChartData = [];
        const hypoBgl = this.bglStepMinLiteral.hypo;
        const hyperBgl = this.bglStepMinLiteral.hyper;
        
        //also total up hours for time in range
        let hypoHours = 0;
        let targetHours = 0;
        let hyperHours = 0;
        
        // eslint-disable-next-line no-useless-assignment
        let skipFlag = null;        
        // eslint-disable-next-line no-useless-assignment
        let step = null;

        //filter the data by date - must be inclusive not exclusive
        const data = HelpComplex.filterByDateRange(longData, new Date(startDateShort), new Date(endDate));
        // console.log(data);

        // if there's an empty bgl, count the number of steps to the next existing bgl, and divide rise/run
        // then multiply to get the interpolation value

        //i < data.length
        for(let i = 0; i < data.length; ++i ) {
            const obj = data[i];
            const bgl = obj.bgl;    //null if empty
            const hours = obj.hours;
            const night = obj.night? 'Night' : 'Day';

            //lo, mid, hi flag
            if(bgl <= hypoBgl) {
                step = 'hypo';
                hypoHours += hours;
                skipFlag = 'hypo' + night;

            } else if(bgl >= hyperBgl) {
                step = 'hyper';
                hyperHours += hours;
                skipFlag = 'hyper' + night;

            } else {
                step = 'target';
                targetHours += hours;
                skipFlag = 'target';
            }

            //fill in the completed entry to the new array
            medianStepRawData.push({
                date: obj.date,
                timezone: obj.timezone,
                hours: obj.hours,
                bgl: bgl,
                step: step,
                night: obj.night,
                skipFlag: skipFlag,
                interpolated: obj.interpolated
            });
        }
        
        //cheeky little array
        const totalHours = hypoHours + targetHours + hyperHours;
        const hypoDayRatio = hypoHours/totalHours;
        const targetDayRatio = targetHours/totalHours;
        const hyperDayRatio = hyperHours/totalHours;

        if(totalHours > 0) {
            timeInRangeChartData.push(
                {step: 'hypo',   hours: Math.round(24*hypoDayRatio)  , ratio: hypoDayRatio,   color: '#ffa600ff', colorClass: 'color-secondary'},
                {step: 'target', hours: Math.round(24*targetDayRatio), ratio: targetDayRatio, color: '#999', colorClass: 'color-tertiary'},
                {step: 'hyper',  hours: Math.round(24*hyperDayRatio) , ratio: hyperDayRatio,  color: '#007AFF', colorClass: 'color-primary'}
            );
        }  
        
        return {medianStepRawData, timeInRangeChartData};
    },

    //================================
    // [SUB-HELPER 6.2: MEDIAN CHART]
    //================================
    getMedianStepChartData(data) {
        const medianStepChartData = [];
        const hypoThreshold = this.bglStepMinLiteral.hypoToTrack;
        const hyperThreshold = this.bglStepMinLiteral.hyperToTrack;
        const tzArray = this.preferences.timezoneArray;

        //count number of dates in the data
        const medianDates = HelpComplex.makeArrayfromValues(data, 'date');
        console.log(medianDates);
        const numberDaysIncluded = new Set(medianDates).size;
        console.log(numberDaysIncluded);

        if(numberDaysIncluded === 0) return medianStepChartData;

        //to get correct x position in the day
        let hoursCount = 0;
        
        for( let i=0; i < tzArray.length ; ++i) {
            const timezone = tzArray[i];
            const tzName = timezone.name;
            const tzHours = HelpTz.getTzNamesHoursWeight(tzName);

            let hypoCount   = 0;
            let targetCount = 0;
            let hyperCount  = 0;

            for(const item of data) {
                if(tzName === item.timezone && item.step === 'hypo')   ++hypoCount;
                if(tzName === item.timezone && item.step === 'target') ++targetCount;
                if(tzName === item.timezone && item.step === 'hyper')  ++hyperCount;
            }

            //count arrays - convert into threshold of every 5 days
            const hypoCountIndexed   = hypoCount   * (5/numberDaysIncluded);   //ie per day then *5 to get 5-day figure
            const targetCountIndexed = targetCount * (5/numberDaysIncluded);
            const hyperCountIndexed  = hyperCount  * (5/numberDaysIncluded);

            const showHypo = hypoCountIndexed >= hypoThreshold? true: false;
            const showHyper = hyperCountIndexed >= hyperThreshold? true: false;
            const showTarget = (targetCountIndexed >= 1)? true: false; //not sure value to set

            medianStepChartData.push({
                xPosition: hoursCount/24,
                timezone: tzName,
                hypos: hypoCountIndexed,
                targets: targetCountIndexed,
                hypers: hyperCountIndexed,
                showHypos: showHypo,
                showTargets: showTarget,
                showHypers: showHyper,
                hours: tzHours
            });

            hoursCount += tzHours;
        }
        return medianStepChartData;
    },

    //================================
    // [SUB-HELPER 6.3: PARETO CHART]
    //================================
    getParetoChartData(data) {
        // PATTERN NAMES TO COUNT
        let longGoodSpell = 0;  //4 in a row in target
        let goodHypo = 0;       //hypo to target
        let goodHyper = 0;      //hyper to target
        let reboundHypo = 0;    //hypo to hyper
        let longHypo = 0;       //2 hypos in a row
        let nightHypo = 0;      //any hypo in night/dawn timezone
        let deadCatHyper = 0;   //hyper to hypo to hyper
        let longDayHyper = 0;   //2+ hypers next to each other
        let longNightHyper = 0; //hyper all night - i.e. go bed/wake up with hyper

        for( let i=0 ; i < data.length - 1; ++i ) {
            let sameFlagsInARowCounter = 0;
            
            const curObj = data[i];
            const curStep = curObj.step;
            const curSkip = curObj.skipFlag;    //eg hypoNight, target, hyperDay, etc.
            
            const nextObj = data[i + 1];
            const nextStep = nextObj.step;
            const nextSkip = nextObj.skipFlag;

            // USE TO SKIP SAME-FLAGS-IN-A-ROW AT END
            // SKIP LOTS OF TARGETS IN A ROW
            // SKIP SEVERAL DAY/NIGHT-HYPO, DAY/NIGHT HYPER IN A ROW
            if(curSkip === nextSkip) {
                ++sameFlagsInARowCounter;

                for (let j = 1 ; j < (data.length - i - 1) ; ++j){
                    const tempCurObj = data[i];
                    const tempCurSkip = tempCurObj.skipFlag;

                    const tempNextObj = data[i + j];
                    const tempNextSkip = tempNextObj.skipFlag;

                    if(tempCurSkip === tempNextSkip) {
                        ++sameFlagsInARowCounter;
                    } else break;
                }
            }            

            // 4 TARGETS IN A ROW
            // eg 8 in a row = 2 long good spells
            if(curStep === 'target') {
                let counter = 1;
                
                for( let j = 1 ; j<(data.length - i - 1) ; ++j) {
                    const tempNextStep = data[i + j].step;

                    if(tempNextStep === 'target') {
                        ++counter;
                    } else {
                        break;
                    }
                }
                const goodCounter = Math.floor(counter/4);
                longGoodSpell += goodCounter;
            }

            // HYPO -> TARGET
            if(curStep === 'hypo' && nextStep === 'target') {
                ++goodHypo;
            }

            // HYPER -> TARGET
            if(curStep === 'hyper' && nextStep === 'target') {
                ++goodHyper;
            }

            // HYPO -> HYPER
            if(curStep === 'hypo' && nextStep === 'hyper') {
                ++reboundHypo;
            }
            // HYPER -> HYPO
            if(curStep === 'hyper' && nextStep === 'hypo') {
                ++deadCatHyper;
            }

            // NIGHT HYPO
            if(curStep === 'hypo' && curStep.isNight) {
                ++nightHypo;
            }

            // 2 HYPOS IN A ROW
            // eg 4 in a row = 2 long hypo
            if(curStep === 'hypo') {
                let counter = 1;
                
                for( let j=1 ; j<(data.length - i - 1) ; ++j) {
                    const tempNextStep = data[i + j].step;

                    if(tempNextStep === 'hypo') {
                        ++counter;
                    } else {
                        break;
                    }
                }
                const longHypoCounter = Math.floor(counter/2);
                longHypo += longHypoCounter;
            }

            // LONG NIGHT OR DAY HYPER
            if(curSkip === 'hyperDay' && nextSkip === 'hyperNight') {
                // LONG NIGHT HYPER
                // ie go to bed with hyper, hyper during night, hyper on wake up
                // if next flag after 1+ hyperNight is hyperDay, longNightHyper + 1                
                hyperLoop: for( let j = 1 ; j<(data.length - i - 1) ; ++j) {
                    const tempNextSkip = data[i + j].skipFlag;

                    // ***** hope this works *****
                    switch(tempNextSkip) {
                        case 'hyperNight': {
                            break;
                        }

                        case 'hyperDay': {
                            ++longNightHyper;
                            break hyperLoop;
                        }

                        case 'target':
                        case 'hypoDay': {
                            break hyperLoop;
                        }
                    }

                    // if(tempNextSkip === 'hyperNight') {
                    //     continue;

                    // } else if (tempNextSkip === 'hyperDay') {
                    //     ++longNightHyper;
                    //     break;

                    // } else if(tempNextSkip === 'target' || tempNextSkip === 'hypoDay')
                    //     break;
                }
            } else if(curSkip === 'hyperDay' && nextSkip === 'hyperDay') {
                // LONG DAY HYPER
                // 2+ hypers in a row during day - divide by 2 and get that integer (eg 4 in a row is 2 long hyper)
                let counter = 1;

                for( let j = 1 ; j<(data.length - i - 1) ; ++j) {
                    const tempNextSkip = data[i + j].skipFlag;

                    if(tempNextSkip === 'hyperDay') {
                        ++counter;
                        continue;

                    } else break;
                }
                const longDayHyperCounter = Math.floor(counter/2);
                longDayHyper += longDayHyperCounter;
            }

            // console.log(sameFlagsInARowCounter);
            i += sameFlagsInARowCounter;
        }

        const paretoAll = [];
        paretoAll.push(
            {pattern: '4 targets in a row :)', count: longGoodSpell, leftY: 'mid', midY: 'mid', rightY: 'mid'},   //4 in a row in target
            {pattern: 'hypo -> target :)', count: goodHypo, leftY: 'low', midY: 'mid', rightY: 'mid'},             //hypo to target
            {pattern: 'hyper -> target :)', count: goodHyper, leftY: 'high', midY: 'mid', rightY: 'mid'},           //hyper to target
            {pattern: 'HYPO -> hyper', count: reboundHypo, leftY: 'low', midY: 'mid', rightY: 'high'},       //hypo to hyper
            {pattern: 'HYPO -> HYPO', count: longHypo, leftY: 'low', midY: 'low', rightY: 'low'},             //2 hypos in a row
            {pattern: 'night HYPO', count: nightHypo, leftY: 'high', midY: 'high', rightY: 'high'},           //any hypo in night/dawn timezone
            {pattern: 'hyper -> HYPO', count: deadCatHyper, leftY: 'high', midY: 'mid', rightY: 'low'},     //hyper to hypo to hyper
            {pattern: 'day hyper -> hyper', count: longDayHyper, leftY: 'high', midY: 'high', rightY: 'high'},     //hyper 10pm-5am, hyper before and after
            {pattern: 'all-night hyper', count: longNightHyper, leftY: 'high', midY: 'high', rightY: 'high'}  //2+ hypers during day
        );

        //SORT BY COUNT > 0 IN REVERSE ORDER
        const paretoFilterOutZero = paretoAll.filter(item => {
            return item.count > 0;
        });
        const paretoChartData = paretoFilterOutZero.toSorted((a, b) => a.count - b.count);

        return paretoChartData;
    },    
};

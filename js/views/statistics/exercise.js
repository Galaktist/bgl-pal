/*  EXERCISE STRUCTURE  
**  ============================================================================
**  DECLARE
**  
**  exerciseData -> for charts
**  exerciseRawFactorsData -> for filling in HTML
**  loading: false -> for showing loading icon
**  
**  ============================================================================
**  RENDERING
**  
**  renderShowDataButton()
**  renderExerciseFactors()
**  
**  ============================================================================
**  RENDERING CALCS
**  
**  renderRawDataTable()
**  renderRawExFactors()
**  calcAndRenderLineChart()
**  renderExerciseBarChart(type) - 'raw' or 'model'
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC
**  for flagging outliers in data table
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC
**  
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  toggleShowData
**  saveExFactorInput
**  hideUnhideFilteredRows
**  
**  ============================================================================
**  MAIN CALC FUNCTION
**  Calculate and then render calcs
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpConvert,
    HelpDateTime,
    HelpComplex,

} from '../../utils/helpers.js';

import { StorageService } from '../../utils/storage.js';
import { ChartComponent } from '../../utils/chart.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================

export const ExerciseView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    exerciseData: [],
    exerciseRawFactorsData: [],
    loading: false,
    preferences: [],

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('b2Exercise.html')
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
        this.renderAllSections();
        this.attachStaticEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {
        this.renderShowDataButton();
        this.renderExerciseFactors();

        // CALCULATIONS SECTION
        this.renderExerciseBarChart('model');
        this.calculateExerciseData();
    },

    //---------------- [RENDER 1] ------------------
    renderShowDataButton() {
        const prefs = this.preferences;
        
        // update prefs
        const show = prefs.userSelections.showExerciseData;
        
        // set toggle-options for each button
        const showDataButton = document.querySelector('#data-toggle button[data-action="show-exercise-data"]');
        const hideDataButton = document.querySelector('#data-toggle button[data-action="hide-exercise-data"]');

        showDataButton.classList.toggle('active', show);
        hideDataButton.classList.toggle('active', !show);

        // toggle show data
        const exerciseData = document.getElementById('raw-data-charts-section');
        exerciseData.classList.toggle('hidden', !show);
    },

    renderExerciseFactors() {
        const prefs = StorageService.getPreferences();
        const exFactorValues = document.querySelectorAll('#exercise-factors-tbody .exercise-factor-input');
        const exFactorArray = prefs.exFactorArray; //{'0 none':1, '1 slow':0.95 etc}

        //Map the default factor values
        for(const element of exFactorValues) {
            const exObj = exFactorArray.find(obj => obj.name === element.dataset.level);
            element.value = exObj.factor;
        }
    },

    //==========================================================================
    //-----------------   [       RENDERING CALCS       ]  ---------------------
    //==========================================================================
    renderRawCalcSections() {
        this.renderRawDataTable();
        this.calcAndRenderLineChart();
        this.renderRawExFactors();
        this.renderExerciseBarChart('raw');
    },

    //----- [CALC RENDER 1] -----
    renderRawDataTable() {
        //don't show all the 0 rows
        // const exercise1to5Data = this.exerciseData.filter(item => item.exercise !== 0);
        const exercise1to5Data = this.exerciseData;
        // console.log(exercise1to5Data);


        const tbody = document.getElementById('exercise-tbody');
        tbody.innerHTML = exercise1to5Data.map(row => `
            <tr class="input-with-tooltip available ${row.outlier? 'outlier' : ''}">
                <td>${HelpDateTime.dateStrToDate(row.date)}</td>
                <td><button class="badge icon-style outset-md" data-level="${row.exId}" id="${row.id}" data-index="chart-cell">${row.exercise}</button></td>
                <td data-index="chart-cell" class="color-exercise-${row.exercise}">${HelpConvert.displayAsCorrectGlucoseUnit(row.bglChange)}</td>
                <td>${row.bolusType}</td>
                <td>${row.bolusType === ''? '' : row.bolusUnits.toFixed(1)}</td>
                <td>${row.bolusType === ''? '' : `${100*row.bolusInsulinAction}%`}</td>
                <td data-index="chart-cell" class="color-exercise-${row.exercise}">${row.bolusType === ''? '' : row.estimatedInsulin.toFixed(1)}
                    <span class="tooltip adjust-right">
                    =[units x action]/[${row.seasonalFactor} x ${row.tzFactor}]</span>
                </td>
            </tr>
        `).join(''); 

        console.log(tbody);

        this.attachDynamicEventListeners();
        // this.calcAndRenderLineChart();
        // this.renderRawExFactors();
        // this.renderExerciseBarChart('raw');
    },

    //----- [CALC RENDER 2] -----
    renderRawExFactors() {
        //---get rid of all tooltips except for 0
        const tooltips = document.querySelectorAll('#exercise-factors-raw-tbody span');

        for(const tip of tooltips) {
            tip.classList.toggle('tooltip', tip.dataset.level === '0 none');
        }
        
        const exFactorsRaw = this.exerciseRawFactorsData;
        console.log(exFactorsRaw);

        const exFactorsAllHtml = document.querySelectorAll('#exercise-factors-raw-tbody input');
        for(const item of exFactorsAllHtml) {
            item.value = '';
        }

        for(const row of exFactorsRaw) {
            const thisExEstimatedFactor = document.querySelector(`#exercise-factors-raw-tbody input[data-level="${row.exName}"]`);
            thisExEstimatedFactor.value = row.exFactor;
            
            if(row.exFactor < 1) {
                const thisExTooltip = document.querySelector(`#exercise-factors-raw-tbody span[data-level="${row.exName}"]`);
                thisExTooltip.classList.add('tooltip');
                thisExTooltip.innerHTML = `more insulin should mean lower bgl ("0 none" & "${row.exName}" should go downwards in chart above), so probably not quite enough data yet`;
            }
        }
    },

    //----- [CALC RENDER 3] -----
    calcAndRenderLineChart() {
        console.log('rerenderingrawlinechart');
        const chartData = this.exerciseData.map(row => ({
            x: row.estimatedInsulin,
            y: row.bglChange,
            opacity: row.bolusInsulinAction,
            exercise: row.exercise,
            exId: row.exId,
            lineClass: `color-exercise-${row.exercise} dashed`,
            circleClass: `color-exercise-${row.exercise} ${row.outlier? 'outlier': ''}`
        }));

        if(chartData.length === 0 ) return;

        try{
            console.log(chartData);
            ChartComponent.createExerciseLines('#raw-exercise-line-chart .full-state', chartData, this.exerciseRawFactorsData = []);

            //hide empty state
            document.querySelector('#raw-exercise-line-chart .empty-state').classList.add('hidden');

        } catch(error) {
            // REMOVE HALF-FORMED CHART
            console.error('error:', error);
            HelpHtml.clearHtmlCode('#raw-exercise-line-chart .full-state');
        }        
    },

    //----- [CALC RENDER 4] -----
    renderExerciseBarChart(type) {
        console.log(type);
        const prefs = StorageService.getPreferences();
        const exFactorArray = prefs.exFactorArray; //{'0 none':1, '1 slow':0.95 etc}
        console.log(exFactorArray);

        const exFactorValues = type === 'raw'?
            document.querySelectorAll('#exercise-factors-raw-tbody input') :
            document.querySelectorAll('#exercise-factors-tbody .exercise-factor-input');

        console.log(exFactorValues);

        const chartData = [];   //{'0 none':1, '1 slow':0.95 etc}

        //Map the factors into chartData, using name mapping from exFactorArray
        for(let i = 0 ; i < exFactorValues.length ; ++i) {
            const element = exFactorValues[i];
            const exObj = exFactorArray.find(obj => obj.name === element.dataset.level);

            if(type !== 'raw') element.value = exObj.factor;

            console.log(type, element, exObj, ':',element.value,':');

            const valToCheck = element?.value;
            const val = valToCheck === ''? 0 : Number.parseFloat(valToCheck);

            if(!(val >= 0)) continue;

            chartData.push({
                x: exObj.intensity,
                y: val,
                // color: HelpEx.getExerciseColor(exObj.intensity),
                barClass: `color-exercise-${exObj.intensity}`
            });

        }
        console.log(chartData, type);

        if(chartData.length === 0 ) return;

        try{            
            ChartComponent.createExerciseBars(
                `${type === 'raw'?
                    '#raw-exercise-bar-chart .full-state' :
                    '#model-exercise-factors-bars .full-state'}`
                , chartData
            );

            //hide the raw placeholders and show the raw graph
            if(type === 'raw') {
                document.querySelector('#raw-exercise-bar-chart .empty-state').classList.add('hidden');
            }

        } catch(error) {
            // REMOVE HALF-FORMED CHART
            console.error('error:', error);
            if(type === 'raw') HelpHtml.clearHtmlCode('#raw-exercise-bar-chart .full-state');
        }        
    },

    //==========================================================================
    //----------------   [     EVENT LISTENERS - DYNAMIC        ]  -------------
    //==========================================================================
    attachDynamicEventListeners() {
        const exButtons = document.querySelectorAll('#exercise-tbody button');
        for(const button of exButtons) {
            button.addEventListener('click', () => {
                const logId = button.id;
                // const food = foodButton.querySelector('span').innerHTML;
                console.log(logId);
                // this.flagLocalOutlier(logId);
                StorageService.flagLogOutlier(logId, this.exerciseData);
                // this.deReRenderRawExercise();
                this.renderRawCalcSections();
            });
        }
    },
    
    //==========================================================================
    //-------------   [        EVENT LISTENERS - STATIC        ]  --------------
    //==========================================================================
    attachStaticEventListeners() {
        const newShowDataButton = document.querySelectorAll('#data-toggle button');
        for(const button of newShowDataButton) {
            button.addEventListener('click', (event) => {
                const action = event.target.dataset.action;    //hide or show season
                const showOrNo = action === 'show-exercise-data'? true : false;
                this.toggleShowData(showOrNo);   //using val to differentiate from .value used in function
            });
        }

        //autosave exFactor changes
        const ExFactorInput = document.querySelectorAll('#exercise-factors-tbody .exercise-factor-input');
        for(const inpt of ExFactorInput) {
            inpt.addEventListener('change', (event) => {
                //data validation: value entered is only to 1dp
                const element = event.target; //gives element on which box clicked eg data-level=0
                const value = event.target.value;  //gives the new value eg 1.5
                this.saveExFactorInput(element, value);
            });
        }
        
        const exFilters = document.querySelectorAll('#exercise-filters button');
        for(const button of exFilters) {
            button.addEventListener('click', () => {
                const exType = button.innerHTML;
                let isFilterOut = true;
                if(button.className.includes('active')) {
                    button.classList.remove('active');
                    isFilterOut = false;
                } else button.classList.add('active');
                
                console.log(exType);
                this.hideUnhideFilteredRows(exType, isFilterOut);
            });
        }
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    toggleShowData(show) {
        const prefs = this.preferences;
        
        // update prefs
        prefs.userSelections.showExerciseData = show;

        //save preferences
        StorageService.savePreferences(this.preferences);
        this.renderShowDataButton();//don't want to recalculate everything
    },

    //---------------- [FUNCTION STATIC 2] ------------------
    saveExFactorInput(element, value) {
        const exFactorArray = this.preferences.exFactorArray;
        const indexName = element.dataset.level;    //eg 0 none

        console.log(exFactorArray); //whole object from prefs
        console.log(indexName); //from html eg 0 none

        //find the object from the array
        const exObj = exFactorArray.find(obj => obj.name === indexName);
        exObj.factor = value;

        //now update the prefs table with the new value
        // exFactorArray[indexName] = value;
        StorageService.savePreferences(this.preferences);
        // this.renderExerciseFactors();
        this.renderExerciseBarChart('model');
    },

    //---------------- [FUNCTION STATIC 3] ------------------
    hideUnhideFilteredRows(exType, isFilterOut) {
        const rowsToFilter = document.querySelectorAll('#exercise-tbody tr');
        console.log(rowsToFilter);

        for(let i = 0; i < rowsToFilter.length ; ++i) {
            const exerciseInt = rowsToFilter[i].querySelector('button').innerHTML;

            console.log(exerciseInt, rowsToFilter[i]);
            if(exerciseInt !== exType) continue;
            
            rowsToFilter[i].classList.toggle('hidden', isFilterOut);
        }
    },

    //==========================================================================
    //---------------   [       MAIN CALC FUNCTION        ]  -------------------
    //==========================================================================
    async calculateExerciseData() {
        this.loading = true;
        document.getElementById('loading-indicator').classList.remove('hidden');

        // show empty state in case calc doesn't work
        document.querySelector('#raw-exercise-line-chart .empty-state').classList.remove('hidden');
        document.querySelector('#raw-exercise-bar-chart .empty-state').classList.remove('hidden');

        //HIDE STUFF HERE BEFORE CALCULATING - THAT WAY IT WON'T BE UNHIDDEN IF CALC 0
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const exLogData = StorageService.getLogData('exercise');
            this.exerciseData = [];

            console.log(exLogData);

            for (let i = 0; i < exLogData.length; ++i) {
                const startEntry = exLogData[i];
                const endEntry = {
                    date: startEntry.endDate,
                    logTime: startEntry.endLogTime,
                    bgl: startEntry.endBgl,
                };

                // ESTIMATED INSULIN WITH FACTORS
                const seasFactor = startEntry.seasonFactor;
                const tzName = startEntry.timezone;
                const tzFactor = startEntry.tzFactor;
                // const exColor = HelpEx.getExerciseColor(startEntry.exercise);

                // INSULIN ACTION RATIO
                const bolusComboObject = HelpComplex.getBolusComboAction(startEntry, endEntry);
                const estimatedInsulin = bolusComboObject.bolusIOB / (seasFactor * tzFactor);
                const insulinActionRatio = bolusComboObject.bolusRatio;
                const bolusU = bolusComboObject.bolusU;
                const bolusType = bolusComboObject.bolusType;

                this.exerciseData.push({
                    id: startEntry.id,
                    exercise: startEntry.exercise,
                    exId: startEntry.exId,
                    date: startEntry.date,
                    timezone: tzName,
                    startTime: startEntry.logTime,
                    endTime: endEntry.logTime,
                    startBGL: startEntry.bgl,
                    endBGL: endEntry.bgl,
                    bglChange: startEntry.bglChange,
                    glucoseUnit: startEntry.glucoseUnit,
                    bolusType: bolusType,
                    bolusUnits: bolusU,
                    bolusInsulinAction: insulinActionRatio,
                    seasonalFactor: seasFactor,
                    tzFactor: tzFactor,
                    estimatedInsulin: estimatedInsulin,
                    outlier: startEntry.outlier === true? true : false,
                });

            }
            if(this.exerciseData.length === 0) return;
            this.renderRawCalcSections();
            
        } catch (error) {
            console.error('Error calculating exercise data:', error);
            HelpHtml.showMessage('Error calculating exercise statistics', 'error');
        } finally {
            this.loading = false;
            document.getElementById('loading-indicator').classList.add('hidden');
        }
    },
};

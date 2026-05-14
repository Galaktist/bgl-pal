/*  MEAL STRUCTURE  
**  ============================================================================
**  DECLARE
**  
**  mealData
**  foodOptions
**  foodCats
**  foodGroups
**  bglStepMin
**  loading -> boolean
**  
**  ============================================================================
**  RENDERING
**  
**  Axis -> always there
**  showDataTable -> simple toggle
**  renderRuleOfThumbArea -> called whenever food area 1 rendered
**  renderRuleOfThumbDropdowns -> all categories available for food data
**  
**  ============================================================================
**  RENDERING CALCS
**  renderChart
**  renderIntercepts
**  renderDataTableColors -> includes dynamic attachment of outlier buttons
**  renderChartDropDownOptions -> foods with enough data
**  
**  ============================================================================
**  RENDERING CALC HELPERS
**  deReRender
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC
**  
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  toggleShowMealData
**  deRenderFoodCharts
**  saveFoodToDatabase
**  greyOutSaveButton
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
    HelpDateTime,
    HelpConvert,
    HelpComplex,

} from '../../utils/helpers.js';

import { StorageService } from '../../utils/storage.js';
import { ChartComponent } from '../../utils/chart.js';
import { ChartOptions } from '../../utils/chartHelpers.js';

export const MealView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    mealData: [],
    foodOptions: [],
    foodCats: [],
    foodGroups: [],
    bglStepMin: [], //call once to get the relevant step/min stuff
    loading: false,

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('../../../html/b1Meal.html')
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
        //had to be set to null to work or it 'remembered' after closing
        ChartOptions.foodPlotUpTo3Data = {};

        this.preferences = StorageService.getPreferences();
        this.bglStepMin = HelpConvert.getBglStepMinFigurative();
        this.renderAllSections();
        this.attachStaticEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {
        this.calculateMealData();
        this.renderAxis();
        this.showDataTable();
        this.renderRuleOfThumbArea();
        this.renderRuleOfThumbDropdowns();
    },

    //---------------- [RENDER 1] ------------------
    renderAxis() {
        const glucoseUnit = this.preferences.userSelections.glucoseUnit;

        const axisLabel = document.getElementById('y-axis-label');        
        axisLabel.textContent = `—   bgl change (${glucoseUnit})   +`;
    },

    //---------------- [RENDER 2] ------------------
    showDataTable() {
        const prefs = this.preferences;
        
        // update prefs
        const show = prefs.userSelections.showMealData;
        
        // set toggle-options for each button
        const showDataButton = document.querySelector('#meal-data-toggle button[data-action="show-data"]');
        const hideDataButton = document.querySelector('#meal-data-toggle button[data-action="hide-data"]');

        showDataButton.classList.toggle('active', show);
        hideDataButton.classList.toggle('active', !show);

        const mealDataCard = document.getElementById('results-section');
        mealDataCard.classList.toggle('hidden', !show);
    },

    //---------------- [RENDER 3] ------------------
    renderRuleOfThumbArea() {
        //GET PREFS
        const prefs = this.preferences;

        // const glucoseUnit = prefs.userSelections.glucoseUnit;
        const refSeason = prefs.userSelections.season;
        const tzArray = prefs.timezoneArray;

        //GET REFS
        const refTz = tzArray.find(item => item.isRef === true).name;

        const heading = document.getElementById('comparison-chart-heading');
        const food = document.getElementById('thumb-food-name');
        // const serving = document.getElementById('thumb-serving-size');
        // const bglRise = document.getElementById('thumb-bgl-rise');
        const insulin = document.getElementById('thumb-insulin-needed');
        // const mealTime = document.getElementById('thumb-snack-category');

        // bglRise.placeholder = glucoseUnit === 'mmol/L'? 'e.g. 5 mmol/L' : 'e.g. 100 mg/dL';

        //get data from above options selector for food1
        // const bglHtml = document.querySelector(`#food-bgl-row [data-index="food-chart-1"]`).textContent;
        const insulinHtml = document.querySelector('#food-insulin-row [data-index="food-chart-1"]').textContent;
        const foodHtml = document.getElementById('food-selected-1').value;

        console.log(refSeason);

        food.value = foodHtml;
        this.greyOutSaveButton(foodHtml);

        insulin.value = insulinHtml;
        // bglRise.value = bglHtml;
        // const refSeasonColor = HelpSeason.getSeasonsColor(refSeason);

        heading.innerHTML = `<span class="color-primary">${foodHtml}</span> data in <span class="color-${refSeason}">
            ${refSeason}</span> for "${refTz}" timezone`;
        console.log(heading);
    },

    //---------------- [RENDER 4] ------------------
    renderRuleOfThumbDropdowns() {
        const htmlCat = document.getElementById('thumb-category');
        const htmlGroup = document.getElementById('thumb-group');
        const htmlGI = document.getElementById('thumb-glycemic-index');

        HelpHtml.mapFoodCatDropdownHtml(htmlCat);
        HelpHtml.mapFoodGroupDropdownHtml(htmlGroup);
        htmlGI.value = 'medium';
    },

    //==========================================================================
    //-----------------   [       RENDERING CALCS       ]  ---------------------
    //==========================================================================

    //----- [CALC RENDER 1] -----
    renderChart(food, buttonId, colorClass) {
        console.log(food, buttonId);
        // console.log(food);
        // document.getElementById('full-state').classList.remove('hidden');
        // //remove old g chart first
        // if(document.getElementById(buttonId)){
            
        //     document.getElementById(buttonId).remove();
        // }

        //data to render if it's "..." is empty
        if(food === '...') {
            console.log('rendering ... plot');
            
            //to render empty intercepts
            ChartComponent.createFoodPlot('meal-chart', [], buttonId);
            
            //to empty html
            document.getElementById(buttonId).remove();

            return; //missing this return before so was running 2x   
        };

        //filter mealData by selected food
        const foodSelectedData = this.mealData.filter(item => item.foodName === food);

        console.log(foodSelectedData);

        const chartData = foodSelectedData.map(row => ({
            x: row.estimatedInsulin,
            y: row.bglChange,
            opacity: Math.max(row.bolusInsulinAction, 0.5),
            lineClass: `${colorClass} dashed`,
            circleClass: `${colorClass} ${row.outlier? 'outlier': ''}`
        }));

        console.log(chartData, buttonId);

        ChartComponent.createFoodPlot('meal-chart', chartData, buttonId);
    },

    //----- [CALC RENDER 2] -----
    renderIntercepts(buttonId) { 
        const bglHtml = document.querySelector(`#food-bgl-row [data-index="${buttonId}"]`);
        const insulinHtml = document.querySelector(`#food-insulin-row [data-index="${buttonId}"]`);        
        const newFoodGraphed = document.querySelector(`#${buttonId} line`);

        console.log(newFoodGraphed);
        
        const xIntercept = newFoodGraphed? newFoodGraphed.getAttribute('x-intercept') : null;
        const yIntercept = newFoodGraphed? newFoodGraphed.getAttribute('y-intercept') : null;

        //if no intercepts available, draw ''
        const insulin = xIntercept === null? '' : xIntercept;
        const bgl     = yIntercept === null? '' : yIntercept;
        
        bglHtml.textContent = bgl === ''? '': HelpConvert.displayAsCorrectGlucoseUnit(bgl);
        insulinHtml.textContent = insulin;
    },  

    //----- [CALC RENDER 3] -----
    renderDataTableColors() {
        const foodDropDowns = document.querySelectorAll('#food-selector select');

        const allRows = document.querySelectorAll('#meal-tbody tr');

        // first get rid of existing colourClass in cell
        // cellsToColor.forEach(row => {
        //     row.classList = '';
        //     // row.parentElement.classList.remove('outlier');
        //     // row.parentElement.classList.remove('available');
        //     // row.parentElement.classList.add('unavailable');
        // })

        //row is available if it's selected on dropdown
        for(const row of allRows) {
            // row.parentElement.classList.remove('outlier');
            row.classList.remove('available');
            row.classList.add('unavailable');
            
            const cells = row.querySelectorAll('[data-index="chart-cell"]');
            for(const cell of cells) {
                cell.classList = '';
            }
        }

        //now put in colours and class as badge background
        for(let i = 0 ; i < foodDropDowns.length ; ++i) {
            const food = foodDropDowns[i].value;
            const colorClass = foodDropDowns[i].classList;

            if(food === '...') continue;

            //label as available for rows
            //label the colorclass for indiv cells
            for(let j = 0; j < allRows.length ; ++j){
                const rowToColor = allRows[j];
                // console.log(rowToColor.dataset.index);
                
                if(rowToColor.dataset.index !== food) continue;
                rowToColor.classList.remove('unavailable');
                rowToColor.classList.add('available');

                const cellsToColor = rowToColor.querySelectorAll('[data-index="chart-cell"]');
                for(const cell of cellsToColor) {
                    cell.classList = colorClass;
                }

                const foodButton = rowToColor.querySelector('button');
                console.log(rowToColor, foodButton);
                foodButton.addEventListener('click', () => {
                    const logId = foodButton.id;
                    const food = foodButton.querySelector('span').innerHTML;
                    console.log(logId);
                    // this.flagLocalOutlier(logId);
                    StorageService.flagLogOutlier(logId, this.mealData);
                    this.deReRender(food);
                });
            };
        }
    },

    //----- [CALC RENDER 4] -----
    renderChartDropDownOptions() {
        const foodDropDowns = document.querySelectorAll('#food-selector select');
        for(const selector of foodDropDowns) {
            selector.innerHTML = this.foodOptions.map(food => {
                return `
                <option>${food}</option>
                `;
            }).join('');
        }
    },

    //----- [CALC RENDER 5] -----
    displayResults() {
        const tbody = document.getElementById('meal-tbody');
        tbody.innerHTML = this.mealData.map(row => `
            <tr data-index="${row.foodName}" class="unavailable ${row.outlier? 'outlier' : ''}">
                <td>${HelpDateTime.dateStrToShortDateStr(row.date)}</td>
                <td><button class="toggle-option outset-md" id="${row.id}"><span data-index="chart-cell">${row.foodName}</span></button></td>
                <td>${row.foodMultiplier.toFixed(1)}</td>
                <td data-index="chart-cell">${HelpConvert.displayAsCorrectGlucoseUnit(row.bglChange)}</td>
                <td>${row.bolusType}</td>
                <td>${row.bolusType === ''? '' : row.bolusUnits.toFixed(1)}</td>
                <td>${row.bolusType === ''? '' : `${(100*row.bolusInsulinAction).toFixed(0)}%`}</td>
                <td data-index="chart-cell">${row.bolusType === ''? '' : row.estimatedInsulin.toFixed(1)}</td>
            </tr>
        `).join('');
    },

    //==========================================================================
    //-----------------   [    RENDERING CALC HELPERS    ]  --------------------
    //==========================================================================
    
    deReRender(food) {
        const food1 = document.getElementById('food-selected-1').value;
        const food2 = document.getElementById('food-selected-2').value;
        const food3 = document.getElementById('food-selected-3').value;
        const food1Class = document.getElementById('food-selected-1').className;
        const food2Class = document.getElementById('food-selected-2').className;
        const food3Class = document.getElementById('food-selected-3').className;
        console.log(food, food1, food1Class, food2, food2Class, food3, food3Class);
        
        this.deRenderFoodCharts();
        console.log(document.getElementById('food-comparison-svg'));
        
        
        console.log(food, food1, food2, food3);
        

        if(food1 === food) {
            console.log('re-rendering 1');
            this.renderChart(food1, 'food-chart-1', food1Class);
            this.renderIntercepts('food-chart-1');
        }
        if(food2 === food) {
            
            this.renderChart(food2, 'food-chart-2', food2Class);
            console.log('running 2x?');
            this.renderIntercepts('food-chart-2');
        }
        if(food3 === food) {
            this.renderChart(food3, 'food-chart-3', food3Class);
            this.renderIntercepts('food-chart-3');
        }

        this.displayResults();
        
        // this.attachDynamicEventListeners();
        this.renderDataTableColors();
        this.renderRuleOfThumbArea();

        return;
    },    

    //==========================================================================
    //-------------   [        EVENT LISTENERS - STATIC        ]  --------------
    //==========================================================================
    attachStaticEventListeners() {
        const dataRawHide = document.querySelectorAll('#meal-data-toggle button');
        for(const button of dataRawHide) {
            button.addEventListener('click', (event) => {
                // const element = event.target; //gives element on which box clicked eg data-season=Summer
                const action = event.target.dataset.action;    //hide or show season
                const showOrNo = action === 'show-data'? true : false;
                // element.classList = 'toggle-option' + show? ' active' : '';
                // console.log('my ExFactorInput:', element, val);
                this.toggleShowMealData(showOrNo);   //using val to differentiate from .value used in function
            });
        }

        //dropdown box menu
        const foodDropDowns = document.querySelectorAll('#food-selector select');
        for(const food of foodDropDowns) {
            food.addEventListener('change', (event) => {
                const food = event.target.value;
                const buttonId = event.target.dataset.index;
                const colorClass = event.target.className;
                console.log(food, buttonId, colorClass);
                this.deRenderFoodCharts();                                
                this.renderChart(food, buttonId, colorClass);
                this.renderIntercepts(buttonId);
                this.renderRuleOfThumbArea();
                this.renderDataTableColors();
                // console.log(food, buttonId, color);
            });
        }

        //save to rule of thumb database
        const saveFoodButton = document.getElementById('thumb-rule-button');
        saveFoodButton.addEventListener('click', () => {
            this.saveFoodToDatabase();
        });

        //disable the button so it can't be saved over - also want tooltip
        const foodCheck = document.getElementById('thumb-food-name');
        foodCheck.addEventListener('blur', () => {
            const foodNameInputToGrey = foodCheck.value;
            this.greyOutSaveButton(foodNameInputToGrey);
        });
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    toggleShowMealData(show) {
        const prefs = this.preferences;
        
        // update prefs
        prefs.userSelections.showMealData = show;

        //save preferences
        StorageService.savePreferences(this.preferences);
        this.showDataTable();//don't want to recalculate everything
    },

    //---------------- [FUNCTION STATIC 2] ------------------
    deRenderFoodCharts() {
        //de-render and then charts will render in next function        
        if(document.getElementById('food-chart-1')) {
            console.log('de-rendering 1');
            console.log(document.getElementById('food-chart-1'));
            document.getElementById('food-chart-1').remove();
        }
        if(document.getElementById('food-chart-2')) {
            console.log('de-rendering 2');
            document.getElementById('food-chart-2').remove();
        }
        if(document.getElementById('food-chart-3')) {
            document.getElementById('food-chart-3').remove();
        }

        //de-render the ticks
        if(document.getElementById('tick-maxes')) {
            console.log('de-rendering ticks');
            document.getElementById('tick-maxes').remove();
            console.log(document.getElementById('tick-maxes'));
        }
    },

    //---------------- [FUNCTION STATIC 3] ------------------
    saveFoodToDatabase() {
        //get prefs like timezone and season
        const prefs = this.preferences;
        const tzArray = prefs.timezoneArray;
        const foods = prefs.foodArray;
        // const seasonArray = prefs.seasonArray;  //factor would just be 1.0 anyway

        //get reference timezone object
        const timezoneRefObj = tzArray.find(item => item.isRef === true);

        //delete not isRef ones
        // const nonIsRefIndex = foods.findIndex(obj => obj.isRef === false);
        // foods.splice(nonIsRefIndex, 1);
        // console.log(foods);

        //get the 1U insulin covers glucose grams for ref tz and season        
        // const insulinTzU = tzArray.find(obj => obj.isRef === true).glucosePer1U;
        // const insulinPerServe = Math.round( 10 * glucoseGrams / insulinTzU) / 10;

        //GET REFS
        // const timezone = timezoneRefObj.name;
        // const season = prefs.userSelections.userSelections.season;

        const foodElement = document.getElementById('thumb-food-name');
        const servingElement = document.getElementById('thumb-serving-size');
        const insulinElement = document.getElementById('thumb-insulin-needed');
        const mealTimeElement = document.getElementById('thumb-category');
        const foodGroupElement = document.getElementById('thumb-group');
        const foodGIElement = document.getElementById('thumb-glycemic-index');
        const notesElement = document.getElementById('thumb-notes');

        const food = foodElement.value;
        const serving = servingElement.value;
        const insulin = insulinElement.value;
        const mealTime = mealTimeElement.value;
        const foodGroup = foodGroupElement.value;
        const foodGI = foodGIElement.value;
        const notes = notesElement.value;

        //check all details are there that need to be there - error message if not
        //also can't have same name, so check that first
        console.log(foods.find(obj => obj.name === food));
        console.log(foods);
        if(foods.some(obj => obj.name === food)) {
            HelpHtml.showMessage('this food already exists in database', 'warning');
            return;
        }
        //now check things aren't empty
        if(!food) {
            HelpHtml.showMessage('enter food name', 'error');
            return;
        }
        //check this serving size attribute for food details
        // if(!serving) {
        //     HelpHtml.showMessage('enter serving size', 'error');
        //     return;
        // }
        if(!insulin) {
            HelpHtml.showMessage('enter units of insulin for 1 serving', 'error');
            return;
        }
        //units of insulin for 1 serving here
        // rule of thumb page is enter glucose grams for 1 serving

        //convert insulin to glucoseGrams using timezone and season de-factoring
        // const tzFactor = timezoneRefObj.factor;
        // const seasonFactor = seasonFactors[season];
        
        //get the 1U insulin covers glucose grams for ref tz        
        const insulinTzU = timezoneRefObj.glucosePer1U;
        const glucoseGPerServing = Math.round( insulin * insulinTzU);


        //if all there (except category etc doesn't matter) save food to database
        foods.push({
            name: food,
            serving: serving,
            glucoseGPerServing: glucoseGPerServing, //convert insulin per serving to 'unchanging' glucose grams per serving
            foodGI: foodGI,
            category: mealTime === '...'? '' : mealTime,
            group: foodGroup === '...'? '' : foodGroup,
            notes: notes
        });
        console.log(glucoseGPerServing);

        //save preferences
        // StorageService.saveFoodArray(foods);

        // const prefs = this.preferences;
        prefs.foodArray = foods;
        StorageService.savePreferences(this.preferences);

        //empty the html table after saving
        foodElement.value = '';
        servingElement.value = '';
        insulinElement.value = '';
        mealTimeElement.value = '';
        notesElement.value = '...';
        foodGroupElement.value = '...';
        foodGIElement.value = 'medium';
        notesElement.value = '';
    },

    //---------------- [FUNCTION STATIC 4] ------------------
    greyOutSaveButton(foodNameInputToGrey) {
        const tooltip = document.querySelector('.tooltip');
        const saveButton = document.getElementById('thumb-rule-button');
        saveButton.disabled = false;
        tooltip.classList.add('hidden');
        
        const foodToCheck = foodNameInputToGrey;
        const prefs = this.preferences;
        const foods = prefs.foodArray;

        if(foods.some(obj => obj.name === foodToCheck)) {
            saveButton.disabled = true;
            tooltip.classList.remove('hidden');
            return;
        }
    },

    //==========================================================================
    //---------------   [       MAIN CALC FUNCTION        ]  -------------------
    //==========================================================================
    async calculateMealData() {
        this.loading = true;
        document.getElementById('loading-indicator').classList.remove('hidden');

        const startTime = performance.now();

        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const Start3 = performance.now();

            const mealLogData = StorageService.getLogData('meal');

            this.mealData = [];
            this.foodOptions = [];

            for(let i = 0 ; i < mealLogData.length ; ++i ) {
                const startEntry = mealLogData[i];
                const endEntry = {
                    date: startEntry.endDate,
                    logTime: startEntry.endLogTime,
                    bgl: startEntry.endBgl,
                };

                // INSULIN ACTION RATIO
                // ESTIMATED INSULIN WITH FACTORS
                const seasFactor = startEntry.seasonFactor;
                const tzFactor = startEntry.tzFactor;
                const bolusComboObject = HelpComplex.getBolusComboAction(startEntry, endEntry);
                const estimatedInsulin = bolusComboObject.bolusIOB / (seasFactor * tzFactor * startEntry.food[0].multiplier);
                const insulinActionRatio = bolusComboObject.bolusRatio;
                const bolusU = bolusComboObject.bolusU;
                const bolusType = bolusComboObject.bolusType;
                
                // INDEX BGL CHANGE WITH FOOD MULTIPLIER
                const bglChangeIndexed = startEntry.bglChange / startEntry.food[0].multiplier;

                if(bolusU === 0) continue;

                // FOOD ARRAY
                //gets array of food options while iterating through more efficient
                if(!this.foodOptions.includes(startEntry.food[0].name)){
                    this.foodOptions.push(startEntry.food[0].name);
                }
                
                // FILL DATA
                this.mealData.push({
                    id: startEntry.id,
                    foodName: startEntry.food[0].name,
                    foodMultiplier: startEntry.food[0].multiplier,
                    date: startEntry.date,
                    timezone: startEntry.timezone,
                    startTime: startEntry.logTime,
                    endTime: endEntry.logTime,
                    startBGL: startEntry.bgl,
                    endBGL: endEntry.bgl,
                    bglChange: bglChangeIndexed,
                    glucoseUnit: startEntry.glucoseUnit,
                    bolusType: bolusType,
                    bolusUnits: bolusU,
                    bolusInsulinAction: insulinActionRatio,
                    seasonalFactor: startEntry.seasonFactor,
                    estimatedInsulin: estimatedInsulin,
                    outlier: startEntry.outlier === true? true : false,
                });
            }
            const End3 = performance.now();
            console.log(`Duration 3: ${End3 - Start3} ms`);

            const Start2 = performance.now();

            this.foodOptions.push('...');
            //sort foodOptions array
            this.foodOptions.sort((a, b) => {
                if(a < b) {
                    return -1;  //a comes first
                }
                if(a > b) {
                    return 1;   //b comes first
                }
                return 0; //they are equal
            });

            const End2 = performance.now();
            console.log(`Duration 2: ${End2 - Start2} ms`);

            const endTime = performance.now();
            console.log(`Duration 3: ${endTime - startTime} ms`);

            this.displayResults();
            this.renderChartDropDownOptions();

        } catch (error) {
            console.error('Error calculating meal data:', error);
            HelpHtml.showMessage('Error calculating meal statistics', 'error');
        } finally {
            this.loading = false;
            document.getElementById('loading-indicator').classList.add('hidden');
        }
        const End4 = performance.now();
        console.log(`Duration 4: ${End4 - startTime} ms`);
    },
};

/*  HOME STRUCTURE  
**  ============================================================================
**  DECLARE:
**  preferences  -> access Stored data and update as needed
**  current date -> to show latest date only
**  logData      -> get all non-blank data from Storage
**  
**  ============================================================================
**  RENDER:
**  v simple -> HiScore, Credits, Message
**
**  Charts   -> uses chart data calculated in 'Week Pattern' and stored; must
**  click into 'Week Pattern' currently to update in Storage...
**
**  StandardSeason -> standard + season medians 
**
**  ============================================================================
**  RENDER HELPERS:
**  getLastDays(data, start, end, key) -> used many times to get 7/30 days ago
**  getMedianValueByUnit(array, unit)  -> helps getLastDays()
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
    HelpSeason,

} from '../utils/helpers.js';

import { StorageService } from '../utils/storage.js';
import { ChartComponent } from '../utils/chart.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================

export const HomeView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    currentDate: null,
    preferences: null,
    logData: null,

    render() {
        //clear the container
        const container = HelpHtml.clearHtmlCode('#view-container');

        //fetch the html file's code with a helper function
        fetch('../../html/a1Home.html')
            .then(myResponse => {
                // Check if the request was successful
                if(!myResponse.ok){
                    throw new Error('HTTP Error');
                }
                
                // Return the response body as text
                return myResponse.text();
            })

            .then(htmlContent => {
            // htmlContent now contains the entire HTML file as a string            
            // You can then parse this HTML string into a DOM object
                // const myParsedText = new DOMParser();
                // const myDoc = myParsedText.parseFromString(htmlContent, "text/html");

                // Now you can manipulate or extract parts of the HTML
                // For example, to get the content of a specific element:
                // const specificElement = myDoc.querySelector('#today-entries');
                //     if (specificElement) {
                //     console.log(specificElement);
                // }

                // You can also insert this content into your current document
                container.innerHTML = htmlContent;
                
                //must run function nested in here because of fetch() function running asynchronously
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
        this.currentDate = HelpDateTime.getTodayKey();
        this.preferences = StorageService.getPreferences();
        this.logData = StorageService.getLogData('no blanks');
        this.renderDashboardData();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================

    renderDashboardData() {
        this.renderHiScore();
        this.renderCredits();
        this.renderMessage();
        this.renderStandardSeason();
        this.renderCharts();

        // this.changePrefsArray();
        // this.deletePrefsArray();
        // console.log(localStorage);

        return;
    },

    //---------------- [RENDER 1] ------------------
    renderHiScore() {
        const button = document.querySelector('[data-value="hi-score"]');
        const logData = this.logData;

        const bglValues = HelpComplex.makeArrayfromValues(logData, 'bgl');
        const bglMax = Math.max(...bglValues);

        const maxInUnit = HelpConvert.displayAsCorrectGlucoseUnit(bglMax);
        const maxValue = maxInUnit * 1000;
        const maxString = maxValue.toString();
        const end = maxString.length;
        const firstBreak = maxString.length - 3;
        const maxToShow = maxString.slice(0, firstBreak)
            + ' '
            + maxString.slice(firstBreak, end);
        button.innerHTML = maxToShow;
        
        return;
    },

    //---------------- [RENDER 2] ------------------
    renderCredits() {
        const button = document.querySelector('[data-value="credits-left"]');
        const logData = this.logData;

        const logDates = HelpComplex.makeArrayfromValues(logData, 'date');
        const logUniqueDates = [...new Set(logDates)];
        
        button.innerHTML = 365 - logUniqueDates.length;
    },

    //---------------- [RENDER 3] ------------------
    renderMessage() {
        const prefsUser = this.preferences.userSelections;
        const msgObj = prefsUser.dashboardMessage;
        const color = msgObj.color?? '';
        const msg = msgObj.msg?? '';

        const msgBox = document.querySelector('[data-value="calculator-status"]');
        msgBox.style.color = color;
        msgBox.innerHTML = msg;
    },

    //---------------- [RENDER 4] ------------------
    renderStandardSeason() {
        // RENDER STANDARD NUMBERS
        const logData = this.logData;
        const today = this.currentDate;
        const daysAgo7 = HelpDateTime.addDays(today, -7);
        const daysAgo30 = HelpDateTime.addDays(today, -30);
        this.getLastDays(logData, daysAgo7, today, 'standard-seven');
        this.getLastDays(logData, daysAgo30, today, 'standard-thirty');

        // RENDER SEASON NUMBERS
        const seasonObject = HelpSeason.getMostRecentSeasonStartEndDates(this.currentDate);
        const summ = seasonObject.find(obj => obj.season === 'Summer');
        const wint = seasonObject.find(obj => obj.season === 'Winter');
        const autu = seasonObject.find(obj => obj.season === 'Autumn');
        const spri = seasonObject.find(obj => obj.season === 'Spring');
        this.getLastDays(logData, spri.start, spri.end, 'spring');
        this.getLastDays(logData, summ.start, summ.end, 'summer');
        this.getLastDays(logData, autu.start, autu.end, 'autumn');
        this.getLastDays(logData, wint.start, wint.end, 'winter');
    },

    //---------------- [RENDER 5] ------------------
    renderCharts() {
        const medianMainData = StorageService.getChartData();
        console.log(medianMainData);
        console.log(medianMainData.length);
        const chartStandard = medianMainData.length > 0? HelpComplex.getObject2ByKey1(medianMainData, 'Standard') : [];
        const chartSummer = medianMainData.length > 0? HelpComplex.getObject2ByKey1(medianMainData, 'Summer') : [];
        const chartWinter = medianMainData.length > 0? HelpComplex.getObject2ByKey1(medianMainData, 'Winter') : [];
        const chartAutumn = medianMainData.length > 0? HelpComplex.getObject2ByKey1(medianMainData, 'Autumn') : [];
        const chartSpring = medianMainData.length > 0? HelpComplex.getObject2ByKey1(medianMainData, 'Spring') : [];

        // STANDARD CHARTS
        // had been set to check length of an object, which didn't work
        // console.log(chartStandard.medianStepChartData.length);
        // console.log(chartStandard?.length);
        if(chartStandard?.medianStepChartData.length > 0) {
            // console.log('its true');
            ChartComponent.drawMedianStepChart('#dash-median-chart', chartStandard.medianStepChartData, true);
            ChartComponent.drawTimeInRangePercent('#dash-time-chart', chartStandard.timeInRangeChartData, true);
            ChartComponent.drawParetoChart('#dash-pattern', chartStandard.paretoChartData, true);
        }
        

        console.log(document.getElementById('dash-pattern'));

        //get N/A bgls for seasons
        const springBglMedian = document.querySelector('tr td[data-value="bgl-spring"]');
        const summerBglMedian = document.querySelector('tr td[data-value="bgl-summer"]');
        const autumnBglMedian = document.querySelector('tr td[data-value="bgl-autumn"]');
        const winterBglMedian = document.querySelector('tr td[data-value="bgl-winter"]');

        // SPRING CHARTS
        if(springBglMedian.innerHTML !== 'N/A') {
            ChartComponent.drawTimeInRangePercent('#time-chart-spring', chartSpring.timeInRangeChartData, true, true);
            ChartComponent.drawMedianStepChart('#median-chart-spring', chartSpring.medianStepChartData, true, true);
            ChartComponent.drawParetoChart('#pattern-chart-spring', chartSpring.paretoChartData, true, true);
        }        

        // SUMMER
        if(summerBglMedian.innerHTML !== 'N/A') {
            console.log(chartSummer);
            ChartComponent.drawTimeInRangePercent('#time-chart-summer', chartSummer.timeInRangeChartData, true, true);
            ChartComponent.drawMedianStepChart('#median-chart-summer', chartSummer.medianStepChartData, true, true);
            ChartComponent.drawParetoChart('#pattern-chart-summer', chartSummer.paretoChartData, true, true);
        }

        // AUTUMN
        if(autumnBglMedian.innerHTML !== 'N/A') {
            ChartComponent.drawTimeInRangePercent('#time-chart-autumn', chartAutumn.timeInRangeChartData, true, true);
            ChartComponent.drawMedianStepChart('#median-chart-autumn', chartAutumn.medianStepChartData, true, true);
            ChartComponent.drawParetoChart('#pattern-chart-autumn', chartAutumn.paretoChartData, true, true);
        }

        // WINTER
        if(winterBglMedian.innerHTML !== 'N/A') {
            ChartComponent.drawTimeInRangePercent('#time-chart-winter', chartWinter.timeInRangeChartData, true, true);
            ChartComponent.drawMedianStepChart('#median-chart-winter', chartWinter.medianStepChartData, true, true);
            ChartComponent.drawParetoChart('#pattern-chart-winter', chartWinter.paretoChartData, true, true);
        }
    },

    //==========================================================================
    //--------------------       [RENDER HELPERS]        -----------------------
    //==========================================================================

    //---------------- [HELPER 1] ------------------
    getLastDays(data, start, end, key) {
        const bolusHtml = document.querySelector(`[data-value="bolus-${key}"]`);
        const basalHtml = document.querySelector(`[data-value="basal-${key}"]`);
        const bglHtml = document.querySelector(`[data-value="bgl-${key}"]`);
        const logDays = HelpComplex.filterByDateRange(data, new Date(start), new Date(end));

        console.log(logDays, key);

        //want unique dates available to sum stuff
        const logDates = HelpComplex.makeArrayfromValues(logDays, 'date');
        const logDateUniques = [...new Set(logDates)];
        const dateBolus = [];
        const dateBasal = [];
        const bglArray = [];

        for(let i = 0; i < logDateUniques.length ; ++i) {
            const dateCheck = logDateUniques[i];

            let sumBolus = 0;
            let sumBasal = 0;

            for(let j = 0 ; j < logDays.length ; ++j) {
                const obj = logDays[j];
                const logDate = obj.date;
                if(logDate !== dateCheck) continue;

                sumBolus += obj.rapidU?? 0;
                sumBolus += obj.mediumU?? 0;
                
                sumBasal += obj.slowU?? 0;

                if(obj.bgl) bglArray.push({
                    date: dateCheck,
                    bgl: obj.bgl
                });
            }

            if(sumBolus !== 0) {
                dateBolus.push({
                    date: dateCheck,
                    uPerDay: sumBolus
                });
            }

            if(sumBasal !== 0) {
                dateBasal.push({
                    date: dateCheck,
                    uPerDay: sumBasal
                });
            }            
        }

        const bglMedian = this.getMedianValueByUnit(bglArray, 'bgl');
        const bolusMedian = this.getMedianValueByUnit(dateBolus, 'uPerDay');
        const basalMedian = this.getMedianValueByUnit(dateBasal, 'uPerDay');

        bolusHtml.innerHTML = bolusMedian;
        basalHtml.innerHTML = basalMedian;
        bglHtml.innerHTML = bglMedian === 'N/A'? 'N/A' : HelpConvert.displayAsCorrectGlucoseUnit(bglMedian);
    },

    //---------------- [HELPER 2] ------------------
    getMedianValueByUnit(array, unit) {
        if(array.length === 0) return 'N/A';
        
        //now sort by unit
        HelpNum.sortNumbers(array, unit);
        let median = 0;

        console.log(array, unit);

        //get middle number in odd number, or middle 2 numbers in even number        
        if((array.length % 2) === 1) {
            //ODD NUMBER - WILL WORK WITH ONLY 1
            const indexMid = Math.floor(array.length/2);
            median = array[indexMid][unit];
            
        } else if((array.length % 2) === 0) {
            //EVEN NUMBER - WILL WORK WITH ONLY 2
            const indexMid2 = array.length/2;
            const indexMid1 = indexMid2 - 1;
            const med2 = array[indexMid2][unit];
            const med1 = array[indexMid1][unit];
            median = (med2 + med1)/2;
        }

        return median;
    },


    //==========================================================================
    //--------------------       [AD HOC CLEANUP - IGNORE]        --------------
    //==========================================================================
    ensureRefFoodInFoodsArray() {
        const prefs = StorageService.getPreferences();
        const foodsArray = prefs.foodArray();
        const refFood = prefs.referenceFood;

        const refFoodInArray = foodsArray.find(obj => obj.name === refFood.name);
        
        if(!refFoodInArray) {
            foodsArray.push(refFood);
            
            // const prefs = this.preferences;
            prefs.foodArray = foodsArray;
            StorageService.savePreferences(this.preferences);
            
            //this function updates prefs on its own - must go after above prefs update
            StorageService.saveFoodToDictionary(refFood);
            
            
            
            // StorageService.saveFoodDictionary(refFood.name);
            // StorageService.saveFoodArray(foodsArray);
            return;
        }

        return;
    },

    changePrefsArray() {
        const prefs = StorageService.getPreferences();
        console.log(prefs);
        
        // CHANGE PREFS ARRAY
        const foodDictionary =
            [
                'apple', 'apricots (dried)', 'bagel', 'baked beans', 'banana', 'banana cake', 'bread (rye)', 'bread (wheat)', 'burger, chips, drink',
                'carrot', 'cashews', 'chicken nuggets', 'choc milk', 'choc rice puffs', 'chocolate', 'cola', 'cookie', 'corn chips', 'cornflakes',
                'cracker', 'croissant', 'donut', 'fish', 'froot loops', 'fruit juice', 'glucose', 'grapes', 'honey',
                'ice cream', 'jelly beans', 'ketchup', 'kiwifruit', 'macaroni & cheese', 'mango', 'milk', 'muesli', 'muffin',
                'noodles (instant)', 'orange', 'peach', 'peanuts', 'pear', 'peas', 'pizza', 'popcorn', 'porridge', 'potato (boiled)',
                'red meat', 'rice cake', 'skittles', 'spaghetti (canned in tomato)', 'spaghetti (boiled)', 'sport drink', 'sucrose', 'sushi',
                'sweet corn', 'sweet potato', 'tortilla', 'wheat biscuit', 'yoghurt (sweetened)', 'yoghurt (unsweetened)'
            ];

        prefs.foodDictionary = foodDictionary;


        const foodArray =
            [
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
            ];

        prefs.foodArray = foodArray; 
        // const newArr = [
        //         {name: 'Summer', factor: 1.0, isRef: true},
        //         {name: 'Autumn', factor: 1.1, isRef: false},
        //         {name: 'Winter', factor: 1.2, isRef: false},
        //         {name: 'Spring', factor: 1.3, isRef: false},
        //     ]

        // prefs.seasonArray = newArr;

        StorageService.savePreferences(prefs);
        console.log(prefs);

    },

    deletePrefsArray() {
        const prefs = StorageService.getPreferences();
        console.log(prefs);
        
        //OLD ONES
        // delete prefs.seasFactors;
        // delete prefs.logArray;
        // delete prefs.bglDropPer1U;
        // delete prefs.dateWeeklyPattern;
        // delete prefs.daylog_TEST_Arr;
        // delete prefs.defaultInsulinType;
        // delete prefs.exFactors;
        // delete prefs.foodMealtimes;
        // delete prefs.glucosePer1U;
        // delete prefs.glucoseReaderArray;
        // delete prefs.insulinArr;
        // delete prefs.logArray;
        // delete prefs.refSelections;
        // delete prefs.seasonFactors;
        // delete prefs.timezoneArr;
        // delete prefs.timezones;
        
        // SAME NAMED ONES
        // delete prefs.bglStepMin;
        // delete prefs.bglWeekPattern;
        // delete prefs.exFactorArray;
        // delete prefs.filteredLogData;
        // delete prefs.foodDictionary;
        // delete prefs.foodsArray;
        // delete prefs.giArray;
        // delete prefs.insulinArray;
        // delete prefs.seasonArray;
        // delete prefs.timezoneArray;

        localStorage.removeItem('food_array');
        // StorageService.savePreferences(prefs);
        // console.log(prefs);
    }
};

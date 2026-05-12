/*  HELPERS STRUCTURE  
**  ============================================================================
**  THEMES
**  initialise + apply
**  
**  ============================================================================
**  UNIT CONVERSIONS
**  mg/dL to mmol/L and vice-versa
**  also getting the correct step, min, max
**  storing all blood sugar values as 'indexed' to mmol/L
**  
**  ============================================================================
**  FAIL MESSAGE
**  purely for a fail message - could clean up to put in HTML  
**  
**  ============================================================================
**  HTML
**  success message
**  clear container
**  map food categories for drop-down option - could put more of these types of
**  helpers in here for clean-up
**  robust check if something is empty (undefined etc.)
**  
**  ============================================================================
**  SEASON
**  getMostRecentSeasonStartEndDates -> for filling in home dashboard with prev
**  season info - i.e. need correct dates for last Summer if it's Summer atm
**  
**  getDatesSeason(dateStr)
**  getSeasonsNextSeason(season)
**  getDatesSeasonFactor(dateStr) -> using linear interpolation to be precise
**  
**  ============================================================================
**  LOG TIME -> all takes log time as argument
**  
**  getLogsProportionOfDay -> for weighting and marking ticks correctly
**  isLogFrom8pmTo5am -> roughly categorise as 'night'
**  isLogFrom12amTo4am -> categorise as a poor night's sleep if waking up now
**  isLogInMorning -> ie 12am-12pm - to categorise basal as morning or eve
**  getLogsTimeofDayColorClass -> for CSS colouring
**  getTimesTzStart -> unused
**  goForwardByHalfTzRange -> used for calculator - assume exercise FX continues
**  getNextLogInLogArray -> unused
**  getPreviousLogInLogArray -> for working out estimate actions for bgl
**  
**  ============================================================================
**  TIMEZONE -> usually use tzName
**  
**  getTzNameColorClass -> for CSS flag
**  isTimezoneMiddleAtNight -> for day/night patterns
**  getTzNamesWeight
**  getTzNamesHoursWeight -> number of hours in 24 hours
**  getTzNamesMinsWeight ->  number of mins in 1440 mins
**  getTzNamesMidRange
**  getTzNamesRangeEnd
**  getTzTimesColor -> maybe obsolete
**  getTzNamesProportionOfDay
**  getGlucosePer1U(food) -> based on time of day/timezone for glucose per 1U
**  getTimesTzUnit(strTime, unit) -> specify what unit is wanted
**  getTimesTzName
**  getTimesNextTzName -> unused
**  getTimesPrevTzName -> unused
**  
**  ============================================================================
**  STRING
**  sortNames alphabetically
**  
**  ============================================================================
**  DATES + TIMES -> too many to go through ;D
**  
**  dateStrToShortDateStr(dateStr)
**  dateStrToDate(dateStr)
**  dateToDateStrKey(date)
**  dateToTimeStr(date)
**  formatDayDateMonth(date)
**  getTodayKey()
**  getNowTime()
**  isToday(dateKey)
**  parseDate(dateKey)
**  addDays(dateKey, days)
**  addYears(dateKey, years)
**  addHours(dateKey, hours)
**  getDateRange(startDate, endDate)
**  secondsSince2016()
**  getMonthName(month)
**  getShortMonthName(month)
**  getShortMonthNameFromStringDate(strDate)
**  getStringSuffixForDate(date)
**  getDayName(date)
**  getShortDayName(date)
**  formatTime(timeStr)
**  calculateTimeDifference(startDate, startTime, endDate, endTime)
**  calculateDaysDifference(startDate, endDate)
**  addHoursToDateTime(startDate, startTime, hours)
**  getTimesNearestIndexTime(baseTime, timeToIndexAdjust)
**  calculateMinutesDifference(timeA, timeB)
**  calculateHoursDifference(timeA, timeB)
**  addMinsToStringTime(strTime, mins)
**  stringTimeToMins(stringTime)
**  minsToStringTime(mins)
**  safeParseFloat(value, defaultValue = 0)
**  safeParseInt(value, defaultValue = 0)
**  sortTimes(array, key)
**  sortLogTimes(array)
**  
**  ============================================================================
**  NUMBERS
**  
**  safeParseFloat(value)
**  safeParseInt(value, defaultValue = 0)
**  strToFloat1dp(value)
**  sortNumbers(array, name)
**  reverseSortNumbers(array, name)
**  getYsBetweenXs(yEnd, yInitial, xJumps) -> used for interpolating efficiently
**  
**  ============================================================================
**  COMPLEX ARRAY HELPERS
**  
**  mergeMultipleArraysById(array1, array2, array3)
**  checkPerformance(runFunction)
**  debounce(func, wait)
**  findObjectById(data, targetId)
**  checkInclusiveRange(checkDate,start, end)
**  filterByDateRange(data, start, end, dateKey = 'date')
**  filterObject3toObject2(data)
**  filterComplexTimeObjects(data)
**  addXObjectsByTime(data, id, unit)
**  keysFromValues(data, valueId)
**  makeArrayfromValues(data, value)
**  findOuterKeyTrue(objObj)
**  getObject2ByKey1(array, key)
**  findOuterKeyBESTEST(Object, innerKey, innerValue)
**  getBolusComboAction(startEntry, endEntry)
**  calculateInsulinAction(startEntry, endEntry, insSpeed)
**  calculateInsulinActionByHours(elapsedHours, insSpeed)
**  insulinArrayByHalfHour(units, insSpeed, startTime)
**  combinedFoodArrayByHalfHour(giHours ,glucoseGrams, startTime)
**  foodArrayByHalfHour(multiplier, food, startTime)
**  insulinFxArrayByHalfHour(firstDate, lastDate, firstLogTime, lastLogTime)
**  chooseBestInsulinForGi(gi)
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import { StorageService } from './storage.js';

//==============================================================================
//--------------------------- [    THEMES   ] ----------------------------------
//==============================================================================
export const HelpTheme = {
    init() {
        const prefs = StorageService.getPreferences();
        const prefUser = prefs.userSelections;

        this.applyTheme(prefUser.darkMode, prefUser.eightiesMode);
    },

    applyTheme(isDark, is80s) {
        if (!isDark && !is80s) {
            document.documentElement.dataset.theme = 'lightModern';
        } else if (isDark && !is80s) {
            document.documentElement.dataset.theme = 'dark';
        } else if(!isDark && is80s) {
            document.documentElement.dataset.theme = 'light80s';
        } else if(isDark && is80s) {
            document.documentElement.dataset.theme = 'dark80s';
        }
    },
};

//==============================================================================
//-------------------         [UNIT CONVERSIONS]         -----------------------
//==============================================================================
export const HelpConvert = {

    mmolToMgdl(mmolValue) {
        Number.parseFloat(mmolValue);
        return Math.round(mmolValue*18);
    },

    mgdlToMmol(mgdlValue) {
        Number.parseFloat(mgdlValue);
        return Math.round(mgdlValue/18*10)/10;
    },

    mmolToMgdlRaw(mmolValue) {
        Number.parseFloat(mmolValue);
        return mmolValue*18;
    },

    mgdlToMmolRaw(mgdlValue) {
        Number.parseFloat(mgdlValue);
        return mgdlValue/18;
    },

    //object of converted values
    convertBglUnits(value, newUnit) {
        Number.parseFloat(value);
        
        if ( newUnit === 'mmol/L' ) {
            return this.mgdlToMmol(value);
        } else if ( newUnit === 'mg/dL' ) {
            return this.mmolToMgdl(value);
        }
        return;
    },

    storeAsCorrectGlucoseUnit(value) {        
        const parsedValue = Number.parseFloat(value);
        const prefs = StorageService.getPreferences();
        const refUnit = prefs.userSelections.glucoseUnit.trim();
        
        if (refUnit === 'mg/dL') {
            return this.mgdlToMmolRaw(parsedValue);  //convert it to mmol (index basically)
        }
        return parsedValue;  //else leave as is
    },

    displayAsCorrectGlucoseUnit(value) {
        const parsedValue = Number.parseFloat(value);
        const prefs = StorageService.getPreferences();
        const refUnit = prefs.userSelections.glucoseUnit.trim();

        if (refUnit === 'mg/dL') {
            return this.mmolToMgdl(parsedValue);   //returns the stored mmol as a mgdl value
        }
        return Math.round(10 * parsedValue) / 10;  //else return to 1dp
    },

    displayAsCorrectInsulinPrecision(value) {
        const parsedValue = Number.parseFloat(value);
        const prefs = StorageService.getPreferences();
        const refPrecision = prefs.userSelections.insulinPrecision; //1, 2, or 10

        return Math.round(refPrecision * parsedValue) / refPrecision;  // eg 2/2 return to nearest 0.5
    },

    getInsulinPrecisionStep() {
        const prefs = StorageService.getPreferences();
        const refPrecision = prefs.userSelections.insulinPrecision; //1, 2, or 10

        return 1/refPrecision;
    },

    getBglStepMinFigurative() {
        const prefs = StorageService.getPreferences();
        const refUnit = prefs.userSelections.glucoseUnit.trim();
        const pattern = prefs.bglWeekPattern;
        const bglStepMin = prefs.bglStepMin;

        const step = bglStepMin.find(obj => obj.glucoseUnit === refUnit).step;
        const min = bglStepMin.find(obj => obj.glucoseUnit === refUnit).min;
        const max = bglStepMin.find(obj => obj.glucoseUnit === refUnit).max;

        const hypo = this.displayAsCorrectGlucoseUnit(pattern.find(obj => obj.id === 'hypo').value);
        const target = this.displayAsCorrectGlucoseUnit(pattern.find(obj => obj.id === 'target').value);
        const hyper = this.displayAsCorrectGlucoseUnit(pattern.find(obj => obj.id === 'hyper').value);
        const hypoToTrack = this.displayAsCorrectGlucoseUnit(pattern.find(obj => obj.id === 'hypo').toTrack);
        const hyperToTrack = this.displayAsCorrectGlucoseUnit(pattern.find(obj => obj.id === 'hyper').toTrack);

        return {
            step: step, min: min, max: max, hypo: hypo, target: target, hyper: hyper,
            unit: refUnit, hypoToTrack: hypoToTrack, hyperToTrack: hyperToTrack
        };   //returns the stored mmol as a mgdl value
    },

    getBglStepMinLiteral() {
        const prefs = StorageService.getPreferences();
        const refUnit = prefs.userSelections.glucoseUnit.trim();
        const pattern = prefs.bglWeekPattern;
        const bglStepMin = prefs.bglStepMin;

        console.log(pattern);
        console.log(bglStepMin);

        const step = bglStepMin.find(obj => obj.glucoseUnit === refUnit).stepIndexed;
        const min = bglStepMin.find(obj => obj.glucoseUnit === refUnit).minIndexed;
        const max = bglStepMin.find(obj => obj.glucoseUnit === refUnit).maxIndexed;

        const hypo = pattern.find(obj => obj.id === 'hypo').value;
        const target = pattern.find(obj => obj.id === 'target').value;
        const hyper = pattern.find(obj => obj.id === 'hyper').value;
        const hypoToTrack = pattern.find(obj => obj.id === 'hypo').toTrack;
        const hyperToTrack = pattern.find(obj => obj.id === 'hyper').toTrack;

        return {step: step, min: min, max: max, hypo: hypo, target: target, hyper: hyper,
            unit: 'mmol/L', hypoToTrack: hypoToTrack, hyperToTrack: hyperToTrack
        };   //returns the stored mmol as a mgdl value
    },    

    treatMmolDefaults(value, unit) {
        if (unit === 'mg/dL') {
            return this.mmolToMgdl(value).toString();   //returns an integer string
        }
        return value.toFixed(1);  //else return to 1dp
    }
};

//==============================================================================
//--------------------         [      HTML      ]         ----------------------
//==============================================================================
export const HelpHtml = {
    
    showMessage(message, type = 'success') {
        //checks for a .message-toast class and selects that CSS thing
        const messageExist = document.querySelector('.message-toast');
        if (messageExist) {
            messageExist.remove();
        }

        //creates new html <div> but don't rename createElement
        /* @type {HTMLDivElement} */
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}-message`;
        messageDiv.textContent = message;
        //links to CSS file - better separation
        messageDiv.classList.add('message-toaster');

        //adds this message as the last part of the body element in the html code
        document.body.append(messageDiv);

        //set toast message style        
        //this makes message slide out and disappear in same 0.3s period, after 3 seconds
        //() = function takes no args - useful to put in a whole function as arg 1
        const autoSlide = 300;
        let autoDelay = 4000;

        switch(type) {
            case 'southern':
            case 'northern': {
                autoDelay = 1500;
                break;                
            }

            case 'error': {
                autoDelay = 10_000;
                break;                
            }

            case 'warning': {
                autoDelay = 6000;
                break;                
            }
        }

        setTimeout(() => {
            messageDiv.style.animation = 'slide-out 0.3s ease';
            setTimeout(() => messageDiv.remove(), autoSlide);
        }, autoDelay);
    },

    //default type = success, if function hasn't specified it
    showMessageOLD(message, type = 'success') {
        
        //checks for a .message-toast class and selects that CSS thing
        const messageExist = document.querySelector('.message-toast');
        if (messageExist) {
            messageExist.remove();
        }

        //creates new html <div> but don't rename createElement
        /* @type {HTMLDivElement} */
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}-message`;
        messageDiv.textContent = message;
        //links to CSS file - better separation
        messageDiv.classList.add('message-toaster');

        //adds this message as the last part of the body element in the html code
        document.body.append(messageDiv);

        //set toast message style        
        //this makes message slide out and disappear in same 0.3s period, after 3 seconds
        //() = function takes no args - useful to put in a whole function as arg 1
        const autoSlide = 300;
        const autoDelay = 4000;
        

        setTimeout(() => {
            messageDiv.style.animation = 'slide-out 0.3s ease';
            setTimeout(() => messageDiv.remove(), autoSlide);
        }, autoDelay);
    },

    //clears contents of an html element id'd by CSS. Good for resetting things
    //eg clear a graph/error msg/data input etc
    //was called clearContainer
    clearHtmlCode(cssSelector) {
        const htmlCode = document.querySelector(cssSelector);
        if (htmlCode) {
            // Set innerHTML to an empty string to remove all children
            htmlCode.innerHTML = '';
        }
        // Return the container element for potential chaining or checks
        return htmlCode;
    },

    clearHtmlFromId(cssSelector) {
        const htmlCode = document.getElementById(cssSelector);
        if (htmlCode) {
            // Set innerHTML to an empty string to remove all children
            htmlCode.innerHTML = '';
        }
        // Return the container element for potential chaining or checks
        return htmlCode;
    },

    //rejigged .createElement to .createHtmlElement
    //returns newly created/configured HTML element, which can be inserted
    // to the DOM (Document Obj model) using methods like appendChild() or insertBefore()

    //@param {number} width
    createHtmlElement(tag, className, content) {
        //tag = eg 'div', 'p' etc
        //className = eg the CSS class name
        //content = plain text content

        /** @type {HTMLElement} */
        const myElement = document.createElement(tag);
        //core of the function - uses the std method to create new HTML element node

        //if className given as an arg, this assigns CSS className to the HTML element
        if (className) myElement.className = className;

        // if content provided, this populates text of html element w given string
        if (content) myElement.textContent = content;

        return myElement;
    },

    //--------------------------- WRAPPERS ---------------------------
    //these are useful for adjusting functions slightly and shorten typing
    //it can make it easier to then just adjust here and abstract away
    confirm(message) {
        return globalThis.confirm(message);
    },

    // robust check if something is null, undefined, string is empty etc.
    isItEmpty(valueStr) {
        let check = false;

        if(valueStr === '') check = true;
        if(valueStr === undefined) check = true;
        if(valueStr === null) check = true;
        if(valueStr.length === 0) check = true;

        return check;
    },

    mapFoodCatDropdownHtml(containerId) {
        const prefs = StorageService.getPreferences();
        const prefObjs = prefs.foodMealTimes;
        const optionsArray = [];
        
        //push in the array beginning with ...
        for(let i = 0 ; i < prefObjs.length ; ++i) {
            if(i===0) optionsArray.push('...');
            const option = prefObjs[i].category;
            optionsArray.push(option);
        }

        containerId.innerHTML = optionsArray.map(item => {
            return `
                <option value="${item}">
                    ${item}
                </option>
                `;
        }).join('');
    },

    mapFoodGroupDropdownHtml(containerId) {
        const prefs = StorageService.getPreferences();
        const prefObjs = prefs.foodGroups;
        const optionsArray = [];
        
        //push in the array beginning with ...
        for(let i = 0 ; i < prefObjs.length ; ++i) {
            if(i===0) optionsArray.push('...');
            const option = prefObjs[i].group;
            optionsArray.push(option);
        }

        containerId.innerHTML = optionsArray.map(item => {
            return `
                <option value="${item}">
                    ${item}
                </option>
                `;                
        }).join('');
    },
};

//==============================================================================
//-------------------         [       SEASON      ]         --------------------
//==============================================================================

export const HelpSeason = {
    getMostRecentSeasonStartEndDates(dateStr) {
        const date = typeof dateStr === 'string'? new Date(dateStr) : dateStr;
        const monthIndex = date.getMonth(); //gives 4 for May
        const year = date.getFullYear(); //gives 4 for May
        
        let season1year;
        let season2year;
        let season3year;        
        let season4yearStart;
        let season4yearEnd;

        const yearAgo = HelpDateTime.addYears(dateStr, -1);
        console.log(yearAgo);
        console.log(year, yearAgo);

        switch(monthIndex) {
            case 11: {
                //IN SEASON 4
                season1year = year;
                season2year = year;
                season3year = year;
                season4yearStart = year - 1;
                season4yearEnd = year;
                break;
            }

            case 0:
            case 1: {
                //IN SEASON 4
                season1year = year - 1;
                season2year = year - 1;
                season3year = year - 1;
                season4yearStart = year - 2;
                season4yearEnd = year - 1;
                break;
            }

            case 2:
            case 3:    
            case 4: {
                //IN SEASON 1
                season1year = year - 1;
                season2year = year - 1;
                season3year = year - 1;
                season4yearStart = year - 1;
                season4yearEnd = year;
                break;
            }

            case 5:
            case 6:    
            case 7: {
                //IN SEASON 2
                season1year = year;
                season2year = year - 1;
                season3year = year - 1;
                season4yearStart = year - 2;
                season4yearEnd = year - 1;
                break;
            }

            case 8:
            case 9:    
            case 10: {
                //IN SEASON 3
                season1year = year;
                season2year = year;
                season3year = year - 1;
                season4yearStart = year - 2;
                season4yearEnd = year - 1;
                break;
            }

            default: return;
        }

        //MAKE THE DATES
        const season1start = new Date(season1year, 2, 1);
        const season1end =   new Date(season1year, 4, 31);
        const season2start = new Date(season2year, 5, 1);
        const season2end =   new Date(season2year, 7, 31);            
        const season3start = new Date(season3year, 8, 1);
        const season3end =   new Date(season3year, 10, 30);
        const season4start = new Date(season4yearStart, 11, 1);
        const season4end =   new Date(season4yearEnd, 1, 28);

        //GET SEASON NAME WHILE AT IT
        const season1 = this.getDatesSeason(season1start);
        const season2 = this.getDatesSeason(season2start);
        const season3 = this.getDatesSeason(season3start);
        const season4 = this.getDatesSeason(season4start);

        //MAKE OBJECT NAMES
        const season1Obj = {season: season1, start: season1start, end: season1end};
        const season2Obj = {season: season2, start: season2start, end: season2end};
        const season3Obj = {season: season3, start: season3start, end: season3end};
        const season4Obj = {season: season4, start: season4start, end: season4end};

        return [ season1Obj, season2Obj, season3Obj, season4Obj ];
    },
    
    getDatesSeason(dateStr) {
        const date = typeof dateStr === 'string'? new Date(dateStr) : dateStr;

        const prefs = StorageService.getPreferences();
        
        const monthIndex = date.getMonth(); //gives 4 for May

        const hemisphere = prefs.userSelections.hemisphere;
        if(hemisphere === 'southern') {
            switch(monthIndex) {
                case 2:
                case 3:
                case 4: {
                    return 'Autumn';
                }

                case 5:
                case 6:
                case 7: {
                    return 'Winter';
                }

                case 8:
                case 9:
                case 10: {
                    return 'Spring';
                }

                case 11:
                case 0:
                case 1: {
                    return 'Summer';
                }
                
                default: return;
            }
        } else if(hemisphere === 'northern') {
            switch(monthIndex) {
                case 2:
                case 3:
                case 4: {
                    return 'Spring';
                }

                case 5:
                case 6:
                case 7: {
                    return 'Summer';
                }

                case 8:
                case 9:
                case 10: {
                    return 'Autumn';
                }

                case 11:
                case 0:
                case 1: {
                    return 'Winter';
                }
                
                default: return;
            }
        }
    },

    getSeasonsNextSeason(season) {
        switch(season) {
            case 'Summer': return 'Autumn';
            case 'Autumn': return 'Winter';
            case 'Winter': return 'Spring';
            case 'Spring': return 'Summer';
            default: return;
        }
    },

    //get the seasonal factor by using linear interpolation
    getDatesSeasonFactor(dateStr) {
        const date = typeof dateStr === 'string'? new Date(dateStr) : dateStr;
        // console.log(date);

        const prefs = StorageService.getPreferences();
        const seasonArray = prefs.seasonArray;

        //season stuff incl factors
        const thisSeason = this.getDatesSeason(date);
        const nextSeason = this.getSeasonsNextSeason(thisSeason);

        const thisSeasonObj = seasonArray.find(obj => obj.name === thisSeason);
        const nextSeasonObj = seasonArray.find(obj => obj.name === nextSeason);

        const thisSeasonFactor = thisSeasonObj['factor'];
        const nextSeasonFactor = nextSeasonObj['factor'];
        
        //manipulate dates
        // const monthIndex = date.getMonth(); //gives 4 for May
        // const day = date.getDate(); //gives 5 for the 5th
        const year = date.getFullYear();    //2025

        const daysDiff = (date1, date2) => Math.ceil( ( date1.getTime() - date2.getTime() ) / (1000 * 60 * 60 * 24) );

        //dates of different mid-seasons (ie peak of seasonal factor)
        const season2mid = new Date(year, 3, 15);  //starts 1st March - eg Autumn mid is Apr 15
        const season3mid = new Date(year, 6, 15);  //starts 1st June - eg Winter mid is Jul 15
        const season4mid = new Date(year, 9, 15);  //starts 1st Sep - eg Spring mid is Oct 15
        const season1mid = new Date(year, 0, 15);  //starts 1st Dec - eg Summer mid is Jan 15

        // console.log(season1mid, season2mid);

        if(date > season1mid && date < season2mid) {
            const seasAmid = season1mid;
            const seasBmid = season2mid;

            const daysFromSeasonA = daysDiff(date, seasAmid);
            const daysBtwnSeasons = daysDiff(seasBmid, seasAmid);
            const seasonPercent = daysFromSeasonA / daysBtwnSeasons;
            return Math.round( 10 * ((1 - seasonPercent) * thisSeasonFactor + seasonPercent * nextSeasonFactor) ) / 10;

        } else if(date >= season2mid && date < season3mid) {
            const seasAmid = season2mid;
            const seasBmid = season3mid;

            const daysFromSeasonA = daysDiff(date, seasAmid);
            const daysBtwnSeasons = daysDiff(seasBmid, seasAmid);
            const seasonPercent = daysFromSeasonA / daysBtwnSeasons;
            return Math.round( 10 * ((1 - seasonPercent) * thisSeasonFactor + seasonPercent * nextSeasonFactor) ) / 10;

        } else if(date >= season3mid && date < season4mid) {
            const seasAmid = season3mid;
            const seasBmid = season4mid;

            const daysFromSeasonA = daysDiff(date, seasAmid);
            const daysBtwnSeasons = daysDiff(seasBmid, seasAmid);
            const seasonPercent = daysFromSeasonA / daysBtwnSeasons;
            return Math.round( 10 * ((1 - seasonPercent) * thisSeasonFactor + seasonPercent * nextSeasonFactor) ) / 10;

        } else if (date >= season4mid || date < season1mid) {
            const seasAmid = season4mid;
            const seasBmid = season1mid;

            const daysFromSeasonA = daysDiff(date, seasAmid);
            const daysBtwnSeasons = daysDiff(seasBmid, seasAmid);
            const seasonPercent = daysFromSeasonA / daysBtwnSeasons;
            return Math.round( 10 * ((1 - seasonPercent) * thisSeasonFactor + seasonPercent * nextSeasonFactor) ) / 10;
        }
    },
};

//==============================================================================
//-------------------         [       LOG TIME         ]         ---------------
//==============================================================================

export const HelpLog = {
    getLogsProportionOfDay(log) {
        const logMins = HelpDateTime.stringTimeToMins(log);
        const dayProportion = Number.parseFloat(logMins/1440);  //gives number from 0-1

        return dayProportion;
    },

    isLogFrom8pmTo5am(log) {
        const logMins = HelpDateTime.stringTimeToMins(log);
        return (logMins < 300 || logMins > 1200? true: false); 
    },

    isLogFrom12pmTo4am(log) {
        const logMins = HelpDateTime.stringTimeToMins(log);
        return (logMins < 240? true: false);
    },

    isLogInMorning(log) {
        const logMins = HelpDateTime.stringTimeToMins(log);
        return (logMins < 720); 
    },

    getLogsTimeofDayColorClass(log) {
        // const opac = opacity? opacity : 0.25;
        //want this set up so that any logs falling in timezone start to end get coloured by the timezone's range

        const mins = HelpDateTime.stringTimeToMins(log);
        const dayPercent = Number.parseInt(12*mins/1440);  //gives number from 0-12

        const zoneColorClassArray = [
            'color-timezone-0',
            'color-timezone-1',
            'color-timezone-2',
            'color-timezone-3',
            'color-timezone-4',
            'color-timezone-5',
            'color-timezone-6',
            'color-timezone-7',
            'color-timezone-8',
            'color-timezone-9',
            'color-timezone-10',
            'color-timezone-11',
            'color-timezone-12',
        ];

        return zoneColorClassArray[dayPercent];
    },

    // currently unused *****
    getTimesTzStart(strTime) {
        const minutes = HelpDateTime.stringTimeToMins(strTime);
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;

        //work out the timezone start based on where it falls in range
        for(let i = 0; i < tzArray.length ; ++i) {
            const tzCurrent = HelpDateTime.stringTimeToMins(tzArray[i].start);
            //eg if 7 timezones, last index =6, if 7 > 6, it's up to midnight
            const tzNext = [i+1] > tzArray.length-1 ? 1440 : HelpDateTime.stringTimeToMins(tzArray[i+1].start);

            if (minutes >= tzCurrent && minutes < tzNext) {
                const tzStart = tzArray[i].start;
                return tzStart;
            }
        }
        return null;
    },

    goForwardByHalfTzRange(time) {
        const thisTz = HelpTz.getTimesTzName(time);
        console.log(time. thisTz);
        //add on minutes in tz
        const minsToAdd = HelpTz.getTzNamesMinsWeight(thisTz);
        const halfMinsToAdd = minsToAdd/2;

        const newTime = HelpDateTime.addMinsToStringTime(time, halfMinsToAdd);

        return newTime;
    },

    // currently unused *****
    getNextLogInLogArray(time) {
        const prefs = StorageService.getPreferences();
        const logArray = prefs.logArray;
        let nextLogToUse;
        
        // just get next log from array - add on date if it goes to next day?
        for(let i = 0 ; i < logArray.length ; ++i) {
            if(i === 0) nextLogToUse = logArray[0];     //overwrite this is next logic dictates
            
            const timeDiff = HelpDateTime.calculateMinutesDifference(logArray[i], time);

            //if logArray time is > Time, use that log
            if(timeDiff > 0) console.log(timeDiff, time, logArray[i]);
            if(timeDiff > 0) {
                nextLogToUse = logArray[i];
                break;  //break as soon as first bigger log found
            }
        }

        return nextLogToUse;
    },

    getPreviousLogInLogArray(time) {
        const prefs = StorageService.getPreferences();
        const logArray = prefs.logArray;
        let prevLogToUse;

        const length = logArray.length;
        
        // just get next log from array - add on date if it goes to next day?
        for(let i = length - 1 ; i >= 0 ; --i) {
            if(i === length - 1) prevLogToUse = logArray[length - 1];     //overwrite this is next logic dictates
            
            const timeDiff = HelpDateTime.calculateMinutesDifference(logArray[i], time);

            //if logArray time is < Time, use that log
            if(timeDiff < 0) console.log(timeDiff, time, logArray[i]);
            if(timeDiff < 0) {
                prevLogToUse = logArray[i];
                break;  //break as soon as first lesser log found
            }
        }

        return prevLogToUse;
    },
};

//==============================================================================
//-------------------         [     TIMEZONE      ]         --------------------
//==============================================================================

export const HelpTz = {
    getTzNameColorClass(tzName) {
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;
        const tzStart = tzArray.find(obj => obj.name === tzName).start;

        const mins = HelpDateTime.stringTimeToMins(tzStart);
        const dayPercent = Number.parseInt(12*mins/1440);  //gives number from 0-12

        const zoneColorClassArray = [
            'color-timezone-0',
            'color-timezone-1',
            'color-timezone-2',
            'color-timezone-3',
            'color-timezone-4',
            'color-timezone-5',
            'color-timezone-6',
            'color-timezone-7',
            'color-timezone-8',
            'color-timezone-9',
            'color-timezone-10',
            'color-timezone-11',
            'color-timezone-12',
        ];

        return zoneColorClassArray[dayPercent];
    },

    isTimezoneMiddleAtNight(tzName) {
        const log = this.getTzNamesMidRange(tzName);
        const logMin = HelpDateTime.stringTimeToMins(log);

        const pm10 = 22 * 60; //10pm at night
        const am5 = 5 * 60;

        return (logMin < am5 && logMin > pm10);
    },

    getTzNamesWeight(tzName) {
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;
        
        const end = this.getTzNamesRangeEnd(tzName);
        const start = tzArray.find(obj => obj.name === tzName).start;

        const minsDiff = HelpDateTime.calculateMinutesDifference(end, start);

        return Math.round(100 * minsDiff/1440) / 100;
    },

    getTzNamesHoursWeight(tzName) {
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;
        
        const end = this.getTzNamesRangeEnd(tzName);
        const start = tzArray.find(obj => obj.name === tzName).start;

        const minsDiff = HelpDateTime.calculateMinutesDifference(end, start);

        return Math.round( 24 * minsDiff/1440);
    },

    getTzNamesMinsWeight(tzName) {
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;
        
        const end = this.getTzNamesRangeEnd(tzName);
        const start = tzArray.find(obj => obj.name === tzName).start;

        const minsDiff = HelpDateTime.calculateMinutesDifference(end, start);

        return minsDiff;
    },


    getTzNamesMidRange(tzName) {
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;
        
        const end = this.getTzNamesRangeEnd(tzName);
        const start = tzArray.find(obj => obj.name === tzName).start;

        const minsDiff = HelpDateTime.calculateMinutesDifference(end, start);

        return HelpDateTime.addMinsToStringTime(start, minsDiff / 2);
    },

    getTzNamesRangeEnd(tzName) {
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;
        
        const objectIndex = tzArray.findIndex(obj => obj.name === tzName);
        const tzNext = [objectIndex+1] > tzArray.length-1 ? '24:00' : tzArray[objectIndex+1].start;

        return tzNext;
    },

    getTzTimesColor(strTime) {
        const tzStartMins = HelpDateTime.stringTimeToMins(strTime);
        const tzDayPercent = Number.parseInt(12*tzStartMins/1440);  //gives number from 0-12

        const zoneColorArray = [
            '#5cff7fff',
            '#76ffe8ff',
            '#00f7ffff',
            '#00a3a8ff',
            '#ae7dffff',
            '#d876ffff',
            '#b700ffff',
            '#6d83ffff',
            '#8100b4ff',
            '#0026ffff',
            '#001aacff',
            '#6200ffff',
            '#320083ff',
        ];

        return zoneColorArray[tzDayPercent];
    },

    getTzNamesProportionOfDay(tzName) {
        const tzLog = this.getTzNamesMidRange(tzName);
        const tzLogMins = HelpDateTime.stringTimeToMins(tzLog);
        const tzDayProportion = Number.parseFloat(tzLogMins/1440);  //gives number from 0-1

        return tzDayProportion;
    },

    getGlucosePer1U(food) {
        const prefs = StorageService.getPreferences();
        const foodArray = prefs.foodArray;        
        const mealTimeArray = prefs.foodMealTimes;
        const tzArray = prefs.timezoneArray;
        let tzGlucosePer1U;

        //just in case, use reference timezone
        const refTz = tzArray.find(obj => obj.isRef === true);
        const refTzMidRange = this.getTzNamesMidRange(refTz.name);        

        const foodObj = foodArray.find(obj => obj.name === food);
        const foodMealTime = foodObj.category;
        
        //if no category assigned yet, use reference timezone time
        if(foodMealTime.length === 0) {
            tzGlucosePer1U = this.getTimesTzUnit(refTzMidRange, 'glucosePer1U');
        } else {
            const mealTime = mealTimeArray.find(obj => obj.category === foodMealTime).time;
            tzGlucosePer1U = this.getTimesTzUnit(mealTime, 'glucosePer1U');
        }

        return tzGlucosePer1U;
    },


    //------------------        TIME        ---------------------
    getTimesTzUnit(strTime, unit) {
        // LOGIC
        // FIND WHERE TIME FALLS IN BETWEEEN 2 TIMEZONE MIDS - CALL TZ1, TZ2
        // CALL UP THE FACTORS FOR THOSE TZS
        // USING MINS, IF IT'S CLOSE TO TZ1, WEIGHT MORE ON TZ1, LESS ON TZ2

        // console.log(strTime, unit);
        const mins = HelpDateTime.stringTimeToMins(strTime);
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;
        const firstTz = tzArray[0];

        for(let i = 0; i < tzArray.length ; ++i) {
            const myTzObj = tzArray[i];    
            const tzHalfRange = HelpTz.getTzNamesMidRange(myTzObj.name);
            const tzHalfRangeMins = HelpDateTime.stringTimeToMins(tzHalfRange);
            const tzUnit = myTzObj[unit];

            //what to do if it falls after last and before 1st timezone
            if (i === tzArray.length - 1) {
                const firstHalfway = HelpTz.getTzNamesMidRange(firstTz.name);
                const firstHalfwayMins = HelpDateTime.stringTimeToMins(firstHalfway);
                const tzNextHalfRangeMins = firstHalfwayMins + 1440;    //eg want 01:00 = (60 + 1440) rather than 60
                const tzNextUnit = firstTz[unit];
                // console.log(firstHalfway, tzNextHalfRangeMins, tzNextUnit); //eg 03:00, want 180, 

                // console.log(tzUnit, tzNextFactor);

                //if the mid-time is eg 00:01, need to add 1440 mins to it to make maths work, otherwise, leave evening mins alone
                // IF EG MINS = 1, 1 < 60, SO ADD 1440 TO GET 1441, TO COMPARE AGAINST 1500 FROM ABOVE
                const minsPlus = mins < HelpDateTime.stringTimeToMins(firstHalfway)? mins + 1440 : mins; 
                // console.log(minsPlus);
                const minsFromTzA = minsPlus - tzHalfRangeMins;
                // console.log(minsFromTzA);
                const minsBtwnMidRange = tzNextHalfRangeMins - tzHalfRangeMins;
                // console.log(minsBtwnTzs);
                const tzRatio = minsFromTzA / minsBtwnMidRange;
                // console.log(tzRatio);

                return Math.round( 10 * ((1 - tzRatio) * tzUnit + tzRatio * tzNextUnit) ) / 10;
            }

            //eg if 7 timezones, last index =6, if 7 > 6, need to go past 24 hours/1440 hours to get to early tomorrow
            const tzNextHalfRange = HelpTz.getTzNamesMidRange(tzArray[i+1].name);
            const tzNextHalfRangeMins = HelpDateTime.stringTimeToMins(tzNextHalfRange);
            const tzNextUnit = tzArray[i+1][unit];

            // console.log(tzNextHalfRange, tzNextHalfRangeMins, tzNextUnit);  //eg 09:00, 540, 2

            if (mins >= tzHalfRangeMins && mins < tzNextHalfRangeMins) {

                const minsFromTzA = mins - tzHalfRangeMins;
                const minsBtwnMidRange = tzNextHalfRangeMins - tzHalfRangeMins;
                const tzRatio = minsFromTzA / minsBtwnMidRange;
                return Math.round( 10 * ((1 - tzRatio) * tzUnit + tzRatio * tzNextUnit) ) / 10;
            }
        }
    },

    getTimesTzName(strTime) {
        const minutes = HelpDateTime.stringTimeToMins(strTime);
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;

        //work out the timezone name based on where it falls in range
        for(let i = 0; i < tzArray.length ; ++i) {
            const tzCurrent = HelpDateTime.stringTimeToMins(tzArray[i].start);
            //eg if 7 timezones, last index =6, if 7 > 6, it's up to midnight
            const tzNext = [i+1] > tzArray.length-1 ? 1440 : HelpDateTime.stringTimeToMins(tzArray[i+1].start);

            if (minutes >= tzCurrent && minutes < tzNext) {
                const name = tzArray[i].name;
                return name;
            }
        }
        return null;
    },

    // unused *****
    getTimesNextTzName(strTime) {
        const minutes = HelpDateTime.stringTimeToMins(strTime);
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;

        //work out the timezone name based on where it falls in range
        for(let i = 0; i < tzArray.length ; ++i) {
            const tzCurrentStart = HelpDateTime.stringTimeToMins(tzArray[i].start);
            //eg if 7 timezones, last index = 6, if 7 > 6, timezone is 0, so 1 is the next timezone
            const tzNextStart = [i+1] > tzArray.length-1 ? tzArray[1].start : HelpDateTime.stringTimeToMins(tzArray[i+1].start);
            const tzNextName = [i+1] > tzArray.length-1 ? tzArray[1].name : tzArray[i+1].name;

            if (minutes >= tzCurrentStart && minutes < tzNextStart) {
                return tzNextName;
            }
        }
        return null;
    },

    // unused *****
    getTimesPrevTzName(strTime) {
        const minutes = this.stringTimeToMins(strTime);
        const prefs = StorageService.getPreferences();
        const tzArray = prefs.timezoneArray;

        //work out the timezone name based on where it falls in range
        for(let i = 1; i < tzArray.length ; ++i) {
            const tzCurrentStart = HelpDateTime.stringTimeToMins(tzArray[i].start);
            //eg if 7 timezones, last index = 6, if -1 < 0, timezone is 0, so 6 is the previous timezone
            const tzPrevStart = [i-1] < 0 ? tzArray[tzArray.length - 1].start : HelpDateTime.stringTimeToMins(tzArray[i-1].start);
            const tzPrevName = [i-1] < 0 ? tzArray[tzArray.length - 1].name : tzArray[i-1].name;

            if (minutes >= tzPrevStart && minutes < tzCurrentStart) {
                return tzPrevName;
            }
        }
        return null;
    },
};

//==============================================================================
//-------------------         [      STRING       ]         --------------------
//==============================================================================

export const HelpString = {
    sortNames(array, name) {
        
        if(name) {
            array.sort((a, b) => {
                const aCheck = a[`${name}`];
                const bCheck = b[`${name}`];
            
                if(aCheck < bCheck) {
                    return -1;  //a is first
                }
                if(aCheck > bCheck) {
                    return 1; //b is first
                }
                return 0;   //group is same
            });

        } else {
            array.sort((a, b) => {

                if(a < b) {
                    return -1;  //a is first
                }
                if(a > b) {
                    return 1; //b is first
                }
                return 0;   //group is same
            });
        }        
    },
};

//==============================================================================
//------------------         [      DATES + TIMES      ]         ---------------
//==============================================================================

export const HelpDateTime = {

    // unused *****
    parseTime(hours, minutes) {
        let hrs = hours.toString();
        let mins = minutes.toString();

        hrs = hrs.length === 1? '0' + hrs : hrs;
        mins = mins.length === 1? '0' + mins : mins;

        return hrs + ':' + mins;
    },

    parseCsvTime(timeStr) {
        const timeLength = timeStr.length;

        switch(timeLength) {
            //good already eg 13:30
            case 5: return timeStr;
            
            //correction for eg 7:30
            case 4: return '0' + timeStr;            

            //eg 13:30:00
            case 8: return timeStr.slice(0,5);

            default: return null;
        }
    },

    //--- date functions ---
    dateStrToShortDateStr(dateStr) {
        const d = this.dateStrToDate(dateStr);
        console.log(d.length);

        // if(d.length > 11) return d.slice(0, 6);
        // else return d.slice(0,5);

        return d.length > 11? d.slice(0,6) : d.slice(0,5);
    },

    dateStrToDate(dateStr) {
        const date = new Date(dateStr);
        //takes different date strings to turn into generic format

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        //turns the date into a nice string format
        //US means eg m/d/y
        //short means eg Jan
    },

    dateToDateStrKey(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    dateToTimeStr(date) {
        const dateToEdit = new Date(date);
        const formattedTime = dateToEdit.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        console.log(formattedTime);
        return formattedTime;
    },

    formatDayDateMonth(date) {        
        const d = new Date(date);
        
        //get dayName
        const dayName = this.getDayName(d);//returns eg Tuesday
        
        //get MonthName
        const monthName = this.getShortMonthName(d.getMonth());
        
        //get string to put on date eg 'nd' for 2nd
        const stringDateSuffix = this.getStringSuffixForDate(d);

        return `${dayName} the ${stringDateSuffix} of ${monthName}`;    //eg Wednesday the 2nd of Dec
    },

    getTodayKey() {
        return this.dateToDateStrKey(new Date());
    },

    getNowTime() {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        return formattedTime;
    },

    isToday(dateKey) {
        return dateKey === this.getTodayKey();
    },

    parseDate(dateKey) {
        return new Date(dateKey);
    },

    addDays(dateKey, days) {
        const date = this.parseDate(dateKey);
        date.setDate(date.getDate() + days);
        return this.dateToDateStrKey(date);
    },

    addYears(dateKey, years) {
        const days = years*365;

        const date = this.parseDate(dateKey);
        date.setDate(date.getDate() + days);
        return this.dateToDateStrKey(date);
    },

    addHours(dateKey, hours) {
        const date = this.parseDate(dateKey);
        date.setDate(date.getHours() + hours);
        return this.dateToDateStrKey(date);
    },

    getDateRange(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            dates.push(this.dateToDateStrKey(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    },

    //get number of seconds since Jan 1 1970
    secondsSince2016() {
        const ms2016Since1970 = new Date(2016, 11 ,25);
        const msNowSince1970 = Date.now();
        const msSince2010 = msNowSince1970 - ms2016Since1970;
        return Math.floor(msSince2010/1000);
    },

    //--- month/season info ---
    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    },

    getShortMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month].slice(0,3);
    },

    getShortMonthNameFromStringDate(strDate) {        
        //convert eg 03 to 3 or leave eg 12 as is, but subtract 1 to get the index
        const monthIndex = (() => {
            const temp = strDate.slice(5,7);

            return temp[0] === 0?
                Number.parseInt(strDate.slice(6,7)) - 1:
                Number.parseInt(temp) - 1;
        })();        
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex].slice(0,3);
    },

    getStringSuffixForDate(date) {
        //get string to put on date eg 'nd' for 2nd
        const day = String(date.getDate()).padStart(2, '0');
        const dayAsNum = Number.parseFloat(day);
        
        //eg get suffix 'st' for 1st, 'nd' for 2nd etc.
        switch(dayAsNum) {
            case 1:
            case 21:
            case 31: return `${dayAsNum}st`;

            case 2:
            case 22: return `${dayAsNum}nd`;

            case 3:
            case 23: return `${dayAsNum}rd`;

            default: return `${dayAsNum}th`;
        }
    },

    getDayName(date) {
        const dayNames =  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const d = new Date(date);
        
        //get dayName
        const dayIndex = d.getDay();//returns index 0=Sunday
        const dayName = dayNames[dayIndex]; //returns eg Tuesday

        //now return short name
        return dayName;
    },

    getShortDayName(date) {
        const dayNames =  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const d = new Date(date);
        
        //get dayName
        const dayIndex = d.getDay();//returns index 0=Sunday
        const dayName = dayNames[dayIndex]; //returns eg Tuesday

        //now return short name
        return dayName.slice(0,3);
    },

    //--- time functions ---
    // unused *****
    formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        //String.split() identifies ':' and splits into an array and : not incl

        const hour = this.safeParseInt(hours);
        //function from below for parsing 

        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    },

    calculateTimeDifference(startDate, startTime, endDate, endTime) {
        const start = new Date(`${startDate} ${startTime}`);
        const end = new Date(`${endDate} ${endTime}`);
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours;
    },

    calculateDaysDifference(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end - start;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays;
    },

    addHoursToDateTime(startDate, startTime, hours) {
        const start = new Date(`${startDate} ${startTime}`);
        
        start.setHours(start.getHours() + hours);

        return start;
    },

    getTimesNearestIndexTime(baseTime, timeToIndexAdjust) {
        const [ , aMinutes] = baseTime.split(':').map(Number);
        const [iHours, iMinutes] = timeToIndexAdjust.split(':').map(Number);

        // eslint-disable-next-line no-useless-assignment -- indicating this is 30-60
        let aUpperHalfMinsClockW = 30;
        // eslint-disable-next-line no-useless-assignment -- indicating this is 0-30
        let aLowerHalfMinsClockW = 0;
        const iMinsPlus60 = iMinutes + 60;
        const iMinsLess60 = iMinutes - 60;

        //eg1 (11:35 base time, 10:24 time to change) - want 10:24 to become 10:35 (not 09:35)        
        if(aMinutes >=30) { //eg 35
            aUpperHalfMinsClockW = aMinutes;    //35
            aLowerHalfMinsClockW = aMinutes - 30;   //5

        } else {    //eg2 (13:11 , 10:56) - want 10:56 to become 11:11
            aLowerHalfMinsClockW = aMinutes; //11
            aUpperHalfMinsClockW = aMinutes + 30;    //41
        }

        //eg1 (11:35 , 10:24) - want 10:24 to become 10:35
        //eg2 (13:11 , 10:57) - want 10:57 to become 11:11
        //eg3 (11:35 , 10:57) - want 10:57 to become 11:05
        //eg4 (13:29 , 10:01) - want 10:01 to become 09:59

        const UpperMinsKeepHr = iMinutes - aUpperHalfMinsClockW;    //24 - 35 = -11 this one    57-41 = 16
        const LowerMinsKeepHr = iMinutes - aLowerHalfMinsClockW;    //24 - 5  = 19              57-11 = 46
        const UpperMinsLess1Hr = iMinsPlus60 - aUpperHalfMinsClockW;  //84 - 35 = 49               117-41=76
        const LowerMinsPlus1Hr = iMinsLess60 - aLowerHalfMinsClockW;  //-44 - 5 = -49              -3-11=-14 this one
        
        const UpperCWabs = Math.abs(UpperMinsKeepHr);
        const LowerCWabs = Math.abs(LowerMinsKeepHr);
        const UpperLessAbs = Math.abs(UpperMinsLess1Hr);
        const LowerPlusAbs = Math.abs(LowerMinsPlus1Hr);

        let iNewMins = 0;
        let iNewHours = 0;
        
        //want to find shortest gap between time being adjusted and the base up/low times
        const minimumDistance = Math.min(UpperCWabs, LowerCWabs, UpperLessAbs, LowerPlusAbs);

        switch(minimumDistance) {
            case UpperCWabs: {
                iNewMins = aUpperHalfMinsClockW;
                iNewHours = iHours;
                break;
            }

            case LowerCWabs: {
                iNewMins = aLowerHalfMinsClockW;
                iNewHours = iHours;
                break;
            }

            case UpperLessAbs: {
                iNewMins = aUpperHalfMinsClockW;
                iNewHours = iHours - 1;
                break;
            }

            case LowerPlusAbs: {
                iNewMins = aLowerHalfMinsClockW;
                iNewHours = iHours + 1;
                break;
            }
        }

        //in case 1, work out that lower half clockwise is closest index (03 mins, therefore keep hour same, and use lowerhalfminsclockW)
        //in case 2, work out that upper half anticlockwise is closest index (therefore take off 1 hour, and use upperhalf minsclockW)
        //in case 3, work out that lower half anticlockwise is closest index, therefore add 1 hour, and use lowerhalf minsclockW

        const newTotalMins = iNewHours * 60 + iNewMins;
        const stringTime = this.minsToStringTime(newTotalMins);
        
        return stringTime;
    },

    calculateMinutesDifference(timeA, timeB) {
        const [aHours, aMinutes] = timeA.split(':').map(Number);
        const [bHours, bMinutes] = timeB.split(':').map(Number);

        //convert to comparable numerical value
        const aTotalMinutes = aHours * 60 + aMinutes;
        const bTotalMinutes = bHours * 60 + bMinutes;

        //compare numerical values
        return aTotalMinutes - bTotalMinutes;
    },

    calculateHoursDifference(timeA, timeB) {
        const [aHours, aMinutes] = timeA.split(':').map(Number);
        const [bHours, bMinutes] = timeB.split(':').map(Number);

        //convert to comparable numerical value
        const aTotalHours = aHours + aMinutes/60;
        const bTotalHours = bHours + bMinutes/60;

        //compare numerical values
        return aTotalHours - bTotalHours;
    },

    addMinsToStringTime(strTime, mins) {
        const minutes = this.stringTimeToMins(strTime);
        const totalMins = mins + minutes;
        
        return this.minsToStringTime(totalMins);
    },

    stringTimeToMins(stringTime) {
        const [hours, minutes] = stringTime.split(':').map(Number);
        return hours * 60 + minutes;
    },

    minsToStringTime(mins) {
        // if(mins < 0 || mins >= 1440) {
        //     return '00:00';
        // }
        let changeMins = 0;

        if(mins < 0) {
            const timesToRunThrough = Math.abs(Math.floor(mins/1440));
            changeMins = 1440 * timesToRunThrough;

        } else if(mins >=1440) {
            const timesToRunThrough = Math.abs(Math.ceil(mins/1440 - 1));            
            changeMins = - 1440 * timesToRunThrough;
        }

        const hours = (mins + changeMins) / 60;
        let floorHours = Math.floor(hours);
        let extraMins = Math.round(60 * (hours - floorHours));
        
        //correction for floating stuff just under the hour
        if(extraMins === 60 && floorHours !== 23) {
            extraMins = 0;
            floorHours += 1;
        } else if(extraMins === 60 && floorHours === 23) {
            extraMins = 0;
            floorHours = 0;
        }

        const digitalHours = floorHours.toString().length === 1? '0' + floorHours.toString() : floorHours.toString();
        const digitalMins = extraMins.toString().length === 1? '0' + extraMins.toString() : extraMins.toString();

        return digitalHours + ':' + digitalMins;
    },

    //--- parse the info ---
    //renaming the formula as shouldn't rename global parse function
    safeParseFloat(value, defaultValue = 0) {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    },

    //renaming the formula as shouldn't rename global parse function
    safeParseInt(value, defaultValue = 0) {
        const parsed = Number.parseInt(value);
        //returns first integer if it's so

        return Number.isNaN(parsed) ? defaultValue : parsed;
        //check isNaN? then return 0 or 0-9
    },

    sortTimes(array, key) {        
        array.sort((a, b) => {
            // Split the time strings into hours and minutes
            const [aHours, aMinutes] = a[`${key}`].split(':').map(Number);
            const [bHours, bMinutes] = b[`${key}`].split(':').map(Number);

            //convert to comparable numerical value
            const aTotalMinutes = aHours * 60 + aMinutes;
            const bTotalMinutes = bHours * 60 + bMinutes;

            //compare numerical values
            return aTotalMinutes - bTotalMinutes;
        });
    },

    sortLogTimes(array) {        
        array.sort((a, b) => {
            // Split the time strings into hours and minutes
            const [aHours, aMinutes] = a.split(':').map(Number);
            const [bHours, bMinutes] = b.split(':').map(Number);

            //convert to comparable numerical value
            const aTotalMinutes = aHours * 60 + aMinutes;
            const bTotalMinutes = bHours * 60 + bMinutes;

            //compare numerical values
            return aTotalMinutes - bTotalMinutes;
        });
    },
};

//==============================================================================
//-------------------         [      NUMBERS      ]         --------------------
//==============================================================================

export const HelpNum = {
    //--- parse the info ---
    //renaming the formula as shouldn't rename global parse function
    safeParseFloat(value) {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? 1 : parsed;
    },

    //renaming the formula as shouldn't rename global parse function
    // safeParseInt(value, defaultValue = 0) {
    //     const parsed = parseInt(value);
    //     //returns first integer if it's so

    //     return isNaN(parsed) ? 1 : parsed;
    //     //check isNaN? then return 0 or 0-9
    // },

    //renaming the formula as shouldn't rename global parse function
    strToFloat1dp(value) {
        const parsed = Number.parseFloat(value);   //converts string to floating value
        const float1dp = parsed.toFixed(1); //converts to 1dp
        return Number.isNaN(float1dp) ? 1 : float1dp;   //returns 1 if NaN
    },

    sortNumbers(array, name) {        
        if(name) {
            array.sort((a, b) => {
                const aCheck = Number.parseFloat(a[`${name}`]);
                const bCheck = Number.parseFloat(b[`${name}`]);
                return aCheck - bCheck;            
            });

        } else {
            array.sort((a, b) => {
                return Number.parseFloat(a) - Number.parseFloat(b);
            });
        }        
    },

    reverseSortNumbers(array, name) {
        
        if(name) {
            array.sort((a, b) => {
                const aCheck = Number.parseFloat(a[`${name}`]);
                const bCheck = Number.parseFloat(b[`${name}`]);
                return bCheck - aCheck;            
            });

        } else {
            array.sort((a, b) => {
                return Number.parseFloat(b) - Number.parseFloat(a);
            });
        }        
    },

    getYsBetweenXs(yEnd, yInitial, xJumps){
        const M = (yEnd - yInitial)/xJumps;
        const C = yInitial;
        const yArray = [];

        for(let X = 1; X < xJumps ; ++X) {
            const Y = Math.round(10 * (M * X + C)) / 10;
            yArray.push(Y);
        }
        return yArray;
    }
};

//==============================================================================
//------------------       [COMPLEX ARRAY HELPERS]        ----------------------
//==============================================================================

export const HelpComplex = {

    mergeMultipleArraysById(array1, array2, array3) {
        const map = new Map();

        //add all objects from 1st array to map
        // array1.forEach(obj => map.set(obj.id, {...obj }));

        for(const obj of array1) {
            map.set(obj.id, {...obj });
        }

        //merge objects from 2nd array
        // array2.forEach(obj => {
        //     if(map.has(obj.id)) {
        //         //If ID exists, merge properties
        //         map.set(obj.id, {...map.get(obj.id), ...obj});
        //     } else {
        //         //if ID doesn't exist, add the new object
        //         map.set(obj.id, {...obj});
        //     }
        // });

        for(const obj of array2) {
            if(map.has(obj.id)) {
                //If ID exists, merge properties
                map.set(obj.id, {...map.get(obj.id), ...obj});
            } else {
                //if ID doesn't exist, add the new object
                map.set(obj.id, {...obj});
            }
        }

        //merge objects from 3rd array
        // array3.forEach(obj => {
        //     if(map.has(obj.id)) {
        //         //If ID exists, merge properties
        //         map.set(obj.id, {...map.get(obj.id), ...obj});
        //     } else {
        //         //if ID doesn't exist, add the new object
        //         map.set(obj.id, {...obj});
        //     }
        // });

        for(const obj of array3) {
            if(map.has(obj.id)) {
                //If ID exists, merge properties
                map.set(obj.id, {...map.get(obj.id), ...obj});
            } else {
                //if ID doesn't exist, add the new object
                map.set(obj.id, {...obj});
            }
        }

        //convert map values back to an array
        return Array.from(map.values());
    },

    checkPerformance(runFunction) {
        
        const start = performance.now();
        runFunction();
        const end = performance.now();
        const duration = end - start;
        
        console.log(`execution time: ${duration} ms`);
    },

    //take a function and wait time (ms)
    //good for grouping a rapid series of functions into a single action
    //prevents ops running too often & improves app performance
    debounce(func, wait) {
        let timeout;// This variable will store the ID of the setTimeout timer

        //(...args) means variable number of arguments

        return function executedFunction(...args) { //function returned by debounce
            const later = () => {
                clearTimeout(timeout);
                func(...args); //execute the original function with its args 
            };
            clearTimeout(timeout);  // Clear any existing timer before setting a new one
            timeout = setTimeout(later, wait);  //set new timer
        };
    },

    findObjectById(data, targetId){
        //if input isnt object or array, return undefined
        if(typeof data !== 'object' || data === null) {
            return;
        }

        //if input is array, iterate thru elements
        if(Array.isArray(data)) {
            for(const item of data) {
                const foundItem = this.findObjectById(item, targetId);  //recursive call
                if(foundItem) {
                    return foundItem;
                }
            }
        }
        //if input is object, check its properties
        else {
            if(data.id === targetId) {
                return data;
            }
        }

        //Iterate over all properties of object
        for(const key in data) {
            //avoid searching in non-own properties or primitive types
            if(Object.prototype.hasOwnProperty.call(data, key)) {
                const foundItem = this.findObjectById(data[key], targetId);
                if(foundItem) {
                    return foundItem;
                }
            }
        }
        //if ID not found in current branch, returns undefined
        return;
    },

    checkInclusiveRange(checkDate,start, end) {
        
        //set start Date to 0000 and end date to 2400
        const check = new Date(checkDate);
        const startDate = new Date(start);
        const endDate = new Date(end);
        startDate.setHours(0,0,0,0);        
        endDate.setHours(23,59,59,999);

        return check.getTime() >= startDate.getTime() && check.getTime() <= endDate.getTime();
    },

    filterByDateRange(data, start, end, dateKey = 'date') {
        const results = [];
        // console.log(data);
        
        //set start Date to 0000 and end date to 2400
        const startDate = new Date(start);
        const endDate = new Date(end);
        startDate.setHours(0,0,0,0);        
        endDate.setHours(23,59,59,999);

        // Helper function to check if a date is within the range
        const isDateInRange = (itemDate) => {
            // Ensure valid dates for comparison
            if (!(itemDate instanceof Date) || Number.isNaN(itemDate)) {
                return false;
            }
            // Compare times (getTime() is reliable for date comparison)
            // console.log(itemDate);
            return itemDate.getTime() >= startDate.getTime() && itemDate.getTime() <= endDate.getTime();
        };

        // console.log(isDateInRange)

        // Main recursive traversal logic
        const traverse = (currentData) => {
            if (Array.isArray(currentData)) {
                // If it's an array, iterate through its elements
                for (const item of currentData) {
                    traverse(item);
                }
            } else if (typeof currentData === 'object' && currentData !== null) {
                // If it's an object, check the date property
                if (Object.prototype.hasOwnProperty.call(currentData, dateKey)) {
                    const itemDate = new Date(currentData[dateKey]);
                    if (isDateInRange(itemDate)) {
                        results.push(currentData); // Add the whole object if it matches
                    }
                }

                // Iterate over all properties to find nested objects/arrays
                for (const key in currentData) {
                    // Avoid checking the dateKey again as it was just handled
                    if (key !== dateKey && typeof currentData[key] === 'object') {
                        traverse(currentData[key]);
                    }
                }
            }
        };

        traverse(data);
        
        //sort data by date_time id
        results.sort((a, b) => {
            if(a.id < b.id) {
                return -1;  //a comes first
            }
            if(a.id > b.id) {
                return 1;   //b comes first
            }
            return 0; //they are equal
        });

        return results;
    },

    filterObject3toObject2(data) {
        const results = [];

        // Main recursive traversal logic
        const traverse = (currentData) => {
            if (Array.isArray(currentData)) {
                // // If it's an array, iterate through its elements
                for (const item of currentData) {
                    traverse(item);
                }
            } else if (typeof currentData === 'object' && currentData !== null) {
                // If it's an object, check the exercise property
                if (Object.prototype.hasOwnProperty.call(currentData, 'id')) {
                    results.push(currentData); // Add the whole object if it matches
                    
                }
                // // Iterate over all properties to find nested objects/arrays
                for (const key in currentData) {
                    traverse(currentData[key]);
                }
            }
        };

        traverse(data);
        
        //sort data by date_time id
        results.sort((a, b) => {
            if(a.id < b.id) {
                return -1;  //a comes first
            }
            if(a.id > b.id) {
                return 1;   //b comes first
            }
            return 0; //they are equal
        });

        return results;
    },

    filterComplexTimeObjects(data) {
        const results = [];

        // Main recursive traversal logic
        const traverse = (currentData) => {
            if (Array.isArray(currentData)) {
                // // If it's an array, iterate through its elements
                for (const item of currentData) {
                    traverse(item);
                }
            } else if (typeof currentData === 'object' && currentData !== null) {
                // If it's an object, check the exercise property
                if (Object.prototype.hasOwnProperty.call(currentData, 'time')) {
                    results.push(currentData); // Add the whole object if it matches
                    
                }
                // // Iterate over all properties to find nested objects/arrays
                for (const key in currentData) {
                    traverse(currentData[key]);
                }
            }
        };

        traverse(data);
        
        //sort data by date_time id
        // results.sort((a, b) => {
        //     if(a.id < b.id) {
        //         return -1;  //a comes first
        //     }
        //     if(a.id > b.id) {
        //         return 1;   //b comes first
        //     }
        //     return 0; //they are equal
        // });

        return results;
    },

    addXObjectsByTime(data, id, unit) {
        const comboArray = Object.values(data.reduce((accumulator, item) => {

            //check if an object with the current item's id already exists in accumulator
            if(accumulator[item[id]]) {
                // if exists, add current value to the existing object's value
                accumulator[item[id]][unit] += item[unit];
            } else { //if doesn't exist, create a new entry in the accumulator object
                accumulator[item[id]] = { ...item};
            }
            //return the accumulator for next iteration
            return accumulator;
        }, {}));    //the initial value for the accumulator is an empty object {}
        
        return comboArray;
    },

    keysFromValues(data, valueId) { 
        
        const keys = data.reduce((accumulator, item) => {
            if(!accumulator.includes(item[`${valueId}`])) {
                
                accumulator.push(item[`${valueId}`]);
            }
            return accumulator;            
        }, [] );

        return keys;
    },

    makeArrayfromValues(data, value) {        
        const result = data.reduce((accumulator, item) => {
            if(item[`${value}`]) accumulator.push(item[`${value}`]);
            return accumulator;            
        }, [] );

        return result;
    },

    findOuterKeyTrue(objObj) {
        for(const outerKey in objObj) {
            if(Object.prototype.hasOwnProperty.call(objObj, outerKey)) {
                // const innerObject = objObj[outerKey];
                // const foundKey = Object.keys(innerObject).find(innerKey => innerObject[innerKey] === true);
                // if(outerKey) {
                //     return outerKey;
                // }
                return outerKey;
            }
        }
        return null; //no key with true value found
    },

    getObject2ByKey1(array, key) {
        const foundPair = array.find(item => item[0] === key);

        return foundPair? foundPair[1] : undefined;
    },


    findOuterKeyBESTEST(thisObject, innerKey, innerValue) {
        for(const outerKey in thisObject) {
            if(Object.prototype.hasOwnProperty.call(thisObject, outerKey)) {
                const innerObject = thisObject[outerKey];
                if(innerObject && innerObject[innerKey] === innerValue) {
                    return outerKey;
                }
            }
        }
        return null; //no key with true value found
    },

    getBolusComboAction(startEntry, endEntry) {
        // INSULIN ACTION RATIO - really want to use both boluses if available
        let rapidUnits = 0;
        let mediumUnits = 0;
        let rapidActionRatio = 0;
        let mediumActionRatio = 0;
        let bolusType = '';

        const startRapidU = startEntry?.rapidU;   //means process won't stop if undefined for ternary
        const startMediumU = startEntry?.mediumU;   //means process won't stop if undefined for ternary

        if(startRapidU !== undefined) {
            rapidUnits = startRapidU;
            rapidActionRatio = HelpComplex.calculateInsulinAction(
                startEntry, endEntry, 'rapid'
            );
        }
        if(startMediumU !== undefined) {
            mediumUnits = startMediumU;
            mediumActionRatio = HelpComplex.calculateInsulinAction(
                startEntry, endEntry, 'medium'
            );
        }

        
        const bolusIOB = (rapidUnits * rapidActionRatio + mediumUnits * mediumActionRatio);
        const bolusU = rapidUnits + mediumUnits;        
        let weightedActionRatio = 0;
        
        if(rapidActionRatio > 0 && mediumActionRatio === 0) {
            weightedActionRatio = rapidActionRatio;
            bolusType = 'rapid';

        } else if(rapidActionRatio === 0 && mediumActionRatio > 0) {
            weightedActionRatio = mediumActionRatio;
            bolusType = 'medium';

        } else if(rapidActionRatio > 0 && mediumActionRatio > 0) {
            weightedActionRatio = (rapidActionRatio*rapidUnits + mediumActionRatio*mediumUnits)/bolusU;
            bolusType = 'combo';
        }

        return {
            bolusU: bolusU,
            bolusIOB: bolusIOB,
            bolusRatio: Math.round(weightedActionRatio * 100) / 100,
            bolusType: bolusType,
        };
    },

    calculateInsulinAction(startEntry, endEntry, insSpeed) {
        if(insSpeed === undefined || insSpeed.length === 0) return 0;

        const prefs = StorageService.getPreferences();
        const insulinProfiles = prefs.insulinArray;
        
        const startDate = new Date(`${startEntry.date} ${startEntry.logTime}`);
        const endDate = new Date(`${endEntry.date} ${endEntry.logTime}`);
        const elapsedHours = (endDate - startDate) / (1000 * 60 * 60);

        const profile = insulinProfiles.find(p => p.speed === insSpeed);

        const timeToStop = profile.totalHours;
        const timeToKickIn = profile.timeToKickIn;

        const ratio = Math.min( Math.max((elapsedHours - timeToKickIn) , 0) / (timeToStop - timeToKickIn), 1);
        return Math.round(ratio * 100) / 100;
    },

    calculateInsulinActionByHours(elapsedHours, insSpeed) {
        if(insSpeed === undefined || insSpeed.length === 0) return 0;

        const prefs = StorageService.getPreferences();
        const insulinProfiles = prefs.insulinArray;

        const profile = insulinProfiles.find(p => p.speed === insSpeed);

        const timeToStop = Number.parseFloat(profile.totalHours);
        const timeToKickIn = Number.parseFloat(profile.timeToKickIn);

        const ratio = Math.min( Math.max((elapsedHours - timeToKickIn), 0) / (timeToStop - timeToKickIn), 1);

        return Math.round(ratio * 100) / 100;
    },

    insulinArrayByHalfHour(units, insSpeed, startTime) {
        if(insSpeed === undefined || insSpeed.length === 0) return 0;

        const prefs = StorageService.getPreferences();
        const insulinProfiles = prefs.insulinArray;

        const profile = insulinProfiles.find(p => p.speed === insSpeed);

        const countHalfHours = Math.ceil(2 * profile.totalHours);   //eg 9 if total time = 4.5 hrs
        const firstHalfHoursAtZero = Math.round(2 * profile.timeToKickIn);  //eg 1 half-hour if 2*0.5hrs = 1

        const halfHoursToSpreadOver = countHalfHours - firstHalfHoursAtZero;

        const unitPerHalfHour = Math.round(100 * units / halfHoursToSpreadOver) / 100;

        const data = [];

        //first push in the zero half hours
        for(let i = 0 ; i < firstHalfHoursAtZero ; ++i) {
            data.push({
                time: HelpDateTime.addMinsToStringTime(startTime, 30*i),
                units: 0
            });
        }

        for(let i = 0 + firstHalfHoursAtZero ; i < countHalfHours ; ++i) {
            data.push({
                time: HelpDateTime.addMinsToStringTime(startTime, 30*i),
                units: unitPerHalfHour
            });
        }

        console.log(data);
        return data;

    },

    combinedFoodArrayByHalfHour(giHours ,glucoseGrams, startTime) {   //eg 2hrs ('medium'), 50grams, 5hrs

        console.log(giHours, glucoseGrams, startTime);

        const countHalfHours = Math.ceil(2 * giHours);   //eg 5 if total time = 2.5 hrs

        const glucosePerHalfHour = Math.round(10 * glucoseGrams / countHalfHours) / 10;

        const data = [];

        for(let i = 0 ; i < countHalfHours ; ++i) {
            data.push({
                time: HelpDateTime.addMinsToStringTime(startTime, 30*i),
                glucoseGrams: glucosePerHalfHour
            });
        }

        console.log(data);
        return data;

    },

    foodArrayByHalfHour(multiplier, food, startTime) {   //eg 2hrs ('medium'), 50grams, 5hrs
        const prefs = StorageService.getPreferences();
        const giArray = prefs.giArray;

        const foodArr = prefs.foodArray;

        // const foodArr = prefs.foodsArray;

        const glucoseGrams = foodArr.find(obj => obj.name === food).glucoseGPerServing * multiplier;
        const foodGI = foodArr.find(obj => obj.name === food).GI;
        const giHours = giArray.find(obj => obj.name === foodGI).hours;

        console.log(giHours);
        
        const countHalfHours = Math.ceil(2 * giHours);   //eg 5 if total time = 2.5 hrs

        const glucosePerHalfHour = Math.round(10 * glucoseGrams / countHalfHours) / 10;

        const data = [];

        for(let i = 0 ; i < countHalfHours ; ++i) {
            data.push({
                time: HelpDateTime.addMinsToStringTime(startTime, 30*i),
                glucoseGrams: glucosePerHalfHour
            });
        }

        console.log(data);
        return data;

    },

    insulinFxArrayByHalfHour(firstDate, lastDate, firstLogTime, lastLogTime) {
        const logMinStart = HelpDateTime.stringTimeToMins(firstLogTime);
        const data = [];

        const totalHours = HelpDateTime.calculateTimeDifference(firstDate, firstLogTime, lastDate, lastLogTime);   //gives hours - need number of half-hours
        const countHalfHours = Math.ceil(2 * totalHours);

        for(let i = 0 ; i < countHalfHours ; ++i) {
            const mins = logMinStart + (i * 30);            
            const time = HelpDateTime.minsToStringTime(mins);   //eg '10:00'
            // const tzFactor = HelpDateTime.getTimezoneFactor(time);  //eg 0.5
            const bglDropPer1U = HelpTz.getTimesTzUnit(time, 'bglDropPer1U');
            const glucosePer1U = HelpTz.getTimesTzUnit(time, 'glucosePer1U');

            // console.log(bglDropPer1U, time, glucosePer1U);


            data.push({
                x: i/2,
                bgl: null,
                exFactor: null,
                time: time,
                bglDropPer1U: bglDropPer1U,
                glucosePer1U: glucosePer1U
            });
        }

        return data;
    },

    // not used yet *****
    // chooseBestInsulinForGi(gi) {
        
    //     //function to eg choose bolusMedium if gi is a slow one
    //     //based on the food action being closer to the insulin action
    // }

};

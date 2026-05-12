/*  CSV SERVICE STRUCTURE  
**  ============================================================================
**  DECLARE prefs
**  
**  ============================================================================
**  EXPORT
**  1. build csv
**  
**  if user selected 'blanks', then blank rows are exported too
**  
**  ============================================================================
**  EXPORT: HELPERS
**  2. parse data/blanks
**  3. download csv
**  
**  ============================================================================
**  IMPORT
**  
**  1. send file to get parsed
**  3. save each day's data to day object
**  
**  if user selected 'blanks', then default log entries are inserted for user
**  
**  ============================================================================
**  IMPORT: PARSE
**  
**  2. parse file
**
**  ============================================================================
**  IMPORT: PARSE HELPERS
**  
**  hasUniqueValues(uniqueIdCheck) -> ensure no 2 date-ids are equal
**  parseCSVLine -> gets rid of any quote marks
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import { StorageService } from './storage.js';
import {
    HelpDateTime,
    HelpConvert,
    HelpHtml,
    HelpComplex,

} from './helpers.js';

export const CSVService = {
    //==========================================================================
    //------------------       [      DECLARE    ]       -----------------------
    //==========================================================================
    preferences: null,

    //==========================================================================
    //------------------       [      EXPORT     ]       -----------------------
    //==========================================================================
    buildDailyCsv() {
        const prefs = StorageService.getPreferences();
        const isInclBlanks = prefs.userSelections.CSVincludeBlanks;
        // const glucoseUnit = prefs.glucoseUnit;  //will have to display as correct user-desired Unit
        const insulNames = prefs.insulinArray;
        const rapHead = insulNames.find(obj => obj.speed === 'rapid').name;
        const medHead = insulNames.find(obj => obj.speed === 'medium').name;
        const sloHead = insulNames.find(obj => obj.speed === 'slow').name;

        const headers = [
            'Date',
            'Time',
            'BGL',
            rapHead,
            medHead,
            sloHead,
            'Exercise',
            'Food Items',
            'Food Multipliers'
        ];        

        const rows = [headers.join(',')];

        //gets all stored log data
        // const allLogs = StorageService.getLogData('all');
        const allLogs = StorageService.getAllLogData();

        // getAllLogData();
        console.log(allLogs);

        //get Object.keys and RE-sort it (gets messed up with forEach method)
        const keys = Object.keys(allLogs);
        const removeChars = 'dailyLogData_'.length;
        
        keys.sort((a, b) => {
            // turn date & time into a dateTime objec
            const aDate = new Date(`${a.slice(removeChars)}`);
            const bDate = new Date(`${b.slice(removeChars)}`);

            //compare numerical values
            return aDate - bDate;
        });

        console.log(keys);

        //now can export CSV in correct order
        for(let i = 0; i < keys.length ; ++i) {
            const dayLog = keys[i];
            const currentDayLog = allLogs[dayLog];
            if(i === 0) console.log(currentDayLog);

            for(let j = 0 ; j < currentDayLog.length ; ++j){
                const obj = currentDayLog[j];

                const bgl           = HelpConvert.displayAsCorrectGlucoseUnit(obj.bgl)?? '';
                const bolusRapid    = obj.rapidU?? '';
                const bolusMedium   = obj.mediumU?? '';
                const basalSlow     = obj.slowU?? '';
                const exercise      = obj.exercise?? '';
                const foodEntries   = obj.food?? [];
                const foodNames         = foodEntries.map(f => f.name       ?? '').join(';');
                const foodMultipliers   = foodEntries.map(f => f.multiplier ?? '').join(';');
                // const foodMultipliers   = foodEntries.map(f => f.multiplier === undefined ? '' : f.multiplier).join(';');

                // stops export of empty rows
                if(
                    !isInclBlanks &&
                    bgl === '' &&
                    bolusRapid === '' &&
                    bolusMedium === '' &&
                    basalSlow === '' &&
                    exercise === '' &&
                    foodEntries.length === 0
                ) continue;

                //now make a row of the data or ''
                const row = [
                    this.escapeCSVValue(obj.date),
                    this.escapeCSVValue(obj.logTime),
                    this.escapeCSVValue(bgl),
                    this.escapeCSVValue(bolusRapid),
                    this.escapeCSVValue(bolusMedium),
                    this.escapeCSVValue(basalSlow),
                    this.escapeCSVValue(exercise),
                    this.escapeCSVValue(foodNames),
                    this.escapeCSVValue(foodMultipliers)
                ];
                rows.push(row.join(','));    
            }
        }
        return rows.join('\n');
    },

    //==========================================================================
    //--------------       [      EXPORT: HELPERS     ]       ------------------
    //==========================================================================
    //------escape if it doesn't work
    escapeCSVValue(value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }
        
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            // return `"${str.replace(/"/g, '""')}"`;
            return `"${str.replaceAll('"', '""')}"`;
        }
        return str;
    },

    //------------------------------------------------------
    exportCSV() {
        const today = new Date;
        const todayString = today.toString();
        const dateStamp = todayString.slice(4,7) + '-' + todayString.slice(8,10) + '-' + todayString.slice(11,15) + '-' + todayString.slice(16,18) + todayString.slice(19,21);
        try {
            if (CSVService === undefined) {
                throw new Error('CSVService is not loaded');
            }
            const csvContent = this.buildDailyCsv();
            const filename = `BGLpal-logs-${dateStamp}.csv`;
            CSVService.downloadCSV(filename, csvContent);
            HelpHtml.showMessage('CSV exporting', 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            console.error('Error stack:', error.stack);
            const errorMsg = error.message?? 'Unknown error';
            HelpHtml.showMessage('Failed to export CSV: ' + errorMsg, 'error');
        }
    },

    //------------------------------------------------------
    downloadCSV(filename, csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.append(link);
        link.click();
        document.body.remove(link);
        
        URL.revokeObjectURL(url);
    },

    //==========================================================================
    //------------------       [      IMPORT     ]       -----------------------
    //==========================================================================
    
    importCsv(event) {
        // run initial checks then use async function
        // if no file, then stop
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        //checks file.name ends in .csv
        if (!file.name.endsWith('.csv')) {
            HelpHtml.showMessage('Please select a CSV file', 'warning');
            console.log('doesnt end in csv');
            return;
        }

        // checks CSVService exists
        if (CSVService === undefined) {
            throw new Error('CSVService is not loaded');
        }

        const isImported = this.handleImportCsv(file, event);
        return isImported;
    },

    async handleImportCsv(file, event) {
        //this lets web apps read data in a file
        const csvText = await file.text();

        // const csvText = await new Promise((resolve, reject) => {
        //     //this lets web apps read data in a file
        //     const reader = new FileReader();

        //     reader.addEventListener('load', () => {
        //         HelpHtml.showMessage('Read the file', 'success');
        //         resolve(reader.result);
        //     });

        //     reader.addEventListener('error', () => {
        //         console.log('error in here?');
        //         HelpHtml.showMessage('Failed to read file', 'error');                
        //         reject(reader.error);                
        //     });

        //     //start the parsing process here
        //     reader.readAsText(file);
        // });

        try {
            // 1. parse the data
            //need to get a date array and run a forEach loop
            const daysData = CSVService.parseCsv(csvText);

            if (!daysData.success) {
                HelpHtml.showMessage('Failed to import CSV: ' + daysData.error, 'error');
                return;
            }

            // 2. save each day's data to day object
            //now save the data by days
            const daysLog = daysData.data.rows;
            const uniqueDates = daysData.data.dates;

            // 3. now filter it into dates
            for(let i = 0; i < uniqueDates.length ; ++i) {
                //now parse the data before it can be stored
                const dayLog = daysLog.filter(item => item.date === uniqueDates[i]);

                //sort by log time
                HelpDateTime.sortTimes(dayLog, 'logTime');
                
                //store all the data for that day, including blank default rows
                StorageService.set(`dailyLogData_${uniqueDates[i]}`, dayLog);
            }

        } catch (error) {
            HelpHtml.showMessage('Failed to import CSV: ' + error.message, 'error');
        }
        
        event.target.value = '';
        return true;
    },
    
    
    
    
    // changed to blob.stuff
    handleImportCsvOLD(event) {
        //returns file with metadata - if no file, then stop
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        //checks file.name ends in .csv
        if (!file.name.endsWith('.csv')) {
            HelpHtml.showMessage('Please select a CSV file', 'error');
            return;
        }

        //this lets web apps read data in a file
        const reader = new FileReader();        
        
        reader.addEventListener('load', (event) => {
            try {
                //event checks if trusted = true and result has all the data
                if (CSVService === undefined) {
                    throw new Error('CSVService is not loaded');
                }
                
                //the actual raw data - has everything so need to check out the parseDailyCsv function
                const csvText = event.target.result;

                //run some initial parsing - eg more than 1 line, has headers etc
                
                // 1. parse the data
                //need to get a date array and run a forEach loop
                const daysData = this.parseCsv(csvText);

                console.log(csvText, daysData);

                if (!daysData.success) {
                    // HelpHtml.showMessage('Failed to import CSV: ' + daysData.error, 'error');
                    return;
                }

                // 2. save each day's data to day object
                //now save the data by days
                const daysLog = daysData.data.rows;
                const uniqueDates = daysData.data.dates;

                // now filter it into dates
                for(let i = 0; i < uniqueDates.length ; ++i) {
                    //now parse the data before it can be stored
                    const dayLog = daysLog.filter(item => item.date === uniqueDates[i]);

                    //sort by log time
                    HelpDateTime.sortTimes(dayLog, 'logTime');
                    
                    //store all the data for that day, including blank default rows
                    StorageService.set(`dailyLogData_${uniqueDates[i]}`, dayLog);
                }

            } catch (error) {
                console.error('Error importing CSV:', error);
                HelpHtml.showMessage('Failed to import CSV: ' + error.message, 'error');
            }
        });

        // reader.onerror = () => {
        //     HelpHtml.showMessage('Failed to read file', 'error');
        // };

        reader.addEventListener('error', () => {
            HelpHtml.showMessage('Failed to read file', 'error');
        });

        // reader.readAsText(file);
        
        event.target.value = '';
    },

    //==========================================================================
    //--------------       [      IMPORT: PARSE     ]       --------------------
    //==========================================================================
    parseCsv(csvText) {
        try {
            //  /text/ // means a literal. \r is carriage return character (? means carriage return is optional), \n is new line
            //this turns into comma-separated data
            const lines = csvText.split(/\r?\n/).filter(line => line.trim()); 
            

            //if only 1 row (headers) reject. If rows of data only (no headers), reject.
            if (lines.length < 2) {
                throw new Error('CSV file is empty or has no data rows');
            }

            //parses headers to be text
            const headers = this.parseCSVLine(lines[0]);
            const headerMap = {};
            // headers.forEach((header, index) => {
            //     const normalizedHeader = header.trim();
            //     headerMap[normalizedHeader] = index;
            // });
            for(const [index, header] of headers.entries()) {
                const normalizedHeader = header.trim();
                headerMap[normalizedHeader] = index;
            }

            //gets stored defaults
            this.preferences = StorageService.getPreferences();
            const isInclBlanks = this.preferences.userSelections.CSVincludeBlanks; //whether to input extra blank logs
            
            //allDates for converting to unique dates. unique ID check for checking no repeats
            const allData = [];
            const allDates = [];            
            const uniqueIdCheck = [];

            //ensure insulin plain English names match
            const insulNames = this.preferences.insulinArray;
            const rapHead = insulNames.find(obj => obj.speed === 'rapid').name;
            const medHead = insulNames.find(obj => obj.speed === 'medium').name;
            const sloHead = insulNames.find(obj => obj.speed === 'slow').name;

            //for loop creates custom rows to load for all dates
            for (let i = 1; i < lines.length; ++i) {
                const values = this.parseCSVLine(lines[i]); //gets rid of quote marks
                const dataLine = {};                
                
                //trim white space
                const date              = values[headerMap['Date']]?.trim();
                const timeRaw           = values[headerMap['Time']]?.trim();
                const bglRaw            = values[headerMap['BGL']]?.trim();
                const exercise          = values[headerMap['Exercise']]?.trim();
                const bolusRapid        = values[headerMap[rapHead]]?.trim();
                const bolusMedium       = values[headerMap[medHead]]?.trim();
                const basalSlow         = values[headerMap[sloHead]]?.trim();
                const foodItems         = values[headerMap['Food Items']]?.trim();
                const foodMultipliers   = values[headerMap['Food Multipliers']]?.trim();
                                
                //correction if time is in eg 7:30 format without 0 on front for checking date_time id is correct
                //also need correction if time is in 07:30:00 format
                // const time = timeRaw.length === 4? '0' + timeRaw : timeRaw;
                console.log(timeRaw);
                const time = HelpDateTime.parseCsvTime(timeRaw);
                console.log(time);

                //push in date and time for this line
                dataLine.date = date;
                dataLine.logTime = time;
                
                //bgl: parse string to float if it exists and is > 0, put in unit from above outside the for loop
                // mmol/L is the "index" unit
                if (bglRaw && Number.parseFloat(bglRaw) > 0) {
                    dataLine.bgl = HelpConvert.storeAsCorrectGlucoseUnit(bglRaw);
                    dataLine.glucoseUnit = 'mmol/L';
                }

                // parse exercise to an int - must be between 0 and 5
                if (exercise !== '' && exercise !== undefined) {
                    const exerciseInt = Number.parseInt(exercise);
                    if (!Number.isNaN(exerciseInt) && exerciseInt >= 0 && exerciseInt <= 5) {
                        dataLine.exercise = exerciseInt;
                    }
                }

                //turn insulin units into floats                
                if (bolusRapid || bolusMedium || basalSlow) {
                    if (bolusRapid && Number.parseFloat(bolusRapid) > 0) {
                        dataLine.rapidU = Number.parseFloat(bolusRapid);
                    }
                    if (bolusMedium && Number.parseFloat(bolusMedium) > 0) {
                        dataLine.mediumU = Number.parseFloat(bolusMedium);
                    }
                    if (basalSlow && Number.parseFloat(basalSlow) > 0) {
                        dataLine.slowU = Number.parseFloat(basalSlow);
                    }
                }

                // split FOOD by ; and include trimmed stuff //eg banana;cookie and 1;2 works a treat
                // If type in 2 for 2 foods, 1st one gets 2 and 2nd gets 1 as default value
                if (foodItems) {
                    const names = foodItems.split(';').map(n => n.trim());
                    const multipliers = foodMultipliers ? foodMultipliers.split(';').map(m => m.trim()) : [];
                    
                    const entries = [];
                    // names.forEach((name, idx) => {
                    //     if (name) {
                    //         const multiplier = multipliers[idx] ? Number.parseFloat(multipliers[idx]) : 1;
                    //         entries.push({
                    //             name: name,
                    //             multiplier: Number.isNaN(multiplier) ? 1 : multiplier
                    //         });
                    //     }
                    // });

                    for(const [idx, name] of names.entries()) {
                        if (name) {
                            const multiplier = multipliers[idx] ? Number.parseFloat(multipliers[idx]) : 1;
                            entries.push({
                                name: name,
                                multiplier: Number.isNaN(multiplier) ? 1 : multiplier
                            });
                        }
                    }
                    
                    //if length of array > 0, then foodData based on the key gets copied from entries
                    if (entries.length > 0) {
                        dataLine.food = entries;
                    }
                }

                //put in row IDs
                dataLine.id = `${date}_${time}`;
                
                //ensure dateId has length 2025-12-07_07:31, ie 16 chars
                if(`${date}_${time}`.length !== 16) {
                    console.log('failed the 16-char test');
                    console.log(`${date}_${time}`,`${date}_${time}`.length);
                    throw new Error(`date-time (YYYY-MM-DD, HH:MM) format incorrect, row: ${i}`);
                }
                
                //push into the arrays for checks
                allDates.push(dataLine.date);
                uniqueIdCheck.push(dataLine.id);

                //push 1 almost-complete dataLine into the array - still needs to check if row is a default or not
                //then have to make sure there are defaults entered for completely missing rows
                //and have to assign 1st entry in each timezone as default, and 2nd entry+ as not default
                allData.push(dataLine);
            }

            // GET EXISTING DATA FOR SAME DAYS
            //check there are no 2 date_time ids the same - probably want to check there are no missing times too
            if(!this.hasUniqueValues(uniqueIdCheck)) {
                throw new Error('repeated time on 1 day');
            }
            
            //now get all unique dates for the for-loop to save stuff
            const uniqueDates = [...new Set(allDates)];

            //take uniqueDatesArray and logArray and build up an array of all the rows that
            // would exist - if user has selected to create blank rows from log Settings
            const defaultRowsArray = [];
            const logRange = this.preferences.logArray;

            for(let i=0 ; i < uniqueDates.length ; ++i) {
                
                //don't create blanks from logs
                if(!isInclBlanks) break;

                for(let j=0; j < logRange.length ; ++j) {                    
                
                    //stop default + same user date_time being entered 2x
                    const defaultId = `${uniqueDates[i]}_${logRange[j]}`;                    
                    if(uniqueIdCheck.includes(defaultId)) continue;
                    
                    defaultRowsArray.push({
                        date: uniqueDates[i],
                        logTime: logRange[j],
                        id: `${uniqueDates[i]}_${logRange[j]}`,
                    });
                }
            }

            console.log(defaultRowsArray, allData);

            const dataExtantArray = [];
            //if any other rows exist for that date, should pull them in and put them in middle below
            for(let i = 0 ; i < uniqueDates.length ; ++i) {
                const dateKey = uniqueDates[i];
                console.log(dateKey);

                const dayDataExtant = StorageService.get(`dailyLogData_${dateKey}`)?? {};
                console.log(dayDataExtant);
                for(let j = 0 ; j < dayDataExtant.length ; ++j) {
                    dataExtantArray.push(dayDataExtant[j]);
                }
            }
            console.log(dataExtantArray);

            const allRowsToLoad = HelpComplex.mergeMultipleArraysById(defaultRowsArray, dataExtantArray, allData);
            // console.log(allRowsCheck);

            return {
                success: true,
                data:{
                    rows: allRowsToLoad,
                    dates: uniqueDates,
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    //==========================================================================
    //----------       [      IMPORT: PARSE HELPERS     ]       ----------------
    //==========================================================================
    
    //-------    [HELPER 1]    --------
    hasUniqueValues(array) {
        return array.every((value, index, self) => self.indexOf(value) === index);
    },

    //-------    [HELPER 2]    --------
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; ++i) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    },

    //-------    obsolete unused ***** ]    --------
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(s => Number.parseInt(s, 10));
        return hours * 60 + (minutes?? 0);
    },
    filterArrayByIds(arrayDefault, arrayCustom) {
        const idsToDelete = new Set(arrayCustom.map(item => item.tzId));
        console.log(idsToDelete);

        const array3 = arrayDefault.filter(item => !idsToDelete.has(item.tzId));
        console.log(array3);

        // array3.forEach(obj => {
        //     delete obj['tzId'];
        // });

        for(const obj of array3) {
            delete obj['tzId'];
        }

        return array3;
    },
};

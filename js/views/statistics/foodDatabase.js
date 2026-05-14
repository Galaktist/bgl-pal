/*  FOOD DATABASE STRUCTURE  
**  ============================================================================
**  DECLARE
**  
**  currentDate
**  foodCats
**  foodGroups
**  foodDictionArray
**  foodAllArray
**  preferences
**  bglStepMin
**  modalType
**  tempGroup
**  
**  ============================================================================
**  RENDERING
**  
**  Heading -> 
**  UncatLogToggle -> 
**  Dropdowns -> 
**  ExtantFoodsTable -> 
**  UncategorisedLogFoods -> 
**  
**  ============================================================================
**  RENDER HELPERS
**  
**  renderDropDownsToFoodModal
**  mapDropdownHtmlWithOptions
**  deleteUncategorisedFood -> clean-up
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC: STANDARD
**  
**  ============================================================================
**  FUNCTIONS - STATIC: STANDARD
**  
**  filterSelectedCategoryGroup(selected, type)
**  showOrHideLogUncatData
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC: MODAL
**  
**  ============================================================================
**  FUNCTIONS - STATIC: MODAL
**  
**  closeModal
**  saveFoodModal
**    -> hasNameBeenUsed
**    -> fillNewFoodObject  
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC: MODAL EDIT FOOD
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC: MODAL NEW FOOD
**  
**  ============================================================================
**  FUNCTIONS - DYNAMIC - ie based on changing number of foods
**  
**  showFoodModal
**  deleteFoodEntry
**  updateFoodRef
**  recalculateInsulinFromGlucose -> needed to maintain ratio
**  recalculateGlucoseFromInsulin -> needed to maintain ratio
*/

/* eslint-disable indent */

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpString,
    HelpConvert,
    HelpDateTime,
    HelpTz,
    HelpSeason,

} from '../../utils/helpers.js';

import { StorageService } from '../../utils/storage.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================

export const FoodDatabaseView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    currentDate: HelpDateTime.getTodayKey(),
    foodCats: [],
    foodGroups: [],
    foodDictionArray: [],
    foodAllArray: [],
    preferences: [],
    bglStepMin: [],
    modalType: null,
    tempGroup: null,

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('../../../html/b5FoodDatabase.html')
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
        this.bglStepMin = HelpConvert.getBglStepMinFigurative();
        
        this.preferences = StorageService.getPreferences();
        const prefs = this.preferences;
        this.foodDictionArray = prefs.foodDictionary;
        this.foodAllArray = prefs.foodArray;
        
        this.renderAllSections();
        this.attachStaticStandardEventListeners();
        this.attachStaticModalEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {
        this.renderHeading();
        this.renderUncatLogToggle();
        this.renderDropdowns();
        this.renderExtantFoodsTable();
        this.renderUncategorisedLogFoods();
    },

    //---------------- [RENDER 1] ------------------
    renderHeading() {
        const prefs = this.preferences;
        const season = prefs.userSelections.season;
        // const seasonColor = HelpSeason.getSeasonsColor(season);

        const seasonHead = document.getElementById('seasonal-heading');
        seasonHead.innerHTML = `your data for regular meals and snacks (currently indexed to <span class="color-${season}";>${season}</span>)`;
    },

    //---------------- [RENDER 2] ------------------
    renderUncatLogToggle() {
        const prefs = this.preferences;
        const isShowData = prefs.userSelections.showUncatLogFoods;

        const showButton = document.querySelector('[data-action="show-data"]');
        const hideButton = document.querySelector('[data-action="hide-data"]');
        const showTable = document.getElementById('uncategorised-food-list');

        if(isShowData) {
            showButton.classList.add('active');
            hideButton.classList.remove('active');
            showTable.classList.remove('hidden');
        } else {
            showButton.classList.remove('active');
            hideButton.classList.add('active');
            showTable.classList.add('hidden');
        }
    },

    //---------------- [RENDER 3] ------------------
    renderDropdowns() {
        //the whole table body from html
        const htmlCat = document.getElementById('category-selected');
        const htmlGroup = document.getElementById('group-selected');
        const prefs = this.preferences;
        
        const categoryObjs = prefs.foodMealTimes;
        const foodGroupObjs = prefs.foodGroups;
        const foodCats = [];
        const foodGroups = [];
        
        //push in the arrays
        for(let i = 0 ; i < categoryObjs.length ; ++i) {
            if(i===0) foodCats.push('...');
            const category = categoryObjs[i].category;
            foodCats.push(category);
        }
        for(let i = 0 ; i < foodGroupObjs.length ; ++i) {
            if(i===0) foodGroups.push('...');
            const group = foodGroupObjs[i].group;
            foodGroups.push(group);
        }

        this.foodCats = foodCats;
        this.foodGroups = foodGroups;

        //then put in category options select for each one
        this.mapDropdownHtmlWithOptions(htmlCat, foodCats);
        this.mapDropdownHtmlWithOptions(htmlGroup, foodGroups);
        this.renderDropDownsToFoodModal();
    },    

    //---------------- [RENDER 4] ------------------
    renderExtantFoodsTable() {
        const prefs = this.preferences;
        const tableBody = document.getElementById('thumb-rules-tbody');
        const foods = this.foodAllArray;
        const catArray = prefs.foodMealTimes;

        const refFoodObj = prefs.referenceFood;
        const refFood = refFoodObj.name;

        //insulin precision from Settings
        const insStepMin = HelpConvert.getInsulinPrecisionStep();

        tableBody.innerHTML = foods.map(element => {
            const foodName = element.name;
            const isFoodRef = foodName === refFood? true : false;  
            const foodServe = element.serving;          
            const colorClass = isFoodRef? 'color-primary active' : '';        
            const foodMealtime = element.category?? '';
            const foodGroup = element.group?? '';
            const foodGlucose = element.glucoseGPerServing?? 1;

            //changing border as group changes
            const borderClass = (foodGroup === this.tempGroup)? '' : 'border-row';
            this.tempGroup = foodGroup;
            
            // GET FOOD CATEGORY FACTORS
            const foodCatLookup = foodMealtime === ''? 'general' : foodMealtime;
            const catObj = catArray.find(obj => obj.category === foodCatLookup);
            const catTime = catObj.time;
            const tzGlucosePer1U = HelpTz.getTimesTzUnit(catTime, 'glucosePer1U');
            const seasonFactor = HelpSeason.getDatesSeasonFactor(this.currentDate);

            // CALCULATE BASE INSULIN REQUIREMENT
            const rawInsulinPerServe = foodGlucose/tzGlucosePer1U;
            const indexInsulinPerServe = HelpConvert.displayAsCorrectInsulinPrecision(rawInsulinPerServe/seasonFactor); //get to nearest 0.1 units... pumps are detailed

            return `
                ${borderClass==='border-row'? 
                    `<tr style="" class="${borderClass}" data-row-id="${foodGroup}" value="${foodGroup}" data-foodgroup="${foodGroup}">
                        <td colspan="5" style="text-align: left">${foodGroup.toUpperCase()}</td>
                    </tr>` :
                    ''}
                <tr class="${colorClass}" data-row-id="${foodName}" data-mealtime="${foodMealtime}" data-foodgroup="${foodGroup}">
                    <td>
                        <button class="toggle-option outset-md long-text ${isFoodRef? 'active' : ''}" data-index="${foodName}" value="${foodName}" data-action="update-food-ref">
                            ${foodName}
                        </button>                        
                    </td>
                    <td>
                        <input readonly type="text" class="long-text" data-index="${foodName}" value="${foodServe}">
                    </td>
                    <td>
                        <input type="number" data-value="glucose-per-serve" data-index="${foodName}"
                        value="${foodGlucose}" ${isFoodRef? 'placeholder="TBC"' : 'required min=1'} step="1" data-action="glucose-update-insulin">
                    </td>
                    <td>
                        <input type="number" data-value="insulin-per-serve" data-index="${foodName}" 
                        value="${indexInsulinPerServe}" placeholder="TBC" step="${insStepMin}" min="0" data-action="insulin-update-glucose">
                    </td>
                    <td>
                        <button class="icon-button edit" data-index="${foodName}" data-action="edit-existing-food"></button>
                        ${isFoodRef?
                            '':
                            `<button class="icon-button delete" data-index="${foodName}" data-action="delete-food"></button>`
                        }
                    </td>
                </tr>
            `;
        }).join('');

        this.attachDynamicEditFoodEventListeners();
        this.filterSelectedCategoryGroup();
    },

    //---------------- [RENDER 5] ------------------
    renderUncategorisedLogFoods() {
        const foods = this.foodAllArray;
        const foodDictionary = this.foodDictionArray;
        const foodPrelim = [];
        const foodsNotCategorised = [];
        const allLogs = StorageService.getLogData('all');

        //look up any uncategorised foods from food logs - ideally want an array of all foods used that won't get added to if the food already exists
        for(let i = 0; i < foodDictionary.length ; ++i) {
            const food = foodDictionary[i];
            console.log(food);
            
            
            if(!foods.some(obj => obj.name === food)) {
                let foodCount = 0;
                
                for(let j = 0; j<allLogs.length; ++j) {
                    const object = allLogs[j];
                    const foodObject = object?.food;
                    if(foodObject) {
                        const isFoodThere = foodObject.find(item => item.name === food);
                        foodCount += isFoodThere? 1 : 0;
                    }
                }
                foodPrelim.push({
                    food: food,
                    count: foodCount,
                });
            }            
        }
        console.log(foodPrelim);

        for(let i = 0 ; i< foodPrelim.length ; ++i) {
            const foodName = foodPrelim[i].food;
            const foodCounter = foodPrelim[i].count;

            if(foodCounter > 0) foodsNotCategorised.push(foodName);
            if(foodCounter === 0) this.deleteUncategorisedFood(foodName);
        }

        const uncategoryCard = document.getElementById('uncategorised-card');

        uncategoryCard.classList = foodsNotCategorised.length > 0? 'card' : 'card hidden';

        //the whole table body from html
        const tableFoodDictionary = document.getElementById('uncategorised-rules-tbody');
        tableFoodDictionary.innerHTML = foodsNotCategorised.map(element => {
            return `
                <tr class="timezone-row" data-index="${element}">
                    <td>
                        <input disabled class="width-lg" type="text" value="${element}">
                    </td>
                    <td>
                        <button data-index="${element}" data-action="new-dictionary-food" class="outset-md">add details</button>
                    </td>
                </tr>
            `;
        }).join('');

        this.attachDynamicNewFoodEventListeners();
    },

    //==========================================================================
    //--------------------       [RENDER HELPERS]        -----------------------
    //==========================================================================
    
    //---------------- [RENDER HELPER 3.1] ------------------
    renderDropDownsToFoodModal() {
        const foodCat = document.querySelector('#food-modal [data-index="food-category"]');
        const foodGroup = document.querySelector('#food-modal [data-index="food-group"]');

        //then put in category options select for each one
        this.mapDropdownHtmlWithOptions(foodCat, this.foodCats);
        this.mapDropdownHtmlWithOptions(foodGroup, this.foodGroups);
    },

    //---------------- [RENDER HELPER 3.2] ------------------
    mapDropdownHtmlWithOptions(containerId, optionsArray) {
        containerId.innerHTML = optionsArray.map(item => {
            return `
                <option value="${item}">
                    ${item}
                </option>
            `;
        }).join('');
    },    

    //---------------- [RENDER HELPER 5.1] ------------------
    deleteUncategorisedFood(food) {
        // console.log(food);
        this.preferences = StorageService.getPreferences();
        const foodDictionary = this.preferences.foodDictionary;

        const indexToDelete = foodDictionary.indexOf(obj => obj === food);
        console.log(food, foodDictionary, indexToDelete, foodDictionary[indexToDelete]);

        foodDictionary.splice(indexToDelete, 1); //remove 1 element at found index

        StorageService.savePreferences(this.preferences);
    },


    //==========================================================================
    //-------   [        EVENT LISTENERS - STATIC: STANDARD        ]  ----------
    //==========================================================================
    attachStaticStandardEventListeners() {
        const categorySelector = document.getElementById('category-selected');
        categorySelector.addEventListener('change', (event) => {
            const selected = event.target.value;
            const type = event.target.dataset.index;
            this.filterSelectedCategoryGroup(selected, type);
        });

        const groupSelector = document.getElementById('group-selected');
        groupSelector.addEventListener('change', (event) => {
            const selected = event.target.value;
            const type = event.target.dataset.index;
            this.filterSelectedCategoryGroup(selected, type);
        });

        const addNewFoodButton = document.querySelector('button[data-action="new-blank-food"]');
        addNewFoodButton.addEventListener('click', (event) => {
            const food = event.target.value;
            const action = event.target.dataset.action;
            this.showFoodModal(food, action);
        });

        const uncatLogToggle = document.querySelectorAll('#uncategorised-log-toggle button');
        for(const tog of uncatLogToggle) {
            tog.addEventListener('click', (event) => {
                const action = event.target.dataset.action.trim();
                this.showOrHideLogUncatData(action);
            });
        }
    },

    //==========================================================================
    //-----------   [        FUNCTIONS - STATIC: STANDARD        ]  ------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    filterSelectedCategoryGroup(selected, type) {
        console.log(selected, type);    //eg (breakfast food-category) or (sweets food-group)
        const leftButton = document.getElementById('category-selected');
        const rightButton = document.getElementById('group-selected');
        const leftVal = leftButton.value;
        const rightVal = rightButton.value;
        const allRows = document.querySelectorAll('tr[data-row-id]');
        
        if(leftVal === '...' && rightVal ===  '...') {
            // case 1: '...' on left and '...' on right => un-hide everything
            for(const element of allRows) {
                element.classList.remove('hidden');
            }
            return;

        } else if(leftVal !== '...' && rightVal === '...') {
            // case 2: cat on left and '...' on right => hide-all then unhide cat
            for(const element of allRows) {
                element.classList.add('hidden');
            }
            
            const leftToShow = document.querySelectorAll(`tr[data-mealtime="${leftVal}"]`);
            for(const element of leftToShow) {
                element.classList.remove('hidden');
            }
            return;

        } else if(leftVal === '...' && rightVal !== '...') {
            // case 3: '...' on left and group on right => hide-all then un-hide group
            for(const element of allRows) {
                element.classList.add('hidden');
            }

            const rightToShow = document.querySelectorAll(`tr[data-foodgroup="${rightVal}"]`);
            for(const element of rightToShow) {
                element.classList.remove('hidden');
            }
            return;

        } else if (leftVal !== '...' && rightVal !== '...') {
            // case 4: cat/group means only show if logical && met
            for(const element of allRows) {
                element.classList.add('hidden');
            }

            const leftRightToShow = document.querySelectorAll(`tr[data-mealtime="${leftVal}"][data-foodgroup="${rightVal}"]`);
            for(const element of leftRightToShow) {
                element.classList.remove('hidden');
            }
        }
        return;
    },


    showOrHideLogUncatData(showOrNo){
        const prefsUser = this.preferences.userSelections;
        const isShowData = (showOrNo === 'show-data');
        prefsUser.showUncatLogFoods = isShowData;

        StorageService.savePreferences(this.preferences);
        this.renderUncatLogToggle();
    },

    //==========================================================================
    //-------   [          EVENT LISTENERS - STATIC: MODAL         ]  ----------
    //==========================================================================
    attachStaticModalEventListeners() {
        const closeModalButton = document.querySelectorAll('button[data-action="close-modal"]');
        for(const btn of closeModalButton) {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const saveModalButton = document.querySelector('button[data-action="save-modal"]');
        saveModalButton.addEventListener('click', (event) => {
            const foodName = event.target.dataset.index.trim();

            const foodToCall = HelpHtml.isItEmpty(foodName)? null : foodName;
            console.log(foodToCall);
            this.saveFoodModal(foodToCall);
        });
    },

    //==========================================================================
    //-----------   [         FUNCTIONS - STATIC: MODAL          ]  ------------
    //==========================================================================
    
    //--------- [FUNCTION STATIC MODAL 1] -----------
    closeModal() {
        document.getElementById('food-modal').classList.remove('active');
    },

    //--------- [FUNCTION STATIC MODAL 2] -----------
    saveFoodModal() {
        const foodNameElement = document.querySelector('#food-modal [data-index="name"]');
        const foodName = foodNameElement.value.trim();
        const carb = document.querySelector('#food-modal [data-index="glucose-per-serving"]');
        const foodsArray = this.foodAllArray;
        const modalType = this.modalType;
        console.log(modalType, foodNameElement.disabled);

        if(!foodNameElement.disabled && this.hasNameBeenUsed(foodsArray, foodName)) {
            HelpHtml.showMessage('name must be unique', 'warning');
            return;
        }

        //need carbohydrate >=1 value also
        const carbVal = Number.parseInt(carb.value);
        if(!(carbVal >=1)) return;

        console.log(foodName, foodsArray);

        const newObj = this.fillNewFoodObject();

        if(modalType === 'edit-existing-food') {
            const oldObjIndex = foodsArray.findIndex(obj => obj.name === foodName);
            foodsArray[oldObjIndex] = newObj;

        } else {    //completely new food, or food from given list - either way needs to be pushed into food array
            foodsArray.push(newObj);
            HelpString.sortNames(foodsArray, 'group');
        }        
        
        const prefs = this.preferences;
        prefs.foodArray = foodsArray;
        StorageService.savePreferences(this.preferences);

        this.closeModal();        
        this.renderExtantFoodsTable();        

        return;
    },

    //--------- [MODAL 2.1 HELPER] -----------
    hasNameBeenUsed(array, value) {
        return array.some(obj => obj.name === value);
    },

    //--------- [MODAL 2.2 HELPER] -----------
    fillNewFoodObject() {
        const foodName = document.querySelector('#food-modal [data-index="name"]');
        const glucoseGPerServing = document.querySelector('#food-modal [data-index="glucose-per-serving"]');
        const servingSize = document.querySelector('#food-modal [data-index="food-serving"]');
        const foodGI = document.querySelector('#food-modal [data-index="food-gi"]');
        const foodCat = document.querySelector('#food-modal [data-index="food-category"]');
        const foodGroup = document.querySelector('#food-modal [data-index="food-group"]');
        const notes = document.querySelector('#food-modal [data-index="food-notes"]');

        const foodObj = {
            name: foodName.value,
            glucoseGPerServing: glucoseGPerServing.value,
            serving: servingSize.value,
            foodGI: foodGI.value,
            category: foodCat.value,
            group: foodGroup.value,
            notes: notes.value
        };
        
        return foodObj;
    },

    //==========================================================================
    //-----   [     EVENT LISTENERS - DYNAMIC: MODAL EDIT FOOD        ]  -------
    //==========================================================================
    attachDynamicEditFoodEventListeners(){
        const editFoodButtons = document.querySelectorAll('button[data-action="edit-existing-food"]');
        for(const btn of editFoodButtons) {
            btn.addEventListener('click', (event) => {
                const food = event.target.dataset.index;
                const action = event.target.dataset.action;
                this.showFoodModal(food, action);
            });
        }
        
        const deleteButtons = document.querySelectorAll('[data-action="delete-food"]');
        for(const button of deleteButtons) {
            button.addEventListener('click', (event) => { 
                console.log('button cliecked');
                this.deleteFoodEntry(event.target.dataset.index);
            });
        }
        
        const glucoseInputs = document.querySelectorAll('[data-action="glucose-update-insulin"]');
        for(const input of glucoseInputs) {
            input.addEventListener('change', (event) => {
                console.log(event);

                const element = event.target;
                const food = element.dataset.index;
                const glucose = Number.parseInt(element.value);
                console.log(food, glucose);

                // this.updateCell(event.target.value);
                this.recalculateInsulinFromGlucose(food, glucose);
            });
        }

        const insulinInputs = document.querySelectorAll('[data-action="insulin-update-glucose"]');
        for(const input of insulinInputs) {
            input.addEventListener('change', (event) => {
                const element = event.target;
                const food = element.dataset.index;
                const insulin = Number.parseFloat(element.value);
                console.log(element, food, insulin);

                // this.updateCell(event.target.value);
                this.recalculateGlucoseFromInsulin(food, insulin);
            });
        }

        const updateRefButtons = document.querySelectorAll('[data-action="update-food-ref"]');
        for(const btn of updateRefButtons) {
            btn.addEventListener('click', (event) => {
                const element = event.target;
                const food = element.dataset.index;

                //if click on existing ref, do nothing
                if(element.className.includes('active')) return;
                console.log(element, food);

                // this.updateCell(event.target.value);
                this.updateFoodRef(food);
            });
        }
    },

    //==========================================================================
    //------   [     EVENT LISTENERS - DYNAMIC: MODAL NEW FOOD         ]  ------
    //==========================================================================

    attachDynamicNewFoodEventListeners(){
        const addDictionaryFoodButtons = document.querySelectorAll('button[data-action="new-dictionary-food"]');
        for(const btn of addDictionaryFoodButtons) {
            btn.addEventListener('click', (event) => {
                const food = event.target.dataset.index;
                const action = event.target.dataset.action;
                this.showFoodModal(food, action);
            });
        }
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - DYNAMIC        ]  ----------------
    //==========================================================================

    //------------ [FUNCTION DYNAMIC 1] ---------------
    //for editing in more detail a food
    showFoodModal(food, action){
        console.log(food, action);
        this.modalType = action;
        console.log(this.modalType);
        document.getElementById('food-modal').classList.add('active'); //this makes modal viewable

        //for determining checks with saving modal
        const submitButton = document.querySelector('button[type="submit"]');

        // const heading = document.querySelector('#food-modal #modal-title');
        const name = document.querySelector('#food-modal [data-index="name"]');
        const glucoseGPerServing = document.querySelector('#food-modal [data-index="glucose-per-serving"]');
        const servingSize = document.querySelector('#food-modal [data-index="food-serving"]');
        const foodGI = document.querySelector('#food-modal [data-index="food-gi"]');
        const foodCat = document.querySelector('#food-modal [data-index="food-category"]');
        const foodGroup = document.querySelector('#food-modal [data-index="food-group"]');
        const notes = document.querySelector('#food-modal [data-index="food-notes"]');

        if(action === 'new-blank-food' || action === 'new-dictionary-food') {
            //set this to blank
            submitButton.dataset.index = '';
            console.log(submitButton);
            
            name.value = food;
            name.disabled = false;   //can change
            glucoseGPerServing.value = '';
            servingSize.value = '';
            foodGI.value = 'medium';
            foodCat.value = '';
            foodGroup.value = '';
            notes.value = '';

        } else if (action === 'edit-existing-food') {
            const foodArray = this.foodAllArray;
            const foodObj = foodArray.find(obj => obj.name === food);

            //set this to the existing food
            submitButton.dataset.index = name.value;

            name.value = foodObj.name;
            name.disabled = true;   //must stay same
            glucoseGPerServing.value = foodObj.glucoseGPerServing;
            servingSize.value = foodObj.serving;
            foodGI.value = foodObj.foodGI;
            foodCat.value = foodObj.category;
            foodGroup.value = foodObj.group;
            notes.value = foodObj.notes;
        }
    },

    //------------ [FUNCTION DYNAMIC 2] ---------------
    deleteFoodEntry(food){
        const prefs = this.preferences;
        const foodsArray = prefs.foodArray;

        // fine to delete, but just means won't be able to analyse in certain places
        const deleteIndex = foodsArray.findIndex(obj => obj.name === food);
        foodsArray.splice(deleteIndex, 1);

        StorageService.savePreferences(this.preferences);

        this.renderExtantFoodsTable();
        this.renderUncategorisedLogFoods();
    },

    //------------ [FUNCTION DYNAMIC 3] ---------------
    updateFoodRef(foodName) {
        const allFoodsInactive = document.querySelectorAll('[data-action="update-food-ref"]');
        for(const foodC of allFoodsInactive) {
            foodC.classList.remove('active');
        }

        const prefs = this.preferences;
        const foodsArray = prefs.foodArray;
        const newRefFoodInFoodsArray = foodsArray.find(obj => obj.name === foodName);

        //must have glucose > 0 to be the reference
        const thisGlucose = newRefFoodInFoodsArray?.glucoseGPerServing;
        const hasGlucose = (thisGlucose > 0);
        if(!hasGlucose) return;

        prefs.referenceFood = newRefFoodInFoodsArray;
        StorageService.savePreferences(this.preferences);

        this.renderExtantFoodsTable();
    },

    //------------ [FUNCTION DYNAMIC 4] ---------------
    recalculateInsulinFromGlucose(food, value) { //eg banana 50 glucosePer1U or banana 5 insulinPerServe
        // glucose being selected gets changed in food array and saved
        // insulin being calculated gets changed in html
        // refresh table
        const foodArray = this.foodAllArray;
        const foodObj = foodArray.find(obj => obj.name === food);

        foodObj.glucoseGPerServing = value;
        console.log(foodObj);
        
        //will contain previous timezone                
        // const foodObject = foods.find(obj => obj.name === element.dataset.index);
        // const newTz = element.value;

        // foodObject.timezone = newTz;
        const prefs = this.preferences;
        prefs.foodArray = this.foodAllArray;
        StorageService.savePreferences(this.preferences);

        this.renderExtantFoodsTable();
    },

    //------------ [FUNCTION DYNAMIC 5] ---------------
    recalculateGlucoseFromInsulin(food, value) {
        console.log('recalculating glucose');

        const foodArray = this.foodAllArray;
        const foodObj = foodArray.find(obj => obj.name === food);
        const tzFactor = HelpTz.getGlucosePer1U(food);
        console.log(tzFactor, foodArray, foodObj);

        // insulinU * (servgluc/1U) = insulinRatio * servGluc. E.g 5U * (10g/1U) = 50g
        const newGlucose = value*tzFactor;
        console.log(value, newGlucose);

        foodObj.glucoseGPerServing = newGlucose;

        const prefs = this.preferences;
        prefs.foodArray = this.foodAllArray;
        StorageService.savePreferences(this.preferences);

        this.renderExtantFoodsTable();
    },

    // ***** just ideas ****
    //for showing the dates the food has been entered for
    //maybe just show dates in current Log Entry Month or most recent 5
    showLogFoodModal(){
    },    
    // eslint-disable-next-line no-unused-vars
    listDaysFoodUsedOn(food) {
        //click a new button in 3rd section to show which dates food has been used
    },    
};

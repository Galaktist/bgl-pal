/*  FOOD DATABASE STRUCTURE  
**  ============================================================================
**  DECLARE
**  
**  tests -> from Storage
**  models -> from Storage
**  preferences
**  insulinNameOptions
**  bglStepMin
**  activeBadge -> for flagging whether to switch clicked test/model to active
**  
**  ============================================================================
**  RENDERING
**  
**  InsulinNames
**  InsulinProfiles
**  StepMinBglHtml
**  Models
**  Tests
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC: STANDARD
**  
**  ============================================================================
**  FUNCTIONS - STATIC: STANDARD
**  
**  saveInsSpeedInput -> for the top box area
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC: MODAL
**  
**  ============================================================================
**  FUNCTIONS - STATIC: MODAL -> 1. OPEN
**  
**  showTestModal
**  showModelModal
**  
**  ============================================================================
**  FUNCTIONS - STATIC: MODAL -> 2. ADD TEST ROWS
**  
**  showExistingTestRows
**  addTestRow
**  generateNewTestTimeTd -> td i.e. html/CSS data cell
**  generateNewTestBglTd -> td i.e. html/CSS data cell
**  
**  ============================================================================
**  FUNCTIONS - STATIC: MODAL -> 3. SAVE TEST/MODEL
**  
**  saveTest
**  fillTestArray
**    -> countTempTestRows
**    -> removeTempTestRows
**    -> insulinOnBoard
**  
**  saveModel
**  fillModelArray
**  
**  hasNameBeenUsed
**  
**  ============================================================================
**  FUNCTIONS - STATIC: MODAL -> 4. CLOSE TEST/MODEL
**  closeModelModal, closeTestModal
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC: TEST EVENTS
**  
**  ============================================================================
**  EVENT LISTENERS - DYNAMIC: MODEL EVENTS
**  
**  ============================================================================
**  FUNCTIONS - DYNAMIC: MODELS/TESTS
**  
**  deleteModel
**  pasteModelToDefaultProfiles
**  
**  deleteTest
**  
**  deactivateButton
**  drawNewButton
**  deleteCharts
**  drawGraph
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

export const InsulinSpeedView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    tests: [],
    models: [],
    preferences: [],
    insulinNameOptions: [],
    bglStepMin: [], //call once to get the relevant step/min stuff
    activeBadge: null,

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');
        
        fetch('b7InsulinSpeed.html')
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
        //this had to be set to null to work or it 'remembered' after closing
        this.activeBadge = [
            {buttonType: 'chart-model', id: null},
            {buttonType: 'chart-test', id: null}
        ];
        
        this.renderAllSections();
        this.attachStaticStandardEventListeners();
        this.attachStaticModalEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderAllSections() {
        this.renderInsulinNames();
        this.renderInsulinProfiles();
        this.renderStepMinBglHtml();
        this.renderModels();
        this.renderTests();
    },

    //---------------- [RENDER 1] ------------------
    renderInsulinNames() {
        const prefs = this.preferences;
        const insArr = prefs.insulinArray;
        
        const insSelect = document.querySelectorAll('[data-action="insulin-drop-down"] option');

        for(const item of insSelect) {
            const insObj = insArr.find(obj => obj.speed === item.dataset.index);
            const insName = insObj.name;

            this.insulinNameOptions.push(insName);
            item.value = insName;
            item.textContent = insName;
        }
    },

    //---------------- [RENDER 2] ------------------
    renderInsulinProfiles() {
        const prefs = this.preferences;

        // insulin names for keys + object of objects - object of objects
        const insArr = prefs.insulinArray;
        
        //set names
        const insName = document.querySelectorAll('#insulin-profiles-tbody .insulin-name');
        for(const element of insName) {
            const speedLookup = element.dataset.index;

            const myStoredObj = insArr.find(item => item.speed === speedLookup);
            element.textContent = myStoredObj.name;
        }
        
        //set kick-in times
        const insKickHtml = document.querySelectorAll('#insulin-profiles-tbody .insulin-kickin-input');
        for(const element of insKickHtml) {
            const speedLookup = element.dataset.index; //eg 'rapid'
            
            const myStoredObj = insArr.find(item => item.speed === speedLookup);
            element.value = myStoredObj.timeToKickIn;
        }
        
        //set total times
        const insTotalHtml = document.querySelectorAll('#insulin-profiles-tbody .insulin-duration-input');
        for(const element of insTotalHtml) {
            const speedLookup = element.dataset.index; //eg 'insulin-1'
            
            const myStoredObj = insArr.find(item => item.speed === speedLookup);
            element.value = myStoredObj.totalHours;
        }
    },

    //---------------- [RENDER 3] ------------------
    renderStepMinBglHtml(){
        const bglArray = this.bglStepMin;
        const step = bglArray.step;
        const min = bglArray.min;
        const unit = bglArray.unit;
        
        let startPlaceholder;
        let endPlaceholder;
        if(unit === 'mmol/L') {
            startPlaceholder = 'start bgl, eg 20';
            endPlaceholder = 'end bgl, eg 10';
        } else {
            startPlaceholder = 'start bgl, eg 400';
            endPlaceholder = 'end bgl, eg 200';
        }

        console.log(bglArray);
        
        const bglHeading = document.getElementById('label-bgl-unit');
        bglHeading.textContent = `bgl (${unit})`;

        const startBgl = document.querySelector('[data-index="start-bgl"]');
        startBgl.placeholder = startPlaceholder;
        startBgl.step = step;
        startBgl.min = min;

        const endBgl = document.querySelector('[data-index="end-bgl"]');
        endBgl.placeholder = endPlaceholder;
        endBgl.step = step;
        endBgl.min = min;
    },

    //---------------- [RENDER 4] ------------------
    renderModels() {
        // console.log('loading models');
        this.models = StorageService.getInsulinSpeedModels();
        // console.log(this.models);
        const tbody = document.getElementById('models-tbody');

        if (this.models.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No models created yet. Click "add model" to create one.</td></tr>';
            return;
        }

        tbody.innerHTML = this.models.map(model => `
            <tr>
                <td><button class="badge warning" data-action="chart-model" data-index="${model.id}" title="Display">${model.name}</button></td>    
                <td>
                    <button data-action="paste-default" data-index="${model.id}">use
                </td>
                <td>   
                    <button class="icon-button edit" data-action="edit-model" data-index="${model.id}" title="Edit"></button>                    
                    <button class="icon-button delete" data-action="delete-model" data-index="${model.id}" title="Delete"></button>
                </td>
            </tr>
        `).join('');

        this.attachDynamicModelEventListeners();
    },

    //---------------- [RENDER 5] ------------------
    renderTests() {
        this.tests = StorageService.getInsulinSpeedTests();
        const tbody = document.getElementById('tests-tbody');

        if (this.tests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No tests created yet. Click "add test" to create one.</td></tr>';
            return;
        }

        tbody.innerHTML = this.tests.map(test => `
            <tr>
                <td><button class="badge primary" data-action="chart-test" data-index="${test.id}" title="Display">${test.name}</button></td>              
                <td>   
                    <button class="icon-button edit" data-action="edit-test" data-index="${test.id}" title="Edit"></button>                    
                    <button class="icon-button delete" data-action="delete-test" data-index="${test.id}" title="Delete"></button>
                </td>
            </tr>
        `).join('');

        this.attachDynamicTestEventListeners();
    },

    //==========================================================================
    //-------   [        EVENT LISTENERS - STATIC: STANDARD        ]  ----------
    //==========================================================================
    attachStaticStandardEventListeners(){
        //autosave insSpeed changes
        const insSpeedInput = document.querySelectorAll('#insulin-profiles-tbody input');
        for(const inpt of insSpeedInput) {
            inpt.addEventListener('blur', (event) => {
                const element = event.target; //gives element on which box clicked eg class='insulin-kickin-input', data-index='insulin1' etc
                const value = event.target.value;  //gives the new value
                this.saveInsSpeedInput(element, value);
            });
        }
    },

    //==========================================================================
    //-----------   [        FUNCTIONS - STATIC: STANDARD        ]  ------------
    //==========================================================================

    //---------------- [FUNCTION STATIC 1] ------------------
    saveInsSpeedInput(element, value) {
        const insArray = this.preferences.insulinArray;
        const insSpeed = element.dataset.index;    //eg rapid
        const insObject = insArray.find(obj => obj.speed === insSpeed);

        if(element.className === 'insulin-kickin-input') {
            insObject.timeToKickIn = value;
        }
        
        if(element.className === 'insulin-duration-input') {
            insObject.totalHours = value;
        }

        StorageService.savePreferences(this.preferences);
        this.renderInsulinProfiles();
    },

    //==========================================================================
    //-------   [          EVENT LISTENERS - STATIC: MODAL         ]  ----------
    //==========================================================================
    attachStaticModalEventListeners(){
        this.addTestModelButtonListeners();
        this.saveTestModelButtonListeners();
        this.addNewTestRowsButtonListeners();
        this.closeModalButtonListeners();
    },

    //--------- [EVENT LISTENERS 1 ADD TEST/MODEL] ---------
    addTestModelButtonListeners() {
        const addTestModelButtons = document.querySelectorAll('button[data-action="open-modal"]');
        // console.log(addTestModelButtons);
        for(const element of addTestModelButtons) {
            const action = element.dataset.index;
            // console.log(action);

            element.addEventListener('click', () => {
                if(action === 'add-test'){
                    this.showTestModal(action);
                    // this.attachActionsNewEventListener();
                } else if (action === 'add-model'){
                    this.showModelModal(action);
                    // this.attachActionsNewEventListener();
                }                
            });            
        }
    },

    //--------- [EVENT LISTENERS 2 SAVE TEST/MODEL] ---------
    saveTestModelButtonListeners() {
        const saveTestModelButtons = document.querySelectorAll('button[type="submit"]');
        for(const btn of saveTestModelButtons) {
            btn.addEventListener('click', (event) => {
                console.log(event);
                const type = event.target.dataset.action;  //whether 'save-test' or 'save-model'
                
                console.log(event.target.dataset.index);    //either a number or 'add-model' or 'add-test'
                
                const idToCall = (event.target.dataset.index === '' || event.target.dataset.index === undefined?
                    null: event.target.dataset.index);

                switch(type) {
                    case 'save-test': {
                        const heading = document.querySelector('#test-modal h3');
                        const action = heading.textContent === 'edit test'? 'edit' : 'new';
                        this.saveTest(action, idToCall);
                        break;
                    }

                    case 'save-model': {
                        const heading = document.querySelector('#model-modal h3');
                        const action = heading.textContent === 'edit model'? 'edit' : 'new';                    
                        this.saveModel(action, idToCall);
                        break;
                    }
                }
            });
        }
    },

    //--------- [EVENT LISTENERS 3 ADD NEW TEST ROWS] ---------
    addNewTestRowsButtonListeners(){
        // const addTestRowButton = document.querySelector('#test-me');
        const addTestRowButton = document.querySelector('form .middle-test-row');
        console.log(addTestRowButton);
        addTestRowButton.addEventListener('click', () => {
            console.log('do something');
            this.addTestRow();
        });
    }, 

    //--------- [EVENT LISTENERS 4 CLOSE TEST/MODEL] ---------
    closeModalButtonListeners(){
        //close the modal
        const closeModalButtons = document.querySelectorAll('button[data-action="close-modal"]');
        console.log(closeModalButtons);
        for(const btn of closeModalButtons) {
            const modalType = btn.dataset.index;
            btn.addEventListener('click', () => {
                modalType === 'model'? this.closeModelModal() : this.closeTestModal();
            });
        }
    },

    //==========================================================================
    //-------   [       FUNCTIONS - STATIC: MODAL -> 1. OPEN          ]  -------
    //==========================================================================
    
    //--------- [FUNCTION STATIC MODAL OPEN 1 - NEW/EDIT TEST] -----------
    showTestModal(action, testId) {
        document.querySelector('#test-modal').classList.add('active'); //this makes modal viewable

        const heading = document.querySelector('#test-modal h3');
        const name = document.querySelector('#test-modal #test-entry-name');
        const insType = document.querySelector('#test-modal #test-entry-insulin-type');
        const startTime = document.querySelector('#test-modal [data-index="start-test-time"]');
        const startBgl = document.querySelector('#test-modal [data-index="start-bgl"]');
        const endTime = document.querySelector('#test-modal [data-index="end-test-time"]');
        const endBgl = document.querySelector('#test-modal [data-index="end-bgl"]');

        if(action === 'add-test') {
            heading.textContent = 'test data';
            name.value = '';
            insType.value = this.insulinNameOptions[0];
            startTime.value = '';
            endTime.value = '';
            startBgl.value = '';
            endBgl.value = '';

        } else if (action === 'edit-test') {
            const test = this.tests.find(obj => obj.id === testId);
            if (!test) return;

            //add this index (for saving)
            document.querySelector('#test-modal button[type="submit"]').dataset.index = testId;

            const start = test.dataPoints.find(obj => obj.id === 'startTest');
            const end = test.dataPoints.find(obj => obj.id === 'endTest');

            heading.textContent = 'edit test';
            name.value = test.name;
            insType.value = test.insulinType;
            startTime.value = start.time;
            endTime.value = end.time;
            startBgl.value = start.bgl;
            endBgl.value = end.bgl;

            this.showExistingTestRows(test);
        }
    },
    
    //--------- [FUNCTION STATIC MODAL OPEN 2 - NEW/EDIT MODEL] -----------
    showModelModal(action, modelId) {
        document.querySelector('#model-modal').classList.add('active'); //this makes modal viewable

        const heading = document.querySelector('#model-modal h3');
        const name = document.querySelector('#model-modal #model-entry-name');
        const insType = document.querySelector('#model-modal #model-entry-insulin-type');
        const kickIn = document.querySelector('#model-modal #entry-kick-in');
        const stop = document.querySelector('#model-modal #entry-stop');

        if(action === 'add-model') {
            heading.textContent = 'model data';
            name.value = '';
            insType.value = this.insulinNameOptions[0];
            kickIn.value = '';
            stop.value = '';

        } else if(action === 'edit-model') {
            const model = this.models.find(obj => obj.id === modelId);
            if (!model) return;

            //add this index (for saving)
            document.querySelector('#model-modal button[type="submit"]').dataset.index = modelId;

            heading.textContent = 'edit model';
            name.value = model.name;
            insType.value = model.insulinType;
            kickIn.value = model.timeToKickIn;
            stop.value = model.totalHours;
        }
    },

    //==========================================================================
    //-----   [     FUNCTIONS - STATIC: MODAL -> 2. ADD TEST ROWS     ]  -------
    //==========================================================================
    
    //--------- [FUNCTION STATIC MODAL 1 - ADD ROWS: SHOW] -----------
    showExistingTestRows(test) {
        //get array of the ids of the middle objects
        const numberOfMiddleRows = test.dataPoints.length - 2;

        //no need to do anything if  no middle rows
        if(numberOfMiddleRows === 0){
            return;
        }
        
        //now want to forEach loop but skip first and last indexes
        for(let i = 1; i <= numberOfMiddleRows ; ++i) {
            const index = `midTest_${i}`;            
            const midTesti = HelpComplex.findObjectById(test.dataPoints, index);

            this.addTestRow(); //adds row with data-index from midTest eg midTest_1_time, midTest_1_bgl

            //call up the test row just created and insert the values
            document.querySelector(`#test-modal [data-index="${index}_time"]`).value = midTesti.time;
            document.querySelector(`#test-modal [data-index="${index}_bgl"]`).value = midTesti.bgl;
        }
    },
    
    //--------- [FUNCTION STATIC MODAL 2 - ADD ROWS: ADD] -----------
    addTestRow() { 
        const tbody = document.getElementById('test-entry-tbody');
        const targetRow = document.getElementById('last-test-row');

        //create new row element
        const newRow = document.createElement('tr');
        newRow.className = 'data-row middle-row';

        //count number of existing extra rows in tbody: start + end=2, ie subtract 1 to take off the start/end
        const midIndex = tbody.rows.length -1;
        
        //create a td and insert HTML content using innerHTML
        const newTimeCell = document.createElement('td');
        const newBglCell = document.createElement('td');

        //set colspan if necessary to span multiple columns
        newTimeCell.innerHTML = this.generateNewTestTimeTd(midIndex);
        newBglCell.innerHTML = this.generateNewTestBglTd(midIndex);

        //append cells to the row
        newRow.append(newTimeCell);
        newRow.append(newBglCell);

        //use insertBefore to place the new row exactly where needed
        targetRow.before(newRow);
        // tbody.insertBefore(newRow, targetRow);
    },

    //--------- [HELPER 2.1 FOR ADD ROWS: ADD] -----------
    generateNewTestTimeTd(midIndex){
        return `
            <input type="time" 
                data-index="midTest_${midIndex}_time" 
                value=""
                required
            >
        `;
    },

    //--------- [HELPER 2.2 FOR ADD ROWS: ADD] -----------
    generateNewTestBglTd(midIndex){
        const bglArray = this.bglStepMin;
        const step = bglArray.step;
        const min = bglArray.min;
        const unit = bglArray.unit;
        
        const placeholder = unit === 'mmol/L'? 'middle bgl, eg 15' : 'middle bgl, eg 300';
        
        return `
            <input type="number" 
                data-index="midTest_${midIndex}_bgl"
                value=""
                placeholder="${placeholder}"
                min="${min}"
                step="${step}"
                required
            >     
        `;
    },

    //==========================================================================
    //-----   [     FUNCTIONS - STATIC: MODAL -> 3. SAVE TEST/MODEL     ]  -----
    //==========================================================================

    //--------- [FUNCTION STATIC MODAL 1 SAVE - TEST] -----------
    saveTest(action, testId) {        
        const tests = this.tests;
        const test = action === 'new'? null : tests.find(obj => obj.id === testId);
        const name = document.querySelector('#test-modal #test-entry-name').value;
        console.log(action, test);
        
        if(!name) {
            HelpHtml.showMessage('name required', 'warning');
            return;

        } else if(test !== null && test.name === name) {
            console.log('still the same old name');

        } else if(this.hasNameBeenUsed(tests, name)) {
            console.log('name has been used elsewhere');
            HelpHtml.showMessage('name must be unique', 'warning');
            return;

        } else if(test !== null && test.name !== name) {
            test.name = name;    //overwrite existing name
        }
        
        //save changed test array in tests
        this.fillTestArray(test, name);

        StorageService.saveInsulinSpeedTests(this.tests);        
        HelpHtml.showMessage('test saved successfully');
        this.closeTestModal();
        this.renderTests();
    },

    //--------- [HELPER 1.1 SAVE - TEST - FILL ARRAY W INFO] -----------
    fillTestArray(test, name) {
        //get all the temporary rows
        const middleValues = document.querySelectorAll('#test-modal .middle-row');
        const insulinType = document.querySelector('#test-modal #test-entry-insulin-type').value;
        const startTime = document.querySelector('#test-modal [data-index="start-test-time"]').value;
        const startBgl = document.querySelector('#test-modal [data-index="start-bgl"]').value;
        const endTime = document.querySelector('#test-modal [data-index="end-test-time"]').value;        
        const endBgl = document.querySelector('#test-modal [data-index="end-bgl"]').value;

        // FILL START
        const testsArray = [];
        testsArray.push({
            id: 'startTest',
            time: startTime,
            bgl: startBgl,
            hrsFromStart: 0,
            insulinOnBoardPercent: 100
        });

        // FILL MIDDLE
        const count = this.countTempTestRows();
        if(count !== 0){
            for(const [index, row] of middleValues.entries()) {
                const time = row.querySelector('input[type="time"]').value;
                const bgl = row.querySelector('input[type="number"]').value;
                const hrsStart = HelpDateTime.calculateHoursDifference(time, startTime);
                const insulinPercent = this.insulinOnBoard(startBgl, bgl, endBgl);
                
                console.log(time, bgl, hrsStart, insulinPercent);
                testsArray.push({
                    id: `midTest_${index + 1}`,
                    time: time,
                    bgl: bgl,
                    hrsFromStart: hrsStart,
                    insulinOnBoardPercent: insulinPercent
                });
            }
        }

        // FILL END
        testsArray.push({
            id: 'endTest',
            time: endTime,
            bgl: endBgl,
            hrsFromStart: HelpDateTime.calculateHoursDifference(endTime, startTime),
            insulinOnBoardPercent:0
        });

        // WRITE TO THIS.TESTS
        if(test === null) { // THIS IS A NEW OBJECT
            console.log(HelpDateTime.secondsSince2016());
            const newTest = {
                id: `${HelpDateTime.secondsSince2016()}`,
                name: name,
                insulinType: insulinType,
                dataPoints: testsArray,
            };

            this.tests.push(newTest);
            return newTest;

        } else {    //EXISTING OBJECT - KEEP ID SAME            
            test.name = name;
            test.insulinType = insulinType;
            test.dataPoints = testsArray;
            return test;
        }
    },

    //--------- [HELPER 1.2 SAVE - TEST ROWS] -----------
    countTempTestRows() {
        const tempRowCount = document.querySelectorAll('tr.middle-row').length;
        console.log(tempRowCount);
        return tempRowCount;
    },
    
    //--------- [HELPER 1.3 SAVE - TEST ROWS] -----------
    removeTempTestRows() {
        console.log('removing tempTest rows');
        const rowsToRemove = document.querySelectorAll('tr.middle-row');
        
        for(const row of rowsToRemove) {
            row.remove();
        }

        console.log(document.getElementById('test-entry-tbody'));
    },

    //--------- [HELPER 1.4 SAVE - TEST - CALCULATE % FOR STAGES] -----------
    insulinOnBoard(startBgl, midBgl, endBgl) {
        const midBglFromEnd = midBgl - endBgl;
        const totalBglChange = startBgl - endBgl;
        return Math.round(100*midBglFromEnd/totalBglChange);
    },  
    
    //--------- [FUNCTION STATIC MODAL 2 SAVE - MODEL] -----------
    saveModel(action, modelId) {
        console.log(modelId);
        const models = this.models;
        const model = action === 'new'? null : models.find(obj => obj.id === modelId);
        console.log(model, models);
        const name = document.querySelector('#model-modal #model-entry-name').value;
        const timeToKickIn = Number.parseFloat(document.querySelector('#model-modal #entry-kick-in').value);
        const totalHours = Number.parseFloat(document.querySelector('#model-modal #entry-stop').value);
        
        if(!name) {
            HelpHtml.showMessage('name required', 'warning');
            return;

        } else if(model !== null && model.name === name) {
            console.log('still the same old name');

        } else if(this.hasNameBeenUsed(models, name)) {
            console.log('name has been used elsewhere');
            HelpHtml.showMessage('name must be unique', 'warning');
            return;

        } else if(model !== null && model.name !== name) {
            model.name = name;    //overwrite existing name
        }

        // end must be later than start
        if (totalHours <= timeToKickIn) {
            HelpHtml.showMessage('stop must be after kick-in time', 'error');
            return;
        }

        //save changed test array in tests
        this.fillModelArray(model, name);

        StorageService.saveInsulinSpeedModels(this.models);       
        HelpHtml.showMessage('Model saved successfully');
        this.closeModelModal();
        this.renderModels();
    },

    //--------- [HELPER 2.1 SAVE - MODEL - FILL ARRAY W INFO] -----------
    fillModelArray(model, name) {
        const insulinType = document.querySelector('#model-modal #model-entry-insulin-type').value;
        const timeToKickIn = Number.parseFloat(document.querySelector('#model-modal #entry-kick-in').value);
        const totalHours = Number.parseFloat(document.querySelector('#model-modal #entry-stop').value);

        // WRITE TO THIS.MODELS
        if(model === null) { // THIS IS A NEW OBJECT
            const newModel = {
                id: `${HelpDateTime.secondsSince2016()}`,
                name: name,
                insulinType: insulinType,
                timeToKickIn: timeToKickIn,
                totalHours: totalHours,
            };

            this.models.push(newModel);
            return newModel;

        } else {    //EXISTING OBJECT - KEEP ID SAME            
            model.name = name;
            model.insulinType = insulinType;
            model.timeToKickIn = timeToKickIn;
            model.totalHours = totalHours;
            return model;
        }
    },

    //--------- [FUNCTION 3 SAVE - TEST/MODEL - CHECK NAME UNIQUE] -----------
    hasNameBeenUsed(array, value) {
        return array.some(obj => obj.name === value);
    },

    //==========================================================================
    //-----   [     FUNCTIONS - STATIC: MODAL -> 4. CLOSE TEST/MODEL     ]  ----
    //==========================================================================
    
    closeModelModal() {
        document.getElementById('model-modal').classList.remove('active');
    },

    closeTestModal() {
        document.getElementById('test-modal').classList.remove('active');
        this.removeTempTestRows();
    },

    //==========================================================================
    //-------   [     EVENT LISTENERS - DYNAMIC: TEST EVENTS        ]  ---------
    //==========================================================================
    //load the row listeners every time test display is reloaded
    attachDynamicTestEventListeners(){
        const displayButtons = document.querySelectorAll('[data-action="chart-test"]');
        console.log(displayButtons);
        for(const btn of displayButtons) {
            btn.addEventListener('click', (event) => {
                const clickedButton = event.target;
                const buttonId = event.target.dataset.index;      //id eg 289789645
                const buttonType = event.target.dataset.action;  //'chart-model'
                const storedBadgeType = this.activeBadge.find(obj => obj.buttonType === buttonType);

                //deactivate badge if clicked again
                if(buttonId === storedBadgeType.id) {
                    this.deactivateButton(clickedButton, storedBadgeType);
                    this.drawGraph(buttonId, buttonType, 'delete');
                } else {//different button clicked, so draw the display                    
                    this.drawNewButton(clickedButton, storedBadgeType, buttonId);
                    this.drawGraph(buttonId, buttonType);
                };
            });
        }

        //check this works when ready
        const editTestButtons = document.querySelectorAll('button[data-action="edit-test"]');
        for(const btn of editTestButtons) {
            btn.addEventListener('click', (event) => {
                const testId = event.target.dataset.index;
                const action = event.target.dataset.action;
                this.showTestModal(action, testId);
            });            
        }

        const deleteTestButtons = document.querySelectorAll('button[data-action="delete-test"]');
        for(const btn of deleteTestButtons) {
            btn.addEventListener('click', (event) => {
                const testId = event.target.dataset.index;
                this.deleteTest(testId);
            });
        }
    },    

    //==========================================================================
    //-------   [     EVENT LISTENERS - DYNAMIC: MODEL EVENTS        ]  --------
    //==========================================================================
    //load the row listeners every time model display is refreshed
    attachDynamicModelEventListeners(){
        const displayButtons = document.querySelectorAll('[data-action="chart-model"]');
        for(const btn of displayButtons) {
            btn.addEventListener('click', (event) => {
                const clickedButton = event.target;
                const buttonId = event.target.dataset.index;      //id eg 289789645
                const buttonType = event.target.dataset.action;  //'chart-model'
                const storedBadgeType = this.activeBadge.find(obj => obj.buttonType === buttonType);
                console.log(storedBadgeType, buttonId);

                //deactivate badge if clicked again
                if(buttonId === storedBadgeType.id) {
                    console.log(buttonId, storedBadgeType.id, 'in here');
                    this.deactivateButton(clickedButton, storedBadgeType);
                    this.drawGraph(buttonId, buttonType, 'delete');
                } else {//different button clicked, so draw the display                    
                    this.drawNewButton(clickedButton, storedBadgeType, buttonId);
                    this.drawGraph(buttonId, buttonType);
                };
            });
        }
        
        const pasteModelToDefaults = document.querySelectorAll('button[data-action="paste-default"]');
        for(const btn of pasteModelToDefaults) {
            btn.addEventListener('click', (event) => {
                const modelId = event.target.dataset.index;
                console.log(modelId);
                this.pasteModelToDefaultProfiles(modelId);
            });
        }
                
        const editModelButtons = document.querySelectorAll('button[data-action="edit-model"]');
        for(const btn of editModelButtons) {
            btn.addEventListener('click', (event) => {
                const modelId = event.target.dataset.index;
                const action = event.target.dataset.action;
                this.showModelModal(action, modelId);
                console.log(modelId);
            });            
        }

        const deleteModelButtons = document.querySelectorAll('button[data-action="delete-model"]');
        for(const btn of deleteModelButtons) {
            btn.addEventListener('click', (event) => {
                const modelId = event.target.dataset.index;
                this.deleteModel(modelId);
            });
        }
    },

    //==========================================================================
    //------------   [   FUNCTIONS - DYNAMIC: MODELS/TESTS    ]  ---------------
    //==========================================================================

    //------------ [FUNCTIONS 1 DYNAMIC MODELS] ---------------
    //----- [FUNCTION 1.1] -----
    deleteModel(id) {
        if (!HelpHtml.confirm('delete this model?')) return;

        this.models = this.models.filter(m => m.id !== id);
        StorageService.saveInsulinSpeedModels(this.models);
        
        HelpHtml.showMessage('Model deleted');
        this.renderModels();
    },

    //----- [FUNCTION 1.2] -----
    pasteModelToDefaultProfiles(id) {
        const model = this.models.find(obj => obj.id === id);
        if (!model) return;

        //get preferences and model info to overwrite
        const insArray = this.preferences.insulinArray;
        const insulinName = model.insulinType;
        console.log(insulinName);
        
        //alter names slightly - need a better system of course
        const timeToKickIn = model.timeToKickIn;
        const totalHours = model.totalHours;

        const insObj = insArray.find(obj => obj.name === insulinName);
        insObj.timeToKickIn = timeToKickIn;
        insObj.totalHours = totalHours;

        HelpHtml.showMessage('Default Values updated with model data', 'success');

        this.renderInsulinProfiles();

        StorageService.savePreferences(this.preferences);
    },


    //------------ [FUNCTIONS 2 DYNAMIC TESTS] ---------------
    deleteTest(id) {
        if (!HelpHtml.confirm('delete this test?')) return;
        console.log(id);

        this.tests = this.tests.filter(m => m.id !== id);
        StorageService.saveInsulinSpeedTests(this.tests);
        
        HelpHtml.showMessage('test deleted');
        this.renderTests();
    },


    //------------ [FUNCTIONS 3 DYNAMIC TESTS/MODELS] ---------------
    //----- [FUNCTION 3.1] -----
    deactivateButton(clickedButton, storedBadgeType) {
        clickedButton.classList.remove('active');        
        storedBadgeType.id = null;
    },

    //----- [FUNCTION 3.2] -----
    drawNewButton(clickedButton, storedBadgeType, buttonId) {
        //first remove any existing active state on the same buttonType if not null
        if(storedBadgeType.id !== null) {
            const storedBadgeButton = document.querySelector(`[data-index="${storedBadgeType.id}"]`);
            storedBadgeButton.classList.remove('active');
        }

        //draw new button (empties out html)
        clickedButton.classList.add('active');
        storedBadgeType.id = buttonId; //overwrite as the new activeBadge for model/test
    },    

    //----- [FUNCTION 3.3] -----
    deleteCharts(containerId, buttonType) {
        const container = document.querySelector(containerId);
        if (!container) return;
        
        // DELETE CHART
        const chartGroupToDelete = document.querySelector(`#model-test-line-chart svg g[id="${buttonType}"]`);
        chartGroupToDelete.remove();

        // CHECK ANY REMAINING CHARTS TO SHOW
        const remainingChartGroups = document.querySelectorAll('#model-test-line-chart [id="chart-test"], #model-test-line-chart [id="chart-model"]');
        if(remainingChartGroups.length === 0) {
            HelpHtml.clearHtmlCode(containerId);
            // document.querySelector('#model-test-line-chart .full-state').classList.add('hidden');
            document.querySelector('#model-test-line-chart .empty-state').classList.remove('hidden');
        }

        console.log(document.querySelector(containerId));
        return;
    },

    //----- [FUNCTION 3.4] -----
    drawGraph(id, buttonType, deleteAction) {
        const containerId = '#model-test-line-chart .full-state';
        // const fullState = document.getElementById('full-state-line-chart').classList;
        const emptyState = document.querySelector('#model-test-line-chart .empty-state').classList;

        // fullState.remove('hidden');
        emptyState.add('hidden');

        let data;
        
        // RENDER EMPTY IF REMOVING CHART
        if(deleteAction === 'delete') {          
            ChartComponent.createSpeedModelTest(containerId, [], buttonType);
            this.deleteCharts(containerId, buttonType);
            return; //missing this return before so was running 2x
        }
        
        if(buttonType === 'chart-model') {            
            const model = this.models.find(obj => obj.id === id);
            
            data = [
                {x: 0, y: 100, pathClass: 'color-secondary', circleClass: 'color-secondary'},
                {x: model.timeToKickIn, y: 100, pathClass: 'color-secondary', circleClass: 'color-secondary'},
                {x: model.totalHours, y: 0, pathClass: 'color-secondary', circleClass: 'color-secondary'}
            ];

        } else if((buttonType === 'chart-test')) {
            const test = this.tests.find(obj => obj.id === id);

            data = test.dataPoints.map(row => ({
                x: row.hrsFromStart,
                y: row.insulinOnBoardPercent,
                circleClass: 'color-primary'
            }));
        }

        ChartComponent.createSpeedModelTest(containerId, data, buttonType);
        console.log(document.querySelector(containerId));
        return;
    },    
};

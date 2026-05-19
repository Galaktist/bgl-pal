/*  CHART HELPERS STRUCTURE
**  ============================================================================
**  ticking axes, drawing axes, calculating regression, etc.
**  
**  ============================================================================
**  CHART BUILDER IN SEPARATE FILE -> 1700 lines
**  
**  ============================================================================
**  SCALE HELPER
**  calculate (and re-calculate) scaled numbers based on shape of chart and
**  new maxes
**  
**  ============================================================================
**  OPTIONS HELPER -> padding around chart, font size, svg id
**  
**  OPTIONS HELPERS 1: ADD OPTIONS DETAILS TO CHART
**  
**  TIME OF DAY RATIO OPTIONS
**  INSULIN SPEED OPTIONS
**  EXERCISE OPTIONS
**  FOOD OPTIONS
**  CALCULATOR OPTIONS
**  WEEK PATTERN OPTIONS -> including dash page options (v small)
**  
**  ============================================================================
**  REGRESSION HELPER
**  
**  REGRESS HELPERS 1: GET REGRESSION DATA
**  HELPER 1.1: CALCULATE REGRESSION
**  HELPER 1.2: ADD REGRESS LINE DATA
**  
**  ============================================================================
**  CHART GROUP ADDITIONS HELPER
**  
**  GROUP HELPERS 1: CREATE SVG
**  HELPER 1.1: MAIN TYPE OF SVG
**  HELPER 1.2: SMALLER DASH SVG
**  
**  GROUP HELPERS 2: CIRCLE G COMPONENT
**  
**  GROUP HELPERS 3: LINE G COMPONENT
**  HELPER 3.1: LINEAR LINE WITH INFO ON Y/X-INTERCEPT
**  HELPER 3.2: LINE WITH MINIMAL INFO
**  HELPER 3.3: PATHS
**    -> 3.3A: GET PATH DATA
**    -> 3.3B: ADD IT TO CHART GROUP
**    -> 3.3C: SIMPLE 1-PATH
**  
**  ============================================================================
**  CHART AXES HELPER
**  
**  AXES HELPERS 1: GET AXIS LABELS
**  AXES HELPERS 2: DRAW AXES
**  AXES HELPERS 3: LABELLING MAX NUMBERS
**  
**  AXES HELPERS 4: LABEL TEXT ON AXES
**  HELPER 4.1: LABEL BOTH AXES
**  HELPER 4.2: LABEL X-AXIS
**  HELPER 4.3: LABEL Y-AXIS
**  
**  AXES HELPERS 5: TICK AXES
**  HELPER 5.1: TICK START/END RANGE
**  HELPER 5.2: TICK AT MAX
**  HELPER 5.3: TICK STANDARD WITH ARRAY
**  HELPER 5.4: TICK TO LINE UP WITH BARS
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpConvert,

} from './helpers.js';

import { StorageService } from './storage.js';

//==============================================================================
//----------------------     [     SCALE HELPER   ]       ----------------------
//==============================================================================
const xScaleTemplate = (value, options, xMinCheck, xMaxCheck) => {
    const chartWidth = options.chartWidth;
    const leftMargin = options.pad.left;
    const xMin = Number.isNaN(xMinCheck)? 0 : xMinCheck;
    const xMax = Number.isNaN(xMaxCheck)? 1 : xMaxCheck;

    return leftMargin + ((value - xMin) / (xMax - xMin || 1)) * chartWidth;
};

export const xScaleVal = (options, xMin, xMax) => {
    return (value) => {
        return xScaleTemplate(value, options, xMin, xMax);
    };
};

const yScaleTemplate = (value, options, yMinCheck, yMaxCheck, type) => {
    const chartHeight = options.chartHeight;
    const topMargin = options.pad.top;
    let yMin = Number.isNaN(yMinCheck)? 0 : yMinCheck;
    let yMax = Number.isNaN(yMaxCheck)? 1 : yMaxCheck;

    // MUST ADJUST Y-SCALE TO GET IN MIDDLE OF 'T'
    if(type === 'T') {
        const yMaxAbs = Math.max(Math.abs(yMin), Math.abs(yMax));
        yMax = yMaxAbs;
        yMin = -yMaxAbs;
    }

    // EXPECTING LARGE NEGATIVE YMIN...
    if(type === 'F') {
        const yMaxAbs = Math.max(Math.abs(yMin), Math.abs(yMax));
        console.log(yMax, yMin, yMaxAbs);

        //special case if yMax is 'close enough' to yMin that yMin wouldn't easily outstrip the yMax
        if(2*Math.abs(yMax) > Math.abs(yMin)) { //if 3 < 2*9 - true            
            yMax = yMaxAbs;
            yMin = -2*yMaxAbs;

        } else {
            yMax = yMaxAbs/2;   //4.5
            yMin = -yMaxAbs;    //-9
        }
        console.log(yMax, yMin, yMaxAbs);
    }

    return topMargin + chartHeight - ((value - yMin) / (yMax - yMin || 1)) * chartHeight;
};

export const yScaleVal = (options, yMin, yMax, type) => {
    return (value) => {
        return yScaleTemplate(value, options, yMin, yMax, type);
    };
};

//==============================================================================
//----------------------     [    OPTIONS HELPER   ]       ---------------------
//==============================================================================
export const ChartOptions = {
    
    //------- [OPTIONS HELPERS 1: ADD OPTIONS DETAILS TO CHART] -------
    addChartDetails(options, array) {
        // BANK ON INCLUDING THESE
        const height = options.height;
        const width = options.width;
        const pad = options.pad;

        options.chartWidth = width - pad.left - pad.right;
        options.chartHeight = height - pad.top - pad.bottom;

        // INCLUDE IF ARRAY ASKS
        if(array) {
            if(array.includes('bgl')){
                options.yLabel = ChartAxes.getBglLabel();
            }
            if(array.includes('insulin')){
                options.xLabel = ChartAxes.getInsulinLabel();
            }
        }        

        return options;
    },

    //------------    [TIME OF DAY RATIO OPTIONS]   -------------
    seasonInsBglOptions: {
        name: '1 season insulin vs bgl', chartClass: 'size-lg',
        width: 300, height: 400, pad: {top: 20, right: 5, bottom: 40, left: 35}, font: 15, strokeWidth: 2
    },    
    seasonYearOptions: {
        name: 'season 1 year', chartClass: 'size-lg',
        xLabel: 'year', yLabel: 'factor',
        width: 300, height: 200, pad: {top: 5, right: 5, bottom: 25, left: 30}, font: 15, strokeWidth: 2
    },    
    timezoneInsBglOptions: {
        name: '1 timezone insulin vs bgl', chartClass: 'size-lg',
        width: 300, height: 400, pad: {top: 20, right: 5, bottom: 40, left: 35}, font: 15, strokeWidth: 2
    },
    timezoneDayOptions: {
        name: 'timezone 1 day', chartClass: 'size-lg',
        xLabel: 'day', yLabel: 'factor',
        width: 400, height: 200, pad: {top: 10, right: 25, bottom: 30, left: 30}, font: 15, strokeWidth: 2
    },
      
    //------------    [   INSULIN SPEED OPTIONS   ]   -------------
    speedLineOptions: {
        name: 'speed line', chartClass: 'size-lg',
        xMaxTestLine: 0, xMaxModelLine: 0,
        width: 400, height: 300, pad: {top: 40, right: 40, bottom: 60, left: 80}, font: 15, strokeWidth: 2
    },
    speedLinePlotUpTo2Data: {},
    
    //------------    [     EXERCISE OPTIONS     ]   -------------
    exLineOptions: {
        name: 'exercise lines', chartClass: 'size-lg',
        width: 400, height: 400, pad: {top: 20, right: 20, bottom: 40, left: 30}, font: 15, strokeWidth: 2
    },
    exerciseBarOptions: {
        name: 'exercise bars', chartClass: 'size-lg',
        xLabel: 'intensity', yLabel: 'factor',
        width: 400, height: 200, pad: {top: 5, right: 5, bottom: 25, left: 30}, font: 15, strokeWidth: 2
    },
    
    //------------    [        FOOD OPTIONS      ]   -------------
    foodPlotOptions: {
        name: 'food plot', chartClass: 'size-lg',
        width: 400, height: 400, pad: {top: 20, right: 40, bottom: 60, left: 60}, font: 15, strokeWidth: 2
    },
    foodPlotUpTo3Data: {},

    //------------    [        CALCULATOR OPTIONS      ]   -------------
    pastFutureBglOptions: {
        name: 'future bgls', chartClass: 'size-lg',
        yLabel: 'bgl',
        width: 400, height: 400, pad: {top: 20, right: 30, bottom: 60, left: 30}, font: 15, strokeWidth: 2
    },

    //------------    [      WEEK PATTERN OPTIONS      ]   -------------
    stepChartOptions: {
        name: 'step chart', chartClass: 'size-lg',
        width: 800, height: 200, pad: {top: 20, right: 40, bottom: 50, left: 95}, font: 15, strokeWidth: 2,
    },
    paretoChartOptions: {
        name: 'pareto', chartClass: 'size-lg',
        width: 800, height: 400, pad: {top: 20, right: 40, bottom: 50, left: 300}, font: 15, strokeWidth: 2,
    },
    percentBarChartOptions: {
        name: 'time in range', chartClass: 'size-lg',
        width: 800, height: 100, pad: {top: 20, right: 40, bottom: 50, left: 60}, font: 15, strokeWidth: 2,
    },
    dashBigOptions: {
        name: 'dash big', chartClass: 'size-md',
        width: 192, height: 96, pad: {top: 8, right: 8, bottom: 8, left: 8}, font: 8, strokeWidth: 2,
    },
    dashSmallOptions: {
        name: 'dash small', chartClass: 'size-md',
        width: 192, height: 32, pad: {top: 4, right: 8, bottom: 8, left: 8}, font: 8, strokeWidth: 2,
    },
    dashSeasonBigOptions: {
        name: 'dash season big', chartClass: 'size-sm',
        width: 64, height: 40, pad: {top: 4, right: 4, bottom: 4, left: 4}, font: 8, strokeWidth: 1,
    },
    dashSeasonSmallOptions: {
        name: 'dash season small', chartClass: 'size-sm',
        width: 64, height: 16, pad: {top: 2, right: 2, bottom: 2, left: 2}, font: 6, strokeWidth: 1,
    },
};

//==============================================================================
//----------------------   [    REGRESSION HELPER   ]       --------------------
//==============================================================================
export const ChartCalc = {

    //----------- [REGRESS HELPERS 1: GET REGRESSION DATA] --------------
    getRegressionLineData(data, xMaxGiven, options, type) {
        if(data.length === 0 || !data) return;

        if(type === 'non-index') {
            const regressObj = this.calcLinearRegression(data);
            const lineObj = this.addLineData(regressObj, xMaxGiven, options);
            // console.log(regressObj, lineObj);
            return lineObj;
        }
        
        const regressObj = this.calcLinearRegression(data, options);
        const lineObj = this.addLineData(regressObj, xMaxGiven, options);
        // console.log(regressObj, lineObj);
        return lineObj;
    },


    //------ [HELPER 1.1: CALCULATE REGRESSION] --------
    calcLinearRegression(data, options, upOrDown) {
        if(data.length === 0 || !data) return;

        console.log(data, options);
        const n = data.length;
        const sumX = data.reduce((sum, d) => sum + d.x, 0);
        const sumY = data.reduce((sum, d) => sum + d.y, 0);
        const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
        const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || null;
        const yIntercept = (sumY - slope * sumX) / n || null;
        const xIntercept = -yIntercept/slope;

        if(slope === null || yIntercept === null) return;

        if(upOrDown === 'down' && slope >= 0 ) return;
        else if(upOrDown === 'up' && slope <= 0 ) return;

        // OPTIONS DATA IS FOR THE INDEX ITEM
        if(options) {
            options.slope = Math.round(100 * slope)/100;
            options.yIntercept = Math.round(10 * yIntercept)/10;
            options.xIntercept = Math.round(10 * xIntercept)/10;
        }
        console.log(slope, yIntercept, xIntercept, options);
        return { slope: Math.round(100*slope)/100, yIntercept: Math.round(10*yIntercept)/10, xIntercept: Math.round(10*xIntercept)/10 };
    },

    //------ [HELPER 1.2: ADD REGRESS LINE DATA] --------
    addLineData(regObj, xMaxGiven, options) {
        if(!regObj) return;
        // console.log('adding line data for: ', regObj, xMaxGiven, options);

        // console.log(regObj, xMaxGiven, options);
        const obj = regObj;
        const xMax = xMaxGiven ?? 0;

        // KEEP THESE DATA SAME
        obj.xIntercept = Math.round(10 * obj.xIntercept)/10;
        obj.slope      = Math.round(100 * obj.slope)/100;
        obj.x1 = 0;
        
        const x2 = Math.max(obj.xIntercept, xMax);
        obj.x2 = Math.round(10 * x2)/10; //want this to be the max X for this particular color, or at least where it cuts x-axis

        // CORRECT THE Y'S
        // ***** null coalesce 
        // these two are equivalent
        // opts = options?.yIntercept
        // opts = options ? options.yIntercept : undefined
        // {}.anything (ie .anything doesn't exist) is always undefined 
        const yOptionIntercept = options?.yIntercept;   //means process won't stop if undefined for ternary
        const yIntercept = yOptionIntercept === undefined? obj.yIntercept : options.yIntercept;
        // const yIntercept = obj.yIntercept;
        obj.yIntercept = Math.round(10 * yIntercept)/10;
        obj.y1 = Math.round(10 * yIntercept)/10;
        obj.y2 = Math.round(10 * (obj.slope * x2 + yIntercept))/10;  //want it to get to 0 at least

        // console.log(obj);
        
        return obj;
    },

};

//==============================================================================
//----------------------  [  CHART GROUP ADDITIONS HELPER ]  -------------------
//==============================================================================
export const ChartGAdd = {

    //----------- [GROUP HELPERS 1: CREATE SVG] --------------
    //----- [HELPER 1.1: MAIN TYPE OF SVG] ------
    createSvg(container, options) {
        //maybe type can be 'unique' for this function to clear container - function should only do 1 thing though
        const width = options.width;
        const height = options.height;
        const name = options.name ?? '';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('name', name);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', 'auto');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // svg.setAttribute('preserveAspectRatio', 'none');

        container.appendChild(svg);

        console.log(svg);

        return svg;
    },

    //----- [HELPER 1.2: SMALLER DASH SVG] ------
    createSvgDash(container, options) {
        //dont have width and height attributes for easier scaling
        const width = options.width;
        const height = options.height;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        container.append(svg);

        return svg;

    },

    //------- [GROUP HELPERS 2: CIRCLE G COMPONENT] ----------
    circleSimple(chartGroup, point, xScale, yScale) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', xScale(point.x));
        circle.setAttribute('cy', yScale(point.y));
        circle.setAttribute('class', point.circleClass?? '');
        chartGroup.append(circle);
    },

    //------- [GROUP HELPERS 3: LINE G COMPONENT] ----------
    //----- [HELPER 3.1: LINEAR LINE WITH INFO ON Y/X-INTERCEPT] ------
    linearLineSimple(chartGroup, lineObject, xScale, yScale) {
        console.log(lineObject);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', xScale(lineObject.x1));
        line.setAttribute('y1', yScale(lineObject.y1));
        line.setAttribute('x2', xScale(lineObject.x2));
        line.setAttribute('y2', yScale(lineObject.y2));
        line.setAttribute('class', lineObject.lineClass?? '');
        line.setAttribute('y-intercept', lineObject.yIntercept);
        line.setAttribute('x-intercept', lineObject.xIntercept);
        chartGroup.append(line);
    },

    //----- [HELPER 3.2: LINE WITH MINIMAL INFO] ------
    lineSimple(chartGroup, lineObject, xScale, yScale) {
        console.log(lineObject);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', xScale(lineObject.x1));
        line.setAttribute('y1', yScale(lineObject.y1));
        line.setAttribute('x2', xScale(lineObject.x2));
        line.setAttribute('y2', yScale(lineObject.y2));
        line.setAttribute('class', lineObject.lineClass?? '');
        chartGroup.append(line);
    },

    //----- [HELPER 3.3: PATHS] ------
    //----- [3.3A: GET PATH DATA] ------
    getPathDataByClass(data, xScale, yScale, pathClass) {
        const filteredPathData = data.filter(point => point.pathClass === pathClass);

        console.log(filteredPathData);
        
        const pathData = filteredPathData.map((point, index) => {
            const command = index === 0 ? 'M' : 'L';
            // if(point.pathClass === pathClass) {
                
            // }
            return `${command} ${xScale(point.x)} ${yScale(point.y)}`;
            //point.x = 60 + (( point.x - 0 )/( 5 - 0?? 1)) * 700 - e.g. x.max will return 60 + 700px
        }).join(' ');

        return pathData;
    },

    //----- [3.3B: ADD IT TO CHART GROUP] ------
    addPathDataToChartGroup(chartGroup, pathData, pathClass) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('class', pathClass?? '');
        chartGroup.append(path);
    },

    //----- [3.3C: SIMPLE 1-PATH] ------
    pathSimple(chartGroup, data, xScale, yScale, pathClass) {

        const pathData = data.map((point, index) => {
            const command = index === 0 ? 'M' : 'L';
            return `${command} ${xScale(point.x)} ${yScale(point.y)}`;      //point.x = 60 + (( point.x - 0 )/( 5 - 0?? 1)) * 700 - e.g. x.max will return 60 + 700px
        }).join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('class', pathClass?? '');
        chartGroup.append(path);
    },
};

//==============================================================================
//----------------------    [     CHART AXES HELPER   ]     --------------------
//==============================================================================
export const ChartAxes = {
    //---------------- [AXES HELPERS 1: GET AXIS LABELS] ------------------
    getBglLabel() {
        const prefs = StorageService.getPreferences();
        const glucoseUnit = prefs.userSelections.glucoseUnit;

        return `—   bgl change (${glucoseUnit})   +`;
    },

    getInsulinLabel() {
        return 'insulin units (estimated)';
    },

    //---------------- [AXES HELPERS 2: DRAW AXES] ------------------
    //instead make 3rd option the yScale(0) number input
    appendAxesChartgroup(chartGroup, options, type, yScale) {
        chartGroup.setAttribute('component', 'axes');
        const width = options.width;
        const height = options.height;
        const pad = options.pad;
        const chartWidth = options.chartWidth;
        const chartHeight = options.chartHeight;
        // const strokeWidth = options.strokeWidth;

        let yCorrectHeight;
        if(type === 'T' && !yScale) yCorrectHeight = 0.5*chartHeight + pad.top;  //ie a side-turned T
        else if(type === 'F' && !yScale) yCorrectHeight = 0.2*chartHeight + pad.top; //ie higher x-axis than T
        else if(yScale) yCorrectHeight = yScale(0); //use the formula if wanted - can still use 'U' type
        else yCorrectHeight = chartHeight + pad.top;
        
        const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxisLine.setAttribute('x1', pad.left);
        xAxisLine.setAttribute('y1', yCorrectHeight);
        xAxisLine.setAttribute('x2', width - pad.right);
        xAxisLine.setAttribute('y2', yCorrectHeight);
        xAxisLine.setAttribute('class', options.chartClass?? '');
        chartGroup.append(xAxisLine);

        const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxisLine.setAttribute('x1', pad.left);
        yAxisLine.setAttribute('y1', pad.top);
        yAxisLine.setAttribute('x2', pad.left);
        yAxisLine.setAttribute('y2', height - pad.bottom);
        yAxisLine.setAttribute('class', options.chartClass?? '');
        chartGroup.append(yAxisLine);

        //ie box-type container
        if(type === 'H') {
            const yAxisLineRight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            yAxisLineRight.setAttribute('x1', pad.left + chartWidth);
            yAxisLineRight.setAttribute('y1', pad.top);
            yAxisLineRight.setAttribute('x2', pad.left + chartWidth);
            yAxisLineRight.setAttribute('y2', height - pad.bottom);
            xAxisLine.setAttribute('class', options.chartClass?? '');
            chartGroup.append(yAxisLineRight);
        }
    },

    //---------- [AXES HELPERS 3: LABELLING MAX NUMBERS] ------------
    labelXmaxYmaxMin(chartGroup, options, xScale, xMax, yScale, yMin, yMax) {
        // const height = options.height;
        // const chartWidth = options.chartWidth;
        // const chartHeight = options.chartHeight;
        // const pad = options.pad;
        
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', xScale(xMax));
        xLabel.setAttribute('y', yScale(0)+20);
        xLabel.setAttribute('class', options.chartClass?? '');
        xLabel.textContent = xMax;
        chartGroup.append(xLabel);

        const yMinLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yMinLabel.setAttribute('x', xScale(0));  //20
        yMinLabel.setAttribute('y', yScale(yMin));  //30 + (365/2)
        yMinLabel.setAttribute('class', options.chartClass?? '');
        yMinLabel.textContent = HelpConvert.displayAsCorrectGlucoseUnit(yMin);
        chartGroup.append(yMinLabel);

        const yMaxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yMaxLabel.setAttribute('x', xScale(0));  //20
        yMaxLabel.setAttribute('y', yScale(yMax));  //30 + (365/2)
        yMaxLabel.setAttribute('class', options.chartClass?? '');
        yMaxLabel.textContent = HelpConvert.displayAsCorrectGlucoseUnit(yMax);
        chartGroup.append(yMaxLabel);
    },

    //---------- [AXES HELPERS 4: LABEL TEXT ON AXES] ------------
    //----- [HELPER 4.1: LABEL BOTH AXES] ------
    labelAxesStandard(chartGroup, options) {
        const height = options.height;
        const chartWidth = options.chartWidth;
        const chartHeight = options.chartHeight;
        const pad = options.pad;
        const centreX = pad.left - 10;
        const centreY = pad.top + chartHeight/2;

        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', pad.left + chartWidth/2);
        xLabel.setAttribute('y', height*0.975);
        xLabel.setAttribute('class', options.chartClass?? '');
        xLabel.textContent = options.xLabel;
        chartGroup.append(xLabel);
        
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', centreX);  //20
        yLabel.setAttribute('y', centreY);  //30 + (365/2)
        yLabel.setAttribute('class', options.chartClass?? '');
        yLabel.setAttribute('transform', `rotate(-90, ${centreX}, ${centreY})`);
        yLabel.textContent = options.yLabel;
        chartGroup.append(yLabel);
    },

    //----- [HELPER 4.2: LABEL X-AXIS] ------
    labelXAxis(chartGroup, options) {
        const height = options.height;
        const pad = options.pad;
        const chartWidth = options.chartWidth;

        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', pad.left + chartWidth/2);
        xLabel.setAttribute('y', height - 10);
        xLabel.setAttribute('class', options.chartClass?? '');
        xLabel.textContent = options.xLabel;
        chartGroup.append(xLabel);
    },

    //----- [HELPER 4.3: LABEL Y-AXIS] ------
    labelYAxis(chartGroup, options) {
        const chartHeight = options.chartHeight;    //160
        const pad = options.pad;
        const centreX = pad.left - 10;
        const centreY = pad.top + chartHeight/2;
        //chartwidth = 345

        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', centreX);
        yLabel.setAttribute('y', centreY);
        yLabel.setAttribute('class', options.chartClass?? '');
        yLabel.setAttribute('transform', `rotate(-90, ${centreX}, ${centreY})`);
        yLabel.textContent = options.yLabel;
        chartGroup.append(yLabel);
    },

    //----------     [AXES HELPERS 5: TICK AXES]      ------------
    //----- [HELPER 5.1: TICK START/END RANGE] ------
    tickAxisRanges(chartGroup, options, tickArray, type, equalXarray) {
        console.log(equalXarray);
        const chartHeight = options.chartHeight;
        const chartWidth = options.chartWidth;
        const numTicks = tickArray.length + (equalXarray? 0 : 1);
        console.log(numTicks);
        const leftMargin = options.pad.left;
        const topMargin = options.pad.top;
        const strokeWidth = options.strokeWidth;

        // ADJUSTMENTS        
        const tickLength = strokeWidth*8;
        const labelWidth = 25;
        const labelUpShift = 0.5*chartHeight/(numTicks);
        const labelSideShift = 0.5*chartWidth/(numTicks);
        const labelDrop =  tickLength - 15;

        if(type === 'y') {           
            const tickYJump = (chartHeight / ((numTicks - 1) || 1));
            const tickXright = leftMargin;
            const tickXleft = tickXright - tickLength;
            const labelX = tickXleft - labelWidth;

            for (let i = 0; i < numTicks ; ++i) {            
                const tickY = topMargin + chartHeight - (i * tickYJump);
                const labelY = tickY - labelUpShift;
                // const labelY = tickY + labelShift
                
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
                tick.setAttribute('x1', tickXleft);
                tick.setAttribute('y1', tickY); //start Y at the axis line
                tick.setAttribute('x2', tickXright);
                tick.setAttribute('y2', tickY); //end y below the axis line for 'outside' appearance
                tick.setAttribute('class', options.chartClass?? '');
                chartGroup.append(tick);

                // 1 FEWER LABELS THAN TICKS
                if(i === numTicks - 1) continue;
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', labelX);
                label.setAttribute('y', labelY);   //position 30px below the tick
                label.setAttribute('class', options.chartClass?? '');
                label.textContent = `${tickArray[i]}`;
                chartGroup.append(label);
            }
            return;
        }

        //assume xaxis if not declared
        const tickXJump = (chartWidth / ((numTicks - 1) || 1) );
        

        for (let i = 0; i < numTicks ; ++i) {            
            const tickX = equalXarray? equalXarray[i] : leftMargin + (i * tickXJump);
            const tickYtop = topMargin + chartHeight;
            const tickYbottom = topMargin + chartHeight + tickLength;
            const labelY = tickYbottom + labelDrop;

            let labelMoveX = 0;
            if(equalXarray && i < numTicks - 1) {
                const Xpos = equalXarray[i];
                const nextXpos = equalXarray[i+1];
                labelMoveX = (nextXpos - Xpos)/2;
            }
            const labelX = equalXarray? tickX + labelMoveX: tickX + labelSideShift;
            
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
            tick.setAttribute('x1', tickX);
            tick.setAttribute('y1', tickYtop); //start Y at the axis line
            tick.setAttribute('x2', tickX);
            tick.setAttribute('y2', tickYbottom); //end y below the axis line for 'outside' appearance
            tick.setAttribute('stroke', options.chartClass?? '');
            tick.setAttribute('data-action', 'chart-axes');
            // tick.dataset.action = 'chart-axes';
            chartGroup.append(tick);

            // 1 FEWER LABELS THAN TICKS
            if(i === numTicks - 1) continue;
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', labelX);
            label.setAttribute('y', labelY);   //position 30px below the tick
            label.setAttribute('class', options.chartClass?? '');
            label.textContent = `${tickArray[i]}`;
            label.setAttribute('data-action', 'chart-axes');
            // label.dataset.action = 'chart-axes';
            chartGroup.append(label);
        }     
        
        return;
    },

    //----- [HELPER 5.2: TICK & LABEL AT MAX] ------
    tickAxisMax(chartGroup, options, xScale, xMax, yScale, yMax, yMin) {
        // const chartHeight = options.chartHeight;
        // const chartWidth = options.chartWidth;
        // const leftMargin = options.pad.left;
        // const topMargin = options.pad.top;
        // const fontSize = options.font;
        const strokeWidth = options.strokeWidth;

        // ADJUSTMENTS        
        const tickLength = strokeWidth*4;
        // const labelWidth = leftMargin/2;
        const labelShift = 10;
        const labelDrop =  tickLength +10;
        const labelDropHalf = labelDrop/2;

        //x-axis label
        // const tickX = leftMargin + (i * tickXJump);
        // const tickYtop = topMargin + chartHeight;
        // const tickYbottom = topMargin + chartHeight + tickLength;
        // const labelY = tickYbottom + labelDrop;
        
        const tickX = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
        tickX.setAttribute('x1', xScale(xMax));
        tickX.setAttribute('y1', yScale(0)); //start Y at the axis line
        tickX.setAttribute('x2', xScale(xMax));
        tickX.setAttribute('y2', yScale(0) + tickLength); //end y below the axis line for 'outside' appearance
        tickX.setAttribute('class', options.chartClass?? '');
        tickX.setAttribute('data-action', 'chart-axes');
        // tickX.dataset.action =  'chart-axes';
        chartGroup.append(tickX);

        const labelX = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelX.setAttribute('x', xScale(xMax));
        labelX.setAttribute('y', yScale(0) + tickLength + labelDrop);   //position 30px below the tick
        labelX.setAttribute('class', options.chartClass?? '');
        labelX.textContent = `${xMax}`;
        labelX.setAttribute('data-action', 'chart-axes');
        // labelX.dataset.action = 'chart-axes';
        chartGroup.append(labelX);

        //y-axis label/s
        const tickYMax = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
        tickYMax.setAttribute('x1', xScale(0) - tickLength);
        tickYMax.setAttribute('y1', yScale(yMax));
        tickYMax.setAttribute('x2', xScale(0));
        tickYMax.setAttribute('y2', yScale(yMax));
        tickYMax.setAttribute('class', options.chartClass?? '');
        tickYMax.setAttribute('data-action', 'chart-axes');
        // tickYMax.dataset.action = 'chart-axes';
        chartGroup.append(tickYMax);

        const labelYMax = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelYMax.setAttribute('x', xScale(0) - tickLength - labelShift);
        labelYMax.setAttribute('y', yScale(yMax) + labelDropHalf);   //position 30px below the tick
        labelYMax.setAttribute('class', options.chartClass?? '');
        labelYMax.textContent = HelpConvert.displayAsCorrectGlucoseUnit(`${yMax}`);
        labelYMax.setAttribute('data-action', 'chart-axes');
        // labelYMax.dataset.action = 'chart-axes';
        chartGroup.append(labelYMax);

        if(yMin) {
            const tickYMin = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
            tickYMin.setAttribute('x1', xScale(0) - tickLength);
            tickYMin.setAttribute('y1', yScale(yMin));
            tickYMin.setAttribute('x2', xScale(0));
            tickYMin.setAttribute('y2', yScale(yMin));
            tickYMin.setAttribute('class', options.chartClass?? '');
            tickYMin.setAttribute('data-action', 'chart-axes');
            // tickYMin.dataset.action = 'chart-axes';
            chartGroup.append(tickYMin);

            const labelYMin = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            labelYMin.setAttribute('x', xScale(0) - tickLength - labelShift);
            labelYMin.setAttribute('y', yScale(yMin) + labelDropHalf);   //position 30px below the tick
            labelYMin.setAttribute('class', options.chartClass?? '');
            console.log(yMin);
            labelYMin.textContent = HelpConvert.displayAsCorrectGlucoseUnit(`${yMin}`);
            labelYMin.setAttribute('data-action', 'chart-axes');
            // labelYMin.dataset.action = 'chart-axes';
            chartGroup.append(labelYMin);
        }

        return;
    },
    
    //----- [HELPER 5.3: TICK STANDARD WITH ARRAY] ------
    tickAxis(chartGroup, options, tickArray, type) {
        const chartHeight = options.chartHeight;
        const chartWidth = options.chartWidth;
        const numTicks = tickArray.length;
        const leftMargin = options.pad.left;
        const topMargin = options.pad.top;
        // const fontSize = options.font;
        const strokeWidth = options.strokeWidth;

        // ADJUSTMENTS        
        const tickLength = strokeWidth*4;
        const labelWidth = leftMargin/2;
        const labelShift = 10;
        const labelDrop =  tickLength +5;

        if(type === 'y') {          
            const tickYJump = (chartHeight / ((numTicks - 1) || 1));
            const tickXright = leftMargin;
            const tickXleft = tickXright - tickLength;
            const labelX = tickXleft - labelWidth;

            for (let i = 0; i < numTicks ; ++i) {            
                const tickY = topMargin + chartHeight - (i * tickYJump);
                const labelY = tickY + labelShift;
                
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
                tick.setAttribute('x1', tickXleft);
                tick.setAttribute('y1', tickY); //start Y at the axis line
                tick.setAttribute('x2', tickXright);
                tick.setAttribute('y2', tickY); //end y below the axis line for 'outside' appearance
                tick.setAttribute('class', options.chartClass?? ''); //end y below the axis line for 'outside' appearance
                chartGroup.append(tick);

                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', labelX);
                label.setAttribute('y', labelY);   //position 30px below the tick
                label.setAttribute('class', options.chartClass?? '');
                label.textContent = `${tickArray[i]}`;
                chartGroup.append(label);
            }
            return;
        }
        
        //assume xaxis if not declared
        const tickXJump = (chartWidth / ((numTicks - 1) || 1) );               

        for (let i = 0; i < numTicks ; ++i) {            
            const tickX = leftMargin + (i * tickXJump);
            const tickYtop = topMargin + chartHeight;
            const tickYbottom = topMargin + chartHeight + tickLength;
            const labelY = tickYbottom + labelDrop;
            
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
            tick.setAttribute('x1', tickX);
            tick.setAttribute('y1', tickYtop); //start Y at the axis line
            tick.setAttribute('x2', tickX);
            tick.setAttribute('y2', tickYbottom); //end y below the axis line for 'outside' appearance
            tick.setAttribute('class', options.chartClass?? '');
            tick.setAttribute('data-action', 'chart-axes');
            // tick.dataset.action = 'chart-axes';
            chartGroup.append(tick);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', tickX);
            label.setAttribute('y', labelY);   //position 30px below the tick
            label.setAttribute('class', options.chartClass?? '');
            label.textContent = `${tickArray[i]}`;
            label.setAttribute('data-action', 'chart-axes');
            // label.dataset.action = 'chart-axes';
            chartGroup.append(label);
        }
        return;
    },

    //----- [HELPER 5.4: TICK TO LINE UP WITH BARS] ------
    tickAxisBars(chartGroup, options, tickArray, type, buffer) {
        const chartHeight = options.chartHeight;
        const chartWidth = options.chartWidth;
        const numTicks = tickArray.length;
        const leftMargin = options.pad.left;
        const topMargin = options.pad.top;
        // const fontSize = options.font;
        const strokeWidth = options.strokeWidth;

        // ADJUSTMENTS        
        const tickLength = strokeWidth*4;
        const labelWidth = leftMargin/2;
        const labelShift = 10;
        const labelDrop =  tickLength +5;

        if(type === 'y') {          
            const tickYJump = ( (chartHeight - buffer) / ((numTicks - 1) || 1));
            const tickXright = leftMargin;
            const tickXleft = tickXright - tickLength;
            const labelX = tickXleft - labelWidth;

            for (let i = 0; i < numTicks ; ++i) {            
                const tickY = topMargin + chartHeight - buffer/2 - (i * tickYJump);
                const labelY = tickY + labelShift;
                
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
                tick.setAttribute('x1', tickXleft);
                tick.setAttribute('y1', tickY); //start Y at the axis line
                tick.setAttribute('x2', tickXright);
                tick.setAttribute('y2', tickY); //end y below the axis line for 'outside' appearance
                tick.setAttribute('class', options.chartClass?? '');
                chartGroup.append(tick);

                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', labelX);
                label.setAttribute('y', labelY);   //position 30px below the tick
                label.setAttribute('class', options.chartClass?? '');
                label.textContent = `${tickArray[i]}`;
                chartGroup.append(label);
            }
            return;
        }
        
        //assume xaxis if not declared
        const tickXJump = ( (chartWidth - buffer) / ((numTicks - 1) || 1));               

        for (let i = 0; i < numTicks ; ++i) {            
            const tickX = leftMargin + buffer/2 + (i * tickXJump);
            const tickYtop = topMargin + chartHeight;
            const tickYbottom = topMargin + chartHeight + tickLength;
            const labelY = tickYbottom + labelDrop;
            
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');            
            tick.setAttribute('x1', tickX);
            tick.setAttribute('y1', tickYtop); //start Y at the axis line
            tick.setAttribute('x2', tickX);
            tick.setAttribute('y2', tickYbottom); //end y below the axis line for 'outside' appearance
            tick.setAttribute('class', options.chartClass?? '');
            tick.setAttribute('data-action', 'chart-axes');
            // tick.dataset.action = 'chart-axes';
            chartGroup.append(tick);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', tickX);
            label.setAttribute('y', labelY);   //position 30px below the tick
            label.setAttribute('class', options.chartClass?? '');
            label.textContent = `${tickArray[i]}`;
            label.setAttribute('data-action', 'chart-axes');
            // label.dataset.action = 'chart-axes';
            chartGroup.append(label);
        }
        return;
    },
};

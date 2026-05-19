/*  CHART BUILDER STRUCTURE
**  ============================================================================
**  Many pages contain charts - some multiple
**  
**  Seemed difficult to re-use line charts on different pages - did re-use on
**  same pages pretty often
**  
**  doing quite different things, but potential for making more generic
**  
**  ============================================================================
**  CHART HELPERS IN SEPARATE FILE -> 800 lines in its own right
**  
**  ============================================================================
**  CALCULATOR PAGE
**  line chart - very customised
**  
**  ============================================================================
**  WEEK PATTERN PAGE
**  
**  WEEK PATTERN 1: MEDIAN STEP CHART
**  WEEK PATTERN 2: PARETO THINGS CHART
**  WEEK PATTERN 3: TIME IN RANGE
**  
**  ============================================================================
**  INSULIN SPEED PAGE
**  handles 2 charts on 1 for comparing model vs test
**  
**  ============================================================================
**  MEAL PAGE
**  1-3 line charts - space-age technology
**
**  ============================================================================
**  EXERCISE PAGE
**  
**  EXERCISE 1: LINES - re-used for raw/modelled
**  EXERCISE 2: BARS - re-used for raw/modelled
**  
**  ============================================================================
**  TIME OF DAY RATIO PAGE
**  
**  TIME OF DAY RATIO 1: 1 TIMEZONE LINE -> 1 timezone, multiple seasons
**  TIME OF DAY RATIO 2: 1 SEASON LINE -> 1 season, multiple timezones
**  TIME OF DAY RATIO 3: 1 YEAR BAR -> kept as bars to show season colours
**  TIME OF DAY RATIO 4: 1 DAY LINE -> shows factor over 24hrs/1day
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpComplex,

} from './helpers.js';

import {
    xScaleVal,
    yScaleVal,
    ChartOptions,
    ChartCalc,
    ChartGAdd,
    ChartAxes,    

} from './chartHelpers.js';


export const ChartComponent = {
    //==========================================================================
    //------------------    [     CALCULATOR PAGE    ]       -------------------
    //==========================================================================
    lineChartPastFutureBgl(containerId, data, horizObj, vertObj) {
        const container = document.querySelector(containerId);
        if (!container) return;

        console.log(data);

        // CLEAR PREV HTML
        HelpHtml.clearHtmlCode(containerId);

        console.log(document.getElementById(containerId));

        // DEFINE OPTIONS
        const options = ChartOptions.addChartDetails(ChartOptions.pastFutureBglOptions);
        console.log(options);
        const chartWidth = options.chartWidth;

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);

        // SCALE
        // const hoursX = data.map(d => d.x);
        // const bglY = data.map(d => d.y);
        // const xMax = Math.max(...hoursX) + 1 ;   //have to +1 to get last tick place
        const xMax = horizObj[0].x2;
        const xMin = 0;
        const yMin = 0;
        // const yMax = Math.ceil(Math.max(...bglY));
        const yMax = vertObj.y2;

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        //ADD VERTICAL LINE AT TIMENOW
        const chartGroupVert = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroupVert.setAttribute('component', 'time-now');
        ChartGAdd.lineSimple(chartGroupVert, vertObj, xScale, yScale);

        //ADD LABEL OF 'NOW'
        const label3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label3.setAttribute('x', xScale(vertObj.x1));
        label3.setAttribute('y', yScale(yMax) + 5);   //position 30px below the tick
        label3.setAttribute('class', options.chartClass);
        label3.textContent = 'NOW';
        chartGroupVert.append(label3);

        
        //ADD HORIZONTAL LINE AT BGL = HYPER & HYPO
        const chartGroupHoriz = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroupHoriz.setAttribute('component', 'bgl-lines');
        ChartGAdd.lineSimple(chartGroupHoriz, horizObj[0], xScale, yScale); //hyper line
        ChartGAdd.lineSimple(chartGroupHoriz, horizObj[1], xScale, yScale); //hypo line

        //ADD LABELS OF MAX BGL
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', options.pad.left + chartWidth * 0.8);
        label.setAttribute('y', yScale(horizObj[0].y1) + 0.5*(yScale(horizObj[1].y1) - yScale(horizObj[0].y1)));   //position 30px below the tick
        label.setAttribute('class', options.chartClass);
        console.log(options.chartClass);
        label.textContent = 'target range';
        chartGroupHoriz.append(label);

        const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label2.setAttribute('x', xScale(0) - 15);
        label2.setAttribute('y', yScale(vertObj.y2) + 5);   //position 30px below the tick
        label2.setAttribute('class', options.chartClass);
        label2.textContent = `${vertObj.y2}`;
        chartGroupHoriz.append(label2);


        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroupAxes = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroupAxes, options);
        ChartAxes.labelAxesStandard(chartGroupAxes, options);

        // LABELS
        // y-axis tick marks
        // const tickYArray = ['', '', '', ''];
        // ChartAxes.tickAxis(chartGroup, options, tickYArray, 'y');

        // x-axis tick marks
        const tickXArray = [];
        const hoursX = data.map(d => d.time);
        // const modulusX = xMax%2;    // 0 if even, 1 if odd
        // const numTicksX = (xMax + modulusX)/2 + 1;   //get half the tick marks of an even number
        console.log(hoursX);
        //using i means the counter gets out of whack for the double-circle on now
        const uniqueTimes = [...new Set(hoursX)];
        console.log(uniqueTimes, hoursX);

        for (let i = 0 ; i < uniqueTimes.length ; ++i) {
            if(i===0) tickXArray.push(uniqueTimes[i]);
            
            if((i)%12 === 0 && i > 0) {
                tickXArray.push(uniqueTimes[i]);
            }

            console.log(tickXArray);
            //finally push dummy one in on last run
            if(i === uniqueTimes.length - 1) tickXArray.push(uniqueTimes[0]);
        }
        console.log(tickXArray);
        ChartAxes.tickAxis(chartGroupAxes, options, tickXArray);        

        //DRAW TRANSPARENT RECTANGLE FOR TARGET RANGE
        const chartGroupBars = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroupBars.setAttribute('component', 'bars');

        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', xScale(0));
        bar.setAttribute('y', yScale(horizObj[0].y1));
        bar.setAttribute('width', xScale(xMax) - xScale(0));
        bar.setAttribute('height', yScale(horizObj[1].y1) - yScale(horizObj[0].y1));
        bar.setAttribute('class', 'color-quaternary opacity-lite');
        chartGroupBars.append(bar);

        // DRAW PATHS
        const chartGroupPath = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroupPath.setAttribute('component', 'paths');
        // ChartGAdd.pathSimple(chartGroupPath, data, xScale, yScale);

        const path1 = ChartGAdd.getPathDataByClass(data, xScale, yScale, 'chart-color-1');
        const path2 = ChartGAdd.getPathDataByClass(data, xScale, yScale, 'chart-color-2');
        
        ChartGAdd.addPathDataToChartGroup(chartGroupPath, path1, 'chart-color-1');        
        ChartGAdd.addPathDataToChartGroup(chartGroupPath, path2, 'chart-color-2');


        // DATA CIRCLES AND PATHS
        //use the calculated scaling to do circles and path lines
        const chartGroupCircle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroupCircle.setAttribute('component', 'circles');
        for(let i = 0; i < data.length ; ++i) {
            const point = data[i];

            //create group for each stored speed            
            ChartGAdd.circleSimple(chartGroupCircle, point, xScale, yScale);
        }        

        //FINISH
        svg.append(chartGroupVert);
        svg.append(chartGroupHoriz);
        svg.append(chartGroupAxes);
        svg.append(chartGroupBars);
        svg.append(chartGroupPath);
        svg.append(chartGroupCircle);
        container.append(svg);

        console.log(svg);

        return svg;
    },

    //==========================================================================
    //------------------     [   WEEK PATTERN PAGE   ]     ---------------------
    //==========================================================================
    
    //=====================================================
    //----   [  WEEK PATTERN 1: MEDIAN STEP CHART]     ----
    //=====================================================
    drawMedianStepChart(containerId, data, dash, season) {
        const container = document.querySelector(containerId);
        if (!container) return;

        console.log(data);

        // CLEAR PREV HTML
        HelpHtml.clearHtmlCode(containerId);

        // DEFINE OPTIONS
        let options;
        if(dash && season) {
            options = ChartOptions.addChartDetails(ChartOptions.dashSeasonBigOptions);
        } else if (dash) {
            options = ChartOptions.addChartDetails(ChartOptions.dashBigOptions);
        } else {
            options = ChartOptions.addChartDetails(ChartOptions.stepChartOptions);
        }
        const chartWidth = options.chartWidth;
        // const pad = options.pad;
        // const leftPad = pad.left;

        // MAIN SVG
        const svg = dash? ChartGAdd.createSvgDash(container, options) : ChartGAdd.createSvg(container, options);

        // SCALE
        // const timezoneX = data.map(d => d.xPosition);
        const xMax = 1 ;   //have to +1 to get last tick place
        const xMin = 0;       
        const yMin = 0;
        const yMax = 3; //ie height incl gap at bottom

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options);
        const axisThickness = options.strokeWidth;    //because of axis thickness

        // const chartGroup3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        // chartGroup3.setAttribute('component', 'ticks');
        // LABELS
        // y-axis tick marks
        const tickYArray = dash? ['', '', ''] : ['low', 'target', 'high'];
        ChartAxes.tickAxisRanges(chartGroup1, options, tickYArray, 'y');

        // x-axis tick marks
        // const timezoneName = data.map(d => d.timezone);
        const tickXArray = [];
        const tickXposX = [];
        for (let i = 0 ; i < data.length ; ++i) {
            const tzCur = dash? '' : data[i].timezone;
            const tzXpos = data[i].xPosition;

            tickXArray.push(tzCur);
            tickXposX.push(xScale(tzXpos));
        }
        console.log(tickXArray, tickXposX);

        // ChartAxes.tickAxisRanges(chartGroup3, options, tickXArray);
        // tickXArrayUnequalX.push(1); //to draw last tick
        // for(i = 0; i < data.length ; ++i) {
        //     const tzCur = dash? '' : data[i].timezone;
        //     const tzX = xScale(data[i].xPosition);

        //     tickXposX.push(tzX);
        // }
        //for last tick with unequal stuff
        tickXArray.push('');
        tickXposX.push(xScale(xMax));
        console.log(tickXArray, tickXposX);

        ChartAxes.tickAxisRanges(chartGroup1, options, tickXArray, 'x', tickXposX);

        // DRAW BARS
        const barUpDown = yScale(0.1) - yScale(1);
        const rectHypoY = yScale(0.95);
        const rectTargY = yScale(1.95);
        const rectHypeY = yScale(2.95);
        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'bars');

        for(let i=0 ; i < data.length ; ++i ) {
            // BAR CHARTGROUP TO ADD TO SVG            
            const tzObject = data[i];
            
            // left-to-right amount for timezone bar
            const barLeftRight = ( chartWidth * (tzObject.hours/24) );
            
            // x-position of each tick            
            const xLeft = xScale(tzObject.xPosition) + axisThickness;

            if(tzObject.showHypers) {
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', xLeft);
                bar.setAttribute('y', rectHypeY);
                bar.setAttribute('width', barLeftRight);
                bar.setAttribute('height', barUpDown);
                bar.setAttribute('class', 'color-primary');
                chartGroup2.append(bar);
            }

            if(tzObject.showTargets) {
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', xLeft);
                bar.setAttribute('y', rectTargY);
                bar.setAttribute('width', barLeftRight);
                bar.setAttribute('height', barUpDown);
                bar.setAttribute('class', 'color-tertiary');
                chartGroup2.append(bar);
            }

            if(tzObject.showHypos) {
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', xLeft);
                bar.setAttribute('y', rectHypoY);
                bar.setAttribute('width', barLeftRight);
                bar.setAttribute('height', barUpDown);
                bar.setAttribute('class', 'color-secondary');
                chartGroup2.append(bar);
            }
        }
        //FINISH        
        svg.append(chartGroup1);
        // svg.append(chartGroup3);
        svg.append(chartGroup2);
        container.append(svg);

        console.log(svg);

        return svg;
    },
    
    //=====================================================
    //--    [  WEEK PATTERN 2: PARETO THINGS CHART]     ---
    //=====================================================
    drawParetoChart(containerId, data, dash, season) {
        const container = document.querySelector(containerId);
        if (!container) return;

        console.log(data);

        // CLEAR PREV HTML
        HelpHtml.clearHtmlCode(containerId);

        // DEFINE OPTIONS
        let options;
        if(dash && season) {
            options = ChartOptions.addChartDetails(ChartOptions.dashSeasonBigOptions);
        } else if (dash) {
            options = ChartOptions.addChartDetails(ChartOptions.dashBigOptions);
        } else {
            options = ChartOptions.addChartDetails(ChartOptions.paretoChartOptions);
        }
        const pad = options.pad;

        // MAIN SVG
        const svg = dash? ChartGAdd.createSvgDash(container, options) : ChartGAdd.createSvg(container, options);

        // SCALE
        const highCount = data[data.length - 1].count;   //get last element's count        
        // const xMax = season? highCount : Math.ceil(highCount/10) * 10;   //biggest one is first = go up to nearest 10. Seasons don't want diff between 90,91 days going to 100
        const xMax = highCount;
        const xMin = 0;
        const yMin = 0;
        const yMax = data.length;
        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options);
        const axisOffset = options.strokeWidth;

        // LABELS
        // y-axis tick marks
        const tickYArray = [];
        for (let i = 0 ; i < data.length ; ++i) {
            const pattern = dash? '' : data[i].pattern;
            tickYArray.push(pattern);

        }
        const buffer = yScale(0) - yScale(1);
        ChartAxes.tickAxisBars(chartGroup1, options, tickYArray, 'y', buffer);

        // x-axis tick marks
        const tickXArray = [];
        let numTicksX;
        let multiplier = 20;
        if(xMax <= 100) {
            numTicksX = Number.parseInt(xMax/20);

        } else if(xMax > 100 && xMax <= 200) {
            numTicksX = Math.ceil(xMax/25);
            multiplier = 25;

        } else {
            numTicksX = Math.ceil(xMax/100);
            multiplier = 100;
        }
        for (let i = 0 ; i <= numTicksX ; ++i) {
            tickXArray.push(dash? '' : i*multiplier);
        }

        ChartAxes.tickAxis(chartGroup1, options, tickXArray);

        

        // DRAW BARS
        const barUpDown = yScale(0.5) - yScale(1);
        const xLeft = xScale(0) + axisOffset;
        const bufferTickOffset = yScale(0.25) - yScale(1);
        const lowHiLineOffset = barUpDown/3;
        
        const lineObject = {'low': lowHiLineOffset, 'mid': 0, 'high': -lowHiLineOffset};
        // const lineWidth = options.strokeWidth + 1;

        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'bars');
        const chartGroup3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup3.setAttribute('component', 'lines');

        for(let i=0 ; i < data.length ; ++i ) {
            // BAR CHARTGROUP TO ADD TO SVG
            // left-to-right amount for timezone bar
            const patternCount = data[i].count;
            const barLeftRight = xScale(patternCount) - pad.left;
            console.log(patternCount, pad.left, 'season:', season);
            
            const xMid = xScale(patternCount/2);
            const xRight = xScale(patternCount);
            console.log(xMid, xRight);

            //y coordinate for bar to draw down from
            const yBar = yScale(i) - bufferTickOffset;

            //get coordinates for white lines
            const yTweakLeft = lineObject[data[i].leftY];    //eg low = -8
            const yTweakMid = lineObject[data[i].midY];
            const yTweakRight = lineObject[data[i].rightY];
            const yLeft = yScale(i) + yTweakLeft - barUpDown;
            const yMid = yScale(i) + yTweakMid - barUpDown;
            const yRight = yScale(i) + yTweakRight - barUpDown;

            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', xLeft);
            bar.setAttribute('y', yBar);
            bar.setAttribute('width', barLeftRight);
            bar.setAttribute('height', barUpDown);
            bar.setAttribute('class', 'color-plain');
            chartGroup2.append(bar);

            //draw left-side line
            const lineA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineA.setAttribute('x1', xLeft);
            lineA.setAttribute('y1', yLeft);    //this will depend on starting hi, mid, low
            lineA.setAttribute('x2', xMid);
            lineA.setAttribute('y2', yMid);    //this will depend on finishing hi, mid, low
            lineA.setAttribute('class', `color-contrast thick ${options.chartClass}`);
            chartGroup3.append(lineA);

            //draw right-side line
            const lineB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineB.setAttribute('x1', xMid);
            lineB.setAttribute('y1', yMid);    //this will depend on starting hi, mid, low
            lineB.setAttribute('x2', xRight);
            lineB.setAttribute('y2', yRight);    //this will depend on finishing hi, mid, low
            lineB.setAttribute('class', `color-contrast thick ${options.chartClass}`);
            chartGroup3.append(lineB);
        }
        //FINISH
        svg.append(chartGroup1);
        svg.append(chartGroup2);
        svg.append(chartGroup3);
        container.append(svg);

        console.log(svg);
        return svg;
    },


    //=====================================================
    //------   [WEEK PATTERN 3: TIME IN RANGE]     --------
    //=====================================================
    drawTimeInRangePercent(containerId, data, dash, season) {
        const container = document.querySelector(containerId);
        if (!container) return;

        // CLEAR PREV HTML
        HelpHtml.clearHtmlCode(containerId);

        // DEFINE OPTIONS
        let options;
        if(dash && season) {
            options = ChartOptions.addChartDetails(ChartOptions.dashSeasonSmallOptions);
        } else if (dash) {
            options = ChartOptions.addChartDetails(ChartOptions.dashSmallOptions);
        } else {
            options = ChartOptions.addChartDetails(ChartOptions.percentBarChartOptions);
        }
        const chartWidth = options.chartWidth;
        const chartHeight = options.chartHeight;

        // MAIN SVG
        const svg = dash? ChartGAdd.createSvgDash(container, options) : ChartGAdd.createSvg(container, options);

        // DECLARE MAX/MIN
        const xMin = 0;
        const xMax = 1;
        const yMin = 0;
        const yMax = 1;
        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        //get hour objects and calculate width and position
        const hypoObj = data.find(obj => obj.step === 'hypo');
        const targetObj = data.find(obj => obj.step === 'target');
        const hyperObj = data.find(obj => obj.step === 'hyper');
        
        const hypoBarLength   = chartWidth * hypoObj.ratio; //eg 0.125
        const targetBarLength = chartWidth * targetObj.ratio;
        const hyperBarLength  = chartWidth * hyperObj.ratio;

        const barLengths = [
            { length: hypoBarLength, type: 'hypo', x: xScale(0),
                ratio: hypoObj.ratio, color: hypoObj.color, colorClass: hypoObj.colorClass
            },
            { length: targetBarLength, type: 'target', x: xScale(hypoObj.ratio),
                ratio: targetObj.ratio, color: targetObj.color, colorClass: targetObj.colorClass
            },
            { length: hyperBarLength, type: 'hyper', x: xScale(hypoObj.ratio + targetObj.ratio),
                ratio: hyperObj.ratio, color: hyperObj.color, colorClass: hyperObj.colorClass
            },
        ];
        
        //CREATE CHART GROUP
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup1.setAttribute('component', 'bars');
        
        //DRAW BARS
        for(let i = 0; i < barLengths.length ; ++i) {
            const object = barLengths[i];
            const length = object.length;
            const xPos = object.x;

            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', xPos);
            bar.setAttribute('y', yScale(1));
            bar.setAttribute('width', length);
            bar.setAttribute('height', chartHeight);
            bar.setAttribute('class', object.colorClass);
            chartGroup1.append(bar);

            if(object.ratio < 0.25 && dash) continue;
            
            if(object.ratio < 0.1) continue;

            const labelText = Math.round(100*object.ratio);            
            //add data labels for bar > 10%
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', xPos + length/2);
            label.setAttribute('y', yScale(0.25));
            label.setAttribute('class', options.chartClass);
            label.textContent = `${labelText}%`;    //example label value - want 0, 50, 100
            chartGroup1.append(label);
        }
        //FINISH
        svg.append(chartGroup1);
        container.append(svg);

        console.log(svg);

        return svg;
    },

    //==========================================================================
    //------------------     [   INSULIN SPEED PAGE   ]     --------------------
    //==========================================================================
    createSpeedModelTest(containerId, data, buttonType) {
        // const container = document.getElementById(containerId);
        // if (!container) return;
       
        const container = document.querySelector(containerId);
        if (!container) return;


        // DATA FOR BUTTONID
        const speedStoredData = ChartOptions.speedLinePlotUpTo2Data;
        
        // ----  overwrite id:[data]
        speedStoredData[buttonType] = data;

        if(data.length === 0) {
            delete speedStoredData[buttonType];
            return;
        }

        // CLEAR PREV HTML
        // HelpHtml.clearHtmlFromId(containerId);
        HelpHtml.clearHtmlCode(containerId);
        
        //want keys to be 'model' and 'test'
        const keys = Object.keys(speedStoredData);
        console.log(keys, speedStoredData);

        // DEFINE OPTIONS
        const options = ChartOptions.addChartDetails(ChartOptions.speedLineOptions);

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);
        console.log(svg);
        

        // ---- refresh the scale each time
        const xMin = 0;
        let xMax = 0;
        const yMin = 0;
        const yMax = 100;

        //Look at max in boxes
        for(let i = 0; i < keys.length ; ++i){

            const speedData = speedStoredData[keys[i]];
            const xValuesSpeed = speedData.map(d => d.x);

            // Min/Max raw data
            const xMaxSpeed = Math.max(...xValuesSpeed);

            if(i === 0) {
                xMax = xMaxSpeed;
            }
            if(i > 0) {
                xMax = Math.max(xMaxSpeed, xMax);
            }
        }
        xMax = Math.ceil(xMax);

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        //try and draw a line
        const lineTest = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        console.log(chartGroup1);

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options);

        // LABELS
        // y-axis tick marks
        const tickYArray = ['0%', '50%', '100%'];

        console.log(chartGroup1, options, tickYArray)
        ChartAxes.tickAxis(chartGroup1, options, tickYArray, 'y');

        // x-axis tick marks
        const tickXArray = [];
        const numTicksX = xMax + 1;   //set number of tick marks to eg be 1 @ zero + 6 if goes to 5.5 hour
        for (let i = 0 ; i < numTicksX ; ++i) {
            tickXArray.push(i);
        }
        ChartAxes.tickAxis(chartGroup1, options, tickXArray);

        svg.append(chartGroup1);        

        // DATA CIRCLES AND PATHS
        //use the calculated scaling to do circles and path lines
        for(let i = 0; i < keys.length ; ++i){
            const speedData = speedStoredData[keys[i]];

            //create group for each stored speed
            const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup2.setAttribute('id', keys[i]);            

            //create circle for each point
            // speedData.forEach(point => {
            //     ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
            // });

            for(const point of speedData) {
                ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
            }

            console.log(speedData);

            const pathClass = speedData[0].pathClass;

            //connect the dots with a path
            ChartGAdd.pathSimple(chartGroup2, speedData, xScale, yScale, pathClass);
            svg.append(chartGroup2);
        }
        //FINISH
        container.append(svg);

        return svg;
    },

    //==========================================================================
    //------------------     [       MEAL PAGE        ]     --------------------
    //==========================================================================
    createFoodPlot(containerId, data, buttonId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // DEFINE OPTIONS
        const includeStuff = ['bgl', 'insulin'];
        const options = ChartOptions.addChartDetails(ChartOptions.foodPlotOptions, includeStuff);

        // MAIN SVG
        const svg = document.getElementById('food-comparison-svg');

        // DATA FOR BUTTONID
        const chartFoodData = ChartOptions.foodPlotUpTo3Data;
        
        // ----  overwrite id:[data]
        chartFoodData[buttonId] = data;
        const keys = Object.keys(chartFoodData);

        // ---- refresh the scale each time
        const xMin = 0;
        let xMax;
        let yMin;
        let yMax;

        //Look at max in boxes
        for(let i = 0; i < keys.length ; ++i){
            const foodData = chartFoodData[keys[i]];
            const xValuesFood = foodData.map(d => d.x);
            const yValuesFood = foodData.map(d => d.y);

            // Regression line intercepts - HOW TO STOP (0,0) VALUES STOPPING THINGS
            const regData = ChartCalc.getRegressionLineData(foodData);
            // console.log(regData);
            const xMaxReg = regData? regData.xIntercept : null;
            const yIntReg = regData? regData.yIntercept : null;

            // Min/Max raw data
            const xMaxFood = Math.max(...xValuesFood, xMaxReg);
            const yMinFood = Math.min(...yValuesFood, yIntReg);
            const yMaxFood = Math.max(...yValuesFood, yIntReg);

            if(i === 0) {
                xMax = xMaxFood;
                yMin = yMinFood;
                yMax = yMaxFood;
            }
            if(i > 0) {
                xMax = Math.max(xMaxFood, xMax);
                yMin = Math.min(yMinFood, yMin);
                yMax = Math.max(yMaxFood, yMax);
            }
        }

        xMax = Math.ceil(xMax);
        yMax = Math.ceil(yMax);
        yMin = Math.floor(yMin);

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax, 'T');

        const chartGroupTicks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroupTicks.setAttribute('component', 'ticks');
        chartGroupTicks.setAttribute('id', 'tick-maxes');

        const yMaxAbs = Math.max(Math.abs(yMin), Math.abs(yMax));
        const yMaxChart = yMaxAbs;
        const yMinChart = -yMaxAbs;

        if(yMaxAbs !== 0) {
            // console.log(options);
            const optionsTicks = options;
            // optionsTicks.class = 
            ChartAxes.tickAxisMax(chartGroupTicks, optionsTicks, xScale, xMax, yScale, yMaxChart, yMinChart);
            svg.append(chartGroupTicks);
        }

        //use the calculated scaling to do circles and regression lines
        for(let i = 0; i < keys.length ; ++i){

            //create group for each stored food
            const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup.setAttribute('id', keys[i]);

            const foodData = chartFoodData[keys[i]];
            const foodDataNoOutliers = [];
            for(let j=0 ; j < foodData.length ; ++j) {
                
                const newFoodObj = foodData[j];
                if(newFoodObj.circleClass.includes('outlier')) continue;
                foodDataNoOutliers.push(newFoodObj);
            }
            console.log(foodDataNoOutliers);



            //create circle for each point
            // foodData.forEach(point => {
            //     ChartGAdd.circleSimple(chartGroup, point, xScale, yScale);
            // });

            for(const point of foodData) {
                ChartGAdd.circleSimple(chartGroup, point, xScale, yScale);
            }



            //regression line
            if(foodDataNoOutliers.length > 1) {
                const xValuesFood = foodDataNoOutliers.map(d => d.x);
                const xMax = Math.max(...xValuesFood);
                
                const myNewObject = ChartCalc.getRegressionLineData(foodDataNoOutliers, xMax);
                console.log(myNewObject, foodDataNoOutliers);
                myNewObject.lineClass = foodData[0].lineClass;
                ChartGAdd.linearLineSimple(chartGroup, myNewObject, xScale, yScale);
            }            
            svg.append(chartGroup);
        }
        // FINISH
        console.log(svg);
        container.append(svg);

        return svg;
    },

    //==========================================================================
    //------------------     [      EXERCISE PAGE     ]     --------------------
    //==========================================================================
    
    //=====================================================
    //------      [  EXERCISE 1: LINES ]         ----------
    //=====================================================
    createExerciseLines(containerId, data, htmlArray) {
        // const container = document.getElementById(containerId);
        // if (!container) return;
        const container = document.querySelector(containerId);
        if (!container) return;

        // CLEAR PREV HTML
        // HelpHtml.clearHtmlFromId(containerId);
        HelpHtml.clearHtmlCode(containerId);
        
        // DEFINE OPTIONS
        const includeStuff = ['bgl', 'insulin'];
        const options = ChartOptions.addChartDetails(ChartOptions.exLineOptions, includeStuff);

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);

        // DECLARE MAX/MIN
        const xMin = 0;
        let xMax;
        let yMin;
        let yMax;
        const regressionObjects = [];
        // const regExclOutlierObjects = [];

        console.log(data);
        // REGRESSION LOOP + GET MAX/MIN
        const keys = HelpComplex.keysFromValues(data, 'exercise');
        console.log(keys);
        for( let i=0 ; i < keys.length ; ++i ) {
            
            const exCurr = keys[i];
            const exCurrData = data.filter(item => item['exercise'] === exCurr);
            const exCurrNoOutliers = exCurrData.filter(item => !item['circleClass'].includes('outlier'));
            console.log(exCurrData, exCurrNoOutliers);

            //can't calculate from only 1 point, so skip any one-off points for exercise intensity
            if(exCurrNoOutliers.length <=1) {
                continue;
            }

            const xValuesEx = exCurrData.map(d => d.x);
            const yValuesEx = exCurrData.map(d => d.y);
            console.log(xValuesEx, yValuesEx);

            // Regression line intercepts
            const regData = exCurrNoOutliers[0]['exId'] === '0 none'?
                ChartCalc.calcLinearRegression(exCurrNoOutliers, options) :
                ChartCalc.calcLinearRegression(exCurrNoOutliers);
            console.log(regData);
            const xMaxReg = regData.xIntercept;
            const yIntReg = regData.yIntercept;

            // push Min/Max raw data for later lines
            const xMaxEx = Math.max(...xValuesEx, xMaxReg);
            const yMinEx = Math.min(...yValuesEx, yIntReg);
            const yMaxEx = Math.max(...yValuesEx, yIntReg);
            
            // regData.color = exCurrData[0]['color'];
            regData.lineClass = exCurrNoOutliers[0]['lineClass'];
            regData.circleClass = exCurrNoOutliers[0]['circleClass'];
            regData.exName = exCurrNoOutliers[0]['exId'];
            regData.xMax = Math.round(10 * xMaxEx)/10;
            regData.yMin = Math.round(10 * yMinEx)/10;
            regData.yMax = Math.round(10 * yMaxEx)/10;
            regressionObjects.push(regData);            

            // find overall MAX/MIN for scaling
            if(i === 0) {
                xMax = xMaxEx;
                yMin = yMinEx;
                yMax = yMaxEx;
            }
            if(i > 0) {
                xMax = Math.max(xMaxEx, xMax);
                yMin = Math.max(yMinEx, yMin);
                yMax = Math.max(yMaxEx, yMax);
            }
        }

        console.log('up to here?');
        //if no scale was possible eg each data only had 1 point, get the max from the normals x's
        const xValuesEx = data.map(d => d.x);
        const yValuesEx = data.map(d => d.y);
        console.log(xValuesEx, yValuesEx);
        if(Number.isNaN(xMax)) xMax = Math.max(xValuesEx);
        if(Number.isNaN(yMax)) yMax = Math.max(yValuesEx);
        if(Number.isNaN(yMin)) yMin = Math.min(yValuesEx);


        // GET LINE OBJECTS' Y2 BEFORE SCALING MAX
        const exLineObjects = [];
        for( let i=0 ; i< regressionObjects.length ; ++i) {

            const exRegObj = regressionObjects[i];
            const xMaxEx = exRegObj.xMax;
            const exLineData = ChartCalc.addLineData(exRegObj, xMaxEx, options);
            console.log(exLineData);
            exLineObjects.push(exLineData);
        }
        console.log(exLineObjects, regressionObjects, options);
        const y2Values = exLineObjects.map(d => d.y2);

        console.log(y2Values);

        // DEFINE XY SCALES
        xMax = Math.ceil(xMax);
        yMax = Math.ceil(Math.max(yMax, ...y2Values));
        yMin = Math.floor(Math.min(yMin, ...y2Values));

        console.log(xMin, xMax, yMin, yMax);
        // yMin = 0;
        // yMax = 7;

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax, 'F');

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options, 'F', yScale);
        ChartAxes.labelAxesStandard(chartGroup1, options);

        //new one for labelling xMax, yMax, yMin
        // const tickXArray = ['',100];
        // ChartAxes.tickAxis(chartGroup1, options, tickXArray, 'x');

        let yMaxChart;
        let yMinChart;
        const yMaxAbs = Math.max(Math.abs(yMin), Math.abs(yMax));

        //special case if yMax is 'close enough' to yMin that yMin wouldn't easily outstrip the yMax
        if(2*Math.abs(yMax) > Math.abs(yMin)) { //if 3 < 2*9 - true            
            yMaxChart = yMaxAbs;
            yMinChart = -2*yMaxAbs;

        } else {
            yMaxChart = yMaxAbs/2;   //4.5
            yMinChart = -yMaxAbs;    //-9
        }

        ChartAxes.tickAxisMax(chartGroup1, options, xScale, xMax, yScale, yMaxChart, yMinChart);
        
        // ChartAxes.labelXmaxYmaxMin(chartGroup1, options, xScale, xMax, yScale, yMin, yMax);

        // DATA
        // CIRCLES
        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'circles');

        // data.forEach(point => {
        //     ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
        // });

        for(const point of data) {
            ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
        }
        
        // LINES ONLY FOR 2+ POINTS
        const chartGroup3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup3.setAttribute('component', 'lines');

        for( let i=0 ; i< exLineObjects.length ; ++i) {
            const exLineData = exLineObjects[i];
            const exName = exLineData.exName;

            ChartGAdd.linearLineSimple(chartGroup3, exLineData, xScale, yScale);
            
            // calculate 0slope/thisExerciseSlope  :  eg 0slope = -2, 3slope = -3, thisFactor = -2/-3 = 0.66
            let thisExRawFactor = 1;
            if(exLineData.slope !== 0) {
                thisExRawFactor = options.slope === null? 'TBC' : Math.round(10 * options.slope / exLineData.slope) / 10;
                console.log(options.slope, exLineData.slope);
            } else if(exName !== '0 none') {
                thisExRawFactor = 'TBC';
            } 

            // const thisExRawFactor = options.slope !== null? Math.round(10 * options.slope / exLineData.slope) / 10 : 'TBC';

            htmlArray.push({
                exName: exName,
                exFactor: thisExRawFactor
            });
        }

        // INDEX: 0 NONE = 1.0
        try{
            htmlArray.find(item => item.exName === '0 none');
            console.log(htmlArray);
        } catch {
            htmlArray.push({
                exName: '0 none',
                exFactor: 1
            });
        }        

        //FINISH
        svg.append(chartGroup1);
        svg.append(chartGroup2);
        svg.append(chartGroup3);
        container.append(svg);

        //NEXT in js, fill in data labels in html-data area

        return svg;
    },


    //=====================================================
    //---------    [  EXERCISE 2: BARS ]     --------------
    //=====================================================
    createExerciseBars(containerId, data) {

        console.log(containerId, data);
        // const container = document.getElementById(containerId);
        // if (!container) return;
        const container = document.querySelector(containerId);
        console.log(container);
        if (!container) return;

        // CLEAR PREV HTML
        // HelpHtml.clearHtmlFromId(containerId);
        HelpHtml.clearHtmlCode(containerId);

        console.log(containerId);

        // DEFINE OPTIONS
        const options = ChartOptions.addChartDetails(ChartOptions.exerciseBarOptions);
        const chartWidth = options.chartWidth;
        const chartHeight = options.chartHeight;

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);        

        // DEFINE XY ITEMS
        const xMin = 0;   //there are 6 bars with 6 spaces before - table is '12' wide
        const xMax = (data.length)* 2 + 1;  //ie 6 exercises * 2 + 1 = 13
        const yValues = data.map(d => d.y);
        const yMin = Math.min(...yValues, 0);  // eg 0.5
        const yMax = Math.max(...yValues);  //likely to all be less than 1 - but maybe crazy exercise actually goes up

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options, 'L');
        ChartAxes.labelAxesStandard(chartGroup1, options);

        // DATA BARS
        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'bars');

        for(let i=0 ; i < data.length ; ++i) {
            const point = data[i];

            //no need to 'draw' if height 0
            if(point.y <= 0 || !point.y) continue;
            console.log(point.y);
            
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', xScale(i*2 + 1));
            bar.setAttribute('y', yScale(point.y) - 2); //subtract 2 for axes width
            bar.setAttribute('width', chartWidth/(2*(data.length + 1)));
            bar.setAttribute('class', point.barClass?? '');
            bar.setAttribute('height', chartHeight*(point.y/yMax));
            chartGroup2.append(bar);
        }

        //FINISH
        svg.append(chartGroup1);
        svg.append(chartGroup2);

        container.append(svg);

        console.log(svg);

        return svg;
    },

    //==========================================================================
    //------------------    [   TIME OF DAY RATIO PAGE ]    --------------------
    //==========================================================================

    //=====================================================
    //----- [  TIME OF DAY RATIO 1: 1 TIMEZONE LINE]  -----
    //=====================================================
    createTzInsulinBgl(containerId, data) {
        // const container = document.getElementById(containerId);
        // if (!container) return;
        const htmlArray = [];
        console.log('START HERE', containerId, data, htmlArray);

        const container = document.querySelector(containerId);
        if (!container) return;

        // CLEAR PREV HTML
        // HelpHtml.clearHtmlFromId(containerId);
        HelpHtml.clearHtmlCode(containerId);

        // DEFINE OPTIONS
        const includeStuff = ['bgl', 'insulin'];
        const options = ChartOptions.addChartDetails(ChartOptions.timezoneInsBglOptions, includeStuff);

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);

        // DEFINE XY ITEMS
        //split data into isRegression and nonRegression
        
        //options.regressionX2 gives x-axis intercept
        //options.regressionY1 gives y-axis intercept (other regression lines can join to)
        const regressionTimezoneData = data.filter(item => item.isRegression === true);
        const regressionTimezoneDataExcOutliers = regressionTimezoneData.filter(item => !item.circleClass.includes('outlier'));

        let lineObjIndex = null;
        if(regressionTimezoneDataExcOutliers.length > 1) {
            options.glucoseGPerServing = regressionTimezoneDataExcOutliers[0].glucoseGPerServing;
            const xRegressValues = regressionTimezoneData.map(d => d.x);
            const regressXmax = Math.max(...xRegressValues);
            lineObjIndex = ChartCalc.getRegressionLineData(regressionTimezoneDataExcOutliers, regressXmax, options);
            options.yIntercept = lineObjIndex.yIntercept;
            lineObjIndex.lineClass = regressionTimezoneDataExcOutliers[0].lineClass;
        }
        // else HelpHtml.showMessage('not enough data to regress', 'error');

        //non-regression data + tz names
        const timezonesNonRegression = data.filter(item => item.isRegression === false);
        const timezonesNonRegressionExcOutliers = timezonesNonRegression.filter(item => !item.circleClass.includes('outlier'));
        const timezoneNames = timezonesNonRegressionExcOutliers.reduce((accumulator, item) => {
            if(!accumulator.includes(item.timezone)) {
                accumulator.push(item.timezone);
            }
            return accumulator;
        }, [] );       

        //mapping data
        const xValues = data.map(d => d.x);
        const yValues = data.map(d => d.y);
        const xMin = Math.min(...xValues, 0);   //0
        const xMax = lineObjIndex? Math.ceil(Math.max(...xValues, lineObjIndex.x2)) : Math.ceil(Math.max(...xValues));  //6
        console.log(xValues, xMax, containerId, data);

        // mapping to get correct min/max y from regression lines
        const nonIndexTzLineObjects = [];
        for(let i = 0 ; i < timezoneNames.length ; ++i) {
            const tzCurr = timezoneNames[i];

            //filter array to just get the current tz - can't draw regression if only 1 value
            const tzCurrData = timezonesNonRegressionExcOutliers.filter(item => item.timezone === tzCurr);
            if(tzCurrData.length <= 1) continue;
            
            const tzLineClass = tzCurrData[0].lineClass;
            const lineObjData = ChartCalc.getRegressionLineData(tzCurrData, xMax, options, 'non-index');  
            lineObjData.timezone = tzCurr;
            lineObjData.lineClass = tzLineClass;

            nonIndexTzLineObjects.push(lineObjData);
        }
        const y2Values = nonIndexTzLineObjects.length > 0? nonIndexTzLineObjects.map(d => d.y2) : [];

        const yMinAbs = lineObjIndex? Math.abs(Math.floor(Math.min(...yValues, ...y2Values, lineObjIndex.y1))) : 
            Math.abs(Math.floor(Math.min(...yValues, ...y2Values)));  //-6
        const yMaxAbs = lineObjIndex? Math.abs(Math.ceil(Math.max(...yValues, ...y2Values, lineObjIndex.y1))) :
            Math.abs(Math.ceil(Math.max(...yValues, ...y2Values)));  //2
        const yMax = Math.max(yMinAbs, yMaxAbs);
        const yMin = -yMax;

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options, 'T');
        ChartAxes.labelAxesStandard(chartGroup1, options);
        ChartAxes.tickAxisMax(chartGroup1, options, xScale, xMax, yScale, yMax, yMin);

        // DATA
        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'circles');
        // data.forEach(point => {
        //     ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
        // });

        for(const point of data) {
            ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
        }

        // REGRESSION LINES
        // stop if no regression lines
        if(lineObjIndex === null) {

            // FINISH
            svg.append(chartGroup1);
            svg.append(chartGroup2);
            container.append(svg);

            return htmlArray;
        }
        const chartGroup3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup3.setAttribute('component', 'lines');

        // regression lines for other points using y-intercept of ref tz - i.e. Regression through the origin
        for( let i=0 ; i<nonIndexTzLineObjects.length ; ++i) {
            const lineObjData = nonIndexTzLineObjects[i];
            const tzCurr = lineObjData.timezone;
            // console.log(lineObjData);

            ChartGAdd.lineSimple(chartGroup3, lineObjData, xScale, yScale);

            //fill in html for seasonal-insulin-zero-change
            const tzXinterceptVal = lineObjData.xIntercept;
            const tzYinterceptVal = lineObjData.yIntercept;

            //want it to be in terms of how much bgl drops per 1U insulin
            const tzSlope = lineObjData.slope;
            const negTzSlope = -tzSlope;
            
            const tz1UinsulinGlucoseVal = Math.round(10 * options.glucoseGPerServing / tzXinterceptVal )/10;    //eg 50g covered by 10U... 1U covers 5g
            const tz1UinsulinBglVal = Math.round(10 * negTzSlope)/10;
            // console.log(tzYinterceptVal, tzXinterceptVal);
            const tzFactorVal = Math.round(10 * lineObjIndex.slope/tzSlope)/10; 

            htmlArray.push({
                timezone: tzCurr,
                isRef: false,
                insulin: tzXinterceptVal,
                bglRise: tzYinterceptVal,
                glucosePer1U: tz1UinsulinGlucoseVal,
                bglDropPer1U: tz1UinsulinBglVal,
                factor: tzFactorVal,
            });
        }

        if (regressionTimezoneDataExcOutliers.length > 1) {
            ChartGAdd.lineSimple(chartGroup3, lineObjIndex, xScale, yScale);

            //also fill in html for tz-insulin-zero-change
            const refTz = regressionTimezoneDataExcOutliers[0].timezone;
            const refTzXinterceptVal = lineObjIndex.xIntercept;
            const refTzYinterceptVal = lineObjIndex.yIntercept;
            
            //want it to be in terms of how much bgl drops per 1U insulin
            const refTzSlope = lineObjIndex.slope;
            const negRefTzSlope = -refTzSlope;


            const refTz1UinsulinGlucoseVal = Math.round(10 * options.glucoseGPerServing / refTzXinterceptVal )/10;    //eg 50g covered by 10U... 1U covers 5g
            const refTz1UinsulinBglVal = Math.round(10 * negRefTzSlope)/10;    //eg 10U insulin gets y-intercept of 5bgl down to zero...
            const tzFactorVal = 1;

            htmlArray.push({
                timezone: refTz,
                isRef: true,
                insulin: refTzXinterceptVal,
                bglRise: refTzYinterceptVal,
                glucosePer1U: refTz1UinsulinGlucoseVal,
                bglDropPer1U: refTz1UinsulinBglVal,
                factor: tzFactorVal,
            });

            console.log(tzFactorVal, htmlArray);
        }
        // FINISH
        svg.append(chartGroup1);
        svg.append(chartGroup2);
        svg.append(chartGroup3);
        container.append(svg);

        console.log(containerId, svg);

        return htmlArray;
    },

    //=====================================================
    //----- [  TIME OF DAY RATIO 2: 1 SEASON LINE ]  ------
    //=====================================================
    createSeasonInsulinBgl(containerId, data) {
        const htmlArray = [];
        // console.log(data);
        // const container = document.getElementById(containerId);
        // if (!container) return;
        const container = document.querySelector(containerId);
        if (!container) return;

        console.log(data);

        // CLEAR PREV HTML
        // HelpHtml.clearHtmlFromId(containerId);
        HelpHtml.clearHtmlCode(containerId);

        // DEFINE OPTIONS
        const includeStuff = ['bgl', 'insulin'];
        const options = ChartOptions.addChartDetails(ChartOptions.seasonInsBglOptions, includeStuff);

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);

        // DEFINE XY ITEMS
        //split data into isRegression and nonRegression
        
        //options.regressionX2 gives x-axis intercept
        //options.regressionY1 gives y-axis intercept (other regression lines can join to)
        const regressionSeasonData = data.filter(item => item.isRegression === true);
        const regressionSeasonDataExcOutliers = regressionSeasonData.filter(item => !item.circleClass.includes('outlier'));
        let lineObjIndex = null;
        if(regressionSeasonDataExcOutliers.length > 1) {
            options.glucoseGPerServing = regressionSeasonDataExcOutliers[0].glucoseGPerServing;
            const xRegressValues = regressionSeasonData.map(d => d.x);
            const regressXmax = Math.max(...xRegressValues);
            
            lineObjIndex = ChartCalc.getRegressionLineData(regressionSeasonDataExcOutliers, regressXmax, options);
            options.yIntercept = lineObjIndex.yIntercept;
            console.log(lineObjIndex);
            lineObjIndex.lineClass = regressionSeasonDataExcOutliers[0].lineClass;

        }
        // else HelpHtml.showMessage("not enough data to calculate regression line", 'warning');

        //non-regression data + season names
        const seasonsNonRegression = data.filter(item => item.isRegression === false);
        const seasonsNonRegressionExcOutliers = seasonsNonRegression.filter(item => !item.circleClass.includes('outlier'));
        const seasonNames = seasonsNonRegressionExcOutliers.reduce((accumulator, item) => {
            if(!accumulator.includes(item.season) && accumulator.length <= 3) {
                accumulator.push(item.season);
            }
            return accumulator;            
        }, [] );
        
        //mapping data
        const xValues = data.map(d => d.x);
        const yValues = data.map(d => d.y);
        const xMin = Math.min(...xValues, 0);   //0
        const xMax = lineObjIndex? Math.ceil(Math.max(...xValues, lineObjIndex.x2)) : Math.ceil(Math.max(...xValues));  //6
        
        // mapping to get correct min/max y from regression lines
        const nonIndexSeaLineObjects = [];
        for(let i = 0 ; i < seasonNames.length ; ++i) {
            const seaCurr = seasonNames[i];

            //filter array to just get the current tz - can't draw regression if only 1 value
            const seaCurrData = seasonsNonRegressionExcOutliers.filter(item => item.season === seaCurr);
            if(seaCurrData.length <= 1) continue;
            const seaLineClass = seaCurrData[0].lineClass;

            const lineObjData = ChartCalc.getRegressionLineData(seaCurrData, xMax, options, 'non-index');            
            lineObjData.season = seaCurr;
            lineObjData.lineClass = seaLineClass;

            nonIndexSeaLineObjects.push(lineObjData);
        }
        const y2Values = nonIndexSeaLineObjects.length > 0? nonIndexSeaLineObjects.map(d => d.y2) : [];
        
        const yMinAbs = lineObjIndex? Math.abs(Math.floor(Math.min(...yValues, ...y2Values, lineObjIndex.y1))) :
            Math.abs(Math.floor(Math.min(...yValues, ...y2Values)));  //-6
        const yMaxAbs = lineObjIndex? Math.abs(Math.ceil(Math.max(...yValues, ...y2Values, lineObjIndex.y1))) :
            Math.abs(Math.ceil(Math.max(...yValues, ...y2Values)));  //2
        const yMax = Math.max(yMinAbs, yMaxAbs);
        const yMin = -yMax;

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options, 'T');
        ChartAxes.labelAxesStandard(chartGroup1, options);
        ChartAxes.tickAxisMax(chartGroup1, options, xScale, xMax, yScale, yMax, yMin);

        // DATA
        // CIRCLES
        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'circles');

        // data.forEach(point => {
        //     console.log(point.y, yScale(point.y), point);
        //     ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
        // });

        for(const point of data) {
            ChartGAdd.circleSimple(chartGroup2, point, xScale, yScale);
        }

        // REGRESSION LINES
        // stop if no regression lines
        if(lineObjIndex === null) {

            // FINISH
            svg.append(chartGroup1);
            svg.append(chartGroup2);
            container.append(svg);

            return htmlArray;
        }
        
        const chartGroup3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup3.setAttribute('component', 'lines');

        for( let i=0 ; i<nonIndexSeaLineObjects.length ; ++i) {
            const lineObjData = nonIndexSeaLineObjects[i];
            const seaCurr = lineObjData.season;

            ChartGAdd.lineSimple(chartGroup3, lineObjData, xScale, yScale);

            //fill in html for seasonal-insulin-zero-change
            const seasonXinterceptVal = lineObjData.xIntercept;
            const seasonYinterceptVal = lineObjData.yIntercept;
            const slopeVal = lineObjData.slope;
            const negSlopeVal = -slopeVal;

            const season1UinsulinGlucoseVal = Math.round( 10 * options.glucoseGPerServing / seasonXinterceptVal )/10;    //eg 50g covered by 10U... 1U covers 5g
            const season1UinsulinBglVal = Math.round( 10 * negSlopeVal)/10;
            const seasonFactorVal = Math.round( 10*seasonXinterceptVal / lineObjIndex.xIntercept)/10;

            // GET HTML ARRAY
            htmlArray.push({
                season: seaCurr,
                isRef: false,
                insulin: seasonXinterceptVal,
                bglRise: seasonYinterceptVal,
                glucosePer1U: season1UinsulinGlucoseVal,
                bglDropPer1U: season1UinsulinBglVal,
                factor: seasonFactorVal,
            });        
        }

        // main regression line
        if (regressionSeasonData.length > 1) {
            ChartGAdd.lineSimple(chartGroup3, lineObjIndex, xScale, yScale);
            
            //fill in html for seasonal-insulin-zero-change
            const refSeason = regressionSeasonData[0].season;
            const refSeasonXinterceptVal = lineObjIndex.xIntercept;
            const refSeasonYinterceptVal = lineObjIndex.yIntercept;
            const refSlope = lineObjIndex.slope;
            const negRefSlope = -refSlope;

            const refSeason1UinsulinGlucoseVal = Math.round( 10 * options.glucoseGPerServing / refSeasonXinterceptVal )/10;    //eg 50g covered by 10U... 1U covers 5g
            const refSeason1UinsulinBglVal = Math.round( 10 * negRefSlope)/10;
            const refSeasonFactorVal = Math.round( 10 * refSeasonXinterceptVal / lineObjIndex.xIntercept)/10;

            htmlArray.push({
                season: refSeason,
                isRef: true,
                insulin: refSeasonXinterceptVal,
                bglRise: refSeasonYinterceptVal,
                glucosePer1U: refSeason1UinsulinGlucoseVal,
                bglDropPer1U: refSeason1UinsulinBglVal,
                factor: refSeasonFactorVal,
            });
        }
        console.log(htmlArray);

        // FINISH
        svg.append(chartGroup1);
        svg.append(chartGroup2);
        svg.append(chartGroup3);
        container.append(svg);

        return htmlArray;
    },

    //=====================================================
    //----  [  TIME OF DAY RATIO 3: 1 YEAR BAR]  ----------
    //=====================================================
    createYearSeasonInsulin(containerId, data) {
        // const container = document.getElementById(containerId);
        // if (!container) return;

        // // CLEAR PREV HTML
        // HelpHtml.clearHtmlFromId(containerId);
        const container = document.querySelector(containerId);
        if (!container) return;

        // CLEAR PREV HTML
        HelpHtml.clearHtmlCode(containerId);

        // DEFINE OPTIONS
        const options = ChartOptions.addChartDetails(ChartOptions.seasonYearOptions);
        const chartWidth = options.chartWidth;
        const chartHeight = options.chartHeight;

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);

        // DEFINE XY ITEMS
        // const xValues = data.map(d => d.x);  // X NOT NEEDED
        const yValues = data.map(d => d.y);

        const xMin = 0;   //there are 5 bars with 5 spaces before - table is '10' wide
        const xMax = (data.length + 1)* 2;  //ie 4 seasons, but starts and ends at same one
        const yMin = Math.min(...yValues, 0);  // eg 0.5
        const yMax = Math.max(...yValues);  //eg 2, but add a little bit on top to get 2.1

        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options, 'L');
        
        //label y-axis
        ChartAxes.labelAxesStandard(chartGroup1, options);

        // DATA
        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'bars');

        for(let i=0 ; i < data.length ; ++i) {
            const point = data[i];
            
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', xScale(i*2 + 1));
            bar.setAttribute('y', yScale(point.y) - 2); //subtract 2 for axes width
            bar.setAttribute('width', chartWidth/(2*(data.length + 1)));
            bar.setAttribute('class', point.barClass?? '');
            bar.setAttribute('height', chartHeight*(point.y/yMax));
            chartGroup2.append(bar);

            if(i === 0) {
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', xScale(data.length*2 + 1));
                bar.setAttribute('y', yScale(point.y) - 2);
                bar.setAttribute('width', chartWidth/(2*(data.length + 1)));
                bar.setAttribute('class', point.barClass?? '');
                bar.setAttribute('height', chartHeight*(point.y/yMax));
                chartGroup2.append(bar);
            }
        }

        // FINISH
        svg.append(chartGroup1);
        svg.append(chartGroup2);
        container.append(svg);

        return svg;
    },


    //=====================================================
    //----- [  TIME OF DAY RATIO 4: 1 DAY LINE] -----------
    //=====================================================
    createDayTimezoneInsulin(containerId, data) {
        // const container = document.getElementById(containerId);
        // if (!container) return;

        // // CLEAR PREV HTML
        // HelpHtml.clearHtmlFromId(containerId);        

        const container = document.querySelector(containerId);
        if (!container) return;

        console.log(data);

        // CLEAR PREV HTML
        HelpHtml.clearHtmlCode(containerId);

        // DEFINE OPTIONS
        const options = ChartOptions.addChartDetails(ChartOptions.timezoneDayOptions);
        // const width = options.width;
        const height = options.height;
        const pad = options.pad;
        const chartWidth = options.chartWidth;
        // const chartHeight = options.chartHeight;

        // MAIN SVG
        const svg = ChartGAdd.createSvg(container, options);

        // DEFINE XY ITEMS
        // let xValues = null;
        let yValues = null;
        
        try{
            // xValues = data.map(d => d.x);
            yValues = data.map(d => d.y);
            // HelpHtml.showMessage('good stuff');
            // console.log(xValues);

        } catch (error) {
            // HelpHtml.showMessage('Error showing this stuff', 'error');
            console.error('error showing this stuff', error);
        }

        // const xValues = data.map(d => d.x);
        // const yValues = data.map(d => d.y);

        const xMin = 0;   //
        const xMax = 1;  //ie 1 day, starts and ends at same (x,y)
        const yMin = 0;  //
        const yMax = Math.max(...yValues);  //eg 2, but add a little bit on top to get 2.1
        
        const xScale = xScaleVal(options, xMin, xMax);
        const yScale = yScaleVal(options, yMin, yMax);

        // AXES CHARTGROUP TO ADD TO SVG
        const chartGroup1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // AXES
        ChartAxes.appendAxesChartgroup(chartGroup1, options, 'H');

        //put time labels along x-axis
        const xLabelArray = ['12am', '6am', '12pm', '6pm', '12pm'];
        const xLabel100Percent = xLabelArray.length - 1;
        const xLabelYposition = height - 10;

        for(let i = 0; i < xLabelArray.length ; ++i) {
            const xPosition = pad.left + i/xLabel100Percent * chartWidth;
            
            const xLabeli = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            xLabeli.setAttribute('x', xPosition);
            xLabeli.setAttribute('y', xLabelYposition);
            xLabeli.setAttribute('class', options.chartClass);
            xLabeli.textContent = xLabelArray[i];
            chartGroup1.append(xLabeli);
        }
        
        //label y-axis
        ChartAxes.labelYAxis(chartGroup1, options);
        
        // DATA CIRCLES LINE
        const chartGroup2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup2.setAttribute('component', 'lines');
        const chartGroup3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup3.setAttribute('component', 'circles');
        
        //getting the line to meet at same point at start and end...
        //1st point x,y that are fixed
        const xAtStart = data[0].x;
        const yAtStart = data[0].y;        

        for(let i=0 ; i < data.length ; ++i) {
            const point = data[i];
            const prevPoint = i>0? data[i-1] : null;

            console.log(point);

            if( i > 0 ) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', xScale(prevPoint.x));
                line.setAttribute('y1', yScale(prevPoint.y));
                line.setAttribute('x2', xScale(point.x));
                line.setAttribute('y2', yScale(point.y));
                line.setAttribute('stroke', '#007AFF');
                line.setAttribute('stroke-width', '3');
                chartGroup2.append(line);
            }

            //if it's last x point, need to work out the gradient to 24hr + 1st point, and draw line to 1st point
            if( i === data.length - 1) {
                const xRunToEnd = 1 - point.x;
                const gradientToStartPoint = (yAtStart - point.y) / (xRunToEnd + xAtStart);

                const xAtEnd = 1;   //ie 1 whole day
                const yAtEnd = point.y + (gradientToStartPoint * xRunToEnd);

                const xAtZero = 0;
                const yAtZero = yAtStart - (gradientToStartPoint * xAtStart);

                const lineToEnd = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                lineToEnd.setAttribute('x1', xScale(point.x));
                lineToEnd.setAttribute('y1', yScale(point.y));
                lineToEnd.setAttribute('x2', xScale(xAtEnd));   //theoretical x at end
                lineToEnd.setAttribute('y2', yScale(yAtEnd));   //theoretical y at end
                chartGroup2.append(lineToEnd);

                const lineAtZeroToFirstPoint = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                lineAtZeroToFirstPoint.setAttribute('x1', xScale(xAtZero));
                lineAtZeroToFirstPoint.setAttribute('y1', yScale(yAtZero));
                lineAtZeroToFirstPoint.setAttribute('x2', xScale(xAtStart));   //theoretical x at end
                lineAtZeroToFirstPoint.setAttribute('y2', yScale(yAtStart));   //theoretical y at end
                chartGroup2.append(lineAtZeroToFirstPoint);
            }
            
            ChartGAdd.circleSimple(chartGroup3, point, xScale, yScale);
        }

        // FINISH
        svg.append(chartGroup1);
        svg.append(chartGroup2);
        svg.append(chartGroup3);
        container.append(svg);

        return svg;
    },
};

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import { HelpTheme }  from './utils/helpers.js';
import { Router }     from './router.js';
import { HomeView }     from './views/home.js';
import { LogView }      from './views/log.js';
import { SettingsView } from './views/settings.js';
import { AboutView }    from './views/about.js';
import { CalculatorView }       from './views/statistics/calculator.js';
import { ExerciseView }         from './views/statistics/exercise.js';
import { FoodDatabaseView }     from './views/statistics/foodDatabase.js';
import { InsulinSpeedView }     from './views/statistics/insulinSpeed.js';
import { MealView }             from './views/statistics/meal.js';
import { SleepView }            from './views/statistics/sleep.js';
import { TimeOfDayRatioView }   from './views/statistics/timeOfDayRatio.js';
import { WeekPatternView }      from './views/statistics/weekPattern.js';

//==============================================================================
//--------------------        [        APP        ]        ---------------------
//==============================================================================
HelpTheme.init();

Router.register('/', () => {
    if (HomeView !== undefined && HomeView.render) {
        HomeView.render();
    }
});

Router.register('/log', () => {
    if (LogView !== undefined && LogView.render) {
        LogView.render();
    }
});

Router.register('/settings', () => {
    if (SettingsView !== undefined && SettingsView.render) {
        SettingsView.render();
    }
});

Router.register('/statistics/meal', () => {
    if (MealView !== undefined && MealView.render) {
        MealView.render();
    }
});

Router.register('/statistics/exercise', () => {
    if (ExerciseView !== undefined && ExerciseView.render) {
        ExerciseView.render();
    }
});

Router.register('/statistics/calculator', () => {
    if (CalculatorView !== undefined && CalculatorView.render) {
        CalculatorView.render();
    }
});

// TACKLE NEXT
Router.register('/statistics/week-pattern', () => {
    if (WeekPatternView !== undefined && WeekPatternView.render) {
        WeekPatternView.render();
    }
});

Router.register('/statistics/food-database', () => {
    if (FoodDatabaseView !== undefined && FoodDatabaseView.render) {
        FoodDatabaseView.render();
    }
});

Router.register('/statistics/time-of-day-ratio', () => {
    if (TimeOfDayRatioView !== undefined && TimeOfDayRatioView.render) {
        TimeOfDayRatioView.render();
    }
});

Router.register('/statistics/insulin-speed', () => {
    if (InsulinSpeedView !== undefined && InsulinSpeedView.render) {
        InsulinSpeedView.render();
    }
});

Router.register('/statistics/sleep', () => {
    if (SleepView !== undefined && SleepView.render) {
        SleepView.render();
    }
});

Router.register('/about', () => {
    if (AboutView !== undefined && AboutView.render) {
        AboutView.render();
    }
});

Router.init();

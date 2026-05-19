/*  ABOUT PAGE STRUCTURE  
**  ============================================================================
**  DECLARE
**  preferences  -> access Stored data and update as needed
**  current date -> to show latest date only
**  
**  ============================================================================
**  RENDERING
**  only rendering the GIF for season/dayOrNight
**  
**  ============================================================================
**  EVENT LISTENERS - STATIC (placement known ahead of time)
**  picture navigation buttons + show/hide instructions
**  
**  ============================================================================
**  FUNCTIONS - STATIC
**  
**  toggleShowBoxInfo(box, button) -> show/hide instructions
*/

//==============================================================================
//-------------------       [     IMPORT MODULES   ]       ---------------------
//==============================================================================
import {
    HelpHtml,
    HelpDateTime,
    HelpSeason,

} from '../utils/helpers.js';

import { StorageService } from '../utils/storage.js';
import { Router } from '../router.js';

//==============================================================================
//-------------------       [     EXPORT MODULES   ]       ---------------------
//==============================================================================
export const AboutView = {
    //==========================================================================
    //------------------ [      DECLARE + MAIN RENDER    ] ---------------------
    //==========================================================================
    preferences: null,
    currentDate: HelpDateTime.getTodayKey(),

    render() {
        const container = HelpHtml.clearHtmlCode('#view-container');

        fetch('../../html/a5About.html')
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
    //------------------ [LOAD PREFERENCES SETUP] ------------------------------
    //==========================================================================
    loadPreferences() {
        this.preferences = StorageService.getPreferences();
        this.renderSeasonGif();
        this.renderCorrectBGLunitsText();
        this.attachStaticEventListeners();
    },

    //==========================================================================
    //-----------------------       [RENDERING]        -------------------------
    //==========================================================================
    renderSeasonGif() {
        const seasonNow = HelpSeason.getDatesSeason(this.currentDate);
        const dayNight = this.preferences.userSelections.darkMode? 'Night' : 'Day';
        const imageKey = `./images/Anim_${seasonNow}_${dayNight}.gif`;
        const imageBox = document.getElementById('bgl-pal-daylight');
        
        imageBox.src = imageKey;
    },

    renderCorrectBGLunitsText() {
        const bglUnit = this.preferences.userSelections.glucoseUnit;
        const check = document.querySelectorAll('span');
        
        const mmolTexts = document.querySelectorAll('span[data-index="mmol-text"]');
        const mgdlTexts = document.querySelectorAll('span[data-index="mgdl-text"]');
        console.log(check, mmolTexts, mgdlTexts);

        for(const text of mgdlTexts) {
            text.classList.toggle('hidden', bglUnit === 'mmol/L');
        }
        for(const text of mmolTexts) {
            text.classList.toggle('hidden', bglUnit === 'mg/dL');
        }
    },

    //==========================================================================
    //-----------   [        EVENT LISTENERS - STATIC        ]  ----------------
    //==========================================================================
    attachStaticEventListeners() {
        const logoNav = document.getElementById('bgl-pal-logo');
        logoNav.addEventListener('click', () => {
            Router.navigate('/');
        });

        const navButton = document.querySelectorAll('button[data-action="navigate"]');
        for(const button of navButton) {
            button.addEventListener('click', (event) => {
                const navUrl = event.target.dataset.index;
                console.log(navUrl);
                Router.navigate(`/${navUrl}`);
            });
        }
        
        const sectionShow = document.querySelectorAll('button[data-action="show"]');
        for(const button of sectionShow) {
            button.addEventListener('click', (event) => {
                const button = event.target;
                const box = event.target.parentElement.parentElement.dataset.index;
                this.toggleShowBoxInfo(box, button);   //using val to differentiate from .value used in function
            });
        }
    },

    //==========================================================================
    //----------------   [        FUNCTIONS - STATIC        ]  -----------------
    //==========================================================================
    toggleShowBoxInfo(box, button) {
        //set box to active - if active, and clicked on, want it to hide again
        const tablesToShow = document.querySelectorAll(`[data-index=${box}] table`);
        
        //if active, make inactive, and vice-versa
        const isActive = (button.className.includes('active'));
        
        button.classList.toggle('active', !isActive);
        for(const table of tablesToShow) {
            table.classList.toggle('hidden', isActive);
        }
    }
};

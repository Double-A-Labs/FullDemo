import { setupButtons } from '../libraries/buttonMaster.js';
import { initializeLocalStorage } from '../site.js';
import startBabylon from '../libraries/babylonMaster.js';


const init = async () => {
    window.localStorage.clear();
    initializeLocalStorage();
    let videoElem = document.createElement('video');
    startBabylon();
    setupButtons(videoElem);
};

window.onload = () => init();

import {
    setupButtons
} from '../libraries/buttonMaster.js';

import startBabylon from '../libraries/babylonMaster.js';

const init = async () => {
    let videoElem = document.createElement('video');
    startBabylon();
    setupButtons(videoElem);
};

window.onload = () => init();

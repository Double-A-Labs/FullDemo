import { setupButtons } from '../libraries/buttonMaster';
import { initializeLocalStorage } from '../libraries/localStorageMaster';
import startBabylon from '../libraries/babylonMaster';
import { initVideoCompressionMaster } from '../libraries/videoCompressionMaster';
import { initFrameMaster } from '../libraries/frameMaster';
import { initSocketMaster } from '../libraries/socketMaster';


const init = async () => {
    initializeLocalStorage();
    initVideoCompressionMaster();
    initFrameMaster();
    initSocketMaster();

    let videoElem = document.createElement('video');
    startBabylon();
    setupButtons(videoElem);
};

window.onload = () => init();

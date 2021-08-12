import { registerFrameCallback, deregisterFrameCallback, sendFrameData } from './frameMaster.js';
import { connectToServer } from './socketMaster.js';
import { requestWebcamAccess } from './webcam.js';

import { updateLocalStorage, localStorageEnum } from '../site.js'
import { clearUserAvatars, createNewUser } from './babylonMaster.js';

const { meeting, error } = localStorageEnum;
const stopBtn = document.getElementById('stop');
const startBtn = document.getElementById('start');
const newUserBtn = document.getElementById('newUser');
newUserBtn.onclick = createNewUser;

const toggleStartStopButtons = () => {
    startBtn.disabled = !startBtn.disabled;
    stopBtn.disabled = !startBtn.disabled;
}

const toggleNewUserBtn = () => {
    newUserBtn.disabled = !newUserBtn.disabled;
}

const OnStopClick = (websocket, video) => {
    updateLocalStorage(meeting, 'Ending');
    if (websocket && websocket.readyState !== websocket.OPEN) {
        websocket.close();
    }

    deregisterFrameCallback(video);

    video.pause();
    video.srcObject = null;

    toggleStartStopButtons();
    toggleNewUserBtn();

    clearUserAvatars();
    updateLocalStorage(meeting, 'Ended');
}

const OnStartClick = (videoElem) => {
    updateLocalStorage(meeting, 'Starting');
    return connectToServer('test', videoElem)
        .then(websocket => {
            stopBtn.onclick = () => OnStopClick(websocket, videoElem);
            videoElem.onplaying = registerFrameCallback(videoElem, () => sendFrameData(websocket, videoElem));

            requestWebcamAccess()
                .then(stream => {
                    createNewUser();
                    videoElem.srcObject = stream;
                    videoElem.play();
                    toggleStartStopButtons();
                    toggleNewUserBtn();
                    updateLocalStorage(meeting, 'Live');
                })
                .catch(err => {
                    console.error('requestWebcamAccess', err);
                    updateLocalStorage(error, err.message);
                });

        })
        .catch(err => {
            console.log('connectToServer', err);
            updateLocalStorage(error, err.message);
        });
};

export const setupButtons = (videoElem) => {
    startBtn.onclick = () => OnStartClick(videoElem)
    toggleStartStopButtons();
}

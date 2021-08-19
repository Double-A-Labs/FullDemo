import { registerFrameCallback, deregisterFrameCallback, sendFrameData, onCameraFrameCallback } from './frameMaster';
import { connectToServer } from './socketMaster';
import { requestWebcamAccess } from './webcamMaster';

import { updateLocalStorage, LSEnum } from './localStorageMaster'
import { clearUserAvatars, createNewUser, updateBackgroundImage } from './babylonMaster';

export const meetingStates = {
    waiting: 'Waiting',
    starting: 'Starting',
    live: 'Live',
    ended: 'Ended'
}

const defaultWsEndpoint = 'stream';

const stopBtn = document.getElementById('stop');
const startBtn = document.getElementById('start');
const newUserBtn = document.getElementById('newUser');
const changeBgBtn = document.getElementById("changeBg");

const OnStopClick = (websocket, video) => {
    updateLocalStorage(LSEnum.meeting, meetingStates.ended);
    if (websocket && websocket.readyState !== websocket.OPEN) {
        websocket.close();
    }

    deregisterFrameCallback(video);

    video.pause();
    video.srcObject = null;

    toggleStartStopButtons();
    newUserBtn.disabled = true;

    clearUserAvatars();
    updateLocalStorage(LSEnum.meeting, meetingStates.ended);
}

const OnStartClick = (videoElem) => {
    updateLocalStorage(LSEnum.meeting, meetingStates.starting);
    return connectToServer(defaultWsEndpoint, videoElem)
        .then(websocket => {
            stopBtn.onclick = () => OnStopClick(websocket, videoElem);
            videoElem.onplaying = registerFrameCallback(videoElem, (_now, metadata) => onCameraFrameCallback(websocket, videoElem, metadata));

            requestWebcamAccess()
                .then(stream => {
                    createNewUser();
                    videoElem.srcObject = stream;
                    videoElem.play();
                    toggleStartStopButtons();
                    setupNewUserButton();
                    updateLocalStorage(LSEnum.meeting, meetingStates.live);
                })
                .catch(err => {
                    console.error('requestWebcamAccess', err);
                    updateLocalStorage(LSEnum.error, err.message);
                });

        })
        .catch(err => {
            console.error('connectToServer', err);
            updateLocalStorage(LSEnum.error, err.message);
        });
};

const toggleStartStopButtons = () => {
    startBtn.disabled = !startBtn.disabled;
    stopBtn.disabled = !startBtn.disabled;
}

export const setupButtons = (videoElem) => {
    startBtn.onclick = () => OnStartClick(videoElem)
    toggleStartStopButtons();
}

const setupNewUserButton = () => {
    newUserBtn.onclick = createNewUser;
    newUserBtn.disabled = false;
}

export const setupChangeBgButton = () => {
    changeBgBtn.onclick = updateBackgroundImage;
    changeBgBtn.disabled = false;
}

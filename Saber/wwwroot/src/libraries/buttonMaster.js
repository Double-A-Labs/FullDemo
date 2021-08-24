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

export const OnStopClick = (websocket, video) => {
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

export const OnStartClick = (videoElem) => {
    updateLocalStorage(LSEnum.meeting, meetingStates.starting);
    return connectToServer(defaultWsEndpoint, videoElem)
        .then(websocket => {
            videoElem.onplaying = registerFrameCallback(videoElem, (_now, metadata) => onCameraFrameCallback(websocket, videoElem, metadata));

            requestWebcamAccess()
                .then(stream => {
                    createNewUser();
                    videoElem.srcObject = stream;
                    videoElem.play();
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

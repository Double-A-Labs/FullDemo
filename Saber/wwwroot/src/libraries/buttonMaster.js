import { registerFrameCallback, deregisterFrameCallback, sendFrameData } from './frameMaster.js';
import { connectToServer } from './socketMaster.js';
import { requestWebcamAccess } from './webcam.js';

import { handleErrors } from '../site.js'
import { clearUserAvatars, createNewUser } from './babylonMaster.js';

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
    if (websocket && websocket.readyState !== websocket.OPEN) {
        websocket.close();
    }

    deregisterFrameCallback(video);

    video.pause();
    video.srcObject = null;

    toggleStartStopButtons();
    toggleNewUserBtn();

    clearUserAvatars();
}

const OnStartClick = (videoElem) =>
    connectToServer('test', videoElem)
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
                })
                .catch(err => {
                    console.log(1111)
                    return err;
                });

        })
        .catch(err => {
            console.log(2222)
            handleErrors('connectToServer', err);
        });

export const setupButtons = (videoElem) => {
    startBtn.onclick = () => OnStartClick(videoElem);
    toggleStartStopButtons();
}

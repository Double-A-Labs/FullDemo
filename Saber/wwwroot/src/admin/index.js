import { meetingStates } from '../libraries/buttonMaster';
import { addSocketUrl, addRowComponent, updateErrorAlert, updateStatusMsg, updateComponentData } from '../libraries/dashboardMaster';
import { getLocalStorageData } from '../libraries/localStorageMaster'
const adminUpdateInterval = 1000;

const init = () => {
    const {
        currentUsers,
        meetingStatus,
        websocketStatus,
        websocketUrl,
        originVideoData,
        serverVideoData,
        errorMessage,
        compressionData
    } = getLocalStorageData();

    if (errorMessage) {
        updateErrorAlert(errorMessage)
    }

    if (websocketUrl) {
        addSocketUrl(websocketUrl);
    }

    if (websocketStatus) {
        updateStatusMsg(websocketStatus);
    }

    if (meetingStatus) {
        updateStatusMsg(meetingStatus, true);
    } else {
        updateStatusMsg(meetingStates.waiting, true);
    }

    if (compressionData) {
        updateComponentData('comOps', compressionData.options);
        updateComponentData('compress', compressionData);
    }

    if (originVideoData) {
        updateComponentData('orgVid', originVideoData);
    }

    if (serverVideoData) {
        updateComponentData('serVid', serverVideoData);
    }

    if (currentUsers && Object.keys(currentUsers).length > 0) {
        updateComponentData('users', currentUsers);
    }

    setInterval(updateAdmin, adminUpdateInterval);
}

const updateAdmin = () => {
    const {
        currentUsers,
        meetingStatus,
        websocketStatus,
        originVideoData,
        serverVideoData,
        errorMessage,
        compressionData
    } = getLocalStorageData();

    if (errorMessage) {
        updateErrorAlert(errorMessage);
    }

    if (meetingStatus) {
        updateStatusMsg(meetingStatus, true);
    } else {
        updateStatusMsg(meetingStates.waiting, true);
    }

    if (websocketStatus) {
        updateStatusMsg(websocketStatus);
    }

    if (compressionData) {
        updateComponentData('compress', compressionData);
    }

    if (originVideoData) {
        updateComponentData('orgVid', originVideoData);
    }

    if (serverVideoData) {
        updateComponentData('serVid', serverVideoData);
    }

    if (currentUsers && Object.keys(currentUsers).length > 0) {
        updateComponentData('users', currentUsers);
    }
}


window.onload = init;
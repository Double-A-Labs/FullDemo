import { updateLocalStorage, localStorageEnum } from '../site';
import { updateUserTextures } from './babylonMaster';
const { origVid, error } = localStorageEnum;

let requestFrameId = null;
export const width = 320;
export const height = 320;
const circleX = width / 2;
const circleY = height / 2;

let originVideoData = {};
export let serverVideoData = {};
let tmpCanvas = document.createElement('canvas');

export const registerFrameCallback = (video, callbackMethod) => {
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        requestFrameId = video.requestVideoFrameCallback(callbackMethod);
    } else {
        requestFrameId = requestAnimationFrame(callbackMethod);
    }
}

export const deregisterFrameCallback = (video) => {
    if (video) {
        video.cancelVideoFrameCallback(requestFrameId);
    } else {
        cancelAnimationFrame(requestFrameId);
    }
}

export const sendFrameData = (websocket, video, metadata) => {
    tmpCanvas.height = height + 200;
    tmpCanvas.width = width;

    if (metadata) {
        originVideoData.captureTime = metadata.captureTime;
        originVideoData.expectedDisplayTime = metadata.expectedDisplayTime;
        originVideoData.presentationTime = metadata.presentationTime;
        originVideoData.presentedFrames = metadata.presentedFrames;
    }

    const tmpCtx = tmpCanvas.getContext('2d');

    tmpCtx.beginPath();
    tmpCtx.arc(circleX, circleY, 500, 0, 2 * Math.PI);
    tmpCtx.closePath();
    tmpCtx.clip();

    tmpCtx.drawImage(video, circleX/2, circleY/2, width, height);

    const image = tmpCtx.getImageData(circleX / 2, circleY / 2, width, height);

    if (websocket && websocket.readyState == websocket.OPEN) {
        websocket.send(image.data)
    }

    registerFrameCallback(video, (_now, metadata) => sendFrameData(websocket, video, metadata));

    const videoQuality = video.getVideoPlaybackQuality();

    originVideoData.canvasHeight = tmpCanvas.height;
    originVideoData.canvasWidth = tmpCanvas.width;
    originVideoData.imageHeight = image.height;
    originVideoData.imageWidth = image.width;
    originVideoData.totalBytes = image.data.byteLength;
    originVideoData.totalFrames = videoQuality.totalFrames;
    originVideoData.droppedFrames = videoQuality.droppedFrames;
    originVideoData.corruptedFrames = videoQuality.corruptedFrames;
   
    updateLocalStorage(origVid, originVideoData);
}

export const pasteFrameData = (buffer) => {
    try {
        const arr = new Uint8ClampedArray(buffer);
        serverVideoData.totalBytes = arr.byteLength;
        updateUserTextures(arr);
    } catch (err) {
        console.error('pasteFrameData', err);
        updateLocalStorage(error, err.message);
    }
}
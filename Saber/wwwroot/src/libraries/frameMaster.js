import { updateUserAvatarsTextures } from './babylonMaster';


let requestFrameId = null;
export const width = 320;
export const height = 320;
const circleX = width / 2;
const circleY = height / 2;

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

export const sendFrameData = (websocket, video) => {
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.height = height + 200;
    tmpCanvas.width = width;

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

    registerFrameCallback(video, () => sendFrameData(websocket, video));
}

export const pasteFrameData = (buffer) => {
    try {
        const arr = new Uint8ClampedArray(buffer);
        updateUserAvatarsTextures(arr); 
    } catch (e) {
        console.error("pasteFrameData: ", e);
    }
}
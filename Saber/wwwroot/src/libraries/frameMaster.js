import { updateLocalStorage, LSEnum, getLocalStorageData } from './localStorageMaster';
import { updateUserTextures } from './babylonMaster';
import { compressData } from './videoCompressionMaster';
import { isWebsocketReady } from './socketMaster';

let requestFrameId = null;
let tmpCanvas = document.createElement('canvas');
let isVideoFrame = false;

export const initFrameMaster = () => {
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        isVideoFrame = true;
    };
}

export const registerFrameCallback = (video, callbackMethod) => {
    let { requestFrameId } = getLocalStorageData();
    requestFrameId = isVideoFrame ? video.requestVideoFrameCallback(callbackMethod) : requestAnimationFrame(callbackMethod);
    updateLocalStorage(LSEnum.rfid, requestFrameId)
}

export const deregisterFrameCallback = (video) =>
    isVideoFrame ? video.cancelVideoFrameCallback(requestFrameId) : cancelAnimationFrame(requestFrameId);

const updateFrameTimes = (type, currentTime) => {
    const compressionData = getLocalStorageData(LSEnum.compress);
    let typeName = `${type}FrameTimes`
    let frameTimes = compressionData[typeName];

    let _frameTimes = frameTimes.filter((e) => e > currentTime - 1000);
    _frameTimes.push(currentTime);

    compressData[typeName] = _frameTimes;

    updateLocalStorage(LSEnum.compress, compressionData);
}

const isUnderFrameRateLimit = (time) => {
    const { options: { sendFrameRateLimit }, sendFrameTimes } = getLocalStorageData(LSEnum.compress);

    let numSendFrameTimes = sendFrameTimes.length
    let lastSendTime = numSendFrameTimes > 0 ? sendFrameTimes[numSendFrameTimes - 1] : 0;
    let isUnderFrameRateLimit = !lastSendTime || (time - lastSendTime) > 1000 / sendFrameRateLimit;

    return isUnderFrameRateLimit;
}

export const onCameraFrameCallback = (websocket, video, metadata) => {
    const time = Date.now();
    const {
        width,
        height,
        circleX,
        circleY,
        startX,
        startY,
        radius,
        startAngle,
        endAngle,
        context
    } = getLocalStorageData(LSEnum.canvas);

    updateFrameTimes('source', time);

    if (isUnderFrameRateLimit(time)) {
        updateFrameTimes('send', time);

        tmpCanvas.height = height + 200;
        tmpCanvas.width = width + 200;

        const tmpCtx = tmpCanvas.getContext(context);

        tmpCtx.beginPath();
        tmpCtx.arc(circleX, circleY, radius, startAngle, endAngle);
        tmpCtx.closePath();
        tmpCtx.clip();

        tmpCtx.drawImage(video, startX, startY, width, height);

        const image = tmpCtx.getImageData(startX, startY, width, height);

        if (isWebsocketReady(websocket)) {
            sendFrame(websocket, image.data.buffer);
        }

        registerFrameCallback(video, (_now, metadata) => onCameraFrameCallback(websocket, video, metadata));

        updateOriginalVideoData(image, video, metadata)

    } else {
        console.log(`Skipped frame at ${time}`);
    }
}

const updateOriginalVideoData = (image, video, metadata) => {
    const originVideoData = getLocalStorageData(LSEnum.origVid);
    const videoQuality = video.getVideoPlaybackQuality();
    /*    console.log(123, metadata);*/
    if (image) {
        originVideoData.imageHeight = image.height;
        originVideoData.imageWidth = image.width;
        originVideoData.totalBytes = image.data.byteLength;
    }

    if (metadata) {
        originVideoData.captureTime = metadata.captureTime;
        originVideoData.expectedDisplayTime = metadata.expectedDisplayTime;
        originVideoData.presentationTime = metadata.presentationTime;
        originVideoData.presentedFrames = metadata.presentedFrames;
    }

    if (videoQuality) {
        originVideoData.totalFrames = videoQuality.totalFrames;
        originVideoData.droppedFrames = videoQuality.droppedFrames;
        originVideoData.corruptedFrames = videoQuality.corruptedFrames;
    }

    updateLocalStorage(LSEnum.origVid, originVideoData);
}

const updateServerVideoData = (arr) => {
    const serverVideoData = getLocalStorageData(LSEnum.serverVid);
    serverVideoData.totalBytes = arr.byteLength;

    updateLocalStorage(LSEnum.serverVid, serverVideoData)
}

const sendFrame = async (socket, buffer) => {
    let shrunk = await compressData(buffer);
    if (socket.readyState == socket.OPEN) {
        socket.send(shrunk);
    }
}

export const pasteFrameData = (buffer) => {
    try {
        const arr = new Uint8ClampedArray(buffer);
        updateUserTextures(arr);
        updateServerVideoData(arr);
    } catch (err) {
        console.error('pasteFrameData', err);
        updateLocalStorage(LSEnum.error, err.message);
    }
}
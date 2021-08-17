import { pasteFrameData, deregisterFrameCallback, serverVideoData } from './frameMaster.js';
import { updateLocalStorage, localStorageEnum } from '../site.js';

const { socket, serverVid, wsUrl } = localStorageEnum;
let websocket;

export const connectToServer = (endpoint, video) => {
    const currentPort = location.port;
    return new Promise((resolve, reject) => {
        if (websocket && websocket.OPEN && websocket.port === currentPort) {
            const error = new Error(`Websocket already running at: ${websocket.URL}`);
            reject(error);
        }

        const url = `wss://localhost:${location.port}/ws/video/${endpoint}`;
        websocket = new WebSocket(url);
        websocket.binaryType = "arraybuffer";

        websocket.onopen = () => {
            updateLocalStorage(socket, 'Open');
            updateLocalStorage(wsUrl, url)
            resolve(websocket);
        }

        websocket.onclose = () => {
            updateLocalStorage(socket, 'Closed');
            deregisterFrameCallback(video);
        }

        websocket.onerror = err => {
            updateLocalStorage(socket, 'Error');
            deregisterFrameCallback(video);
            reject(err);
        }

        websocket.onmessage = (e) => onDataReceived(e);
    });
};

const onDataReceived = (e) => {
    pasteFrameData(e.data);
    updateLocalStorage(serverVid, serverVideoData)
}
import { pasteFrameData, deregisterFrameCallback } from './frameMaster';
import { LSEnum, updateLocalStorage } from './localStorageMaster';
import { decompressData } from './videoCompressionMaster';

let currentPort;
const socketBinaryType = "arraybuffer";
let baseUrl;

export const socketStates = {
    open: "Open",
    closed: "Closed",
    error: "Error"
}

let websocket;

export const isWebsocketReady = (socket) => Boolean(socket && socket.readyState === socket.OPEN)

export const initSocketMaster = () => {
    currentPort = location.port;
    baseUrl = `wss://localhost:${currentPort}/ws/`;
}

export const connectToServer = (endpoint, video) => {
    return new Promise((resolve, reject) => {
        if (isWebsocketReady(websocket) && websocket.port === currentPort) {
            const error = new Error(`Websocket already running at: ${websocket.URL}`);
            reject(error);
        }

        const fullUrl = baseUrl + endpoint;
        websocket = new WebSocket(fullUrl);
        websocket.binaryType = socketBinaryType;

        websocket.onopen = () => {
            updateLocalStorage(LSEnum.socket, socketStates.open);
            updateLocalStorage(LSEnum.wsUrl, fullUrl)
            resolve(websocket);
        }

        websocket.onclose = () => {
            updateLocalStorage(LSEnum.socket, socketStates.closed);
            deregisterFrameCallback(video);
        }

        websocket.onerror = err => {
            updateLocalStorage(LSEnum.socket, socketStates.error);
            deregisterFrameCallback(video);
            reject(err);
        }

        websocket.onmessage = (e) => onDataReceived(e);
    });
};

const onDataReceived = (e) => {
    const compressedBuffer = e.data;
    const decompressedBuffer = decompressData(compressedBuffer);
    pasteFrameData(decompressedBuffer);
}
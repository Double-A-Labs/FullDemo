import { pasteFrameData, deregisterFrameCallback } from './frameMaster.js';
import { socketLabel } from '../site.js';

let websocket;

const socketStatus = {
    closed: 'Closed',
    open: 'Open',
    connecting: 'Connecting',
    error: 'Error'
};

export const connectToServer = (endpoint, video) => {
    const currentPort = location.port;
    return new Promise((resolve, reject) => {
        if (websocket && websocket.OPEN && websocket.port === currentPort) {
            const error = new Error(`Websocket already running at: ${websocket.URL}`);
            updateSocketStatusMsg(error);
            reject(error);
        }

        updateSocketStatusMsg('connecting');
        websocket = new WebSocket(`wss://localhost:${location.port}/ws/video/${endpoint}`);
        websocket.binaryType = "arraybuffer";

        websocket.onopen = () => {
            updateSocketStatusMsg('open');
            resolve(websocket)
        }

        websocket.onclose = () => {
            updateSocketStatusMsg('closed');
            deregisterFrameCallback(video);
        }

        websocket.onerror = err => {
            updateSocketStatusMsg('error');
            reject(err);
            deregisterFrameCallback(video);
        }

        websocket.onmessage = (e) => onDataReceived(e);
    });
};

const onDataReceived = (e) => {
    pasteFrameData(e.data);
}

const updateSocketStatusMsg = (status) => {
    socketLabel.innerHTML = `Current WebSocket Status: ${socketStatus[status]}`;
}
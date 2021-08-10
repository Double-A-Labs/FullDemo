import { errorMsgElement, annoucementElement, socketLabel } from '../site.js';

const ErrorMsgElementAdmin = document.getElementById('errorMsgAdmin');
const annoucementElementAdmin = document.getElementById('annoucementAdmin');
const socketLabelAdmin = document.getElementById("socketLabelAdmin");

const init = () => {
    ErrorMsgElementAdmin.innerHTML = errorMsgElement ? errorMsgElement.innerHTML : '';
    annoucementElementAdmin.innerHTML = annoucementElement ? annoucementElement.innerHTML : 'Waiting to access User Webcam';
    socketLabelAdmin.innerHTML = socketLabel ? socketLabel.innerHTML : 'Waiting for websocket connection';
}


window.onload = init;
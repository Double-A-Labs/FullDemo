import { annoucementElement } from '../site.js';

export const requestWebcamAccess = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        annoucementElement.innerHTML = "You're webcam feed is on."
        return stream;
    }
    catch (error) {
        return error;
    }
}
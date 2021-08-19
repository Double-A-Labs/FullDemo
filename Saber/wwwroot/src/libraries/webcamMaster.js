const annoucementElement = document.getElementById("annoucement");

export const requestWebcamAccess = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { width: 1080, height: 1080 },
         });
        annoucementElement.innerHTML = "You're webcam feed is on."
        return stream;
    }
    catch (error) {
        return error;
    }
}
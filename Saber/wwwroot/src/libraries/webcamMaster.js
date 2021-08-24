export const requestWebcamAccess = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { width: 1080, height: 1080 },
         });
        return stream;
    }
    catch (error) {
        return error;
    }
}
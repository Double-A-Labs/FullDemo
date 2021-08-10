export const errorMsgElement = document.getElementById("errorMsg");
export const annoucementElement = document.getElementById("annoucement");
export const socketLabel = document.getElementById("socketLabel");


export const handleErrors = (location, error) => {
    let message = `${location} error: ${error.toString()}`;
    console.error(message);
    errorMsgElement.innerHTML = message;
}

export const getBackgroundPosition = (scene, backgroundPlane) => {

    let pickinfo = scene.pick(scene.pointerX, scene.pointerY,
        (mesh) => mesh == backgroundPlane);

    if (pickinfo.hit) {
        return pickinfo.pickedPoint;
    }

    return null;
}
import { currentUserMeshes } from './babylonMaster';

const keyMap = { 68: false, 65: false, 87: false, 83: false };
const increment = 0.25;

const onKeyDown = (e, scene) => {
    // Shift+Ctrl+Alt+I
    if (e.shiftKey && e.ctrlKey && e.altKey && e.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        } else {
            scene.debugLayer.show();
        }
    }

    if (e.keyCode in keyMap) {
        keyMap[e.keyCode] = true;

        if (keyMap[87] && keyMap[68]) {
            currentUserMeshes[0].position.y = currentUserMeshes[0].position.y + increment;
            currentUserMeshes[0].position.x = currentUserMeshes[0].position.x - increment;
        }

        if (keyMap[87] && keyMap[65]) {
            currentUserMeshes[0].position.y = currentUserMeshes[0].position.y + increment;
            currentUserMeshes[0].position.x = currentUserMeshes[0].position.x + increment;
        }

        if (keyMap[83] && keyMap[68]) {
            currentUserMeshes[0].position.y = currentUserMeshes[0].position.y - increment;
            currentUserMeshes[0].position.x = currentUserMeshes[0].position.x - increment;
        }

        if (keyMap[83] && keyMap[65]) {
            currentUserMeshes[0].position.y = currentUserMeshes[0].position.y - increment;
            currentUserMeshes[0].position.x = currentUserMeshes[0].position.x + increment;
        }

        if (keyMap[87]) {
            currentUserMeshes[0].position.y = currentUserMeshes[0].position.y + increment;
        }

        if (keyMap[83]) {
            currentUserMeshes[0].position.y = currentUserMeshes[0].position.y - increment;
        }

        if (keyMap[68]) {
            currentUserMeshes[0].position.x = currentUserMeshes[0].position.x - increment;
        }

        if (keyMap[65]) {
            currentUserMeshes[0].position.x = currentUserMeshes[0].position.x + increment;
        }

    }
};

const onKeyUp = (e) => {
    if (e.keyCode in keyMap) {
        keyMap[e.keyCode] = false;
    }
}

export const setupKeys = (scene) => {
    window.onkeydown = (e) => onKeyDown(e, scene);
    window.onkeyup = onKeyUp;
};

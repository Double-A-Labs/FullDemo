import { currentUsers } from './babylonMaster.js';

const keyMap = { 68: false, 65: false, 87: false, 83: false };
const increment = 0.25;

const onKeyDown = (e, scene) => {
    // Shift+Ctrl+Alt+I
    if (e.shiftKey && e.ctrlKey && e.altKey && e.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
            scene.scene.debugLayer.hide();
        } else {
            scene.debugLayer.show();
        }
    }

    if (e.keyCode in keyMap) {
        keyMap[e.keyCode] = true;

        if (keyMap[87] && keyMap[68]) {
            console.log('Up and Right')
            currentUsers[0].position.y = currentUsers[0].position.y + increment;
            currentUsers[0].position.x = currentUsers[0].position.x - increment;
        }

        if (keyMap[87] && keyMap[65]) {
            console.log('Up and Left')
            currentUsers[0].position.y = currentUsers[0].position.y + increment;
            currentUsers[0].position.x = currentUsers[0].position.x + increment;
        }

        if (keyMap[83] && keyMap[68]) {
            console.log('Down and Right')
            currentUsers[0].position.y = currentUsers[0].position.y - increment;
            currentUsers[0].position.x = currentUsers[0].position.x - increment;
        }

        if (keyMap[83] && keyMap[65]) {
            console.log('Down and Left')
            currentUsers[0].position.y = currentUsers[0].position.y - increment;
            currentUsers[0].position.x = currentUsers[0].position.x + increment;
        }

        if (keyMap[87]) {
            console.log('Up')
            currentUsers[0].position.y = currentUsers[0].position.y + increment;
        }

        if (keyMap[83]) {
            console.log('Down')
            currentUsers[0].position.y = currentUsers[0].position.y - increment;
        }

        if (keyMap[68]) {
            console.log('Right')
            currentUsers[0].position.x = currentUsers[0].position.x - increment;
        }

        if (keyMap[65]) {
            console.log('Left')
            currentUsers[0].position.x = currentUsers[0].position.x + increment;
        }

    }
};

const onKeyUp = (e) => {
    if (e.keyCode in keyMap) {
        keyMap[e.keyCode] = false;
    }
}

export const setupKeys = (currentUsers, scene) => {
    window.onkeydown = (e) => onKeyDown(e, currentUsers, scene);
    window.onkeyup = onKeyUp;
};

import { Vector3 } from "@babylonjs/core";
import { currentUserMeshes, getBackgroundPosition } from './babylonMaster';

let currentMesh;
let interfaceIntent;
let startingPoint = new Vector3(0, 0, 0);
let cameraTarget;

const pointerDown = (mesh, camera, backgroundPlane, scene) => {
    currentMesh = mesh;
    startingPoint = getBackgroundPosition(scene, backgroundPlane);

    if (startingPoint) { // we need to disconnect camera from canvas
        setTimeout(function () {
            camera.detachControl(canvas);
        }, 0);
    }
}

const pointerUp = (camera) => {
    if (startingPoint) {
        camera.attachControl(canvas, true);
        startingPoint = null;
        return;
    }
};

const pointerMove = (scene, backgroundPlane) => {
    if (!startingPoint) {
        return;
    }

    let current = getBackgroundPosition(scene, backgroundPlane);
    if (!current) {
        return;
    }

    camera.lockedTarget = currentUserMeshes[0];

    let diff = current.subtract(startingPoint);
    let adjustedDiff = new Vector3(diff._x * 0.5, diff._y * 0.5, diff._z)
    currentMesh.position.addInPlace(adjustedDiff);

    startingPoint = current;
};

const onPointerObservable = (pointerInfo, camera, backgroundPlane, scene) => {
    switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
            pointerDown(pointerInfo.pickInfo.pickedMesh, camera, backgroundPlane, scene)
            if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh !== backgroundPlane) {
                console.log('Clicked Avatar')
                interfaceIntent = 'moveAvatar';
            }

            if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh === backgroundPlane) {
                console.log('Clicked Background')
                interfaceIntent = 'pan';
            }
            break;
        case PointerEventTypes.POINTERUP:
            pointerUp(camera, backgroundPlane);
            break;
        case PointerEventTypes.POINTERMOVE:
            console.log(`InterfaceIntent: ${interfaceIntent}`);
            if (interfaceIntent == 'moveAvatar') {
                pointerMove(scene, backgroundPlane);
            }
            else if (interfaceIntent == 'pan') {
                panMove(scene, backgroundPlane);
            }
            break;
        case PointerEventTypes.POINTERPICK:
            break;
    }
};

export const setUpPointers = (scene, camera, backgroundPlane) => {
    cameraTarget = MeshBuilder.CreateDisc("camTarget", { radius: 1 }, scene);
    cameraTarget.position = new Vector3(2, 2, -0.5);
    camera.lockedTarget = cameraTarget;

   scene.onPointerObservable.add((pointerInfo) => onPointerObservable(pointerInfo, camera, backgroundPlane, scene));
}
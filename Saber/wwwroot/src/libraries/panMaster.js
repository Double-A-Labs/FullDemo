let isPanning = false;
let pickOrigin;

export const panMove = (scene, backgroundPlane) => {
    if (!startingPoint) {
        return;
    }

    let current = getBackgroundPosition(scene, backgroundPlane);
    if (!current) {
        return;
    }

    camera.lockedTarget = cameraTarget;

    let diff = current.subtract(startingPoint);
    let adjustedDiff = new Vector3(diff._x * 0.5, diff._y * 0.5, diff._z)
    cameraTarget.position.subtractInPlace(adjustedDiff);

    startingPoint = current;
};

const beginPanning = (event, camera, scene, canvas) => {
    if (event.ctrlKey) {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY, (m) => m.name === 'background');
        if (pickResult.pickedPoint) {
            camera.detachControl(canvas);
            pickOrigin = pickResult.pickedPoint;
            isPanning = true;
        }
    }
}

const endPanning = (camera, canvas) => {
    isPanning = false;
    camera.attachControl(canvas, true, true);
};

const panCamera = (camera, scene) => {
    if (isPanning) {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY, (m) => m.name === 'background');
        if (pickResult.pickedPoint) {
            let diff = pickResult.pickedPoint.subtract(pickOrigin);

            camera.target.subtractInPlace(diff);
        }
    }
};

export const setupPanning = (scene, camera, canvas) => {
    scene.onPointerDown = (e) => beginPanning(e, camera, scene, canvas)

    scene.onPointerUp = () => endPanning(camera, canvas);

    scene.onPointerMove = () => panCamera(camera, scene);
}
﻿import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Materials/standardMaterial";

import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    Mesh,
    MeshBuilder,
    RawTexture,
    Texture,
    DirectionalLight,
    PointerDragBehavior,
    Color4
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials/grid";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { setupPanning } from './panMaster.js';
import { setupPointers } from './pointerMaster.js';
import { setupKeys } from './keyMaster.js';

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas);
let scene = new Scene(engine);
let grid = new GridMaterial("grid", scene);

let camera;
export let currentUsers = [];

const setupBackgroundPlane = () => {
    let background_plane = MeshBuilder.CreatePlane("background", { height: 36, width: 64, sideOrientation: Mesh.BACKSIDE }, scene);

    background_plane.material = grid;
    background_plane.checkCollisions = true;
    background_plane.position = new Vector3(0, 0, -2);

    return background_plane;
};

export const createNewUser = () => {
    let userNumber = currentUsers.length + 1;
    let userName = `avatar#${userNumber}`;

    let avatar_material = new StandardMaterial(`${userName}_mat`, scene);
    avatar_material.diffuseTexture = new Texture("/video/placeholder_video.jpg", scene);

    let avatar_mesh = MeshBuilder.CreateDisc(`${userName}_disc`, { radius: 1, sideOrientation: Mesh.DOUBLESIDE }, scene);
    avatar_mesh.enableEdgesRendering();
    avatar_mesh.edgesWidth = 4.0;
    avatar_mesh.edgesColor = new Color4(0, 0, userNumber, 1);
    avatar_mesh.checkCollisions = true;

    avatar_mesh.material = avatar_material;

    if (userNumber > 1) {
        let prevUserPos = currentUsers[currentUsers.length -1].position
        avatar_mesh.position = new Vector3(prevUserPos._x + 2.5, prevUserPos._y, prevUserPos._z)
    }

    let avatarDrag = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 0, 1) });
    avatarDrag.onDragStartObservable.add(() => {
        console.log(`User ${userName} Drag Start`);
    });
    avatarDrag.onDragObservable.add(() => {
        console.log(`User ${userName} Dragging`);
    });
    avatarDrag.onDragEndObservable.add(() => {
        console.log(`User ${userName} Drag End`);
    });

    avatar_mesh.addBehavior(avatarDrag);

    console.log(`${userName} created`);

    currentUsers.push(avatar_mesh);
}

export const updateUserAvatarsTextures = (data) => currentUsers.map(userAvatar =>
    userAvatar.material.diffuseTexture = new RawTexture.CreateRGBATexture(data, 320, 320, scene));

const setUpCamera = () => {
    camera = new ArcRotateCamera("Camera", 1.6, 1.6, 10, new Vector3(0, 0, 10), scene);
    camera.inputs.removeByType("mouse")

    camera.inputs.clear()
    camera.inputs.addMouseWheel();

    camera.attachControl(canvas, true, true);
    camera.lowerRadiusLimit = 3; // min zoom possible
    camera.upperRadiusLimit = 15; // max zoom possible
    camera.wheelPrecision = 0.02; // zoom speed
    /* camera.wheelDeltaPercentage = 5;*/

    camera.panningSensibility = 200; // panning speed
    camera.panningAxis.copyFromFloats(0, 0, 0); //None

    return camera;
}

const setUpLights = () => {
    let light = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, -1), scene);
    light.position = new Vector3(0, 1, 15);

    return light;
}

export const clearUserAvatars = () => {
    currentUsers.map(userAvatar => {
        console.log(`${userAvatar.name} deleted`);
        userAvatar.dispose()
    });
    currentUsers = [];
}

const startBabylon = () => {
    setupBackgroundPlane();
/*    createNewUser();*/
    setUpLights();
    let camera = setUpCamera();

    setupPanning(scene, camera, canvas)
    setupKeys(scene);
/*    setupPointers(mesh, camera, backgroundPlane, scene); */

    engine.runRenderLoop(() => {
        scene.render();
    });
};

export default startBabylon;
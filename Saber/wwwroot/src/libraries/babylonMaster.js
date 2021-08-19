import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Materials/standardMaterial";

import {
    ArcRotateCamera,
    BackgroundMaterial,
    Color4,
    DirectionalLight,
    Engine,
    Layer,
    Mesh,
    MeshBuilder,
    PointerDragBehavior,
    RawTexture,
    Scene,
    StandardMaterial,
    Texture,
    Vector3
} from "@babylonjs/core";
import { setupPanning } from './panMaster';
import { setupPointers } from './pointerMaster';
import { setupKeys } from './keyMaster';
import { LSEnum, updateLocalStorage } from './localStorageMaster';
import { setupChangeBgButton } from "./buttonMaster";

const backgrounds = ['collab_room', 'dbla_lobby', 'dtt_ds_bg', 'neon_cafe', 'ytgaming_bg'];
const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas);
const scene = new Scene(engine);
let background; 
let camera;
export let currentUsers = {};
export let currentUserMeshes = [];

const setupBackgroundPlane = () => {
    const randomBgImage = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    updateLocalStorage(LSEnum.currentBg, backgrounds.indexOf(randomBgImage));

    background = MeshBuilder.CreatePlane("background", { height: 36, width: 64, sideOrientation: Mesh.DOUBLESIDE }, scene);
    let bg_material = new BackgroundMaterial("bg_mat", scene);
    bg_material.diffuseTexture = new Texture(`/content/${randomBgImage}.png`, scene);

    background.material = bg_material;
    background.checkCollisions = true;
    background.position = new Vector3(0, 0, -2);
};

export const updateBackgroundImage = () => {
    const currentBackgroundIndex = JSON.parse(window.localStorage.getItem(currentBg));
    let nextBgIndex = currentBackgroundIndex + 1;

    if (nextBgIndex === backgrounds.length) {
        nextBgIndex = 0;
    }

    background.material.diffuseTexture = new Texture(`/content/${backgrounds[nextBgIndex]}.png`, scene); ;
    updateLocalStorage(LSEnum.currentBg, nextBgIndex);
}

export const getBackgroundPosition = (scene, backgroundPlane) => {

    let pickinfo = scene.pick(scene.pointerX, scene.pointerY,
        (mesh) => mesh == backgroundPlane);

    if (pickinfo.hit) {
        return pickinfo.pickedPoint;
    }

    return null;
}

export const createNewUser = () => {
    let userNumber = currentUserMeshes.length + 1;
    let userName = `avatar#${userNumber}`;

    let avatar_material = new StandardMaterial(`${userName}_mat`, scene);
    avatar_material.diffuseTexture = new Texture("/content/placeholder_video.jpg", scene);

    let avatar_mesh = MeshBuilder.CreateDisc(`${userName}_disc`, { radius: 1, sideOrientation: Mesh.DOUBLESIDE }, scene);
    avatar_mesh.enableEdgesRendering();
    avatar_mesh.edgesWidth = 4.0;
    avatar_mesh.edgesColor = new Color4(0, 0, userNumber, 1);
    avatar_mesh.checkCollisions = true;

    avatar_mesh.material = avatar_material;

    if (userNumber > 1) {
        let prevUserPos = currentUserMeshes[currentUserMeshes.length - 1].position
        avatar_mesh.position = new Vector3(prevUserPos._x + 2.5, prevUserPos._y, prevUserPos._z)
    }

    let avatarDrag = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 0, 1) });
    avatarDrag.onDragStartObservable.add((eventData) => {
        console.info(`User ${userName} Drag Start`);
    });

    avatarDrag.onDragObservable.add((eventData) => {
        console.info(`User ${userName} Dragging`);
    });
    avatarDrag.onDragEndObservable.add((eventData) => {
        console.info(`User ${userName} Drag End`);
        let endingPosition = currentUserMeshes[userNumber - 1].position

        currentUsers[userName].currentPosition = endingPosition.toString();
        updateLocalStorage(LSEnum.users, currentUsers);
    });

    avatar_mesh.addBehavior(avatarDrag);

    console.info(`${userName} created`);
    currentUsers[userName] = {
        userName,
        userNumber,
        startingPosition: avatar_mesh.position.toString(),
        currentPosition: avatar_mesh.position.toString()
    };

    currentUserMeshes.push(avatar_mesh);
    updateLocalStorage(LSEnum.users, currentUsers);

    return avatar_mesh;
}

export const updateUserTextures = (data) => currentUserMeshes.map(mesh => {
    mesh.material.diffuseTexture = new RawTexture.CreateRGBATexture(data, 320, 320, scene);
});

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
    currentUserMeshes.map(mesh => mesh.dispose());
    currentUserMeshes = [];
}

const startBabylon = () => {
    setupBackgroundPlane();
  /*  createNewUser();*/
    setUpLights();
    let camera = setUpCamera();

    setupPanning(scene, camera, canvas)
    setupKeys(scene);
    /*    setupPointers(mesh, camera, backgroundPlane, scene); */

    engine.runRenderLoop(() => {
        scene.render();
    });

    setupChangeBgButton();
};

export default startBabylon;
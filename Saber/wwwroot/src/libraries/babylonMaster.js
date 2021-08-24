import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Materials/standardMaterial";

import {
    ArcRotateCamera,
    BackgroundMaterial,
    Color3,
    Color4,
    Engine,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PointerDragBehavior,
    RawTexture,
    Scene,
    StandardMaterial,
    Texture,
    Tools,
    Vector3,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

import { setupPanning } from './panMaster';
import { setupKeys } from './keyMaster';
import { LSEnum, updateLocalStorage } from './localStorageMaster';
import { OnStopClick } from "./buttonMaster";

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
    const planeHeight = 36;
    const planeWidth = 64;

    background = MeshBuilder.CreatePlane("background", { height: planeHeight, width: planeWidth, sideOrientation: Mesh.DOUBLESIDE }, scene);
    let bgMat = new BackgroundMaterial("bg_mat", scene);
    bgMat.diffuseTexture = new Texture(`/content/${randomBgImage}.png`, scene);

    background.rotation.y = Tools.ToRadians(-180);

    background.material = bgMat;

    background.checkCollisions = true;
    background.position = new Vector3(0, 0, -2);
};

export const updateBackgroundImage = () => {
    const currentBackgroundIndex = JSON.parse(window.localStorage.getItem(LSEnum.currentBg));

    let nextBgIndex = currentBackgroundIndex + 1;

    if (nextBgIndex === backgrounds.length) {
        nextBgIndex = 0;
    }

    background.material.diffuseTexture = new Texture(`/content/${backgrounds[nextBgIndex]}.png`, scene);;
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
    let radius = 1.5;

    let avatar_material = new StandardMaterial(`${userName}_mat`, scene);
    avatar_material.diffuseTexture = new Texture("/content/placeholder_video.jpg", scene);

    let avatar_mesh = MeshBuilder.CreateDisc(`${userName}_disc`, { radius: radius, sideOrientation: Mesh.DOUBLESIDE }, scene);
    avatar_mesh.enableEdgesRendering();
    avatar_mesh.edgesWidth = 4.0;
    avatar_mesh.edgesColor = new Color4(0, 0, userNumber, 1);
    avatar_mesh.checkCollisions = true;

    avatar_mesh.material = avatar_material;

    if (userNumber > 1) {
        let lastNewUser = currentUserMeshes[currentUserMeshes.length - 1]
        let new_x = lastNewUser.position._x + (radius + 2.5);
        avatar_mesh.position = new Vector3(new_x, lastNewUser.position._y, lastNewUser.position._z)
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
    camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 5, new Vector3(0, 0, 25), scene);
    camera.inputs.removeByType("mouse");

    camera.inputs.clear()
    camera.inputs.addMouseWheel();

    camera.attachControl(canvas, true, true);
    camera.lowerRadiusLimit = 3; // min zoom possible
    camera.upperRadiusLimit = 15; // max zoom possible
    camera.wheelPrecision = 0.02; // zoom speed
    camera.wheelDeltaPercentage = 5;

    camera.panningSensibility = 200; // panning speed
    camera.panningAxis.copyFromFloats(0, 0, 0); //None

    return camera;
}

const setUpLights = () => {
    let light = new HemisphericLight("light2", new Vector3(0, 1, 1), scene);
    light.diffuse = new Color3(1, 1, 1);
    light.specular = new Color3(1, 1, 0);

    return light;
}

export const clearUserAvatars = () => {
    currentUserMeshes.map(mesh => mesh.dispose());
    currentUserMeshes = [];
}

const createGui = () => {
    const adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI("saberUI");
    const panel = new GUI.StackPanel();

    panel.width = "220px";
    panel.top = "-50px";
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    adt.addControl(panel);

    addNewGuiButton("End Meeting", OnStopClick, panel);
    addNewGuiButton("Add New User", createNewUser, panel);
    addNewGuiButton("Change Background", updateBackgroundImage, panel);
}

const addNewGuiButton = (name, onClickFunc, panel) => {
    let btn = GUI.Button.CreateSimpleButton(`${name}`, `${name}`);
    btn.widthInPixels = 150;
    btn.paddingBottomInPixels = 5;
    btn.heightInPixels = 50;
    btn.color = "white";
    btn.cornerRadius = 20;
    btn.background = "black";
    btn.onPointerClickObservable.add(onClickFunc);

    panel.addControl(btn);
}

const startBabylon = () => {
    setupBackgroundPlane();
    setUpLights();
    let camera = setUpCamera();

    setupPanning(scene, camera, canvas)
    setupKeys(scene);

    createGui();

    engine.runRenderLoop(() => {
        scene.render();
    });

    scene.debugLayer.show();
};

export default startBabylon;
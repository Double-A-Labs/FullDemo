export const errorMsgElement = document.getElementById("errorMsg");
export const annoucementElement = document.getElementById("annoucement");
export const newUserBtn = document.getElementById('newUser');
export const changeBgBtn = document.getElementById("changeBg");

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

export const localStorageEnum = {
    users: 'currentUsers',
    meeting: 'meetingStatus',
    socket: 'websocketStatus',
    wsUrl: 'websocketUrl',
    origVid: 'originVideoData',
    serverVid: 'serverVideoData',
    currentBg: 'currentBackground',
    error: 'errorMessage'
};

const intialLocalStorage = {
    'currentUsers': {},
    'meetingStatus': '',
    'websocketStatus': '',
    'websocketUrl': '',
    'originVideoData': {},
    'serverVideoData': {},
    'currentBackground': 0,
    'errorMessage': ''
}

export const initializeLocalStorage = () => {
    for (let prop in intialLocalStorage) {
        switch (typeof intialLocalStorage[prop]) {
            case 'object':
                window.localStorage.setItem(prop, JSON.stringify(intialLocalStorage[prop]));
                break;
            default:
                window.localStorage.setItem(prop, intialLocalStorage[prop]);
        }
    }
};

export const updateLocalStorage = (name, data) => {
    switch (typeof data) {
        case 'object':
            let currentData = JSON.parse(window.localStorage.getItem(name));
            let newUsers = JSON.stringify(Object.assign({}, currentData, data))
            window.localStorage.setItem(name, newUsers);
            break;
        default:
            window.localStorage.setItem(name, data);
    }
};
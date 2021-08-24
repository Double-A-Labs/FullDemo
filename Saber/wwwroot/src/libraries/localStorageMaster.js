export const LSEnum = {
    users: 'currentUsers',
    meeting: 'meetingStatus',
    socket: 'websocketStatus',
    wsUrl: 'websocketUrl',
    origVid: 'originVideoData',
    serverVid: 'serverVideoData',
    currentBg: 'currentBackground',
    error: 'errorMessage',
    endian: 'isLittleEndian',
    compress: 'compressionData',
    canvas: 'canvasDefaults',
    rfid: 'requestFrameId',
    isVideo: 'isVideoFrame'
};

const initialLocalStorage = {
    'currentUsers': {},
    'meetingStatus': '',
    'websocketStatus': '',
    'websocketUrl': '',
    'requestFrameId': '',
    'canvasDefaults': {
        'width': 320,
        'height': 320,
        'circleX': 160,
        'circleY': 160,
        'startX': 80,
        'startY': 80,
        'radius': 500,
        'startAngle': 0,
        'endAngle': Math.PI * 2,
        'context': '2d'
    },
    'originVideoData': {
        'captureTime': 0,
        'expectedDisplayTime': 0,
        'presentationTime': 0,
        'presentedFrames': 0,
        'imageHeight': 0,
        'imageWidth': 0,
        'totalBytes': 0,
        'totalFrames': 0,
        'droppedFrames': 0,
        'corruptedFrames': 0
    },
    'serverVideoData': {
        'totalBytes': 0
    },
    'currentBackground': 0,
    'errorMessage': '',
    'compressionData': {
        'options': {
            'sendFrameRateLimit': 30,
            'sendKeyframeInterval': 2000,
            'algorithm': 'LZ4'
        },
        'isLittleEndian': null,
        'sourceFrameTimes': [],
        'sendFrameTimes': [],
        'lastSendQuantized': [],
        'lastReceiveQuantized': [],
        'lastSendKeyframeTime': 0,
        'lastReceiveKeyframeTime': 0,
        'sendLastUncompressedSize': 0,
        'sendLastCompressedSize': 0,
        'compressionRate': 0,
        'sendLastCompressionTime': 0
    }
}

export const initializeLocalStorage = () => {
    window.localStorage.clear();
    for (let prop in initialLocalStorage) {
        switch (typeof initialLocalStorage[prop]) {
            case 'object':
                window.localStorage.setItem(prop, JSON.stringify(initialLocalStorage[prop]));
                break;
            default:
                window.localStorage.setItem(prop, initialLocalStorage[prop]);
        }
    }
    console.log(window.localStorage)
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

export const getLocalStorageData = (specificProp) => {
    let currentData = {};
    for (let prop in initialLocalStorage) {
        switch (typeof initialLocalStorage[prop]) {
            case 'string':
                currentData[prop] = window.localStorage.getItem(prop);
                break;
            default:
                currentData[prop] = JSON.parse(window.localStorage.getItem(prop));
        }
    }

    if (specificProp) {
        return currentData[specificProp];
    }

    return currentData;
}
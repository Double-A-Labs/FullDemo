import { newUserBtn, changeBgBtn } from '../site.js';
import { updateBackgroundImage, createNewUser } from '../libraries/babylonMaster.js';

const admin = document.getElementById('admin');
const alertsRow = document.getElementById('alertsRow');
const annoucementElementAdmin = document.getElementById('annoucementAdmin');

const socketLabelAdmin = document.getElementById("socketLabelAdmin");

let userComponent;

const init = () => {
    newUserBtn.onclick = createNewUser;
    changeBgBtn.onclick = updateBackgroundImage;
    changeBgBtn.disabled = false;

    const {
        newSocketStatus,
        currentUsers,
        meetingStatus,
        originVideoData,
        serverVideoData,
        errorMessage
    } = getLocalStorageData();

    if (errorMessage) {
        createErrorAlert(errorMessage)
    }

    if (newSocketStatus) {
        updateSocketStatusMsg(newSocketStatus);
    }

    if (meetingStatus) {
        updateMeetingStatus(meetingStatus);
    } else {
        updateMeetingStatus('Waiting');
    }

    if (originVideoData && Object.keys(originVideoData).length > 0
        || serverVideoData && Object.keys(serverVideoData).length > 0) {
        const videoDataRow = document.createElement('div');
        videoDataRow.classList.add('row');

        if (originVideoData) {
            let origVid = createOrigVidComponent(originVideoData);
            videoDataRow.appendChild(origVid);
        }

        if (serverVideoData) {
            let serVid = createSerVidComponent(serverVideoData);
            videoDataRow.appendChild(serVid);
        }

        admin.appendChild(videoDataRow);
    }

    if (currentUsers && Object.keys(currentUsers).length > 0) {
        const userRow = document.createElement('div');
        userRow.classList.add('row');
        let userComponent = createUserComponent();
        let userTable = createUserTable(currentUsers);
        userComponent.appendChild(userTable);
        userRow.appendChild(userComponent);
        admin.appendChild(userRow);
    }
}

const createErrorAlert = (errMsg) => {
    const errCol = document.createElement('div');
    errCol.classList.add('col', 'text-center');
    const errAlert = document.createElement('div');
    errAlert.classList.add('alert', 'alert-danger');
    errAlert.setAttribute('role', 'alert');

    const errHeader = createHeader(errMsg);
    errHeader.classList.add('alert-heading');
    errAlert.appendChild(errHeader);
    errCol.appendChild(errAlert);
    alertsRow.appendChild(errCol);
}

const getLocalStorageData = () => {
    let newSocketStatus = window.localStorage.getItem('websocket_status');
    let currentUsers = JSON.parse(window.localStorage.getItem('current_users'));
    let meetingStatus = window.localStorage.getItem('meeting_status');
    let originVideoData = JSON.parse(window.localStorage.getItem('origin_video_data'));
    let serverVideoData = JSON.parse(window.localStorage.getItem('server_video_data'));
    let errorMessage = window.localStorage.getItem('error_message');

    return { newSocketStatus, currentUsers, meetingStatus, originVideoData, serverVideoData, errorMessage };
}

const updateSocketStatusMsg = (status) => {
    const statusHeader = document.createElement('H5');
    if (status === 'Open') {
        statusHeader.classList.add('text-success');
    }

    if (status === 'Closed') {
        statusHeader.classList.add('text-danger');
    }

    statusHeader.appendChild(document.createTextNode(status));
    socketLabelAdmin.appendChild(statusHeader);
}

const updateMeetingStatus = (status) => {
    const statusHeader = document.createElement('H5');
    if (status === 'Live') {
        statusHeader.classList.add('text-success');
    }

    if (status === 'Ended') {
        statusHeader.classList.add('text-danger');
    }
    statusHeader.appendChild(document.createTextNode(status));
    annoucementElementAdmin.appendChild(statusHeader);
}

const createHeader = (name) => {
    let header = document.createElement('H4');
    let headerText = document.createTextNode(name);
    header.appendChild(headerText);

    return header;
}

const createUserComponent = () => {
    userComponent = document.createElement('div');
    userComponent.classList.add('col', 'text-center', 'shadow', 'rounded');

    userComponent.appendChild(createHeader('Current Users'));

    return userComponent;
}

const createTableHeaders = (table, data) => {
    let thead = table.createTHead();
    let theadrow = thead.insertRow();
    theadrow.classList.add('thead-dark');

    Object.keys(data).forEach(key => {
        let th = document.createElement('th');
        let text = document.createTextNode(key);
        th.appendChild(text);
        theadrow.appendChild(th);
    });

    return thead;
}

const createOrigVidComponent = (originVideoData) => {
    let origVidComponent = document.createElement('div');
    origVidComponent.classList.add('col', 'text-center', 'shadow', 'rounded');
    origVidComponent.appendChild(createHeader('Original Video Data'));

    let table = document.createElement('table');
    table.classList.add('table', 'table-striped');

    createTableHeaders(table, originVideoData);

    let tbody = table.createTBody();
    let bRow = tbody.insertRow();
    for (let key in originVideoData) {
        let cell = bRow.insertCell();
        let text = document.createTextNode(originVideoData[key]);
        cell.appendChild(text);
    }

    origVidComponent.appendChild(table);

    return origVidComponent
};

const createSerVidComponent = (serverVideoData) => {
    let serverVidComponent = document.createElement('div');
    serverVidComponent.classList.add('col', 'text-center', 'shadow', 'rounded');
    serverVidComponent.appendChild(createHeader('Server Video Data'));

    let table = document.createElement('table');
    table.classList.add('table', 'table-striped');

    createTableHeaders(table, serverVideoData);

    let tbody = table.createTBody();
    let bRow = tbody.insertRow();
    for (let key in serverVideoData) {
        let cell = bRow.insertCell();
        let text = document.createTextNode(serverVideoData[key]);

        if (typeof serverVideoData[key] === 'object') {
           text = document.createTextNode(JSON.parse(serverVideoData[key]));
        }

        cell.appendChild(text);
    }

    serverVidComponent.appendChild(table);
    return serverVidComponent; 
}

const createUserTable = (currentUsers) => {
    let table = document.createElement('table');
    table.classList.add('table', 'table-striped');

    createTableHeaders(table, currentUsers[Object.keys(currentUsers)[0]]);

    let tbody = table.createTBody();
    for (let userName in currentUsers) {
        let user = currentUsers[userName];
        let bRow = tbody.insertRow();


        let displayName = userName.toLocaleUpperCase();
        if (user.userNumber === 1) {
            displayName = displayName + '- [Host]';
        }

        let cell = bRow.insertCell();
        let text = document.createTextNode(displayName);
        cell.appendChild(text);

        let cell1 = bRow.insertCell();
        let text1 = document.createTextNode(user.userNumber);
        cell1.appendChild(text1);

        let cell2 = bRow.insertCell();
        let text2 = document.createTextNode(user.startingPosition);
        cell2.appendChild(text2);

        let cell3 = bRow.insertCell();
        let text3 = document.createTextNode(user.currentPosition);
        cell3.appendChild(text3);
    };

    return table;
};

window.onload = init;
import { meetingStates } from '../libraries/buttonMaster';
import { socketStates } from '../libraries/socketMaster';
const dataSpace = document.getElementById('dataSpace');
const alertsRow = document.getElementById('alertsRow');
const meetingStatus = document.getElementById('meetingStatus');
const socketStatus = document.getElementById("socketStatus");

let socketUrlHeader = document.createElement('H5')

const componentTitles = {
    compress: 'Compression Data',
    orgVid: 'Original Video Data',
    serVid: 'Server Video Data',
    users: 'Current Users',
    comOps: 'Compression Settings'
};

const createHeader = (name) => {
    let header = document.createElement('H4');
    let headerText = document.createTextNode(name);
    header.appendChild(headerText);

    return header;
}

const createRow = (name) => {
    const row = document.createElement('div');
    row.id = `${name}Row`;
    row.classList.add('row');
    row.style.width = 'fit-content';

    return row;
}

const createComponent = (name) => {
    let component = document.createElement('div');
    component.id = `${name}Component`;
    component.classList.add('col', 'text-center', 'shadow', 'rounded');
    component.appendChild(createHeader(componentTitles[name]));

    return component;
}

export const updateErrorAlert = (errMsg) => {
    let id = 'errorHeader';
    let errHeader = document.getElementById(id);

    if (!errHeader) {
        return createErrorAlert(errMsg, id);
    }

    if (errHeader.childNodes.length) {
        errHeader.removeChild(errHeader.lastChild);
    }

    let newText = document.createTextNode(errMsg);
    errHeader.appendChild(newText);
}

const createErrorAlert = (errMsg, id) => {
    let errCol = document.createElement('div');
    errCol.classList.add('col', 'text-center');

    const errAlert = document.createElement('div');
    errAlert.classList.add('alert', 'alert-danger');
    errAlert.setAttribute('role', 'alert');

    const errHeader = createHeader(errMsg);
    errHeader.id = id;
    errHeader.classList.add('alert-heading');
    errAlert.appendChild(errHeader);
    errCol.appendChild(errAlert);
    alertsRow.appendChild(errCol);
}

export const addSocketUrl = (url) => {
    const textUrl = document.createTextNode(url);
    socketUrlHeader.appendChild(textUrl);
    socketStatus.appendChild(socketUrlHeader);
}

export const addRowComponent = (name, data) => {
    let row = createRow(name);
    let component = createComponent(name);
    let table = createTable(name, data)

    component.appendChild(table);
    row.appendChild(component);
    dataSpace.appendChild(row);
}

export const updateComponentData = (name, data) => {
    let component = document.getElementById(`${name}Component`);
    let table = createTable(name, data);

    if (!component || !table) {
        return addRowComponent(name, data);
    }

    if (component.childNodes.length) {
        component.removeChild(component.lastChild);
    }

    component.appendChild(table);
}

export const updateStatusMsg = (status, isMeeting = false) => {
    let id = `${isMeeting ? 'meeting' : 'socket'}StatusHeader`
    let statusHeader = document.getElementById(id);
    let parentElem = isMeeting ? meetingStatus : socketStatus;

    if (!statusHeader) {
        statusHeader = document.createElement('H5');
        statusHeader.id = id;
    }

    if (status === meetingStates.live || status === socketStates.open) {
        statusHeader.classList.add('text-success');
    }

    if (status === meetingStates.ended || status === socketStates.closed) {
        statusHeader.classList.add('text-danger');
    }

    if (statusHeader.childNodes.length) {
        statusHeader.removeChild(statusHeader.lastChild);
    }

    let statusText = document.createTextNode(status);
    statusHeader.appendChild(statusText);
    parentElem.appendChild(statusHeader)
}

const createTableHeaders = (table, data) => {
    let thead = table.createTHead();
    let theadrow = thead.insertRow();
    theadrow.classList.add('thead-dark');
    for (let key in data) {
        let th = document.createElement('th');
        let text = document.createTextNode(key);
        th.appendChild(text);
        theadrow.appendChild(th);
    };

    return thead;
}

const filterData = (data) => {
    const filteredData = {};
    for (let key in data) {
        if (data[key]) {
            if (typeof data[key] === 'object' || Array.isArray(data[key])) {
                continue;
            }
        }

        filteredData[key] = data[key];
    }

    return filteredData;
}

const createTable = (name, data) => {
    let table = document.createElement('table');
    table.id = `${name}Table`;
    table.classList.add('table', 'table-striped');

    if (name === 'users') {
        createTableHeaders(table, data[Object.keys(data)[0]]);

        let tbody = table.createTBody();
        for (let userName in data) {
            let user = data[userName];
            let bRow = tbody.insertRow();

            for (let key in user) {
                let cell = bRow.insertCell();
                let text = document.createTextNode(user[key]);

                if (key === 'username') {
                    let displayName = userName.toLocaleUpperCase();
                    if (user.userNumber === 1) {
                        displayName = displayName + '- [Host]';
                    }

                    text = document.createTextNode(displayName);
                }

                cell.appendChild(text);
            }
        };
    } else {
        const filteredData = filterData(data);

        createTableHeaders(table, filteredData);

        let tbody = table.createTBody();

        let bRow = tbody.insertRow();
        for (let key in filteredData) {
            let cell = bRow.insertCell();
            let text = document.createTextNode(filteredData[key]);
            cell.appendChild(text);
        }
    }

    return table;
}
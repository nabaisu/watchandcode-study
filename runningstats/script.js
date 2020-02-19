var exerciseReq = {
    swim: {
        exercises: [],
    },
    cycle: {
        exercises: [],
    },
    run: {
        exercises: [],
    },
};

var exerciseDone = {
    swim: {
        exercises: [],
    },
    cycle: {
        exercises: [],
    },
    run: {
        exercises: [],
    },
};

const typeOfExercises = [{ 'type': 'swim', 'googleValue': 82 }, { 'type': 'cycle', 'googleValue': 1 }, { 'type': 'run', 'googleValue': 8 }]
//const typeOfExercises = [{ 'type': 'cycle', 'googleValue': 1 }]

function checkTypeOfDate(date) {
    if (typeof date === 'string' || typeof date === 'Object') {
        return 'str'
    } else if (typeof date === 'number') {
        return 'mil'
    } else {
        return 'unknown'
    }
}

function transformDateToMilim(date) {
    return Date.parse(date);
}

function transformDateToISO(date) {
    return new Date(date).toISOString()
}

//returns in a ISO String
function getStartOfDay(date) {
    //transform any date to ISO
    let date1 = new Date(date);
    let dateString = new Date(date1.getTime() - (date1.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0];
    return dateString + 'T00:00:00.000Z';
}
function getEndOfDay(date) {
    //transform any date to ISO
    let date1 = new Date(date);
    let dateString = new Date(date1.getTime() - (date1.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0];
    return dateString + 'T23:59:59.000Z';
}

function getDataFromGoogleFit(startDate, endDate) {
    exerciseDone = {
        swim: {
            exercises: [],
        },
        cycle: {
            exercises: [],
        },
        run: {
            exercises: [],
        },
    };
    startDate = new Date(getStartOfDay(document.getElementById('startingDate').value));
    endDate = new Date(getEndOfDay(document.getElementById('endingDate').value));
    let startDateISO = getStartOfDay(startDate);
    let endDateISO = getEndOfDay(endDate);

    typeOfExercises.map((typeofex) => {
        //return typeofex;
        getTheSessionsList({ 'activityType': typeofex.googleValue, 'startDate': startDateISO, 'endDate': endDateISO })
    })
    return this;
};

function getTheSessionsList(objOfInputs) {
    let request = gapi.client.fitness.users.sessions.list({
        'userId': userConstId,
        'activityType': objOfInputs.activityType,
        'startTime': objOfInputs.startDate,
        'endTime': objOfInputs.endDate
    });
    request.execute(getDataOfGoogleSessions);
}

function getDataOfGoogleSessions(sessionsData) {
    //console.log(sessionsData.session)
    if (sessionsData.session) {
    sessionsData.session.forEach((session) => {
        let request = gapi.client.fitness.users.dataset.aggregate({
            "userId": userConstId,
            "aggregateBy": [
                { "dataTypeName": "com.google.distance.delta" },
                { "dataTypeName": "com.google.calories.expended" },
                { "dataTypeName": "com.google.step_count.delta" },
                { "dataTypeName": "com.google.active_minutes" },
                { "dataTypeName": "com.google.heart_minutes" }
            ],
            "endTimeMillis": session.endTimeMillis,
            "startTimeMillis": session.startTimeMillis,
            "bucketByTime": {
                "durationMillis": 86400000
            }
        });
        request.then((a) => {
            return a.result
        })
        .then((inp) => {
                inp.bucket.map((singleData) => {
                    let tempObj = {
                        date: '',
                        startingDate: '',
                        endingDate: '',
                        distance: 0,
                        task: '',
                        time: '',
                        stretchingTime: '',
                        stretchingType: ''
                    };
                    let typeofExer = typeOfExercises.find(obj => { return obj.googleValue === session.activityType });
                    tempObj.date = getStartOfDay(parseInt(singleData.startTimeMillis));
                    tempObj.startingDate = transformDateToISO(parseInt(singleData.endTimeMillis));
                    tempObj.endingDate = transformDateToISO(parseInt(singleData.startTimeMillis));
                    tempObj.distance = parseFloat((singleData.dataset[0].point[0].value[0].fpVal / 1000).toFixed(3));
                    //tempObj.distance = Math.round(singleData.dataset[0].point[0].value[0].fpVal /1000 *1000) / 1000;
                    tempObj.time = Math.floor(singleData.dataset[3].point[0].value[0].intVal / 60) + ':' +Math.floor(singleData.dataset[3].point[0].value[0].intVal %60)
                    tempObj.task = session.name
                    exerciseDone[typeofExer.type].exercises.push(JSON.parse(JSON.stringify(tempObj)))
                    render();
                });
            })/*
            .then((a) => {
                render();
            });
            */

        //request.execute(setTotals, session.endTimeMillis,session.endTimeMillis, session.endTimeMillis, session.endTimeMillis);
    })
}
}

function getDataFromStrava(startDate, endDate) {

    return this;
};

function getDataFromTrainer(nameOfFile) {
    fetch('./plan.json').then(
        (result) => {
            return result.json()
        }
    ).then(
        (result) => {
            //console.log(result.plan)
            parseTrainerData(result.plan)
            storeMessages()
            //console.log(exerciseReq)
            render()
        }
    ).catch(
        (err) => { console.log('err', err) }
    )
}
getDataFromTrainer();

function render() {
    let totalsNeeded = renderDataofTrainer();
    let totalsDone = renderDataofGoogleFit();
    typeOfExercises.forEach((typeofex) => {
        renderProgressBars(typeofex.type, totalsDone[typeofex.type], totalsNeeded[typeofex.type])
    });
    //renderDetails(typeofex.type, total);
};

function renderProgressBars(type, valueDone, valueToDo) {
    //console.log(type, valueDone, valueToDo);
    let percentage;
    if (valueToDo <= 0) {
        percentage = '100'
    } else {
        percentage = valueDone/valueToDo*100
    }
    document.getElementById(type+'ProgressBar').style.width = percentage+'%';
}

function renderDetails(type, value) {
    //document.getElementById(type+'ProgressBar').style.width = value+'%';
    return this;
}

function renderDataofTrainer() {
    let totals = {};
    let total = 0;
    typeOfExercises.map((typeofex) => {
        total = 0;
        for (const item of exerciseReq[typeofex.type].exercises) {
            if (item.date.slice(0, 10) === document.getElementById('startingDate').value) {
                total += item.distance
            }
        }
        total.toFixed(2)
        document.getElementById(typeofex.type + 'Needed').textContent = total;
        totals[typeofex.type] = total;
    })
    return totals;
};

function renderDataofGoogleFit() {
    let totals = {};
    let total = 0;
    typeOfExercises.map((typeofex) => {
        total = 0;
        for (const item of exerciseDone[typeofex.type].exercises) {
            if (item.date.slice(0, 10) === document.getElementById('startingDate').value) {
                total += item.distance
            }
        }
        total.toFixed(2)
        document.getElementById(typeofex.type + 'Done').textContent = total;
        totals[typeofex.type] = total;
    });
    return totals;
}

function parseTrainerData(inp) {
    inp.map((singleData) => {

        let tempObj = {
            date: '',
            distance: 0,
            task: '',
            time: '',
            stretchingTime: '',
            stretchingType: ''
        };
        tempObj.date = getStartOfDay(singleData.planeamentoDia);
        tempObj.stretchingType = singleData['alongamentos/ginásioTempo']
        tempObj.stretchingType = singleData['alongamentos/ginásioTipo']

        if (singleData.ciclismoKm) {
            tempObj.distance = singleData.ciclismoKm;
            tempObj.task = singleData.ciclismoTarefas
            tempObj.time = singleData.ciclismoTempo
            exerciseReq['cycle'].exercises.push(JSON.parse(JSON.stringify(tempObj)))
        }
        if (singleData.corridaKm) {
            tempObj.distance = singleData.corridaKm;
            tempObj.task = singleData.corridaTarefas
            tempObj.time = singleData.corridaTempo
            exerciseReq['run'].exercises.push(JSON.parse(JSON.stringify(tempObj)))
        }
        if (singleData.nataçãoKm) {
            tempObj.distance = singleData.nataçãoKm;
            tempObj.time = singleData.nataçãoTempo
            exerciseReq['swim'].exercises.push(JSON.parse(JSON.stringify(tempObj)))
        }
    })
}


// exerciseReq and exerciseDone
function storeMessages(type, value) {
    if (value) {
        localStorage.setItem(type, JSON.stringify(value));
    }
    exerciseData = JSON.parse(localStorage.getItem(type));
}


function getData() { };

var CLIENT_ID = '971160155249-3p2r1osonckc9d8u5man18a1ofer4qhu.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBBk4LT-CICN7m6hV0Wd221-PxnIVHZtSQ';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"];
var SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.activity.write https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/fitness.location.write';
var authorizeButton = document.getElementById('authorize_button_google_fit');
var signoutButton = document.getElementById('signout_button_google_fit');
var allMessages = JSON.parse(localStorage.getItem('messages'));
var currentIndex = 0;
const userConstId = 'me';

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
        getDataFromGoogleFit();
    }, function (error) {
        //appendPre(JSON.stringify(error, null, 2));
    });
}
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}



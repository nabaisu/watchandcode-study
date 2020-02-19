class ExerciseData {
    constructor() {
        this.swim = {
            reqEx: [],
            doneEx: [],
            totalDist: 0
        };
        this.cycle = {
            reqEx: [],
            doneEx: [],
            totalDist: 0
        };
        this.run = {
            reqEx: [],
            doneEx: [],
            totalDist: 0
        };
        this.startDate;
        this.endDate;
    }

    getDataFromGoogleFit() {
        
        return this;
    }
    getDataFromStrava() {

        return this;
    }
    getTotalDone(typeOfEx) {
        let use;
        switch (typeOfEx) {
            case 'swim':
                use = this.swim;
                break
            case 'cycle':
                use = this.cycle;
                break
            case 'run':
                use = this.run;
                break
            default:
                throw Error('not available type of exercise')
        }
        use.totalDist = typeOfEx;
        return this;
    }
    getNeededInfo() {

        return this;
    }
    placeNeededToFormat() {

        return this;
    }
    render() {

    };
    storeMessages(messages) {
        if (messages) {
          localStorage.setItem('messages', JSON.stringify(messages));
        }
        allMessages = JSON.parse(localStorage.getItem('messages'));
      }
}

class GoogleFitAuth {
    constructor() {
        this.CLIENT_ID = '971160155249-dj2nit4thr2c7noo1m29q7h72731u44q.apps.googleusercontent.com';
        this.API_KEY = 'AIzaSyDZ8k10QJurDFOfnI08jN9vC8qVIEAYSuw';
        // Array of API discovery doc URLs for APIs used by the quickstart
        this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
        // Authorization scopes required by the API; multiple scopes can be
        // included, separated by spaces.
        this.SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify';
        this.isSignedIn = false;
        this.userConstId = 'me';
    }

    handleClientLoad() {
        gapi.load('client:auth2', initClient);
    }
    initClient() {
        var self = this;
        gapi.client.init({
            apiKey: self.API_KEY,
            clientId: self.CLIENT_ID,
            discoveryDocs: self.DISCOVERY_DOCS,
            scope: self.SCOPES
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            self.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            //authorizeButton.onclick = handleAuthClick;
            //signoutButton.onclick = handleSignoutClick;
        }, function (error) {
            self.appendPre(JSON.stringify(error, null, 2));
        });
    };
    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            //listLabels();
            listMessages(printOnDeck);
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
        }
    };
    handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    };
    handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    };
}

class GoogleFitAPI extends GoogleFitAPI {
    constructor() {
        super();
        this.swimId = 3;
        this.cycleId = 1;
        this.runId = 17;
    }
    getSessions(messageId, callback) {
        var request = gapi.client.gmail.users.messages.get({
          'userId': this.userConstId,
          'id': messageId
        });
        request.execute(callback);
      }
    getData() { }
}

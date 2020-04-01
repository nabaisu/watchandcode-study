var deferredPrompt;
NodeList.prototype.forEach = Array.prototype.forEach;

var currentUser;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('service worker is registered')
    }).catch((err) => {
      console.log(err)
    });
}
var install_button = document.getElementById('show-install')
window.addEventListener('beforeinstallprompt', event => {
  install_button.style.display = 'block';
  console.log("beforeInstallPrompt fired")
  event.preventDefault();
  deferredPrompt = event;

  install_button.addEventListener('click', e => {
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        // user accept the prompt

        // lets hidden button
        install_button.style.display = 'none';
      } else {
        console.log('User dismissed the prompt');
      }
      window.deferredPrompt = null;
    });
  });


  return false
});

// if are standalone android OR safari
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
  // hidden the button
  install_button.style.display = 'none';
}


// [START buttoncallback]
function toggleSignIn(elem) {
  if (!firebase.auth().currentUser) {
    var provider;
    // [START createprovider]
    switch (elem.dataset.signinProvider) {
      case 'google':
        provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');
        break;
      case 'microsoft':
        provider = new firebase.auth.OAuthProvider('microsoft.com');
        provider.addScope('User.Read');
        break;
      case 'facebook':
        provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('User.Read');
        break;
      case 'twitter':
        provider = new firebase.auth.TwitterAuthProvider();
        break;
      case 'github':
        provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('User.Read');
        break;
      default:
        provider = new firebase.auth.GoogleAuthProvider();
        break;
    }
    // [END createprovider]
    // [START signin]
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // [START_EXCLUDE]
      document.getElementById('quickstart-oauthtoken').textContent = token;
      // [END_EXCLUDE]
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
      // [END_EXCLUDE]
    });
    // [END signin]
  } else {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  }
  // [START_EXCLUDE]

  document.querySelectorAll('.quickstart-sign-in').forEach(function (elem) {
    elem.disabled = true;
  });
  // [END_EXCLUDE]
}
// [END buttoncallback]

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function (user) {
    currentUser = user;
    if (currentUser) {
      // User is signed in.
      var displayName = currentUser.displayName;
      var email = currentUser.email;
      var emailVerified = currentUser.emailVerified;
      var photoURL = currentUser.photoURL;
      var isAnonymous = currentUser.isAnonymous;
      var uid = currentUser.uid;
      var providerData = currentUser.providerData;
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
      document.querySelectorAll('.quickstart-sign-in').forEach(function (elem) {
        elem.textContent = 'Sign out';
        elem.style.display = "none"
        elem.disabled = true
      });
      document.getElementById('signout-button').style.display = "block";
      document.getElementById('signout-button').disabled = false;
      document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      document.querySelectorAll('.quickstart-sign-in').forEach(function (elem) {
        elem.textContent = 'Sign in with ' + elem.dataset.signinProvider;
        if (elem.dataset.notYetConfigured === "yes") {
          elem.style.display = "none"
          elem.disabled = true
        } else {
          elem.style.display = "block"
          elem.disabled = false
        }
      })
      document.getElementById('signout-button').style.display = "none";
      document.getElementById('signout-button').disabled = true;
      document.getElementById('quickstart-account-details').textContent = 'null';
      document.getElementById('quickstart-oauthtoken').textContent = 'null';
      // [END_EXCLUDE]
    }
    // [START_EXCLUDE]
    document.querySelectorAll('.quickstart-sign-in').forEach(function (elem) {
      elem.disabled = false;
    });
    //dbPromise = createNewIDB(currentUser.uid).then(function(){
      //updateUI();
    //});
    // [END_EXCLUDE]
  });

  // [END authstatelistener]
  document.getElementById('signout-button').addEventListener('click', function () { firebase.auth().signOut(); }, false);
  document.querySelectorAll('.quickstart-sign-in').forEach(function (elem) {
    if (elem.dataset.notYetConfigured === "yes") {
    } else {
      elem.addEventListener('click', function () { toggleSignIn(elem) }, false);
    }
  });
}

window.onload = function () {
  initApp();
};




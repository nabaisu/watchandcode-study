var IDBIableToWriteTo = 'texts'
var IDBName = 'texts'


var onlineEl = document.getElementById('online');
var offlineEl = document.getElementById('offline');
var feedContent = document.getElementById('feed-content');
var editor = document.getElementById('editor');
var editorContent = document.querySelector('.ql-editor');
var showInstall = document.querySelector('#show-install');
//modal for creating a new post
var createPostArea = document.querySelector('#create-post');

var modalTitle = document.querySelector('.modal-title');
var modalContent = document.querySelector('.modal-body');
var modalFooter = document.querySelector('.modal-footer');

var searchBox = document.getElementById('searchbox');

var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
//const firebaseBaseURL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/`//?key=${key}`
//const doc = 'texts/Um0bLkWCYAN07gijMX12SmFykgX2';
var connectedUser = false;
//import FireStoreParser from '/src/js/FireStoreParser_min.js'
//var FireStoreParser = new FireStoreParser();

//check if in private mode
isPrivateMode().then(function (isPrivate) {
  if (isPrivate) {
    console.log('private browser detected')
    show(document.getElementById('pb-alert'))
  }
});

function setMode() {
  if (navigator.onLine) {
    //console.log((RegExp('\\w+','g').test(editorContent.innerText) || editor.focusedTextId));
    if (regexContainsWords(editorContent.innerText) || editor.dataset.focusedTextId) {
      if (editor.dataset.focusedTextId && !regexContainsWords(editorContent.innerText)) {
        deleteFromIDB(editor.dataset.focusedTextId);
      } else {
        saveText();
      }
    }
    //setFocusText();
    hide(offlineEl);
    show(onlineEl);
    //fullscreen(false);
    setTimeout(function () { setFocusText() }, 0)
    console.log('☹️ I\'m online =(');
  } else {
    hide(onlineEl);
    show(offlineEl);
    //fullscreen(true);
    console.log('😊 Offline! Let\'s work!! ');
  }
}

var dbPromise = openDBConnection();

function openDBConnection() {
  return idb.open('texts-store', 1, function (db) {
    // will always try to create, so we need to check if it already exists
    if (!db.objectStoreNames.contains('texts')) {
      db.createObjectStore('texts', { keyPath: 'id' });
    }
    /*
    if (this.currentUser) {
      if (!db.objectStoreNames.contains(this.currentUser.uid)) {
        db.createObjectStore(this.currentUser.uid, { keyPath: 'id' });
      }  
    }
    */
  });
}


//====================================
//      HELPER FUNCTIONS
//====================================
var hide = function (elem) {
  elem.style.display = 'none';
};

var show = function (elem) {
  //elem.style.transform = "translateY(0)";
  elem.style.display = 'block';
};

function generateId() {
  var i, random;
  var uuid = '';
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}

function saveText() {
  var currentUID = editor.dataset.focusedTextId
  if (currentUID) {
    getTextDataById(currentUID)
      .then(function (oldData) {
        var newData = {}
        newData.content = editorContent.innerText
        if (JSON.stringify(oldData.content) !== JSON.stringify(newData.content)) {
          //++ might check if this code is async or not
          // this means that they are different
          //toastr["success"]('good, they are actually different')
          //++ now i need to store the new one in the IDB
          oldData.content = newData.content
          storeDataToIDB('update', oldData)
            .then(function (params) {
              toastr["success"]('updated the content')
            })
        } else {
          // this means that they are the same
          toastr["info"]('actually you didn\' change anything... skipping...')
        }
      })
  } else {
    createNewText()
  }
}

// CTRL+S
editorContent.onkeydown = function (e) {
  if (e.ctrlKey && e.keyCode === 83) {
    e.preventDefault();
    saveText();
    //toastr["success"]('ctrl-s');
    // your code here
    return false;
  }
};

// SearchBox Change input
searchBox.addEventListener('input', function (evt) {
  updateUI();
});

function getRandomTitle() {
  return getDatefromISO((new Date()).toISOString()) + '-' + Math.random().toString(36).substr(2, 7);
}

function createNewText() {
  // here get the content of the text and add a new entry to the idb
  var data = {}
  data.content = editorContent.innerText;
  //get a random string
  data.title = getRandomTitle();
  if (connectedUser) {
    data.author = 'hisuid'
  }
  data.dateCreated = new Date().toISOString();
  data.id = generateId();
  // insert the data to the IDB
  storeDataToIDB('create', data)
    .then((oi) => {
      editor.dataset.focusedTextId = data.id;
      toastr["success"]('saved successfully')
    }).catch((err) => {
      toastr["error"]('there was a problem when generating the new text:<p>' + err + '</p>')
    })
}

function deleteFromIDB(uid) {
  if (confirm('Are you sure you want to delete your text ?')) {
    storeDataToIDB('delete', uid)
      .then(function () {
        clearEditor();
        toastr["success"]('successfully deleted the text')
      }).catch(function (err) {
        toastr["error"]('successfully deleted the text')
      })
  }
}

function storeDataToIDB(whatToDo, data) {
  // basically if the uid exists, then update it, otherwise, just insert it  
  switch (whatToDo) {
    case 'create':
      //++ check if the database is already, if not, then create
      return new Promise(function (resolve, reject) {
        //++ still to do
        dbPromise.then(function (db) {
          var tx = db.transaction(IDBIableToWriteTo, 'readwrite');
          var store = tx.objectStore(IDBIableToWriteTo);
          store.add(data);
          return tx.complete;
        }).then(function () {
          updateUI();
          resolve()
        }).catch(function (err) {
          console.log(err)
          reject()
        });
      })
      break;
    case 'update':
      return new Promise(function (resolve, reject) {
        dbPromise.then(function (db) {
          var tx = db.transaction(IDBIableToWriteTo, 'readwrite');
          var store = tx.objectStore(IDBIableToWriteTo);
          store.put(data);
          return tx.complete;
        }).then(function () {
          updateUI();
          resolve();
        });
      })
      break;
    case 'delete':
      return new Promise(function (resolve, reject) {
        dbPromise.then(function (db) {
          var tx = db.transaction(IDBIableToWriteTo, 'readwrite');
          var store = tx.objectStore(IDBIableToWriteTo);
          store.delete(data);
          return tx.complete;
        }).then(function () {
          updateUI();
          resolve();
        });
      })
      break;

    default:
      return new Promise(function () { reject('the parameter "whatToDo" passed was not found... :' + whatToDo) })
      break;
  }





}

function setFocusText(uid = '') {
  editor.dataset.focusedTextId = uid
  selectCardBackground(uid)
  if (uid) {
    getTextDataById(uid)
      .then(function (dataToFill) {
        editorContent.innerText = dataToFill.content
        toastr["info"]('Text already selected. Now just go Offline')
      })
  } else {
    clearEditor()
    selectCardBackground(false, 'success')
  }
}

function selectCardBackground(uid, color = "primary") {
  clearAllSelectedCards();
  var cardToSelect;
  if (!uid) {
    cardToSelect = document.getElementById('newtextcard')
    cardToSelect.classList.add('bg-success')
    cardToSelect.classList.add('modify-selected')
  } else {
    cardToSelect = document.getElementById(uid)
    if (cardToSelect !== null) {
      cardToSelect.classList.add('bg-primary')
      cardToSelect.classList.add('modify-selected')
    }
  }
}

function clearAllSelectedCards() {
  var selectedCards = document.querySelector('.modify-selected')
  if (selectedCards !== null) {
    selectedCards.classList.remove('bg-primary')
    selectedCards.classList.remove('bg-success')
    selectedCards.classList.remove('modify-selected')
  }
}

function getTextDataById(uid) {
  //++ here I will have to get the values from idb
  //return new Promise(function(resolve, reject){
  //resolve(data)
  //})
  return dbPromise.then(function (db) {
    var tx = db.transaction(IDBIableToWriteTo, 'readonly');
    var store = tx.objectStore(IDBIableToWriteTo);
    return store.get(uid);
  }).then(function (data) {
    return data
  });
}

function clearEditor() {
  clearAllSelectedCards();
  editor.dataset.focusedTextId = ""
  editorContent.innerText = ""
}

// function fetchFirestore(doc) {
//   fetch(firebaseBaseURL + doc)
//     .then(response => response.json())
//     .then(json => FireStoreParser(json))
//     .then(json => console.log(json));
// }

function onCardSaveClicked(event) {
  console.log('clicked')
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function (cache) {
        cache.add('https://httpbin.org/get');
        // if another image or request would be needed then we can add it here as well
      })
  }
}

function clearCards() {
  while (feedContent.hasChildNodes()) {
    feedContent.removeChild(feedContent.lastChild);
  }
}

function getDatefromISO(dat) {
  return dat.substring(0, 10)
}

function createNewTextCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = "card m-1 modify-selected bg-success card-responsive";
  cardWrapper.id = "newtextcard"
  //cardWrapper.style.width = "18rem";
  var cardBody = document.createElement('div');
  cardBody.className = "card-body";
  var cardTitle = document.createElement('h3');
  cardTitle.className = "card-title";
  cardTitle.textContent = "New Text";
  var cardSupportingText = document.createElement('p');
  cardSupportingText.className = "card-text";
  cardSupportingText.textContent = "just go offline for a new text. Text will be saved to: " + IDBName
  cardWrapper.onclick = function () { setFocusText(); };
  cardWrapper.appendChild(cardBody);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardSupportingText);
  feedContent.appendChild(cardWrapper);
}

function createTextCard(text) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = "card m-1 card-responsive";
  cardWrapper.id = text.id
  //cardWrapper.style.width = "18rem";
  var cardBody = document.createElement('div');
  cardBody.className = "card-body";
  var cardTitle = document.createElement('h3');
  cardTitle.className = "card-title";
  cardTitle.ondblclick = function () {
    editTitleStart(cardTitle);
  }
  cardTitle.onblur = function () {
    editTitleEnd(cardTitle);
  }
  cardTitle.style.cursor = "pointer";
  cardTitle.contenteditable = "false";
  cardTitle.textContent = text.title;
  var cardDate = document.createElement('div');
  cardDate.textContent = getDatefromISO(text.dateCreated);
  cardDate.classList = 'text-muted';
  var cardSupportingText = document.createElement('p');
  cardSupportingText.className = "card-text";
  cardSupportingText.textContent = (text.content).substring(0, 50);
  var cardEditButton = document.createElement('button');
  cardEditButton.appendChild(generateFAIcon('edit'));
  cardEditButton.className = 'btn btn-primary m-1'
  cardEditButton.onclick = function () { setFocusText(text.id); };
  var cardDeleteButton = document.createElement('button');
  cardDeleteButton.appendChild(generateFAIcon('trash-alt'))
  cardDeleteButton.className = 'btn btn-danger m-1'
  cardDeleteButton.onclick = function () { deleteFromIDB(text.id); };
  var cardDownloadButton = document.createElement('a');
  cardDownloadButton.appendChild(generateFAIcon('download'))
  cardDownloadButton.className = 'btn btn-dark m-1'
  cardDownloadButton.download = text.title + '.txt'
  cardDownloadButton.href = createDownloadableContentURL(text);
  //cardDownloadButton.onclick = function () { deleteFromIDB(text.id); };
  var cardSeeButton = document.createElement('button');
  cardSeeButton.appendChild(generateFAIcon('eye'))
  cardSeeButton.className = 'btn btn-info m-1'
  cardSeeButton.dataset.toggle = "modal"
  cardSeeButton.dataset.target = ".bd-example-modal-lg"
  cardSeeButton.onclick = function () { setModalContent(text.id); };
  cardWrapper.appendChild(cardBody);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardSupportingText);
  cardBody.appendChild(cardDate);

  cardBody.appendChild(cardSeeButton);
  cardBody.appendChild(cardEditButton);
  cardBody.appendChild(cardDeleteButton);
  cardBody.appendChild(cardDownloadButton);

  feedContent.appendChild(cardWrapper);
}

function generateFAIcon(name, type = "fa") {
  let iconContainer = document.createElement('i');
  iconContainer.className = type
  iconContainer.className += ' fa-' + name
  //iconContainer.innerHTML = icon({ prefix: type, iconName: name }).html;
  return iconContainer;
}

function setModalContent(uid) {
  getTextDataById(uid)
    .then(function (dataToFill) {
      modalTitle.textContent = dataToFill.title
      modalContent.innerText = dataToFill.content
      modalFooter.textContent = dataToFill.dateCreated
    })
}

function createDownloadableContentURL(dataToFill) {
  let textData = new Blob([dataToFill.content], { type: 'text/plain' });
  return window.URL.createObjectURL(textData);
}

function fullscreen(bool) {
  var elem = document.documentElement;
  if (bool) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }
}

function editTitleStart(elem) {
  elem.classList.add('inEdit')
  elem.contentEditable = true;
}

function editTitleEnd(elem) {
  saveChangedTitle(elem)
    .then(function (result) {
      if (result) {
        elem.contentEditable = false;
        elem.classList.remove('inEdit')
      }
    })
}

function regexContainsWords(text) {
  if (RegExp('\\w+', 'g').test(text)) {
    return true
  }
  return false
}

function saveChangedTitle(elem) {
  //++ TODO (check the text and then save the changedTitle to the IDB)
  var reverseTitle = false;
  return new Promise(function (resolve, reject) {
    if (!regexContainsWords(elem.textContent)) {
      reverseTitle = true;
    }
    getTextDataById(elem.parentNode.parentNode.id)
      .then(function (data) {
        if (reverseTitle) {
          elem.textContent = data.title
          toastr["error"]("sorry but the title can't be empty")
          return resolve(false);
        }
        data.title = elem.textContent
        storeDataToIDB('update', data)
          .then(function (params) {
            toastr["success"]('updated the title')
            return resolve(true);
          })
      })
  })
}

function separateByDay(data = []) {
  let lastDayChecked;
  data.forEach(element => {

  });
  if (lastDayChecked) {

  } else {

  }
}

function updateUI() {
  if (!this.currentUser) {
    IDBIableToWriteTo = 'texts'
  } else {
    IDBIableToWriteTo = this.currentUser.uid
  }

  //get from the IndexedDB
  getAllTextsFromUser().then(function (data) {
    clearCards();
    createNewTextCard();
    if (!searchBox.value) {
      // create all of the cards
      for (let i = 0; i < data.length; i++) {
        createTextCard(data[i]);
      }
    } else {
      //just create the cards that match the regex
      for (let obj = 0; obj < data.length; obj++) {
        if (checkIfCardHasSearch(data[obj], searchBox.value)) {
          createTextCard(data[obj]);
        }
      }
    }
  });
}

function syncTextsWithFirebase() {
  // if first time (table with id does not exist, then)
}

function checkIfCardHasSearch(data, text) {
  let a = new RegExp(text, "g")
  for (keys in data) {
    if (a.test(data[keys])) {
      return true
    }
  }
  return false
}

function getAllTextsFromUser() {
  return new Promise(function (resolve, reject) {
    dbPromise.then(function (db) {
      var tx = db.transaction(IDBIableToWriteTo, 'readonly');
      var store = tx.objectStore(IDBIableToWriteTo);
      return store.getAll();
    }).then(function (items) {
      return resolve(items);
    });
  })
}

var networkDataReceived = false;




// fetch(firebaseBaseURL+doc)
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (json) {
//     return FireStoreParser(json)
//   })
//   .then(function (data) {
//     networkDataReceived = true;
//       console.log("From web:", data);
//       var dataArray = [];
//       for (let key in data.fields.texts) {
//         dataArray.push(data.fields.texts[key]);
//       }
//       console.log("dataArray",dataArray);
//       updateUI(dataArray);            
//   });


// if ('caches' in window) {
//   caches.match(firebaseBaseURL+doc)
//         .then(function(response){
//           if (response) {
//             return response.json()
//           }  
//         })
//         .then(function (json) {
//           if (json) {
//             return FireStoreParser(json)
//           } else {
//             return json
//           }
//         })
//         .then(function(data){
//           console.log("From cache:", data);
//           if (!networkDataReceived) {
//             var dataArray = [];
//             for (let key in data.fields.texts) {
//               dataArray.push(data.fields.texts[key]);
//             }        
//             updateUI(dataArray);
//           }
//         })
// }


function showInstallPrompt() {
  //createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome);
      if (choiceResult.outcome === 'dismissed') {
        console.log('oooooh')
      } else {
        console.log('User added to home screen')
      }
    })
    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

showInstall.addEventListener('click', showInstallPrompt);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

updateUI();



var prev_handler = window.onload;
window.onload = function () {
  //get old code to run here
  if (prev_handler) {
    prev_handler();
  }
  //set new window.onload code
  firebase.auth().onAuthStateChanged(function (user) {
    self.currentUser = user;
    updateUI();
  });
};

function fetchUserTextsFromFirebase(userId) {
  // get all the texts from the user
  // 
}

function moveTextsFromOldIDB() {
  // move the texts to user IDB
  // check if everything went right (all the texts were successfully copied)
  // remove the texts from the default IDB
}


// window.onload = function () {
//   firebase.auth().onAuthStateChanged(function (user) {
//     window.currentUser = user;
//     updateUI();
//   })
// };

function syncOffline() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
      .then(function (sw) {
        sw.sync.register('sync-new-post'); //any name, its a tag
      })
  }
}

function sendTextToFirebase(text){
  fetch('url', {
    headers: {
      'Content-Type': 'application/json',
      'Accept':'application/json'
    },
    method: 'POST',
    body: JSON.stringify(
      {text}
    )
  }).then(function(res){
    console.log('Sent data:',res)
    //updateUI();
  })
}
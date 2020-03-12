
var feedContent = document.getElementById('feed-content');
var showInstall = document.querySelector('#show-install');
//modal for creating a new post
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function onCardSaveClicked(event) {
  console.log('clicked')
  if ('caches' in window) {
  caches.open('user-requested')
        .then(function(cache){
          cache.add('https://httpbin.org/get');
          // if another image or request would be needed then we can add it here as well
        })
      }
}

function createTextCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = "card m-3";
  cardWrapper.style.width = "18rem";
  var cardBody = document.createElement('div');
  cardBody.className = "card-body";
  var cardTitle = document.createElement('h3');
  cardTitle.className = "card-title";
  cardTitle.textContent = "Bom dia";
  var cardSupportingText = document.createElement('p');
  cardSupportingText.className = "card-text";
  cardSupportingText.textContent = "basicamente isto devia ser o meu primeiro texto, mas por acaso até não é, e pronto, não tenho muito mais para dizer"
  var cardSaveButton = document.createElement('button');
  //cardSaveButton.textContent = 'save'
  //cardSaveButton.className = 'btn btn-success'
  //cardSaveButton.addEventListener('click', onCardSaveClicked);
  cardWrapper.appendChild(cardBody);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardSupportingText);
  //cardBody.appendChild(cardSaveButton);
  feedContent.appendChild(cardWrapper);
}

fetch('https://httpbin.org/get')
.then(function(res) {
  return res.json();
})
.then(function(data) {
  createTextCard();
});


function showInstallPrompt() {
  //createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult)=> {
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

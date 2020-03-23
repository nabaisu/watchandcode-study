var deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker is registered')
        }).catch((err)=> {
            console.log(err)
        });
}
var install_button = document.getElementById('show-install')
window.addEventListener('beforeinstallprompt',event => {
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





var deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker is registered')
        });
}

window.addEventListener('beforeinstallprompt',event => {
    event.preventDefault();
    deferredPrompt = event;
    return false 
})
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

window.addEventListener('beforeinstallprompt',event => {
    console.log("beforeInstallPrompt fired")
    event.preventDefault();
    deferredPrompt = event;
    return false 
});

// Register listeners
window.addEventListener("offline", function(){

});
window.addEventListener("online", function(){

});

function setMode() {
    if (navigator.onLine) {
        $("#offline").hide();
        $('#online').show();
        console.log('NAAAAO!! ASSIM NÃO CONSIGO TRABALHAR!!');
    } else {
        $('#online').hide();
        $('#offline').show();
        console.log('OOOOOOOOFFLINE!! VAMOS!!');
    }
}
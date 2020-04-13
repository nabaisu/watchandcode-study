importScripts('/src/js/idb.js');

// comment
var CACHE_STATIC_NAME = "static-v2"
var CACHE_DYNAMIC_NAME = "dynamic"

var listOfAppShell = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/bootstrap.min.js',
    '/src/js/jquery.min.js',
    '/src/css/bootstrap.min.css',
    '/src/css/feed.css',
    '/src/css/app.css',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    //'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdn.quilljs.com/1.3.6/quill.snow.css',
    'https://cdn.quilljs.com/1.3.6/quill.js',
    '/src/js/firebase-app.js',
    '/offline/',
    '/offline/index.html',
    //'/src/js/FireStoreParser.js',
    '/src/js/idb.js',
    '/src/js/toastr.min.js',
    "/src/js/popper.min.js",
    "/src/js/is-private-mode.js",
    "/src/css/toastr.min.css",
    "https://use.fontawesome.com/releases/v5.0.13/css/all.css",
    '/favicon.ico'
]

var fireBaseURL = `https://firestore.googleapis.com/v1/projects/offline-diary/databases/(default)/documents/`//?key=${key}`

//=================
// IndexedDB
//=================
var dbPromise = idb.open('texts-store', 1, function (db) {
    // will always try to create, so we need to check if it already exists
    if (!db.objectStoreNames.contains('texts')) {
        db.createObjectStore('texts', { keyPath: 'id' });
    }
});


//======================================
//           HELPER FUNCTIONS
//======================================
function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { //request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched', string);
        cachePath = string.substring(self.origin.length); //take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNSs)
    }
    return array.indexOf(cachePath) > -1;
}


//==============================================
//      SW INSTALL!       PRE CACHING
//==============================================

self.addEventListener('install', (event) => {
    // very good for caching stuff
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[SW] Precaching App Shell...');
                //cache.add('/index.html'); // whas here before
                cache.addAll(listOfAppShell);
            })
    );
    // caches.open will create the cache if it does not exist yet
    console.log('[SW] Installing Service Worker', event);
});

self.addEventListener('activate', (event) => {
    //==========================================================
    //     SW INSTALL!   CLEANING OF CACHES IF VERSION CHANGED
    //==========================================================
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) { // basically return a Promisse that will resolve only if all of the promises inside were resolved (inputed as an array)
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) { // here i will map and then delete the caches that are not the keys of the ones i want to keep
                        // to have in mind that map will return null and the Promise will be resolved
                        console.log('[SW] Removing old cache...', key)
                        return caches.delete(key);
                    }
                }))
            })
    )
    console.log('[SW] Activating Service Worker', event);
    return self.clients.claim();
});

//==============================================
//          FETCH INTERCEPTING
//==============================================
//DYNAMIC CACHE THEN NETWORK FOR SPECIFIC URL AND DYNAMIC CACHE WITH NETWORK FALLBACK FOR THE REST
self.addEventListener('fetch', (event) => {
    //console.log('[SW] Fetching Service Worker', event);

    //CACHE THEN NETWORK FOR SPECIFIC URL
    var specificURL = fireBaseURL + 'texts/Um0bLkWCYAN07gijMX12SmFykgX2';

    if (event.request.url.indexOf(specificURL) > -1) {
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    // here instead of caching dynamically the cache, we can go for IndexedDB   
                    var clonedRes = res.clone();
                    clonedRes.json()
//                            .then(function (json) {
//                                return FireStoreParser(json)
//                            })
                            .then(function (data) {
                                for (key in data.fields.texts.arrayValue.value) {
                                    dbPromise.then(function(db) {
                                        var tx = db.transaction('texts', 'readwrite');
                                        var store = tx.objectStore();
                                        store.put(data.fields.texts[key]);
                                        return tx.complete;
                                    })                                    
                                }
                            })                                     
                    //cache.put(event.request, res.clone());
                    return res
                })
        );
        //CACHE ONLY
    } else if (isInArray(event.request.url, listOfAppShell)) {
        event.respondWith(
            caches.match(event.request)
        )
    } else {
        //DYNAMIC CACHE WITH NETWORK FALLBACK
        //============================================
        //              GO OFFLINE
        //============================================
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) { // if there is no request it gives null
                        return response;
                    } else {
                        return fetch(event.request)
                            //=================================
                            //          DYNAMIC CACHING
                            //=================================
                            .then(function (res) {
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        cache.put(event.request.url, res.clone()) //res = response
                                        return res; // here basically we have to return the response again to chain up the responses 
                                    })
                            })
                            .catch(function (err) {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        // here goes the routing (can do regex express)
                                        //basically here we can send the offline page if the request is a page
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline/')
                                        }
                                    });
                            });
                    }
                })
        );
    }
});


self.addEventListener('sync',function(event) {
    console.log('[Service Worker] Background Syncing', event);
    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker] Syncing new posts')
        event.waitUntil(
            readAllData('idb objectStore name sync store')
                .then(function(data){
                    //as there may be more than 1 of the data, loop
                    for (var dt of data) {
                        // here use the data somewhere
                        // fetch().then(' delete the item from the sync store if response.ok') 
                    }
                })
        )
    }
})
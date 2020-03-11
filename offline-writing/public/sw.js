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
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdn.quilljs.com/1.3.6/quill.snow.css',
    'https://cdn.quilljs.com/1.3.6/quill.js'
]

//==============================================
//          PRE CACHING
//==============================================

self.addEventListener('install',(event)=> {
    // very good for caching stuff
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
        .then(function(cache){
            console.log('[SW] Precaching App Shell...');
            //cache.add('/index.html'); // whas here before
            cache.addAll(listOfAppShell);
        })
        );
    // caches.open will create the cache if it does not exist yet
    console.log('[SW] Installing Service Worker', event);
});

self.addEventListener('activate',(event)=> {
    //===================================
    //       CLEANING OF CACHES
    //===================================
    event.waitUntil(
        caches.keys()
        .then(function(keyList){
            return Promise.all(keyList.map(function(key){ // basically return a Promisse that will resolve only if all of the promises inside were resolved (inputed as an array)
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

self.addEventListener('fetch',(event)=> {
    //console.log('[SW] Fetching Service Worker', event);

    //============================================
    //              GO OFFLINE
    //============================================
    event.respondWith(
        caches.match(event.request)
        .then( function(response){
            if (response) { // if there is no request it gives null
                return response;
            } else {
                return fetch(event.request)
                //=================================
                //          DYNAMIC CACHING
                //=================================
                        .then(function(res){
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then(function(cache){
                                    cache.put(event.request.url, res.clone()) //res = response
                                    return res; // here basically we have to return the response again to chain up the responses 
                                })
                        })
                        .catch(function(err){
                            //
                        })
            }
        })
    );
});

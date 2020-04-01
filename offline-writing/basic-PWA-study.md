# PWA study

Então, basicamente aqui vou ter de meter o que acho que é importante ver quando estou a fazer debugging ou a construir uma PWA

## tirar offline

Basicamente tenho de registrar o service worker no browser.
Tenho de ver se o browser é compatível com o service worker
Depois tenho de começar a interceptar os requests
Para tirar offline, o que tenho de fazer é interceptar o `fetch` request e dar alguma coisa que não dê offline.
Ou seja, preciso de fazer caching da app-shell.
Para fazer caching da app-shell, eu tenho de identificar quais é que são os recursos que são comuns.
Posso fazer isto pelo nome ou dinamicamente pelo `Content-Type` e meter para JS e CSS (quem sabe).
Pelo menos a index.html é importante de actualizar.
Também importante é que é preciso em fez de fazer fetch, dar a página que está em cache.

## service workers

Só se mudar um byte no service worker é que ele vai detectar que há qualquer coisa de novo na instalação, o que isso quer dizer é que o momento de instalar um service worker é bom para fazer um update na cache ?

## caching

Para fazer caching, é preciso abrir a cache:
`caches.open();`, caso ainda não haja nenhuma cache então ao chamar isto ele cria automaticamente para nós.
Como JS é asyncrono, temos de chamar o `event.waitUntil(caches.open())`
Depois temos de dar nome à cache. Para a App Shell, podemos dar o nome de `static` ou de `precaching`.

### importante em caching

É ter a ideia que pode haver o mesmo ficheiro em 2 caches, e é preciso depois limpar a cache. O melhor sítio para fazer o cleanup é basicamente o `activating` event na cache.

## advanced caching (lesson 6)

### caching on demand

this is assuming that the dynamic caching is disabled
basically what we have to do is to set a user triggered event (button or something else) and in the function fetch the request we need to make this pass

### caching strategies

#### Cache only

- service worker intercepts fetch request
- SW checks if the request exists in the cache
- if SW exists in the cache, give it to the page,
- no else
  **pros**: get the page to render quiiiiiick, just load once and good foreva
  **cons**: no network, no dynamic stuff
  **ex**:

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request))
})
```

#### Network only

- service worker intercepts fetch request
- give the network response
  **pros**: normal no caching website
  **cons**: no network, no dynamic stuff
  **ex**:

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request))
})
```

#### Cache with network fallback

**the one used in the course so far**

- service worker intercepts fetch request
- SW checks if the request exists in the cache
- if SW exists in the cache, give it to the page,
- else, get the network to give it to the page
  **pros**: get the page to render quiiiiiick
  **cons**: we parse everything like that, so for dynamic stuff will be cached

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        // if there is no request it gives null
        return response
      } else {
        return fetch(event.request)
          .then(function(res) {
            return caches.open(CACHE_DYNAMIC_NAME).then(function(cache) {
              cache.put(event.request.url, res.clone()) //res = response
              return res // here basically we have to return the response again to chain up the responses
            })
          })
          .catch(function(err) {
            return caches.open(CACHE_STATIC_NAME).then(function(cache) {
              return cache.match('/offline/')
            })
          })
      }
    })
  )
})
```

#### Network with cache fallback

- service worker intercepts fetch request
- SW checks if the network request responded
- if SW request responded (promise resolved), give it to the page,
- else, get the cache to give it to the page
  **pros**: good because it gets you PWA (i think)
  **cons**: - we don't take advantage of the fast load of the cache - if the network takes 60 seconds to resolve, we will have 60 seconds until reach out to backup
  (basically if offline it will be cache very fast because the connection is rejected right away)

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      // put a then here for dynamic caching
      .catch(function(err) {
        return caches.match(event.request)
      })
  )
})
```

#### Cache then network

- (1) we go directly to the cache to get the information
- (2) we get the cache back to the page (still no service worker)
- (1) we intercept the request with the service worker
- (2) we make a call to the network from the service worker
- (3) we then get the response from the network
- (4) (optional) if dynamic cache is implemented, then we will store the new request in the cache
- (5) we then return the fetched data from the network to the page
  to implement, we need both the normal js file and the service worker file.

feed.js

```javascript
fetch(url)
  .then(function(res) {
    return res.json()
  })
  .then(function(data) {
    networkDataReceived = true
    console.log('From web:', data)
    if (!networkDataReceived) {
      clearCards()
      createTextCard()
    }
  })

if ('caches' in window) {
  caches
    .match(url)
    .then(function(response) {
      if (response) {
        return response.json()
      }
    })
    .then(function(data) {
      console.log('From cache:', data)
      createTextCard()
    })
}
```

sw.js

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_DYNAMIC_NAME).then(cache => {
      return fetch(event.request).then(res => {
        cache.put(event.request, res.clone())
        return res
      })
    })
  )
})
```

**pros**: It's the improved version of the cache first, then network, because here we basically give the cache right away, and then we populate with the network. This is very used in a lot of places basically.
**cons**: This will make the app offline don't work as even with the cache, because the cache will populate and the network then will actually give error

### Cache then network with offline support

To achieve this we need to make sure that our app shell is loaded first, and then we will parse only the new data into the app dynamically

- we cache the app shell right of the start
- we choose the url we want to get dynamic data from
- if the requested url contains the url we are looking for, then we'll give the cache then network strategy for this url
- everything else just comes from the cache
  sw.js

```javascript
self.addEventListener('fetch', event => {
  var specificURL = 'https://httpbin.org/get'

  if (event.request.url.indexOf(specificURL) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then(cache => {
        return fetch(event.request).then(res => {
          cache.put(event.request, res.clone())
          return res
        })
      })
    )
  } else {
    // code here of the Cache with network fallback
  }
})
```

### Cache strategies and routing
Basically here we are sending the offline page if the request is a page and not anything else, like assets, for that we have to, on the catch block add the pages of the app that we need to pass to
_sw.js_
```javascript
      .catch(function (err) {
          return caches.open(CACHE_STATIC_NAME)
              .then(function (cache) {
                //routing here
                  if (event.request.url.indexOf('/help')) {
                      return cache.match('/offline/')
                  }
              });
      });
```
OR
better improvement, we can check the headers to match all of the requests that are pages:
_sw.js_
```javascript
      .catch(function (err) {
          return caches.open(CACHE_STATIC_NAME)
              .then(function (cache) {
                //routing here
                  if (event.request.headers.get('accept').includes('text/html')) { // for html pages
                      return cache.match('/offline/')
                  } else if (event.request.headers.get('accept').includes('image/jpg')) { //for image jpgs
                    return cache.match('defaultImage.jpg')
                  }
              });
      });
```

### Applying everything together (with cache only)
For this to run smoothly, then we are basically giving the app shell directly if the url is in the appshell.

- check if the url is one of the urls that needs to be dynamic
  - if yes, give cache first, then give network when it is fetched //(cache then network)
- if no, check if the url is in the app shell
  - if yes, then give the cache directly to the page //(cache only)
- if no, (new url) then check if it exists in the cache
  - if it does exist in the cache, then give cache version of it
  - if it doesn't, then fetch and give it the fetched version
    - cache the fetched response url (for a next time) //(cache with network fallback)

```javascript
self.addEventListener('fetch', event => {
  //console.log('[SW] Fetching Service Worker', event);

  //CACHE THEN NETWORK FOR SPECIFIC URL
  var specificURL = 'https://httpbin.org/get'
  var staticAssets = [...listOfAppShell]

  if (event.request.url.indexOf(specificURL) > -1) {
    //CACHE ONLY
  } else if (
    new RegExp('\\b' + listOfAppShell.join('\\b|\\b') + '\\b').test( 
      //or } else if (isInArray(event.request.url), listOfAppShell) { function (below)
      event.request.url
    )
  ) {
    event.respondWith(caches.match(event.request))
  } else {
    //DYNAMIC CACHE WITH NETWORK FALLBACK
  }
})
// helper function
function isInArray(string, array) {
  for (let index = 0; index < array.length; index++) {
    if (array[index] === string) {
      return true;
    }
  }
  return false;
}
```

### IMPORTANT!⚠️ POST requests and cache API
One thing that does not work with cache API is that we can't store POST requests
This is important because it CAN cache POST request's response, but not the request itself, therefore, it will fail everytime.
(not yet, later it will be able to do this, but not for now)

### Cleaning cache (dynamic more)
Why do this ?
With the help of a helper function, we are able to trim the dynamic cache by limiting the number of items that we can have in the dynamic cache
_sw.js_
```javascript
// helper function
function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
          .then((cache) => {
              return cache.keys()
                        .then((keys) => {
                            if (keys.length > maxItems) {
                                cache.delete(keys[0])
                                    .then(trimCache(cacheName, maxItems));    //recursively
                            }
                        })
          })
}

// INSIDE THE FETCH INTERCEPT:
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then((cache) => {
                    return fetch(event.request)
                        .then((res) => {
                          // HERE! 
                            trimCache(CACHE_DYNAMIC_NAME, 3) //OPTIONAL!!! THIS IS FOR STOPING CACHE OVERLOADING
                            cache.put(event.request, res.clone());
                            return res
                        })
                })
        );
```

### get rid of a service worker
Why do this ?
 - First of all, the cache will also go with the service worker
 - It will stop running the intercept of the fetch requests

_app.js_
```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(function (registrations) {
            for (let index = 0; index < registrations.length; index++) {
                registrations[index].unregister();
            }
        })
}
```

# Caching Dynamic Content with IndexedDB
## Dynamic Caching vs Caching Dynamic Content
Dynamic caching is when you cache the response of an url when it does not exist still in the cache API
This is what we did so far.
__Dynamic Caching__:
 - (1) Page sends network request
 - (2) Service worker intercepts network request
 - (3) Service worker fetches from the network
 - (4) Service worker stores that request (and response) in the cache API
 - (4) Service worker then sends the response to the page 
(It just means that we cache new fetch requests dynamically)
When to use:
 - For assets, css, html, js and other files (also possible with IndexedDB)

__Caching Dynamic Content__:
 - (1) Page sends network request
 - (1) (Optional) If the content is already there in the IndexedDB, fetch it (CACHE THEN NETWORK STRATEGY)
 - (2) Service worker intercepts network request
 - (3) Service worker fetches from the network
 - (4) Service worker stores that request (and response) in the IndexedDB API
 - (4) Service worker then sends the response to the page 
IndexedDB (Key-Value Database) is mostly used when doing JSON formats and for Dynamic Content
__important__; The strategy is the same (CACHE THEN NETWORK), just that instead of using the Cache API we will use the IndexedDB API for storing Dynamic Content

### IndexedDB
A transational _Key-Value Database_ in the _Browser_.
Transational: Means that if one Action within a Transaction fails, none of the Actions of that Transation are applied
It is also capable of storing _significant amounts_ of _unstructured data_, including Files and Blobs
It can also be accessed asynchronously!
The local storage and session storage are different because they can only be accessed synchronously.
Possible to have multiple databases, but usually only 1 per application
Possible Multiple Object Stores (like tables)
Database => Object Store => Object
(Typically 1 DB/app) => (Like a table) => (What to store)

Service Workers don't care about the files loaded in the project (this means you can't use their code).
However, it is possible to import scripts into the service worker, by doing:
#### importing script into service worker
`importScripts('/src/js/idb.js')`

#### open a new database
```javascript
var dbPromise = idb.open('db-name', 1, function(db){ //this db gives us access to the database
  if (!db.objectStoreNames.contains('table-name')) {
    db.createObjectStore('table-name', {keyPayh: 'id'}) // we define an object that has our primary key
  }
})
```
#### save the fetched request to idb
```javascript
  event.respondWith(
    fetch(event.request)
      .then((res) => {
       // here instead of caching dynamically the cache, we can go for IndexedDB   
        var clonedRes = res.clone();
        clonedRes.json()
            .then(function(data){
              for (var key in data) {
                dbPromise
                    .then(function(db){
                      var tx = db.transaction('table-nome', 'readonly');
                      var store = tx.objectStore('table-name');
                      store.put(data[key]); // we must have the 'id' property inside the data[key]
                      return tx.complete;
                    })
              }
            })
        return res;
      })
  )
```

__important__: have in mind that, if we cache the indexedDB data, then if we change the dynamic data (fetch), we need to update the indexedDB to show the updated data.
We can either clear the whole DB and repopulate, or we can just delete 1 item from the indexedDB
_allData_
```javascript
function clearAll(st){
  return dbPromise
      .then(function(db){
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.clear(); // this will clear all
        return tx.complete;
      })
}
```
_justOne_
```javascript
function deleteItemFromData(st, id){
  return dbPromise
      .then(function(db){
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.delete(id); // this will delete by an id
        return tx.complete;
      })
      .then(function(){
        console.log('deleted item from idb:',id)
      })
}
```

### caching with indexedDB
It can be used for all of the caching strategies, replacing the caching instead of the fetch.
However, it's much better for json and dynamic stuff.


## responsive design
### media queries








# step by step

1. Add the service worker file in the directory you want to scope
2. Register the service worker in the index.html or in the app.js (one that gets called by all of the pages)

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    // no need, but better
    .then(() => {
      console.log('Registered Service Worker')
    })
    .catch(err => {
      console.log(err)
    })
}
```

3. Identify the App Shell
4. Cache the identified App Shell on the install event:
   - import the fonts
   - import the js and css frameworks if they exist
   - index.html
   - /

```javascript
self.addEventListener('install', event => {
  // very good for caching stuff
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function(cache) {
      console.log('[SW] Precaching App Shell...')
      //cache.add('/index.html'); // if only one
      cache.addAll(listOfAppShell) // '/src/something' as well as 'https://something'
    })
  )
  // caches.open will create the cache if it does not exist yet
  console.log('[SW] Installing Service Worker', event)
})
```

5. Intercept the fetch event in the service worker
6. Give back the cache if the request exists on the fetch event, if not, fetch it

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        // if there is no request it gives null
        return response
      } else {
        return fetch(event.request)
      }
    })
  )
})
```

7. Try to see if the app is offline
8. [optional] Setup dynamic caching in the `activate` event of the service worker

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          // basically return a Promisse that will resolve only if all of the promises inside were resolved (inputed as an array)
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            // here i will map and then delete the caches that are not the keys of the ones i want to keep
            // to have in mind that map will return null and the Promise will be resolved
            console.log('[SW] Removing old cache...', key)
            return caches.delete(key)
          }
        })
      )
    })
  )
  console.log('[SW] Activating Service Worker', event)
  return self.clients.claim()
})
```

9. [optional] Clean old caches (code in the above snippet)
10. Provide an offline page (like 404) but for when the resource is not cached yet (in the catch of the dynamic cache)

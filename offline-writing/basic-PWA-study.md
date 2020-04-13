# PWA study

Então, basicamente aqui vou ter de meter o que acho que é importante ver quando estou a fazer debugging ou a construir uma PWA

 - [helpful links for this exam](https://github.com/elharony/google-mobile-web-specialist-certification-guide)

##links for the stuff


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

# syncing offline
we need SyncManager to run, and now it is not available in a lot of places:
(can i use it)[https://developer.mozilla.org/fr/docs/Web/API/SyncManager]
### register a sync task
to register a sync task, in the _feed.js_ file, call the following
```javascript
// this will only register, it will not do anything else for now
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(function (sw) {
        // write data here (to IDB)
        // then register the sync event
        // then send successfull toast or something like that 
        sw.sync.register('sync-new-post'); //any name, its a tag
      })
      
  } else {
    //something here (normal functioning of the app)
    sendData() // to send data to the backend
  }
```
It has to be called in the feed.js because it should be where there is a submit or change data event and the serviceworker.js does not have access to the form activity/function
### get the data on the service worker


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









# dev tools
## css optimization
inpect element
### animations
CTRL+SHIFT+P » animations
CTRL+SHIFT+P » paint » enable paint brushing para ver a parte das animações

### dark theme
ctrl+shift+p » dark theme

### contrast ratio
open devtools, css elements
click on the color color thing, then it will display the contrast ratio. and then there will be 2 lines, it should have a bigger color ratio

### copy styles from other site
so, i can inspect the element i want (button/something), and them right click, copy, copy styles
then, go to my website, inspect my element, then select the css of the element, and then paste, and the style will be copied

### screenshot
ctrl+shift+p » screenshot
ctrl+shift+p » area (for area screenshot)
ctrl+shift+p » node (for node screenshot)

### debugging with the sources panel
debugger; written in the code
right click on breakpoint, add console point to log the thing i want to log

#### dom mutation breakpoints
right click on element, break on, attribute modifications

#### event listener breakpoints
bottom part of sources panel there are the event listeners
enable click on event listener
it will stop everytime there is a event listener that 


## site optimization

### first of all, audit the site
go to audit and run it
settings: mobile, only performance checkbox, simulated fast 3g, and clear storage
### make 1 change at each time, and then run the audit to see the difference
example,
1. enable resize of the resources:
 - in the network tab, if enlarged a bit, the top number is the compressed file's size, and the bottom is the non compressed. if equal, compression is not happening
   - just try to enable compression in the web server
2. image optimization (see below)
3. render blocking
  - the audit page already gives us the resources that are render blocking
  - type ctrl+shift+p » show coverage » reload page » coverage file will show how much is unused. click the file and the devtools will show which lines of code were run and not. on red are the non run, in green are the run lines.
    - ctrl+shift+p » show request blocking » add pattern » /libs/* » add » reload page
      - the resources in red were not used
4. main thread work
  - open the performance tab » settings » network: fast 3g » CPU: 4x slowdown
  - click reload and it will start recording
    - main
    - check in your code where are the problems

### image optimization
there are some ways of optimizing images:
 - resize during build process
 - create multiple sizes and then use the `srcset` attribute (not difficult)
 - use image cdn
 - optimize each image (important)

## optimization first paint
### optimization of html and dom
inline the css
media queries to make first paint faster

#### first paint faster
inline the css
use media queries for the css if not inlined
defer the js scripts
#### faster load time
set the js to async if possible, this will prevent parsing blocking

#### css and the cssom
By default, CSS is treated as a render blocking resource.
Media types and media queries allow us to mark some CSS resources as non-render blocking.
The browser downloads all CSS resources, regardless of blocking or non-blocking behavior.
__CSS is a render blocking resource. Get it to the client as soon and as quickly as possible to optimize the time to first render.__

#### javascript and the dom (optimization)
The location of the script in the document is significant.
When the browser encounters a script tag, DOM construction pauses until the script finishes executing.
JavaScript can query and modify the DOM and the CSSOM.
JavaScript execution pauses until the CSSOM is ready.
[link sobre isto importante](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/adding-interactivity-with-javascript#parser-blocking-vs-asynchronous-javascript)

### defer and async
defer will load the script once the onload event is fired from the page
so, first it will be rendered, loaded and only then the script will be called
async 
__the async tag in an inline script is not possible!__
the inline scripts will always block on the cssom model. So, to do this, it is better to put inline scripts above the css!

the best ideia in my opinion is to make all js asynchronous, and then non blocking

### optimize most important (3 buckets)
 - minimize, compress, cache
   **apply to:** HTML, CSS and Javascript
 - minimize use of render blocking resources 
   **apply to:** CSS
   **strategies:**
     1. use @media queries on <link> to unblock rendering
     2. inline CSS
 - minimize use of parser blocking resources
   **apply to:** Javascript
   **strategies:**
     1. defer Javascript execution
     2. use async attribute on <script>
this will all come down to this:
1. minimize number of bytes
2. reduce number of critical resources
3. shorten the crp (critical rendering path) length

preload scanner is set by the browser to help on loading the js files that were supposed to block the parsing.


## optimization 60fps
60fps = 60Hz = 60 times a browser refreshes the screen
1s = 1000ms. 1000/60 ~= 16ms to get everything done to guarantee a good user interaction.
however, as the browser also needs time, it's more like 10-12ms that we have to get everything done for the frame to get on time.

### make a frame
parse html » parse the dom/ construct the dom
recalculate styles » combine the dom and the css
render tree » the resulting combination of the recalculate styles
layout » from the render tree (nodes) to the layout of the page
vector to raster » what we have initially is a vector, but we have then to transform them into the available pixels
paint » when the first paint is done, so, when the page is first rendered
(image decode+resize) » we give the image as a jpeg but it has to render it, either responsive or not, into a bitmap, and then show it (maybe resize it as well)
(composite layers) » this means that the browser can separate some components into different layers, like z = 1 or z = 10

javascript (or css animations/or web animations api) » style » layout » paint » composite
example:
css flexbox does not change styles on page resizing, but changes layout, paint and composite.
To see which css properties trigger what, here is [csstriggers.com](https://csstriggers.com).
Its important to get CSS that does not use a lot of resources


#### layout
the layout scope is always the same and is always the whole document.
the layout process is very complicated, and it's best to assume that the whole dom is always in scope.

Important to get just what goes into the render tree
__only visible elements are on the render tree__

### RAIL
response, animations, idle and load
should be: liar, load, idle, animations, response

load: objective = load in 1 second
once it's loaded, it becomes idle, waiting for a user to interact » it should be here we take advantage of the stuff we deffered, to process the heavy load
how to take advantage of idle time: load resources the user may use later. as images, videos or comments.
response » 100ms
animations » 16ms (with browser overhead it comes down to 10-12ms)
idle blocks » 50ms
load » 1000ms (1s)

everything should run at 60fps if it is interactible.
during load stage, you have around 1000ms to render the page before the app no longer feels responsive, and the users attention level falls
download and render your critical resources here.
after loading, the app is idle, and this is a time to do non-essential work to ensure that whatever interactions occur after this period will feel instantaneous.
the apps idle time should be broken into 50ms chunks so that i can stop when the user starts interacting.
during the animation stage, such as when users are scrolling or animations are occuring, you have 16ms to render a frame. This is when 60fps is critical
lastly there's the response period. the human mind has about 100ms grace period before an interaction with a site feels laggy and junky. That means the app needs to respond to user input in some way within 100ms.


#### basic setup for testing
quit all of the other apps
go incognito
focus on _cause_ of bottlenecks, not symptoms 
measure first, then optimize

### js optimization
mostly 2 stuff:
 - requestAnimationFrame instead of the setInterval
 - web workers for processing stuff
 
the v8 will change your code to make it faster. so small stuff like micro optimization will not help. there are other stuff to take into account that are much more important.
in order to optimize js, we should try to run the js as soon as possible in animations because it can lead to style calculations, layout, paint and compositing changes.
good to look at JS profiler
ctrl+shift+p » show js profiler

#### requestAnimationFrame (animations)
requestAnimationFrame = go to tool to build animations
schedules the javascript to run at the earliest possible moment in each frame.
it is better than setInterval and setTimeout
example:
```javascript
function animate(){
  // do something cool here
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```
it looks like recursive, but the browser will know what to use and when
So, to implement this, just CTRL+f to "setInterval" or "setTimeout" and replace by requestAnimationFrame.
__IMPORTANT!__ the function itself must also call requestAnimationFrame, so in the end of the function that called it (the one inside setInterval), we can search for it with ctrl+f as well.

#### web workers
important to take stuff out of the main thread
//++ example of web worker here
[Web Workers Demo Repo](https://github.com/udacity/web-workers-demo)

### garbage collectors
javascript has garbage collectors
it can be seen in the memory tab and looking for GC

### styles and layouts

changing the styles and layouts cost will grow linearly on the elements changed
__class selector is one of the fastest selector matches__
the more complex the selector, the more work the browser needs to do

__function to use .forEach in the DOM nodes:__
```javascript
function getDomNodeArray(selector) {
  // get the elements as a DOM collection
  var elemCollection = document.querySelectorAll(selector);

  // coerce the DOM collection into an array
  var elemArray = Array.prototype.slice.apply(elemCollection);

  return elemArray;
};
var divs = getDomNodeArray('div');
```

#### forced synchronous layout
that's when you put the layout before the js, so it has to reconstruct everything again, causing performance issues
to stop SFL, you should read layout properties first, and then batch style changes. not read once for each element.
example code:

```javascript
//read first, then batch change
if (divs[0].offsetHeight 500 ) { // in the example it was elem, but it does not exist inside the batch
  divs.forEach(function(elem, index, arr){
    elem.style.maxHeight = "100vh";
  }
})
```

__paint is super expensive, especially in mobile__
__during animations, we want to avoid layout and paint at all costs__, just because they are expensive for the time we have available

### painting and compositing

important setup, because painting is one of the major performance killers
ctrl+shift+p » show paint flashing rectangles
in green will be what is being painted by the browser
to see this, we can enable the paint profiler. To do that, go to 
performance » record » click paint » new tab paint profiler will show up

#### layering
This is a techique that will reduce the painting
and is implemented if I have a nav bar, showing a slider from the side.
if i click in the nav button, instead of always painting, if in a new layer shows up the nav slider, i won't need to paint again.
__layer tree__ » when Blink (chrome's layer thing) calculates what elements should be in each layer
__composite layers__ » the result of that, when the vectors are transformed into the pixels
The more layers there are, the more time will be spent in updating the layer tree and compositing layers
So, when reducing the paint time on doing layers, it can have a downside as the layer management time can be reduced.
Usually, we should let the browser manage layers, because he knows what he's doing.
create layers:
to create layers, we can do the following in CSS
```css
.circle{
  transform: translateZ(0);
  will-change: transform;
}
```
__see layers__: ctrl+shift+p » show layers


## responsive design
to get the chrome dev tools, there is a cool thing in the responsive design that is the mobile view.
then, click in the 3 dots in the right top corner of the view itself and set the DPR (density pixel rate), rulers, mobile type and media queries

### viewport 
DIPs vs Pixels:
Device Independent Pixels : 800px
Hardware Pixels : 1600px
if the DIP is 2, it means that for each 2 pixels in the hardware, there is a DIP
example:
A mobile screen has a resolution of 1920 x 1080 px with a device pixel ratio of 2. What is the maximum width of a viewport in landscape mode measured in CSS pixels? 960!
Even if the whole screen is larger than the browser, the viewport is only about the browser's width (not the whole screen) -- so it's still just 800 pixels.
default if not set the viewport is 980px
#### setting the viewport
```html
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
```
width=device-width » means to match the screen's width in DIP
initial-scale=1.0 » forces the browser to establish a 1:1 relation between DIPs and CSS pixels.

#### image overflow
he recommends a max-width for img, embed, object and video:
```css
img, embed, object, video {
  max-width: 100%;
}
```
just to be safe
examples:
```css
<img id="owl">
#owl {
  width: 640px;
  max-width: 100%;
}
```
max-width actually overrides the width, which means that the image will be kept contained within its container.
```css
<img class="logo">
.logo {
  width: 125px;
}
```
__important:__ 125 pixels is pretty much smaller than any device, so this one will actually work well and be responsive.
__Usually the minimum acceptable is 320px__

### tap targets
inputs, buttons, and stuff for the fingers.
fingers are usually 10mm wide.
so minimum should be 48px height and width
also, there should be 40px between elements so that a person does not click 2 things at the same time
code to apply:
```css
nav a, button {
  height: 1.5em;
  min-width: 48px;
  min-height: 48px;
}
```
Tap targets should be bigger than the average finger. So, to ensure that all of your elements are at least that size, add min-height: 48px; and min-width: 48px; to every tappable element.
__important__: we should get a relative height and width, because it should be relative, just when it gets small, we should have a small cap.

__we should develop first for small screens, and only then get bigger__

usually, performance also helps when going from small to large.

## responsive design patterns

### media queries
 - first way: embed as an attribute in the stylesheet attributes in the html:
__an important thing about media queries is that only the media queries will be downloaded on the first paint, as they have the media attribute with them__
example code implementation:
```html
<link rel="stylesheet" media="screen and (min-width:500px)" href="over500.css">
```
__just stick with screen and print!!!__ (print for printers, if they will want to print the page)

 - second way: add the media queries to the css.
example snippet:
```css
@media screen and (min-width: 500px) {
  body { background-color: green; }
}
```
 __important!!__: as in for performance reasons, we want to AVOID the `@import` tag inside the css sheet. It's very expensive and performance matters.

we have to weight between the 2 options.
 - linked CSS
   - pros: only 1 file will be downloaded for each viewport
   - cons: many small http requests as there are many files
 - @media
   - pros: only 1 file with the different viewports
   - cons: few big http requests

most common media queries are `min-width` and `max-width`.
for `max-width=500px`, the media query will be applied when the width is below 500px
opposite for the `min-width`.

`min-width` and `min-device-width` = 500px
 - `min-width` » when the browser width is 500px
 - `min-device-width` » when the device width is 500px - __better not to use this one!__

#### breakpoints
we should define the breakpoints by our content
to do this, the best way might be to start small and then widen the screen.

__overlapping media queries__
```css
@media and (max-width: 400px) {
  /* styles */
}
@media and (min-width: 301px) and (max-width: 600px) {
  /* styles */
}
```

#### grid fluid system
example in the container, or wrapper:
```css
.wrapper {
  display: grid;
}
```
[grid system link](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout)
#### flexbox
flexbox is good for responsive layouts.
to apply flexbox, here is how:
```css
.container {
  display: flex;
}
```
this means that everything inside it will be in rows, because the default flex direction is row.
 [flexbox system link](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox)
if there is nothing more, the flex will shrink to always be the width of the viewport. 
to wrap them, just go for:
```css
.container {
  display: flex;
  flex-wrap: wrap;
}
```
change the order of the flexbox attribute:
```css
@media screen and (min-width: 700px) {
  .dark-blue { order: 1; width: 20%;}
  .blue { order: 2; width: 60%; }
  .light-blue { order: 3; width: 20%; }
}
```

### responsive patterns:
 - mostly fluid
 - column drop
 - layout shifter
 - off canvas
 some sites might use combinations of both

we'll go into details for each one of them: [link for responsive patterns](https://developers.google.com/web/fundamentals/design-and-ux/responsive/patterns)

#### column drop
 - phone : 3 rows
 - tablet : 2 rows on top, 1 column below
 - desktop : 3 columns in a row
__implementation:__
html:
```html
<div class="container">
  <div class="box dark-blue"></div>
  <div class="box blue"></div>
  <div class="box light-blue"></div>
</div>
```
css:
```css
.container {
  display: flex;
  flex-wrap: wrap;
}
.box {
  width: 100%;
}
```
first breakpoint:
```css
@media screen and (min-width: 450px) {
  .dark-blue{
    width: 25%;
  }
  .blue{
    width: 75%;
  }
}
```
second breakpoint:
```css
@media screen and (min-width: 550px) {
  .dark-blue, .light-blue {
    width: 25%;
  }
  .blue{
    width: 75%;
  }
}
```

#### mostly fluid
Very similar to the column drop, but in the end, white spaces are added when the user tries to enlargen the screen
layout:
 - phone : 3 rows
 - tablet : 2 rows on top, 1 column below
 - desktop : 3 columns in a row
 - wider desktop: 3 columns in a row, with white spaces in each side of the screen
__implementation:__
html:
```html
<div class="container">
  <div class="box dark-blue"></div>
  <div class="box blue"></div>
  <div class="box light-blue"></div>
  <div class="box green"></div>
  <div class="box red"></div>
</div>
```
css:
```css
.container {
  display: flex;
  flex-wrap: wrap;
}
.box {
  width: 100%;
}
```
first breakpoint:
```css
@media screen and (min-width: 450px) {
  .blue, .light-blue{
    width: 50%;
  }
}
```
second breakpoint:
```css
@media screen and (min-width: 550px) {
  .dark-blue, .blue {
    width: 50%;
  }
  .light-blue, .green, .red{
    width: 33%;
  }
}
```
third breakpoint:
```css
@media screen and (min-width: 700px) {
  .container {
    width: 700px;
    margin-left: auto;
    margin-right: auto;
  }
}
```

#### layout shifter
it's the most responsive one of all because it shifts between layouts, trying to be the most responsive
__an important here is the *order* attribute__

#### of canvas








## responsive images course
images consume a lot of bandwith, around 62% of the size of the website:
check natural width of an image:
select the image in the dev-tools element panel
$0.naturalWidth
total bits = pixels * bits per pixel
so, 
less pixels * better compression = less bytes

#### important things to take into account
max-width:100% is our friend
calc is our friend as well if we want to get 2 pictures side to side:
width: calc((100% - 10px) / 2); and
margin-right:10px;
on the first image
__Note on CALC__: There MUST be a space on each side of the + and - operators. (A space is not required around * and / as the problem is an ambiguity around negation.) For example: calc(100px - 10%) will work. calc(100px-10%) will not.
__take into account that viewport width will not stay the same (as with orientation resize)__
vh and vw = viewport width and viewport height
100vh = 100% viewport height, so if we resize, it will be variable
vmin = 1% of the smallest of the viewport width or height (whichever is smaller)
also the same for the vmax

#### raster and vector
__raster__ are made out of squares, grids, pixels
__vector__ are made of vectors. example types: svg
the advantage between vector and raster is that vector can be resized to any size
file types if possible to use:
__raster__: jpeg if possible, and if possible, webp
__vector__: svg if possible, and if not png

__The page should be below 1,5MB total!__

#### Text on top of images
it's better to have pure css instead of images for text and stuff like that.
even animations are better in css than gifs and images.
also it's possible to make a background thing
__try to get the emojis instead of images!__
to try to set smaller images, svgs and data images are good. data images are base64
__data images reduces http requests__

#### srcset
img srcset="img1.jpg 500w, img2.jpg 1000w, img3.jpg 1500w"
also
img srcset="imgsmall.jpg 2x, imglarge.jpg 1x"
sizes="(max-width: 250px), 100vw, 50vw"
[link for an article about srcset](https://ericportis.com/posts/2014/srcset-sizes/)

//++ check what is 1x and 2x! for srcset


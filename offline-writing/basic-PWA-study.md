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

#### Cache with network fallback

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
//++Next todo



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

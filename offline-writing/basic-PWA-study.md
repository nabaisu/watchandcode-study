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

## service workers
Só se mudar um byte no service worker é que ele vai detectar que há qualquer coisa de novo na instalação, o que isso quer dizer é que o momento de instalar um service worker é bom para fazer um update na cache ?


## caching
Para fazer caching, é preciso abrir a cache:
`caches.open();`, caso ainda não haja nenhuma cache então ao chamar isto ele cria automaticamente para nós.
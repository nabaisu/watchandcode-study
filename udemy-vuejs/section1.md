# My Vue study Guide:

## Data
### basic data showing:
if you want to display it, just place `{{ ola }}` into the html
must be in the data property
no need for the this.ola. just `{{ola}}`

### basic data show in html property:
needs to bind, otherwise it does not work
just add `<a v-bind:href="link"` and then show in data: `data: { link: "ola" }`
does not need the curly brackets, just the name of the data property

### basic html data rendering input:
if you put `data: { link: "<a href="#">ola.pt</a>" }` then it will show as text if you put {{link}} in the text.
Needs to be:
`<p v-html="link">`
note: ensure that it does not allow xss attacks

## events
### click on something
v-on on the property: `<a v-on:click="increase">` and then in the data: `methods: { increase : function() {this.counter++}}`
### mouse events
same as above, but change after the colon: `<a v-on:mousemove="increase">` 
### arguments in the js part
`<a v-on:click="increase(2)">` and then in function:
`methods: { increase : function(step) {this.counter += step}}`
### pass event variable
`<a v-on:click="increase(2, __$event__)">` . this means that the event can be passed by the v-on property.
then in the function: `methods: { increase : function(step, event) {this.counter += step}}`
### how to stop event propagation
create a function and pass the stopPropagation method:
 - `<a v-on:mousemove="dummy">` and in function: `methods: { dummy : function(event) {event.stopPropagation()}}`, __OR__
 - `<a v-on:mousemove.stop="">` (much easier)
### chain events like the one above
 - `<a v-on:mousemove.stop.prevent="">`
### ou mais um tipo de eventos:
 - `<input v-on:keyup.enter.space="alert('bom dia')">`
## importante
you can write javascript in the property thing or inside the brackets if it's a one liner:
`<p v-on:click="__counter++__"> and here {{__counter *2 > 10 ? "maior q 10" : "menor que 10"__}}</p>`
### 2 way binding
`<input type="type" v-model="name">` and the data: `data: {name: "max"}`.
This is possible to see if a `<p>{{name}}</p>` is present.

## Directives:
 - v-bind: (or :) => from data to html (renders properties with data values)
 - v-on:  (or @)	=> from html to data (listens to events)
 - v-model:		=> 2 way data binding, if one changes, the other changes as well


# Cenas importantes
a data property não é reactiva, ou seja, se eu tiver `data: {counter: 0, result: counter > 5 ? "oi" : "io"}` e um botão que adiciona o counter, ele não vai actualizar o result, vai só adicionar o counter. Isto porque ele não é reactivo.
Basicamente eu tenho de fazer o teste

computed é usado para quando eu quero uma data property reactiva. e só é corrida quando é utilizada. isto significa que a computed property é corrida só uma vez e não quando não é precisa, ou seja, se eu tiver um counter e um secondCounter, então a secondCounter não é corrida quando eu modifico o secondCounter.
Outra coisa também é que o computed é sincrono, ou seja, ele não é corrido asincronizadamente.

o watch é corrido sempre que a propriedade muda, por isso podemos meter assincronous tasks para que ele corra, por exemplo, meter um timer para voltar a 0.

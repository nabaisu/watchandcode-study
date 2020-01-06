## conditionals
### v-if / v-else
this is going to completely not render the HTML of the element it is in.
the `v-if` is going to completely remove or show the element if the condition to which he is attached is true:
We can do this by using: `<p v-if="amigo">` and then then in the data object (or in a computed/watch object) set: `amigo: false`. __It will completely remove all nested elements and not only that element itself__, this means that if we have the `v-if` inside a div and then 2 paragraphs inside the div, the 2 paragraphs are not going to render.
The `v-else` is going to directly give the element to show if the `v-if` condition is false. Same principles apply as in the `v-if`.
Also there is after version v2.1 the option to use `v-if-else`.

The template tag (which is not going to be rendered by the browser), can be the element to add the `v-if`.

### v-show

if the goal is to just hide the element, then the `v-show` is able to do this task.
`v-show` will only add `style="display:none;"`.
Only use when needed.

## Lists
### v-for
If the goal is to loop between data. This is possible with v-for directive.
for that we can use the following: 
 - array of elements: `<li v-for="amigo in amigos"> {{amigo}}</li>` and then in the data object return `amigos: [1,2,3,4,5]`
 - array of objects: `<li v-for="amigo in amigos"> {{amigo.name}}</li>` and then in the data object return `amigos: [{'name':'john', 'age':12}, {'name':'mary','age':26}]`
 - objects: `<li v-for="(value, key) in amigos"> {{key}} - {{value}}</li>` and then in the data object return `amigos: {'name':'john', 'age':12}`. Note that it is important for the *value* and *key* to be in that exact order, the names can be anything, not *value* or *key*. Also for this it is possible to add `v-for="(v, k, index)"` to have the index of the properties already looped.

To get the index of the element, it is possible by adding an input to the array we want to loop:
`<li v-for="(amigo, i) in amigos">{{i}} - {{amigo}} </li>`

To output a list of numbers, it is easy to do by doing `v-for="n in 10"` and then `{{n}}` to get the first 10 numbers.

for the `v-for` element, there is a very important thing when adding new elements to the arrays dynamically. This is because the `Array.push` method does not create a copy of the array but changes the array itself. So in order to pass the element to Vue, the `v-bind:key=""` should be in place. An example is the following:
`<li v-for="(ingredient, index) in amigos" __:key="ingredient"__> {{index}} - {{ingredient}}</li>`.
__this will not change the code visually in the first place but in the background does important job__.




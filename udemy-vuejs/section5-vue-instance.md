# vue instance

The vue instance is more or less like a middle men between the dom and our code.

## How to have more than 1 instance at the same time
just do the same as you would do to create another vue instance but just change the element selector in the `el` property: `el: #app`
Also if you want to access the data of the other instance it's not enough to just try to access `this.something` because the `this.` is only available to your current instance.
There is no connection between instances.

## How to access vue instance from the outside
if you name your vue instance, then you can access the properties from the other instance: `var vm1 = new Vue({el:#app, data:{ count: 3 }})`. You can then access the `count` property by simply doing (anywhere): `vm1.title = 5;`

__It is possible to make data integration as widgets and stuff like that from just one vue instance.__

__Note__: important to check that vue directly proxies the data variables to the *vm1* javascript object.
It is possible to create a new property from the outside but then it's not possible to access the property from the vue instance because behind the scenes the vue instance creates a watch for each property to know when they changed or not.

## elements

### el
It refers to out template, the native html element in the code.

### refs
This is a property by vue. It's not a native html property, as seen here: `<p ref="myParagrah">bom dia</p>`. Important to notice it's not a directive, it's without the v-bind.
Then it can be accessible from the vue instance JS: `console.log(this.$refs.myParagrah)`. This after gets the html element of the element. Then things like: `this.$refs.myParagrah.innerText = "até logo";`
It's possible to access the `$refs` property from outside by simply calling the vue instance and then $refs: `vm1.$refs.myParagraph`.
**important**: the refs property might be useful to access values from outside of the component.

### $mount and template
The `$mount` means that we can forget the `el` element and just mount the element we are looking for by mounting it.
An example of that is if we just initialize our vue instance (and look that it is assigned to a variable) and then call it later in the code:
`var vm1 = new Vue({data:{title: 'friend'}});` and then later do it like this to attach it to the html selector: `vm1.$mount('#app1')`.


It is also possible to add the template instead of the `el` element. This is important to rememeber because we can simply build the template html from a string, like this:
`var vm2 = new Vue({template: '<h1>Bom dia</h1>'});`
Then to mount the template we just need to add `vm2.$mount('#app1')`. Also it can automatically render the `vm2` like this: `vm2.$mount()` and then append the child to it, like the following: `document.getElementById('#app1').appendChild(vm2.$el);`, note that this is vanillaJS. This means that the instance is rendered off-screen and then is accessible from anywhere.

**note**: it's important to check that the template is a bit limited. The limitations are, if you try to, say, set all of the `hello` tags to the template, like:
`var vm1 = new Vue({el: 'hello', template: '<h1>Hello!</h1>'})` and then on the code add `<hello></hello> <hello></hello> <hello></hello>`. It will only render the first `hello` element. Same if the `el` element is set to the `.hello` selector and then we create 3 `<div class="hello"></div>`. The result will be that only the first element will be rendered.
To be able to reuse the tags it must be set as a component. It will input the name of the tag as first argument and a JS object as the second argument, as `Vue.component('hello', {template: '<h1>Hello!</h1>'})`. This will render all of the `<hello></hello>` that are inputed after.
The second limitation is that the inline template is a string, so multiline and html input will be more difficult to implement, such as syntax highlightning.

**note**: there is another important aspect to JS, as there are 2 versions of it, the pre-compiled one and the compiled version.
This is important because the pre-compiled version goes directly to the dom as is, and the not compiled version will be compiled by the dom, to which then it will face the dom limitiations, if they exist. (this is my understanding of the sentence the professor said, I didn't check to see if this is actually what happens as my compiler knowledge is a bit limited yet).


**note**: it is also possible to declare the data variable before and outside the vue instance and then set the vue instance data to the variable created before:
`var amigo = {name: 'john', age: 21};` and then `new Vue({el: #app, data: amigo})` 

## important:
Try not to mix the codes and interactions between the JS codes (DOM or other parts of the code and the Vue instance).
This is important to understand because it's possible to mess up code by multiple interaction with it.

# vue lifecycle
Important is to understand how it detects that changes occurred in the dom and how it updates the changes accordingly. It actually updates the html changes by javascript.

### virtual dom
a virtual dom is created to make it able to change only the data that has changed
|-----------|       |-----------|       |-----------|
|           |       |           |       |           |
|-----------|       |-----------|       |-----------|
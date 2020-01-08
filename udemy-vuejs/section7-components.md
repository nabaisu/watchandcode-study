# Vuejs Components

First of all, whenever we have this:
```html
<div class="app"></div>
<div class="app"></div> // notice here the second
<script>
new Vue({
    el: '.app',
    data: {
        status: 'something'
    },
    template: '<p>Here is {{status}}<p>'
});
</script>
```
The DOM will only render the first element, as we are initiating a vue instance and not a component. It will look for the first only html element and then render it with the vue js instance.

To repeat it, we have to initiate a component and assign it to it. So we can basically add on top of the `<script>` tag the component initialization. It inputs as the first argument: the tag name to use throughout the project and a js object with the data, as:
```html
<div id="app"><!-- where the vue instance is initialized, everything inside is going to be handled by vuejs -->
    <my-cmp><my-cmp>
</div>
<script>
//important to notice that the component must be inside the Vue instance, which is declared in the div inside the '#app' element
Vue.component('my-cmp', {   // notice the name here of the component
    data: function() {      // the data is a function that returns a javascript object with the data
        return {
            status: 'something'
        }
    },
    template: '<p>Here is {{status}}<p>'    // this is what is going to be rendered in the html by the '<my-cmp>' tag
});
// here there is to notice that the app element is the div
new Vue({
    el: '#app',
});
</script>
```

**note**: Its important to realize that, even with more than 1 component in the same page, each component is a separate vue component, which means that the `this` variable is part of that same component. 

### register components locally and globally
to register a component globally, then we can use the `Vue.component(NameAsFirstArgument,{componentObjectHere})` and then just set the component inside the vue instance we want. This is the example we can see above. even if we create a new vue instance `#app2` and we then insert the `<my-cmp>` tag inside, then it would work well.
to register components locally, inside of the vue instance we may need to set the component property as:
```javascript
var cmp = {     //basically this is a JS object with all of the properties a component would have 
    data: function(){
        return { thedatahere: 'something'}
    }, 
    template: '<h1 @click="amethod">{{thedatahere}}</h1>',
    methods: {amethod: function(){this.thedatahere = 'another thing'}}
}  
new Vue({
    el: '#app',
    components:{    //adding a component locally, only this vuejs instance have the component.
        'my-cmp': cmp
    }
});
```

## root component .vue file
Each .vue file is composed of the following:
```html
<template> <!-- this will have the template html to render, like in the above code, but it's just not a string but plain html --> 
<!-- this must be only 1 element, no problem if nested, but one element only --> 
<template>    

<script>
    export default {
        //if set to default, when importing we can name it anything we want, see below for more information
    }
</script>       <!-- this contains the javascript for this component and vue instance -->
<style></style>         <!-- (optional) this tag here contains the css necessary for this particular component -->
```

## creating and using a component
let's get this simple component example:
```html
<template>
    <div> <!-- only one element, even if it have no class inside -->
        <p>user name: {{name}}</p>
        <hr>
        <button @click="changeName">change name</button>
    </div>
<template>
<script>
    export default {
       data: function(){
           return {
               name: 'john';
           }
       },
       methods: {
           changeName: function(){
               this.name = 'mary';
           }
       }
    }
</script>
```

If we want to use our component, we can either register the component globally, or locally.
 - globally:
 |   in the main js file we can do: `Vue.component('nameComponent', Name)`. Here the `Name` JS object is needed to import from the component file. to do that we need to, on the top of the js file add: `import Name from './Name.vue'`.
 
 - locally:
 This is also known as: (the big heading below)
### Access a component from another component:
This means we have the `Home.vue` and the `Name.vue` files. The `Home.vue` file will want to display the `Names.vue` component, as many times as required.
To do this, the `Home.vue` must have 2 important things:
 - in the script tag, it must import the component from its `.vue` file, same as above on the globally example.
 - in the `export default {}` js object, it must have a property called `components: {}` The components property must have:
   - as a key value, the name of the component that we are looking to display (as html tag).
   - the javascript object that we imported.
An example of a `Home.vue` file structure can be seen below:
```html
<template>
    <div> <!-- for precaution it may be better to wrap everything in a div as we can have only 1 element -->
        <app-name></app-name> <!-- the name of the component below in the name of the component. must be imported first -->
    </div>
<template>
<script>
    import AppName from './Name.vue';  //the name imported is not important if it is exported as default in the Name.vue component
    export default {
       components: {'app-name': AppName} //the first is the name of the html tag to export and the value is the JS object we just imported
       }
    }
</script>
```
The `Name.vue` file have the same structure as any other normal component in the application.

**Note:** it is possible with ES6 to instead of having `app-name` to have `appName`. and this is without quotes, which means that you can either use `components: {'app-name': AppName}` or `components: {appName: AppName}` check that I removed the quotes. That is important to understand. Also it is possible to put the html tags after as `<appName></appName>`. However, it is better to keep the hiphenated version. And even more, you can also type `components: {appName}` and ES6 will assign the same value as `appName` to the key. _this last case is good to avoid_.

## css and components
The style sheet of the single file applications (components) will be set globally. that means that all of the styles of the components will be joined into a global stylesheet.
in order for this not to happen, (set them automatically globally). then the `script` tag must be assigned to `scoped`, resulting in this: `<style scoped> .somecsshere{} </style>`

each css component will be assigned to a data property data-v-0000000 and the CSS of that component then will be connected to that data attribute. To see this in action it is possible to check in the `<head>` section the number of stylesheets there are. And the stylesheets then will be connected to the data-v-0000000 html selector.

### other notes
**note**: The data property must be a function that returns a javascript object with the data, in order to not interfere with the main vue js instance data.

**note**: the components naming is important because we are actually creating html tags out of our components. So it may be important to prefix the component with either the application name, the main component name (as with inheritance) or any other non-trivial string so it does not interfere with the original html tags.
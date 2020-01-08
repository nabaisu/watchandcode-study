# Communication between components

## parent => child communication
communication problems
If i have a parent with 2 components imported, and try to change some properties in the child datas (ex: button to change data)
Ex: 
 - parent
   - import child components
   - have data property: `name`
   - have method to change the `name` variable
   - do not have the `name` variable in the parent, because:
   - want to display the `name` variable in the child.

This is not possible to do if we don't assign something called:
**`props`**

The props property of the component means that they will recieve data from the above, from outside.
Props is an array of strings, being each string a property we can set from the outside.
The props needs to be the same we are accessing in our template (if in the child we have `{{name}}`, we need to set `props: ['name']`).
This is just in order to access it, because in order to send it, we need, in the parent, to send `<child-component-tag __v-bind:name="name"__></child-component-tag>`.
The first `:name` property needs to be the same as the one imported in the child props. However, the following one `name` needs to be the one of the variable in the parent.

### Accessing props
We can access props from the methods variable like any normal data property.
consider the following code:
```html
<template>
<div> <!-- just to be a one element only inside the template (required) -->
    <p>User Name: {{ reverseName() }}</p>
<div>
<template>
<script>
export default {
    props: ['myName'], //this is imported from the parent component
    methods: {
        switchName() {
            return this.myName.split("").reverse().join("");
        }
    }       
}
</script>
``` 
This code will reverse the string passed by the parent name, send as `<child-component-tag :myName="name"></child-component-tag>`.

### validating props when passing:
The props are possible to validate.
To validate them instead of an array, they should be set as an object where the key type is the name of the props and the value are the available types for props validation.
The value may be a string or an array with the possible values. The examples below are available:
 - `props: {myName: String}`
 - `props: {myName: [String, Array]}`
 - `props: {myName: [Boolean, Number] , required: true}`. The required means that the component may only be used when the `myName` is provided.
 - `props: {myName: [Object] , default: '{john}'}`. The default will overwrite the required as it will always be passed, even if it is with a default value.

## child => parent communication

If I want to change a data property from the child to the parent, then we need to emit a custom event. To do this we must use the `emit.$emit('nameWasReset', this.myName)`.
In the parent component then we need to listen to that event. To do so we can add the event `v-on` or its shortcut `@` to listen to that event, in this case `nameWasReset`, then we can set the variable that we passed in the child to the parent by passing the name of the variable followed by the `$event` property, that will represent what we pass in the child. An example of this is the following: `<child-component-tag :myName="name" @nameWasReset="name = $event"></child-component-tag>`.
So, to resume:
 - an example of the code in the **child component** would be:
```html
<template>
<div> <!-- just to be a one element only inside the template (required) -->
    <p>User Name: {{ reverseName() }}</p> <!-- this will run the function reverseName() in the methods property of the vuejs instance -->
    <button @click="resetName">Reset Name</button>
<div>
<template>
<script>
export default {
    props: ['myName'], //this is the information imported from the parent component, as an attribute (see below) the connection
    methods: {
        switchName() {  // this just reverses a string, not much more
            return this.myName.split("").reverse().join("");    //notice the myName is accessible like a normal data variable
        },
        resetName() {    // this function will run when the button is clicked (notice the button is in the child)
            this.myName = 'mary'; //this is to try to reset so it should be john, but it's just to show that we can pass it then
            this.$emit('nameWasReset', this.myName);
        }
    }       
}
</script>
``` 
 - an example of the code in the **parent component** would be:
```html
<template>
<div> <!-- just to be a one element only inside the template (required) -->
    <child-component-tag                // made this to be easier to comment
    :myName="name"                      // this will pass to the child the `name` variable with the attribute `myName`
    @nameWasReset="name = $event"       // this will listen to the $emit event on the child to update the `name` variable
    ></child-component-tag> 
<div>
<template>
<script>
import childComponentTag from './thechildcomponent.vue'
export default {
    data: function() {
        return {
            name: 'john'
        }
    },
    components: {
        childComponentTag: childComponentTag
        // or 'child-component-tag' : childComponentTag
    }
}
</script>
``` 

**note**: If we change the value of the props in the child component without passing the `$emit` event, then the parent component will still have the old value stored. This means that 

### running parent functions in the child component
This is another way of changing stuff in the parent component by the child component.
This is important however because as we will see below, we are able to pass to the child a props a function which will be set as a callback to the main component.
An example is by having in the **parent** component the following function:
`methods : { resetParentName(){ this.name = 'john'} }` and in the html pass another props by: `<child-component-tag :myName="name" :resetFn="resetParentName"></child-component-tag>`
then, in the child component, we could have the following:
`props: { myName : {type: String} , resetParentName : Function }` (any way it works (pass js object or only string (or even array))).
And then in the html run the function passed by props, like: `<button @click="resetFn()"></button>`.

### resume of child => parent communication
You can either:
 - pass the props from the child to the parent and then emit an event and in the parent listen to update the information, or you can
 - create a function that updates the parent in the parent and then by passing it to the child you make the function executable in the child in order to update the information


## child => child communication (having the same parent)

in order to do this is possible to do 2 things:
 - **child1 => parent => child2**: send to parent by assigning the `$emit('eventName', this.age)`, then in the parent get the age property by having the html of the child tag with the attribute `@eventName="age = $event"`. Then we must send from the parent to the other child by passing the props age that just was changed from the child component.
 **note**: this may be chaos when trying to implement as if we just get a bit deeper with the events, we will have to do the following: `grandchild1 => child1 => parent => child2 => grandchild2`. In order for this not to happen we can create a thing called:

 - **the event bus**: the event bus can be a central vue instance just to listen to events and run events between other vue instances
To use the *event bus*, we will need to, in the `main.js` file add an empty vue instance: 
 (main.js) => `export const eventBus = new Vue();`
And then in the components we want to communicate we can import that eventBus:
 (component1.vue) => `import { eventBus } from '../main.js'`.
 Then in the component we can run the `$emit()` method of the `eventBus` vue instance: `eventBus.$emit('ageWasEdited', this.age)`
 (component1.vue) => `methods:{ editAge(){ eventBus.$emit('ageWasEdited', this.age) } }`.
 And then in the other component we want to update the information we can add an event to listen to a lifecycle event (in this case the `created()`) and then ``
 (component2.vue) => `import { eventBus } from '../main.js'`.
 (component2.vue) => `export default { props:[...], methods:[...], created(){ eventBus.$on('ageWasEdited'), function(thedatathatpassed){ this.age = thedatathatpassed } } } }`.

It is also possible to attach the `$emit` event to the eventBus vue instance and call it then with a function. We can see in the following example:
(main.js) => `export const eventBus = new Vue({ methods:{ changeAge(age){this.$emit('ageWasEdited', age)} } });` and then in the component 1 file:
(component1.vue) => `methods: { editAge() { eventBus.changeAge(this.userAge) } }`.

 This is called managing state between multiple components.



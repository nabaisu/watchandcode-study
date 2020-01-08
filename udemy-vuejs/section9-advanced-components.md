# advanced components

## props
 - in the **parent**:  `<child-tag quote="beautiful"></child-tag>`
 - in the **child**:   `props: ['quote']` and apply to the html with `{{quote}}`

A con of this method is that the props are very bad on passing html elements into the child component, and for that there is something that we call slots, as an alternative to the props, which are called the slots:

## slots
Slots help you distribute the content into other components.
The slots are pieces of html that can be inserted into the child component. An example of this is the following:
 - **Parent**:
```html
<child-tag>
    <h2>Something Here</h2>
    <p>a quote</p>
</child-tag>
```
 - **Child**:
```html
<template>
    <div>
    <slot></slot> <!-- this is html tags reserved to the vuejs slots -->
    </div>
</template>
```

Now, there are some important stuff to see here.
**Regarding the styles**: the styles will be saved to the child component, so if we pass a `h1` on the parent component, then that `h1` will get the styling of the child.
Anything else is rendered in the parent component. Which means that if we pass a data variable to the html like: `{{ name }}`, then the template will render it on the parent and then pass the content to the child.

The `<slot>` tag can be used like a component which means that if we insert it 2x, then the content will be displayed twice. 

We can also pass specific content to the child component. Let's see the example below:
 - **Parent**:
```html
<child-tag>
    <h2 slot="title">Something Here</h2> <!-- look at the slot property assigned to "title"-->
    <p slot="content">a quote</p>
</child-tag>
```
 - **Child**:
```html
<template>
    <div>
        <slot name="title"></slot> <!-- this will receive the "title" html that it was passed from the parent component -->
        <slot name="content"></slot> <!-- this will receive the "content" html that it was passed from the parent component -->    
    </div>
</template>
```

Now, it's important to notice that if an html tag inside the child html tag does not have the slot property (only `<child-tag> <p>amigo</p> </child-tag>`), then the default slot will be applied to it (`<slot></slot>`).

To apply default content to a slot, we must insert the default content in the child component's slot (`<slot name="something"> </p>this is the default content<p> </slot>`).

Slots are really usefull on building framed components, like a slideshow where you have the outer content and just need to change the inside content.

## Dynamic components

The dynamic components are when we want to display a component dynamically (not very enlightning, I know, so here goes an example):
That means that we could change the html tags according to which component we want to display. For that we use the `component` html tag, which is a vue js reserved tag, with the `:is` property. 
```html
<template>
    <div>
        <button @click="selected = 'child-1-tag'">child-1<button>
        <button @click="selected = 'child-2-tag'">child-2<button>
        <component :is="selected">
            <p>just to have a default content inside</p>
        </component>
    </div>
</template>
``` 

Now, things to have in mind though, is the lifecycle of the component in place.
The component when changed with the `<component>` tag will actually be destroyed and reconstructed. Which means that imagine, a counter was in place, then the counter would return to 0 when the component would change.
In order to not let this happen, we can wrap the `<component>` tag with the `<keep-alive>` html tag (also vuejs reserved), in order to keep the component alive (preserve the state):
```html
<template>
    <div>
        <button @click="selected = 'child-1-tag'">child-1<button>
        <button @click="selected = 'child-2-tag'">child-2<button>
        <keep-alive>
            <component :is="selected">
                <p>just to have a default content inside</p>
            </component>
        <keep-alive>
    </div>
</template>
``` 

By keeping a component alive, we actually didn't destroy the component, so in that case we can't have call the `destroyed()` lifecycle hook. However, in dynamic components, the `deactivated()` and the `activated()` lifecycle hooks are available, to know when a component was indeed deactivated or activated.




# directives
The directives are the `v-something` attributes we set up inside of our html elements.

## built-in directives
 - **v-text**: in a code like `<p v-text="Some text"></p>`, the input will be the same as `<p>Some text</p>`
 - **v-html**: in a code like `<p v-html="<b>Some text</b>"></p>`, the input will be the same as `<p><b>Some text</b></p>`. Important when doing this because of XSS attacks.

## custom directives (created now)
*example*: a directive to color:
There are 2 ways of doing this, either globally or locally
To create them globally, we can head to our main component and then use the `Vue.directive` and pass in 2 arguments, the name of the content as first argument, and the second is a JS object with the properties following the *directive hooks* pattern:
```javascript
Vue.directive('highlight', { 
    bind(el, binding, vnode) {
        el.style.backgroundColor = "green";
    }
});
```
Then, in the html element, insert the following:
`<p v-highlight>Some text</p>` and the paragraph will become green (in this example).

To send parameters to the directive, it is possible by doing the following in the javascript:
```javascript
Vue.directive('highlight', { 
    bind(el, binding, vnode) {
        el.style.backgroundColor = binding.value;
    }
});
```
and then in the html element, insert the variable that we are aiming to pass as well:
`<p v-highlight="'green'">Some text</p>`.

### get arguments
To get arguments passed by the directive, we can insert them by the following pattern:
`<p v-highlight:background="'green'">Some text</p>`.
And then in the javascript code we can access them and parse them like:
```javascript
Vue.directive('highlight', { 
    bind(el, binding, vnode) {
        if (binding.arg === 'background') { //it must be a string
            el.style.backgroundColor = binding.value;
        } else {
           el.style.color = binding.value; 
        }
    }
});
```
This will do the following:
 - if the html has *background* on it, then the background color of the html tag will be the color passed to it, otherwise only the text color will be of that color:
 `<p v-highlight:background="'green'">Some text</p>` <= all background green
 `<p v-highlight="'green'">Some text</p>` <= only font green

### modifiers
a modifier has the following pattern (*delayed* in the code): `<p v-highlight:background.delayed="'green'">Some text</p>`
To access this modifier, we can on the javascript code have the following:
```javascript
Vue.directive('highlight', { 
    bind(el, binding, vnode) {
        var delay = 0;              // we set up the delay variable as 0 by default
        if (binding.modifiers['delayed']) {     //the modifiers is an array
            delay = 3000;          // just specify the delay if the modifier exists
        };
        setTimeout(function(){      // just pass what we want to do inside (this is just an example)
            if (binding.arg === 'background') { 
                el.style.backgroundColor = binding.value;
            } else {
            el.style.color = binding.value; 
            }
        },delay);
    }
});
```
With this code, then we can see that the styling will be delayed.
The modifiers can be chained to set what we want, and then we can access them by accessing them with `binding.modifiers['nameofthemodifier']`.

To register the directives locally, it is possible by adding the `directives` property to the js object inside of the vue instace/component:
```javascript
export default {
    directives: {
        'local-highlight': {
            bind(el, binding, vnode) {
                el.style.backgroundColor = binding.value;
            }
        }
    }
}
```
We can do the same as the global directive, but it's just important to realize that this directive will only work in the component where he lives.

### directive's hooks
A directive has 5 hooks:
(put here the image of the 5 hook phases)


## adding classes to Vuejs divs:

#### class attribute
Even if the div does not have a class, we can add classes by binding the :class property and input a javascript object to it: 
`<div class="demo" :class="{'red':true}"></div>`
the true above can be any boolean like a variable.
It's important for the input to be a javascript object.

It is also possible to add a class dynamically as it is possible to do `:class="color"` and then in the data object we can have a `color: 'green'`. We can always bind it to an input field but this is important just to be able to see what we can do with CSS manipulation.
With this :classes property, it is possible to add multiple classes by having an array in the property as this `:class="[color,{'red':false}]`. This will basically add the `color: 'green'` of the data object and the 'red' class if the boolean is true.

#### style attribute
If we want to change the CSS directly then we can basically bind the `:style=""` property and provide it with a javascript object. The property name is the css property and the value the css value, an example can be seen in here: `:style="{'background-color':'red'}"`.
Also important to remark is that we can either use `{'background-color':'red'}` or `{backgroundColor:'red'}` to get the same result.
Also if we want to get it as the value of a variable, we can set it to `{'background-color': color}` and the data object may contain the color we are looking for: `color: 'green'`. 
And to finish, we can also return the javascript object and set it to the property of the `:styles="amigo"` and in the data or computed object: `amigo: {backgroundColor: 'green'}` and then return it.

The `:styles` attribute can also be set with multiple values by inputing an array into it: `:styles="[myStyle, {height: width + 'px'}]"` and then return the `myStyle` as a javascript object and the `width` as an input (or any other) variable.


__Note__: The computed variables are for the dependent variables, and they are a function that returns a javascript object.
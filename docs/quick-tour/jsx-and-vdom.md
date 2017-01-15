Title: JSX and Virtual DOM

First of all, we need to look at JSX. It's the syntax that we use to construct Virtual DOM
nodes. It looks like XML!

```javascript
const hello = <h1>Hello World</h1>
```

A fragment of JSX is actually an expression in JavaScript. As we can see in the above
example, we can save the result of a JSX expression to a variable. In fact, after the
compilation phase, the above code will be a function call, looking like this:

```javascript
const hello = Node('h1', null, 'Hello World')
```

That `Node` function is supplied by Tweed. The first argument is the name of the element,
which is an `H1` in our case. The second argument will be an object if we supply any
attributes to the tag:

```javascript
const hello = <h1 class='hello'>Hello World</h1>
// Compiles to
const hello = Node('h1', { class: 'hello' }, 'Hello World')
```

All subsequent arguments represent the children of the element. Let's look at one more
example with a little more complex JSX expression:

```javascript
const complexHello = (
  <div class='wrapper'>
    <h1 class='heading'>Hello World</h1>
  </div>
)
// Compiles to
const complexHello = (
  Node('div', { class: 'wrapper' },
    Node('h1', { class: 'heading' }, 'Hello World')
  )
)
```

> **Note:** As with any expression in JavaScript, we are free to wrap it in parentheses to
> make it clearer. This is common to make the open and close tags line up.

### Interpolation
This is all well and good, but most of the time our JSX will need to contain variables and
data from the outside. We can use curly brackets to _interpolate_ our data into the JSX
expression. It looks like this:

```javascript
const target = 'World'
const hello = (
  <span>Hello {target}</span>
)
```

A similar syntax is used for putting variables into attributes:

```javascript
const className = 'some-class'
const element = (
  <div class={className} />
)
```

> **Note:** As opposed to HTML5, all elements must be closed, either with a closing tag or
> a self-closing tag (`<img />`). Elements that are not self-closing in HTML, like
> `<div></div>` can still be self-closed in JSX.

### The `Node` function
As mentioned above, JSX expressions are compiled to function calls to a function called
`Node`. This function is supplied by Tweed, but not globally. That means it has to be
imported at the top of every file that contains JSX:

```javascript
import { Node } from 'tweed'

const pic = <img src='...' />
```

> If you're not worried about polluting the global scope, you can assign the `Node`
> function to the global object in the entry point file. That way the function will be
> available in every file, making the import statements redundant.

### Object attributes
Some special attributes accept objects instead of strings. If you pass an object to the
`class` attribute, the keys of that object will be added as classes on the element, _if_
their values are `true`.

```javascript
const classes = {
  'this-class-will-be-added': true,
  'this-wont': false,
  'this-will-be-added-if-expression-is-true': dynamic.expression()
}
const element = <div class={classes} />
```

The `style` attribute is pretty self explanatory:

```javascript
const element = (
  <div style={{
    marginTop: '2em'
  }} />
)
```

> **Note:** If you want to send an object literal directly into the attribute, you will
> have to use _two_ curlies, because the outer ones declare that the attribute value will
> be a JavaScript expression, and the inner ones are the actual object literal.

The `on` attribute declare event listeners:

```javascript
const events = {
  click () {
    alert('Button was clicked!')
  }
}
const button = <button on={events}>Click me!</button>
```

### Shorthand object attributes
If you want, you can represent the above with this short hand syntax:

```javascript
function clickHandler () {
  alert('Button was clicked!')
}
const button = <button on-click={clickHandler}>Click me!</button>
```

> **Note:** All the object attributes support this syntax. `class-my-class=`,
> `style-marginTop=`, and `on-mouseover=` are all valid.
```

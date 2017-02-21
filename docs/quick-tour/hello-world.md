Title: Hello World

Armed with the knowledge of how JSX works, let's look at the Hello World example of a
Tweed application:

```tweed+fiddle
import { Node } from 'tweed'
import render from 'tweed/render/dom'

class Hello {
  render () {
    return <h1>Hello World</h1>
  }
}

render(new Hello(), document.querySelector('#app'))
---
import { Node, NodeFactory } from 'tweed'
import render from 'tweed/render/dom'

class Hello implements NodeFactory {
  render (): Node {
    return <h1>Hello World</h1>
  }
}

render(new Hello(), document.querySelector('#app'))
```

So let's break this down. First, we import the `Node` function, as well as the `render`
function, which will mount the Tweed app in the browser.

Next, we declare a class with a `render()` _method_. In TypeScript, there's an interface
called `NodeFactory`, which the `render()` function expects to receive.

The second argument of the `render()` function is the DOM element that the `Hello`
component will replace.

> **Note:** The `render()` function will _replace_ the DOM element passed in. That means
> that any id or class on that element will disappear as well. If you want them in your
> UI, replicate them in your root component's `render()` _method_.

### Delegating
If you want to add another component, we need an instance of that component:

```tweed+fiddle
class Hello {
  _world = new World()

  render () {
    return <h1>Hello {this._world}</h1>
  }
}

class World {
  render () {
    return <span>World</span>
  }
}
---
class Hello implements NodeFactory {
  private readonly _world = new World()

  render (): Node {
    return <h1>Hello {this._world}</h1>
  }
}

class World {
  render (): Node {
    return <span>World</span>
  }
}
```

> **Note:** In the example above, `{this._world}` implicitly calls the `render` method of
> the `World` class. If you want to call that method something else, or if you need to
> pass some argument to the `World`'s `render` method, you can! You just have to type it
> out, like `{this._world.render('arg')}`.

Title: Development Workflow

By default, the CLI will add a Webpack configuration as well as a `dev` command in the
task runner of your choosing. By default, that is using NPM scripts. So the five second
install workflow from scratch to browser looks like this:

```shell
$ tweed new my-project
Crafting my-project...
$ cd my-project
$ npm run dev
http://localhost:8080
```

Next, visit [localhost:8080][localhost] and you should be up and running. Fire up your
editor and start hacking.

Let's open up `src/App.js` and change it to the following:

```tweed
import { Node } from 'tweed'
import Layout from './Layout'

export default class App {
  _layout = new Layout()

  render () {
    return this._layout.render(
      <div>
        App Component
      </div>
    )
  }
}
---
import { Node } from 'tweed'
import Layout from './Layout'

export default class App {
  private readonly _layout = new Layout()

  render (): Node {
    return this._layout.render(
      <div>
        App Component
      </div>
    )
  }
}
```

As you can see, we need to create that `Layout` class.

```shell
$ tweed generate Layout
Generated src/Layout.js
```

We can then edit the layout file and let it wrap the content being sent into its
`render()` method.

```tweed
import { Node } from 'tweed'

export default class Layout {
  _header = <header>Header</header>
  _footer = <footer>Footer</footer>

  render (content) {
    return (
      <div>
        {this._header}
        <main>
          {content}
        </main>
        {this._footer}
      </div>
    )
  }
}
---
import { Node } from 'tweed'

export default class Layout {
  private readonly _header = <header>Header</header>
  private readonly _footer = <footer>Footer</footer>

  render (content: Node): Node {
    return (
      <div>
        {this._header}
        <main>
          {content}
        </main>
        {this._footer}
      </div>
    )
  }
}
```

> **Note:** Here we're saving the `_header` and `_footer` properties as constant nodes.
> However, we can easily extract them to their own components later.

You can read more about _how_ you might want to build a Tweed application in the
[Patterns][patterns] series.

[localhost]: http://localhost:8080 "http://localhost:8080"
[patterns]: #/docs/patterns "Patterns"

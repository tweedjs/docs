Title: Tweed Router

Tweed can be used to create everything from a small component of a webpage, to a full
blown "Single Page Application". Of course, by that we mean that the entire website can be
browsed without having the browser make more than one roundtrip to the server. Links and
pages are all handled by the JavaScript within the browser document.

So switching out part of the page when a button is pressed is simple enough:

```tweed
import { mutating, Node } from 'tweed'

const pages = {
  home: <div>Home Page</div>,
  about: <div>About Page</div>
}

export default class Main {
  @mutating _page = pages.home

  render () {
    return (
      <div>
        <button on-click={() => this._page = pages.home}>
          Go to Home Page
        </button>
        <button on-click={() => this._page = pages.about}>
          Go to About Page
        </button>

        {this._page}
      </div>
    )
  }
}
---
import { mutating, Node } from 'tweed'

const pages = {
  home: <div>Home Page</div>,
  about: <div>About Page</div>
}

export default class Main {
  @mutating private _page = pages.home

  render (): Node {
    return (
      <div>
        <button on-click={() => this._page = pages.home}>
          Go to Home Page
        </button>
        <button on-click={() => this._page = pages.about}>
          Go to About Page
        </button>

        {this._page}
      </div>
    )
  }
}
```

However, on the web, URLs are important to make specific views within your app shareable,
bookmarkable, and integrated with the browser history.

For that, we need a router.

### Tweed Router
The Tweed Router is an entirely optional addition to a Tweed app, and must be installed
separately:

```shell
$ npm install --save tweed-router
```

> **Note:** `tweed-router` uses Promises, but doesn't polyfill them for old browsers. You
> should probably `import 'babel-polyfill'` in your main module to account for that.

First, define your routes:

```tweed
import { Node } from 'tweed'

const routes = {
  '/' () {
    return <div>Home Page</div>
  },

  '/about' () {
    return <div>About Page</div>
  }
}
---
import { Node } from 'tweed'
import { Routes } from 'tweed-router'

const routes: Routes = {
  '/' () {
    return <div>Home Page</div>
  },

  '/about' () {
    return <div>About Page</div>
  }
}
```

Next, we can create a `Router` instance:

```tweed
import { Router } from 'tweed-router'

const router = new Router(routes)
---
import { Router } from 'tweed-router'

const router = new Router(routes)
```

We can use the `navigate(path)` method to change the current page of the `Router`. The
method returns a `Promise`. That's because the routes can be asynchronous. Usually some
routes need to make a HTTP requests to get all the data it needs.

```tweed
router.navigate('/')
  .then(() =>
    router.render() // <div>Home Page</div>
  )
---
router.navigate('/')
  .then(() =>
    router.render() // <div>Home Page</div>
  )
```

As we can see in the previous example, the `Router` has a `render()` method which simply
returns its current page. That means we can mount the `Router` instance to the DOM:

```tweed
import render from 'tweed/render/dom'

async function main () {
  await router.navigate('/')

  render(router, document.querySelector('#app'))
}
---
import render from 'tweed/render/dom'

async function main (): Promise<void> {
  await router.navigate('/')

  render(router, document.querySelector('#app'))
}
```

> **Note:** The `Router` doesn't need to be the root component. We can create an `App`
> component, inject the `Router`, and have its `render()` method return something like
> `<div>{this.router}</div>`. Wherever we render the `Router` is where the current page
> will be rendered.

If we later use the `navigate(path)` method on the `Router`, the page will automatically
update.

### Browser History
The `Router` works both on the server and in the browser. And since there is no browser
history on a server, the default behaviour doesn't involve changing the URL of the browser
window.

To add that functionality, we can use the `BrowserRouter`, which extends the `Router` to
reflect its state to the URL of the window, as well as in the browser history.

Since the `BrowserRouter` knows about the browser environment, it can get its initial page
from the current URL. Furthermore, it needs to add certain event listeners to the browser.
It does all this in a static `make` method:

```tweed
import render from 'tweed/render/dom'
import BrowserRouter from 'tweed-router/browser'

BrowserRouter.make(routes)
  .then((router) =>
    render(router, document.querySelector('#app'))
  )
---
import render from 'tweed/render/dom'
import BrowserRouter from 'tweed-router/browser'

BrowserRouter.make(routes)
  .then((router) =>
    render(router, document.querySelector('#app'))
  )
```

By default, the `BrowserRouter` uses the [History API][historyapi] of the browser to
manipulate the URL. However, this requires every URL in your router to be available in
your back-end. For instance, if the user bookmarks `/about`, the same `index.html` file
must be returned from the server, as the one for `/`.

Since we sometimes don't have access to the entire back-end solution, we can use
[the URL's hash][hashhistory] to achieve the same functionality. This results in arguably
uglier URLs, but it allows the same `index.html` file to be used for all routes.

We can override the `History` implementation by passing it in as the second argument to
`BrowserRouter.make`:

```tweed
import BrowserRouter, { HashHistory } from 'tweed-router/browser'

const history = new HashHistory()

BrowserRouter.make(routes, history)
  .then(...)
---
import BrowserRouter, { History, HashHistory } from 'tweed-router/browser'

const history: History = new HashHistory()

BrowserRouter.make(routes, history)
  .then(...)
```

[historyapi]: https://developer.mozilla.org/en-US/docs/Web/API/History_API "Manipulating the browser history – MDN"
[hashistory]: https://developer.mozilla.org/en/docs/Web/API/WindowEventHandlers/onhashchange "WindowEventHandlers.onhashchange – MDN"

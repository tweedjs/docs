Title: Server Side Rendering

Tweed works very well for initially server rendered apps. Rendering the app as a string is
easy enough:

```tweed
import render from 'tweed/render/string'
import App from './App'

const app = new App()

render(app, html => {
  //
})
---
import render from 'tweed/render/string'
import App from './App'

const app = new App()

render(app, (html: string) => {
  //
})
```

But because the server and the browser are two distinctly different environments, here's
where it gets really interesting. Consider this simple app:

```javascript
import { VirtualNode } from 'tweed'

export default class App {
  render = () => (
    <h1>You are currently visiting {location.pathname}</h1>
  )
}
```

This won't work in a Node.js server environment, because the `location` global does not
exist. However, using [Dependency Injection][dependency-injection] we can make it the
consumer code's business to pass such a variable to the app:

```tweed
import { VirtualNode } from 'tweed'

export default class App {
  constructor (location) {
    this._location = location
  }

  render = () => (
    <h1>You are currently visiting {this._location.pathname}</h1>
  )
}
---
import { VirtualNode } from 'tweed'

export default class App {
  constructor (
    private readonly _location: { pathname: string }
  ) {}

  render = () => (
    <h1>You are currently visiting {this._location.pathname}</h1>
  )
}
```

Finally, in our two entry point files, we can pass appropriate implementations for that
dependency:

```tweed
// client.js
import render from 'tweed/render/dom'
import App from './App'

const app = new App(location)

render(app, document.querySelector('#app'))

// server.js
import render from 'tweed/render/string'
import App from './App'

export default function handleRequest (req, res) {
  const location = {
    pathname: req.url
  }

  const app = new App(location)

  render(app, html => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  })
}
---
// client.ts
import render from 'tweed/render/dom'
import App from './App'

const app = new App(location)

render(app, document.querySelector('#app'))

// server.ts
import render from 'tweed/render/string'
import App from './App'
import { IncomingMessage, ServerResponse } from 'http'

export default function handleRequest (req: IncomingMessage, res: ServerResponse) {
  const location = {
    pathname: req.url
  }

  const app = new App(location)

  render(app, html => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  })
}
```

### Talking to APIs
A common issue is when an SSR application needs to talk to some external service. With
Tweed, we can use simple [Object Oriented][object-oriented] composition to achieve this
nicely:

```tweed
export class MyService {
  constructor (apiClient) {
    this._apiClient = apiClient
  }

  getUser (id: string) {
    return this._apiClient.get(`/users/${id}`)
  }
}
---
import { User } from './User'
import { ApiClient } from './ApiClient'

export class MyService {
  constructor (
    private readonly _apiClient: ApiClient
  ) {}

  getUser (id: string): Promise<User> {
    return this._apiClient.get(`/users/${id}`)
  }
}
```

Here, a simple service class contains the mapping logic between an external API and some
`User` domain object. However, the HTTP request details are abstracted away to an
`ApiClient` interface:

```typescript
export interface ApiClient {
  get (pathname: string): Promise<any>
}
```

We can implement two different implementations of this interface; one for the browser
environment, and one for the server:

```tweed
export class BrowserApiClient {
  async get (pathname) {
    const response = await fetch(`https://api.example.com${pathname}`)
    return response.json()
  }
}
---
import { ApiClient } from './ApiClient'

export class BrowserApiClient implements ApiClient {
  get (pathname: string): Promise<any> {
    const response = await fetch(`https://api.example.com${pathname}`)
    return response.json()
  }
}
```

```tweed
export class ServerApiClient {
  async get (pathname) {
    // ...
  }
}
---
import { ApiClient } from './ApiClient'

export class ServerApiClient implements ApiClient {
  get (pathname: string): Promise<any> {
    // ...
  }
}
```

Finally, we can inject our different implementations into the `MyService` class:

```javascript
import { MyService } from './MyService'
import { BrowserApiClient } from './BrowserApiClient'
import App from './App'

const app = new App(
  new MyService(new BrowserApiClient())
)
```

[dependency-injection]: #/docs/patterns/dependency-injection
[object-oriented]: #/docs/philosophy/object-oriented-design

Title: Tweed Inject

Since Tweed comfortably allows for an architecture based on
[Dependency Injection][dependency-injection], you'll might want to automate the process a
bit. This is where Tweed Inject comes in. First, install the dependency:

```shell
$ npm install --save tweed-inject
```

The library gives us a class called `Container`, which is a mutable object that holds your
DI configuration.

```javascript
import { Container } from 'tweed-inject'

const container = new Container()
```

Without any configuration, the container can be used to create instances of classes:

```javascript
class MyService {}

const service = container.make(MyService)
```

Now, if the `MyService` class has dependencies, we can let the container create them as
well, automatically.

Unfortunately, we cannot get information about the types of the constructor parameters
from vanilla JavaScript; not even vanilla TypeScript. We need to put the information there
ourselves. We can do that using the `@inject` decorator:

```tweed
import { inject } from 'tweed-inject'

class ApiClient {}

@inject(ApiClient)
class MyService {
  constructor (apiClient) {
    this.apiClient = apiClient
  }
}

const service = container.make(MyService)

assert(service.apiClient instanceof ApiClient)
---
import { inject } from 'tweed-inject'

class ApiClient {}

@inject(ApiClient)
class MyService {
  constructor (
    public readonly apiClient: ApiClient
  ) {}
}

const service = container.make(MyService)

assert(service.apiClient instanceof ApiClient)
```

### Depending on Abstraction
Injecting a class is easy enough, but we'll want to build our apps in a way where classes
depend on (inject) abstract interfaces instead of concrete classes. This gives us ways to
independently build and deploy different parts of the application like plugins. Again,
this is a core principle of [OOD][ood].

With vanilla JavaScript, this is implicit since JS does not have interfaces. If a class
has a `constructor (dependency) { ... }` then the implementation of the `dependency` is
undefined until the instantiation of the class.

In TypeScript on the other hand, we have interfaces:

```typescript
interface ApiClient {}

class MyService {
  constructor (apiClient: ApiClient) { ... }
}
```

For the container to inject an actual implementation of an interface, we need to
`@inject` a token to represent the abstract interface, and then bind an implementation to
that token:

```tweed
import { Container, inject } from 'tweed-inject'

const ApiClient = 'interface ApiClient'

@inject(ApiClient)
class MyService {
  constructor (apiClient) {
    this.apiClient = apiClient
  }
}

class ActualApiClient {}

const container = new Container()

container.bind(ApiClient).toClass(ActualApiClient)

const service = container.make(MyService)

assert(service.apiClient instanceof ActualApiClient)
---
import { Container, inject } from 'tweed-inject'

interface ApiClient {}
const ApiClient = 'interface ApiClient'

@inject(ApiClient)
class MyService {
  constructor (
    public readonly apiClient: ApiClient
  ) {}
}

class ActualApiClient implements ApiClient {}

const container = new Container()

container.bind(ApiClient).toClass(ActualApiClient)

const service = container.make(MyService)

assert(service.apiClient instanceof ActualApiClient)
```

In this example, the `ActualApiClient` class can have dependencies on its own; the
creation process is recursive until all injections are satisfied.

> **Note:** There are other ways to bind an implementation to an abstraction. `toInstance`
> uses an existing instance of an implementation, and `toFactory` takes a factory function
> which _returns_ the object to be injected. There is also `toSingletonClass` and
> `toSingletonFactory`, which is the same as `toClass` and `toFactory` except it will
> cache the resulting object and inject it into every other class that needs it.

[dependency-injection]: #/docs/patterns/dependency-injection "Dependency Injection"
[ood]: #/docs/philosophy/object-oriented-design "Object Oriented Design"

Title: Dependency Injection

Consider the following module:

```tweed
// Example 1.

import B from './B'

export default class A {
  b = new B()

  render () {
    return this.b.render()
  }
}
---
// Example 1.

import B from './B'

export default class A {
  b = new B()

  render () {
    return this.b.render()
  }
}
```

Now let's change the module somewhat, and look at what happens:

```tweed
// Example 2.

export default class A {
  constructor (b) {
    this.b = b
  }

  render () {
    return this.b.render()
  }
}
---
// Example 2.

import BInterface from './BInterface'

export default class A {
  constructor (
    public readonly b: BInterface
  ) {}

  render () {
    return this.b.render()
  }
}
```

In the first example, since we need an instance of `B`, our first instinct is to import
the `./B` module at the top of the file. But this is problematic, because now our `A`
class has a _concrete dependency_ on `B`, which means that every time any other module
imports `A`, it will also import `B`. For example, if we're using a bundler tool, anyone
who wants to use the `A` class must also cram `B` into the bundle.

Now, you might say "of course, we need the `B` to render `A`". That's true. But now look
at the second example. Here, we're not importing `B` at the top, but instead we force
whoever uses our class to send in a `b` in our constructor. We're _injecting the
dependency_.

By performing this maneuver, we make it the _consumer's_ business to actually import the
`B` class. The benefit of this—and this is key—the consumer is free to choose another
object with a `render()` method. If you're using TypeScript, you can formalize this by
establishing an interface that the object must satisfy:

```typescript
import { Node } from 'tweed'

interface BInterface {
  render (): Node
}

export default BInterface
```

The most common argument for why this is good, it for testing. If `A` imports `B` and a
unit test imports `A` to test it, the unit test must also verify that `B` does what it's
supposed to. This may prove difficult, because `B` may be doing a lot of I/O operations.

Look at what happens if we use _dependency injection_ to inject a database object:

```tweed
export default class UserRepository {
  constructor (db) {
    this._db = db
  }

  all () {
    return this._db.query('SELECT * FROM "users";')
  }
}
---
export interface SQLDatabase {
  query (query: string): Promise<any[]>
}

export default class UserRepository {
  constructor (
    private readonly _db: SQLDatabase
  ) {}

  all () {
    return this._db.query('SELECT * FROM "users";')
  }
}
```

To test this, all we need to do is the following:

```tweed
import UserRepository from './UserRepository'

const mockDb = {
  query (q) {
    expect(q).toBe('SELECT * FROM "users";')
    return 'db response'
  }
}

const repo = new UserRepository(mockDb)

expect(repo.all()).toBe('db response')
---
import UserRepository, { SQLDatabase } from './UserRepository'

const mockDb: SQLDatabase = {
  async query (q: string): Promise<any[]> {
    expect(q).toBe('SELECT * FROM "users";')
    return ['db response']
  }
}

const repo = new UserRepository(mockDb)

expect(repo.all()).toBe(['db response'])
```

And just like that, we have tested the entirety of the behaviour of the `UserRepository`
without actually interacting at all with the database, even though the database is
important to the logic that the `UserRepository` handles.

On the other hand, if the `UserRepository` _created_ an instance of a database, we would
have to bend over backwards to set up the world for a simple method to be tested.

---

### Dependency Injection and Tweed
When we're dealing with UI, it's easy to think that DI is unneccessary. When we think
about how modern UI frameworks implement _components_ or _custom elements_, the only way
to make a component include markup that they themselves don't include is with XML-style
children:

```html
<my-element>
  <h1>Hello World</h1>
</my-element>
```

A component that needs to render different pieces of its internals differently usually
resort to using special children or attributes to define these relationships:

```html
<my-layout>
  <my-title>A Title</my-title>
  <my-menu>
    <my-menu-item href='/'>Home</my-menu-item>
  </my-menu>
  <my-page>
    <h1>Hello World</h1>
  </my-page>
</my-layout>
```

This looks appealing at first, because it gives us a very clear view of how the UI is
built up, instead of being thrown off by a bunch of noise, like
`<div class='col col-xs-12 col-md-4'></div>`.

However, this structure gets increasingly brittle, because there is no way for the
components to validate or enforce specific structures within its children, and it's very
hard to know if something breaks if a feature is added or changed in any way.

Now look at this example:

```javascript
const layout = new Layout({
  title: 'A Title',
  menu: new Menu(
    new MenuItem('/', 'Home')
  ),
  page: (
    <h1>Hello World</h1>
  )
})
```

This is arguably just as clear, declarative, and readable as the XML-style implementation,
and we're now in the domain of a programming language, so how you get to those values are
completely up to you as a developer. Load the menu in from another module, or generate the
`page` depending on the URL of the browser. The `Layout` only cares that the constructor
argument should look like this:

```typescript
interface LayoutDependencies {
  title: string
  menu: Menu
  page: Node
}
```

Likewise, the `Menu` class can have a constructor that looks like this:

```typescript
class Menu {
  constructor (...items: MenuItem[]) { ... }
  ...
}
```

We now have clearly defined borders between these components that can be managed, so that
things don't break.

### Collaborators into Constructors, Data into Methods
Because we're using classes instead of plain functions, we effectively have two different
types of parameter lists: _constructor parameters_ and _method parameters_. But when
should you use which?

In other words, what's the difference between `new A(new B()).render()` and
`new A().render(new B())` and when is it appropriate to use which one?

The main thing to keep in mind here is: whoever chooses what to send to the constructor
also knows what the class is. However, an existing object can be passed around, and
whoever calls a method just needs to know the signature of that very method.

Keep this in mind: _Collaborators into Constructors, Data into Methods_. For example, a
component like `ScrollableList` could be implemented like this:

```tweed
class ScrollableList {
  constructor (listStyle) {
    this._listStyle = listStyle
  }

  get _style () {
    return Object.assign({},
      this._listStyle.style,
      {
        height: this._height,
        overflowY: 'scroll'
      }
    )
  }

  render (items) {
    return (
      <ul style={this._style}>
        {items.map((i) => <li>{i}</li>)}
      </ul>
    )
  }
}
---
interface ListStyle {
  style: { [rule: string]: string | number }
}

class ScrollableList {
  constructor (
    private _listStyle: ListStyle
  ) {}

  private get _style () {
    return Object.assign({},
      this._listStyle.style,
      {
        height: this._height,
        overflowY: 'scroll'
      }
    )
  }

  render (items: Node[]): Node {
    return (
      <ul style={this._style}>
        {items.map((i: Node) => <li>{i}</li>)}
      </ul>
    )
  }
}
```

The `ListStyle` passed in determines how the `ScrollableList` looks: it's a collaborator.
What list items to show, though, can be different every time. It doesn't matter. They're
just data.

In fact, since items in a list most likely is best described as data, that `Menu` example
from before could with good reason be designed so that the menu items are passed into the
render method instead of the constructor:

```javascript
const menu = new Menu()

menu.render(
  <a href='/'>Home</a>,
  <a href='/about'>About</a>
)
```

However, if we wanted our menu to be automatically generated from something like a router,
we might opt for something like this:

```javascript
const router = new Router({
  '/': () => ...,
  '/about': () => ...
})

const menu = new Menu(router)

menu.render()
```

It's up to you to decide whether to call something a collaborator or data. This
distinction is one of the challenges of [OOD][ood].

### Stateful Collaborators
We now have to tackle another issue. Consider this class:

```tweed
class TodoList {
  @mutating items = []
}
---
class TodoList {
  @mutating items: Todo[] = []
}
```

Is this a collaborator or data?

We can take different approaches here. Traditional OOP developers might suggest to inject
an instance of `TodoList` in the constructor of any component that uses the data:

```tweed
class TodoListView {
  constructor (todoList) {
    this._todoList = todoList
  }

  render () {
    return (
      <ul>
        {this._todoList.items.map((todo) =>
          <li>{todo}</li>
        )}
      </ul>
    )
  }
}
---
class TodoListView {
  constructor (
    private readonly _todoList: TodoList
  ) {}

  render () {
    return (
      <ul>
        {this._todoList.items.map((todo) =>
          <li>{todo}</li>
        )}
      </ul>
    )
  }
}
```

However, like we discussed, this ties a `TodoListView` instance to a single list of todos.
If we wanted to support multiple todo lists, we would have to create a new `TodoListView`
as well.

Another approach would be this:

```tweed
class TodoListView {
  render (todos) {
    return (
      <ul>
        {todos.map((todo) =>
          <li>{todo}</li>
        )}
      </ul>
    )
  }
}
---
class TodoListView {
  render (todos: Todo[]) {
    return (
      <ul>
        {todos.map((todo) =>
          <li>{todo}</li>
        )}
      </ul>
    )
  }
}
```

Here we've removed the dependency on the state container `TodoList` completely. Instead we
only rely on the data to be passed into the `render()` method.

This would require another component like this one:

```tweed
class TodoListContainer {
  constructor (todoListView, todoList) {
    this._todoListView = todoListView
    this._todoList = todoList
  }

  render () {
    return this._todoListView.render(this._todoList.items)
  }
}
---
class TodoListContainer {
  constructor (
    private readonly _todoListView: TodoListView
    private readonly _todoList: TodoList
  ) {}

  render () {
    return this._todoListView.render(this._todoList.items)
  }
}
```

Again, this might seem overly convoluted, but it may not be such a bad idea. It lets the
view be completely stateless and immutable and the mutable state be completely separated
from the view. At this point we're approaching a [Flux][flux]-like architecture, which you
might like.

[ood]: #/docs/philosophy/object-oriented-design "Object Oriented Design"
[flux]: https://facebook.github.io/flux "Flux Architecture"

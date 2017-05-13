Title: Harris – State Manager

As an application grows and more and more advanced states and views are added, you may
find yourself in situations where one seemingly simple change in state requires
interactions with a lot of objects. To prevent this, it may prove useful to create a
centralized place for the entire state of the application.

You can implement it like a god object:

```typescript
import { mutating } from 'tweed'

class WorldState {
  @mutating todoPopupIsShown = false
  @mutating todos = []
  @mutating todoInputText = ''
  ...
}
```

However, this results in a huge object which probably is really cumbersome to work with.

### Enter Harris
Harris is a state management library that instead of focusing on the state of the data
focuses on the mutations applied to the data. Instead of having the different parts of the
application change the properties of a god object, they dispatch actions to an opaque
state container which is preconfigured to support those actions, taking the data from its
previous state to the next.

Imagine a simple counter, with `+` and `–` buttons. What actions should they dispatch?

```tweed
class IncrementAction {
  type = 'Increment'
}

class DecrementAction {
  type = 'Decrement'
}
---
class IncrementAction {
  readonly type: 'Increment' = 'Increment'
}

class DecrementAction {
  readonly type: 'Decrement' = 'Decrement'
}
```

> **Note:** We will later use that `type` property to distinguish between different
> actions. If you're using TypeScript, we can add literal type annotations to make the
> compiler understand that distinction.

Next, we create an `Update`, which represents the transition from one state to another. In
our example, the model consists of a simple `number`.

```tweed
function counterUpdate (state, action) {
  switch (action.type) {
    case 'Increment':
      return state + 1
    case 'Decrement':
      return state - 1
    default:
      return state
  }
}
---
import { Update } from 'harris'

type CounterModel = number
type CounterAction = IncrementAction | DecrementAction

const counterUpdate: Update<CounterModel, CounterAction> =
  (state: CounterModel, action: CounterAction): CounterModel => {
    switch (action.type) {
      case 'Increment':
        return state + 1
      case 'Decrement':
        return state - 1
      default:
        return state
    }
  }
```

> **Note:** Again, if you're using TypeScript, notice that the compiler can figure out
> that inside the `'Increment'` case, `action` must be an `IncrementAction`. This makes
> the switch/case type safe, and enables IDEs and editors to hint on data contained in the
> action object.

Finally, we create a `Store` from the update function, which will hold the state of the
model and receive actions.

```tweed
import { Store } from 'harris'

const initialState = 0
const counterStore = new Store(initialState, counterUpdate)
---
import { Store } from 'harris'

const initialState: CounterModel = 0
const counterStore = new Store(initialState, counterUpdate)
```

We can get the state of the store with `counterStore.state`, or we can subscribe to
updates with `counterStore.subscribe(state => ...)`.

Or, most likely in a Tweed app, we can just inject the store and start using the state it
directly. A Harris Store uses the `@mutating` decorator to tell Tweed to rerender when the
state is updated.

```tweed
import { VirtualNode } from 'tweed'

class CounterView {
  constructor (counterStore) {
    this._counterStore = counterStore
  }

  _increment = () =>
    this._counterStore.dispatch(new IncrementAction())

  _decrement = () =>
    this._counterStore.dispatch(new DecrementAction())

  render () {
    return (
      <span>
        <button on-click={this._increment}>+</button>
        <span> {this._counterStore.state} </span>
        <button on-click={this._decrement}>–</button>
      </span>
    )
  }
}
---
import { VirtualNode } from 'tweed'
import { Store } from 'harris'

class CounterView {
  constructor (
    private readonly _counterStore: Store<CounterModel, CounterAction>
  ) {}

  private _increment = () =>
    this._counterStore.dispatch(new IncrementAction())

  private _decrement = () =>
    this._counterStore.dispatch(new DecrementAction())

  render (): VirtualNode {
    return (
      <span>
        <button on-click={this._increment}>+</button>
        <span> {this._counterStore.state} </span>
        <button on-click={this._decrement}>–</button>
      </span>
    )
  }
}
```

Put together, a working Tweed app could look like this:

```tweed
import { VirtualNode } from 'tweed'
import render from 'tweed/render/dom'
import { Store } from 'harris'

class IncrementAction {
  type = 'Increment'
}

class DecrementAction {
  type = 'Decrement'
}

function counterUpdate (state, action) {
  switch (action.type) {
    case 'Increment':
      return state + 1
    case 'Decrement':
      return state - 1
    default:
      return state
  }
}

class CounterView {
  constructor (counterStore) {
    this._counterStore = counterStore
  }

  _increment = () =>
    this._counterStore.dispatch(new IncrementAction())

  _decrement = () =>
    this._counterStore.dispatch(new DecrementAction())

  render () {
    return (
      <span>
        <button on-click={this._increment}>+</button>
        <span> {this._counterStore.state} </span>
        <button on-click={this._decrement}>–</button>
      </span>
    )
  }
}

const initialState = 0
const counterStore = new Store(initialState, counterUpdate)

render(new CounterView(counterStore), document.querySelector('#app'))
---
import { VirtualNode } from 'tweed'
import render from 'tweed/render/dom'
import { Update, Store } from 'harris'

class IncrementAction {
  readonly type: 'Increment' = 'Increment'
}

class DecrementAction {
  readonly type: 'Decrement' = 'Decrement'
}

type CounterModel = number
type CounterAction = IncrementAction | DecrementAction

const counterUpdate: Update<CounterModel, CounterAction> =
  (state: CounterModel, action: CounterAction): CounterModel => {
    switch (action.type) {
      case 'Increment':
        return state + 1
      case 'Decrement':
        return state - 1
      default:
        return state
    }
  }

class CounterView {
  constructor (
    private readonly _counterStore: Store<CounterModel, CounterAction>
  ) {}

  private _increment = () =>
    this._counterStore.dispatch(new IncrementAction())

  private _decrement = () =>
    this._counterStore.dispatch(new DecrementAction())

  render (): VirtualNode {
    return (
      <span>
        <button on-click={this._increment}>+</button>
        <span> {this._counterStore.state} </span>
        <button on-click={this._decrement}>–</button>
      </span>
    )
  }
}

const initialState = 0
const counterStore = new Store(initialState, counterUpdate)

render(new CounterView(counterStore), document.querySelector('#app'))
```

### Joining and Combining Updates
Instead of creating multiple stores for the different parts of your application—which
would defeat the purpose a bit—we can merge multiple Updates and create a single store
from that. If you want to add actions to the same model without adding more cases to an
existing Update, you can use `Update.join`:

```tweed
import { Update } from 'harris'

class AddAction {
  type = 'Add'

  constructor (amount) {
    this.amount = amount
  }
}

function counterUpdatePatch (state, action) {
  switch (action.type) {
    case 'Add':
      return state + action.amount
    default:
      return state
  }
}

// Merged update
const newCounterUpdate = Update.join(counterUpdate, counterUpdatePatch)
---
import { Update } from 'harris'

class AddAction {
  readonly type: 'Add' = 'Add'

  constructor (
    public amount: number
  ) {}
}

const counterUpdatePatch: Update<CounterModel, CounterAction> =
  (state: CounterModel, action: CounterAction): CounterModel => {
    switch (action.type) {
      case 'Add':
        return state + action.amount
      default:
        return state
    }
  }

// Merged update
const newCounterUpdate = Update.join(counterUpdate, counterUpdatePatch)
```

If you need to create an update for a completely different model, we can combine multiple
updates in an object, effectively creating a new update for an object model. We do this by
using `Update.combine`:

```tweed
import { Update, Store } from 'harris'

class SetFilterTextAction {
  type = 'SetFilterText'

  constructor (text) {
    this.text = text
  }
}

function filterUpdate (state, action) {
  switch (action.type) {
    case 'SetFilterText':
      return action.text
    default:
      return state
  }
}

// Merged update
const appUpdate = Update.combine({
  counter: counterUpdate,
  filter: filterUpdate
})

const initialState = { counter: 0, filter: '' }
const appStore = new Store(initialState, appUpdate)
---
import { Update, Store } from 'harris'

class SetFilterTextAction {
  type = 'SetFilterText'

  constructor (
    public readonly text: string
  ) {}
}

type FilterModel = string
type FilterAction = SetFilterTextAction | ...

const filterUpdate: Update<FilterModel, FilterAction> =
  (state: FilterModel, action: FilterAction): FilterModel => {
    switch (action.type) {
      case 'SetFilterText':
        return action.text
      default:
        return state
    }
  }

interface AppModel {
  counter: CounterModel
  filter: FilterModel
}
type AppAction = CounterAction | FilterAction

// Merged update
const appUpdate: Update<AppModel, AppAction> = Update.combine({
  counter: counterUpdate,
  filter: filterUpdate
})

const initialState: AppModel = { counter: 0, filter: '' }
const appStore = new Store(initialState, appUpdate)
```

We can now dispatch actions for both the counter and the filter to the same `Store`, whose
state now consists of an object containing the states for both components.

```typescript
appStore.state // { counter: 0, filter: '' }

appStore.dispatch(new IncrementAction())

appStore.state // { counter: 1, filter: '' }

appStore.dispatch(new SetFilterTextAction('x'))

appStore.state // { counter: 1, filter: 'x' }
```

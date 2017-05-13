Title: Mutations

To make the UI interactive, we have to keep track of the state of the application.
Whenever the user enters some information into an input box, or prompts a dialog box to
open, we need to handle those changes carefully.

Keeping track of the internal state of an application is arguably the hardest part about
programming. If you're used to something like jQuery, you've probably run into that issue
where you add something that seems simple; like a close button for a menu. But then you
run into bugs where parts of the UI is still visible, for example. Then you have to make
sure you close those other parts of the menu before performing the original task.

As the amount of parameters grow, the potential configurations of those parameters
increase exponentially. If you have five menus that can be opened or closed, you already
have `2 ^ 5 = 32` different states in your UI.

In Tweed, instead of having to manually opening and closing those menus, we focus on
modulating a data model, which automatically triggers rerendering of the UI. We call these
data changes _mutations_.

```tweed
class Stateful {
  @mutating property = 'initial value'
}
---
class Stateful {
  @mutating property = 'initial value'
}
```

By using the `@mutating` [decorator][decorators-proposal], we tell Tweed to track the
state of the property, and rerender the UI whenever it changes.

```tweed+fiddle
class Counter {
  @mutating _count = 0

  render () {
    return (
      <button on-click={() => this._count++}>
        You have pressed this button {this._count} times
      </button>
    )
  }
}
---
class Counter {
  @mutating private _count = 0

  render (): VirtualNode {
    return (
      <button on-click={() => this._count++}>
        You have pressed this button {this._count} times
      </button>
    )
  }
}
```

> **Note:** Pay attention to how we're not telling the browser to change the label of the
> button. Instead, we _declaratively_ describe how we want the UI to look, and let Tweed
> worry about updating the button label when the model is mutated.

### Alert Box
A more realistic example is an alert box that can be hidden. Consider the different states
of that component—_open_ and _closed_:

```tweed+fiddle
class AlertBox {
  @mutating _isOpen = true
  _message = 'This is an alert'

  render () {
    if (!this._isOpen) {
      return <div>Closed</div>
    }

    return (
      <div>
        <span>{this._message}</span>

        <button on-click={() => this._isOpen = false}>
          ×
        </button>
      </div>
    )
  }
}
---
class AlertBox {
  @mutating private _isOpen = true
  readonly private _message = 'This is an alert'

  render (): VirtualNode {
    if (!this._isOpen) {
      return <div>Closed</div>
    }

    return (
      <div>
        <span>{this._message}</span>

        <button on-click={() => this._isOpen = false}>
          ×
        </button>
      </div>
    )
  }
}
```

> **Challenge:** Can you make the alert box disappear by itself after five seconds?

### One-Way Data
A popular method for keeping an interactive input element up to date with the internal
data model of a component, is called _Two-Way Data Binding_. The idea is that you _bind_
an input element to a property on the view model, so that whenever you update the data
model programmatically, the view updates the contents of the input field. Likewise, if a
user updates the contents of the field, the data model changes.

Tweed doesn't take this approach, for good reason. Instead, you will have to configure
event listeners on those inputs, and manually write the updates to the data.

```tweed+fiddle
class InputField {
  @mutating value = ''

  render () {
    return (
      <div>
        <input
          value={this.value}
          on-input={(event) => {
            this.value = event.target.value
          }}
        />
        <p>Value: {this.value}</p>
      </div>
    )
  }
}
---
class InputField {
  @mutating value = ''

  render (): VirtualNode {
    return (
      <div>
        <input
          value={this.value}
          on-input={(event: Event) => {
            const input: HTMLInputElement = event.target

            this.value = input.value
          }}
        />
        <p>Value: {this.value}</p>
      </div>
    )
  }
}
```

[decorators-proposal]: https://github.com/tc39/proposal-decorators "Decorators Proposal"

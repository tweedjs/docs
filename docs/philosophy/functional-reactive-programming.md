Title: Functional Reactive Programming

During the 20th century, at a time when hardware was expensive and processing power
extremely limited, programmers were expected to write code that optimized every processor
cycle. Choosing the correct control flow statement for a certain task could save seconds
or minutes of execution time. Careful management of memory could increase performance
tenfold.

It's no coincidence that the dominating programming paradigm at the time was procedural
programming. Today, C remains as one of the most popular programming languages in the
world.

C programmers were the ones out in the field, writing the systems we rely on today. But
there was another discipline that was very popular in the Computer Science space.
Functional Programming.

Scientists had realized that it was sometimes quite hard to _prove_ that a procedural
program worked correctly. Overflowing, pointer arithmetic, and memory leaks were
responsible for so many subtle bugs that algorithms required in-depth and repeated testing
to prove itself as correct.

But scientists and mathematicians already had a language to describe algorithms. _Lambda
Calculus_ is a notation to describe computation, including the notion of functions. One
property of Lambda Calculus that differs from a language like C, it that data can _never_
be changed. There's no such thing as changing data, since data is just representing a
value. Consider the following code:

```javascript
let i = 0

i = 1

i = i + 2
```

Here, we repeatedly change the _value_ of the variable `i`. But we never change any data,
because even though we say that `i` it _equal_ to `0`, and that `i` it later changed to be
`1`, we wouldn't expect `0` to now be _equal_ to `1`.

Variables that behave like this stem from the hardware centric tradition, where data
exists in memory, and variables simply point to that position in memory. When we reassign
a variable, we write over the piece of memory with a new value.

In Lambda Calculus, there is no such thing as reassignment, because a variable represents
a value and a value cannot change. `0` is always `0`, so if `i = 0` then `i` is always
`i`.

### Functional Programming
This property made Lambda Calculus easier to prove correct than procedural programming,
and scientists wanted to bring that level of certainty to the world of Computer Science.
Programming languages that came out of this discipline are called Functional Programming
Languages.

Given the constraint that data can never change, it's hard to imagine how to do anything
more than mathematical computations. For example, changing the contents of a file in the
file system is, by definition, changing data. So we can't do that, right?

Computer scientists and mathematicians have developed ways to represents the changing of
data without violating the rules of the functional paradigm. Advanced concepts such as
_Monads_, which we won't go into here, made functional programming usable for more tasks
than just solving mathematical expressions.

### Functional Reactive Programming
In the context of interactive user interfaces, handling state changes is a requirement.
When a user clicks a button to open a menu, the state of the UI has changed. We can
imagine a variable `menu.isOpen` being changed from `false` to `true`.

In procedural style, we must first change the variable, then get the DOM node representing
the menu, then mutate the DOM to account for the change. In a functional style, any state
change should rebuild the entire DOM.

This is essentially achieved with [JSX and Virtual DOM][jsx-vdom].

### FRP and Tweed
In Tweed, and property decorated with `@mutating` will trigger a rerender of the UI when
changed. The `render()` method can use those variables with the knowledge that they will
always be up to date:

```tweed
class Timer {
  @mutating now = new Date()

  constructor () {
    setInterval(() => {
      this.now = new Date()
    }, 1000)
  }

  render () {
    return (
      <div>{this.now.toString()}</div>
    )
  }
}
---
class Timer {
  @mutating now = new Date()

  constructor () {
    setInterval(() => {
      this.now = new Date()
    }, 1000)
  }

  render (): Node {
    return (
      <div>{this.now.toString()}</div>
    )
  }
}
```

[jsx-vdom]: #/docs/quick-tour/jsx-and-vdom "JSX and Virtual DOM"

Title: Object Oriented Design

The Object Oriented Programming paradigm was introduced by researchers and computer
scientists at MIT during the late 1950's and early 1960's. At that time the dominating
paradigm was Imperative Programming, and to some degree [Functional Programming][fp].

Data is organized in _data structures_. In the procedural paradigm, the kind of data must
be known to determine what procedure or function should be called with that data. To make
sense of the increasingly complex procedures, parts of those algorithms were extracted out
to other procedures. Specifically, details about _how_ to perform tasks could be located
in simple functions. The _high level_ understanding of the problem at hand could then be
more clearly described and progressively delegate down to functions with more finely
grained detail of the individual steps that the computer would have to take.

This architecture resulted in programs that always excecuted _top-down_. _High level_
function calls _low level_ function, which calls an even _lower level_ function.

This turned out to be problematic, because the _high level policy_ of the program would be
_dependent_ on the _low level detals_ of the algorithm, meaning that any change to the low
level code could force the high level code to change with it. Since the purpose of high
level code is to give better understanding and reason to a complex system, having the low
level code call the shots was brittle. Again, this whole situation was because the data
sent into the program would have to be analyzed before the algorithm would know what to do
with it.

This mental coupling between procedures was poorly defined, the scientists at MIT
realized. Instead of taking the data and putting it into functions, a message could be
sent _to_ the data, asking it to perform some action. The data, with the knowledge of
itself, could then determine what procedure should be executed next. The _Object_ was
born.

This meant that the _higher level caller_ would no longer need to have knowledge of the
data. It would simply need to know that the data could receive a specific kind of message.
To fulfill this requirement, descriptions of what messages could be accepted by an object
was defined. The _Interface_ was created.

The interface could then be defined in the _high level code_, so that the _low level code_
would simply have to conform to those descriptions. The program wouldn't even compile
otherwise.

That way, the pecking order was turned over. The polarity was reversed.

### Let's see some code
Here is an example of procedural code:

```typescript
function main (args: string[]): void {
  if (weShouldPrintAMessage(args)) {
    printAMessage(args[1])
  }
}

function weShouldPrintAMessage (args: string[]): boolean {
  return args[0] === 'say'
}

function printAMessage (message: string) {
  console.log(message)
}

// Starts the procedure
main(['say', 'hello'])
```

In this example, the `main` function contains the high level decision-making of the
program, but needs to ask lower level code questions about the data before making the
choice. The lower level `weShouldPrintAMessage` and `printAMessage` functions must
therefore be inside the `main` function's scope.

Now let's look at an OOP example:

```typescript
interface CanPrint {
  printAMessage (): void
}

interface DecidesWhetherToPrint {
  weShouldPrintAMessage (): boolean
}

function main (decides: DecidesWhetherToPrint, printer: CanPrint): void {
  if (decides.weShouldPrintAMessage()) {
    printer.printAMessage()
  }
}
```

This code compiles, but cannot run, because it lacks implementations for those interfaces.
Notice however, that the high level `main` function doesn't bother analyzing any data. It
only cares about the _policy_, which in this contrived example is that a message should be
printed, but only under some circumstance.

```typescript
class Console implements CanPrint {
  constructor (
    private message: string
  ) {}

  printAMessage (): void {
    console.log(this.message)
  }
}

class ChecksForSayCommand implements DecidesWhetherToPrint {
  constructor (
    private command: string
  ) {}

  weShouldPrintAMessage (): boolean {
    return this.command === 'say'
  }
}

// Starts the procedure
main(new ChecksForSayCommand(process.argv[0]), new Console(process.argv[1]))
```

In the implementations we find essentially the same functions as in the procedural
example. However, instead of receiving the data as an argument to the function, the
classes give that responsibility to the even lower level code which is the entry point on
the last line.

### Polymorphism
The most important part of this shift is that the high level function now enforces a
policy independent from the details. We can now reuse this policy in another, completely
different context.

```typescript
class Megaphone implements CanPrint {
  constructor (
    private command: string
  ) {}

  printAMessage (): void {
    console.log(this.command.toUpperCase() + '!!!')
  }
}

class ItsFriday implements DecidesWhetherToPrint {
  weShouldPrintAMessage (): boolean {
    return new Date().getDay() === 5
  }
}

// Starts the procedure
main(new ItsFriday(), new Megaphone(process.argv[0]))
```

This last example results in a program with a completely different behaviour.

```shell
# Correct input -- procedural
$ procedural-example say "Hello Procedural Programming"
Hello Procedural Programming

# Incorrect input -- object oriented
$ oop-example s_y "Hello OOP"

# Correct input -- object oriented
$ oop-example say "Hello OOP"
Hello OOP

# Different program, same policy
$ oop-example-2 Message
MESSAGE!!! # If it's Friday, otherwise no output
```

We call this kind of reusable property _Polymorphism_. It's behaviour enforcing logic
regardless of data.

---

### OOD
Even though OOP gives us the tools to write code this way, it doesn't force us to. It's up
to the engineers to use the programming language a way that utilizes this powerful
concept. Taking care to structure a project in a maintainable fashion is what we call
Object Oriented Design.

[fp]: #/docs/philosophy/functional-reactive-programming "Functional Reactive Programming"

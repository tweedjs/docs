Title: Tweed CLI

The easiest and quickest way to get up and running with Tweed is to use the CLI. It's a
one-time global install. You'll have a working app in 20 seconds.

```shell
$ npm install --global tweed-cli
$ tweed new my-first-project
```

The `new` command is highly configurable. There are options for what compiler you want to
use (if any), if you want to use a linter, and much more. When you run the command it will
ask for confirmation before moving on, so you can review your choices.

You can pass the `--no-interaction` flag to skip the confirmation step. This
is nice if you want to automate the creation of projects in a script, or if you're just
impatient.

By default, the command generates a simple Tweed app with a simple input box. Basically,
the Hello World example with [mutations][mutations].

> **Note:** We will look for a `yarn` executable in your path, and use [Yarn][yarn] to
> install all dependencies. This will greatly improve the speed of your installation
> process.

### `tweed generate`
The `generate` command can be used to quickly scaffold new components.

```shell
$ tweed generate MyComponent
Generated src/MyComponent.js
```

The `generate` command assumes that you're following the convention of one main class per
file, so in the example above the file will contain the following:

```javascript
import { VirtualNode } from 'tweed'

export default class MyComponent {
  render () {
    return <div />
  }
}
```

If you want to generate a component in a file within a directory structure, you can
describe the path from the `src` directory with a period separating the names. You can
also use a slash or a backslash if that's more natural to you:

```shell
$ tweed generate deep.namespace.MyClass
Generated src\deep\namespace\MyClass.tsx
```

You may follow a different file naming convention, but the command will figure out what
the class should be called anyway.

If you want to generate a corresponding unit test with the module, just use the flag
`--test` or `-t`.

```shell
$ tweed generate important_stuff.Namespace.my-class -t
Generated src/important_stuff/Namespace/my-class.tsx # MyClass is generated
Generated __tests__/important_stuff/Namespace/my-class.test.tsx
```

> **Note:** The `generate` command will look at your environment to figure out things like
> what compiler you're using, and will generate code depending on that. If TypeScript is
> used, a `.tsx` file will be generated instead of a `.js` file. Likewise, the test that
> is generated if the `--test` flag is passed in will depend on what test framework you
> have installed. In the example above, Jest is installed, so `__tests__` and `*.test.*`
> conventions are used. For Mocha, `test` and `*Test.*` is used.

[mutations]: #/docs/quick-tour/mutations "Mutations"
[yarn]: https://yarnpkg.com "Yarn Package Manager"

Title: Installation

Installing Tweed could not be simpler. All you need is an up to date version of
[Node][node]. Since Tweed is a library rather than a framework, you don't _need_ to use
any boilerplate project or to generate a project with the CLI. Just install Tweed in your
project and start using it.

```shell
$ npm install --save tweed
```

> **Note:** If you're looking for the simplest possible way to get started, check out the
> [CLI][cli] straight away.

### Installing a Compiler
Tweed focuses on being native, and utilizing new features of the ECMAScript specification,
like classes. Classes are simply syntactic sugar over manually creating a constructor
function and populating its prototype with methods. Nothing stops you from using ES5 code
to use Tweed directly in the browser:

```html
<script src='node_modules/tweed/tweed.min.js'></script>
<script>
  function Counter () {
    this.count = 0
  }

  Tweed.mutating(Counter.prototype, 'count')

  Counter.prototype.render = function () {
    var that = this
    var attributes = {
      on: {
        click: function () { that.count++ }
      }
    }

    return Tweed.VirtualNode('button', attributes,
      'You have pressed this button ', this.count, ' times'
    )
  }
</script>
```

However, it is probably nicer for you to use a compiler that understands the syntax of
modern JavaScript or TypeScript.

To compile JavaScript, Tweed uses [Babel][babel]. [TypeScript][typescript] comes with a
full featured compiler. Both of them need to be configured, though. So Tweed provides two
packages that contain the base configurations that make the Tweed syntax work.

#### Using Babel
To use Babel, here's all you have to do:

```shell
$ npm install --dev tweed-babel-config
$ echo '{ "extends": "tweed-babel-config/config.json" }' > .babelrc
```

Then, you can use the Babel CLI or the Webpack Babel Loader, or any other way of running
Babel. We'll get to that later in this series.

#### Using TypeScript
To use TypeScript is just as easy:

```shell
$ npm install --dev tweed-typescript-config
$ echo '{ "extends": "./node_modules/tweed-typescript-config/config.json" }' > tsconfig.json
```

Then you can use `tsc` or the Webpack TypeScript Loader, or any other way of running the
TypeScript compiler. We'll get to that later as well.

---

As you can see, it's easy to set up Tweed yourself. But if you're looking for the quickest
possible way to get up and running, you might want to check out the CLI.

[cli]: #/docs/getting-started/cli "Tweed CLI"
[node]: https://nodejs.org/en/download "Download NodeJS"
[babel]: http://babeljs.io "Babel is a JavaScript compiler"
[typescript]: https://www.typescriptlang.org "TypeScript – JavaScript that scales"

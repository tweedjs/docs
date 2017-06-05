Title: Deployment

By default, Tweed runs in dev-mode. Certain operations and checks are made to enable nice
warnings and error messages during development. However, there is a performance impact.
So, for production, you'll want to build your script in production mode.

Tweed uses the same convention as other frameworks:

```javascript
if (process.env.NODE_ENV !== 'production') { ... }
```

The recommended way to build a Tweed app is using [Webpack][webpack]. When you run
`webpack -p`, Webpack will replace every instance of `process.env.NODE_ENV` in the entire
bundle with `'production'`. So the statement above will be:

```javascript
if ('production' !== 'production') { ... }
```

Which is clearly false, meaning Webpack can remove the entire if statement. This leads to
a smaller and more efficient bundle.

[webpack]: https://webpack.js.org

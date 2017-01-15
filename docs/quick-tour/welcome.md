Title: Welcome to Tweed

Tweed is a JavaScript library for building user interfaces. It is built on the idea of
loose coupling of the components that comprise your UI.

This tour will introduce you to the library, show you how to create interactive components
and how to think about data and state in your components.

### Optional Types
Tweed is written in JavaScript that includes features of the language that are proposed,
but not actually yet standardized. It also uses a syntax called JSX, which adds an
XML-like syntax to JavaScript, making it easy to move to Virtual DOM from writing common
HTML.

All these features, _are_ available in [TypeScript][typescript], though. TypeScript also
adds the ability to declare static typing in the code. Even though Tweed itself is written
in JavaScript compiled by [Babel][babel], it also comes prepackaged with external type
declarations, so that TypeScript support is available out-of-the-box. Furthermore, it is
easy to decide whether to install Babel or TypeScript specific tooling if you use the
Tweed CLI.

Whatever your preference is, all the examples on this website will be available in both
with and without static types.

[typescript]: https://www.typescriptlang.org "TypeScript Homepage"
[babel]: http://babeljs.io "Babel Homepage"

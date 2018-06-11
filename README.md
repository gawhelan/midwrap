<img src="docs/meme.jpg" alt="Midwrap generic middleware for Nodejs"/>

# Midwrap

Wrap any function in a middleware stack.

```js
const db = require('some-database');
const midwrap = require('midwrap');

const { populatePosts, cacheById } = require('./middleware');

// Fetch a `user` document
// - Returns `posts` field containing IDs
// - Hits the database everytime
const user = await db.findUserById(1);
// [from db] -> { _id: 1, email: 'jane@example.com', posts: [2, 5] }

// Create method to auto-populate the `posts` field and cache the result
db.findUserById = midwrap(cacheById, populatePosts, db.findUserById);

// Fetch a `user` document
// - Populates `posts` field with `post` documents
// - Does not hit the database if result already cached
const user = await db.findUserById(1);
// [from db/cache] ->
//    {
//      _id: 1,
//      email: 'jane@example.com',
//      posts: [
//        { _id: 2, author: 1, content: '...' },
//        { _id: 5, author: 1, content: '...' },
//      ],
//    }

```

## Apply middleware stack to a function

`midwrap([middleware1, [middleware2, ...]], func)`

`<WrappedFunc>.use(middleware1, [middleware2, ...])`

```js
const myFunc = midwrap(ware01, ware02, ware03, someFunc);
// [stack] -> [ware01, ware02, ware03, someFunc]
```

```js
const myFunc = midwrap(someFunc);
// stack -> [someFunc]

myFunc.use(ware01, ware02, ware03);
// stack -> [ware01, ware02, ware03, someFunc]
```

```js
const myFunc = midwrap(someFunc);
// stack -> [someFunc]

myFunc.use(ware01); // stack -> [ware01, someFunc]
myFunc.use(ware02); // stack -> [ware01, ware02, someFunc]
myFunc.use(ware03); // stack -> [ware01, ware02, ware03, someFunc]
```

```js
const myFunc = midwrap(ware01, ware02, someFunc);
// stack -> [ware01, ware02, someFunc]

myFunc.use(ware03) // stack -> [ware01, ware02, ware03, someFunc]
```

## Remove middleware from the stack

`<WrapedFunc>.remove(middleware1, [middleware2, ...])`

```js
const myFunc = midwrap(ware01, ware02, ware03, someFunc);
// stack -> [ware01, ware02, ware03, someFunc]

myFunc.remove(ware02); // stack -> [ware01, ware03, someFunc]
```

```js
const myFunc = midwrap(ware01, ware02, ware03, someFunc);
// stack -> [ware01, ware02, ware03, someFunc]

myFunc.remove(ware03, ware01); // stack -> [ware02, someFunc]
```

## Inject middleware into the stack

`<WrapedFunc>.use.after(targetMiddleware, [middleware1, [middleware2, ...]])`

`<WrapedFunc>.use.before(targetMiddleware, [middleware1, [middleware2, ...]])`

You can insert middleware into the stack directly after an existing
middleware.

```js
const myFunc = midwrap(ware01, ware03, someFunc);
// stack -> [ware01, ware03, someFunc]

myFunc.use.after(ware01, ware02);
// stack -> [ware01, ware02, ware03, someFunc]
```

If you pass `null` as the first argument then the middleware will be added
to the end of the stack.

```js
const myFunc = midwrap(ware01, ware02, someFunc);
// stack -> [ware01, ware02, someFunc]

myFunc.use.after(null, ware03);
// stack -> [ware01, ware02, ware03, someFunc]
```

You can insert middleware into the stack directly before an existing
middleware.

```js
const myFunc = midwrap(ware01, ware03, someFunc);
// stack -> [ware01, ware03, someFunc]

myFunc.use.before(ware03, ware02);
// stack -> [ware01, ware02, ware03, someFunc]
```

If you pass `null` as the first argument then the middleware will be added
to the front of the stack.

```js
const myFunc = midwrap(ware02, ware03, someFunc);
// stack -> [ware02, ware03, someFunc]

myFunc.use.before(null, ware01);
// stack -> [ware01, ware02, ware03, someFunc]
```

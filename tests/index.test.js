const test = require('ava');

const midwrap = require('../index.js');

const prependAlphaToReturnValue = (str, next) => `alpha ${next()}`;
const prependBetaToReturnValue = (str, next) => `beta ${next()}`;
const prependGammaToReturnValue = (str, next) => `gamma ${next()}`;

const prependAlphaToArgument = (str, next) => next(`alpha ${str}`);
const prependBetaToArgument = (str, next) => next(`beta ${str}`);

const makeUpperCase = str => str.toUpperCase();

test('No middleware applied', t => {
  const func = midwrap(makeUpperCase);

  t.is(func('foo'), 'FOO');
});

test('Empty middleware passing value', t => {
  const func = midwrap(makeUpperCase);

  t.is(func('foo'), 'FOO');

  func.use((value, next) => next(value));

  t.is(func('foo'), 'FOO');
});

test('Empty middleware not passing value', t => {
  const func = midwrap(makeUpperCase);

  t.is(func('foo'), 'FOO');

  func.use((value, next) => next());

  t.is(func('foo'), 'FOO');
});

test('Single mutating middleware', t => {
  const func = midwrap(makeUpperCase);

  t.is(func('foo'), 'FOO');

  func.use(prependAlphaToReturnValue);

  t.is(func('foo'), 'alpha FOO');
});

test('Multiple middleware added separately', t => {
  const func = midwrap(makeUpperCase);

  t.is(func('foo'), 'FOO');

  func.use(prependAlphaToReturnValue);

  t.is(func('foo'), 'alpha FOO');

  func.use(prependBetaToReturnValue);

  t.is(func('foo'), 'alpha beta FOO');

  func.use(prependGammaToReturnValue);

  t.is(func('foo'), 'alpha beta gamma FOO');
});

test('Multiple middleware added together', t => {
  const func = midwrap(makeUpperCase);

  t.is(func('foo'), 'FOO');

  func.use(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    prependGammaToReturnValue,
  );

  t.is(func('foo'), 'alpha beta gamma FOO');
});

test('Chaining `midwrap` and `use`', t => {
  const func = midwrap(makeUpperCase).use(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    prependGammaToReturnValue,
  );

  t.is(func('foo'), 'alpha beta gamma FOO');
});

test('Adding middleware with `midwrap`', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    prependGammaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta gamma FOO');
});

test('Adding before existing middleware', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta FOO');

  func.use.before(prependAlphaToReturnValue, prependGammaToReturnValue);

  t.is(func('foo'), 'gamma alpha beta FOO');
});

test('Adding before non-existing middleware', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta FOO');

  func.use.before(() => {}, prependGammaToReturnValue);

  t.is(func('foo'), 'gamma alpha beta FOO');
});

test('Adding before null', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta FOO');

  func.use.before(null, prependGammaToReturnValue);

  t.is(func('foo'), 'gamma alpha beta FOO');
});

test('Adding after existing middleware', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta FOO');

  func.use.after(prependAlphaToReturnValue, prependGammaToReturnValue);

  t.is(func('foo'), 'alpha gamma beta FOO');
});

test('Adding after non-existing middleware', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta FOO');

  func.use.after(() => {}, prependGammaToReturnValue);

  t.is(func('foo'), 'alpha beta gamma FOO');
});

test('Adding after null', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta FOO');

  func.use.after(null, prependGammaToReturnValue);

  t.is(func('foo'), 'alpha beta gamma FOO');
});

test('Modifying arguments', t => {
  const func = midwrap(makeUpperCase);

  t.is(func('foo'), 'FOO');

  func.use(prependAlphaToArgument, prependBetaToArgument);

  t.is(func('foo'), 'BETA ALPHA FOO');
});

test('Removing existing middleware', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    prependGammaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta gamma FOO');

  func.remove(prependGammaToReturnValue, prependAlphaToReturnValue);

  t.is(func('foo'), 'beta FOO');
});

test('Removing non-existing middleware', t => {
  const func = midwrap(
    prependAlphaToReturnValue,
    prependBetaToReturnValue,
    makeUpperCase,
  );

  t.is(func('foo'), 'alpha beta FOO');

  func.remove(prependGammaToReturnValue);

  t.is(func('foo'), 'alpha beta FOO');
});

test('Handle `this` correctly', t => {
  const obj = {
    greeting: 'Hello',
    greet(name) {
      return `${this.greeting} ${name}`;
    },
  };

  t.is(obj.greet('Jane'), 'Hello Jane');

  obj.greet = midwrap(obj.greet);

  t.is(obj.greet('Jane'), 'Hello Jane');

  obj.greet.use(function greet(name, next) {
    return next(`${this.greeting} ${name}`);
  });

  t.is(obj.greet('Jane'), 'Hello Hello Jane');

  obj.greet.use((name, next) => next(`${name} Doe`));

  t.is(obj.greet('Jane'), 'Hello Hello Jane Doe');
});

test('Handle optional arguments', t => {
  const join = midwrap((data, separator) => data.join(separator || ' '));

  t.is(join(['Jane', 'Bloggs'], '.'), 'Jane.Bloggs');
  t.is(join(['Jane', 'Bloggs']), 'Jane Bloggs');

  join.use((data, separator, next) => {
    const sep = separator || ' ';
    return next(data, sep + sep);
  });

  t.is(join(['Jane', 'Bloggs'], '.'), 'Jane..Bloggs');
  t.is(join(['Jane', 'Bloggs']), 'Jane  Bloggs');
});

function midwrap(...fullStack) {
  let stack = fullStack;
  const target = stack.pop();

  function wrapper(...initialArgs) {
    const it = stack[Symbol.iterator]();
    let currentArgs = initialArgs;

    const next = (...args) => {
      const { done, value: middleware } = it.next();

      currentArgs = args.length === 0 ? currentArgs : args;

      if (done) {
        return target.call(this, ...currentArgs);
      }

      return middleware.call(this, ...currentArgs, next);
    };

    return next(...currentArgs);
  }

  wrapper.use = (...middleware) => {
    stack.push(...middleware);

    return wrapper;
  };

  wrapper.remove = (...middleware) => {
    stack = stack.filter(m => !middleware.includes(m));

    return wrapper;
  };

  wrapper.use.before = (before, ...middleware) => {
    const index = stack.indexOf(before);

    stack.splice(index >= 0 ? index : 0, 0, ...middleware);

    return wrapper;
  };

  wrapper.use.after = (after, ...middleware) => {
    const index = stack.indexOf(after);

    stack.splice(index >= 0 ? index + 1 : Infinity, 0, ...middleware);

    return wrapper;
  };

  return wrapper;
}

module.exports = midwrap;

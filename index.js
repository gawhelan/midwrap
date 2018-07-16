function midwrap(...fullStack) {
  let stack = fullStack;
  const target = stack.pop();

  function wrapper(...args) {
    const chain = [...stack]
      .reverse()
      .reduce(
        (next, middleware) => middleware.call(this, next).bind(this),
        target.bind(this),
      );

    return chain.call(this, ...args);
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

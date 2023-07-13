const { objectHasProp, objectHasMethod } = require('../../support');
let data = [];

const validate = (event) => objectHasProp(event, 'assert') && objectHasMethod(event, 'handle');

exports.clear = () => {
  data = [];
}

exports.maybeRun = (channel, user, message) => {
  data
    .filter(event => event.assert(channel, user, message))
    .forEach(event => event.handle(channel, user, message));
}

exports.append = (event) => {
  if (!validate(event)) {
    throw new Error('Invalid Event Handler', { event });
  }

  data.push(event);
}
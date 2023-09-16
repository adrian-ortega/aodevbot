const { DEBUG } = require("../../config");
const chalk = require("chalk");

module.exports = ({ message, context, type, levels, timestamp, prefix }) => {
  switch (type) {
    case levels.fatal:
    case levels.error:
      message = chalk.red(message);
      break;
    case levels.warn:
      message = chalk.yellow(message);
      break;
    case levels.success:
      message = chalk.green(message);
      break;
    case levels.info:
      message = chalk.white(message);
      break;
  }

  let line = `${chalk.dim(timestamp)}`
  line += prefix ? ` ${chalk.magenta(`[${prefix}]`)}` : ""
  line += ' ' + message

  console.log.call(null, line);
  if (DEBUG && context) {
    console.log.call(null, { context });
  }
};

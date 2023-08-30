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
      message = chalk.cyan(message);
      break;
  }

  const args = [
    `${chalk.gray(timestamp)}${
      prefix ? ` ${chalk.blue(`[${prefix}]`)}` : ""
    } ${message}`,
  ];

  if (DEBUG && context) {
    args.push(context);
  }

  console.log.apply(null, args);
};

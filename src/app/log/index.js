const moment = require("moment-timezone");
const { DEFAULT_TIMEZONE } = require("../../config");
const LOGGER_FATAL = 0;
const LOGGER_ERROR = 1;
const LOGGER_WARN = 2;
const LOGGER_INFO = 3;
const LOGGER_DEBUG = 4;
const LOGGER_TRACE = 5;
const LOGGER_SUCCESS = 6;
const LEVELS = {
  fatal: LOGGER_FATAL,
  error: LOGGER_ERROR,
  warn: LOGGER_WARN,
  info: LOGGER_INFO,
  debug: LOGGER_DEBUG,
  trace: LOGGER_TRACE,
  success: LOGGER_SUCCESS,
};
const LEVEL_NAMES = {
  [LOGGER_FATAL]: "Fatal",
  [LOGGER_ERROR]: "Error",
  [LOGGER_WARN]: "Warning",
  [LOGGER_INFO]: "Info",
  [LOGGER_DEBUG]: "Debug",
  [LOGGER_TRACE]: "Trace",
  [LOGGER_SUCCESS]: "Success",
};

const handlers = [
  require("./handler"),
  require("./websocker-handler")
];

class Logger {
  constructor() {
    this.prefix = '';
  }

  withPrefix(prefix) {
    return (new Logger).setPrefix(prefix)
  }

  setPrefix(prefix) {
    this.prefix = prefix
    return this
  }

  log({ message, context = undefined, type = LOGGER_INFO, prefix }) {
    const timestampRaw = moment().tz(DEFAULT_TIMEZONE);
    const timestamp = `[${timestampRaw.format("h:mm:ss A")}]`;
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].apply(this, [
        {
          message,
          context,
          type,
          levels: LEVELS,
          levelNames: LEVEL_NAMES,
          timestamp,
          timestampRaw,
          prefix: prefix || this.prefix,
        },
      ]);
    }
    return this;
  }

  fatal(message, context, prefix) {
    return this.log({ message, context, type: LEVELS.fatal, prefix });
  };
  error(message, context, prefix) {
    return this.log({ message, context, type: LEVELS.error, prefix });
  }
  warn(message, context, prefix) {
    return this.log({ message, context, type: LEVELS.warn, prefix });
  }
  info(message, context, prefix) {
    return this.log({ message, context, type: LEVELS.info, prefix });
  }
  debug(message, context, prefix) {
    return this.log({ message, context, type: LEVELS.debug, prefix });
  }
  trace(message, context, prefix) {
    return this.log({ message, context, type: LEVELS.trace, prefix });
  }
  success(message, context, prefix) {
    return this.log({ message, context, type: LEVELS.success, prefix });
  }

}

module.exports = new Logger;

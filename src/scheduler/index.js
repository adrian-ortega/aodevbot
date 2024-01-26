const log = require('../app/log').withPrefix('Scheduler');
const cron = require("node-cron");
const broadcasterTask = require("./broadcaster.task");
const chatPointsTask = require("./chat-points.task");
const spotifyTask = require("./spotify.task");
const usersTask = require("./users.task");

//  ┌────────────── second (optional)
//  │ ┌──────────── minute
//  │ │ ┌────────── hour
//  │ │ │ ┌──────── day of month
//  │ │ │ │ ┌────── month
//  │ │ │ │ │ ┌──── day of week
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * *

const DEFAULT_TASKS = [
  {
    name: "Broadcaster Sync",
    description: "",
    frequency: "* * * * * *",
    callback: broadcasterTask,
  },
  {
    name: "Chat Points",
    description: "",
    frequency: "* * * * * *",
    callback: chatPointsTask,
  },
  {
    name: "Spotify",
    description: "",
    frequency: "* * * * * *",
    callback: spotifyTask,
  },
  {
    name: "Users Sync",
    description: "",
    frequency: "* * * * * *",
    callback: usersTask,
  },
];

// @TODO WISHLIST - use this functon to parse whatever the eventual admin
//                  puts out as a frquency. might be a Date obj.
//
const parseTaskFrequency = (frequency) => {
  return frequency;
};

const taskRunner = async ({ callback }) => {
  const args = [];
  return async function () {
    const response = await callback.callback.apply(callback, args);
    log.debug('response', response)
  };
};

const run = async () => {
  try {
    const tasks = [...DEFAULT_TASKS];

    // @TODO WISHLIST - add custom tasks that can be edited in the admin

    for (let i = 0; i < tasks.length; i++) {
      cron.schedule(
        parseTaskFrequency(tasks[i].frequency), 
        await taskRunner(taskRunner(tasks[i]))
      );
    }
  } catch (err) {
    log.error(err)
  }
};

(() => run())();

module.exports = {
  run,
};

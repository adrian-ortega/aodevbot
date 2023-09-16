const registeredEvents = [
  require("./FirstToChatEvent")
];

module.exports = (events) => {
  events.clear();
  registeredEvents.forEach((event) => events.append(event));
};

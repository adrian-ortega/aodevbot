const { Chatters } = require('../models');

exports.getBroadcaster = () => Chatters.findOne({ where: { broadcaster: true } });

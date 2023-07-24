const CHEER_REPLIES = [{
  names: ['cheers', 'prohst', 'sante', 'prohst'],
  replies: [
    'Cheers man! This goes out to you @{0}!',
    'Hey @{0}, that\'s {1} this round! Cheers bubba.',
    '🍻🍺🍻🍺 {0} 🍻🍺🍻🍺'
  ]
}, {
  names: ['salud', 'salute'],
  replies: [
    '\'pa riba, pal centro, y pa dentro @{0}!',
    '🍻🍺🍻🍺 {0} 🍻🍺🍻🍺'
  ]
}, {
  names: ['kippis'],
  replies: [
    'Ja kulaus! @{0}',
    '🍻🍺🍻🍺 {0} 🍻🍺🍻🍺'
  ]
}, {
  names: ['kanpai'],
  replies: [
    'かんぱーい！@{0}',
    '🍻🍺🍻🍺 {0} 🍻🍺🍻🍺'
  ]
}];

exports.name = () => CHEER_REPLIES
  .map(r => r.names)
  .reduce((acc, a) => [...acc, ...a.names], []);

exports.description = 'Will reply CHEERS in the correct language to the user and keep count. ';
exports.handle = async (message, state, channel, { client, commands }, resolve) => {
  // @TODO pull count from db, this will be how many times
  // the user has cheered us during this current stream

  // @TODO find the reply based on the name used (which language, !cheers vs !kanpai)

  // @TODO get a random message based on which language bank was used.
  // then format it to use the count, and name of the user using a 
  // string format function.
}
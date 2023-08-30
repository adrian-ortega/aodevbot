const parseMe = (s) =>
  s.indexOf("/me") === 0 ? `<em>${s.replace("/me", "")}</em>` : s;

exports.parseChatMessageHtml = (message, { emotes }) => {
  if (!emotes) return parseMe(message);
  const stringReplacements = [];
  Object.entries(emotes).forEach(([id, positions]) => {
    const position = positions[0];
    const [start, end] = position.split("-");
    stringReplacements.push({
      stringToReplace: message.substring(
        parseInt(start, 10),
        parseInt(end, 10) + 1,
      ),
      replacement: `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0">`,
    });

    // generate HTML and replace all emote keywords with image elements
    const parsedString = stringReplacements.reduce(
      (acc, { stringToReplace, replacement }) => {
        // obs browser doesn't seem to know about replaceAll
        return acc.split(stringToReplace).join(replacement);
      },
      message,
    );

    return parseMe(parsedString);
  });
};

const pregMatchAll = (regex, str) => {
  const newRegex = new RegExp(regex, 'g');
  const regexMatchResult = str.matchAll(newRegex);
  const matches = [...regexMatchResult];

  const reducer = (acc, group) => {

    const filterStringValues = (val) => {
      return typeof val === 'string';
    };

    const aggregator = (item, index) => {
      if (!acc[index]) {
        acc[index] = [];
      }
      acc[index].push(item);
    };

    group
      .filter(filterStringValues)
      .forEach(aggregator);

    return acc;
  };

  return matches.reduce(reducer, [])[1];
};

module.exports = {
  pregMatchAll
};

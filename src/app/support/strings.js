const EMOJI_NUMBERS = [
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
];

const PLURAL_MAP = {
  "(quiz)$": "$1zes",
  "^(ox)$": "$1en",
  "([m|l])ouse$": "$1ice",
  "(matr|vert|ind)ix|ex$": "$1ices",
  "(x|ch|ss|sh)$": "$1es",
  "([^aeiouy]|qu)y$": "$1ies",
  "(hive)$": "$1s",
  "(?:([^f])fe|([lr])f)$": "$1$2ves",
  "(shea|lea|loa|thie)f$": "$1ves",
  sis$: "ses",
  "([ti])um$": "$1a",
  "(tomat|potat|ech|her|vet)o$": "$1oes",
  "(bu)s$": "$1ses",
  "(alias)$": "$1es",
  "(octop)us$": "$1i",
  "(ax|test)is$": "$1es",
  "(us)$": "$1es",
  "([^s]+)$": "$1s",
};
const PLURAL_IRREGULAR = {
  move: "moves",
  foot: "feet",
  goose: "geese",
  sex: "sexes",
  child: "children",
  man: "men",
  tooth: "teeth",
  person: "people",
};
const PLURAL_UNCOUNTABLE = [
  "sheep",
  "fish",
  "deer",
  "moose",
  "series",
  "species",
  "money",
  "rice",
  "information",
  "equipment",
  "bison",
  "cod",
  "offspring",
  "pike",
  "salmon",
  "shrimp",
  "swine",
  "trout",
  "aircraft",
  "hovercraft",
  "spacecraft",
  "sugar",
  "tuna",
  "you",
  "wood",
];

const plural = (word, amount = 1) => {
  if (amount !== undefined && amount === 1) {
    return word;
  }

  if (PLURAL_UNCOUNTABLE.indexOf(word.toLowerCase()) > -1) {
    return word;
  }

  for (const w in PLURAL_IRREGULAR) {
    const pattern = new RegExp(`${w}$`, "i");
    const replace = PLURAL_IRREGULAR[w];
    if (pattern.test(word)) {
      return word.replace(pattern, replace);
    }
  }

  for (const reg in PLURAL_MAP) {
    const pattern = new RegExp(reg, "i");
    if (pattern.test(word)) {
      return word.replace(pattern, PLURAL_MAP[reg]);
    }
  }

  return word;
};

const pregMatchAll = (regex, str) => {
  const newRegex = new RegExp(regex, "g");
  const regexMatchResult = str.matchAll(newRegex);
  const matches = [...regexMatchResult];

  const reducer = (acc, group) => {
    const filterStringValues = (val) => {
      return typeof val === "string";
    };

    const aggregator = (item, index) => {
      if (!acc[index]) {
        acc[index] = [];
      }
      acc[index].push(item);
    };

    group.filter(filterStringValues).forEach(aggregator);

    return acc;
  };

  return matches.reduce(reducer, [])[1];
};

const stringFormat = (str, context) =>
  str.replace(/\{(\d+)\}/g, (m, n) => context[n] || m);

module.exports = {
  EMOJI_NUMBERS,
  pregMatchAll,
  plural,
  stringFormat,
};

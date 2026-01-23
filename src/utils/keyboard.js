exports.movieKeyboard = (links) => ({
  inline_keyboard: Object.entries(links).map(([q, url]) => [
    { text: q, url },
  ]),
});

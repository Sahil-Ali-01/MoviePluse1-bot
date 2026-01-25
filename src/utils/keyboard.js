exports.movieKeyboard = (links, movieKey, sizes = {}) => ({
  inline_keyboard: Object.entries(links).map(([q, url]) => [
    url ? { text: sizes[q] ? `${q} (${sizes[q]})` : q, callback_data: `download_${movieKey}_${q}` } : { text: `${q} (Not Available)`, callback_data: `no_link_${q}` }
  ]),
});

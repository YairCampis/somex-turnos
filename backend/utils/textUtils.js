const toSentenceCase = (text) => {
  if (!text || typeof text !== "string") return text;
  
  const clean = text.trim();
  if (clean.length === 0) return clean;

  const result = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  return result;
};

module.exports = {
  toSentenceCase
};

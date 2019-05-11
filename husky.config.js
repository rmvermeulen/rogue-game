module.exports = {
  hooks: {
    "pre-commit": "lerna run pre-commit",
    "pre-push": "lerna run pre-push"
  }
};

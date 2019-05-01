module.exports = {
  hooks: {
    'pre-commit': `pretty-quick --write &&
      (yarn check-deps || true) &&
      lint-staged
      `,
    'pre-push': 'yarn check-deps && jest --ci',
  },
};

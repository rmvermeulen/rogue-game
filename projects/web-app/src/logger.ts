import debug from 'debug';

const appName = 'my-app';

// localStorage.debug = `${appNamespace}:*`;

export const logger = (namespace: string) =>
  debug(`${appName}:${namespace}`);

import debug from 'debug';

const appName = 'app';

// localStorage.debug = `${appNamespace}:*`;

export const logger = (namespace: string) => debug(`${appName}:${namespace}`);

import { logger } from './logger';

const debug = logger('index.ts');

window.onload = () => {
  debug('window loaded');

  const label = createLabel('Typescript running!');
  document.body.append(label);

  debug('added label');
};

export const createLabel = (text: string) => {
  const label = document.createElement('h1');
  label.textContent = text;
  return label;
};

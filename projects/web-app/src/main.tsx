import React from 'react';
import { render } from 'react-dom';
import { create } from 'axios';

import { GridEditor } from './GridEditor';
import { logger } from './logger';

const debug = logger('main');

export const axios = create({
  baseURL: 'http://localhost:3000/',
  timeout: 1000,
  //   headers: {'X-Custom-Header': 'foobar'}
});

const container = document.createElement('div');
document.body.appendChild(container);
render(<GridEditor />, container);

debug('App running, react rendering');

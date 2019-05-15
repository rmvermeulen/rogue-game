import axios from 'axios';
import React from 'react';
import { render } from 'react-dom';

import { logger } from '@utils/logger';

import { GridEditor } from '@containers/GridEditor';

const debug = logger('main');

const server = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 1000,
  //   headers: {'X-Custom-Header': 'foobar'}
});

const container = document.createElement('div');
document.body.appendChild(container);
render(<GridEditor server={server} />, container);

debug('App running, react rendering');

import React from 'react';
import { render } from 'react-dom';

import { httpClient } from '@utils/httpClient';
import { logger } from '@utils/logger';

import { ApiContext } from '@containers/ApiContext';
import { GridEditor } from '@containers/GridEditor';

const debug = logger('main');

const container = document.body.appendChild(document.createElement('div'));

debug(httpClient);

render(
  <ApiContext.Provider value={httpClient}>
    <GridEditor />
  </ApiContext.Provider>,
  container,
);

debug('App running, react rendering');

import { resolve } from 'bluebird';
import React from 'react';

import { logger } from '@utils/logger';

import { ApiContext } from '@containers/ApiContext';

const debug = logger('grid-editor');

// tslint:disable-next-line: no-empty-interface
interface Props {}
interface State {
  data?: {};
  error?: string;
}

const GridForm: React.SFC = (props) => {
  return <div>this will be a form</div>;
};

export class GridEditor extends React.Component<Props, State> {
  public static contextType = ApiContext;
  private fetchTimer?: number;
  public componentDidMount() {
    debug('componentDidMount');
    return this.fetch();
  }
  public render() {
    let display = <p>loading...</p>;
    if (this.state) {
      const { data, error } = this.state;
      if (data) {
        display = <pre>{data}</pre>;
      } else if (error) {
        display = <strong>{error}</strong>;
      }
    }
    return (
      <>
        <div>grid editor</div>
        <GridForm />
        {display}
      </>
    );
  }

  public componentWillUnmount() {
    this.clearFetchTimer();
  }

  private clearFetchTimer() {
    clearTimeout(this.fetchTimer);
    this.fetchTimer = undefined;
  }

  private async fetch() {
    this.clearFetchTimer();

    return resolve(
      this.context.get('/grid', {
        params: {
          width: 25,
          height: 15,
          roomCount: 50,
          seed: 999,
        },
        json: true,
      }),
    )
      .asCallback((error, data) => this.setState({ data, error }))
      .finally(() => {
        this.fetchTimer = setTimeout(() => this.fetch(), 5e3);
      });
  }
}

import { resolve } from 'bluebird';
import React from 'react';

import { logger } from './logger';
import { axios } from './main';

const debug = logger('grid-editor');

interface Props {}
type State =
  | {
      data: {};
    }
  | {
      error: string;
    };

const GridForm: React.SFC = (props) => {
  return <div>this will be a form</div>;
};

export class GridEditor extends React.Component<Props, State> {
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
      axios.get('/grid', {
        params: {
          width: 25,
          height: 15,
          roomCount: 50,
          seed: 999,
        },
        json: true,
      }),
    )
      .then(({ data }) => this.setState({ data }))
      .tapCatch(console.error)
      .catch((error: Error) => this.setState({ error: error.message }))
      .finally(() => {
        this.fetchTimer = setTimeout(() => this.fetch(), 5e3);
      });
  }
}

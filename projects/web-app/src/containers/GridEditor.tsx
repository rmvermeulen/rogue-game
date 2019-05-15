import { AxiosInstance } from 'axios';
import { delay } from 'bluebird';
import React from 'react';

import { logger } from '@utils/logger';

import { GridEditForm } from '@components/GridEditForm';
import { GridInfoDisplay } from '@components/GridInfoDisplay';

import { ErrorBoundary } from '@containers/ErrorBoundary';

import { GridDescription } from '@defs/grid';

const apiDebounceMs = 300;

const debug = logger('GridEditor');

export interface GridEditorState {
  completedRequests: number;
  gridInfo: GridDescription;
  loading: boolean;
  data: null | {};
}

export interface GridEditorProps {
  server: AxiosInstance;
}

export class GridEditor extends React.Component<
  GridEditorProps,
  GridEditorState
> {
  public state = {
    completedRequests: 0,
    loading: false,
    gridInfo: {
      width: 10,
      height: 10,
      roomCount: 10,
    },
    data: null,
  };
  private cancelRequest?: () => void;
  public componentDidMount() {
    debug('componentDidMount');
    return this.fetch(this.state.gridInfo);
  }
  public render() {
    debug('render');
    const { data, gridInfo, loading, completedRequests } = this.state;

    return (
      <ErrorBoundary>
        <GridEditForm
          grid={gridInfo}
          submit={(update: GridDescription) => {
            this.setState({ gridInfo: update });
            this.fetch(update);
          }}
        />
        <p>completed requests: {completedRequests}</p>
        <pre>{data}</pre>
        <GridInfoDisplay grid={data} />
        {loading && <p>loading...</p>}
      </ErrorBoundary>
    );
  }

  private async fetch({
    width,
    height,
    roomCount,
    seed,
  }: Partial<GridDescription> = {}) {
    if (this.cancelRequest) {
      this.cancelRequest();
    }
    this.setState({ loading: true });
    let isCancelled = false;
    this.cancelRequest = () => {
      isCancelled = true;
      this.cancelRequest = undefined;
    };

    delay(apiDebounceMs)
      .then(() => {
        if (isCancelled) {
          return;
        }
        return this.props.server
          .get<GridDescription>('/grid', {
            params: {
              width,
              height,
              roomCount,
              seed,
            },
          })
          .then(({ data }) =>
            this.setState({
              data,
              completedRequests: this.state.completedRequests + 1,
            }),
          );
      })
      .finally(() => {
        this.setState({ loading: false });
        this.cancelRequest = undefined;
      });
  }
}

import React from 'react';

import { logger } from '@utils/logger';

import { ErrorWrapper } from '@components/ErrorWrapper';

const debug = logger('ErrorBoundary');

interface ErrorBoundaryState {
  message: null | string;
}

export class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {
  public static getDerivedStateFromError({ message }: Error) {
    // Update state so the next render will show the fallback UI.
    return { message };
  }
  public state: ErrorBoundaryState = { message: null };

  public componentDidCatch(error: Error, info: { componentStack: string }) {
    // You can also log the error to an error reporting service
    debug(error.message);
    debug(info.componentStack);
  }

  public render() {
    if (this.state.message) {
      return <ErrorWrapper message={this.state.message} />;
    }

    return this.props.children;
  }
}

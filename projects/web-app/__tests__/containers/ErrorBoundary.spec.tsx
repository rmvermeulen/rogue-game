import 'jest-extended';
import React, { Component } from 'react';
import renderer, { ReactTestRenderer } from 'react-test-renderer';

import { ErrorBoundary } from '@containers/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('is an error-boundary', () => {
    expect(ErrorBoundary).toHaveProperty(
      'getDerivedStateFromError',
      expect.toBeFunction(),
    );
    expect(new ErrorBoundary({}, {})).toHaveProperty(
      'componentDidCatch',
      expect.toBeFunction(),
    );
  });

  let testDOM: ReactTestRenderer;

  beforeAll(() => {
    testDOM = renderer.create(
      <ErrorBoundary>
        <h1>Status</h1>
        <p>Everything is ok!</p>
      </ErrorBoundary>,
    );
  });

  it('renders children when ok', () => {
    expect(testDOM.toJSON()).toMatchInlineSnapshot(`
                        Array [
                          <h1>
                            Status
                          </h1>,
                          <p>
                            Everything is ok!
                          </p>,
                        ]
                `);
  });

  it('render error-component on error', () => {
    const component: ErrorBoundary = testDOM.getInstance();
    expect(component).not.toBeNull();
    component.setState({ message: 'Error! with a message!' });
    expect(testDOM.toJSON()).toMatchInlineSnapshot(`
      <div
        className="sc-bdVaJa jxCGKD"
      >
        <h2>
          Something went wrong!
        </h2>
        <pre>
          Error! with a message!
        </pre>
      </div>
    `);
  });
});

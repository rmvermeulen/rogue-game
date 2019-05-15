import { compose, path } from 'ramda';
import { ChangeEvent } from 'react';

export type Event = ChangeEvent<HTMLInputElement>;

const callFnWithEventTargetProp = (prop: keyof Event['target']) => (
  fn: (value: string) => void,
) =>
  compose<Event, string, void>(
    fn,
    path(['target', prop]) as any,
  );

export const fromEvent = callFnWithEventTargetProp('value');

export const fromEventNum = callFnWithEventTargetProp('valueAsNumber');

export const fromEventDate = callFnWithEventTargetProp('valueAsDate');

export const fromCheckbox = callFnWithEventTargetProp('checked');

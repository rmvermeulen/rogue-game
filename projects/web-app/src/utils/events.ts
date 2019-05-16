import { compose, path } from 'ramda';
import { ChangeEvent } from 'react';

export type Event = ChangeEvent<HTMLInputElement>;

const callFnWithEventTargetProp = <T = string>(prop: keyof Event['target']) => (
  fn: (value: T) => void,
) =>
  compose<Event, T, void>(
    fn,
    path(['target', prop]) as any,
  );

export const fromEvent = callFnWithEventTargetProp('value');

export const fromEventNum = callFnWithEventTargetProp<number>('valueAsNumber');

export const fromEventDate = callFnWithEventTargetProp<Date>('valueAsDate');

export const fromCheckbox = callFnWithEventTargetProp<boolean>('checked');

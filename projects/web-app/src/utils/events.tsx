import { ChangeEvent } from 'react';

export const fromEvent = (fn: (value: number) => void) => (
  event: ChangeEvent<HTMLInputElement>,
) => fn(event.target.valueAsNumber);

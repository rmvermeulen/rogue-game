import {
  Event,
  fromCheckbox,
  fromEvent,
  fromEventDate,
  fromEventNum,
} from '@utils/events';

describe('Event handler utils', () => {
  test('fromEvent', () => {
    const mock = jest.fn();
    const event = { target: { value: 'value' } };
    fromEvent(mock)(event as Event);
    expect(mock).toHaveBeenCalledWith(event.target.value);
  });

  test('fromEventNum', () => {
    const mock = jest.fn();
    const event = { target: { valueAsNumber: 0 } };
    fromEventNum(mock)(event as Event);
    expect(mock).toHaveBeenCalledWith(event.target.valueAsNumber);
  });

  test('fromEventDate', () => {
    const mock = jest.fn();
    const event = { target: { valueAsDate: '12-11-19' } };
    fromEventDate(mock)(event as Event);
    expect(mock).toHaveBeenCalledWith(event.target.valueAsDate);
  });

  test('fromCheckbox', () => {
    const mock = jest.fn();
    const event = { target: { checked: 'true' } };
    fromCheckbox(mock)(event as Event);
    expect(mock).toHaveBeenCalledWith(event.target.checked);
  });
});

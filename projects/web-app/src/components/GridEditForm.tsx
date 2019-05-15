import { assoc } from 'ramda';
import React, { InputHTMLAttributes, useState } from 'react';
import styled from 'styled-components';

import { fromEvent } from '@utils/events';
import { logger } from '@utils/logger';

import { GridDescription } from '@defs/grid';

const debug = logger('GridEditForm');

export interface IGridEditFormProps {
  grid: GridDescription;
  submit(data: GridDescription): void;
}

type LabeledInputProps = InputHTMLAttributes<HTMLInputElement>;

const MyInput = styled.input`
  display: block;
  font-size: 11px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  width: 70px;
  margin: 2px 0 20px 10px;
`;

const LabeledInput = ({ name, children, ...inputArgs }: LabeledInputProps) => (
  <>
    <label htmlFor={name}>{children}</label>
    <MyInput name={name} {...inputArgs} />
  </>
);
export const GridEditForm: React.SFC<IGridEditFormProps> = ({
  grid,
  submit,
}) => {
  const [seedIsRandom, setSeedIsRandom] = useState(
    typeof grid.seed === 'undefined',
  );

  const { width, height, roomCount, seed = 0 } = grid;

  const set = (prop: keyof typeof grid) => (value?: number): void => {
    if (value === Number(value)) {
      submit(assoc(prop, value, grid));
    }
  };

  return (
    <>
      <form>
        <LabeledInput
          name="width"
          value={width}
          type="number"
          onChange={fromEvent(set('width'))}
        >
          Width
        </LabeledInput>
        <LabeledInput
          name="height"
          value={height}
          type="number"
          onChange={fromEvent(set('height'))}
        >
          Height
        </LabeledInput>
        <LabeledInput
          name="roomCount"
          value={roomCount}
          type="number"
          onChange={fromEvent(set('roomCount'))}
        >
          The amount of rooms
        </LabeledInput>
        {/* <LabeledInput
          name="seedIsRandom"
          checked={seedIsRandom}
          type="checkbox"
          onChange={(e) => setSeedIsRandom(e.target.checked)}
        >
          Use a random seed each time
        </LabeledInput> */}
        <LabeledInput
          name="seed"
          value={seed}
          type="number"
          onChange={fromEvent(set('seed'))}
          disabled={seedIsRandom}
        >
          Seed (random
          <span>
            <input
              name="seedIsRandom"
              checked={seedIsRandom}
              type="checkbox"
              onChange={(e) => setSeedIsRandom(e.target.checked)}
            />
          </span>
          )
        </LabeledInput>
      </form>
    </>
  );
};

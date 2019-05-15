import React from 'react';

export interface IGridInfoDisplayProps {
  grid: null | {};
}

export const GridInfoDisplay = (props: IGridInfoDisplayProps) => {
  if (!props.grid) {
    return <p>no info</p>;
  }
  return <p>grid info display component</p>;
};

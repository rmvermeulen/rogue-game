import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: red;
  text-color: black;
`;

export const ErrorWrapper = ({ message }: { message: string }) => (
  <Wrapper>
    <h2>Something went wrong!</h2>
    <pre>{message}</pre>
  </Wrapper>
);

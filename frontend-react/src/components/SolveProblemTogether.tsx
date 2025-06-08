import React from 'react';
import styled from "styled-components";

const SolveProblemTogether = () => {
  return (
    <SolveWrapper>
      <h2 style={{ color: "white" }}>Здесь будет совместное решение задачи</h2>
    </SolveWrapper>
  );
};

const SolveWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #1a1a1a;
`;

export default SolveProblemTogether;
import React from 'react';
import styled from "styled-components";
import type { GetProblemResponse } from "../interfaces/api/responses/GetProblemsResponse.ts";

const SolveProblemTogether = ({ problem }: { problem: GetProblemResponse }) => {
  return (
    <SolveWrapper>
      <ProblemCard>
        <h2>{problem.name}</h2>
        <p>{problem.description}</p>
        <LevelTag level={problem.level}>Level: {["Easy", "Medium", "Hard"][problem.level - 1]}</LevelTag>
      </ProblemCard>
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

const ProblemCard = styled.div`
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  color: white;
  box-shadow: 0 0 10px #a4161a;
`;

const LevelTag = styled.div<{ level: number }>`
  margin-top: 1rem;
  font-weight: bold;
  color: white;
  background-color: ${({ level }) =>
  level === 1 ? '#70e000' : level === 2 ? '#f48c06' : '#d00000'};
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  display: inline-block;
`;

export default SolveProblemTogether;

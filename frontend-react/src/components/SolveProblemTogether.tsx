import React, { useState } from "react";
import styled from "styled-components";
import { FaBolt } from "react-icons/fa";
import type { GetProblemResponse } from "../interfaces/api/responses/GetProblemsResponse.ts";
import { useGetTestCases } from "../hooks/api/useGetTestCases.ts";

const SolveProblemTogether = ({ problem }: { problem: GetProblemResponse }) => {
  const { data: testCases = [], isLoading: isLoadingTests } = useGetTestCases(problem.id);
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  const activeTest = testCases[activeTestIndex];
  return (
    <Wrapper>
      <ProblemCard>
        <Title>
          <FaBolt color="#a4161a" style={{ marginRight: "0.5rem" }} />
          {problem.name}
          <LevelTag level={problem.level}>
            {["Easy", "Medium", "Hard"][problem.level - 1]}
          </LevelTag>
        </Title>

        <Description>{problem.description}</Description>

        <TestWrapper>
          {testCases.length > 0 && (
            <Dropdown
              value={activeTestIndex}
              onChange={(e) => setActiveTestIndex(Number(e.target.value))}
            >
              {testCases.map((_, index) => (
                <option key={index} value={index}>
                  Test {index + 1}
                </option>
              ))}
            </Dropdown>
          )}

          {activeTest && (
            <TestDetails>
              <h4>Input</h4>
              <CodeBlock>
                {activeTest.isHidden ? "Hidden" : activeTest.input?.replace("\\n", " ")}
              </CodeBlock>
              <h4>Expected Output</h4>
              <CodeBlock>
                {activeTest.isHidden ? "Hidden" : activeTest.output}
              </CodeBlock>
            </TestDetails>
          )}
        </TestWrapper>
      </ProblemCard>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  box-shadow: 0 0 20px rgba(164, 22, 26, 0.5);
  height: 100%;
  border-radius: 10px;
`;

const ProblemCard = styled.div`
  padding: 2rem;
  color: #fff;
  min-width: 1000px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #ffffff;
  border-bottom: 2px solid #a4161a;
  padding-bottom: 0.5rem;
  gap: 30px;
`;

const Description = styled.p`
  border-radius: 15px;
  padding: 10px;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #e0e0e0;
  min-height: 250px;
  overflow: auto;
  box-shadow: 0 0 20px rgba(164, 22, 26, 0.5);
`;

const LevelTag = styled.div<{ level: number }>`
  display: inline-block;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  background-color: ${({ level }) =>
          level === 1 ? "#70e000" : level === 2 ? "#f48c06" : "#d00000"};
  color: #000;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
`;

const TestWrapper = styled.div`
  margin-top: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ active: boolean }>`
  background-color: ${({ active }) => (active ? "#a4161a" : "#333")};
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #a4161a;
  }
`;

const TestDetails = styled.div`
  background-color: #2a2a2a;
  padding: 1rem;
  border-radius: 12px;
  border: 0.1px solid #ffffff;
`;

const CodeBlock = styled.pre`
  background-color: #111;
  padding: 0.8rem;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  overflow-x: auto;
  margin-bottom: 1rem;
`;

const Dropdown = styled.select`
  background-color: #333;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #a4161a;
  margin-bottom: 1rem;
  font-weight: bold;

  &:focus {
    outline: none;
    border-color: #f48c06;
  }
`;

export default SolveProblemTogether;

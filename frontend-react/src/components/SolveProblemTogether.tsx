import React, { useState } from "react";
import styled, {keyframes} from "styled-components";
import type { GetProblemResponse } from "../interfaces/api/responses/GetProblemsResponse.ts";
import { useGetTestCases } from "../hooks/api/useGetTestCases.ts";
import { FaBolt, FaPaperPlane } from "react-icons/fa";
import { Box, Typography } from "@mui/material";
import {useTaskSolutionPolling} from "../hooks/api/useTaskSolutionPolling.ts";
import {usePostTaskSolution} from "../hooks/api/usePostTaskSolution.ts";
import {TestHistory} from "./SidePanelComponent.tsx";

const SolveProblemTogether = ({ problem }: { problem: GetProblemResponse }) => {
  const { data: testCases = [], isLoading: isLoadingTests } = useGetTestCases(problem.id);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const activeTest = testCases[activeTestIndex];
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [code, setCode] = useState("");

  const [progress, setProgress] = useState(70);
  const [opponentProgress, setOpponentProgress] = useState(80);

  const { mutate: sendTaskSolution} = usePostTaskSolution();
  const [solutionTaskId, setSolutionTaskId] = useState<number | null>(null);
  const {
    status: solutionTaskStatus,
    isPending: isTaskPolling,
    isError: isTaskPollError,
    isTaskSuccess,
    isTaskFailed,
    results: solutionResults,
  } = useTaskSolutionPolling(solutionTaskId);

  const handleSubmitSolution = () => {
    sendTaskSolution(
      { problemId: problem.id, code },
      {
        onSuccess: (returnedSolutionId) => {
          setSolutionTaskId(returnedSolutionId);
        },
      }
    );

    setSolutionTaskId(null);
  };

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
        <Button onClick={() => setIsEditorOpen(true)}>Открыть редактор</Button>
        <Box sx={{ width: "100%", mt: 3 }}>
          <Typography variant="body2" sx={{ color: "white", mb: 1 }}>
            Прогресс выполнения: {progress}%
          </Typography>
          <AnimatedProgress value={progress} />
          {/*<Button style={{ marginTop: "1rem" }} onClick={() => setProgress(progress === 70 ? 30 : 70)}>*/}
          {/*  Сменить прогресс*/}
          {/*</Button>*/}
        </Box>

        <Box sx={{ width: "100%", mt: 3 }}>
          <Typography variant="body2" sx={{ color: "white", mb: 1 }}>
            Прогресс соперника: {opponentProgress}%
          </Typography>
          <AnimatedProgress value={opponentProgress} />
          {/*<Button style={{ marginTop: "1rem" }} onClick={() => setOpponentProgress(opponentProgress === 80 ? 20 : 80)}>*/}
          {/*  Сменить прогресс соперника*/}
          {/*</Button>*/}
        </Box>

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
      {isEditorOpen && (
        <EditorPanel>
          <EditorHeader>
            <span>Редактор кода</span>
            <CloseButton onClick={() => setIsEditorOpen(false)}>✕</CloseButton>
          </EditorHeader>
          <EditorContainer>
            <LineNumbers>
              {Array.from({ length: code.split("\n").length }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </LineNumbers>
            <StyledTextarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Напишите ваш код здесь..."
              spellCheck={false}
            />
          </EditorContainer>
          <HistoryWrapper>
            <TestHistory solutionResults={solutionResults}/>
            <SubmitButton onClick={handleSubmitSolution}>
              {solutionTaskId === null
                ?
                  <Spinner />
                :
                 <>
                   <FaPaperPlane style={{ marginRight: "0.5rem" }} />
                   Отправить решение
                 </>
              }
            </SubmitButton>
          </HistoryWrapper>
        </EditorPanel>
      )}
    </Wrapper>
  );
};

const AnimatedProgress = ({ value }: { value: number }) => {
  const [prevValue, setPrevValue] = useState(value);

  React.useEffect(() => {
    setPrevValue(value);
  }, [value]);

  return (
    <ProgressWrapper>
      <AnimatedBar from={prevValue} to={value} />
    </ProgressWrapper>
  );
};

const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const fillAnimation = (from: number, to: number) => keyframes`
  from {
    width: ${from}%;
  }
  to {
    width: ${to}%;
  }
`;

const AnimatedBar = styled.div<{ from: number; to: number }>`
  height: 100%;
  background-color: ${({ to }) => (to > 50 ? "#70e000" : "#f48c06")};
  border-radius: 5px;
  animation: ${({ from, to }) => fillAnimation(from, to)} 0.8s ease-in-out forwards;
`;

const ProgressWrapper = styled.div`
  background-color: #333;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  width: 100%;
`;

const HistoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 500px;
`;

const Button = styled.button`
  background-color: #a4161a;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #d00000;
  }
`;

const EditorPanel = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  width: 700px;
  height: 100%;
  background-color: #1a1a1a;
  border-left: 2px solid #a4161a;
  padding: 1rem;
  box-shadow: -2px 0 10px rgba(164, 22, 26, 0.3);
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  z-index: 1000;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  color: white;
  font-size: 1.2rem;
  border: none;
  cursor: pointer;

  &:hover {
    color: #f40606;
  }
`;

const EditorContainer = styled.div`
  display: flex;
  background-color: #111;
  border-radius: 8px;
  border: 1px solid #333;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(164, 22, 26, 0.3);
  flex: 1;
  max-height: 600px;
`;

const LineNumbers = styled.div`
  background-color: #1c1c1c;
  color: #888;
  text-align: right;
  padding: 1rem 0.5rem;
  user-select: none;
  font-family: "Courier New", monospace;
  font-size: 0.95rem;
  line-height: 1.5rem;
  min-width: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  background-color: #111;
  color: #fff;
  padding: 1rem;
  border: none;
  resize: none;
  font-family: "Courier New", monospace;
  font-size: 0.95rem;
  line-height: 1.5rem;
  outline: none;
  overflow-y: auto;
`;

const SubmitButton = styled.button`
  background-color: #e00000;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #690000;
  }
`;


const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  box-shadow: 0 0 20px rgba(164, 22, 26, 0.5);
  height: 100vh;
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
  height: 280px;
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

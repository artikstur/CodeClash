import React, {useEffect, useState} from "react";
import styled, {keyframes} from "styled-components";
import type { GetProblemResponse } from "../interfaces/api/responses/GetProblemsResponse.ts";
import { useGetTestCases } from "../hooks/api/useGetTestCases.ts";
import { FaBolt, FaPaperPlane } from "react-icons/fa";
import { Box, Typography } from "@mui/material";
import {useTaskSolutionPolling} from "../hooks/api/useTaskSolutionPolling.ts";
import {usePostTaskSolution} from "../hooks/api/usePostTaskSolution.ts";
import {TestHistory} from "./SidePanelComponent.tsx";
import {HubConnection} from "@microsoft/signalr";

const SolveProblemTogether = ({ problem, connection, roomCode, nickname, setMode }:
                                { problem: GetProblemResponse, connection: HubConnection | null, roomCode: string, nickname: string, setMode: () => void; }) => {
  const { data: testCases = [], isLoading: isLoadingTests } = useGetTestCases(problem.id);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const activeTest = testCases[activeTestIndex];
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [code, setCode] = useState("");
  const [progress, setProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);

  const [timer, setTimer] = useState<number>(30);
  const [winner, setWinner] = useState<string | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

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

  useEffect(() => {
    if (solutionResults && solutionResults.length > 0) {
      const passedCount = solutionResults.filter(r => r.solution.solutionStatus === 3).length;
      const totalCount = solutionResults.length;
      const progressPercent = Math.round((passedCount / totalCount) * 100);

      if (progressPercent > progress) {
        setProgress(progressPercent);
      }
    }
  }, [solutionResults]);

  const handleSubmitSolution = () => {
    sendTaskSolution(
      { problemId: problem.id, code },
      {
        onSuccess: (returnedSolutionId) => {
          setSolutionTaskId(returnedSolutionId);
        },
      }
    );
  };

  useEffect(() => {
    if (!connection) return;

    connection.on("ReceiveProgressUpdate", (oppNickname, oppProgress) => {
      if (oppNickname !== nickname) {
        setOpponentProgress(oppProgress)
      }
    });

    connection.on("TimerUpdate", (seconds: number) => {
      setTimer(seconds);
    });

    connection.on("GameOver", (winnerNickname: string | null, comment: string | null) => {
      console.log(winnerNickname)
      setWinner(winnerNickname);
      setShowWinnerModal(true);

      if (comment !== null) {
        setComment(comment);
      }
    });
  }, [connection]);

  useEffect(() => {
    if (connection && progress !== 0) {
      connection.invoke("UpdateProgress", roomCode, progress, nickname);
    }
  }, [progress]);

  return (
    <Wrapper>
      <ProblemCard>
        <Box sx={{ mt: 2 }}>
          <TimerWrapper>
            <TimeBar value={timer} max={10} />
            <TimeText>{timer} сек.</TimeText>
          </TimerWrapper>
        </Box>
        {winner && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" color={winner === nickname ? 'lightgreen' : 'orange'}>
              {winner === nickname ? '🎉 Вы победили!' : `Победил ${winner}`}
            </Typography>
          </Box>
        )}
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
        </Box>

        <Box sx={{ width: "100%", mt: 3 }}>
          <Typography variant="body2" sx={{ color: "white", mb: 1 }}>
            Прогресс соперника: {opponentProgress}%
          </Typography>
          <AnimatedProgress value={opponentProgress} />
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
              {isTaskPolling || solutionResults === null
                ?
                  <Spinner />
                :
                 <>
                   <FaPaperPlane style={{ marginRight: "0.5rem", color: "white" }} />
                   Отправить решение
                 </>
              }
            </SubmitButton>
          </HistoryWrapper>
        </EditorPanel>
      )}
      {showWinnerModal && (
        <WinnerOverlay>
          <WinnerCard>
            <h2>
              {winner === null || winner === ''
                ? 'Паритет. Оба Игрока набрали одинаковое количество очков'
                : winner === nickname
                  ? `🎉 Вы победили! ${comment}`
                  : `Победил ${winner}`}
            </h2>
            <CloseButton onClick={() => setMode("select")}>Закрыть</CloseButton>
          </WinnerCard>
        </WinnerOverlay>
      )}
    </Wrapper>
  );
};

const TimerWrapper = styled.div`
  position: relative;
  height: 20px;
  width: 100%;
  background: #222;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
`;

const TimeBar = styled.div<{ value: number; max: number }>`
  width: ${({ value, max }) => (value / max) * 100}%;
  height: 100%;
  background: ${({ value }) =>
  value > 5 ? "#70e000" : value > 3 ? "#f48c06" : "#d00000"};
  transition: width 1s linear;
`;

const TimeText = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-weight: bold;
  font-size: 0.95rem;
  line-height: 20px;
`;

const WinnerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WinnerCard = styled.div`
  background: #1a1a1a;
  border: 3px solid #a4161a;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  color: white;
  animation: showModal 0.5s ease-out;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #f48c06;
  }

  @keyframes showModal {
    from {
      opacity: 0;
      transform: scale(0.7);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

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
  margin-top: 50px;
  width: 100%;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e00000;
  color: #ffffff;
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

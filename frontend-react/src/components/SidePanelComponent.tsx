import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import styled from "styled-components";
import type { TestCase } from "../interfaces/api/core/TestCase.ts";
import type { SolutionResult } from "../interfaces/api/responses/SolutionResult.ts";

type Props = {
  open: boolean;
  width: number;
  code: string;
  onCodeChange: (value: string) => void;
  selectedTestId: number;
  onSelectTest: (id: number) => void;
  visibleTests: TestCase[];
  onRunTest: () => void;
  onSubmitSolution: () => void;
  onClose: () => void;
  onStartResize: (e: React.MouseEvent) => void;
  isPolling: boolean;
  solutionResults?: SolutionResult[];
  isTaskSuccess?: boolean;
  isTaskFailed?: boolean;
};

const SidePanelComponent = ({
                              open,
                              width,
                              code,
                              onCodeChange,
                              selectedTestId,
                              onSelectTest,
                              visibleTests,
                              onRunTest,
                              onSubmitSolution,
                              onClose,
                              onStartResize,
                              isPolling,
                              solutionResults = [],
                              isTaskSuccess,
                              isTaskFailed,
                            }: Props) => {
  useEffect(() => {
    console.log(solutionResults);
  }, [solutionResults]);

  return (
    <SidePanel open={open} width={width}>
      <ResizeHandle onMouseDown={onStartResize} />
      <PanelHeader>
        <span>Редактор</span>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </PanelHeader>

      <Label>Твой код</Label>
      <CodeEditorWrapper>
        <LineNumbers>
          {code.split("\n").map((_, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </LineNumbers>
        <StyledTextarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Напиши здесь решение..."
        />
      </CodeEditorWrapper>

      <Label>Выбери тест</Label>
      <Select onChange={(e) => onSelectTest(Number(e.target.value))} value={selectedTestId}>
        {visibleTests.map((test, index) => (
          <option key={test.id} value={test.id}>
            Пример #{index + 1}
          </option>
        ))}
      </Select>

      <ButtonRow>
        <ActionButton onClick={onRunTest} disabled={isPolling}>
          {isPolling ? <Spinner /> : "Отправить тест"}
        </ActionButton>
        <ActionButton onClick={onSubmitSolution} disabled={isPolling}>
          {isPolling ? <Spinner /> : "Отправить решение"}
        </ActionButton>
      </ButtonRow>
      <TestHistory solutionResults={solutionResults} />

    </SidePanel>
  );
};

const TestHistory = ({ solutionResults }: { solutionResults: SolutionResult[] }) => {
  if (!solutionResults.length) {
    return <HistoryEmpty>История тестов пуста</HistoryEmpty>;
  }

  return (
    <HistoryWrapper>
      <HistoryTitle>История тестов</HistoryTitle>
      <HistoryList>
        {solutionResults.map(({ testCase, solution }) => {
          const statusColor =
            solution.solutionStatus === 3
              ? "#4caf50"
              : solution.solutionStatus === 2
                ? "#e63946"
                : "#f4a261";

          return (
            <HistoryItem key={solution.id}>
              <TestHeader>
                <TestNumber>Тест #{testCase.id}</TestNumber>
                <TestDate>{new Date(solution.testDate).toLocaleString()}</TestDate>
                <StatusDot color={statusColor} title={getStatusText(solution.solutionStatus)} />
              </TestHeader>

              <IOWrapper>
                <IODiv>
                  <IOHeader>Входные данные</IOHeader>
                  <IOContent>{testCase.input || "(пусто)"}</IOContent>
                </IODiv>
                <IODiv>
                  <IOHeader>Ожидаемый вывод</IOHeader>
                  <IOContent>{testCase.output || "(пусто)"}</IOContent>
                </IODiv>
                <IODiv>
                  <IOHeader>Вывод решения</IOHeader>
                  <IOContent isError={solution.solutionStatus !== 3}>
                    {solution.outPut ?? "(нет данных)"}
                  </IOContent>
                </IODiv>
              </IOWrapper>
            </HistoryItem>
          );
        })}
      </HistoryList>
    </HistoryWrapper>
  );
};

function getStatusText(status: number) {
  switch (status) {
    case 1:
      return "В процессе";
    case 2:
      return "Ошибка";
    case 3:
      return "Успех";
    default:
      return "Неизвестно";
  }
}

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin: auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Label = styled.span`
  color: #ccc;
  font-weight: bold;
  font-size: 0.95rem;
`;

const CodeEditorWrapper = styled.div`
  display: flex;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  font-family: "Fira Code", "Source Code Pro", monospace;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: inset 0 0 5px #000;
  max-height: 250px;
  min-height: 250px;
`;

const LineNumbers = styled.div`
  background: #1a1a1a;
  color: #555;
  padding: 1rem 0.5rem;
  text-align: right;
  user-select: none;
  min-width: 40px;
  border-right: 1px solid #333;
  line-height: 1.5;
  font-size: 14px;

  span {
    display: block;
  }
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #d4d4d4;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  overflow: auto;

  &::selection {
    background: rgba(214, 40, 40, 0.6);
    color: white;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #666;
  }
`;

const Select = styled.select`
  background: #222;
  border: 1px solid #444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: inherit;
  min-width: 160px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button`
  background: linear-gradient(90deg, #d62828, #a4161a);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  width: 150px;
  height: 60px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SidePanel = styled.div<{ open: boolean; width: number }>`
  position: fixed;
  top: 0;
  right: 0;
  width: ${({ width }) => width}px;
  background: #1a1a1a;
  border-left: 1px solid #333;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transform: ${({ open, width }) => (open ? "translateX(0)" : `translateX(${width}px)`)};
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  overflow-y: auto;
  height: 100%;
`;

const ResizeHandle = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: ew-resize;
  background: transparent;
  z-index: 1002;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: white;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const HistoryTitle = styled.div`
  font-weight: bold;
  color: #ccc;
  margin-bottom: 0.7rem;
  font-size: 1rem;
  text-align: center;
  user-select: none;
`;

const TestHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.3rem;
`;

const TestNumber = styled.span`
  font-weight: bold;
  color: #eee;
`;

const TestDate = styled.span`
  font-size: 0.75rem;
  color: #888;
  flex-grow: 1;
  user-select: none;
`;

const StatusDot = styled.span<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

const IOWrapper = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const IODiv = styled.div`
  flex: 1 1 30%;
  min-width: 150px;
  background: #222;
  border-radius: 6px;
  padding: 0.5rem;
  color: #ddd;
  box-shadow: inset 0 0 5px #000;
  max-height: 100px;
  overflow: auto;
`;

const IOHeader = styled.div`
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #f07178;
`;

const IOContent = styled.pre<{ isError?: boolean }>`
  font-family: "Fira Code", monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  color: ${({ isError }) => (isError ? "#e63946" : "#a8dadc")};
`;

const HistoryWrapper = styled.div`
  background: #121212;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
  overflow: auto;
  font-family: "Fira Code", monospace;
  font-size: 13px;
  max-height: 300px;
  transition: all 0.3s ease;

  /* Тонкий красный скроллбар */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #121212;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d62828;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a4161a;
  }
`;

const HistoryList = styled.div`
  animation: fadeIn 0.3s ease-out forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const HistoryItem = styled.div`
  border-bottom: 1px solid #333;
  padding: 0.5rem 0;
  animation: itemAppear 0.3s ease-out forwards;
  opacity: 0;
  transform: translateY(10px);

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }

  @keyframes itemAppear {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;

const HistoryEmpty = styled.div`
  margin-top: auto;
  color: #666;
  font-style: italic;
  text-align: center;
  user-select: none;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
export default SidePanelComponent;
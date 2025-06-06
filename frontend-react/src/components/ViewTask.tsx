import type { GetProblemResponse } from "../interfaces/api/responses/GetProblemsResponse.ts";
import styled from "styled-components";
import { useState } from "react";
import { FaArrowLeft, FaTimes, FaCode } from "react-icons/fa";
import type { TestCase } from "../interfaces/api/core/TestCase.ts";
import {useResizablePanel} from "../hooks/useResizablePanel.ts";
import SidePanelComponent from "./SidePanelComponent.tsx";

const testCases: TestCase[] = [
  { id: 1, input: "2 3", output: "5", isHidden: false },
  { id: 2, input: "10 20", output: "30", isHidden: false },
  { id: 3, input: "100 200", output: "300", isHidden: true },
];

const ViewTask = ({ problem, onBack }: { problem: GetProblemResponse; onBack: () => void }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [code, setCode] = useState("");
  const [selectedTestId, setSelectedTestId] = useState(testCases.find(tc => !tc.isHidden)?.id ?? 0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const visibleTests = testCases.filter(t => !t.isHidden);
  const { width: panelWidth, startResizing } = useResizablePanel();

  const handleRunTest = () => {
    console.log("🔹 Отправка теста:", {
      code,
      problemId: problem.id,
      testCaseId: selectedTestId,
    });
  };

  const handleSubmitSolution = () => {
    console.log("✅ Я отправил решение");
  };

  return (
    <Wrapper>
      <TopBar>
        <AddButton onClick={onBack}>
          <FaArrowLeft />
          <span>Назад</span>
        </AddButton>
        <Title>{problem.name}</Title>
      </TopBar>

      <MainContent>
        <LeftPanel>
          <Section>
            <Label>Описание</Label>
            <TextArea readOnly value={problem.description} rows={6} />
          </Section>

          <Section>
            <Label>Сложность</Label>
            <Level level={problem.level}>{getLevelLabel(problem.level)}</Level>
          </Section>

          <TestCaseTabs>
            {visibleTests.map((test, index) => (
              <Tab
                key={test.id}
                active={selectedTab === index}
                onClick={() => setSelectedTab(index)}
              >
                {`Пример #${index + 1}`}
              </Tab>
            ))}
          </TestCaseTabs>

          <TestCaseView>
            <TestCaseBlock>
              <Label>Вход</Label>
              <CodeBlock>{visibleTests[selectedTab].input}</CodeBlock>
            </TestCaseBlock>
            <TestCaseBlock>
              <Label>Ожидаемый выход</Label>
              <CodeBlock>{visibleTests[selectedTab].output}</CodeBlock>
            </TestCaseBlock>
          </TestCaseView>
        </LeftPanel>
      </MainContent>

      {!isPanelOpen && (
        <FloatingOpenButton onClick={() => setIsPanelOpen(true)}>
          <FaCode />
        </FloatingOpenButton>
      )}
      <SidePanelComponent
        open={isPanelOpen}
        width={panelWidth}
        code={code}
        onCodeChange={setCode}
        selectedTestId={selectedTestId}
        onSelectTest={setSelectedTestId}
        visibleTests={visibleTests}
        onRunTest={handleRunTest}
        onSubmitSolution={handleSubmitSolution}
        onClose={() => setIsPanelOpen(false)}
        onStartResize={startResizing}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
`;

const MainContent = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
`;

const LeftPanel = styled.div`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 10px;
`;

const AddButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) =>
          disabled ? '#444' : 'linear-gradient(90deg, #d62828, #a4161a)'};
  color: ${({ disabled }) => (disabled ? '#aaa' : 'white')};
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`;

const Title = styled.h2`
  color: white;
  font-size: 1.8rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.span`
  color: #ccc;
  font-weight: bold;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  background: #111;
  border: 1px solid #333;
  color: #eee;
  padding: 0.75rem;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  resize: none;
`;

const Level = styled.div<{ level: number }>`
  color: ${({ level }) =>
          level === 1 ? '#42f58d' :
                  level === 2 ? '#f5d142' :
                          '#f54242'};
  font-weight: bold;
`;

const TestCaseTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.4rem 0.8rem;
  background: ${({ active }) => (active ? '#d62828' : '#333')};
  color: ${({ active }) => (active ? 'white' : '#aaa')};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
`;

const TestCaseView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TestCaseBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const CodeBlock = styled.pre`
  background: #111;
  border: 1px solid #333;
  color: #fefefe;
  padding: 0.75rem;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const CodeInput = styled.textarea`
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  border-radius: 8px;
  padding: 0.75rem;
  resize: vertical;
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
`;

const SidePanel = styled.div<{ open: boolean; width: number }>`
  position: fixed;
  top: 0;
  right: 0;
  width: ${({ width }) => width}px;
  height: 100%;
  background: #1a1a1a;
  border-left: 1px solid #333;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transform: ${({ open, width }) => (open ? "translateX(0)" : `translateX(${width}px)`)};
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
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

const FloatingOpenButton = styled.button`
  width: 48px;
  height: 48px;
  position: fixed;
  top: 6rem;
  right: 2rem;
  background: #a4161a;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 0.9rem;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 1001;
  transition: 0.2s;
  &:hover {
    background: #d62828;
  }
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

const getLevelLabel = (level: number) => {
  switch (level) {
    case 1: return "Easy";
    case 2: return "Medium";
    case 3: return "Hard";
    default: return "Unknown";
  }
};

export default ViewTask;

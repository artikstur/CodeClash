import type { GetProblemResponse } from "../interfaces/api/responses/GetProblemsResponse.ts";
import styled from "styled-components";
import React, {useEffect, useState} from "react";
import {FaArrowLeft, FaCode, FaPlus, FaTrash} from "react-icons/fa";
import {MdClose, MdOutlineModeEdit} from 'react-icons/md';
import type { TestCase } from "../interfaces/api/core/TestCase.ts";
import {useResizablePanel} from "../hooks/useResizablePanel.ts";
import SidePanelComponent from "./SidePanelComponent.tsx";
import {usePostSolution} from "../hooks/api/usePostSolution.ts";
import {useGetTestCases} from "../hooks/api/useGetTestCases.ts";
import {useSolutionPolling} from "../hooks/api/useSolutionPolling.ts";
import {useErrorNotification} from "../hooks/useErrorNotification.ts";
import ErrorNotification from "./ErrorNotification.tsx";
import {useUpdateProblem} from "../hooks/api/useUpdateProblem.ts";
import {useQueryClient} from "@tanstack/react-query";
import {useGetProblemById} from "../hooks/api/useGetProblemById.ts";
import {useDeleteTestCase} from "../hooks/api/useDeleteTestCase.ts";
import {useTaskSolutionPolling} from "../hooks/api/useTaskSolutionPolling.ts";
import {usePostTaskSolution} from "../hooks/api/usePostTaskSolution.ts";

const ViewTask = ({ problem, onBack, isUser }: { problem: GetProblemResponse; onBack: () => void, isUser: boolean }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [code, setCode] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: testCases = [], isLoading: isLoadingTests } = useGetTestCases(problem.id);
  const visibleTests = testCases.filter(t => !t.isHidden);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

  const { width: panelWidth, startResizing } = useResizablePanel();
  const [isEditing, setIsEditing] = useState(false);
  const [editableProblem, setEditableProblem] = useState(problem);
  const [editableTests, setEditableTests] = useState(testCases.filter(tc => !tc.isHidden));
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const [newTestInput, setNewTestInput] = useState("");
  const [newTestOutput, setNewTestOutput] = useState("");
  const { mutate: sendSolution, isLoading, isSuccess, isError, error } = usePostSolution();
  const { mutate: sendTaskSolution} = usePostTaskSolution();
  const [solutionId, setSolutionId] = useState<number | null>(null);
  const [solutionTaskId, setSolutionTaskId] = useState<number | null>(null);

  const {
    status: solutionStatus,
    isPending: isPolling,
    isError: isPollError,
    isTestSuccess,
    isTestFailed,
  } = useSolutionPolling(solutionId);

  const {
    status: solutionTaskStatus,
    isPending: isTaskPolling,
    isError: isTaskPollError,
    isTaskSuccess,
    isTaskFailed,
  } = useTaskSolutionPolling(solutionTaskId);

  useEffect(() => {
    if (visibleTests.length > 0 && selectedTestId === null) {
      setSelectedTestId(visibleTests[0].id);
    }
  }, [visibleTests, selectedTestId]);

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

  const handleRunTest = () => {
    if (!selectedTestId) return;

    sendSolution(
      { testCaseId: selectedTestId, code },
      {
        onSuccess: (returnedSolutionId) => {
          setSolutionId(returnedSolutionId);
        },
      }
    );
  };

  const handleAddTest = () => {
    const newTest: TestCase = {
      id: Math.max(...editableTests.map(t => t.id), 0) + 1,
      input: newTestInput,
      output: newTestOutput,
      isHidden: false
    };

    setEditableTests([...editableTests, newTest]);
    setNewTestInput("");
    setNewTestOutput("");
    setIsAddTestModalOpen(false);
  };

  const {
    showError,
    message: errorMessage,
    show: showNotification,
    close: closeNotification,
  } = useErrorNotification();

  const { mutate: updateProblem } = useUpdateProblem();
  const { data: updatedProblem, isLoading: isProblemLoading } = useGetProblemById(problem.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (updatedProblem) {
      setEditableProblem(updatedProblem);
    }
  }, [updatedProblem]);
  const handleSave = () => {
    setIsEditing(false);

    const update = {
      name: editableProblem.name,
      description: editableProblem.description,
      problemLevel: editableProblem.level,
    };

    updateProblem(
      { problemId: problem.id, update },
      {
        onSuccess: () => {
          problem.name = update.name;
          problem.level = update.problemLevel;
          queryClient.invalidateQueries({ queryKey: ["problemId", problem.id] });
        },
      }
    );
  };
  const { mutate: deleteTest } = useDeleteTestCase();


  return (
    <Wrapper>
      <TopBar>
        <AddButton onClick={onBack}>
          <FaArrowLeft />
          <span>Назад</span>
        </AddButton>
        <Title>
          {isEditing ? (
            <input
              value={editableProblem.name}
              onChange={(e) =>
                setEditableProblem({ ...editableProblem, name: e.target.value })
              }
              style={{
                fontSize: '1.4rem',
                padding: '0.3rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid #666',
                background: '#111',
                color: 'white',
                fontFamily: 'inherit'
              }}
            />
          ) : (
            <>
              {problem.name}
              {isUser && (
                <EditIcon onClick={() => setIsEditing(true)} title="Редактировать задачу">
                  <MdOutlineModeEdit size={20} />
                </EditIcon>
              )}
            </>
          )}
        </Title>
      </TopBar>
      <MainContent>
        <LeftPanel>
          <Section>
            <Label>Описание</Label>
            <TextArea
              readOnly={!isEditing}
              value={editableProblem.description}
              onChange={(e) =>
                setEditableProblem({ ...editableProblem, description: e.target.value })
              }
            />
          </Section>

          <Section>
            <Section>
              <Label>Сложность</Label>
              {isEditing ? (
                <Select
                  value={editableProblem.level}
                  onChange={(e) =>
                    setEditableProblem({ ...editableProblem, level: parseInt(e.target.value) })
                  }
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </Select>
              ) : (
                <Level level={problem.level}>{getLevelLabel(problem.level)}</Level>
              )}
            </Section>
          </Section>
          {isEditing && (
            <ButtonRow>
              <ActionButton onClick={handleSave}>
                Сохранить
              </ActionButton>
              <ActionButton
                style={{ background: 'gray' }}
                onClick={() => {
                  setIsEditing(false);
                  setEditableProblem(problem);
                }}
              >
                Отмена
              </ActionButton>
            </ButtonRow>
          )}
          <TestCaseTabs>
            {editableTests?.map((test, index) => (
              <Tab key={test.id} active={selectedTab === index}>
                <TabContent>
                  <TabName onClick={() => setSelectedTab(index)}>
                    {`Пример #${index + 1}`}
                  </TabName>
                  {isUser && isEditing && (
                    <DeleteIcon
                      title="Удалить пример"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTest(
                          { testId: test.id, problemId: problem.id },
                          {
                            onSuccess: () => {
                              setEditableTests((prev) => prev.filter((t) => t.id !== test.id));
                              if (selectedTab >= editableTests.length - 1) setSelectedTab(0);
                            },
                            onError: (error) => {
                              console.error("Ошибка при удалении теста:", error);
                            },
                          }
                        );
                      }}
                    >
                      <FaTrash size={13} color="white" />
                    </DeleteIcon>
                  )}
                </TabContent>
              </Tab>
            ))}
            {isUser && isEditing && (
              <AddTestButton onClick={() => setIsAddTestModalOpen(true)}>
                <FaPlus size={13} color='white'/>
              </AddTestButton>
            )}
          </TestCaseTabs>
          <TestCaseView>
            <TestCaseBlock>
              <Label>Вход</Label>
              <CodeBlock>{visibleTests[selectedTab]?.input.replace('\\n', " ")}</CodeBlock>
            </TestCaseBlock>
            <TestCaseBlock>
              <Label>Ожидаемый выход</Label>
              <CodeBlock>{visibleTests[selectedTab]?.output}</CodeBlock>
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
        isPolling={isPolling}
      />
      {isTestFailed && (
        <ErrorNotification
          show={isTestFailed}
          message={"Решение не прошло тест"}
          onClose={closeNotification}
          title={'Ошибка'}
        />
      )}
      {isTestSuccess && (
        <ErrorNotification
          show={isTestSuccess}
          message={"Тест успешно пройден"}
          onClose={closeNotification}
          title={'Успешно'}
          isError={false}
        />
      )}
      {isAddTestModalOpen && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <h3>Добавить новый тест</h3>
              <CloseModalButton onClick={() => setIsAddTestModalOpen(false)}>
                <MdClose size={20} />
              </CloseModalButton>
            </ModalHeader>
            <ModalBody>
              <ModalSection>
                <Label>Входные данные</Label>
                <ModalInput
                  value={newTestInput}
                  onChange={(e) => setNewTestInput(e.target.value)}
                  placeholder="Введите входные данные"
                />
              </ModalSection>
              <ModalSection>
                <Label>Ожидаемый результат</Label>
                <ModalInput
                  value={newTestOutput}
                  onChange={(e) => setNewTestOutput(e.target.value)}
                  placeholder="Введите ожидаемый результат"
                />
              </ModalSection>
              <ModalActions>
                <ModalButton onClick={handleAddTest}>Сохранить</ModalButton>
                <ModalButton
                  style={{ background: 'gray' }}
                  onClick={() => setIsAddTestModalOpen(false)}
                >
                  Отмена
                </ModalButton>
              </ModalActions>
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}
    </Wrapper>
  );
};

const EditIcon = styled.button`
    all: unset;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-left: 0.5rem;
    color: #ccc;

    &:hover {
        color: white;
    }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
`;

const DeleteIcon = styled.button`
    border: none;
    border-radius: 50%;
    padding: 0.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    background-color: transparent;

    svg {
        font-size: 1rem;
    }
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
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
`;

const TabContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabName = styled.span`
  padding: 0.1rem 0;
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

const AddTestButton = styled.button`
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #444;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: #1a1a1a;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: white;
`;

const CloseModalButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const ModalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ModalInput = styled.textarea`
  background: #111;
  border: 1px solid #333;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  resize: none;
  min-height: 80px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ModalButton = styled.button`
  background: linear-gradient(90deg, #d62828, #a4161a);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  flex: 1;

  &:hover {
    opacity: 0.9;
  }
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

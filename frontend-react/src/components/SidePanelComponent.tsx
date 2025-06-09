import React from 'react';
import {FaTimes} from "react-icons/fa";
import styled from "styled-components";
import type {TestCase} from "../interfaces/api/core/TestCase.ts";

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
  isPolling}: Props) => {
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
          {code.split('\n').map((_, idx) => (
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
      <Select
        onChange={(e) => onSelectTest(Number(e.target.value))}
        value={selectedTestId}
      >
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
    </SidePanel>
  );
};

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
  font-family: 'Fira Code', 'Source Code Pro', monospace;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: inset 0 0 5px #000;
  max-height: 400px;
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

export default SidePanelComponent;
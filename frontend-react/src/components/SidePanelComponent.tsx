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
                            }: Props) => {
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
      <CodeInput
        rows={12}
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="Напиши здесь решение..."
      />

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
        <ActionButton onClick={onRunTest}>Отправить тест</ActionButton>
        <ActionButton onClick={onSubmitSolution}>Отправить решение</ActionButton>
      </ButtonRow>
    </SidePanel>
  );
};

const Label = styled.span`
  color: #ccc;
  font-weight: bold;
  font-size: 0.95rem;
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
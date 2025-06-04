import React, { useEffect, useState } from 'react';
import type { GetProblemResponse, ProblemLevel } from '../interfaces/api/responses/GetProblemsResponse.ts';
import styled from 'styled-components';
import {FaArrowRight, FaFilter, FaPlus} from 'react-icons/fa';
import {useCreateProblem} from "../hooks/api/useCreateProblem.ts";
import { useGetProblems } from "../hooks/api/useGetProblems.ts";
import {useErrorNotification} from "../hooks/useErrorNotification.ts";
import ErrorNotification from "./ErrorNotification.tsx";
import type {SortDirection} from "../interfaces/api/enums/SortDirection.ts";
import type ProblemsSpec from "../interfaces/api/requests/ProblemsSpec.ts";

export const getLevelLabel = (level: ProblemLevel): string => {
  switch (level) {
    case 1: return 'Easy';
    case 2: return 'Medium';
    case 3: return 'Hard';
    default: return 'Unknown';
  }
};

const initialFilters = {
  name: '',
  level: '',
  sortBy: '',
  sortDirection: '',
};

const Tasks = () => {
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [view, setView] = useState<'list' | 'add'>('list');

  const [filters, setFilters] = useState({
    name: '',
    level: '',
    sortBy: '',
    sortDirection: '',
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const spec = {
    name: appliedFilters.name || undefined,
    level: appliedFilters.level ? (parseInt(filters.level) as ProblemLevel) : undefined,
    sortBy: appliedFilters.sortBy || undefined,
    sortDirection: appliedFilters.sortDirection
      ? (parseInt(appliedFilters.sortDirection) as SortDirection)
      : undefined,
    take: 25,
    page: 1,
  } as ProblemsSpec;

  const { data: problems = [], isLoading, error } = useGetProblems(spec);

  return (
    <Wrapper>
      {view === 'list' && (
        <>
          <TopBar>
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Все</FilterButton>
            <FilterButton active={filter === 'mine'} onClick={() => setFilter('mine')}>Мои</FilterButton>
            <AddButton onClick={() => setView('add')}>
              <FaPlus /> <span>Добавить</span>
            </AddButton>
          </TopBar>

          <FilterRow>
            <Input
              type="text"
              placeholder="Поиск по имени..."
              value={filters.name}
              onChange={(e) => {
                console.log(filters)
                setFilters(prev => ({ ...prev, name: e.target.value }))}
              }
            />

            <Select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
            >
              <option value="">Уровень</option>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
            </Select>

            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="">Сортировать по</option>
              <option value="name">Имя</option>
              <option value="level">Уровень</option>
            </Select>

            <Select
              value={filters.sortDirection}
              onChange={(e) => setFilters(prev => ({ ...prev, sortDirection: e.target.value }))}
            >
              <option value="">Направление</option>
              <option value="1">По возрастанию</option>
              <option value="2">По убыванию</option>
            </Select>

            <AddButton onClick={() => setAppliedFilters(filters)} title="Применить фильтры">
              <FaFilter color="white" />
            </AddButton>

            <ResetButton onClick={() => {
              setFilters(initialFilters);
              setAppliedFilters(initialFilters);
            }}>
              Сбросить фильтры
            </ResetButton>
          </FilterRow>

          <ProblemList>
            {problems.map((problem, index) => (
              <ProblemCard key={index}>
                <Info>
                  <Title>{problem.name}</Title>
                  <Description>{problem.description}</Description>
                  <Level level={problem.level}>{getLevelLabel(problem.level)}</Level>
                </Info>
                <Action><FaArrowRight /></Action>
              </ProblemCard>
            ))}
          </ProblemList>
        </>
      )}

      {view === 'add' && <AddTask onBack={() => setView('list')} />}
    </Wrapper>
  );
};

const AddTask = ({ onBack }: { onBack: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('');
  const [error, setError] = useState('');
  const createProblemMutation = useCreateProblem();
  const {
    showError,
    message: errorMessage,
    show: showNotification,
    close: closeNotification,
  } = useErrorNotification();

  const handleSubmit = () => {
    if (name.length < 8 || name.length > 50) return setError('Имя должно быть от 8 до 50 символов');
    if (!description || description.length > 255) return setError('Описание обязательно и не более 255 символов');
    if (!level) return setError('Выберите уровень сложности');

    const payload = {
      name,
      description,
      problemLevel: parseInt(level) as 1 | 2 | 3,
    };

    createProblemMutation.mutate(payload, {
      onSuccess: (data) => {
        setError('');
        onBack();
      },
      onError: (error: Error) => {
        showNotification("Произошла ошибка при добавлении задачи");
        console.error('Ошибка логина:', error.message);
      },
    });
  };

  return (
    <div>
      <TopBar>
        <AddButton onClick={onBack}><FaArrowRight /> <span>Назад</span></AddButton>
      </TopBar>

      <Form>
        <Input
          type="text"
          placeholder="Название задачи"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          as="textarea"
          placeholder="Описание задачи"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <Select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Выберите уровень</option>
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </Select>

        {error && <ErrorText>{error}</ErrorText>}

        <AddButton onClick={handleSubmit} disabled={createProblemMutation.isPending}>
          {createProblemMutation.isPending ? (
            <>
              <Spinner /> <span>Добавляем...</span>
            </>
          ) : (
            <>
              <FaPlus /> <span>Добавить</span>
            </>
          )}
        </AddButton>

        {showError && (
          <ErrorNotification
            show={showError}
            message={errorMessage}
            onClose={closeNotification}
          />
        )}
      </Form>
    </div>
  );
};

const Spinner = styled.div`
  border: 2px solid #ccc;
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TopBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 10px;
`;

const FilterButton = styled.button<{ active: boolean }>`
  background: ${({ active }) => (active ? 'linear-gradient(90deg, #d62828, #a4161a)' : '#222')};
  color: ${({ active }) => (active ? 'white' : '#ccc')};
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  &:hover {
    color: white;
    background: linear-gradient(90deg, #d62828cc, #a4161acc);
  }
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

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Input = styled.input`
  background: #222;
  border: 1px solid #444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: inherit;
  min-width: 180px;
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

const ProblemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProblemCard = styled.div`
  display: flex;
  justify-content: space-between;
  background: #1f1f1f;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #333;
  align-items: center;
  transition: 0.2s;
  &:hover {
    background: #2a2a2a;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
`;

const Description = styled.div`
  font-size: 0.95rem;
  color: #aaa;
  margin-top: 0.2rem;
`;

const Level = styled.div<{ level: number }>`
  margin-top: 0.4rem;
  font-size: 0.85rem;
  font-weight: bold;
  color: ${({ level }) =>
          level === 1 ? '#00c851' : level === 2 ? '#ffbb33' : '#ff4444'};
`;

const Action = styled.div`
  font-size: 1.2rem;
  color: #d62828;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const ResetButton = styled.button`
  background: transparent;
  border: 1px solid #555;
  color: #ccc;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
  &:hover {
    background: #333;
    color: white;
    border-color: #888;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-size: 0.9rem;
`;

export default Tasks;
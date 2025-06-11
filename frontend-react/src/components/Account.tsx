import React from 'react';
import { useUserStats } from "../hooks/api/useUserStats.ts";
import styled from "styled-components";
import { User, Mail, CheckCircle2, XCircle } from 'lucide-react';


const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};


const Account = () => {
  const { data, isLoading, error } = useUserStats();

  if (isLoading) return <Message>Загрузка данных...</Message>;
  if (error) return <Message>Ошибка: {error.message}</Message>;
  if (!data) return <Message>Данные не найдены</Message>;

  const {
    email,
    userName,
    solutionStats,
    taskSolutionsCount,
  } = data;

  return (
    <Wrapper>
      <Card>
        <SectionTitle>Аккаунт</SectionTitle>
        <Item><User size={18} /> <strong>Имя пользователя:</strong> {userName}</Item>
        <Item><Mail size={18} /> <strong>Email:</strong> {email}</Item>
        <Item><strong>Решённых задач:</strong> {taskSolutionsCount}</Item>
      </Card>

      <Card>
        <SectionTitle>Статистика</SectionTitle>
        <StatItem><strong>Всего попыток:</strong> {solutionStats.totalCount}</StatItem>
        <StatItem><CheckCircle2 size={18} color="#4caf50" /> <strong>Успешных:</strong> {solutionStats.successCount}</StatItem>
        <StatItem><XCircle size={18} color="#f44336" /> <strong>Проваленных:</strong> {solutionStats.failedCount}</StatItem>
        <StatItem><strong>Процент успеха:</strong> {solutionStats.successRate.toFixed(2)}%</StatItem>
        <StatItem><strong>Первая отправка:</strong> {formatDate(solutionStats.firstSubmissionDate)}</StatItem>
        <StatItem><strong>Последняя отправка:</strong> {formatDate(solutionStats.lastSubmissionDate)}</StatItem>
        <StatItem><strong>Активных дней:</strong> {solutionStats.activeDays}</StatItem>
      </Card>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  color: #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 700px;
  margin: 0 auto;
`;

const Card = styled.div`
  background-color: #1e1e1e;
  border: 1px solid #d6282844;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 0 10px #d6282822;
`;

const SectionTitle = styled.div`
  color: #d62828;
  font-size: 1.6rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Item = styled.p`
  font-size: 1rem;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatItem = styled(Item)`
  font-size: 0.95rem;
`;

const Message = styled.div`
  color: #aaa;
  text-align: center;
  margin-top: 3rem;
  font-size: 1.1rem;
`;

export default Account;

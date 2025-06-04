import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Title from "../components/Title.tsx";
import { useLoginMutation } from '../hooks/api/useLoginMutation.ts';
import {useErrorNotification} from "../hooks/useErrorNotification.ts";
import ErrorNotification from "../components/ErrorNotification.tsx";
import { Link } from "react-router-dom";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    background: linear-gradient(135deg, #121212, #1e1e1e);
    color: white;
  }
`;

type LoginForm = {
  email: string;
  password: string
}

const LoginPage = () => {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const loginMutation = useLoginMutation();
  const {
    showError,
    message: errorMessage,
    show: showNotification,
    close: closeNotification,
  } = useErrorNotification();

  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Введите email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Некорректный email";
    if (!form.password) newErrors.password = "Введите пароль";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    loginMutation.mutate(form, {
      onSuccess: (data) => {
        console.log('Успешный логин:', data);
      },
      onError: (error: Error) => {
        showNotification("Произошла ошибка при входе");
        console.error('Ошибка логина:', error.message);
      },
    });
  };

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <FormCard onSubmit={handleSubmit}>
          <Title text="CODE_CLASH">CODE_CLASH</Title>

          <InputGroup>
            <FaEnvelope />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </InputGroup>
          {errors.email && <Error>{errors.email}</Error>}

          <InputGroup>
            <FaLock />
            <Input
              type="password"
              name="password"
              placeholder="Пароль"
              value={form.password}
              onChange={handleChange}
            />
          </InputGroup>
          {errors.password && <Error>{errors.password}</Error>}

          <Button type="submit">Войти</Button>
          <RegisterLinkWrapper>
            <span>Нет аккаунта?</span>
            <StyledLink to="/register">Зарегистрироваться</StyledLink>
          </RegisterLinkWrapper>
        </FormCard>
        {showError && (
          <ErrorNotification
            show={showError}
            message={errorMessage}
            onClose={closeNotification}
          />
        )}
      </Wrapper>
    </>
  );
};

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #161616, #1f1f1f);
`;

const FormCard = styled.form`
  background: rgba(255, 255, 255, 0.03);
  padding: 2.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 25px rgba(255, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.8s ease-out;

  @keyframes fadeIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.6rem 1rem;
  margin-bottom: 0.75rem;
  border-radius: 10px;
  color: #ffcccc;

  svg {
    flex-shrink: 0;
  }

  &:focus-within {
    border: 1px solid #ff4d4d;
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #d62828, #a4161a);
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const Error = styled.div`
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const RegisterLinkWrapper = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  color: #ccc;

  span {
    margin-right: 0.25rem;
  }
`;

const StyledLink = styled(Link)`
  color: #ff6b6b;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
    color: #ff4d4d;
  }
`;

export default LoginPage;

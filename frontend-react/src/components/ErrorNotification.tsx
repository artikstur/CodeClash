import React from "react";
import styled, { keyframes } from "styled-components";
import { FaTimes } from "react-icons/fa";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

type ErrorNotificationProps = {
  show: boolean;
  message: string;
  onClose: () => void;
};

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ show, message, onClose }) => {
  return (
    <Container show={show} onAnimationEnd={() => !show && onClose()}>
      <Content>
        <FaTimes className="close-icon" onClick={onClose} />
        <Title>Ошибка</Title>
        <Message>{message}</Message>
      </Content>
    </Container>
  );
};

export default ErrorNotification;

const Container = styled.div<{ show: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(30, 30, 30, 0.95);
  border-left: 4px solid #d62828;
  border-radius: 4px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: ${({ show }) => (show ? slideIn : slideOut)} 0.3s forwards;
  max-width: 300px;
  backdrop-filter: blur(5px);
`;

const Content = styled.div`
  position: relative;

  .close-icon {
    position: absolute;
    top: -10px;
    right: -10px;
    cursor: pointer;
    color: #aaa;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 3px;
    transition: all 0.2s;

    &:hover {
      color: white;
      background: rgba(255, 0, 0, 0.5);
    }
  }
`;

const Title = styled.h4`
  margin: 0 0 8px 0;
  color: #ff6b6b;
  font-size: 1.1rem;
`;

const Message = styled.p`
  margin: 0;
  color: #ddd;
  font-size: 0.9rem;
`;


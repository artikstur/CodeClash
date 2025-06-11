import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #121212, #1e1e1e);
  color: #ff4d4d;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 6rem;
  margin: 0;
  font-weight: bold;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-top: 1rem;
  color: #ff6b6b;
`;

const NotFoundPage = () => (
  <Wrapper>
    <Title>404</Title>
    <Subtitle>Страница не найдена</Subtitle>
  </Wrapper>
);

export default NotFoundPage;
import React from 'react';
import styled from "styled-components";

const Title = ({ text }) => {
  return (
    <TitleComponent data-text={text}>
      {text}
    </TitleComponent>
  );
};

const TitleComponent = styled.h1`
  position: relative;
  text-align: center;
  color: #ff4d4d;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 0 0 4px #ff1a1a;
  cursor: default;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    color: #ff4d4d;
    background: transparent;
    overflow: hidden;
    pointer-events: none;
  }

  &::before {
    left: 3px;
    text-shadow: -3px 0 red;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    animation: glitchTop 2.5s infinite ease-in-out;
  }

  &::after {
    left: -3px;
    text-shadow: -3px 0 #8c2727;
    clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
    animation: glitchBottom 2.5s infinite ease-in-out;
  }

  animation: glitch 2.5s infinite ease-in-out;

  @keyframes glitch {
    0% {
      transform: none;
    }
    2% {
      transform: translateX(-2px);
    }
    4% {
      transform: translateX(2px);
    }
    6% {
      transform: translateX(-2px);
    }
    8% {
      transform: translateX(2px);
    }
    10% {
      transform: none;
    }
    100% {
      transform: none;
    }
  }

  @keyframes glitchTop {
    0% {
      transform: translateX(0);
    }
    2% {
      transform: translateX(-5px);
    }
    4% {
      transform: translateX(5px);
    }
    6% {
      transform: translateX(-5px);
    }
    8% {
      transform: translateX(5px);
    }
    10% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes glitchBottom {
    0% {
      transform: translateX(0);
    }
    2% {
      transform: translateX(5px);
    }
    4% {
      transform: translateX(-5px);
    }
    6% {
      transform: translateX(5px);
    }
    8% {
      transform: translateX(-5px);
    }
    10% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(0);
    }
  }
`;

export default Title;
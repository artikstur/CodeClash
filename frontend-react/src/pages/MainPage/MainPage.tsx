import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { FaBolt, FaCode, FaUserCircle  } from "react-icons/fa";
import Tasks from "../../components/Tasks";
import Battle from "../../components/Battle";
import Account from "../../components/Account.tsx";

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

const MainPage = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  const renderContent = () => {
    switch (activeTab) {
      case "tasks":
        return <Tasks />;
      case "battle":
        return <Battle />;
      case "account":
        return <Account />;
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <Navbar>
          <NavItem
            active={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
          >
            <FaCode />
            Задачи
          </NavItem>
          <NavItem
            active={activeTab === "battle"}
            onClick={() => setActiveTab("battle")}
          >
            <FaBolt />
            Battle
          </NavItem>
          <NavItem
            active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
          >
            <FaUserCircle />
            Аккаунт
          </NavItem>
          <Brand>CODE CLASH</Brand>
        </Navbar>
        <ContentWrapper>{renderContent()}</ContentWrapper>
      </PageWrapper>
    </>
  );
};

const Brand = styled.div`
  margin-left: auto;
  color: #d62828;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(214, 40, 40, 0.6);
  font-style: italic;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const Navbar = styled.nav`
  width: 100%;
  display: flex;
  justify-content: start;
  background-color: #1a1a1a;
  padding: 1rem;
  border-bottom: 1px solid #333;
`;

const NavItem = styled.button<{ active: boolean }>`
  background: ${({ active }) =>
  active ? "linear-gradient(90deg, #d62828, #a4161a)" : "transparent"};
  color: ${({ active }) => (active ? "white" : "#ccc")};
  border: none;
  padding: 0.6rem 1.2rem;
  margin: 0 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s ease;
  

  &:hover {
    color: white;
    background: linear-gradient(90deg, #d62828cc, #a4161acc);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

export default MainPage;

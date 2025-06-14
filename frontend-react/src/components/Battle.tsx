import React, {useState} from 'react';
import styled from "styled-components";
import {useErrorNotification} from "../hooks/useErrorNotification.ts";
import BattleRoom from "./BattleRoom.tsx";
import {generateRoomCode} from "../hooks/useRoomCode.ts";

export interface BattleRoomProps {
  roomCode: string;
  isCreator: boolean;
  setMode: (mode: "select" | "input" | "room") => void
}
const Battle = () => {
  const [mode, setMode] = useState<"select" | "input" | "room">("select");
  const [inviteCode, setInviteCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const { showError, message, show } = useErrorNotification();
  const [isCreator, setIsCreator] = useState(false);

  const handleJoin = () => {
    if (!inviteCode.trim()) {
      show("Пожалуйста, введите код приглашения");
      return;
    }
    setRoomCode(inviteCode);
    setIsCreator(false);
    setMode("room");
  };

  const handleInvite = () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setIsCreator(true);
    navigator.clipboard.writeText(newCode).then(() => {
      show("Код приглашения скопирован в буфер обмена");
      setMode("room");
    });
  };

  return (
    <BattleWrapper>
      {mode === "room" ? (
        <BattleRoom roomCode={roomCode} isCreator={isCreator} setMode={setMode}/>
      ) : (
        <BattleCard>
          {mode === "select" ? (
            <>
              <Button onClick={() => setMode("input")}>Войти по коду</Button>
              <Button onClick={handleInvite}>Создать комнату</Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="Введите код комнаты"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button onClick={handleJoin}>Войти</Button>
              <BackButton onClick={() => setMode("select")}>Назад</BackButton>
            </>
          )}
          {showError && <Toast visible={showError}>{message}</Toast>}
        </BattleCard>
      )}
    </BattleWrapper>
  );
};

const BattleWrapper = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const BattleCard = styled.div`
    background-color: #1a1a1a;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 0 10px #a4161a;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 300px;
    position: relative;
`;

const Button = styled.button`
    background: linear-gradient(90deg, #d62828, #a4161a);
    color: white;
    border: none;
    padding: 0.8rem 1.2rem;
    border-radius: 10px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    transition: 0.2s;

    &:hover {
        background: linear-gradient(90deg, #d62828cc, #a4161acc);
    }
`;

const BackButton = styled(Button)`
    background: transparent;
    border: 1px solid #a4161a;
    color: #a4161a;

    &:hover {
        background: rgba(164, 22, 26, 0.1);
    }
`;

const Input = styled.input`
    padding: 0.7rem 1rem;
    border-radius: 10px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: white;
    font-size: 1rem;
    outline: none;

    &::placeholder {
        color: #888;
    }
`;

const Toast = styled.div<{ visible?: boolean }>`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #000000;
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.95rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transform: ${({ visible }) =>
  visible ? "translateX(0)" : "translateX(100%)"};
  transition: opacity 0.4s ease, transform 0.4s ease;
  z-index: 1000;
`;


export default Battle;
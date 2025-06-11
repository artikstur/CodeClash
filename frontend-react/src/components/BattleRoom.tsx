import styled, {keyframes} from "styled-components";
import SolveProblemTogether from "./SolveProblemTogether.tsx";
import React, {useEffect, useState} from "react";
import {useErrorNotification} from "../hooks/useErrorNotification.ts";
import {useBattleHub} from "../hooks/api/useBattleHub.ts";
import {useUserStats} from "../hooks/api/useUserStats.ts";
import type {BattleRoomProps} from "./Battle.tsx";
import { FiCheck } from "react-icons/fi";
import {getProblemForBattle} from "../hooks/api/useProblemsByLevel.ts";
import type {ProblemLevel} from "../interfaces/api/enums/ProblemLevel.ts";
import type {GetProblemResponse} from "../interfaces/api/responses/GetProblemsResponse.ts";

const BattleRoom = ({ roomCode, isCreator }: BattleRoomProps) => {
  const { showError, message, show } = useErrorNotification();
  const [opponentNickname, setOpponentNickname] = useState<string | null>(null);
  const [opponentReady, setOpponentReady] = useState(false);
  const [myReady, setMyReady] = useState(false);
  const { data, isLoading, error } = useUserStats();
  const connection = useBattleHub(roomCode, data?.userName);
  const [difficulty, setDifficulty] = useState<ProblemLevel>(1);
  const [currentProblem, setCurrentProblem] = useState<GetProblemResponse | null>(null);

  useEffect(() => {
    if (!connection) return;

    setOpponentNickname(null);
    setOpponentReady(false);
    setMyReady(false);

    connection.on("UserJoined", (id, nickname) => {
      if (nickname !== data?.userName) {
        setOpponentNickname(nickname);
      }
    });

    connection.on("UserLeft", (id, nickname) => {
      if (nickname !== data?.userName) {
        setOpponentNickname(null);
        setOpponentReady(false);
      }
    });

    connection.on("ReceiveReadyStatus", (id, nickname, isReady) => {
      if (nickname !== data?.userName) {
        setOpponentReady(isReady);
      }
    });

    connection.on("StartGame", (problem: GetProblemResponse) => {
      console.log("Игра началась с задачей:", problem);
      setCurrentProblem(problem);
      setShowSolveComponent(true);
    });

    return () => {
      connection.off("UserJoined");
      connection.off("UserLeft");
      connection.off("ReceiveReadyStatus");
      connection.off("StartGame");
    };
  }, [connection]);

  useEffect(() => {
    if (connection && isCreator) {
      connection.invoke("SetDifficulty", roomCode, difficulty);
    }
  }, [difficulty]);

  useEffect(() => {
    if (!connection) return;

    connection.on("DifficultyUpdated", (level: ProblemLevel) => {
      setDifficulty(level);
    });

    return () => {
      connection.off("DifficultyUpdated");
    };
  }, [connection]);

  const handleReadyClick = () => {
    setMyReady(true);
    connection?.invoke("SendReadyStatus", roomCode, data?.userName, true);
  };

  useEffect(() => {
    if (myReady && opponentReady && isCreator) {
      handleStart();
    }
  }, [myReady, opponentReady, isCreator]);

  const handleInvite = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      show("Код скопирован в буфер обмена");
    });
  };

  const [showSolveComponent, setShowSolveComponent] = useState(false);

  const handleStart = async () => {
    try {
      const problem = await getProblemForBattle(difficulty);
      await connection?.invoke("StartGame", roomCode, problem);

    } catch (error: any) {
      show(error.message || "Ошибка при получении задачи");
    }
  };

  if (showSolveComponent && currentProblem) {
    return <SolveProblemTogether problem={currentProblem} />;
  }

  return (
    <>
      <BattleRoomCard>
        <NickRow>
          <Nickname>{data?.userName}</Nickname>
          <Nickname>
            {opponentNickname ? `Гость: ${opponentNickname}` : "Ожидание соперника..."}
          </Nickname>
        </NickRow>
        <ReadyRow>
          <ReadyButton onClick={handleReadyClick} disabled={myReady} ready={myReady}>
            {myReady ? (
              <>
                <FiCheck />
                Готов
              </>
            ) : (
              "Готов"
            )}
          </ReadyButton>

          <ReadyButton disabled ready={opponentReady}>
            {opponentReady ? (
              <>
                <FiCheck />
                Готов
              </>
            ) : opponentNickname ? (
              "Ожидание..."
            ) : (
              "Нет соперника"
            )}
          </ReadyButton>
        </ReadyRow>
        <DifficultySelector>
          <DifficultyOption
            selected={difficulty === 1}
            level={1}
            onClick={() => isCreator && setDifficulty(1)}
            disabled={!isCreator}
          >
            Easy
          </DifficultyOption>
          <DifficultyOption
            selected={difficulty === 2}
            level={2}
            onClick={() => setDifficulty(2)}
            disabled={!isCreator}
          >
            Medium
          </DifficultyOption>
          <DifficultyOption
            selected={difficulty === 3}
            level={3}
            onClick={() => setDifficulty(3)}
            disabled={!isCreator}
          >
            Hard
          </DifficultyOption>
        </DifficultySelector>
      </BattleRoomCard>
      {showError && <Toast visible={showError}>{message}</Toast>}

      {roomCode && (
        <RoomCodeCard>
          <div>
            <RoomCodeLabel>Код комнаты:</RoomCodeLabel>
            <RoomCodeValue>{roomCode}</RoomCodeValue>
          </div>
          <CopyButton onClick={handleInvite}>Скопировать</CopyButton>
        </RoomCodeCard>
      )}
    </>
  );
};
const DifficultySelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const DifficultyOption = styled.button<{ selected?: boolean; level: ProblemLevel }>`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ level }) =>
  level === 1 ? '#70e000' : level === 2 ? '#f48c06' : '#d00000'};
  color: white;
  opacity: ${({ selected }) => (selected ? 1 : 0.6)};
  border-color: ${({ selected }) => (selected ? 'white' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const RoomCodeCard = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  background-color: #1a1a1a;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
`;

const RoomCodeLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const RoomCodeValue = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const CopyButton = styled.button`
  background-color: #a4161a;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;

  &:hover {
    background-color: #d62828;
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

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
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

const BattleRoomCard = styled(BattleCard)`
    min-width: 400px;
    align-items: center;
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

const NickRow = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 2rem;
`;

const Nickname = styled.div`
    flex: 1;
    text-align: center;
    font-size: 1.2rem;
    color: white;
    padding: 1rem;
    background-color: #2a2a2a;
    border-radius: 10px;
    font-weight: bold;
`;

const ReadyRow = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 2rem;
`;

const ReadyButton = styled(Button)<{ ready?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: ${({ ready }) => (ready ? 0.85 : 1)};
  background: ${({ ready }) =>
          ready
                  ? "linear-gradient(90deg, #70e000, #38b000)"
                  : "linear-gradient(90deg, #d62828, #a4161a)"};

  &:hover {
    background: ${({ ready }) =>
            ready
                    ? "linear-gradient(90deg, #70e000cc, #38b000cc)"
                    : "linear-gradient(90deg, #d62828cc, #a4161acc)"};
  }
`;

const StartButton = styled(Button)`
  width: 100%;
  margin-top: 1rem;
`;

export default BattleRoom;
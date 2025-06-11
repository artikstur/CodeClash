import { useState, useEffect } from "react";

export const generateRoomCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const useRoomCode = () => {
  const [roomCode, setRoomCode] = useState<string>("");

  useEffect(() => {
    setRoomCode(generateRoomCode());
  }, []);

  return roomCode;
};
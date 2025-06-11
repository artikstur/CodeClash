import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {useEffect, useState} from "react";
import {API_BASE_URL} from "../../utils/constants.ts";

export const useBattleHub = (roomCode: string, nickname: string) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/battlehub`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => {
        conn.invoke("JoinRoom", roomCode, nickname);
      });

    setConnection(conn);

    return () => {
      conn.stop();
    };
  }, [roomCode, nickname]);

  return connection;
};
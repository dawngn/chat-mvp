import './App.css'
import React, { useRef } from 'react'
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:4000");

const EVENTS = {
  connection: "connection",
  CLIENT: {
    CREATE_ROOM: "CREATE_ROOM",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM: "JOIN_ROOM",
  },
  SERVER: {
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
  },
};

function App() {
  const newMessageRef = useRef<any>(null);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState({});
  const [messages, setMessages] = useState<any>([]);

  console.log(rooms);
  console.log(messages);

  socket.on(EVENTS.SERVER.ROOMS, (value) => {
    setRooms(value);
  });

  socket.on(EVENTS.SERVER.JOINED_ROOM, (value) => {
    setRoomId(value);
    setMessages([]);
  });

  function handleSendMessage() {
    const message = newMessageRef.current.value;

    if (!String(message).trim()) {
      return;
    }

    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, { roomId, message, username });

    const date = new Date();

    setMessages([
      ...messages,
      {
        username: "You",
        message,
        time: `${date.getHours()}:${date.getMinutes()}`,
      },
    ]);

    newMessageRef.current.value = "";
  }

  function handleCreateRoom() {
    //get the room name
    const roomName =  "fdsf";

    if (!String(roomName).trim()) return;

    // emit room created event
    socket.emit(EVENTS.CLIENT.CREATE_ROOM, { roomName });
  }

  function handleJoinRoom(key : string) {
    if (key === roomId) return;
    socket.emit(EVENTS.CLIENT.JOIN_ROOM, key);
  }

  useEffect(() => {
    socket.on(EVENTS.SERVER.ROOM_MESSAGE, ({ message, username, time }) => {
      if (!document.hasFocus()) {
        document.title = "New message...";
      }

      setMessages((messages : any) => [...messages, { message, username, time }]);
    });
  }, [socket]);





  return (
    <div className="App">
      <div style={{
        display: "flex",
        gap: "50px",
        justifyContent: "center",
      }}>
        <div style={{
          display: "flex",
          gap: "50px",
          flexDirection: "column",
        }}>
          <button onClick={() => {
            handleCreateRoom();
          }}>Create Room</button>
          <div>
          {Object.keys(rooms).map((room) => (
            <button onClick={
              () => handleJoinRoom(room)
            }>
              {room}
            </button>
          ))}
          </div>
        </div>
        <div style={{
          display: "flex",
          gap: "4px",
          flexDirection: "column",
        }}>
          <>
          {messages.map(({ message, username, time }: { message: string; time: string; username: string }, index : number) => {
            return (
              <div key={index} >
                <div key={index} >
                  <span >
                    {username} - {time}
                  </span>
                  <span >{message}</span>
                </div>
              </div>
            );
          })}
            <div >
              <textarea
                rows={1}
                placeholder="Tell us what you are thinking"
                ref={newMessageRef}
              />
              <button onClick={handleSendMessage}>SEND</button>
            </div>
          </>
        </div>
      </div>
    </div>
  )
}

export default App

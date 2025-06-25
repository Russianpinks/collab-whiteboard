import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("edit");
  const [username, setUsername] = useState("");
  const [roomType, setRoomType] = useState("public");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (roomType === "private" && !password.trim()) {
      alert("Please enter a password for private room.");
      return;
    }

    const id = roomId.trim() === "" ? uuidv4().slice(0, 6) : roomId.trim();

    navigate(`/room/${id}?mode=${mode}&type=${roomType}&password=${password}`, {
      state: { username, password },
    });
  };

  return (
    <>
      <style>{`
        .home-container {
          text-align: center;
          margin-top: 100px;
          font-family: sans-serif;
        }

        .home-title {
          font-size: 2rem;
          margin-bottom: 30px;
          color: #333;
        }

        .home-form {
          display: inline-block;
          background: #f9f9f9;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .home-form input,
        .home-form select,
        .home-form button {
          margin: 10px 0;
          padding: 10px;
          width: 100%;
          max-width: 250px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
        }

        .home-form button {
          background: #007bff;
          color: white;
          cursor: pointer;
          transition: background 0.3s;
        }

        .home-form button:hover {
          background: #0056b3;
        }
      `}</style>

      <div className="home-container">
        <h1 className="home-title">🎨 Collaborative Whiteboard</h1>

        <form className="home-form" onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter room ID or leave blank"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="edit">Edit Mode</option>
            <option value="view">View-only Mode</option>
          </select>

          <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option value="public">Public Room</option>
            <option value="private">Private Room</option>
          </select>

          {roomType === "private" && (
            <input
              type="password"
              placeholder="Room password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          <button type="submit">Join Room</button>
        </form>
      </div>
    </>
  );
};

export default Home;

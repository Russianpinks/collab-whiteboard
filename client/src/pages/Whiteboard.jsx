import React, { useRef, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import "../styles/Whiteboard.css"; // ✅ Make sure this path is correct

const socket = io('http://localhost:5000');

const Whiteboard = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const mode = query.get("mode");
  const roomType = query.get("type") || "public";
  const password = query.get("password") || "";
  const isEditable = mode !== "view";
  const username = location.state?.username || "";

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [participants, setParticipants] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    if (!username) {
      alert("Username missing. Redirecting...");
      navigate("/");
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.font = "20px Arial";
    ctxRef.current = ctx;

    socket.emit("join-room", {
      roomId,
      username,
      roomType,
      password,
    });

    socket.on("error-message", (msg) => {
      alert(msg);
      navigate("/");
    });

    socket.on("participants-updated", (users) => {
      setParticipants(users);
    });

    socket.on("draw", ({ tool, startX, startY, x, y, color, text }) => {
      const ctx = ctxRef.current;
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = tool === "eraser" ? 20 : 3;

      if (tool === "pen" || tool === "eraser") {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === "text") {
        ctx.fillText(text, x, y);
      } else if (tool === "heart") {
        drawHeart(ctx, startX, startY, x, y, color);
      }
    });

    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.emit("leave-room", { roomId, username });
    };
  }, [roomId, username, password, roomType]);

  const startDrawing = ({ nativeEvent }) => {
    if (!isEditable) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = ctxRef.current;

    if (tool === "text") {
      const userText = prompt("Enter text:");
      if (userText) {
        ctx.fillStyle = color;
        ctx.fillText(userText, offsetX, offsetY);
        socket.emit("draw", { roomId, tool: "text", x: offsetX, y: offsetY, color, text: userText });
      }
      return;
    }

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setStartPos({ x: offsetX, y: offsetY });
    setDrawing(true);

    const snapshot = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory((prev) => [...prev, snapshot]);
    setRedoStack([]);
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing || !isEditable || tool === "text") return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = ctxRef.current;

    ctx.putImageData(history[history.length - 1], 0, 0);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? 20 : 3;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      socket.emit("draw", { roomId, tool, x: offsetX, y: offsetY, color });
    } else if (tool === "rect") {
      ctx.strokeRect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
    } else if (tool === "circle") {
      const radius = Math.sqrt(Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === "heart") {
      drawHeart(ctx, startPos.x, startPos.y, offsetX, offsetY, color);
    }
  };

  const stopDrawing = ({ nativeEvent }) => {
    if (!isEditable) return;
    setDrawing(false);
    const { offsetX, offsetY } = nativeEvent;

    if (["rect", "circle", "heart"].includes(tool)) {
      socket.emit("draw", {
        roomId,
        tool,
        startX: startPos.x,
        startY: startPos.y,
        x: offsetX,
        y: offsetY,
        color,
      });
    }

    ctxRef.current.closePath();
  };

  const drawHeart = (ctx, x1, y1, x2, y2, color) => {
    const width = x2 - x1;
    const height = y2 - y1;
    const centerX = x1 + width / 2;
    const centerY = y1 + height / 2;
    const scale = Math.min(Math.abs(width), Math.abs(height)) / 15;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + scale * 2);
    for (let i = 0; i <= Math.PI * 2; i += 0.01) {
      const x = 16 * Math.sin(i) ** 3;
      const y = 13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i);
      ctx.lineTo(centerX + x * scale, centerY - y * scale);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (!isEditable) return;
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear", roomId);
  };

  const downloadAsImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadAsPDF = () => {
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("whiteboard.pdf");
  };

  return (
    <>
      {/* Toolbar */}
      <div className="toolbar">
        <div><strong>Room:</strong> {roomId}</div>
        <div><strong>You:</strong> {username}</div>
        <div><strong>Type:</strong> {roomType}</div>
        <div><strong>Mode:</strong> {mode}</div>

        <select onChange={(e) => setTool(e.target.value)} value={tool} disabled={!isEditable}>
          <option value="pen">Pen</option>
          <option value="rect">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="heart">Heart 💖</option>
          <option value="eraser">Eraser</option>
          <option value="text">Text</option>
        </select>

        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={!isEditable} />

        <button onClick={clearCanvas} disabled={!isEditable}>Clear</button>
        <button onClick={downloadAsImage}>Export PNG</button>
        <button onClick={downloadAsPDF}>Export PDF</button>
      </div>

      {/* Participants */}
      <div className="participants">
        <strong>👥 Participants:</strong>
        <ul>
          {participants.map((name, idx) => (
            <li key={idx}>{name}</li>
          ))}
        </ul>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={() => setDrawing(false)}
      />
    </>
  );
};

export default Whiteboard;

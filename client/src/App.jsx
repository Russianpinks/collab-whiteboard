import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Whiteboard from "./pages/Whiteboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<Whiteboard />} />
    </Routes>
  );
};

export default App;

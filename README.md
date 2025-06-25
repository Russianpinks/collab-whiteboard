// placeholder
# 🧑‍🎨 Collaborative Whiteboard – Real-Time Drawing App

A real-time collaborative whiteboard application built using **React**, **Node.js**, and **Socket.io**, allowing multiple users to draw, write, and interact live — just like on a physical whiteboard.

This project was developed as per the specifications in the Web Development Open Project Problem Statement.

---

## 📌 Project Objective

To design and develop a web-based collaborative whiteboard that supports real-time multi-user drawing with access control and canvas management features.

---

## 🚀 Key Features

### ✅ Drawing Tools
- Pen tool  
- Shapes: Rectangle, Circle, **Heart ❤️**  
- Text tool  
- Eraser  
- Color picker

### 🔄 Real-Time Sync
- All drawing actions are synchronized across users instantly using **Socket.io**

### 👥 Multi-User Collaboration
- Join rooms via a shared link  
- See active **participants list with usernames** in real-time

### 🔐 Access Control
- **Public & Private rooms** supported  
- Password-protected room access (for private rooms)

### 🧹 Canvas Management
- **Undo / Redo** support  
- **Clear canvas** button  
- Efficient canvas redraws based on stroke history

### 📤 Export & Save
- Download canvas as **PNG image**  
- (PDF export optional)

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5 Canvas API
- Socket.io-client

### Backend
- Node.js
- Express.js
- Socket.io

### Others
- UUID (for room generation)
- JavaScript (ES6+)
- CSS for minimal styling

---

## 📁 Folder Structure

collab-whiteboard/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ │ └── Whiteboard.jsx
│ │ └── App.jsx
├── server/ # Node.js backend
│ └── index.js
└── README.md


---

## ⚙️ Setup Instructions (Run Locally)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/collab-whiteboard.git
cd collab-whiteboard

2. Install Dependencies
Backend
bash
Copy
Edit
cd server
npm install
Frontend
bash
Copy
Edit
cd ../client
npm install
3. Run the Application
Start Backend Server (Port 5000)
bash
Copy
Edit
cd server
node index.js
Start Frontend (Port 3000)
bash
Copy
Edit
cd ../client
npm start
Visit: http://localhost:3000

🎥 Demo Video
A 5–10 minute screen recording demonstrating all the features.

📽️ Demo Link: https://youtu.be/3DjpmObiuik

👨‍💻 Author
Yash
GitHub: https://github.com/pussycod
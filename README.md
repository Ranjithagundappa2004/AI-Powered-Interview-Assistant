# 🧑‍💻 AI-Powered Interview Assistant

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/Ranjithagundappa2004/AI-Powered-Interview-Assistant?style=social)](https://github.com/Ranjithagundappa2004/AI-Powered-Interview-Assistant/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Ranjithagundappa2004/AI-Powered-Interview-Assistant?style=social)](https://github.com/Ranjithagundappa2004/AI-Powered-Interview-Assistant/network/members)
[![License](https://img.shields.io/github/license/Ranjithagundappa2004/AI-Powered-Interview-Assistant)](LICENSE)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?logo=vercel)](https://ai-powered-interview-assistant-ldc7.vercel.app/)

</div>

<div align="center">

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Redux](https://img.shields.io/badge/Redux-State%20Management-purple?logo=redux)
![OpenAI](https://img.shields.io/badge/OpenAI-API-orange?logo=openai)
![UI](https://img.shields.io/badge/UI-Ant%20Design%20%7C%20Shadcn-lightgrey)

</div>

---

## 📌 Project Overview
An **AI-powered interview assistant** built with **React** to simplify the interview process for both **candidates** and **interviewers**.  

It allows candidates to upload resumes, engage in AI-driven timed interviews, and provides interviewers with a detailed dashboard of results.  

---

## 🚀 Features

### 👤 Interviewee (Candidate)
- Upload resume (**PDF/DOCX**).
- Extracts **Name, Email, Phone** automatically.  
- Missing details are requested before the interview begins.  
- **AI-powered timed interview**:  
  - 2 Easy → 2 Medium → 2 Hard questions.  
  - Timers: Easy (20s), Medium (60s), Hard (120s).  
- Auto-submission when time expires.  
- AI-generated **score & summary**.  

### 👨‍💼 Interviewer (Dashboard)
- View candidate list ranked by score.  
- Access detailed candidate profiles (resume data, chat history, questions, answers, and scores).  
- **Search & Sort** support for easy navigation.  

### 💾 Data Persistence
- Local storage ensures data (timers, answers, progress) is saved.  
- Supports **pause/resume** with a *“Welcome Back”* modal.  

---

## 🛠️ Tech Stack
- **Frontend:** React  
- **State Management:** Redux + redux-persist / IndexedDB  
- **UI Libraries:** Ant Design / shadcn  
- **AI Integration:** OpenAI API (for Q&A generation + evaluation)  
- **Resume Parsing:** pdfjs-dist, mammoth  

---

## 📂 Project Structure
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Tabs (Interviewee, Interviewer)
│ ├── utils/ # Resume parsing & helpers
│ ├── store/ # Redux store, reducers, persistence
│ └── App.js # Root app component
├── public/
├── package.json
└── README.md


---

## ⚙️ Installation & Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/Ranjithagundappa2004/AI-Powered-Interview-Assistant.git
   cd AI-Powered-Interview-Assistant
Install dependencies

npm install


Run locally

npm start


Runs on: http://localhost:3000

Build for production

npm run build

🌐 Deployment

This project is live on Vercel 🚀

🔗 Live Demo: AI-Powered Interview Assistant

🎥 Demo

GitHub Repo: AI-Powered Interview Assistant Repo

Live Demo: Click Here

📄 License

This project is licensed under the MIT License.
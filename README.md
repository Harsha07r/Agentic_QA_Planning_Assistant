# Agentic QA Planning Assistant

An AI-powered QA Planning Assistant that helps QA Engineers create, manage, version, and organize comprehensive test plans using Google Gemini AI.

## Live Demo

Frontend:
https://YOUR-VERCEL-URL.vercel.app

Backend API:
https://agentic-qa-planning-assistant.onrender.com/api/health

---

## Features

- AI-powered QA Test Case Generation using Google Gemini
- Create and manage QA Plans
- Dashboard with project statistics
- Version History tracking
- Knowledge Base assisted AI generation
- Manual editing of generated plans
- Responsive modern UI
- MongoDB Atlas database
- REST API architecture

---

## 🛠 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Google Gemini API
- CORS
- dotenv

---

## 📂 Project Structure

```
Agentic_QA_Planning_Assistant
│
├── client
│   ├── src
│   ├── public
│   └── ...
│
├── server
│   ├── src
│   │   ├── controllers
│   │   ├── routes
│   │   ├── models
│   │   ├── middleware
│   │   ├── services
│   │   └── knowledge
│   └── ...
```

---

##  Environment Variables

### Backend

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_URI
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
CLIENT_URL=YOUR_FRONTEND_URL
```

### Frontend

```env
VITE_API_URL=YOUR_BACKEND_URL/api
```

---

##  Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Agentic_QA_Planning_Assistant.git
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🤖 AI Workflow

1. User creates a QA plan.
2. Project details are sent to the backend.
3. Relevant QA guidelines are retrieved from the Knowledge Base.
4. Google Gemini generates structured QA test cases.
5. Generated plans can be edited and versioned.

---

## 📸 Screenshots

### Dashboard

> Add a screenshot here

### Create QA Plan

> Add a screenshot here

### AI Generated Test Cases

> Add a screenshot here

### Version History

> Add a screenshot here

---

## 📈 Future Improvements

- Authentication
- Team collaboration
- Export to PDF
- Advanced search & filters
- Playwright script generation

---

## 👨‍💻 Author

**Harsha Vardhan**

- GitHub: https://github.com/Harsha07r
- LinkedIn: https://www.linkedin.com/in/harshavardhan07/

---

## 📄 License

This project is developed as part of a technical assessment.
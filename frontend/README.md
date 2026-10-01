# PolicyAI Frontend

React + Vite + Tailwind CSS frontend for the PolicyAI enterprise policy chatbot.

## Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Routing | React Router v7 |
| Icons | Lucide React |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL if needed

# 3. Start development server
npm run dev
```

App runs at **http://localhost:5173**

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/chat` | Chat | Main AI conversation interface |
| `/documents` | Documents | Upload & manage policy documents |
| `/admin` | Admin | System status & configuration |

## Features

- 🎨 Dark glassmorphism UI with brand colors
- 💬 Chat interface with message bubbles and source cards
- 📁 Drag-and-drop document upload
- 📜 Collapsible chat history sidebar
- ⚡ Loading states and error handling
- 🔄 Mock data for offline development
- 📱 Responsive layout

## API Layer

All backend calls are in `src/services/api.js`:

```js
sendChatMessage({ message, conversationId, topK })
getChatHistory()
uploadDocument(file, onProgress)
getDocuments()
deleteDocument(documentId)
getHealth()
```

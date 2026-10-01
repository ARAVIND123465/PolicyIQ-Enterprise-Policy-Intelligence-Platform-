import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { sendChatMessage, getChatHistory, getConversation } from '../services/api'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId]           = useState(null)
  const [messages, setMessages]           = useState([])
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState(null)

  // Fetch past conversation list on initial mount
  useEffect(() => {
    getChatHistory()
      .then((history) => {
        if (Array.isArray(history)) setConversations(history)
      })
      .catch(() => null)
  }, [])

  const startNewConversation = useCallback(() => {
    setActiveId(null)
    setMessages([])
    setError(null)
  }, [])

  const loadConversation = useCallback(async (id) => {
    setActiveId(id)
    setError(null)
    setIsLoading(true)
    try {
      const data = await getConversation(id)
      if (data?.messages && Array.isArray(data.messages)) {
        setMessages(data.messages)
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    const userMsg = {
      id:        `u-${Date.now()}`,
      role:      'user',
      content:   text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const data = await sendChatMessage({ message: text, conversationId: activeId })
      const aiMsg = {
        id:        `a-${Date.now()}`,
        role:      'assistant',
        content:   data.answer,
        sources:   data.sources || [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])

      if (!activeId && data.conversation_id) {
        setActiveId(data.conversation_id)
        setConversations((prev) => [
          {
            id: data.conversation_id,
            title: text.slice(0, 50),
            preview: text,
            timestamp: new Date(),
            group: 'Today',
          },
          ...prev,
        ])
      }
    } catch (err) {
      // Fallback response when backend has an error or is unreachable
      const fallback = {
        id:      `a-${Date.now()}`,
        role:    'assistant',
        content:
          err.message || 'Unable to connect to PolicyAI server. Please check that the backend is running.',
        sources: [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, activeId])

  const clearError = useCallback(() => setError(null), [])

  return (
    <ChatContext.Provider value={{
      conversations, activeId, messages, isLoading, error,
      startNewConversation, loadConversation, sendMessage, clearError,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

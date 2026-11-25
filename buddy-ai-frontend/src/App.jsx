
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

function App() {

  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

  const messagesEndRef = useRef(null)

  // Automatically scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages, loading])

  // Start a new conversation
  function newChat() {

    if (messages.length > 0) {
      setChatHistory(prev => [
        {
          id: Date.now(),
          title: messages.find(m => m.role === 'user')?.text || 'New Chat',
          messages: messages
        },
        ...prev
      ])
    }

    setMessages([])
    setQuestion('')
  }

  // Restore an earlier conversation
  function openChat(chat) {

    if (messages.length > 0) {
      setChatHistory(prev => [
        {
          id: Date.now(),
          title: messages.find(m => m.role === 'user')?.text || 'New Chat',
          messages: messages
        },
        ...prev
      ])
    }

    setMessages(chat.messages)
    setQuestion('')
  }

  // Send message to Spring Boot backend
  async function sendMessage() {

    const userQuestion = question.trim()

    if (!userQuestion || loading) return

    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text: userQuestion
      }
    ])

    setQuestion('')
    setLoading(true)

    try {

      // Send correct parameters to Spring Boot
      const params = new URLSearchParams({
        topic: userQuestion,
        level: 'Beginner',
        simple: 'Simple English'
      })

      const response = await fetch(
        `http://localhost:8080/chats?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const answer = await response.text()

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: answer
        }
      ])

    } catch (error) {

      console.error('BUDDY connection error:', error)

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Sorry! Something went wrong: ${error.message}. Please check your Spring Boot backend and AI configuration.`
        }
      ])

    } finally {

      setLoading(false)

    }
  }

  return (

    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <h2>🤖 BUDDY AI</h2>

        <button className="new-chat" onClick={newChat}>
          + New Chat
        </button>

        <div className="history-section">

          <h4>Recent Chats</h4>

          {chatHistory.map(chat => (

            <button
              className="history-item"
              key={chat.id}
              onClick={() => openChat(chat)}
              title={chat.title}
            >
              💬 {chat.title}
            </button>

          ))}

        </div>

        <div className="sidebar-footer">
          <p>Your AI companion</p>
        </div>

      </aside>

      {/* Main Chat Area */}
      <main className="chat-area">

        {/* Header */}
        <header>

          <div>
            <h2>🤖 BUDDY AI</h2>
            <span>AI Assistant</span>
          </div>

        </header>

        {/* Messages */}
        <section className="messages">

          {messages.length === 0 && (

            <div className="welcome">

              <h1>👋 Hello! I'm BUDDY</h1>

              <p>How can I help you today?</p>

              <div className="suggestions">

                <button
                  onClick={() => setQuestion('Explain Java programming')}
                >
                  Explain Java
                </button>

                <button
                  onClick={() => setQuestion('What is Spring Boot?')}
                >
                  Learn Spring Boot
                </button>

                <button
                  onClick={() => setQuestion('Give me Java interview questions')}
                >
                  Java Interview Questions
                </button>

              </div>

            </div>

          )}

          {messages.map((message, index) => (

            <div
              key={index}
              className={`message ${message.role}`}
            >

              {message.role === 'assistant' ? (

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>

              ) : (

                <div>{message.text}</div>

              )}

            </div>

          ))}

          {loading && (

            <div className="message assistant typing">
              <span>BUDDY is thinking...</span>
            </div>

          )}

          <div ref={messagesEndRef} />

        </section>

        {/* Message Input */}
        <div className="input-area">

          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') sendMessage()
            }}
            placeholder="Message BUDDY..."
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !question.trim()}
          >
            Send ➤
          </button>

        </div>

        <p className="input-note">
          BUDDY AI can make mistakes. Verify important information.
        </p>

      </main>

    </div>

  )
}

export default App

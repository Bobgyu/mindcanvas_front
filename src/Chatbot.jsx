import { useState, useRef, useEffect } from 'react'

function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 저는 HTP 그림 검사 해석 전문가입니다. 그림 분석이나 심리 상담에 대해 궁금한 것이 있으시면 언제든지 말씀해 주세요! 😊",
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const conversationHistory = useRef([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleClose = () => {
    onClose()
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // 대화 기록에 추가
    conversationHistory.current.push([inputMessage, ''])

    try {
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversation_history: conversationHistory.current.slice(0, -1), // 마지막 빈 응답 제외
          image_analysis_result: null // 이미지 분석 결과가 있으면 여기에 추가
        })
      })

      const data = await response.json()

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          isBot: true,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, botMessage])
        
        // 대화 기록 업데이트
        conversationHistory.current[conversationHistory.current.length - 1][1] = data.response
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: `죄송합니다. 오류가 발생했습니다: ${data.error}`,
          isBot: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('챗봇 API 오류:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "죄송합니다. 서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.",
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "안녕하세요! 저는 HTP 그림 검사 해석 전문가입니다. 그림 분석이나 심리 상담에 대해 궁금한 것이 있으시면 언제든지 말씀해 주세요! 😊",
        isBot: true,
        timestamp: new Date()
      }
    ])
    conversationHistory.current = []
  }

  if (!isOpen) return null

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  }

  const modalStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '800px',
    height: '80vh',
    maxHeight: '600px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
  }

  const headerButtonsStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  }

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  }

  const closeButtonStyle = {
    ...buttonStyle,
    padding: '8px 12px',
    fontSize: '16px',
    fontWeight: 'bold'
  }

  const titleStyle = {
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0
  }

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  }

  const messageStyle = {
    display: 'flex',
    marginBottom: '10px'
  }

  const userMessageStyle = {
    ...messageStyle,
    justifyContent: 'flex-end'
  }

  const botMessageStyle = {
    ...messageStyle,
    justifyContent: 'flex-start'
  }

  const messageContentStyle = {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    position: 'relative'
  }

  const userMessageContentStyle = {
    ...messageContentStyle,
    background: '#4CAF50',
    color: 'white',
    borderBottomRightRadius: '4px'
  }

  const botMessageContentStyle = {
    ...messageContentStyle,
    background: 'white',
    color: '#333',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  }

  const messageTextStyle = {
    fontSize: '16px',
    lineHeight: 1.4,
    wordWrap: 'break-word'
  }

  const messageTimeStyle = {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px'
  }

  const typingIndicatorStyle = {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  }

  const typingDotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#ccc',
    animation: 'typing 1.4s infinite ease-in-out'
  }

  const inputContainerStyle = {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
  }

  const inputWrapperStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end'
  }

  const messageInputStyle = {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: '25px',
    background: 'white',
    fontSize: '16px',
    resize: 'none',
    outline: 'none',
    maxHeight: '120px',
    minHeight: '44px',
    fontFamily: 'inherit'
  }

  const sendButtonStyle = {
    padding: '12px 24px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    minWidth: '80px'
  }

  const sendButtonDisabledStyle = {
    ...sendButtonStyle,
    background: '#ccc',
    cursor: 'not-allowed'
  }

  return (
    <div style={modalOverlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>HTP 심리 상담 챗봇</h1>
          <div style={headerButtonsStyle}>
            <button style={buttonStyle} onClick={clearChat}>
              대화 초기화
            </button>
            <button style={closeButtonStyle} onClick={handleClose}>
              ✕
            </button>
          </div>
        </div>

      {/* 메시지 영역 */}
      <div style={messagesContainerStyle}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={message.isBot ? botMessageStyle : userMessageStyle}
          >
            <div style={message.isBot ? botMessageContentStyle : userMessageContentStyle}>
              <div style={messageTextStyle}>{message.text}</div>
              <div style={messageTimeStyle}>
                {message.timestamp.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={botMessageStyle}>
            <div style={botMessageContentStyle}>
              <div style={typingIndicatorStyle}>
                <span style={typingDotStyle}></span>
                <span style={typingDotStyle}></span>
                <span style={typingDotStyle}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={inputContainerStyle}>
        <div style={inputWrapperStyle}>
          <textarea
            style={messageInputStyle}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            rows="1"
            disabled={isLoading}
          />
          <button
            style={!inputMessage.trim() || isLoading ? sendButtonDisabledStyle : sendButtonStyle}
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            전송
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Chatbot

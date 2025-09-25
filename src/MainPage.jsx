import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chatbot from './Chatbot.jsx'

function MainPage() {
  const [count, setCount] = useState(0)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const navigate = useNavigate()

  const gotoMypage = () => {
    navigate('/mypage')   // 상대경로 → /mypage 로 이동
  }

  const gotoHome = () => {
    navigate('/draw/home')   // 집 그리기 페이지로 이동
  }

  const gotoTree = () => {
    navigate('/draw/tree')   // 나무 그리기 페이지로 이동
  }

  const gotoPerson = () => {
    navigate('/draw/person')   // 사람 그리기 페이지로 이동
  }

  const gotoEmotionDiary = () => {
    navigate('/diary/emotion')   // 감정 일기 페이지로 이동
  }

  const gotoColorfill = () => {
    navigate('/draw/colorfill')   // 색칠하기 페이지로 이동
  }

  const openChatbot = () => {
    setIsChatbotOpen(true)
  }

  const closeChatbot = () => {
    setIsChatbotOpen(false)
  }

  return (
    <>
    <div className='options'>
      <div className='picture-options'>
        <h2>그림심리테스트</h2>
        <input type="button" className='option' value="집" onClick={gotoHome} />
        <input type="button" className='option' value="나무" onClick={gotoTree} />
        <input type="button" className='option' value="사람" onClick={gotoPerson} />
      </div>

      <div className='draw-options'>
        <h2>그리기</h2>
        <input type="button" className='option' value="그림일기" onClick={gotoEmotionDiary} />
        <input type="button" className='option' value="색칠하기" onClick={gotoColorfill} />
        <input type="button" className='option' value="자유롭게" />
      </div>
    </div>
    <div className='lower-options'>
      <input type="button" className='lower-option' value="그리기" />
      <input type="button" className='lower-option' value="분석" />
      <input type="button" className='lower-option' value="채팅" />
      <input type="button" className='lower-option' value="챗봇" onClick={openChatbot} />
      <input type="button" className='lower-option' value="마이페이지" onClick={gotoMypage}/>
    </div>
    
    {/* 챗봇 모달 */}
    <Chatbot isOpen={isChatbotOpen} onClose={closeChatbot} />
    </>
  )
}

export default MainPage
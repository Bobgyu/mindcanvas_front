import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // ✅ 추가

function Join() {
  const [count, setCount] = useState(0)

  const [id, setId] = useState('')
  const [pw, setPw] = useState('')

  const navigate = useNavigate() // ✅ 라우터 이동 함수

  return (
    <>
    
    </>
  )
}

export default Join
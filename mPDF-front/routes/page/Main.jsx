import React from 'react'
import { useNavigate } from 'react-router-dom'

const Main = () => {

  const navigate = useNavigate();

  const loginbutton = () => {
    navigate("/login");
  }

  return (
    <div>
        <button onClick={loginbutton}>회원가입... 반드시 해야겠지...?</button>
    </div>
  )
}

export default Main
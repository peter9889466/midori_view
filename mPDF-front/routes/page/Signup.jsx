import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Signup = () => {

    const [select, selected] = useState();

    const navigate = useNavigate();

  return (
    <form action="http://localhost:8088/Midoriview/api/signup" method='post'>
        ID : <input type='text' name='MEMBER_NAME'/><br/>
        PW : <input type='password' name='MEMBER_PW'/><br/>
        좋아하는 품목1(선택사항) : <input type='text' name='MEMBER_FAVORITE1'/><br/>
        좋아하는 품목2(선택사항) : <input type='text' name='MEMBER_FAVORITE2'/><br/>
        좋아하는 품목3(선택사항) : <input type='text' name='MEMBER_FAVORITE3'/><br/>
        <input type='submit' value="회원가입"/>
    </form>
  )
}

export default Signup
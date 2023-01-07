import '../Styles/style.css'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router';
import { isLoggedIn } from '../Utils/AuthServise';

function StartMenu() {
  const navigate = useNavigate();

  return (
    <div className="startmenu">
        <>
          <h1>Добро пожаловать </h1>
          { isLoggedIn() && (<><h2>
            Для продолжение пожалуйста
          </h2><a href="#/login">Войдите</a></>)}
          <div className="spin"></div>
        </>   
    </div>
  )
}

export default StartMenu;
import React, { useEffect } from 'react'
import '../Styles/style.css'

export default function StartMenu() {
  return (
    <div className="startmenu">
      <h1>Добро пожаловать </h1>
      <h2>
        Для продолжение пожалуйста <a href="#/login">Войдите</a> или <a href="#register">Зарегистрируйтесь</a>
      </h2>
      <div className="spin"></div>
    </div>
  )
}
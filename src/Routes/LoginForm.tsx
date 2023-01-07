import React, { useEffect } from 'react'
import { useState } from 'react';
import '../Styles/loginStyle.css'


/* Форма */

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = (props) => {



  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(username, password);
  };




  return (
    <>
      <form className='loginForm2' onSubmit={handleSubmit}>
        <label htmlFor="username">Логин</label>
        <input
          type="text"
          id="username"
          value={username}
          placeholder="Введите логин"
          onChange={(event) => setUsername(event.target.value)}
        />
        <label htmlFor="password">Пароль</label>
        <input
          type="password"
          id="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <br />
        <button className='btn' type="submit">Войти</button>

      </form>
    </>
  )

}

export default LoginForm;
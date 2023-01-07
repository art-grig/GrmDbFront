import React, { useEffect } from 'react'
import LoginForm from '../Routes/LoginForm';
import '../Styles/loginStyle.css'
import { useState } from 'react';
import { authorize, isLoggedIn } from '../Utils/AuthServise';
import { LoginModel } from '../apiClients';

const LoginPage: React.FC = () => {

  const handleSubmit = async (username: string, password: string) => {
    const authRes = await authorize(new LoginModel({
      login: username,
      password: password,
    }));

    if (authRes) {
      window.location.replace("/");
    }
    else {
      
      alert("Неправильный Логин или Пароль");
    }
  };
  useEffect(() => {
    const timeout = 400;
    setTimeout(() => {
      const spin = document.querySelector('.spinLogo');
      if (spin && spin.parentNode) {
        spin.parentNode.removeChild(spin);
      }
    }, timeout);
  }, []);




  if (!isLoggedIn()) {
    return (
      <div className='loginForm'>
        <>
          <h1>Авторизация</h1>
          <div className="spinLogo"></div>
          <LoginForm onSubmit={handleSubmit} />
        </>
      </div>
    );
  } else {
    window.location.replace("/");
    return null;
  }}

export default LoginPage;
import React, { useEffect } from 'react'
import LoginForm from '../Routes/LoginForm';
import '../Styles/loginStyle.css'
import { useState } from 'react';
const LoginPage: React.FC = () => {
  const handleSubmit = (username: string, password: string) => {
    // handle login here
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


  return (
    
    <div className='loginForm'>
      <h1>Авторизация</h1>
    <><div className="spinLogo"></div></>
      <LoginForm onSubmit={handleSubmit} />

    </div>
    
  );
};

export default LoginPage;
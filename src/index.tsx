import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Table from './Routes/Table'
import reportWebVitals from './reportWebVitals';
import  NavbarMenu  from './Components/NavbarMenu';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LegalEntity from './Routes/LegalEntity';
import Person from './Routes/Persons';
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <NavbarMenu />
        <Routes>
          <Route path="/table" element={<Table/>}/>
          <Route path="/legalEntity" element={<LegalEntity/>} /> 
          <Route path="/person" element={<Person/>} /> 
        </Routes>
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

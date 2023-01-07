import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Table from './Routes/Table'
import reportWebVitals from './reportWebVitals';
import NavbarMenu from './Components/NavbarMenu';
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import LegalEntity from './Routes/LegalEntity';
import Person from './Routes/Persons';
import LoginPage from './Routes/LoginPage';
import StartMenu from './Routes/StartMenu';
import Footer from './Components/Footer';
import LegalEntityDetails from './Routes/LegalEntityDetails';
import PersonDetails from './Routes/PersonsDetails';
import { enableAuthInterceptor } from './Utils/interceptors';
import RouteGuard from './Routes/RouteGuard';

enableAuthInterceptor();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>
      <NavbarMenu />
      <Routes>
        <Route path="/" element={<StartMenu />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/table" element={<RouteGuard>  <Table /> </RouteGuard>} /> {/* Guard ON */}
        <Route path="/legalEntity" element={<RouteGuard> <LegalEntity /></RouteGuard>} /> {/* Guard ON */}
        <Route path="/person" element={<RouteGuard>   <Person /> </RouteGuard>} /> {/* Guard ON */}
        <Route path="/legalEntity/:legalEntityId" element={<RouteGuard> {/* Guard ON */} <LegalEntityDetails /></RouteGuard>} />
        <Route path="/person/:employeeId" element={<RouteGuard>  <PersonDetails /> </RouteGuard>} /> {/* Guard ON */}
      </Routes>
      {/* <Footer /> */}
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

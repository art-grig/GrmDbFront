import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from '../Routes/Table';
import { HashRouter, Routes, Route, Router, redirect } from 'react-router-dom';
import '../Styles/style.css'
import Logo from './Logo';
import { isLoggedIn, logout } from '../Utils/AuthServise';
import { useEffect } from 'react';
import Header from './Header';
import { exit } from 'process';


function logoutAcc(){
  var answer = window.confirm("Вы уверены, что хотите выйти?");
if (answer) {
  logout();
  window.location.replace("/");
}
else {
    return
}
}

function ColorSchemesExample() {


  if (isLoggedIn()) {
    return (
      <>
        <Navbar bg="light" variant="light">
          <Container>
            <Navbar.Brand href="#/"><Logo /> </Navbar.Brand>
            <Nav className="me-left">
              <Nav.Link id='LegalEntity' href="/#/legalEntity" className='nav'>Юр. лица</Nav.Link>
              <Nav.Link id='Employee' href="/#/person" className='nav'>Физ. лица</Nav.Link>
              {/* SVG NAV */}
              <Nav.Link id='Logout' className='logout' onClick={logoutAcc}>Выйти  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
              </svg></Nav.Link>
              {/* END SVG */}
            </Nav>
          </Container>
        </Navbar>
      </>

    );
  } else

    return (

      <> <Header /> </>
    )
}

export default ColorSchemesExample;
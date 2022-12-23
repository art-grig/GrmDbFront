import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from '../Routes/Table';
import { HashRouter , Routes, Route, Router } from 'react-router-dom';
import '../Styles/style.css'
import Logo from './Logo';

function ColorSchemesExample() {
  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#/"><Logo /> </Navbar.Brand>
          <Nav className="me-left">
            <Nav.Link href="/#/legalEntity" className='leNav'>Юр. лица</Nav.Link>
            <Nav.Link href="/#/person" className='persNav'>Физ. лица</Nav.Link>
            
          </Nav>
        </Container>
      </Navbar>
      
    </>
  );
}

export default ColorSchemesExample;
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from '../Routes/Table';
import { HashRouter , Routes, Route, Router } from 'react-router-dom';

function ColorSchemesExample() {
  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">GMR_DB</Navbar.Brand>
          <Nav className="me-left">
            <Nav.Link href="/#/legalEntity">Юр. лица</Nav.Link>
            <Nav.Link href="/#/person">Физ. лица</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      
    </>
  );
}

export default ColorSchemesExample;
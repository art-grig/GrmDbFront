import React from 'react'
import { Container, Navbar } from 'react-bootstrap'
import Logo from './Logo'

export default function Header() {
  return (
    <>
    <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand href="/"><Logo /> </Navbar.Brand>
        </Container>
      </Navbar> </>
  )
}

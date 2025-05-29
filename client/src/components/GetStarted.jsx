import React from 'react'
import LoginForm from './LoginForm'
import RegistrationForm from './RegistrationForm'
import Navbar from './NavBar'
import '../styles/GetStarted.css'
import Footer from './Footer'

const GetStarted = () => {
  return (
    <>
      <Navbar />
      <div className='getstarted-container'>
        <RegistrationForm />
        <LoginForm />
      </div>
      <Footer />
    </>
  )
}

export default GetStarted;

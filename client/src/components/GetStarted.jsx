import React from 'react'
import LoginForm from './LoginForm'
import RegistrationForm from './RegistrationForm'
import '../styles/GetStarted.css'

const GetStarted = () => {
  return (
    <div className='container'>
      <RegistrationForm />
      <LoginForm />
    </div>
  )
}

export default GetStarted;

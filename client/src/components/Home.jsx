import React from 'react'
import LoginForm from './LoginForm'
import RegistrationForm from './RegistrationForm'
import '../styles/Home.css'

const Home = () => {
  return (
    <div className='container'>
      <RegistrationForm />
      <LoginForm />
    </div>
  )
}

export default Home

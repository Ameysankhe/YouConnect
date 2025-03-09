import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ContactForm.css'; 
import Navbar from './NavBar';
import Footer from './Footer';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const response = await axios.post('https://formcarry.com/s/QL23158RVMu', formData, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.data.code === 200) {
        setStatus('Message sent successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setStatus('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className='contactForm'>
      <div className="contact-container">
        <div className="contact-details">
          <h2>Get in touch</h2>
          <p>
            Have a question, comment, or need assistance? We're here to help! Please
            fill out the form below, and we'll get back to you as soon as possible.
          </p>
          <p>
            📞 +91 9699407467 <br />
            ✉️ <a href="mailto:support@youconnect.com">support@youconnect.com</a>
          </p>
        </div>
        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              maxLength={500}
              required
            ></textarea>
            <button type="submit">Submit</button>
          </form>
          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ContactForm;
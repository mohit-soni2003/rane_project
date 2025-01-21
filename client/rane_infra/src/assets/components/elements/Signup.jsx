import React, { useState } from 'react';
import './Signup.css'; // Create this CSS file for styling
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';


const Signup = () => {
    const {signup ,error , isLoading} = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
        console.log(formData.email,formData.password, formData.name);
        await signup(formData.email,formData.password, formData.name);
        // navigate("/verify-email");
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Create Account</h2>
      <p className="signup-subtitle">
        By creating an account, you may receive newsletters or promotions.
      </p>
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
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
          type="password"
          name="password"
          placeholder="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {error && <p className='signup-error'>{error} </p>}
        <button type="submit" className="signup-button">
        {isLoading ? <Loader className='' size={24} /> : "Sign Up"}

        </button>
      </form>
      <p className="signup-footer">
        Already have an account? <a href="/signin">Sign in</a>
      </p>
    </div>
  );
};

export default Signup;

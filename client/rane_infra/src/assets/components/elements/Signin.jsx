import React, { useState } from "react";
import { useAuthStore } from '../store/authStore';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Loader } from 'lucide-react';


const Signin = () => {
  const naviigate = useNavigate()
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData)
   const istrue= await login(formData.email, formData.password);

    if (istrue) {
      naviigate("/user-dashboard")
    }
    // Add sign-in logic here 
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Account sign in</h1>
        <p style={styles.subheading}>
          Sign in to your account to access your profile, history, and any
          private pages you've been granted access to.
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              style={styles.input}
            />
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={styles.input}
            />
          </div>

          {error && <p className='signup-error'>{error} </p>}


          {/* Submit Button */}
          <button type="submit" style={styles.button}>
            {isLoading ? <Loader className='' size={24} /> : "Sign In"}

          </button>

          {/* Reset Password Link */}
          <div style={styles.links}>
            <a href="/reset-password" style={styles.link}>
              Reset password
            </a>
          </div>

          {/* Create Account Link */}
          <div style={styles.createAccount}>
            <p>
              Not a member?{" "}
              <a href="/create-account" style={styles.link}>
                Create account.
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f9f9f9",
  },
  card: {
    maxWidth: "400px",
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#7b524d",
    marginBottom: "10px",
  },
  subheading: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#000",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  links: {
    marginBottom: "15px",
  },
  link: {
    color: "#7b524d",
    fontSize: "14px",
    textDecoration: "none",
  },
  createAccount: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#666",
  },
};

export default Signin;

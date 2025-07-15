import React, { useState } from "react";
import "./VerifyEmail.css";
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
      const {verifyEmail ,error, isLoading,user} = useAuthStore();
  

  const handleChange = (value, index) => {
    if (isNaN(value)) return; // Ensure only numbers are allowed
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input automatically
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleBackspace = (value, index) => {
    if (!value && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(otp.join(""));
        const isEmailVerified = await verifyEmail(otp.join(""));
        console.log(isEmailVerified);

        if (isEmailVerified) {
            navigate("/signin"); // Navigate if verification is successful
        } else {
            console.log("Email Not verified"); // Log the error from the server
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
    }
};

  return (
    <div className="verify-email-container">
      <h2>Verify Your Email</h2>
      <p>Enter the 6-digit code sent to your email address.</p>
      <div className="otp-input-container">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => {
              if (e.key === "Backspace") handleBackspace(e.target.value, index);
            }}
          /> 
        ))}
      </div>
      {error && <p className='signup-error'>{error} </p>}

      <button onClick={handleSubmit}>
                {isLoading ? <Loader className='' size={24} /> : "Verify Email"}
      </button>
    </div>
  );
};

export default VerifyEmail;

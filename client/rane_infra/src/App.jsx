import { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import Home from './assets/Home'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from './assets/components/elements/Signup';
import Signin from './assets/components/elements/Signin';
import VerifyEmail from './assets/components/elements/VerifyEmail';

import { useAuthStore } from './assets/components/store/authStore';

function App() {
  const {isCheckingAuth, checkAuth,isAuthenticated,user}= useAuthStore();
  useEffect(()=>{
    checkAuth();
  },[checkAuth])
  return (
    <>
    <BrowserRouter>
    <Routes>

    <Route path="/" element={<Home />}></Route>
    <Route path="/signup" element={<Signup />}></Route>
    <Route path="/signin" element={<Signin />}></Route>
    <Route path="/verify-email" element={<VerifyEmail />}></Route>

    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

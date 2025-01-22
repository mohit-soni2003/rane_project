import { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import Home from './assets/Home'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from './assets/components/elements/Signup';
import Signin from './assets/components/elements/Signin';
import VerifyEmail from './assets/components/elements/VerifyEmail';
import BillbookForm from './assets/components/elements/BillbookForm';
import AdminDashboard from './assets/components/elements/dashboard/AdminDashboard';
import UserDashboard from './assets/components/elements/dashboard/UserDashboard';
import { useAuthStore } from './assets/components/store/authStore';

function App() {
  const {isCheckingAuth, checkAuth,isAuthenticated,user}= useAuthStore();
  useEffect(()=>{
    checkAuth();
    console.log(user)
    console.log(isAuthenticated)
  },[checkAuth])
  return (
    <>
    <BrowserRouter>
    <Routes>

    <Route path="/" element={<Home />}></Route>
    <Route path="/signup" element={<Signup />}></Route>
    <Route path="/signin" element={<Signin />}></Route>
    <Route path="/verify-email" element={<VerifyEmail />}></Route>
    <Route path="/upload-bill" element={<BillbookForm />}></Route>
    <Route path="/admin-dashboard" element={<AdminDashboard/>}></Route>
    <Route path="/user-dashboard" element={<UserDashboard/>}></Route>

    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

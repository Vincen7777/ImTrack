import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToastProvider from "./components/common/ToastProvider";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import BerandaPage from "./pages/Beranda";
import AuthProvider from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import VerifyEmail from "./pages/VerifyEmail";


function App() {
  return (
    <>
      <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/beranda" element={<ProtectedRoute><BerandaPage /></ProtectedRoute>} />
        </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
    </>
  )
}

export default App

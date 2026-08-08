import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToastProvider from "./components/common/ToastProvider";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";


function App() {
  return (
    <>
      <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
    </>
  )
}

export default App


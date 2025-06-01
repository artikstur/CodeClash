import React from "react";
import RegisterPage from "./pages/RegisterPage.tsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage.tsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

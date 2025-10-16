import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Speakers from "./pages/Speakers";
import Schedule from "./pages/Schedule";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Signup from "./pages/Signup";

function App() {
  const location = useLocation();
  
  // Auth pages that don't need Header/Footer
  const authPages = ['/login', '/register', '/signup'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;

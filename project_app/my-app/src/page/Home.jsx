import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Home = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Background Video */}
      <div className="relative w-full h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/videos/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Main Page Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-6 bg-black/40">
          <img
            src={logo}
            alt="Project Monitoring Logo"
            className="w-60 h-60 mb-6 object-contain drop-shadow-xl"
          />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-lg tracking-wide">
            MINISTRY OF HIGH EDUCATION 
          </h1>
          <p className="text-lg md:text-2xl max-w-2xl mb-6 text-white drop-shadow-md">
            Project Monitoring System - Track, Manage, and Visualize Your Projects
          </p>

          <div className="flex space-x-4">
            {/* 🔵 Login Button Blue */}
            <Link
              to="/login"
              className="px-10 py-5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg
               hover:bg-blue-700 hover:scale-105
               hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]
               transition-transform duration-300 ease-in-out"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-10 py-5 bg-gray-200 text-black font-semibold rounded-xl shadow-md
               hover:scale-105 hover:bg-gray-300
               hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]
               transition-transform duration-300 ease-in-out"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer (👇 moves below video, not absolute) */}
      <footer className="w-full bg-black/90 text-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          {/* Left: Logo & Ministry */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src={logo} alt="Footer Logo" className="w-14 h-14 object-contain" />
            <span className="text-lg font-bold tracking-wide">
              Ministry of Higher Education
            </span>
          </div>

          {/* Middle: Quick Links */}
          <div className="flex space-x-6 text-sm font-medium">
            <Link to="/about" className="hover:text-blue-400 transition">About</Link>
            <Link to="/projects" className="hover:text-blue-400 transition">Projects</Link>
            <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
          </div>

          {/* Right: Contact Info */}
          <div className="text-sm text-gray-300 text-center md:text-right mt-4 md:mt-0">
            <p>📧 support@ministry.gov.lk</p>
            <p>📞 +94 11 234 5678</p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Ministry of Higher Education. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;

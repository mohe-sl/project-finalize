import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Form state management
  const [isLoading, setIsLoading] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '❌ Invalid email or password!');
        return;
      }

      // Save auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.roleId);
      localStorage.setItem('userData', JSON.stringify({
        id: data._id,
        username: data.username,
        email: data.email,
        institutionId: data.institutionId
      }));

      // First ensure the token is stored
      localStorage.setItem('token', data.token);
      
      // Store the exact role we received
      localStorage.setItem('role', data.roleId);
      
      // Store user data
      localStorage.setItem('userData', JSON.stringify({
        id: data._id,
        username: data.username,
        email: data.email,
        institutionId: data.institutionId,
        roleId: data.roleId
      }));

      // Role-based navigation: admin -> dashboard, all other users -> projects dashboard
      if (data.roleId === 'admin') {
        navigate('/projects'); // Redirect admin to dashboard
      } else {
        navigate('/projects'); // Redirect regular users to project dashboard
      }

      // Log the navigation for debugging
      console.log('Navigating user with role:', data.roleId);
    } catch (error) {
      console.error('Login error:', error);
      setError('❌ Connection failed. Please try again.');
    }
  };

  // Check if the background video exists (avoid loud console ERR when dev server not running)
  useEffect(() => {
    let cancelled = false;
    const checkVideo = async () => {
      try {
        const resp = await fetch('/videos/video.mp4', { method: 'HEAD' });
        if (!cancelled) setVideoAvailable(resp.ok);
      } catch (err) {
        if (!cancelled) setVideoAvailable(false);
      }
    };
    checkVideo();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Background Video with Overlay */}
      <div className="relative w-full h-screen overflow-hidden">
        {videoAvailable ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/videos/video.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-black"></div>
        )}

        {/* Gradient Overlay for WOW look */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/40 to-purple-900/40"></div>

        {/* Login Card */}
        <div className="relative z-10 flex items-center justify-center w-full h-full px-4">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_0_40px_rgba(59,130,246,0.6)] rounded-3xl w-full max-w-md p-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src={logo}
                alt="Logo"
                className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
              />
            </div>

            {/* Title */}
            <h2 className="text-4xl font-extrabold text-center text-white mb-3 tracking-wide drop-shadow-lg">
              Welcome Back ✨
            </h2>
            <p className="text-center text-gray-200 mb-8 text-lg">
              Sign in to{" "}
              <span className="text-blue-400 font-semibold">
                Project Monitoring System
              </span>
            </p>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-center mb-4 font-medium animate-pulse">
                {error}
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-200 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border rounded-xl bg-white/20 text-white placeholder-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-200 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border rounded-xl bg-white/20 text-white placeholder-gray-300
                  focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg
                transition duration-300 ease-in-out ${
                  isLoading 
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-[0_0_25px_rgba(139,92,246,0.7)]'
                }`}
              >
                {isLoading ? 'Logging in...' : '🚀 Login'}
              </button>
            </form>

            {/* Links */}
            <div className="flex justify-between items-center mt-6 text-sm text-gray-300">
              <Link to="/forgot-password" className="hover:text-blue-300 transition">
                Forgot Password?
              </Link>
              <Link to="/signup" className="hover:text-purple-300 transition">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-black/90 text-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          {/* Left */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src={logo} alt="Footer Logo" className="w-14 h-14 object-contain" />
            <span className="text-lg font-bold tracking-wide">
              Ministry of Higher Education
            </span>
          </div>

          {/* Middle */}
          <div className="flex space-x-6 text-sm font-medium">
            <Link to="/about" className="hover:text-blue-400 transition">About</Link>
            <Link to="/projects" className="hover:text-blue-400 transition">Projects</Link>
            <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
          </div>

          {/* Right */}
          <div className="text-sm text-gray-300 text-center md:text-right mt-4 md:mt-0">
            <p>📧 support@ministry.gov.lk</p>
            <p>📞 +94 11 234 5678</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Ministry of Higher Education. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Login;

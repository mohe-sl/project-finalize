import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    institutionId: "",
    roleId: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!form.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        // Registration succeeded — attempt to log the user in automatically
        try {
          const loginRes = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, password: form.password })
          });

          const loginData = await loginRes.json();
          if (loginRes.ok) {
            // Save auth data
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('role', loginData.roleId);
            localStorage.setItem('userData', JSON.stringify({
              id: loginData._id,
              username: loginData.username,
              email: loginData.email,
              institutionId: loginData.institutionId,
              roleId: loginData.roleId
            }));

            // Redirect based on role
            if (loginData.roleId === 'admin') navigate('/chart');
            else if (loginData.roleId === 'physicalStaff' || loginData.roleId === 'financialStaff' || loginData.roleId === 'registrar') navigate('/monthly');
            else navigate('/');
            return;
          }
        } catch (err) {
          // If auto-login fails, fall back to manual login flow
          console.warn('Auto-login failed after registration:', err);
        }

        alert('Registration successful! Please log in.');
        navigate("/login");
      } else {
        // Server returned an error
        setError(data.message || 'Registration failed. Please check your information.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Connection failed. Please check your internet and try again.');
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Background Video */}
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

      {/* Transparent Form Container */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="bg-white/20 backdrop-blur-md shadow-2xl rounded-3xl w-full max-w-3xl p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Create Your Account
          </h2>
          <p className="text-center text-white/80 mb-8">
            Fill in the details to get started
          </p>

          {error && (
            <div className="bg-red-500/80 text-white p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-white font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/30 text-white placeholder-white/70"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/30 text-white placeholder-white/70"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/30 text-white placeholder-white/70"
                required
              />
            </div>

            {/* Institution Select */}
            <div>
              <label className="block text-white font-medium mb-2">
                Institution
              </label>
              <select
                name="institutionId"
                value={form.institutionId}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/30 text-white"
                required
              >
                <option value="">Select Institution</option>
                <option value="University of Colombo">University of Colombo</option>
                <option value="University of Peradeniya">University of Peradeniya</option>
                <option value="University of Sri Jayewardenepura">University of Sri Jayewardenepura</option>
                <option value="University of Kelaniya">University of Kelaniya</option>
                <option value="University of Moratuwa">University of Moratuwa</option>
                <option value="University of Jaffna">University of Jaffna</option>
                <option value="University of Ruhuna">University of Ruhuna</option>
                <option value="Eastern University, Sri Lanka">Eastern University, Sri Lanka</option>
                <option value="South Eastern University of Sri Lanka">South Eastern University of Sri Lanka</option>
                <option value="Rajarata University of Sri Lanka">Rajarata University of Sri Lanka</option>
                <option value="Sabaragamuwa University of Sri Lanka">Sabaragamuwa University of Sri Lanka</option>
                <option value="Wayamba University of Sri Lanka">Wayamba University of Sri Lanka</option>
                <option value="Uva Wellassa University">Uva Wellassa University</option>
                <option value="University of the Visual & Performing Arts">University of the Visual & Performing Arts</option>
                <option value="Buddhist and Pali University of Sri Lanka">Buddhist and Pali University of Sri Lanka</option>
                <option value="Bhiksu University of Sri Lanka">Bhiksu University of Sri Lanka</option>
                <option value="Gampaha Wickramarachchi University of Indigenous Medicine">Gampaha Wickramarachchi University of Indigenous Medicine</option>
                <option value="University of Vavuniya">University of Vavuniya</option>
              </select>
            </div>

            {/* Role Select */}
            <div className="md:col-span-2">
              <label className="block text-white font-medium mb-2">
                Role
              </label>
              <select
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/30 text-white"
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Administrator</option>
                <option value="physicalStaff">Physical Staff</option>
                <option value="financialStaff">Financial Staff</option>
                <option value="registrar">Registrar</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:from-indigo-700 hover:to-purple-700 transition-transform duration-300"
              >
                Sign Up
              </button>
            </div>
          </form>

          {/* Extra Option */}
          <p className="text-center text-white/70 mt-6 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-400 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

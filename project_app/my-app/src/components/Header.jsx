import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";
import logo from "../assets/logo.png"; // adjust the path if your logo is elsewhere
import axios from 'axios';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const userDataRaw = localStorage.getItem('userData');
  let user = null;
  try {
    user = userDataRaw ? JSON.parse(userDataRaw) : null;
  } catch (e) {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    navigate('/');
  };

  // Theme (dark / light) handling
  const [theme, setTheme] = useState('light');

  // Language (i18n)
  const { lang, setLang, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchProjectsIfNeeded = async () => {
    if (projects.length > 0) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setProjects(res.data || []);
    } catch (err) {
      // ignore silently
      console.error('Search fetch projects failed', err);
    }
  };

  const onSearchChange = async (value) => {
    setSearchQuery(value);
    if (!value) {
      setSuggestions([]);
      return;
    }
    await fetchProjectsIfNeeded();
    const q = value.toLowerCase();
    const filtered = projects.filter(p => (p.projectName || '').toLowerCase().includes(q) || (p.institution || '').toLowerCase().includes(q));
    setSuggestions(filtered.slice(0, 6));
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (p) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    // Navigate to project edit page (works for admin and owners)
    navigate(`/projects/edit/${p._id}`);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) {
        setTheme(stored);
        if (stored === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else {
        // respect OS preference if available
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = prefersDark ? 'dark' : 'light';
        setTheme(initial);
        if (initial === 'dark') document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error('Theme init error', e);
    }

    
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) {
      console.error('Theme toggle error', e);
    }
  };

  const initials = user?.username
    ? user.username.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
    : 'U';

  return (
    <header className="bg-gradient-to-b from-blue-950 via-blue-950 to-blue-900 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Left: menu + logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleSidebar && toggleSidebar()}
            className="mr-2 p-2 rounded-md bg-white/10 hover:bg-white/20"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <img src={logo} alt="Ministry Logo" className="h-12 w-12 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-wide">MINISTRY of HIGHER EDUCATION</span>
            <span className="text-sm font-medium tracking-wide text-gray-200">PROJECT MONITORING SYSTEM</span>
          </div>
        </div>

        {/* Middle + Right: search and actions */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => fetchProjectsIfNeeded()}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search projects..."
              className="px-3 py-2 rounded-md w-64 text-gray-800"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white rounded shadow max-h-48 overflow-auto z-50">
                {suggestions.map((s) => (
                  <li key={s._id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => handleSelectSuggestion(s)}>
                    <div className="font-medium text-sm">{s.projectName}</div>
                    <div className="text-xs text-gray-500">{s.institution || ''}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="p-2 rounded-md bg-white/10 hover:bg-white/20"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>

            <button
              onClick={() => setLang(lang === 'en' ? 'si' : 'en')}
              aria-label={lang === 'en' ? 'Switch to Sinhala' : 'Switch to English'}
              title={lang === 'en' ? 'සිංහල' : 'English'}
              className="p-2 rounded-md bg-white/10 hover:bg-white/20"
            >
              {lang === 'en' ? 'EN' : 'සිං'}
            </button>

            {!user && (
              <Link to="/login" className="px-4 py-2 rounded-md bg-blue-700 text-white font-medium hover:bg-gray-100 transition">
                {t('login')}
              </Link>
            )}

            {user && (
              <>
                <Link to="/profile" className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">{initials}</div>
                  <div className="hidden md:block text-sm">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-gray-200">{user.email}</div>
                  </div>
                </Link>

                <button onClick={handleLogout} className="px-4 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-gray-100 transition">{t('logout')}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

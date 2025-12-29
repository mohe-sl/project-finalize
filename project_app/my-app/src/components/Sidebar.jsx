import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // get logged-in role

  // Path to latest progress details (fallback to /progress)
  const [latestProgressPath, setLatestProgressPath] = useState("/progress");
  const [latestAnalyticsPath, setLatestAnalyticsPath] = useState("/projects");
  const [latestProgressListPath, setLatestProgressListPath] = useState("/projects");

  const adminMenu = [
    // Admin sees project overview and user management
    { name: "Project Dashboard", path: "/projects" },
    { name: "New Project", path: "/projects/new" },
    { name: "Overview", path: "/admin/dashboard" },
    { name: "User Management", path: "/admin/users" },
  ];

  const userMenu = [
    { name: "Project Dashboard", path: "/projects" },
    { name: "Project Progress", path: "/progress" },
  ];

  const menuItems = role === "admin" ? adminMenu : userMenu;

  useEffect(() => {
    let mounted = true;
    const fetchLatestProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/progress", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          // find the most recently created progress
          const latest = data.reduce((a, b) => {
            return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
          });
          const id = latest._id || latest.id;
          const projectIdRaw = latest.projectId;
          let projectId = null;
          if (typeof projectIdRaw === 'string') projectId = projectIdRaw;
          else if (projectIdRaw && typeof projectIdRaw === 'object') projectId = projectIdRaw._id || projectIdRaw.id || null;

          if (id) setLatestProgressPath(`/progress-details/${id}`);
          if (projectId) {
            setLatestAnalyticsPath(`/projects/${projectId}/analytics`);
            setLatestProgressListPath(`/projects/${projectId}/progress-list`);
          }
        } else {
          setLatestProgressPath("/progress");
          setLatestAnalyticsPath("/projects");
        }
      } catch (err) {
        // ignore network errors; keep fallback
      }
    };
    fetchLatestProgress();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-blue-900 via-gray-900 to-blue-800 text-white shadow-lg transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo / Title */}
      <div className="flex items-center justify-between p-4 border-b border-gray-500">
        {isOpen && (
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wider">
              PROJECT
            </span>
            <span className="text-sm text-gray-300">{role?.toUpperCase()} PANEL</span>
          </div>
        )}
        <button
        
          className="p-2 rounded-full hover:bg-gray-500 transition"
          onClick={toggleSidebar}
        >
          {isOpen ? "⬅️" : "➡️"}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-auto mt-4">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            aria-label={item.name}
            className={({ isActive }) =>
              `flex items-center p-4 mx-2 my-1 rounded-lg transition-all duration-300 hover:bg-blue-700 hover:scale-105 ${
                isActive ? "bg-blue-800 font-semibold shadow-lg" : "bg-transparent"
              }`
            }
          >
            <span className="flex-shrink-0 mr-3 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 2a1 1 0 0 1 .894.553l6 12A1 1 0 0 1 16 16H4a1 1 0 0 1-.894-1.447l6-12A1 1 0 0 1 10 2z" />
              </svg>
            </span>
            {isOpen ? (
              <span className="whitespace-nowrap">{item.name}</span>
            ) : null}
          </NavLink>
        ))}

        {/* Progress Details quick link - hide for admin users */}
        {/* Progress Details quick link removed from sidebar as requested */}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-500">
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded bg-white text-gray-800 font-semibold hover:bg-gray-200 transition-transform transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

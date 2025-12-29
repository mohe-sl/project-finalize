import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import SimpleLayout from "./components/SimpleLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Home from "./page/Home.jsx";
import Login from "./page/Login.jsx";
import Signup from "./page/Signup.jsx";
import ProjectForm from "./page/User/ProjectForm.jsx";
import ProjectDashboard from "./page/User/ProjectDashboard.jsx";
import ProjectNewDahsboard from "./page/User/Project_new_dahsboard.jsx";
import Profile from "./page/User/Profile.jsx";
import ProjectProgressForm from "./page/User/ProjectProgressForm.jsx";
import ProjectProgressDetails from "./page/User/ProjectProgressDetails.jsx";
import ProjectChart from "./page/Admin/ProjectChart.jsx";
import ProjectImageView from "./page/Admin/ProjectImageView.jsx";
import AdminDashboard from "./page/Admin/AdminDashboard.jsx";
import MonthlyImageUploader from "./page/User/MonthlyImageUploader.jsx";
import AdminMonthlyProgress from "./page/Admin/AdminMonthlyProgress.jsx";
import UpdateProjectProgress from "./page/User/UpdateProjectProgress.jsx";
import ProjectProgressAnalytics from "./page/User/ProjectProgressAnalytics.jsx";
import ProjectProgressList from "./page/User/ProjectProgressList.jsx";
import UserManagement from "./page/Admin/UserManagement.jsx";
import AdminProjectAnalytics from "./page/Admin/AdminProjectAnalytics.jsx";

function App() {
  // Initialize theme on app load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Theme init in App error', e);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* SimpleLayout pages */}
        <Route element={<SimpleLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* MainLayout pages */}
        <Route element={<MainLayout />}>
          {/* Projects */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectNewDahsboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute role="admin">
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/edit/:id"
            element={
              <ProtectedRoute role="admin">
                <ProjectForm />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/chart"
            element={
              <ProtectedRoute role="admin">
                <ProjectChart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute role="admin">
                <AdminProjectAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute role="admin">
                <ProjectImageView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proImage"
            element={
              <ProtectedRoute role="admin">
                <AdminMonthlyProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pform"
            element={
              <ProtectedRoute role="user">
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute role="user">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress/:projectId"
            element={
              <ProtectedRoute role="user">
                <ProjectProgressForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/analytics"
            element={
              <ProtectedRoute role="user">
                <ProjectProgressAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/progress-list"
            element={
              <ProtectedRoute role="user">
                <ProjectProgressList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute role="user">
                <ProjectProgressForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress-details/:progressId"
            element={
              <ProtectedRoute role="user">
                <ProjectProgressDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-progress/:progressId"
            element={
              <ProtectedRoute role="user">
                <UpdateProjectProgress />
              </ProtectedRoute>
            }
          />
          {/* User */}
          <Route
            path="/monthly"
            element={
              <ProtectedRoute role="user">
                <MonthlyImageUploader />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          {/* admin assign-institutions route removed per request */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

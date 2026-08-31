import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import VoiceStudio from './pages/VoiceStudio';
import ResumeOptimizer from './pages/ResumeOptimizer';
import TemplateSelector from './pages/TemplateSelector';
import ProtectedRoute from './routes/ProtectedRoute';

import MyResumes from './pages/MyResumes';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

            {/* Private Routes with DashboardLayout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/builder" element={<ResumeBuilder />} />
            <Route path="/builder/:id" element={<ResumeBuilder />} />
            <Route path="/studio" element={<VoiceStudio />} />
            <Route path="/studio/:id" element={<VoiceStudio />} />
            <Route path="/optimize/:id" element={<ResumeOptimizer />} />
            <Route path="/templates/:id" element={<TemplateSelector />} />
            <Route path="/resumes" element={<MyResumes />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

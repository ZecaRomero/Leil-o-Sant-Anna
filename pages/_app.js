import "../styles/globals.css";
import { useState, useEffect } from "react";
import LoginForm from '../components/LoginForm'
import animalDataManager from '../services/animalDataManager'

export default function App({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }

    // Check if user is already logged in
    const token = animalDataManager.loadToken()
    if (token) {
      const userData = localStorage.getItem('beef_sync_user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    setLoading(false)
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    animalDataManager.logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <Component
        {...pageProps}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}

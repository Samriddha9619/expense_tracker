import React, { useState, useEffect } from 'react';
import { User } from './types';
import { authAPI } from './api/auth';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Expenses/Dashboard';
import Transactions from './components/Expenses/Transactions';
import Accounts from './components/Expenses/Accounts';
import Categories from './components/Expenses/Categories';
import AIInsights from './components/Insights/AIInsights';
import Landing from './components/Landing/Landing';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const userData = await authAPI.getProfile();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setIsLoading(false);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setCurrentPage('dashboard');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'accounts':
        return <Accounts />;
      case 'categories':
        return <Categories />;
      case 'insights':
        return <AIInsights />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Landing 
          onLoginClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onRegisterClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
        />

        {showAuthModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(6px)'
          }} onClick={() => setShowAuthModal(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: 'min(540px, 92vw)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e9eef7',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              padding: 20
            }}>
              {authMode === 'login' ? (
                <Login 
                  onLogin={handleLogin} 
                  onSwitchToRegister={() => setAuthMode('register')} 
                />
              ) : (
                <Register 
                  onRegister={handleRegister} 
                  onSwitchToLogin={() => setAuthMode('login')} 
                />
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <main>
        <div key={currentPage} className="pageSwitch">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;

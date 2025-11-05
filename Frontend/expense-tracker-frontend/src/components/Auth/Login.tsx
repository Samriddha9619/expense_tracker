import React, { useState } from 'react';
import { LoginData } from '../../types';
import { authAPI } from '../../api/auth';

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with email:', formData.email);
      const response = await authAPI.login(formData);
      console.log('Login successful:', response);
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      onLogin(response.user);
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Login failed';
      if (err.response?.data?.non_field_errors) {
        errorMessage = err.response.data.non_field_errors[0];
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form" style={{ margin: 0 }}>
      <h2 className="cardTitle" style={{fontSize:22, marginBottom:12}}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div style={{ color: '#ff6b6b', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} className="btn btn--primary" style={{width:'100%'}}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{ background: 'none', border: 'none', color: '#5b8cff', cursor: 'pointer' }}
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default Login;

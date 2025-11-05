import React, { useState } from 'react';
import { RegisterData } from '../../types';
import { authAPI } from '../../api/auth';

interface RegisterProps {
  onRegister: (user: any) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
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
    console.log('Form submitted!');
    console.log('Current form data:', formData);
    
    setLoading(true);
    setError('');

    // Validate all required fields
    if (!formData.username || !formData.email || !formData.first_name || !formData.last_name || !formData.password || !formData.password_confirm) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration with:', { ...formData, password: '***', password_confirm: '***' });
      const response = await authAPI.register(formData);
      console.log('Registration successful:', response);
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      onRegister(response.user);
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      
      // Handle different error formats
      let errorMessage = 'Registration failed';
      if (err.response?.data?.errors) {
        // Backend returns errors object
        const errors = err.response.data.errors;
        errorMessage = Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
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
      <h2 className="cardTitle" style={{fontSize:22, marginBottom:12}}>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="formRow" style={{marginBottom:12}}>
          <div>
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
        </div>
        <div className="formRow" style={{marginBottom:12}}>
          <div>
            <label>First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div>
            <label>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="formRow" style={{marginBottom:12}}>
          <div>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required />
          </div>
        </div>
        {error && <div style={{ color: '#ff6b6b', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} className="btn btn--success" style={{width:'100%'}}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#5b8cff', cursor: 'pointer' }}>
          Login here
        </button>
      </p>
    </div>
  );
};

export default Register;

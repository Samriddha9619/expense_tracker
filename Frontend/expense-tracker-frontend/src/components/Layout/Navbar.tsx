import React from 'react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, currentPage, onPageChange }) => {
  if (!user) return null;

  return (
    <nav style={{
      background:
        'linear-gradient(135deg, rgba(91,140,255,0.95), rgba(124,91,255,0.95))',
      color: 'white',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: '0 6px 24px rgba(0,0,0,0.25)'
    }}>
      <div>
        <h3 style={{ margin: 0, letterSpacing: 0.3 }}>SpendWise</h3>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange('dashboard')}
          style={{
            background: currentPage === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '8px 14px',
            borderRadius: '999px',
            cursor: 'pointer',
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => onPageChange('transactions')}
          style={{
            background: currentPage === 'transactions' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '8px 14px',
            borderRadius: '999px',
            cursor: 'pointer',
          }}
        >
          Transactions
        </button>
        <button
          onClick={() => onPageChange('accounts')}
          style={{
            background: currentPage === 'accounts' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '8px 14px',
            borderRadius: '999px',
            cursor: 'pointer',
          }}
        >
          Accounts
        </button>
        <button
          onClick={() => onPageChange('categories')}
          style={{
            background: currentPage === 'categories' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '8px 14px',
            borderRadius: '999px',
            cursor: 'pointer',
          }}
        >
          Categories
        </button>
        <button
          onClick={() => onPageChange('insights')}
          style={{
            background: currentPage === 'insights' ? 'rgba(255,255,255,0.25)' : 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '8px 14px',
            borderRadius: '999px',
            cursor: 'pointer',
          }}
        >
          🤖 AI Insights
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Welcome, {user.first_name}!</span>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              padding: '8px 14px',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

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
      backgroundColor: '#343a40',
      color: 'white',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <h3 style={{ margin: 0 }}>Expense Tracker</h3>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange('dashboard')}
          style={{
            background: currentPage === 'dashboard' ? '#007bff' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => onPageChange('transactions')}
          style={{
            background: currentPage === 'transactions' ? '#007bff' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Transactions
        </button>
        <button
          onClick={() => onPageChange('accounts')}
          style={{
            background: currentPage === 'accounts' ? '#007bff' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Accounts
        </button>
        <button
          onClick={() => onPageChange('categories')}
          style={{
            background: currentPage === 'categories' ? '#007bff' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Categories
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Welcome, {user.first_name}!</span>
          <button
            onClick={onLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
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

import React, { useState, useEffect } from 'react';
import { Account } from '../../types';
import { expensesAPI } from '../../api/expenses';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
];

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    account_type: 'checking',
    description: '',
  });
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await expensesAPI.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await expensesAPI.updateAccount(editingAccount.id, formData);
      } else {
        await expensesAPI.createAccount(formData);
      }
      setFormData({ name: '', account_type: 'checking', description: '' });
      setEditingAccount(null);
      setShowForm(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      account_type: account.account_type,
      description: account.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await expensesAPI.deleteAccount(id);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  if (loading) return <div className="container">Loading accounts...</div>;

  return (
    <div className="container">
      <h2 className="pageTitle">Accounts</h2>
      <button onClick={() => setShowForm(!showForm)} className="btn btn--primary" style={{marginBottom:16}}>
        {showForm ? 'Cancel' : 'Add Account'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form" style={{ marginBottom: 16 }}>
          <h3>{editingAccount ? 'Edit Account' : 'Add New Account'}</h3>
          <div style={{ marginBottom: 14 }}>
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Account Type:</label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              
            />
          </div>
          <button type="submit" className="btn btn--success" style={{marginRight:8}}>
            {editingAccount ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => {
              setShowForm(false);
              setEditingAccount(null);
              setFormData({ name: '', account_type: 'checking', description: '' });
            }}>
            Cancel
          </button>
        </form>
      )}

      <div className="grid" style={{gap:12}}>
        {accounts.map((account) => (
          <div key={account.id} className="listItem">
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div className="avatar">{(account.name && account.name[0]) ? account.name[0].toUpperCase() : 'A'}</div>
              <div>
                <h4 className="listTitle" style={{marginBottom:4}}>{account.name}
                  <span className="tag" style={{marginLeft:8}}>{account.is_active ? 'Active' : 'Inactive'}</span>
                </h4>
                <p className="muted" style={{margin:'0 0 8px 0'}}>
                  {account.account_type_display} • {account.description || 'No description'}
                </p>
                <div className="muted" style={{fontSize:14}}>
                  <span>Balance: <strong>₹{account.balance}</strong></span>
                  <span style={{ marginLeft: '20px' }}>Transactions: {account.transaction_count}</span>
                </div>
              </div>
            </div>
            <div>
              <button onClick={() => handleEdit(account)} className="btn" style={{marginRight:8}}>Edit</button>
              <button onClick={() => handleDelete(account.id)} className="btn btn--danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounts;

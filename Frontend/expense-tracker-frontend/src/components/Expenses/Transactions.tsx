import React, { useState, useEffect } from 'react';
import { Transaction, Account, Category, TransactionSummary } from '../../types';
import { expensesAPI } from '../../api/expenses';

const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account: '',
    category: '',
    transaction_type: 'expense',
    amount: '',
    description: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsData, accountsData, categoriesData, summaryData] = await Promise.all([
        expensesAPI.getTransactions(),
        expensesAPI.getAccounts(),
        expensesAPI.getCategories(),
        expensesAPI.getTransactionSummary(),
      ]);
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        account: parseInt(formData.account),
        category: formData.category ? parseInt(formData.category) : undefined,
        amount: formData.amount,
      };

      if (editingTransaction) {
        await expensesAPI.updateTransaction(editingTransaction.id, submitData);
      } else {
        await expensesAPI.createTransaction(submitData);
      }
      
      setFormData({
        account: '',
        category: '',
        transaction_type: 'expense',
        amount: '',
        description: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
      setEditingTransaction(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      account: transaction.account.toString(),
      category: transaction.category?.toString() || '',
      transaction_type: transaction.transaction_type,
      amount: transaction.amount,
      description: transaction.description,
      notes: transaction.notes,
      date: transaction.date,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await expensesAPI.deleteTransaction(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Transactions</h2>
      
      {summary && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '20px' 
        }}>
          <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#155724' }}>Total Income</h4>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
              ₹{summary.total_income.toFixed(2)}
            </p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#721c24' }}>Total Expenses</h4>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
              ₹{summary.total_expenses.toFixed(2)}
            </p>
          </div>
          <div style={{ padding: '15px', backgroundColor: summary.net_amount >= 0 ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: summary.net_amount >= 0 ? '#155724' : '#721c24' }}>Net Amount</h4>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: summary.net_amount >= 0 ? '#155724' : '#721c24' }}>
              ₹{summary.net_amount.toFixed(2)}
            </p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#0c5460' }}>Total Transactions</h4>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
              {summary.transaction_count}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        {showForm ? 'Cancel' : 'Add Transaction'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Account:</label>
              <select
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.account_type_display})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Category:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Transaction Type:</label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Amount:</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Description:</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Date:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Notes:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            {editingTransaction ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingTransaction(null);
              setFormData({
                account: '',
                category: '',
                transaction_type: 'expense',
                amount: '',
                description: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
              });
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>
                  {transaction.description}
                </h4>
                <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                  {transaction.account_name} • {transaction.category_name || 'No Category'} • {transaction.transaction_type_display}
                </p>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span>Amount: ₹{transaction.amount}</span>
                  <span style={{ marginLeft: '20px' }}>Date: {transaction.date}</span>
                  {transaction.notes && (
                    <div style={{ marginTop: '5px' }}>
                      <strong>Notes:</strong> {transaction.notes}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(transaction)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '5px',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;

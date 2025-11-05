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
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
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
  }, [filterCategory, filterType]);

  const fetchData = async () => {
    try {
      // Build query params for filtering
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterType) params.append('transaction_type', filterType);
      
      const queryString = params.toString();
      const transactionsUrl = queryString ? `/transactions/?${queryString}` : '/transactions/';
      
      const [transactionsData, accountsData, categoriesData, summaryData] = await Promise.all([
        expensesAPI.getTransactions(transactionsUrl),
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

  if (loading) return <div className="container">Loading transactions...</div>;

  return (
    <div className="container">
      <h2 className="pageTitle">Transactions</h2>
      
      {summary && (
        <div className="grid grid-auto-sm" style={{marginBottom:16}}>
          <div className="kpi kpi--success"><h4 className="cardTitle">Total Income</h4><div className="big">₹{summary.total_income.toFixed(2)}</div></div>
          <div className="kpi kpi--danger"><h4 className="cardTitle">Total Expenses</h4><div className="big">₹{summary.total_expenses.toFixed(2)}</div></div>
          <div className={summary.net_amount >= 0 ? 'kpi kpi--success' : 'kpi kpi--danger'}><h4 className="cardTitle">Net Amount</h4><div className="big">₹{summary.net_amount.toFixed(2)}</div></div>
          <div className="kpi kpi--info"><h4 className="cardTitle">Total Transactions</h4><div className="big">{summary.transaction_count}</div></div>
        </div>
      )}

      {/* Filters */}
      <div className="form" style={{marginBottom:16, padding:16}}>
        <h3 className="cardTitle" style={{marginBottom:12}}>Filter Transactions</h3>
        <div className="formRow">
          <div>
            <label>Filter by Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Filter by Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {TRANSACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
        {(filterCategory || filterType) && (
          <button 
            onClick={() => { setFilterCategory(''); setFilterType(''); }} 
            className="btn btn--ghost" 
            style={{marginTop:8}}
          >
            Clear Filters
          </button>
        )}
      </div>

      <button onClick={() => setShowForm(!showForm)} className="btn btn--primary" style={{marginBottom:16}}>
        {showForm ? 'Cancel' : 'Add Transaction'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form" style={{ marginBottom: 16 }}>
          <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <div className="formRow" style={{marginBottom:14}}>
            <div>
              <label>Account:</label>
              <select
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                required
                
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
          <div className="formRow" style={{marginBottom:14}}>
            <div>
              <label>Transaction Type:</label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                
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
                
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Description:</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Date:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Notes:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              
            />
          </div>
          <button type="submit" className="btn btn--success" style={{marginRight:8}}>
            {editingTransaction ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => {
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
            }}>
            Cancel
          </button>
        </form>
      )}

      <div className="list">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="listItem">
            <div>
              <h4 className="listTitle">{transaction.description}</h4>
              <p className="muted" style={{margin:'0 0 8px 0'}}>
                {transaction.account_name} • {transaction.category_name || 'No Category'} • {transaction.transaction_type_display}
              </p>
              {transaction.notes && (
                <div className="muted" style={{fontSize:14, marginTop: 5}}>
                  <strong>Notes:</strong> {transaction.notes}
                </div>
              )}
            </div>
            <div style={{textAlign:'right'}}>
              <div>
                <span className={`pill ${transaction.transaction_type === 'income' ? 'pill--income' : (transaction.transaction_type === 'expense' ? 'pill--expense' : 'pill--info')}`}>
                  ₹{transaction.amount}
                </span>
              </div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>{transaction.date}</div>
              <div style={{marginTop:8}}>
                <span className="tag">{transaction.transaction_type_display}</span>
              </div>
              <div style={{marginTop:8}}>
                <button onClick={() => handleEdit(transaction)} className="btn" style={{marginRight:8}}>Edit</button>
                <button onClick={() => handleDelete(transaction.id)} className="btn btn--danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;

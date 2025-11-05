import React, { useState, useEffect } from 'react';
import { TransactionSummary, Account } from '../../types';
import { expensesAPI } from '../../api/expenses';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryData, accountsData] = await Promise.all([
        expensesAPI.getTransactionSummary(),
        expensesAPI.getAccounts(),
      ]);
      setSummary(summaryData);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading dashboard...</div>;

  return (
    <div className="container">
      <h2 className="pageTitle">Dashboard</h2>
      
      {summary && (
        <div className="grid grid-auto" style={{marginBottom:20}}>
          <div className="kpi kpi--success">
            <h3 className="cardTitle">Total Income</h3>
            <div className="big">₹{summary.total_income.toFixed(2)}</div>
            <div className="muted">{summary.income_count} transactions</div>
          </div>
          <div className="kpi kpi--danger">
            <h3 className="cardTitle">Total Expenses</h3>
            <div className="big">₹{summary.total_expenses.toFixed(2)}</div>
            <div className="muted">{summary.expense_count} transactions</div>
          </div>
          <div className={summary.net_amount >= 0 ? 'kpi kpi--success' : 'kpi kpi--danger'}>
            <h3 className="cardTitle">Net Amount</h3>
            <div className="big">₹{summary.net_amount.toFixed(2)}</div>
            <div className="muted">{summary.net_amount >= 0 ? 'Profit' : 'Loss'}</div>
          </div>
          <div className="kpi kpi--info">
            <h3 className="cardTitle">Total Transactions</h3>
            <div className="big">{summary.transaction_count}</div>
            <div className="muted">All time</div>
          </div>
        </div>
      )}

      <div>
        <h3 className="cardTitle" style={{marginBottom:12}}>Your Accounts</h3>
        {accounts.length === 0 ? (
          <p className="muted">No accounts found. Create your first account to start tracking expenses.</p>
        ) : (
          <div className="grid grid-auto">
            {accounts.map((account) => (
              <div key={account.id} className="card pad">
                <div className="listItem" style={{background:'transparent',padding:0,border:'none'}}>
                  <div>
                    <h4 className="listTitle">{account.name}</h4>
                    <p className="muted" style={{margin:'0 0 8px 0'}}>{account.account_type_display}</p>
                    <div className="muted" style={{fontSize:14}}>
                      <div>Balance: <strong>₹{account.balance}</strong></div>
                      <div>Transactions: {account.transaction_count}</div>
                      <div>Status: {account.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

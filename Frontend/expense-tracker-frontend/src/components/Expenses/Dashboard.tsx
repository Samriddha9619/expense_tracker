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

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      
      {summary && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#d4edda', 
            borderRadius: '8px',
            border: '1px solid #c3e6cb'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>Total Income</h3>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#155724' }}>
              ₹{summary.total_income.toFixed(2)}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#155724' }}>
              {summary.income_count} transactions
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8d7da', 
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>Total Expenses</h3>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#721c24' }}>
              ₹{summary.total_expenses.toFixed(2)}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#721c24' }}>
              {summary.expense_count} transactions
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: summary.net_amount >= 0 ? '#d4edda' : '#f8d7da', 
            borderRadius: '8px',
            border: `1px solid ${summary.net_amount >= 0 ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: summary.net_amount >= 0 ? '#155724' : '#721c24' 
            }}>
              Net Amount
            </h3>
            <p style={{ 
              margin: '0', 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: summary.net_amount >= 0 ? '#155724' : '#721c24' 
            }}>
              ₹{summary.net_amount.toFixed(2)}
            </p>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: '14px', 
              color: summary.net_amount >= 0 ? '#155724' : '#721c24' 
            }}>
              {summary.net_amount >= 0 ? 'Profit' : 'Loss'}
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#d1ecf1', 
            borderRadius: '8px',
            border: '1px solid #bee5eb'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>Total Transactions</h3>
            <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#0c5460' }}>
              {summary.transaction_count}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#0c5460' }}>
              All time
            </p>
          </div>
        </div>
      )}

      <div>
        <h3>Your Accounts</h3>
        {accounts.length === 0 ? (
          <p>No accounts found. Create your first account to start tracking expenses.</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '15px' 
          }}>
            {accounts.map((account) => (
              <div
                key={account.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>
                      {account.name}
                    </h4>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                      {account.account_type_display}
                    </p>
                    <div style={{ fontSize: '14px', color: '#666' }}>
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

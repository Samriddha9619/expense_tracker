import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../../api/expenses';

interface Insight {
  title: string;
  message: string;
}

interface InsightsData {
  insights: Insight[];
  spending_data: {
    current_month: {
      income: number;
      expenses: number;
      balance: number;
    };
    previous_month: {
      income: number;
      expenses: number;
      balance: number;
    };
    top_categories: Array<{
      category: string;
      amount: number;
    }>;
  };
  generated_at: string;
}

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await expensesAPI.getAIInsights();
      setInsights(data);
    } catch (err: any) {
      console.error('Failed to fetch AI insights:', err);
      setError(err.response?.data?.error || 'Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="pageTitle">🤖 AI Financial Insights</h2>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="btn btn--primary"
        >
          {loading ? '🔄 Generating...' : '🔄 Refresh Insights'}
        </button>
      </div>

      {error && (
        <div className="card" style={{
          padding: '16px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '4px solid #ef4444',
          marginBottom: '24px'
        }}>
          <p style={{ margin: 0, color: '#ef4444', fontSize: '14px' }}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'pulse 2s ease-in-out infinite' }}>🤖</div>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', margin: 0 }}>Analyzing your spending patterns...</p>
        </div>
      )}

      {insights && !loading && (
        <>
          {/* Spending Summary KPIs */}
          <div className="grid grid-auto" style={{ marginBottom: '32px' }}>
            <div className="kpi kpi--success">
              <h3 className="cardTitle">💰 Current Month</h3>
              <div className="big">₹{insights.spending_data.current_month.balance.toFixed(2)}</div>
              <div className="muted" style={{ marginTop: '8px', fontSize: '13px' }}>
                <div>Income: ₹{insights.spending_data.current_month.income.toFixed(2)}</div>
                <div>Expenses: ₹{insights.spending_data.current_month.expenses.toFixed(2)}</div>
              </div>
            </div>

            <div className="kpi kpi--info">
              <h3 className="cardTitle">📊 Previous Month</h3>
              <div className="big">₹{insights.spending_data.previous_month.balance.toFixed(2)}</div>
              <div className="muted" style={{ marginTop: '8px', fontSize: '13px' }}>
                <div>Income: ₹{insights.spending_data.previous_month.income.toFixed(2)}</div>
                <div>Expenses: ₹{insights.spending_data.previous_month.expenses.toFixed(2)}</div>
              </div>
            </div>

            {insights.spending_data.top_categories.length > 0 && (
              <div className="kpi kpi--warning">
                <h3 className="cardTitle">🏷️ Top Categories</h3>
                <div style={{ marginTop: '12px' }}>
                  {insights.spending_data.top_categories.slice(0, 3).map((cat, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      <span style={{ fontSize: '13px' }}>{cat.category}</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>₹{cat.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="cardTitle" style={{ marginBottom: '16px', fontSize: '20px' }}>💡 Personalized Recommendations</h3>
            {insights.insights && insights.insights.length > 0 ? (
              <div className="grid grid-auto-md" style={{ gap: '16px' }}>
                {Array.isArray(insights.insights) ? (
                  insights.insights.map((insight, index) => (
                    <div key={index} className="card pad">
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}>
                        {insight.title}
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        color: 'var(--text-muted)', 
                        lineHeight: '1.6',
                        fontSize: '14px'
                      }}>
                        {insight.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="card pad">
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '14px' }}>
                      {typeof insights.insights === 'string' ? insights.insights : JSON.stringify(insights.insights, null, 2)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card pad" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">No insights available yet. Add more transactions to get personalized recommendations!</p>
              </div>
            )}
          </div>

          <p className="muted" style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px' }}>
            Last updated: {new Date(insights.generated_at).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
};

export default AIInsights;

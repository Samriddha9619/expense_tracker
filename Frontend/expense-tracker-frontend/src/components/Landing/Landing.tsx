import React from 'react';
import './landing.css';
import logo from '../../logo.svg';

interface LandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__brand">
          <img src={logo} className="landing__logo" alt="logo" />
          <span>Expense Tracker</span>
        </div>
        <div className="landing__actions">
          <button className="btn btn--ghost" onClick={onLoginClick}>Log in</button>
          <button className="btn btn--primary" onClick={onRegisterClick}>Get Started</button>
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-content">
          <h1>Master your money with clarity and confidence</h1>
          <p>Track spending, set goals, and get actionable insights to grow your savings—beautifully and effortlessly.</p>
          <div className="landing__cta">
            <button className="btn btn--primary" onClick={onRegisterClick}>Create free account</button>
            <button className="btn btn--ghost" onClick={onLoginClick}>I already have an account</button>
          </div>
          <div className="landing__trust">
            <span>Secure • Private • No spam</span>
          </div>
        </div>
        <div className="landing__hero-card">
          <div className="card"> 
            <div className="card__header">
              <h3>This month at a glance</h3>
              <span className="badge">Live demo</span>
            </div>
            <div className="card__body">
              <div className="stats">
                <div className="stat">
                  <span className="stat__label">Income</span>
                  <span className="stat__value stat__value--up">$5,120</span>
                </div>
                <div className="stat">
                  <span className="stat__label">Expenses</span>
                  <span className="stat__value stat__value--down">$3,740</span>
                </div>
                <div className="stat">
                  <span className="stat__label">Savings</span>
                  <span className="stat__value">$1,380</span>
                </div>
              </div>
              <div className="progress">
                <div className="progress__bar" style={{ width: '68%' }} />
              </div>
              <p className="muted">You're on track to save 23% more than last month. Keep it up!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__features">
        <div className="feature">
          <div className="feature__icon">💸</div>
          <h3>Smart expense tracking</h3>
          <p>Log transactions in seconds, categorize automatically, and see where your money goes.</p>
        </div>
        <div className="feature">
          <div className="feature__icon">📊</div>
          <h3>Beautiful dashboards</h3>
          <p>Clean charts and cards highlight trends, balances, and category breakdowns.</p>
        </div>
        <div className="feature">
          <div className="feature__icon">🤖</div>
          <h3>Smart Insights</h3>
          <p>Personalized, actionable tips to reduce spending and build your emergency fund faster.</p>
        </div>
        <div className="feature">
          <div className="feature__icon">🔒</div>
          <h3>Secure by default</h3>
          <p>Your data stays private. Encrypted connections and token-based authentication.</p>
        </div>
      </section>

      <footer className="landing__footer">
        <p>© {new Date().getFullYear()} Expense Tracker • Built with ❤️</p>
      </footer>
    </div>
  );
};

export default Landing;

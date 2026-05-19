// LandingPage.js - Premium, award-winning welcome page with interactive shopping bag and scroll animations
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  FiChevronRight, 
  FiArrowRight, 
  FiActivity, 
  FiBriefcase, 
  FiCpu, 
  FiTrendingUp, 
  FiPieChart, 
  FiZap, 
  FiGlobe, 
  FiUsers, 
  FiLock,
  FiShoppingBag,
  FiGithub,
  FiMail,
  FiStar,
  FiAward
} from 'react-icons/fi';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [currency, setCurrency] = useState('$');
  const [bagGlow, setBagGlow] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});

  // Exchange rates relative to USD
  const rates = {
    '$': 1.0,
    '₹': 83.0,
    '€': 0.92,
    '£': 0.79
  };

  const currencyNames = {
    '$': 'US Dollar (USD)',
    '₹': 'Indian Rupee (INR)',
    '€': 'Euro (EUR)',
    '£': 'British Pound (GBP)'
  };

  // Base USD values for items inside our interactive shopping chest
  const baseItems = [
    { name: 'Organic Groceries / Kirana Staples', usd: 15.0, icon: '🌾' },
    { name: 'Broadband / Prepaid Data Recharge', usd: 5.5, icon: '📱' },
    { name: 'Premium Coffee Beans / Home Brew', usd: 8.0, icon: '☕' },
    { name: 'Farming Seeds / Cooperative Fertilizer', usd: 20.0, icon: '🌱' }
  ];

  const handleCurrencyChange = (curr) => {
    setCurrency(curr);
    setBagGlow(true);
    setTimeout(() => setBagGlow(false), 800);
  };

  // Scroll visibility observer for premium on-scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'shopping-bag', 'creator', 'cta'];
      const updatedVisible = { ...visibleSections };
      
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const isVisible = rect.top <= window.innerHeight * 0.85;
          if (isVisible) {
            updatedVisible[id] = true;
          }
        }
      });
      
      setVisibleSections(updatedVisible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalUSD = baseItems.reduce((acc, item) => acc + item.usd, 0);

  return (
    <div className="landing-container">
      {/* Decorative ambient glowing gradient spheres */}
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>
      <div className="glow-sphere sphere-3"></div>

      {/* 1. Transparent Floating Navigation Bar */}
      <header className="landing-header">
        <div className="header-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">💼</span>
          <span className="logo-text">FinTracker</span>
        </div>
        <nav className="header-nav">
          <a href="#features">Features</a>
          <a href="#shopping-bag">Interactive Bag</a>
          <a href="#creator">Creator Details</a>
        </nav>
        <div className="header-actions">
          {isAuthenticated ? (
            <button className="btn-primary glow-button" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <FiChevronRight />
            </button>
          ) : (
            <>
              <button className="btn-secondary glass-btn" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn-primary glow-button" onClick={() => navigate('/register')}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* 2. Main Hero Section */}
      <section id="hero" className={`landing-hero ${visibleSections['hero'] ? 'fade-in-active' : ''}`}>
        <div className="hero-content">
          <div className="hero-badge animate-float">
            <FiZap className="icon-gold" /> Powered by Advanced Rule-Based AI
          </div>
          <h1>
            Supercharge Your Wealth with <br />
            <span className="text-gradient">Next-Gen AI Insights</span>
          </h1>
          <p className="hero-subtitle">
            A production-ready, globally inclusive financial command center designed to optimize spending, 
            automate budget boundaries, and provide highly concrete, actionable savings comparisons for both 
            metro professionals and local-rural communities.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary hero-main-btn" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}>
              Start Tracking Free <FiArrowRight />
            </button>
            <a href="#features" className="btn-secondary hero-sec-btn">
              Explore Core Capabilities
            </a>
          </div>
          <div className="hero-metrics">
            <div className="metric-item">
              <h3>20%</h3>
              <p>Average Annual Savings</p>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <h3>100%</h3>
              <p>Secure Offline Vault</p>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <h3>Dual</h3>
              <p>Urban & Rural Engines</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Showcase Section */}
      <section id="features" className={`landing-features ${visibleSections['features'] ? 'fade-in-active' : ''}`}>
        <div className="section-title">
          <span className="title-tag">CAPABILITIES</span>
          <h2>Designed for Every Level of Society</h2>
          <p>Whether you're managing executive subscriptions in Mumbai or bulk crops in village mandis, our platform scales to your life.</p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper purple-glow">
              <FiCpu className="card-icon" />
            </div>
            <h3>Branded AI Coaching</h3>
            <p>Automatically scans Netflix, Starbucks, Uber, and Swiggy charges to provide concrete price-shield advice, annual billing comparisons, and surge optimization.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper green-glow">
              <FiGlobe className="card-icon" />
            </div>
            <h3>Rural & Mandi Support</h3>
            <p>Empowers village communities with localized advice for Kirana shops, grain wholesale mandis, telecom prepaid recharge bundles, and agricultural input seeds.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper blue-glow">
              <FiTrendingUp className="card-icon" />
            </div>
            <h3>Budget Boundary Walls</h3>
            <p>Establish real-time boundary walls for food, transit, and shopping. Receive instant high-impact notification popups before overspending occurs.</p>
          </div>

          {/* Card 4 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper gold-glow">
              <FiPieChart className="card-icon" />
            </div>
            <h3>Symmetric Exports</h3>
            <p>Export your monthly summaries instantly into professional, double-columned Detailed Expense Summary PDFs and clean transactional Excel spreadsheets.</p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Shopping Bag Section */}
      <section id="shopping-bag" className={`landing-shopping ${visibleSections['shopping-bag'] ? 'fade-in-active' : ''}`}>
        <div className="shopping-layout">
          <div className="shopping-info">
            <span className="title-tag">INTERACTIVE EXPERIENCE</span>
            <h2>The FinTracker Shopping Bag</h2>
            <p>
              Witness real-time financial adaptability! Our smart shopping bag demonstrates how baseline items 
              convert and float dynamically across global currencies. 
            </p>
            <p className="text-muted mb-24">
              Select a currency pill below to trigger a rolling currency conversion animation inside the glowing shopping chest card!
            </p>
            
            <div className="currency-selector-pills">
              {Object.keys(rates).map(curr => (
                <button 
                  key={curr}
                  className={`currency-pill ${currency === curr ? 'active' : ''}`}
                  onClick={() => handleCurrencyChange(curr)}
                >
                  <span className="pill-symbol">{curr}</span> {currencyNames[curr].split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="conversion-rate-card glass-card">
              <FiActivity className="pulse-icon text-indigo" />
              <div>
                <strong>Active Rate Multiplier:</strong>
                <p className="text-muted">1.00 USD = {rates[currency].toFixed(2)} {currency}</p>
              </div>
            </div>
          </div>

          {/* Glowing Animated Shopping Chest */}
          <div className="shopping-visual">
            <div className={`shopping-chest-card glass-card ${bagGlow ? 'glow-active' : ''}`}>
              <div className="chest-header">
                <div className="chest-badge">
                  <FiShoppingBag /> CURRENT VAULT CONTENT
                </div>
                <div className="chest-currency-indicator animate-pulse">
                  {currency}
                </div>
              </div>

              <div className="bag-icon-wrapper animate-float">
                <FiShoppingBag className="bag-main-icon" />
                {bagGlow && (
                  <div className="floating-coins">
                    <span className="coin-emoji animate-coin-1">💰</span>
                    <span className="coin-emoji animate-coin-2">✨</span>
                    <span className="coin-emoji animate-coin-3">{currency}</span>
                  </div>
                )}
              </div>

              <div className="chest-items">
                {baseItems.map((item, idx) => (
                  <div key={idx} className="chest-item-row">
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      {currency}{(item.usd * rates[currency]).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="chest-total-divider"></div>

              <div className="chest-total-row">
                <span>GRAND TOTAL</span>
                <span className="total-amount text-indigo">
                  {currency}{(totalUSD * rates[currency]).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Creator Spotlight Section ("Creator Details") */}
      <section id="creator" className={`landing-creator ${visibleSections['creator'] ? 'fade-in-active' : ''}`}>
        <div className="creator-card glass-card">
          <div className="creator-badge">
            <FiAward /> PROJECT CREATOR & TECHNICAL ARCHITECT
          </div>
          <div className="creator-layout">
            <div className="creator-photo-wrapper animate-float">
              {/* Fallback initials with elegant radial gradient background */}
              <div className="creator-avatar">
                <span>S</span>
              </div>
            </div>
            <div className="creator-info">
              <h2>Shailesh</h2>
              <p className="creator-title">Senior Full-Stack Developer & Decision Architect</p>
              <div className="creator-stars">
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <span>Open Source Contributor</span>
              </div>
              <p className="creator-bio">
                Shailesh is a dedicated engineering leader specializing in building modern enterprise full-stack 
                applications. Driven by a passion for social impact, Shailesh designed and developed the 
                <strong> FinTracker AI Coaching Engine</strong> to bridge the gap between high-frequency urban consumption 
                and village/agricultural mandi economic realities. 
              </p>
              
              <div className="creator-skills">
                <span className="skill-tag">Java Spring Boot</span>
                <span className="skill-tag">React & Zustand</span>
                <span className="skill-tag">PostgreSQL & H2</span>
                <span className="skill-tag">Rule Engine AI</span>
                <span className="skill-tag">UI/UX Glassmorphism</span>
              </div>

              <div className="creator-contact-bar">
                <a href="https://github.com/username-shailesh" target="_blank" rel="noreferrer" className="contact-link">
                  <FiGithub /> github.com/username-shailesh
                </a>
                <span className="contact-divider">|</span>
                <a href="mailto:shailesh@example.com" className="contact-link">
                  <FiMail /> shailesh@example.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Section */}
      <section id="cta" className={`landing-cta ${visibleSections['cta'] ? 'fade-in-active' : ''}`}>
        <div className="cta-box glass-card text-center">
          <h2>Ready to Revolutionize Your Finances?</h2>
          <p>Join thousands of users optimizing their wealth daily with locally inclusive, automated, and secure AI coaching.</p>
          <button className="btn-primary glow-button btn-large mt-16" onClick={() => navigate('/register')}>
            Create Your Free Account Now <FiArrowRight />
          </button>
        </div>
      </section>

      {/* 7. Professional Footers (Corporate and Copyrights) */}
      <footer className="landing-footer">
        <div className="footer-columns">
          <div className="footer-col-brand">
            <div className="header-logo">
              <span className="logo-icon">💼</span>
              <span className="logo-text">FinTracker</span>
            </div>
            <p className="footer-desc mt-16">
              A premium, production-level, globally adaptable personal financial command dashboard. 
              Combining advanced Java server security with responsive React architectures.
            </p>
          </div>
          <div className="footer-col">
            <h4>Technology</h4>
            <a href="https://spring.io" target="_blank" rel="noreferrer">Spring Boot 3</a>
            <a href="https://react.dev" target="_blank" rel="noreferrer">React 18</a>
            <a href="https://www.postgresql.org" target="_blank" rel="noreferrer">PostgreSQL</a>
            <a href="https://zustand-demo.pmnd.rs" target="_blank" rel="noreferrer">Zustand Store</a>
          </div>
          <div className="footer-col">
            <h4>Empowerment</h4>
            <a href="#features">Urban Expense Coach</a>
            <a href="#features">Rural Mandi Support</a>
            <a href="#features">Mobile Prepaid Optimizer</a>
            <a href="#features">Traditional Micro-Savings</a>
          </div>
          <div className="footer-col">
            <h4>Legal & Safety</h4>
            <a href="#privacy">Privacy Safeguards</a>
            <a href="#terms">Terms of Service</a>
            <a href="#security">Local-Only Security</a>
            <a href="#post">Post Office Trust</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright-text">
            © 2026 FinTracker Inc. All Rights Reserved. Crafted with love by <strong className="creator-name">Shailesh</strong> for global and local financial prosperity.
          </p>
          <p className="disclaimer-text">
            Disclaimer: FinTracker is a secure, private transaction manager. All processed information is fully encrypted and stored inside your dedicated secure personal environment.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

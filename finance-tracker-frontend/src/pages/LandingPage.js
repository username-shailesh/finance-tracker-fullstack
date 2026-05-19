// LandingPage.js - Premium, welcome page with Light/Dark support, default Rupee currency, and Metro vs Rural AI Advisor
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useDarkMode from '../hooks/useDarkMode';
import { 
  FiChevronRight, 
  FiArrowRight, 
  FiActivity, 
  FiCpu, 
  FiTrendingUp, 
  FiPieChart, 
  FiZap, 
  FiGlobe, 
  FiShoppingBag, 
  FiGithub, 
  FiMail, 
  FiStar, 
  FiAward,
  FiSun,
  FiMoon,
  FiShield
} from 'react-icons/fi';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [currency, setCurrency] = useState('₹'); // By default currency is Indian Rupee (₹)
  const [bagGlow, setBagGlow] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [advisorScenario, setAdvisorScenario] = useState('rural'); // Metro vs Rural live advisor scenario

  // Exchange rates relative to USD (1 USD = ₹83.00)
  const rates = {
    '₹': 83.0,
    '$': 1.0,
    '€': 0.92,
    '£': 0.79
  };

  const currencyNames = {
    '₹': 'Indian Rupee (INR)',
    '$': 'US Dollar (USD)',
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

  // Metro vs Rural AI Advisory Shield live mock dataset
  const advisorData = {
    metro: {
      title: "🏢 Urban & Metro Savings Advisory Shield",
      emoji: "💳",
      desc: "Optimizes Swiggy subscriptions, app surge markups, and Uber cab pricing dynamically.",
      caseName: "App Overcharge & Surge Markups",
      audits: [
        { spend: "Netflix Premium Subscription", advice: "Switch to Netflix Annual Plan or shared profile billing to save ₹1,200 annually." },
        { spend: "Uber Cab Surge Pricing", advice: "Surge pricing active. Recommend taking local Metro Rail or delaying booking by 10 minutes to save 35% on markup." },
        { spend: "Swiggy Swiggy One Membership", advice: "Memberships paying off. Instamart surge detected; switch to neighborhood Kirana store direct delivery to save 18%." }
      ],
      totalSaved: "₹4,800 / year estimated savings"
    },
    rural: {
      title: "🌾 Local-Rural Mandi & Traditional Savings",
      emoji: "🚜",
      desc: "Optimizes bulk grain mandis, kirana markups, fuel journeys, and Post Office RDs.",
      caseName: "Agricultural inputs & traditional micro-savings",
      audits: [
        { spend: "Urea Farming Fertilizer", advice: "Bulk buying cooperative rates are 12% lower at Regional Mandi on Tuesdays. Save ₹800 per bag." },
        { spend: "Loose Staples & Wheat Seeds", advice: "Buy loose grain commodities at wholesale local mandi outlets instead of packaged brand retailers to save 18%." },
        { spend: "Informal Rural Lending Risks", advice: "High risk warning. Redirect savings to Secure Government Post Office Recurring Deposits (RD) for 6.7% safe compound interest." }
      ],
      totalSaved: "₹9,200 / year estimated savings"
    }
  };

  const handleCurrencyChange = (curr) => {
    setCurrency(curr);
    setBagGlow(true);
    setTimeout(() => setBagGlow(false), 800);
  };

  // Scroll visibility observer for premium on-scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'advisor', 'shopping-bag', 'creator', 'cta'];
      
      setVisibleSections(prevVisible => {
        const updatedVisible = { ...prevVisible };
        let changed = false;
        
        sections.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top <= window.innerHeight * 0.85;
            if (isVisible && !updatedVisible[id]) {
              updatedVisible[id] = true;
              changed = true;
            }
          }
        });
        
        return changed ? updatedVisible : prevVisible;
      });
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

      {/* 1. Transparent Floating Navigation Bar with Theme Toggle */}
      <header className="landing-header">
        <div className="header-logo" onClick={() => navigate('/')}>
          <div className="mini-overlapping-bags">
            <div className="mini-bag-orange"></div>
            <div className="mini-bag-yellow"></div>
          </div>
          <span className="logo-text">FinTracker</span>
        </div>
        <nav className="header-nav">
          <a href="#features">Features</a>
          <a href="#advisor">AI Advisor</a>
          <a href="#shopping-bag">Interactive Bag</a>
          <a href="#creator">Creator Details</a>
        </nav>
        <div className="header-actions">
          {/* Glowing Theme Toggle Switcher */}
          <button className="theme-toggle-btn glass-btn" onClick={toggleDarkMode} title="Switch Light/Dark Mode">
            {isDark ? <FiSun className="theme-icon sun-icon animate-spin-slow" /> : <FiMoon className="theme-icon moon-icon" />}
          </button>

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
            <h3>Branded AI Spending Audits</h3>
            <p>Automatically scans Swiggy, Netflix, Starbucks, Uber, and Swiggy charges to provide concrete price-shield advice, annual billing comparisons, and surge optimization.</p>
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

      {/* 4. [NEW FEATURE!] FinTracker AI Scenario Advisor Simulation */}
      <section id="advisor" className={`landing-advisor ${visibleSections['advisor'] ? 'fade-in-active' : ''}`}>
        <div className="section-title">
          <span className="title-tag">LIVE DEMONSTRATION</span>
          <h2>The FinTracker AI Advisory Shield</h2>
          <p>Toggle below to see how our custom rule-based engine audits real expenditures and shields your wallet from high markups!</p>
        </div>

        <div className="advisor-wrapper glass-card">
          <div className="scenario-pills">
            <button 
              className={`scenario-pill ${advisorScenario === 'rural' ? 'active active-green' : ''}`}
              onClick={() => setAdvisorScenario('rural')}
            >
              🌾 Agricultural & Village Scenario
            </button>
            <button 
              className={`scenario-pill ${advisorScenario === 'metro' ? 'active active-purple' : ''}`}
              onClick={() => setAdvisorScenario('metro')}
            >
              🏢 Urban & Metro Scenario
            </button>
          </div>

          <div className="advisor-content">
            <div className="advisor-meta-row">
              <span className="meta-icon">{advisorData[advisorScenario].emoji}</span>
              <div>
                <h3>{advisorData[advisorScenario].title}</h3>
                <p className="scenario-description">{advisorData[advisorScenario].desc}</p>
              </div>
            </div>

            <div className="advisor-audit-list">
              <h4 className="list-title">Live AI Spend Audit Log:</h4>
              {advisorData[advisorScenario].audits.map((audit, idx) => (
                <div key={idx} className="audit-card glass-card">
                  <div className="audit-header">
                    <span className="audit-item">Spent on: <strong>{audit.spend}</strong></span>
                    <span className="audit-status-badge"><FiShield /> Shield Audit Active</span>
                  </div>
                  <p className="audit-advice">💡 <strong>AI Recommendation:</strong> {audit.advice}</p>
                </div>
              ))}
            </div>

            <div className="advisor-footer-row">
              <div className="savings-badge">
                🎉 {advisorData[advisorScenario].totalSaved}
              </div>
              <p className="advisor-stamp">Automated audits complete via FinTracker Decision Engine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Shopping Bag Section */}
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
                <div className="branding-shopping-bag">
                  {/* Behind Orange Bag (Angled Left) */}
                  <div className="bag-orange">
                    <div className="handle-orange"></div>
                    <div className="body-orange">
                      <span className="bag-title-orange">FinTracker</span>
                      <span className="rupee-orange">₹</span>
                    </div>
                  </div>
                  {/* In Front Yellow Bag (Angled Right) */}
                  <div className="bag-yellow">
                    <div className="handle-yellow"></div>
                    <div className="body-yellow">
                      <span className="rupee-yellow">₹</span>
                      <span className="bag-title-yellow">FINANCE TRACKER</span>
                    </div>
                  </div>
                </div>
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

      {/* 6. Creator Spotlight Section ("Creator Details") */}
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

      {/* 7. Call To Action Section */}
      <section id="cta" className={`landing-cta ${visibleSections['cta'] ? 'fade-in-active' : ''}`}>
        <div className="cta-box glass-card text-center">
          <h2>Ready to Revolutionize Your Finances?</h2>
          <p>Join thousands of users optimizing their wealth daily with locally inclusive, automated, and secure AI coaching.</p>
          <button className="btn-primary glow-button btn-large mt-16" onClick={() => navigate('/register')}>
            Create Your Free Account Now <FiArrowRight />
          </button>
        </div>
      </section>

      {/* 8. Professional Footers (Corporate and Copyrights) */}
      <footer className="landing-footer">
        <div className="footer-columns">
          <div className="footer-col-brand">
            <div className="header-logo">
              <div className="mini-overlapping-bags">
                <div className="mini-bag-orange"></div>
                <div className="mini-bag-yellow"></div>
              </div>
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
            <a href="#features">Urban Spend Coach</a>
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

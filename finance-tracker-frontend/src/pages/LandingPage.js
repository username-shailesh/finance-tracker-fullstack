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
  FiGlobe, 
  FiShoppingBag, 
  FiSun,
  FiMoon,
  FiShield,
  FiBell,
  FiRepeat,
  FiFileText,
  FiLock,
  FiBarChart2,
  FiMenu,
  FiX
} from 'react-icons/fi';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [currency, setCurrency] = useState('₹'); // By default currency is Indian Rupee (₹)
  const [bagGlow, setBagGlow] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [advisorScenario, setAdvisorScenario] = useState('health'); // 'health' vs 'alerts'
  const [healthProfile, setHealthProfile] = useState('balanced'); // overspender, balanced, wealthBuilder
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Hamburger menu drawer state on mobile viewports
  const [isMobileHeader, setIsMobileHeader] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  ));
  const [visualizerTab, setVisualizerTab] = useState('category'); // Interactive Expense Visualizer tab state

  const getSmallSymbolStyle = (sym, isBack = false) => {
    if (sym.length > 2) return { fontSize: isBack ? '6px' : '8px' };
    if (sym.length > 1) return { fontSize: isBack ? '8px' : '10px' };
    return {};
  };

  // Base INR values for items inside our interactive shopping bag (made in India!)
  const baseItems = [
    { name: 'Organic Groceries / Kirana Staples', inr: 1250, icon: '🌾' },
    { name: 'Broadband / Prepaid Data Recharge', inr: 450, icon: '📱' },
    { name: 'Premium Coffee Beans / Home Brew', inr: 650, icon: '☕' },
    { name: 'Farming Seeds / Cooperative Fertilizer', inr: 1650, icon: '🌱' }
  ];

  // Dynamic currency conversion rates (Base: INR 1.0)
  const rates = {
    '₹': 1.0,
    '$': 0.012,
    '€': 0.011,
    '¥': 1.85,
    'AED': 0.044,
    'CAD': 0.016,
    'AUD': 0.018,
    '₿': 0.00000019,
    'SGD': 0.016
  };

  // Live simulation data representing the real project features
  const healthProfiles = {
    overspender: {
      name: "💸 Heavy Spender",
      savingsRatio: 5,
      budgetAdherence: 48,
      overspendingFrequency: "3 months in a row",
      score: 32,
      rating: "Poor",
      emoji: "🚨",
      recommendation: "High risk profile. Your budget adherence is under 50% and your savings ratio is too low. We recommend setting a strict utility/food limit and disabling non-essential recurring subscriptions immediately.",
      savingsMsg: "₹800 / month saved potential"
    },
    balanced: {
      name: "⚖️ Balanced Saver",
      savingsRatio: 22,
      budgetAdherence: 82,
      overspendingFrequency: "1 month out of 6",
      score: 68,
      rating: "Good",
      emoji: "📈",
      recommendation: "Solid progress. Your savings ratio is healthy. To cross into the Excellent range, automate your monthly savings directly after payday and audit high-surge app transactions.",
      savingsMsg: "₹4,800 / month saved potential"
    },
    wealthBuilder: {
      name: "🏆 Wealth Builder",
      savingsRatio: 48,
      budgetAdherence: 96,
      overspendingFrequency: "Never",
      score: 94,
      rating: "Excellent",
      emoji: "💎",
      recommendation: "Outstanding financial discipline! With a 48% savings ratio and near-perfect budget adherence, your capital is highly optimized. Consider automating investments for compound growth.",
      savingsMsg: "₹18,500 / month saved potential"
    }
  };

  const simulatedInsights = [
    {
      type: "WARNING",
      category: "Food & Dining",
      insight: "Late-night Swiggy Surge Detected",
      recommendation: "Your food delivery charges surged by 18% last weekend due to peak delivery fees. Swapping just 2 weekend orders for local dining will save ₹2,100 this month.",
      impact: -18
    },
    {
      type: "OPPORTUNITY",
      category: "Subscriptions",
      insight: "Unused Premium Streaming Service",
      recommendation: "You have 3 active video streaming platforms. Switching your Netflix premium subscription to an annual plan or shared billing saves ₹1,200 annually.",
      impact: 12
    },
    {
      type: "SUCCESS",
      category: "Savings",
      insight: "Strong Budget Adherence Path",
      recommendation: "Outstanding work! Keeping your apparel spending within the ₹3,000 category limit helped keep total April expenses exceptionally low.",
      impact: 34
    }
  ];

  const handleCurrencyChange = (curr) => {
    setCurrency(curr);
    setBagGlow(true);
    setTimeout(() => setBagGlow(false), 800);
  };

  // Scroll visibility observer for premium on-scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'product', 'advisor', 'analytics', 'shopping-bag', 'trust', 'cta'];
      
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const syncHeaderMode = () => {
      const isMobile = mediaQuery.matches;
      setIsMobileHeader(isMobile);
      if (!isMobile) setIsMenuOpen(false);
    };

    syncHeaderMode();
    mediaQuery.addEventListener('change', syncHeaderMode);
    return () => mediaQuery.removeEventListener('change', syncHeaderMode);
  }, []);

  return (
    <div className="landing-container">
      {/* Decorative ambient glowing gradient spheres */}
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>
      <div className="glow-sphere sphere-3"></div>

      {/* 1. Transparent Floating Navigation Bar with Theme Toggle */}
      <header className="landing-header">
        <div className="header-logo" onClick={() => { setIsMenuOpen(false); navigate('/'); }}>
          <div className="mini-overlapping-bags">
            {/* Behind Orange Bag (Angled Left) */}
            <div className="mini-bag-orange">
              <span className="bag-brand-text-small-back-top">FinTracker</span>
              <span className="mini-rupee-orange" style={getSmallSymbolStyle(currency, true)}>{currency}</span>
            </div>
            {/* In Front Yellow Bag (Angled Right) */}
            <div className="mini-bag-yellow">
              <span className="mini-rupee-yellow" style={getSmallSymbolStyle(currency, false)}>{currency}</span>
              <span className="bag-brand-text-small-row1">Finance</span>
              <span className="bag-brand-text-small-row2">Tracker</span>
            </div>
          </div>
          <span className="logo-text">FinTracker</span>
        </div>
        <nav className="header-nav">
          <a href="#features">Features</a>
          <a href="#product">Product Tour</a>
          <a href="#advisor">AI Advisor</a>
          <a href="#analytics">Reports & Charts</a>
          <a href="#shopping-bag">Currency Demo</a>
        </nav>
        <div className="header-actions">
          {/* Glowing Theme Toggle Switcher */}
          <button className="theme-toggle-btn glass-btn" onClick={toggleDarkMode} title="Switch Light/Dark Mode">
            {isDark ? <FiSun className="theme-icon sun animate-spin-slow" /> : <FiMoon className="theme-icon moon" />}
          </button>

          {!isMobileHeader && (
            isAuthenticated ? (
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
            )
          )}

          {/* Hamburger Mobile Menu Toggle Button */}
          {isMobileHeader && (
            <button 
              className="mobile-menu-toggle-btn glass-btn" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Toggle Menu"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Slide-Down Drawer Menu */}
      <div className={`mobile-menu-drawer glass-card ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-drawer-nav">
          <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#product" onClick={() => setIsMenuOpen(false)}>Product Tour</a>
          <a href="#advisor" onClick={() => setIsMenuOpen(false)}>AI Advisor</a>
          <a href="#analytics" onClick={() => setIsMenuOpen(false)}>Reports & Charts</a>
          <a href="#shopping-bag" onClick={() => setIsMenuOpen(false)}>Currency Demo</a>
        </nav>
        <div className="mobile-drawer-actions">
          {isAuthenticated ? (
            <button className="btn-primary glow-button w-full" onClick={() => { setIsMenuOpen(false); navigate('/dashboard'); }}>
              Go to Dashboard <FiChevronRight />
            </button>
          ) : (
            <>
              <button className="btn-secondary glass-btn w-full mb-12" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                Sign In
              </button>
              <button className="btn-primary glow-button w-full" onClick={() => { setIsMenuOpen(false); navigate('/register'); }}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Main Hero Section */}
      <section id="hero" className={`landing-hero ${visibleSections['hero'] ? 'fade-in-active' : ''}`}>
        <div className="hero-content">
          {/* Motivating Start Quote */}
          <div className="quote-container top-quote">
            <p className="quote-text">
              “Do not save what is left after spending, but spend what is left after saving.”
            </p>
            <span className="quote-author">— Warren Buffett</span>
          </div>

          <h1>
            Track Budget and Understand <br />
            <span className="text-gradient">Your Money in One Place</span>
          </h1>
          <p className="hero-subtitle">
            FinTracker is a secure, premium personal finance platform that helps you record expenses, organize categories,
            set monthly budgets, automate recurring bills, view intelligent AI insights, and export detailed reports in seconds.
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
              <h3>Secure Tracking</h3>
              <p>Expenses & Categories</p>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <h3>JWT + OTP</h3>
              <p>Identity Protection</p>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <h3>PDF & Excel</h3>
              <p>Instant Export Options</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Workspace Preview */}
      <section id="product" className={`landing-product ${visibleSections['product'] ? 'fade-in-active' : ''}`}>
        <div className="section-title">
          <span className="title-tag">PRODUCT TOUR</span>
          <h2>Experience a Smarter Way to Save</h2>
          <p>Explore an elegant, all-in-one ecosystem for expense auditing, monthly budgets, automated recurring bill scheduling, and comprehensive financial reports.</p>
        </div>

        <div className="product-layout">
          <div className="dashboard-preview glass-card">
            <div className="preview-topbar">
              <span className="preview-dot"></span>
              <span className="preview-dot"></span>
              <span className="preview-dot"></span>
              <strong>Dashboard Overview</strong>
            </div>
            <div className="preview-stat-grid">
              <div className="preview-stat">
                <span>Total Spent</span>
                <strong>{currency}42,500</strong>
              </div>
              <div className="preview-stat">
                <span>Budget Used</span>
                <strong>68%</strong>
              </div>
              <div className="preview-stat">
                <span>Unread Alerts</span>
                <strong>3</strong>
              </div>
            </div>
            <div className="preview-chart">
              <span style={{ height: '36%' }}></span>
              <span style={{ height: '58%' }}></span>
              <span style={{ height: '46%' }}></span>
              <span style={{ height: '78%' }}></span>
              <span style={{ height: '64%' }}></span>
              <span style={{ height: '88%' }}></span>
            </div>
            <div className="preview-row-list">
              <div><span>Groceries</span><strong>{currency}10,625</strong></div>
              <div><span>Transport</span><strong>{currency}8,500</strong></div>
              <div><span>Subscriptions</span><strong>{currency}2,400</strong></div>
            </div>
          </div>

          <div className="product-module-list">
            <div className="module-item glass-card">
              <FiBarChart2 />
              <div>
                <h3>Dashboard & Analytics</h3>
                <p>Review monthly totals, category breakdowns, recent activity, and financial health signals in one workspace.</p>
              </div>
            </div>
            <div className="module-item glass-card">
              <FiRepeat />
              <div>
                <h3>Recurring Expense Automation</h3>
                <p>Create rent, subscription, EMI, and utility schedules, then process them into confirmed expense records.</p>
              </div>
            </div>
            <div className="module-item glass-card">
              <FiBell />
              <div>
                <h3>Notifications & Budget Alerts</h3>
                <p>Receive alert records when budgets cross thresholds, recurring bills run, or high-impact insights are created.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Showcase Section */}
      <section id="features" className={`landing-features ${visibleSections['features'] ? 'fade-in-active' : ''}`}>
        <div className="section-title">
          <span className="title-tag">CAPABILITIES</span>
          <h2>What the App Will Offer</h2>
          <p>A practical personal-finance workspace covering daily tracking, budgets, automation, insights, reports, and account controls.</p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper purple-glow">
              <FiShoppingBag className="card-icon" />
            </div>
            <h3>Expense Tracking</h3>
            <p>Add, edit, delete, and review expenses with dates, payment methods, descriptions, receipt references, and category links.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper green-glow">
              <FiGlobe className="card-icon" />
            </div>
            <h3>Categories & Currency</h3>
            <p>Use default or custom categories, choose a preferred currency, and keep the interface useful across different spending habits.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper blue-glow">
              <FiTrendingUp className="card-icon" />
            </div>
            <h3>Budgets & Notifications</h3>
            <p>Create category budgets, track progress month by month, and receive alerts when spending crosses configured thresholds.</p>
          </div>

          {/* Card 4 */}
          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper gold-glow">
              <FiRepeat className="card-icon" />
            </div>
            <h3>Recurring Expenses</h3>
            <p>Schedule daily, weekly, monthly, quarterly, or yearly expenses and process recurring entries without retyping bills.</p>
          </div>

          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper purple-glow">
              <FiCpu className="card-icon" />
            </div>
            <h3>Rule-Based Insights</h3>
            <p>Detect spending changes, unusual expenses, category patterns, prediction signals, and financial health score feedback.</p>
          </div>

          <div className="feature-card glass-card hover-lift">
            <div className="card-icon-wrapper blue-glow">
              <FiFileText className="card-icon" />
            </div>
            <h3>Reports & Account Tools</h3>
            <p>Download PDF, AI-assisted PDF, and Excel reports, manage profile details, update profile picture, and handle password recovery with OTP.</p>
          </div>
        </div>
      </section>

      {/* 4. [NEW FEATURE!] FinTracker AI Health & Insights Engine Simulator */}
      <section id="advisor" className={`landing-advisor ${visibleSections['advisor'] ? 'fade-in-active' : ''}`}>
        <div className="section-title">
          <span className="title-tag">LIVE DEMONSTRATION</span>
          <h2>The FinTracker AI Health & Insights Engine</h2>
          <p>Interact with our custom AI models. See how your saving patterns, budget adherence, and historic transactions dynamically calculate your financial score and generate real-time savings audits.</p>
        </div>

        <div className="advisor-wrapper glass-card">
          <div className="scenario-pills">
            <button 
              className={`scenario-pill ${advisorScenario === 'health' ? 'active active-purple' : ''}`}
              onClick={() => setAdvisorScenario('health')}
            >
              📊 Financial Health Simulator
            </button>
            <button 
              className={`scenario-pill ${advisorScenario === 'alerts' ? 'active active-green' : ''}`}
              onClick={() => setAdvisorScenario('alerts')}
            >
              🤖 AI Spend Audits & Predictions
            </button>
          </div>

          <div className="advisor-content">
            {advisorScenario === 'health' ? (
              <div className="health-simulator-panel">
                <div className="advisor-meta-row">
                  <span className="meta-icon">📊</span>
                  <div>
                    <h3>Financial Health Score Simulator</h3>
                    <p className="scenario-description">
                      Simulate different savings profiles to preview the overall scoring rating system calculated by our Spring Boot backend.
                    </p>
                  </div>
                </div>

                <div className="scenario-pills" style={{ marginBottom: '24px', justifyContent: 'flex-start', gap: '8px' }}>
                  {Object.keys(healthProfiles).map((prof) => (
                    <button
                      key={prof}
                      className={`scenario-pill ${healthProfile === prof ? 'active active-purple' : ''}`}
                      onClick={() => setHealthProfile(prof)}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      {healthProfiles[prof].name}
                    </button>
                  ))}
                </div>

                <div className="health-score-flex-view" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '30px', alignItems: 'center' }}>
                  <div className="score-circle-mockup" style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    border: '8px solid rgba(108, 99, 255, 0.15)',
                    borderTopColor: healthProfile === 'overspender' ? '#ff5f57' : healthProfile === 'balanced' ? '#f39c12' : '#2ecc71',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                  }}>
                    <strong style={{ fontSize: '32px', color: '#fff', fontWeight: '800' }}>{healthProfiles[healthProfile].score}</strong>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {healthProfiles[healthProfile].rating}
                    </span>
                  </div>

                  <div className="profile-details-mockup" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Savings Ratio:</span>
                      <strong style={{ color: '#fff' }}>{healthProfiles[healthProfile].savingsRatio}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Budget Adherence:</span>
                      <strong style={{ color: '#fff' }}>{healthProfiles[healthProfile].budgetAdherence}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Overspending Frequency:</span>
                      <strong style={{ color: '#fff' }}>{healthProfiles[healthProfile].overspendingFrequency}</strong>
                    </div>
                  </div>
                </div>

                <div className="audit-card glass-card" style={{ marginTop: '24px' }}>
                  <p className="audit-advice">
                    💡 <strong>AI Recommendation:</strong> {healthProfiles[healthProfile].recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="insights-panel">
                <div className="advisor-meta-row">
                  <span className="meta-icon">🤖</span>
                  <div>
                    <h3>AI Spend Audit Log & Predictions</h3>
                    <p className="scenario-description">
                      Real-time anomaly alerts and monthly spending predictions computed from actual category limits.
                    </p>
                  </div>
                </div>

                <div className="advisor-audit-list">
                  {simulatedInsights.map((insight, idx) => (
                    <div key={idx} className="audit-card glass-card">
                      <div className="audit-header">
                        <span className="audit-item">
                          Category: <strong>{insight.category}</strong> — <strong>{insight.insight}</strong>
                        </span>
                        <span className="audit-status-badge" style={{
                          background: insight.type === 'WARNING' ? 'rgba(231, 76, 60, 0.15)' : insight.type === 'OPPORTUNITY' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                          color: insight.type === 'WARNING' ? '#e74c3c' : insight.type === 'OPPORTUNITY' ? '#3498db' : '#2ecc71',
                          borderColor: insight.type === 'WARNING' ? 'rgba(231, 76, 60, 0.3)' : insight.type === 'OPPORTUNITY' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(46, 204, 113, 0.3)',
                        }}>
                          <FiShield /> {insight.type} Alert
                        </span>
                      </div>
                      <p className="audit-advice">💡 {insight.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="advisor-footer-row">
              <div className="savings-badge">
                🎉 {advisorScenario === 'health' ? healthProfiles[healthProfile].savingsMsg : "₹23,400 / year total estimated savings"}
              </div>
              <p className="advisor-stamp">Automated audits completed by the FinTracker Decision Engine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. [NEW FEATURE!] FinTracker Interactive AI Expense Visualizer / Dashboard Preview */}
      <section id="analytics" className={`landing-analytics ${visibleSections['analytics'] ? 'fade-in-active' : ''}`}>
        <div className="section-title text-center">
          <span className="title-tag">REPORTS & CHARTS</span>
          <h2>Graphical Spending Breakdowns</h2>
          <p>Preview how tracked expenses become category charts, monthly comparisons, and focused recommendation cards.</p>
        </div>

        <div className="analytics-visualizer-container glass-card">
          <div className="visualizer-header">
            <div className="visualizer-tabs">
              <button 
                className={`tab-btn ${visualizerTab === 'category' ? 'active' : ''}`}
                onClick={() => setVisualizerTab('category')}
              >
                Category Share (Donut)
              </button>
              <button 
                className={`tab-btn ${visualizerTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setVisualizerTab('monthly')}
              >
                Monthly Savings Curve
              </button>
              <button 
                className={`tab-btn ${visualizerTab === 'predictions' ? 'active' : ''}`}
                onClick={() => setVisualizerTab('predictions')}
              >
                🔮 Expense Predictions
              </button>
            </div>
            <div className="visualizer-badge">
              <FiActivity className="icon-pulse" /> Product Preview Mock
            </div>
          </div>

          <div className="visualizer-body">
            {visualizerTab === 'category' && (
              <div className="tab-content category-content animate-fade-in">
                <div className="donut-chart-mockup">
                  <div className="donut-circle">
                    <div className="donut-center">
                      <span className="donut-total">₹42,500</span>
                      <span className="donut-label">Total Spent</span>
                    </div>
                  </div>
                  <div className="donut-legend">
                    <div className="legend-item">
                      <span className="legend-dot color-purple"></span>
                      <span className="legend-name">Rent & Utilities (40%)</span>
                      <span className="legend-value">₹17,000</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot color-green"></span>
                      <span className="legend-name">Groceries & Mandis (25%)</span>
                      <span className="legend-value">₹10,625</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot color-blue"></span>
                      <span className="legend-name">Transit & Petrol (20%)</span>
                      <span className="legend-value">₹8,500</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot color-gold"></span>
                      <span className="legend-name">Food & Swiggy (15%)</span>
                      <span className="legend-value">₹6,375</span>
                    </div>
                  </div>
                </div>
                <div className="visualizer-ai-insight glass-card">
                  <h4>💡 Spend-Shield AI Coach Advisory:</h4>
                  <p>"Your food & restaurant charges surged by <strong>18%</strong> on Swiggy last weekend due to late night deliveries. Swapping 2 orders for local dining will save you ₹2,100 this month."</p>
                </div>
              </div>
            )}

            {visualizerTab === 'monthly' && (
              <div className="tab-content monthly-content animate-fade-in">
                <div className="monthly-chart-mockup">
                  <div className="chart-bars">
                    <div className="chart-bar-col">
                      <div className="bar-val" style={{ height: '55%' }}>
                        <span className="bar-tooltip">₹12,400</span>
                      </div>
                      <span className="bar-label">Jan</span>
                    </div>
                    <div className="chart-bar-col">
                      <div className="bar-val" style={{ height: '70%' }}>
                        <span className="bar-tooltip">₹15,200</span>
                      </div>
                      <span className="bar-label">Feb</span>
                    </div>
                    <div className="chart-bar-col">
                      <div className="bar-val" style={{ height: '88%' }}>
                        <span className="bar-tooltip">₹21,800</span>
                      </div>
                      <span className="bar-label">Mar</span>
                    </div>
                    <div className="chart-bar-col highlight">
                      <div className="bar-val" style={{ height: '95%' }}>
                        <span className="bar-tooltip">₹26,500</span>
                      </div>
                      <span className="bar-label">Apr (Current)</span>
                    </div>
                  </div>
                </div>
                <div className="visualizer-ai-insight glass-card">
                  <h4>📈 Savings Velocity Review:</h4>
                  <p>"Outstanding work! Your savings curve is up by <strong>34%</strong> quarter-over-quarter. Budget alerts kept shopping spend exceptionally low in April."</p>
                </div>
              </div>
            )}

            {visualizerTab === 'predictions' && (
              <div className="tab-content mandis-content animate-fade-in">
                <div className="mandis-split-view">
                  <div className="split-panel panel-urban glass-card">
                    <h5>📊 Historic Monthly Expenses (April)</h5>
                    <div className="progress-item">
                      <span className="progress-name">Food & Dining</span>
                      <div className="progress-bar-container"><div className="progress-bar color-purple" style={{ width: '70%' }}></div></div>
                      <span className="progress-val">₹12,650</span>
                    </div>
                    <div className="progress-item">
                      <span className="progress-name">Utilities & Fuel</span>
                      <div className="progress-bar-container"><div className="progress-bar color-blue" style={{ width: '45%' }}></div></div>
                      <span className="progress-val">₹8,500</span>
                    </div>
                  </div>
                  <div className="split-panel panel-rural glass-card">
                    <h5>🔮 AI Predicted Expenses (May)</h5>
                    <div className="progress-item">
                      <span className="progress-name">Food & Dining (AI Target)</span>
                      <div className="progress-bar-container"><div className="progress-bar color-green" style={{ width: '55%' }}></div></div>
                      <span className="progress-val">₹10,500</span>
                    </div>
                    <div className="progress-item">
                      <span className="progress-name">Utilities & Fuel (Predicted)</span>
                      <div className="progress-bar-container"><div className="progress-bar color-gold" style={{ width: '48%' }}></div></div>
                      <span className="progress-val">₹9,220</span>
                    </div>
                  </div>
                </div>
                <div className="visualizer-ai-insight glass-card">
                  <h4>🔮 AI Prediction Insight:</h4>
                  <p>"Historic analysis predicts a seasonal <strong>8.5%</strong> rise in utilities next month. The AI has set a target of <strong>₹10,500</strong> for Food & Dining to keep your savings ratio at 22%."</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Interactive Shopping Bag Section */}
      <section id="shopping-bag" className={`landing-shopping ${visibleSections['shopping-bag'] ? 'fade-in-active' : ''}`}>
        <div className="shopping-layout">
          <div className="shopping-info">
            <span className="title-tag">INTERACTIVE EXPERIENCE</span>
            <h2>The FinTracker Shopping Bag</h2>
            <p>
              Witness real-time financial adaptability! Our smart shopping bag demonstrates how baseline items convert and float dynamically across global currencies.
            </p>
            <p className="text-muted mb-24">
              Select a currency pill below to trigger a rolling currency conversion animation inside the interactive shopping bag!
            </p>
            
            <div className="currency-selector-pills">
              <button 
                className={`currency-pill ${currency === '₹' ? 'active' : ''}`}
                onClick={() => handleCurrencyChange('₹')}
              >
                <span className="pill-symbol">₹</span> Indian
              </button>
              <button 
                className={`currency-pill ${currency === '$' ? 'active' : ''}`}
                onClick={() => handleCurrencyChange('$')}
              >
                <span className="pill-symbol">$</span> US
              </button>
              <button 
                className={`currency-pill ${currency === '€' ? 'active' : ''}`}
                onClick={() => handleCurrencyChange('€')}
              >
                <span className="pill-symbol">€</span> Euro
              </button>

              {/* Custom currency drop-down menu */}
              <div className="custom-currency-dropdown-wrapper">
                <select 
                  className={`currency-dropdown-select ${['₹', '$', '€'].includes(currency) ? '' : 'active'}`}
                  value={['₹', '$', '€'].includes(currency) ? 'more' : currency}
                  onChange={(e) => {
                    if (e.target.value !== 'more') {
                      handleCurrencyChange(e.target.value);
                    }
                  }}
                >
                  <option value="more" disabled>Select More...</option>
                  <option value="¥">¥ Japanese Yen (JPY)</option>
                  <option value="AED">AED UAE Dirham (AED)</option>
                  <option value="CAD">CAD Canadian Dollar (CAD)</option>
                  <option value="AUD">AUD Australian Dollar (AUD)</option>
                  <option value="₿">₿ Bitcoin (BTC)</option>
                  <option value="SGD">SGD Singapore Dollar (SGD)</option>
                </select>
              </div>
            </div>

            <div className="conversion-rate-card glass-card">
              <FiActivity className="pulse-icon text-indigo" />
              <div>
                <strong>Active Rate Multiplier (Base: Made in India 🇮🇳):</strong>
                <p className="text-muted font-mono">
                  1.00 INR = {rates[currency].toFixed(currency === '₿' ? 8 : 3)} {currency}
                </p>
              </div>
            </div>
          </div>

          {/* Glowing Animated Shopping Bag */}
          <div className="shopping-visual">
            <div className={`shopping-bag-card glass-card ${bagGlow ? 'glow-active' : ''}`}>
              <div className="bag-header">
                <div className="bag-badge">
                  <FiShoppingBag /> CURRENT BAG CONTENT
                </div>
                <div className="bag-currency-indicator animate-pulse">
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
                      <span className="rupee-orange">{currency}</span>
                    </div>
                  </div>
                  {/* In Front Yellow Bag (Angled Right) */}
                  <div className="bag-yellow">
                    <div className="handle-yellow"></div>
                    <div className="body-yellow">
                      <span className="rupee-yellow">{currency}</span>
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

              <div className="bag-items">
                {baseItems.map((item, idx) => (
                  <div key={idx} className="bag-item-row">
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      {currency === '₿' ? '' : currency}{(item.inr * rates[currency]).toFixed(currency === '₿' ? 8 : 2)} {currency === '₿' ? '₿' : ''}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bag-total-divider"></div>

              <div className="bag-total-row">
                <span>GRAND TOTAL</span>
                <span className="total-amount text-indigo text-glow">
                  {currency === '₿' ? '' : currency}{(baseItems.reduce((acc, item) => acc + item.inr, 0) * rates[currency]).toFixed(currency === '₿' ? 8 : 2)} {currency === '₿' ? '₿' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspiring End Quote */}
      <div className="quote-container bottom-quote animate-float">
        <p className="quote-text">
          “Beware of little expenses; a small leak will sink a great ship.”
        </p>
        <span className="quote-author">— Benjamin Franklin</span>
      </div>

      {/* 7. Reports, Security, and Trust Section */}
      <section id="trust" className={`landing-trust ${visibleSections['trust'] ? 'fade-in-active' : ''}`}>
        <div className="section-title">
          <span className="title-tag">TRUST & OUTPUTS</span>
          <h2>Clear Records, Protected Access</h2>
          <p>FinTracker is designed to use authenticated API access, OTP-enabled account flows, and exportable records for practical finance management.</p>
        </div>
        <div className="trust-grid">
          <div className="trust-card glass-card">
            <FiLock />
            <h3>JWT Authentication</h3>
            <p>Protected routes use JWT tokens and backend authorization checks for user-specific finance data.</p>
          </div>
          <div className="trust-card glass-card">
            <FiBell />
            <h3>OTP & Alerts</h3>
            <p>Email verification, password reset codes, budget notifications, and recurring bill alerts support safer account workflows.</p>
          </div>
          <div className="trust-card glass-card">
            <FiFileText />
            <h3>PDF, AI-assisted PDF, Excel</h3>
            <p>Users can export monthly reports for records, reviews, and planning outside the dashboard.</p>
          </div>
        </div>
      </section>

      {/* 8. Call To Action Section */}
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
                {/* Behind Orange Bag (Angled Left) */}
                <div className="mini-bag-orange">
                  <span className="bag-brand-text-small-back-top">FinTracker</span>
                  <span className="mini-rupee-orange" style={getSmallSymbolStyle(currency, true)}>{currency}</span>
                </div>
                {/* In Front Yellow Bag (Angled Right) */}
                <div className="mini-bag-yellow">
                  <span className="mini-rupee-yellow" style={getSmallSymbolStyle(currency, false)}>{currency}</span>
                  <span className="bag-brand-text-small-row1">Finance</span>
                  <span className="bag-brand-text-small-row2">Tracker</span>
                </div>
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
            <a href="#features">AI Spend Coach</a>
            <a href="#features">Budget Exceeded Alerts</a>
            <a href="#features">Recurring Bill Automation</a>
            <a href="#features">Financial Health Score</a>
          </div>
          <div className="footer-col">
            <h4>Legal & Safety</h4>
            <a href="#trust">Privacy Safeguards</a>
            <a href="#cta">Terms of Service</a>
            <a href="#trust">Local-Only Security</a>
            <a href="#advisor">Post Office Trust</a>
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

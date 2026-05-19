import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiMail, FiStar, FiAward, FiSun, FiMoon } from 'react-icons/fi';
import useDarkMode from '../hooks/useDarkMode';
import './CreatorPage.css';

/**
 * Standalone Creator Details Page
 * Displays Shailesh's Codec Technologies 8th-semester graduation internship details
 */
const CreatorPage = () => {
  const navigate = useNavigate();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  return (
    <div className="creator-page-container">
      {/* Background Ambient Spheres */}
      <div className="creator-sphere sphere-1"></div>
      <div className="creator-sphere sphere-2"></div>

      {/* Floating Header */}
      <header className="creator-header">
        <button className="back-btn" onClick={() => navigate('/')} title="Back to Home">
          <FiArrowLeft /> <span>Back to Home</span>
        </button>
        
        <button className="theme-toggle-btn" onClick={toggleDarkMode} title="Switch Light/Dark Mode">
          {isDark ? <FiSun className="theme-icon sun" /> : <FiMoon className="theme-icon moon" />}
        </button>
      </header>

      {/* Main Card */}
      <main className="creator-main">
        <div className="creator-card glass-card">
          <div className="creator-badge">
            <FiAward /> 8TH SEMESTER GRADUATION INTERNSHIP PROJECT
          </div>

          <div className="creator-layout">
            {/* Left Side: Avatar Container */}
            <div className="creator-photo-wrapper">
              <div className="creator-avatar">
                <img 
                  src="/creator.jpg" 
                  alt="Shailesh" 
                  className="creator-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="creator-fallback-text">S</span>
              </div>
            </div>

            {/* Right Side: Credentials & Bio */}
            <div className="creator-info">
              <h1>Shailesh</h1>
              <p className="creator-title">Full-Stack Software Engineer Intern</p>
              
              <div className="creator-stars">
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <FiStar className="icon-gold" />
                <span>Internship Project (8th Semester)</span>
              </div>

              <p className="creator-bio">
                This Personal Finance Tracker is an <strong>8th-Semester Graduation Capstone Project</strong> completed 
                during my internship under <strong>Codec Technologies</strong>. Engineered as a production-grade 
                enterprise dashboard, the system is designed to provide urban high-frequency spending audits alongside 
                flexible local-rural Kirana and Mandi agricultural crop calculations.
              </p>

              <div className="creator-details-table">
                <div className="detail-row">
                  <span className="detail-label">Internship Company:</span>
                  <span className="detail-value">Codec Technologies</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Project Scope:</span>
                  <span className="detail-value">Full-Stack AI Spending & Budget Ledger</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Graduation Semester:</span>
                  <span className="detail-value">8th Semester (Final Year)</span>
                </div>
              </div>

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
      </main>
    </div>
  );
};

export default CreatorPage;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerUser(name, email, password);
      login(data);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left: product panel — hidden on small screens */}
      <div className="register-branding">
        <div className="brand-mark">
          <span className="brand-glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3.5h9l5 5V19a1.5 1.5 0 01-1.5 1.5H8.5A1.5 1.5 0 017 19V16"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path
                d="M3.5 13.5c2 0 2-2 4-2s2 2 4 2 2-2 4-2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Docuchat
        </div>

        <div className="branding-copy">
          <p className="eyebrow">Read&nbsp;&middot;&nbsp;Ask&nbsp;&middot;&nbsp;Know</p>
          <h1>
            Start reading
            <br />
            smarter.
          </h1>
          <p>
            Create an account and drop in your first document. Docuchat
            reads it end to end and answers with the exact line it came
            from.
          </p>
        </div>

        {/* Signature element: document being read + highlighted, with a citation surfacing */}
        <div className="doc-scene" aria-hidden="true">
          <div className="doc-page">
            <div className="doc-page-head">
              <span className="doc-dot" />
              <span className="doc-dot" />
              <span className="doc-filename">q3_earnings_report.pdf</span>
            </div>
            <div className="doc-line" style={{ width: '90%' }} />
            <div className="doc-line" style={{ width: '70%' }} />
            <div className="doc-line doc-line--hl" style={{ width: '84%' }} />
            <div className="doc-line" style={{ width: '58%' }} />
            <div className="doc-line" style={{ width: '92%' }} />
            <div className="doc-line doc-line--hl" style={{ width: '66%' }} />
            <div className="doc-line" style={{ width: '80%' }} />
            <div className="doc-line" style={{ width: '48%' }} />
          </div>

          <div className="annotation-card">
            <span className="annotation-mark">Cited</span>
            <p>&ldquo;Revenue grew 18% year over year, driven by APAC.&rdquo;</p>
            <span className="annotation-source">q3_earnings_report.pdf &middot; p. 3</span>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="register-form-panel">
        <div className="register-card">
          <div className="register-card-header">
            <div className="brand-mark brand-mark--mobile">
              <span className="brand-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 3.5h9l5 5V19a1.5 1.5 0 01-1.5 1.5H8.5A1.5 1.5 0 017 19V16"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </span>
              Docuchat
            </div>
            <h2>Create your account</h2>
            <p className="subtitle">Free to start. No card required.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span className="field-label">Name</span>
              <div className="field-control">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4.5 20c1.4-3.8 4.4-5.5 7.5-5.5s6.1 1.7 7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <div className="field-control">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 6l8 6.5L20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <div className="field-control">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 10.5V7.5a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="ghost-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M6.5 6.6C4.3 8 2.7 10 2 12c1.6 4 5.6 7 10 7 1.7 0 3.3-.4 4.7-1.2M9.9 5.2A10.7 10.7 0 0112 5c4.4 0 8.4 3 10 7-.5 1.3-1.3 2.6-2.3 3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2 12c1.6-4 5.6-7 10-7s8.4 3 10 7c-1.6 4-5.6 7-10 7s-8.4-3-10-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error && (
              <div className="error-banner" role="alert">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="0.9" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="switch-line">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
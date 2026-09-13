import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/* ─── Google "G" SVG logo ──────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const LoginPage = () => {
  const { login, googleLogin, register, forgotPassword, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ─── form state ─────────────────────────────────────────────────────── */
  const [mode, setMode] = useState('login');          // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /* ─── Google OAuth State ─────────────────────────────────────────────── */
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [gEmail, setGEmail] = useState('');
  const [gName, setGName] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  /* Initialize Google Identity Services if client ID is configured */
  useEffect(() => {
    if (!googleClientId) return;

    const loadGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
      }
    };

    if (document.getElementById('gsi-script')) {
      loadGsi();
      return;
    }

    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = loadGsi;
    document.body.appendChild(script);
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    setGoogleSubmitting(true);
    const ok = await googleLogin({ credential: response.credential });
    setGoogleSubmitting(false);
    if (ok) navigate('/');
  };

  const handleGoogleBtnClick = () => {
    setError(null);
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback dev modal when Client ID is unconfigured or in offline development
      setShowGoogleModal(true);
    }
  };

  const submitGoogleDevLogin = async (e, customEmail, customName, avatarUrl) => {
    if (e) e.preventDefault();
    const finalEmail = customEmail || gEmail || 'analyst.google@socvigil.net';
    const finalName = customName || gName || 'Google Analyst';
    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalEmail)}`;
    const finalGoogleId = `google-sub-${Date.now()}`;

    setGoogleSubmitting(true);
    const ok = await googleLogin({
      email: finalEmail,
      name: finalName,
      picture: finalAvatar,
      google_id: finalGoogleId,
    });
    setGoogleSubmitting(false);
    if (ok) {
      setShowGoogleModal(false);
      navigate('/');
    }
  };

  /* ─── validation + submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setError(null);

    let hasError = false;
    if (!email) {
      setEmailError('Email address is required.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address (e.g., operator@socvigil.net).');
      hasError = true;
    }

    if (mode === 'forgot') {
      if (hasError) return;
      setSubmitting(true);
      const res = await forgotPassword(email);
      setSubmitting(false);
      if (res.success) {
        setSuccessMsg(res.message || 'If an account exists for this email, a reset link has been sent.');
      }
      return;
    }

    if (!password) {
      setPasswordError('Passphrase is required.');
      hasError = true;
    } else if (password.length < 4) {
      setPasswordError('Passphrase must be at least 4 characters.');
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    setSuccessMsg('');

    if (mode === 'login') {
      const ok = await login(email, password);
      setSubmitting(false);
      if (ok) navigate('/');
    } else if (mode === 'register') {
      const ok = await register(email, name || email.split('@')[0], password);
      setSubmitting(false);
      if (ok) {
        setSuccessMsg('Registration completed successfully. You can now sign in.');
        setMode('login');
        setPassword('');
      }
    }
  };

  const handleToggleMode = (newMode) => {
    setError(null);
    setSuccessMsg('');
    setEmailError('');
    setPasswordError('');
    setMode(newMode);
  };

  /* ─── render ─────────────────────────────────────────────────────────── */
  return (
    <div className="circuit-bg min-h-screen flex items-center justify-center p-4 font-sans antialiased relative">
      <main
        className="glass-card animate-fade-in w-full max-w-[390px] rounded-2xl px-8 py-9 flex flex-col"
        style={{ boxShadow: 'none' }}
      >
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-accent" style={{ fontSize: 22 }}>shield</span>
            <span className="font-sans text-[11px] font-bold text-accent tracking-widest uppercase">SOC VIGIL</span>
          </div>
          <h1 className="font-sans text-[22px] font-bold text-on-surface tracking-tight mt-2">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant mt-1 text-center">
            {mode === 'login' && 'Sign in to your security operations console'}
            {mode === 'register' && 'Register a new operator profile'}
            {mode === 'forgot' && 'Enter your email to receive a recovery passphrase link'}
          </p>
        </div>

        {/* ── ERROR / SUCCESS BANNERS ──────────────────────────────────── */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl border border-[#f85149]/25 bg-[#f85149]/08 text-[#f85149] font-mono text-[10px] flex items-start gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[13px] mt-[1px] shrink-0">error</span>
            <span className="break-words leading-relaxed">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 px-3 py-2.5 rounded-xl border border-accent/25 bg-accent/08 text-accent font-mono text-[10px] flex items-start gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[14px] shrink-0 mt-[1px]">check_circle</span>
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ── MAIN FORM ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Register-only: Full Name */}
          {mode === 'register' && (
            <div>
              <label
                htmlFor="register-name"
                className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
              >
                Full Name / Display Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-input"
                placeholder="Alex Hunter"
                autoComplete="name"
              />
            </div>
          )}

          {/* Email ──────────────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="auth-email"
              className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
              className={`login-input${emailError ? ' error' : ''}`}
              placeholder="operator@socvigil.net"
              autoComplete="email"
              required
            />
            {emailError && (
              <span className="text-[#f85149] font-mono text-[9px] mt-1 block leading-none">{emailError}</span>
            )}
          </div>

          {/* Password (with Show/Hide Toggle) ────────────────────────────── */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block font-sans text-[10px] font-semibold text-on-surface-variant tracking-wide"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                  className={`login-input pr-10${passwordError ? ' error' : ''}`}
                  placeholder="••••••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {passwordError && (
                <span className="text-[#f85149] font-mono text-[9px] mt-1 block leading-none">{passwordError}</span>
              )}
            </div>
          )}

          {/* Remember me + Forgot password row ─────────────────────────── */}
          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border border-border bg-background accent-accent cursor-pointer"
                />
                <span className="font-sans text-[11px] text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => handleToggleMode('forgot')}
                className="font-sans text-[11px] text-accent hover:underline transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Primary Submit Button ──────────────────────────────────────── */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-login mt-1"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                <span>Processing…</span>
              </>
            ) : (
              mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Account' : 'Send Recovery Link'
            )}
          </button>
        </form>

        {/* ── GOOGLE SIGN-IN SECTION (Login / Register modes) ─────────── */}
        {mode !== 'forgot' && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border"></div>
              <span className="font-sans text-[10px] text-on-surface-variant tracking-wider">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleBtnClick}
              disabled={googleSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border hover:border-accent/40 bg-surface hover:bg-[#161b22] text-on-surface font-sans text-[12px] font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {googleSubmitting ? (
                <span className="material-symbols-outlined text-[16px] animate-spin text-accent">sync</span>
              ) : (
                <GoogleIcon />
              )}
              <span>{googleSubmitting ? 'Authenticating…' : 'Sign in with Google'}</span>
            </button>
          </>
        )}

        {/* ── FOOTER SWITCHERS ─────────────────────────────────────────── */}
        <div className="mt-5 text-center font-sans text-[11px] text-on-surface-variant">
          {mode === 'login' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode('register')}
                className="text-accent font-semibold hover:underline cursor-pointer transition-colors"
              >
                Create Account
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className="text-accent font-semibold hover:underline cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remember your passphrase?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode('login')}
                className="text-accent font-semibold hover:underline cursor-pointer transition-colors"
              >
                Return to Sign In
              </button>
            </p>
          )}
        </div>
      </main>

      {/* ── GOOGLE OAUTH DEV SANDBOX MODAL ──────────────────────────────── */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 border border-border bg-[#0d1117]/95 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <GoogleIcon />
                <span className="font-sans text-[14px] font-bold text-on-surface">Google Accounts</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
              Select a Google Workspace identity to sign in to <strong className="text-accent">SOC Vigil</strong>:
            </p>

            {/* Quick Presets */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => submitGoogleDevLogin(null, 'alex.hunter@google.com', 'Alex Hunter', 'https://lh3.googleusercontent.com/a/ACg8ocI8z_default=s96-c')}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 bg-[#161b22] hover:bg-surface hover:border-accent/50 transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-mono text-[12px] text-accent font-bold">
                  AH
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[12px] font-semibold text-on-surface group-hover:text-accent transition-colors">Alex Hunter</span>
                  <span className="font-sans text-[10px] text-on-surface-variant">alex.hunter@google.com</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => submitGoogleDevLogin(null, 'sec.analyst@gmail.com', 'Sarah Cyber', 'https://lh3.googleusercontent.com/a/ACg8ocI9z_analyst=s96-c')}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 bg-[#161b22] hover:bg-surface hover:border-accent/50 transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#34A853]/20 border border-[#34A853]/40 flex items-center justify-center font-mono text-[12px] text-[#34A853] font-bold">
                  SC
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[12px] font-semibold text-on-surface group-hover:text-accent transition-colors">Sarah Cyber</span>
                  <span className="font-sans text-[10px] text-on-surface-variant">sec.analyst@gmail.com</span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-border/50"></div>
              <span className="font-sans text-[9px] text-on-surface-variant uppercase tracking-wider">or custom Google account</span>
              <div className="flex-1 h-px bg-border/50"></div>
            </div>

            {/* Custom Google account input form */}
            <form onSubmit={(e) => submitGoogleDevLogin(e)} className="flex flex-col gap-3">
              <div>
                <label className="block font-sans text-[10px] text-on-surface-variant mb-1 font-semibold">Google Account Email</label>
                <input
                  type="email"
                  value={gEmail}
                  onChange={(e) => setGEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="login-input"
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] text-on-surface-variant mb-1 font-semibold">Display Name (Optional)</label>
                <input
                  type="text"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  placeholder="Security Analyst"
                  className="login-input"
                />
              </div>

              <button
                type="submit"
                disabled={googleSubmitting}
                className="btn-login mt-1"
              >
                {googleSubmitting ? (
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                ) : (
                  'Continue with Google'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

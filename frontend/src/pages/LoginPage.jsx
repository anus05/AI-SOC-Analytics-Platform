import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/* ─── Google "G" SVG logo (no external dependency) ─────────────────────── */
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
  const { login, register, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ─── form state ─────────────────────────────────────────────────────── */
  const [mode, setMode] = useState('login');          // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // TODO: wire to extended session when backend supports it
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /* ─── validation + submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    let hasError = false;
    if (!email) {
      setEmailError('Operator ID is required.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format (e.g., operator@socvigil.net).');
      hasError = true;
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
      const ok = await login(
    name || email.split("@")[0],
    password
);
      setSubmitting(false);
      if (ok) navigate('/');
    } else {
      const ok = await register(email, name || email.split('@')[0], password);
      setSubmitting(false);
      if (ok) {
        setSuccessMsg('Registration completed. Please sign in.');
        setMode('login');
        setPassword('');
      }
    }
  };

  /* Password field inline-arrow submit */
  const handlePasswordArrow = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  const handleToggleMode = (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');
    setEmailError('');
    setPasswordError('');
    setMode(mode === 'login' ? 'register' : 'login');
  };

  /* ─── render ─────────────────────────────────────────────────────────── */
  return (
    /* Full-bleed circuit-board background ───────────────────────────────── */
    <div className="circuit-bg min-h-screen flex items-center justify-center p-4 font-sans antialiased">

      {/* Glassmorphism card ─────────────────────────────────────────────── */}
      <main
        className="glass-card animate-fade-in w-full max-w-[380px] rounded-2xl px-8 py-9 flex flex-col"
        style={{ boxShadow: 'none' }}
      >

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-accent" style={{ fontSize: 22 }}>shield</span>
            <span className="font-sans text-[11px] font-bold text-accent tracking-widest uppercase">SOC VIGIL</span>
          </div>
          <h1 className="font-sans text-[22px] font-bold text-on-surface tracking-tight mt-2">
            Welcome Back
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant mt-1">
            {mode === 'login' ? 'Sign in to your operator account' : 'Create a new operator account'}
          </p>
        </div>

        {/* ── GLOBAL ERROR / SUCCESS BANNERS ────────────────────────────── */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl border border-[#f85149]/25 bg-[#f85149]/08 text-[#f85149] font-mono text-[10px] flex items-start gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[13px] mt-[1px] shrink-0">error</span>
            <span className="break-words leading-relaxed">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 px-3 py-2 rounded-xl border border-accent/25 bg-accent/08 text-accent font-mono text-[10px] flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[13px] shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── FORM ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Register-only: Full Name */}
          {mode === 'register' && (
            <div>
              <label
                htmlFor="name"
                className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-input"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
          )}

          {/* Email ──────────────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="login-email"
              className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
              className={`login-input${emailError ? ' error' : ''}`}
              placeholder="operator@socvigil.net"
              autoComplete="email"
            />
            {emailError && (
              <span className="text-[#f85149] font-mono text-[9px] mt-1 block leading-none">{emailError}</span>
            )}
          </div>

          {/* Password (with inline arrow-submit button) ─────────────────── */}
          <div>
            <label
              htmlFor="login-password"
              className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                className={`login-input pr-11${passwordError ? ' error' : ''}`}
                placeholder="••••••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
              />
              {/* Inline arrow submit button */}
              <button
                type="button"
                onClick={handlePasswordArrow}
                disabled={submitting}
                aria-label="Submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                )}
              </button>
            </div>
            {passwordError && (
              <span className="text-[#f85149] font-mono text-[9px] mt-1 block leading-none">{passwordError}</span>
            )}
          </div>

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
                onClick={() => alert('Contact your security administrator at admin@socvigil.net to reset credentials.')}
                className="font-sans text-[11px] text-accent hover:text-on-surface transition-colors cursor-pointer"
              >
                Forgot Password
              </button>
            </div>
          )}

          {/* Primary submit button ──────────────────────────────────────── */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-login mt-1"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                <span>Verifying…</span>
              </>
            ) : (
              mode === 'login' ? 'Login' : 'Register Account'
            )}
          </button>
        </form>

        {/* ── OR DIVIDER ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border"></div>
          <span className="font-sans text-[10px] text-on-surface-variant tracking-wider">or</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* ── GOOGLE STUB BUTTON ────────────────────────────────────────── */}
        <div className="relative group">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-background/60 text-on-surface-variant font-sans text-[12px] font-semibold cursor-not-allowed opacity-60 select-none"
          >
            <GoogleIcon />
            <span>Login With Google</span>
          </button>
          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#161b22] border border-border font-mono text-[9px] text-on-surface-variant whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            OAuth — Coming soon
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <p className="mt-6 text-center font-sans text-[11px] text-on-surface-variant">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={handleToggleMode}
                className="text-accent font-semibold hover:underline cursor-pointer transition-colors"
              >
                Request Access
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={handleToggleMode}
                className="text-accent font-semibold hover:underline cursor-pointer transition-colors"
              >
                Return to Login
              </button>
            </>
          )}
        </p>
      </main>
    </div>
  );
};

export default LoginPage;

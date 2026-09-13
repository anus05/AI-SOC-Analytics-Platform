import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, error, setError } = useContext(AuthContext);

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationError('');
    setSuccessMsg('');

    if (!token.trim()) {
      setValidationError('Password reset token is missing.');
      return;
    }

    if (!newPassword) {
      setValidationError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 4) {
      setValidationError('Password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(token.trim(), newPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Password successfully reset!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    }
  };

  return (
    <div className="circuit-bg min-h-screen flex items-center justify-center p-4 font-sans antialiased relative">
      <main
        className="glass-card animate-fade-in w-full max-w-[400px] rounded-2xl px-8 py-9 flex flex-col"
        style={{ boxShadow: 'none' }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-accent" style={{ fontSize: 22 }}>lock_reset</span>
            <span className="font-sans text-[11px] font-bold text-accent tracking-widest uppercase">SOC VIGIL</span>
          </div>
          <h1 className="font-sans text-[22px] font-bold text-on-surface tracking-tight mt-2">
            Reset Password
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant mt-1 text-center">
            Enter your new passphrase to secure your operator account
          </p>
        </div>

        {/* Error / Success Alerts */}
        {(error || validationError) && (
          <div className="mb-4 px-3 py-2 rounded-xl border border-[#f85149]/25 bg-[#f85149]/08 text-[#f85149] font-mono text-[10px] flex items-start gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[13px] mt-[1px] shrink-0">error</span>
            <span className="break-words leading-relaxed">{validationError || error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 px-3 py-2.5 rounded-xl border border-accent/25 bg-accent/08 text-accent font-mono text-[11px] flex flex-col items-center text-center gap-1.5 animate-fade-in">
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Password Updated!</span>
            </div>
            <span className="text-[10px] text-on-surface-variant">Redirecting to login portal in 2 seconds...</span>
          </div>
        )}

        {/* Reset Form */}
        {!successMsg ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Token field (if not provided via URL) */}
            {!searchParams.get('token') && (
              <div>
                <label
                  htmlFor="reset-token"
                  className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
                >
                  Reset Token
                </label>
                <input
                  id="reset-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="login-input"
                  placeholder="Paste your 32-character reset token"
                  required
                />
              </div>
            )}

            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="login-input pr-10"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
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
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block font-sans text-[10px] font-semibold text-on-surface-variant mb-1.5 tracking-wide"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-input pr-10"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-login mt-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                  <span>Updating Password…</span>
                </>
              ) : (
                'Save New Password'
              )}
            </button>
          </form>
        ) : (
          <div className="mt-2">
            <Link
              to="/login"
              className="btn-login text-center block"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        <p className="mt-6 text-center font-sans text-[11px] text-on-surface-variant">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="text-accent font-semibold hover:underline cursor-pointer transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </main>
    </div>
  );
};

export default ResetPasswordPage;

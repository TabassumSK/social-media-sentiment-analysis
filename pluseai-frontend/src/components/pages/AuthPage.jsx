import React from 'react';

export default function AuthPage({
  authError, setAuthError,
  authSuccess, setAuthSuccess,
  authPage, setAuthPage,
  loginForm, setLoginForm,
  registerForm, setRegisterForm,
  forgotForm, setForgotForm,
  resetForm, setResetForm,
  login, register, forgotPassword, resetPassword
}) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {authError && <p className="auth-error">{authError}</p>}
        {authSuccess && <p className="auth-success">{authSuccess}</p>}

        {authPage === "login" && (
          <>
            <h3>Login</h3>
            <input className="form-input" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} onKeyDown={e => e.key === "Enter" && login()} />
            <input className="form-input" type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} onKeyDown={e => e.key === "Enter" && login()} />
            <button className="btn-primary" onClick={login}>Sign In</button>
            <p
              onClick={() => { setAuthPage("forgot"); setAuthError(""); setAuthSuccess(""); }}
              style={{ cursor: 'pointer', textAlign: 'center', color: 'var(--blue)', fontSize: '13px', marginTop: '4px' }}
            >
              Forgot Password?
            </p>
            <p onClick={() => { setAuthPage("register"); setAuthError(""); setAuthSuccess(""); }} style={{ cursor: 'pointer', textAlign: 'center' }}>Need an account? <span style={{ color: 'var(--blue)', fontWeight: '600', textDecoration: 'underline' }}>Register</span></p>
          </>
        )}

        {authPage === "register" && (
          <>
            <h3>Create Account</h3>
            <input className="form-input" placeholder="Username" value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />
            <input className="form-input" type="email" placeholder="Email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
            <input className="form-input" type="password" placeholder="Password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
            <input className="form-input" type="password" placeholder="Confirm Password" value={registerForm.confirm} onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })} />
            <button className="btn-primary" onClick={register}>Create Account</button>
            <p style={{ color: '#71717a', fontSize: '12px', textAlign: 'center' }}>📧 A welcome email will be sent to your inbox</p>
            <p onClick={() => { setAuthPage("login"); setAuthError(""); setAuthSuccess(""); }} style={{ cursor: 'pointer', textAlign: 'center' }}>Already have an account? <span style={{ color: 'var(--blue)', fontWeight: '600', textDecoration: 'underline' }}>Login</span></p>
          </>
        )}

        {authPage === "forgot" && (
          <>
            <h3>Forgot Password</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
              Enter the email address linked to your account. We'll send you a reset link.
            </p>
            <input
              className="form-input"
              type="email"
              placeholder="Your registered email *"
              value={forgotForm.email}
              onChange={e => setForgotForm({ email: e.target.value })}
              onKeyDown={e => e.key === "Enter" && forgotPassword()}
            />
            <button className="btn-primary" onClick={forgotPassword}>Send Reset Link</button>
            <p
              onClick={() => { setAuthPage("login"); setAuthError(""); setAuthSuccess(""); }}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              ← <span style={{ color: 'var(--blue)', fontWeight: '600', textDecoration: 'underline' }}>Back to Login</span>
            </p>
          </>
        )}

        {authPage === "reset" && (
          <>
            <h3>Reset Password</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
              Enter your new password below.
            </p>
            <input
              type="hidden"
              value={resetForm.token}
              onChange={e => setResetForm({ ...resetForm, token: e.target.value })}
            />
            <input
              className="form-input"
              type="password"
              placeholder="New Password *"
              value={resetForm.new_password}
              onChange={e => setResetForm({ ...resetForm, new_password: e.target.value })}
            />
            <input
              className="form-input"
              type="password"
              placeholder="Confirm New Password *"
              value={resetForm.confirm}
              onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })}
              onKeyDown={e => e.key === "Enter" && resetPassword()}
            />
            <button className="btn-primary" onClick={resetPassword}>Update Password</button>
            <p
              onClick={() => { setAuthPage("login"); setAuthError(""); setAuthSuccess(""); }}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              ← <span style={{ color: 'var(--blue)', fontWeight: '600', textDecoration: 'underline' }}>Back to Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

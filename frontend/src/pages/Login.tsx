import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { errorMessage } from '../api/client';
import { InlineAlert } from '../components/ui/InlineAlert';
import { useAuthStore } from '../store/auth';

const credentials = [
  ['Admin', 'admin@demo.com', 'Admin@1234'],
  ['Sales', 'sales@demo.com', 'Sales@1234'],
  ['Warehouse', 'warehouse@demo.com', 'Whouse@1234'],
  ['Accounts', 'accounts@demo.com', 'Accounts@1234']
];

export function Login() {
  const navigate = useNavigate();
  const { token, setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Admin@1234');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(email, password);
      setAuth(result.token, result.user);
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand" style={{ background: 'var(--ink)', borderRadius: 8, padding: 14, marginBottom: 20 }}>
          <div className="brand-mark">O</div>
          <div>
            <div className="brand-name">OpsPro</div>
            <div className="brand-sub">ERP - CRM Operations</div>
          </div>
        </div>
        <h1 className="page-title">Sign in</h1>
        <p className="page-sub">Use any seeded role to review the workflow.</p>
        {error ? <InlineAlert variant="critical" title="Login failed">{error}</InlineAlert> : null}
        <div className="field" style={{ marginTop: 16 }}>
          <label>Email</label>
          <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="credential-grid">
          {credentials.map(([role, roleEmail, rolePassword]) => (
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              key={role}
              onClick={() => {
                setEmail(roleEmail);
                setPassword(rolePassword);
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

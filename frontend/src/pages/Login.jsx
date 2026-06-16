import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-3">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: '1.75rem',
              background: 'linear-gradient(135deg, #7c4dff, #00bcd4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <i className="bi bi-shop me-2" style={{ WebkitTextFillColor: '#7c4dff' }}></i>
              KampusMarket
            </span>
          </Link>
        </div>
        <h2 className="auth-title">Selamat Datang!</h2>
        <p className="auth-subtitle">Masuk ke akun Anda untuk melanjutkan</p>

        {error && (
          <div className="alert alert-custom alert-custom-danger">
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-envelope me-2"></i>Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-lock me-2"></i>Password
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute"
                style={{ right: 8, top: '50%', transform: 'translateY(-50%)', color: '#8b92b3' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-auth" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Memproses...</>
            ) : (
              <><i className="bi bi-box-arrow-in-right me-2"></i>Masuk</>
            )}
          </button>
        </form>

        <div className="auth-link">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </div>

        {/* Demo accounts info */}
        <div className="mt-4 p-3" style={{
          background: 'rgba(124, 77, 255, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(124, 77, 255, 0.15)'
        }}>
          <small style={{ color: '#b8bdd4', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            <i className="bi bi-info-circle me-1"></i> Akun Demo:
          </small>
          <small style={{ color: '#8b92b3', display: 'block' }}>
            Admin: admin@kampus.ac.id / admin123
          </small>
          <small style={{ color: '#8b92b3', display: 'block' }}>
            User: budi@student.ac.id / password123
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;

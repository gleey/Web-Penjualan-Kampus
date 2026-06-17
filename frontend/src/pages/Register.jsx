import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { universitiesAPI } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

function Register() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    no_telepon: '',
    universitas: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUniversitasChange = (value) => {
    setFormData({ ...formData, universitas: value });
  };

  const searchUniversities = useCallback(async (keyword) => {
    try {
      const res = await universitiesAPI.search(keyword);
      return res.data.universities || [];
    } catch {
      return [];
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        no_telepon: formData.no_telepon,
        universitas: formData.universitas || undefined,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
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
        <h2 className="auth-title">Buat Akun Baru</h2>
        <p className="auth-subtitle">Daftar untuk mulai jual beli di kampus</p>

        {error && (
          <div className="alert alert-custom alert-custom-danger">
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-person me-2"></i>Nama Lengkap
            </label>
            <input
              type="text"
              className="form-control"
              name="nama"
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-envelope me-2"></i>Email
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <SearchableSelect
              value={formData.universitas}
              onChange={handleUniversitasChange}
              onSearch={searchUniversities}
              placeholder="Ketik nama universitas (min. 3 huruf)"
              label="Universitas"
              icon="bi-building"
              minChars={3}
              id="register-universitas"
              variant="dark"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-telephone me-2"></i>No. Telepon
            </label>
            <input
              type="tel"
              className="form-control"
              name="no_telepon"
              placeholder="08xxxxxxxxxx"
              value={formData.no_telepon}
              onChange={handleChange}
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
                name="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
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

          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-lock-fill me-2"></i>Konfirmasi Password
            </label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              placeholder="Ulangi password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-auth" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Memproses...</>
            ) : (
              <><i className="bi bi-person-plus me-2"></i>Daftar</>
            )}
          </button>
        </form>

        <div className="auth-link">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

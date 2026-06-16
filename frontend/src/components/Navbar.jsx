import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark navbar-custom fixed-top ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link className="navbar-brand navbar-brand-custom" to="/">
          <i className="bi bi-shop"></i>
          KampusMarket
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom ${isActive('/')}`} to="/">
                <i className="bi bi-house me-1"></i> Beranda
              </Link>
            </li>
            {isAuthenticated && !isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link nav-link-custom ${isActive('/my-products')}`} to="/my-products">
                  <i className="bi bi-box me-1"></i> Produk Saya
                </Link>
              </li>
            )}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/admin/dashboard')}`} to="/admin/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/admin/users')}`} to="/admin/users">
                    <i className="bi bi-people me-1"></i> Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive('/admin/products')}`} to="/admin/products">
                    <i className="bi bi-grid me-1"></i> Produk
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-link text-decoration-none d-flex align-items-center gap-2 dropdown-toggle"
                  data-bs-toggle="dropdown"
                  style={{ color: 'white' }}
                >
                  <div className="user-avatar-nav">
                    {user?.nama?.charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline" style={{ fontSize: '0.9rem' }}>
                    {user?.nama}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text text-muted" style={{ fontSize: '0.82rem' }}>
                      {user?.email}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {!isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/my-products">
                        <i className="bi bi-box me-2"></i>Produk Saya
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link nav-link-custom">
                  Masuk
                </Link>
                <Link to="/register" className="btn btn-nav-primary">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="footer-brand">
              <i className="bi bi-shop me-2"></i>KampusMarket
            </div>
            <p className="footer-desc">
              Platform jual beli barang antar mahasiswa. Temukan barang yang kamu butuhkan
              atau jual barang yang sudah tidak terpakai.
            </p>
          </div>
          <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
            <h6 className="footer-title">Menu</h6>
            <ul className="footer-links">
              <li><Link to="/">Beranda</Link></li>
              <li><Link to="/login">Masuk</Link></li>
              <li><Link to="/register">Daftar</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-4 mb-4 mb-md-0">
            <h6 className="footer-title">Kategori</h6>
            <ul className="footer-links">
              <li><Link to="/?kategori=1">Elektronik</Link></li>
              <li><Link to="/?kategori=2">Buku & Alat Tulis</Link></li>
              <li><Link to="/?kategori=3">Pakaian</Link></li>
              <li><Link to="/?kategori=4">Kos & Furniture</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-4">
            <h6 className="footer-title">Kontak</h6>
            <ul className="footer-links">
              <li>
                <i className="bi bi-envelope me-2"></i>
                info@kampusmarket.ac.id
              </li>
              <li>
                <i className="bi bi-geo-alt me-2"></i>
                Kampus Universitas
              </li>
              <li>
                <i className="bi bi-telephone me-2"></i>
                (021) 123-4567
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="mb-0">© {new Date().getFullYear()} KampusMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { Modal, Button, Form } from 'react-bootstrap';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModerateModal, setShowModerateModal] = useState(false);
  const [moderateProduct, setModerateProduct] = useState(null);
  const [moderateStatus, setModerateStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [filterStatus]);

  const loadProducts = async (searchQuery = '') => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterStatus) params.status = filterStatus;
      const res = await adminAPI.getProducts(params);
      setProducts(res.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(search);
  };

  const handleModerate = (product) => {
    setModerateProduct(product);
    setModerateStatus(product.status);
    setShowModerateModal(true);
  };

  const handleModerateSubmit = async () => {
    try {
      await adminAPI.moderateProduct(moderateProduct.id, moderateStatus);
      setShowModerateModal(false);
      loadProducts(search);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status produk.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await adminAPI.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="admin-page" style={{ marginTop: '80px' }}>
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-grid me-2" style={{ color: '#7c4dff' }}></i>
              Kelola Produk
            </h1>
            <p className="text-muted">Kelola dan moderasi semua produk</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="admin-table-card mb-4">
          <form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap">
            <div className="search-input-wrapper flex-grow-1">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Cari produk atau penjual..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="category-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="terjual">Terjual</option>
              <option value="dimoderasi">Dimoderasi</option>
            </select>
            <button type="submit" className="btn" style={{
              background: 'linear-gradient(135deg, #1a237e, #7c4dff)',
              color: 'white', borderRadius: '12px', fontWeight: 600, padding: '0 1.5rem', border: 'none'
            }}>
              <i className="bi bi-search me-1"></i> Cari
            </button>
          </form>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner-custom"></div></div>
        ) : (
          <div className="admin-table-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontSize: '0.9rem', color: '#8b92b3' }}>
                Total: <strong>{products.length}</strong> produk
              </span>
            </div>
            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produk</th>
                    <th>Penjual</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: 40, height: 40, borderRadius: '8px', overflow: 'hidden',
                            flexShrink: 0, background: '#eef0f8', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}>
                            {product.gambar ? (
                              <img src={`/uploads/${product.gambar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <i className="bi bi-image" style={{ color: '#b8bdd4', fontSize: '0.9rem' }}></i>
                            )}
                          </div>
                          <span style={{ fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product.nama}
                          </span>
                        </div>
                      </td>
                      <td>{product.penjual_nama}</td>
                      <td>{product.kategori_nama || '-'}</td>
                      <td style={{ fontWeight: 600, color: '#1a237e' }}>{formatPrice(product.harga)}</td>
                      <td>
                        <span className={`status-badge status-${product.status}`}>{product.status}</span>
                      </td>
                      <td>{new Date(product.created_at).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-action btn-action-view"
                            onClick={() => navigate(`/products/${product.id}`)}
                            title="Lihat"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-action btn-action-moderate"
                            onClick={() => handleModerate(product)}
                            title="Moderasi"
                          >
                            <i className="bi bi-shield-check"></i>
                          </button>
                          <button
                            className="btn btn-action btn-action-delete"
                            onClick={() => handleDelete(product.id)}
                            title="Hapus"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="empty-state py-4">
                <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-2">Tidak ada produk ditemukan</h5>
              </div>
            )}
          </div>
        )}

        {/* Moderate Modal */}
        <Modal show={showModerateModal} onHide={() => setShowModerateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Moderasi Produk</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {moderateProduct && (
              <>
                <p className="mb-3">
                  Ubah status produk <strong>"{moderateProduct.nama}"</strong>
                </p>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={moderateStatus} onChange={(e) => setModerateStatus(e.target.value)}>
                    <option value="tersedia">Tersedia</option>
                    <option value="terjual">Terjual</option>
                    <option value="dimoderasi">Dimoderasi (Sembunyikan)</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModerateModal(false)}>
              Batal
            </Button>
            <Button
              style={{ background: 'linear-gradient(135deg, #1a237e, #7c4dff)', border: 'none' }}
              onClick={handleModerateSubmit}
            >
              Simpan
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ManageProducts;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getMy();
      setProducts(res.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Gagal menghapus produk.');
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
    <div className="my-products-page" style={{ marginTop: '80px' }}>
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-box me-2" style={{ color: '#7c4dff' }}></i>
              Produk Saya
            </h1>
            <p className="text-muted">Kelola produk yang Anda jual</p>
          </div>
          <Link to="/products/add" className="btn btn-add-product">
            <i className="bi bi-plus-lg"></i>
            Tambah Produk
          </Link>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-custom"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="admin-table-card">
            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>Produk</th>
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
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div style={{
                            width: 50,
                            height: 50,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: '#eef0f8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {product.gambar ? (
                              <img src={`/uploads/${product.gambar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <i className="bi bi-image" style={{ color: '#b8bdd4' }}></i>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{product.nama}</div>
                            {product.lokasi && (
                              <small className="text-muted">
                                <i className="bi bi-geo-alt me-1"></i>{product.lokasi}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{product.kategori_nama || '-'}</td>
                      <td style={{ fontWeight: 600, color: '#1a237e' }}>{formatPrice(product.harga)}</td>
                      <td>
                        <span className={`status-badge status-${product.status}`}>
                          {product.status}
                        </span>
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
                            className="btn btn-action btn-action-edit"
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
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
          </div>
        ) : (
          <div className="empty-state">
            <i className="bi bi-box-seam"></i>
            <h3>Belum Ada Produk</h3>
            <p>Anda belum memiliki produk. Mulai jual barang Anda sekarang!</p>
            <Link to="/products/add" className="btn btn-add-product mt-3">
              <i className="bi bi-plus-lg"></i>
              Tambah Produk Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProducts;

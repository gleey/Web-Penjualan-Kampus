import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getById(id);
      setProduct(res.data.product);
      setRelatedProducts(res.data.relatedProducts);
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getWhatsAppLink = (phone, productName) => {
    const cleanPhone = phone?.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Halo, saya tertarik dengan produk "${productName}" yang dijual di KampusMarket. Apakah masih tersedia?`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  if (loading) {
    return (
      <div style={{ marginTop: '80px' }}>
        <div className="loading-spinner">
          <div className="spinner-custom"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail-page" style={{ marginTop: '80px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: '0.9rem' }}>
            <li className="breadcrumb-item"><Link to="/">Beranda</Link></li>
            {product.kategori_nama && (
              <li className="breadcrumb-item">
                <Link to={`/?kategori=${product.kategori_id}`}>{product.kategori_nama}</Link>
              </li>
            )}
            <li className="breadcrumb-item active">{product.nama}</li>
          </ol>
        </nav>

        <div className="row">
          {/* Product Image */}
          <div className="col-lg-7 mb-4">
            {product.gambar ? (
              <img
                src={`/uploads/${product.gambar}`}
                alt={product.nama}
                className="product-detail-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="product-detail-placeholder"
              style={{ display: product.gambar ? 'none' : 'flex' }}
            >
              <i className="bi bi-image"></i>
            </div>
          </div>

          {/* Product Info */}
          <div className="col-lg-5">
            <div className="product-detail-info">
              {product.kategori_nama && (
                <span className="product-detail-category">
                  <i className={`bi ${product.kategori_icon || 'bi-tag'} me-1`}></i>
                  {product.kategori_nama}
                </span>
              )}

              <h1 className="product-detail-title">{product.nama}</h1>
              <div className="product-detail-price">{formatPrice(product.harga)}</div>

              <div className="product-detail-meta">
                <div className="product-detail-meta-item">
                  <i className="bi bi-patch-check"></i>
                  <span>Kondisi: {product.kondisi === 'baru' ? 'Baru' : 'Bekas'}</span>
                </div>
                {product.lokasi && (
                  <div className="product-detail-meta-item">
                    <i className="bi bi-geo-alt"></i>
                    <span>{product.lokasi}</span>
                  </div>
                )}
                <div className="product-detail-meta-item">
                  <i className="bi bi-calendar3"></i>
                  <span>{formatDate(product.created_at)}</span>
                </div>
                <div className="product-detail-meta-item">
                  <i className="bi bi-info-circle"></i>
                  <span className={`status-badge status-${product.status}`}>{product.status}</span>
                </div>
              </div>

              {product.deskripsi && (
                <div className="product-detail-description">
                  <h6 style={{ fontWeight: 600, color: '#2d3250', marginBottom: '0.5rem' }}>Deskripsi</h6>
                  {product.deskripsi}
                </div>
              )}

              {/* Seller Card */}
              <div className="seller-card">
                <div className="seller-card-title">Informasi Penjual</div>
                <div className="seller-info">
                  <div className="seller-avatar">
                    {product.penjual_nama?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="seller-name">{product.penjual_nama}</div>
                    <div className="seller-email">{product.penjual_email}</div>
                    {product.penjual_universitas && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.82rem',
                        color: '#00bcd4',
                        fontWeight: 500,
                        marginTop: '2px',
                      }}>
                        <i className="bi bi-building" style={{ fontSize: '0.75rem' }}></i>
                        {product.penjual_universitas}
                      </div>
                    )}
                  </div>
                </div>

                {product.penjual_telepon && (
                  <>
                    <a
                      href={getWhatsAppLink(product.penjual_telepon, product.nama)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-contact-whatsapp"
                    >
                      <i className="bi bi-whatsapp me-2"></i>
                      Hubungi via WhatsApp
                    </a>
                    <a
                      href={`tel:${product.penjual_telepon}`}
                      className="btn btn-contact-phone"
                    >
                      <i className="bi bi-telephone me-2"></i>
                      {product.penjual_telepon}
                    </a>
                  </>
                )}
              </div>

              {/* Edit button if owner */}
              {user && user.id === product.user_id && (
                <Link
                  to={`/products/edit/${product.id}`}
                  className="btn w-100 mt-3"
                  style={{
                    background: 'rgba(124, 77, 255, 0.1)',
                    color: '#7c4dff',
                    fontWeight: 600,
                    borderRadius: '12px',
                    padding: '0.75rem',
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>Edit Produk
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-5">
            <h3 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '1.5rem' }}>
              <i className="bi bi-grid me-2" style={{ color: '#7c4dff' }}></i>
              Produk Terkait
            </h3>
            <div className="product-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;

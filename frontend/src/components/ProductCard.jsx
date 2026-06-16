import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-card-image-wrapper">
        {product.gambar ? (
          <img
            src={`/uploads/${product.gambar}`}
            alt={product.nama}
            className="product-card-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="product-placeholder"
          style={{ display: product.gambar ? 'none' : 'flex' }}
        >
          <i className="bi bi-image"></i>
        </div>
        <span className={`product-card-badge ${product.kondisi === 'baru' ? 'badge-baru' : 'badge-bekas'}`}>
          {product.kondisi === 'baru' ? 'Baru' : 'Bekas'}
        </span>
      </div>

      <div className="product-card-body">
        {product.kategori_nama && (
          <div className="product-card-category">
            {product.kategori_nama}
          </div>
        )}
        <h3 className="product-card-title">{product.nama}</h3>
        <div className="product-card-price">{formatPrice(product.harga)}</div>

        <div className="product-card-footer">
          <div className="product-card-seller">
            <div className="product-card-seller-avatar">
              {product.penjual_nama?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span>{product.penjual_nama || 'Unknown'}</span>
          </div>
          {product.lokasi && (
            <div className="product-card-location">
              <i className="bi bi-geo-alt"></i>
              {product.lokasi}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

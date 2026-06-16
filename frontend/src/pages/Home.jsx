import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('kategori') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'terbaru');
  const [pagination, setPagination] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('kategori')) params.kategori = searchParams.get('kategori');
      if (searchParams.get('sort')) params.sort = searchParams.get('sort');
      if (searchParams.get('page')) params.page = searchParams.get('page');

      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(params),
        categoriesAPI.getAll(),
      ]);

      setProducts(productsRes.data.products);
      setPagination(productsRes.data.pagination);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('kategori', selectedCategory);
    if (sort && sort !== 'terbaru') params.set('sort', sort);
    setSearchParams(params);
  };

  const handleCategoryClick = (categoryId) => {
    const newCategory = selectedCategory === String(categoryId) ? '' : String(categoryId);
    setSelectedCategory(newCategory);
    const params = new URLSearchParams(searchParams);
    if (newCategory) {
      params.set('kategori', newCategory);
    } else {
      params.delete('kategori');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    const params = new URLSearchParams(searchParams);
    if (newSort && newSort !== 'terbaru') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" style={{ marginTop: '62px' }}>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="hero-title">
                Jual Beli Barang<br />
                Antar <span className="highlight">Mahasiswa</span>
              </h1>
              <p className="hero-subtitle">
                Temukan barang yang kamu butuhkan atau jual barang yang sudah tidak terpakai.
                Marketplace khusus untuk komunitas kampus kita!
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {!isAuthenticated && (
                  <Link to="/register" className="btn btn-lg px-4 py-2" style={{
                    background: 'linear-gradient(135deg, #7c4dff, #00bcd4)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}>
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Mulai Sekarang
                  </Link>
                )}
                <a href="#products" className="btn btn-lg px-4 py-2" style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  fontWeight: 500,
                }}>
                  <i className="bi bi-search me-2"></i>
                  Jelajahi Produk
                </a>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-number">{pagination?.totalItems || 0}+</div>
                  <div className="hero-stat-label">Produk Tersedia</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">{categories.length}</div>
                  <div className="hero-stat-label">Kategori</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">24/7</div>
                  <div className="hero-stat-label">Akses Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="search-section" id="products">
        <div className="container">
          <form onSubmit={handleSearch}>
            <div className="search-container">
              <div className="search-input-wrapper">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari produk... (contoh: laptop, buku, jaket)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => handleCategoryClick(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nama} ({cat.jumlah_produk})
                  </option>
                ))}
              </select>
              <select className="sort-select" value={sort} onChange={handleSortChange}>
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="harga_asc">Harga Terendah</option>
                <option value="harga_desc">Harga Tertinggi</option>
              </select>
              <button type="submit" className="btn" style={{
                background: 'linear-gradient(135deg, #1a237e, #7c4dff)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 600,
                border: 'none'
              }}>
                <i className="bi bi-search me-1"></i> Cari
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Chips */}
      <section className="container">
        <div className="category-chips">
          <button
            className={`category-chip ${!selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            <i className="bi bi-grid-3x3-gap"></i>
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${selectedCategory === String(cat.id) ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <i className={`bi ${cat.icon}`}></i>
              {cat.nama}
              <span className="chip-count">{cat.jumlah_produk}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container" style={{ minHeight: '400px' }}>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-custom"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-4 mb-4">
                <ul className="pagination">
                  <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        ) : (
          <div className="empty-state">
            <i className="bi bi-search"></i>
            <h3>Produk Tidak Ditemukan</h3>
            <p>Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

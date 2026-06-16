import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data);
    } catch (error) {
      console.error('Dashboard error:', error);
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

  if (loading) {
    return (
      <div style={{ marginTop: '80px' }}>
        <div className="loading-spinner"><div className="spinner-custom"></div></div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ marginTop: '80px' }}>
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-speedometer2 me-2" style={{ color: '#7c4dff' }}></i>
              Dashboard Admin
            </h1>
            <p className="text-muted">Ringkasan data Marketplace Kampus</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="stat-card stat-users">
              <div className="stat-icon icon-users">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-number">{data?.stats?.totalMahasiswa || 0}</div>
              <div className="stat-label">Total Mahasiswa</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card stat-products">
              <div className="stat-icon icon-products">
                <i className="bi bi-box-seam"></i>
              </div>
              <div className="stat-number">{data?.stats?.totalProduk || 0}</div>
              <div className="stat-label">Total Produk</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card stat-categories">
              <div className="stat-icon icon-categories">
                <i className="bi bi-tags"></i>
              </div>
              <div className="stat-number">{data?.stats?.totalKategori || 0}</div>
              <div className="stat-label">Kategori</div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Products by Status */}
          <div className="col-lg-6">
            <div className="admin-table-card">
              <h5 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <i className="bi bi-pie-chart me-2" style={{ color: '#7c4dff' }}></i>
                Produk berdasarkan Status
              </h5>
              <div className="d-flex gap-3 flex-wrap">
                {data?.productsByStatus?.map(item => (
                  <div key={item.status} className="d-flex align-items-center gap-2 p-2 px-3" style={{
                    background: item.status === 'tersedia' ? 'rgba(76,175,80,0.08)' :
                      item.status === 'terjual' ? 'rgba(158,158,158,0.08)' : 'rgba(255,152,0,0.08)',
                    borderRadius: '10px',
                    flex: '1',
                    minWidth: '140px',
                  }}>
                    <span className={`status-badge status-${item.status}`}>{item.status}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', marginLeft: 'auto' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products by Category */}
          <div className="col-lg-6">
            <div className="admin-table-card">
              <h5 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <i className="bi bi-bar-chart me-2" style={{ color: '#00bcd4' }}></i>
                Produk berdasarkan Kategori
              </h5>
              {data?.productsByCategory?.map(item => (
                <div key={item.nama} className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: '1px solid #eef0f8' }}>
                  <span style={{ fontSize: '0.9rem', color: '#4a4f6a' }}>{item.nama}</span>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: `${Math.max(parseInt(item.count) * 20, 20)}px`,
                      height: '8px',
                      background: 'linear-gradient(90deg, #7c4dff, #00bcd4)',
                      borderRadius: '4px',
                      maxWidth: '120px',
                    }}></div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: '24px', textAlign: 'right' }}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4 mt-1">
          {/* Recent Products */}
          <div className="col-lg-7">
            <div className="admin-table-card">
              <h5 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <i className="bi bi-clock-history me-2" style={{ color: '#7c4dff' }}></i>
                Produk Terbaru
              </h5>
              <div className="table-responsive">
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Penjual</th>
                      <th>Harga</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentProducts?.map(product => (
                      <tr key={product.id}>
                        <td style={{ fontWeight: 500 }}>{product.nama}</td>
                        <td>{product.penjual_nama}</td>
                        <td style={{ fontWeight: 600, color: '#1a237e' }}>{formatPrice(product.harga)}</td>
                        <td>
                          <span className={`status-badge status-${product.status}`}>{product.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="col-lg-5">
            <div className="admin-table-card">
              <h5 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <i className="bi bi-person-plus me-2" style={{ color: '#00bcd4' }}></i>
                User Terbaru
              </h5>
              {data?.recentUsers?.map(user => (
                <div key={user.id} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: '1px solid #eef0f8' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: user.role === 'admin' ? 'linear-gradient(135deg, #ff6b6b, #e91e63)' : 'linear-gradient(135deg, #1a237e, #7c4dff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                  }}>
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user.nama}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8b92b3' }}>{user.email}</div>
                  </div>
                  <span className={`status-badge ${user.role === 'admin' ? 'status-dimoderasi' : 'status-tersedia'}`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

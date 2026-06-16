import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Modal, Button, Form } from 'react-bootstrap';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ nama: '', email: '', no_telepon: '', role: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (searchQuery = '') => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({
      nama: user.nama,
      email: user.email,
      no_telepon: user.no_telepon || '',
      role: user.role,
    });
    setShowEditModal(true);
    setError('');
  };

  const handleEditSubmit = async () => {
    try {
      setError('');
      await adminAPI.updateUser(editUser.id, editForm);
      setShowEditModal(false);
      loadUsers(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui user.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini? Semua produk user akan ikut terhapus.')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  return (
    <div className="admin-page" style={{ marginTop: '80px' }}>
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-people me-2" style={{ color: '#7c4dff' }}></i>
              Kelola Users
            </h1>
            <p className="text-muted">Kelola data mahasiswa dan admin</p>
          </div>
        </div>

        {/* Search */}
        <div className="admin-table-card mb-4">
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <div className="search-input-wrapper flex-grow-1">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Cari nama atau email user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn" style={{
              background: 'linear-gradient(135deg, #1a237e, #7c4dff)',
              color: 'white', borderRadius: '12px', fontWeight: 600, padding: '0 1.5rem', border: 'none'
            }}>
              <i className="bi bi-search me-1"></i> Cari
            </button>
          </form>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner-custom"></div></div>
        ) : (
          <div className="admin-table-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontSize: '0.9rem', color: '#8b92b3' }}>
                Total: <strong>{users.length}</strong> user
              </span>
            </div>
            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>No. Telepon</th>
                    <th>Role</th>
                    <th>Terdaftar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: user.role === 'admin' ? 'linear-gradient(135deg, #ff6b6b, #e91e63)' : 'linear-gradient(135deg, #1a237e, #7c4dff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                          }}>
                            {user.nama.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{user.nama}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.no_telepon || '-'}</td>
                      <td>
                        <span className={`status-badge ${user.role === 'admin' ? 'status-dimoderasi' : 'status-tersedia'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-action btn-action-edit" onClick={() => handleEdit(user)} title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-action btn-action-delete" onClick={() => handleDelete(user.id)} title="Hapus">
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
        )}

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <div className="alert alert-custom alert-custom-danger mb-3">
                <i className="bi bi-exclamation-circle me-2"></i>{error}
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Nama</Form.Label>
              <Form.Control
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>No. Telepon</Form.Label>
              <Form.Control
                value={editForm.no_telepon}
                onChange={(e) => setEditForm({ ...editForm, no_telepon: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="mahasiswa">Mahasiswa</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button
              style={{ background: 'linear-gradient(135deg, #1a237e, #7c4dff)', border: 'none' }}
              onClick={handleEditSubmit}
            >
              Simpan Perubahan
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ManageUsers;

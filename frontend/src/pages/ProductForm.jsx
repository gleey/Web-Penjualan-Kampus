import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';

function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    harga: '',
    kategori_id: '',
    kondisi: 'bekas',
    lokasi: '',
    status: 'tersedia',
  });
  const [gambar, setGambar] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEdit) loadProduct();
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async () => {
    try {
      const res = await productsAPI.getById(id);
      const product = res.data.product;
      setFormData({
        nama: product.nama,
        deskripsi: product.deskripsi || '',
        harga: product.harga,
        kategori_id: product.kategori_id || '',
        kondisi: product.kondisi || 'bekas',
        lokasi: product.lokasi || '',
        status: product.status || 'tersedia',
      });
      if (product.gambar) {
        setImagePreview(`/uploads/${product.gambar}`);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/my-products');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB.');
        return;
      }
      setGambar(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = { ...formData };
      if (gambar) data.gambar = gambar;

      if (isEdit) {
        await productsAPI.update(id, data);
        setSuccess('Produk berhasil diperbarui!');
      } else {
        await productsAPI.create(data);
        setSuccess('Produk berhasil ditambahkan!');
      }

      setTimeout(() => navigate('/my-products'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-page" style={{ marginTop: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="page-header">
              <div>
                <h1 className="page-title">
                  <i className={`bi ${isEdit ? 'bi-pencil' : 'bi-plus-circle'} me-2`} style={{ color: '#7c4dff' }}></i>
                  {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h1>
                <p className="text-muted">
                  {isEdit ? 'Perbarui informasi produk Anda' : 'Isi detail produk yang ingin dijual'}
                </p>
              </div>
            </div>

            {error && (
              <div className="alert alert-custom alert-custom-danger mb-3">
                <i className="bi bi-exclamation-circle me-2"></i>{error}
              </div>
            )}
            {success && (
              <div className="alert alert-custom alert-custom-success mb-3">
                <i className="bi bi-check-circle me-2"></i>{success}
              </div>
            )}

            <div className="form-card">
              <form onSubmit={handleSubmit}>
                {/* Image Upload */}
                <div className="mb-4">
                  <label className="form-label">Foto Produk</label>
                  <div
                    className="image-upload-area"
                    onClick={() => document.getElementById('imageInput').click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up d-block"></i>
                        <p className="mb-1" style={{ color: '#6c7293' }}>Klik untuk upload foto produk</p>
                        <small style={{ color: '#b8bdd4' }}>JPG, PNG, WebP • Maks. 5MB</small>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Product Name */}
                <div className="mb-3">
                  <label className="form-label">Nama Produk *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nama"
                    placeholder="Contoh: Laptop ASUS VivoBook 14"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    className="form-control"
                    name="deskripsi"
                    rows={4}
                    placeholder="Jelaskan kondisi, spesifikasi, dan detail produk Anda..."
                    value={formData.deskripsi}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  {/* Price */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Harga (Rp) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="harga"
                      placeholder="Contoh: 500000"
                      value={formData.harga}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-select"
                      name="kategori_id"
                      value={formData.kategori_id}
                      onChange={handleChange}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  {/* Condition */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Kondisi</label>
                    <select
                      className="form-select"
                      name="kondisi"
                      value={formData.kondisi}
                      onChange={handleChange}
                    >
                      <option value="bekas">Bekas</option>
                      <option value="baru">Baru</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Lokasi</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lokasi"
                      placeholder="Contoh: Gedung A, Kampus Utama"
                      value={formData.lokasi}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Status (only for edit) */}
                {isEdit && (
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="tersedia">Tersedia</option>
                      <option value="terjual">Terjual</option>
                    </select>
                  </div>
                )}

                {/* Submit */}
                <div className="d-flex gap-3 mt-4">
                  <button type="submit" className="btn btn-add-product" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</>
                    ) : (
                      <><i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                        {isEdit ? 'Perbarui Produk' : 'Tambah Produk'}</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ background: '#eef0f8', color: '#6c7293', borderRadius: '12px', fontWeight: 500, padding: '0.65rem 1.5rem' }}
                    onClick={() => navigate('/my-products')}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;

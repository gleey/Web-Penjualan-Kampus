import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import MyProducts from './pages/MyProducts';
import ProductForm from './pages/ProductForm';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />

          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products/:id" element={<ProductDetail />} />

              {/* Protected Routes — Mahasiswa */}
              <Route path="/my-products" element={
                <ProtectedRoute>
                  <MyProducts />
                </ProtectedRoute>
              } />
              <Route path="/products/add" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/products/edit/:id" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />

              {/* Protected Routes — Admin */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <ManageUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute adminOnly>
                  <ManageProducts />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

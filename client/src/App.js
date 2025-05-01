import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import Checkout from './components/Checkout';
import MyOrders from './components/MyOrders';
import AdminLogin from './components/Admin/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProducts from './components/Admin/AdminProducts';
import AdminOrders from './components/Admin/AdminOrders';
import AdminUsers from './components/Admin/AdminUsers';
import AdminMessages from './components/Admin/AdminMessages';
import AdminReviews from './components/Admin/AdminReviews';
import MyMessages from './components/MyMessages';
import Review from './components/Review';

function App() {
  return (
    <>
      <Routes>
        {/* User Routes - with Header and Footer */}
        <Route path="/" element={
          <>
            <Header />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/about" element={
          <>
            <Header />
            <About />
            <Footer />
          </>
        } />
        <Route path="/shop" element={
          <>
            <Header />
            <Shop />
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Header />
            <Contact />
            <Footer />
          </>
        } />
        <Route path="/cart" element={
          <>
            <Header />
            <Cart />
            <Footer />
          </>
        } />
        <Route path="/login" element={
          <>
            <Header />
            <Login />
            <Footer />
          </>
        } />
        <Route path="/register" element={
          <>
            <Header />
            <Register />
            <Footer />
          </>
        } />
        <Route path="/checkout" element={
          <>
            <Header />
            <Checkout />
            <Footer />
          </>
        } />
        <Route path="/myorders" element={
          <>
            <Header />
            <MyOrders />
            <Footer />
          </>
        } />
        <Route path="/mymessages" element={
          <>
            <Header />
            <MyMessages />
            <Footer />
          </>
        } />
        <Route path="/review" element={
          <>
            <Header />
            <Review />
            <Footer />
          </>
        } />
        
        {/* Admin Login - without AdminLayout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Admin Routes - with AdminLayout */}
        <Route path="/admin/dashboard" element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        } />
        <Route path="/admin/products" element={
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        } />
        <Route path="/admin/orders" element={
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        } />
        <Route path="/admin/users" element={
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        } />
        <Route path="/admin/messages" element={
          <AdminLayout>
            <AdminMessages />
          </AdminLayout>
        } />
        <Route path="/admin/reviews" element={
          <AdminLayout>
            <AdminReviews />
          </AdminLayout>
        } />
      </Routes>
    </>
  );
}

export default App;


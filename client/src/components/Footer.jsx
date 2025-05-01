import React from 'react';
import '../css/style.css';

function Footer() {
  return (
    <section className="footer">
      <div className="box-container">

        <div className="box">
          <h3>quick links</h3>
          <a href="/"><i className="fas fa-angle-right"></i> Home</a>
          <a href="/about"><i className="fas fa-angle-right"></i> About</a>
          <a href="/shop"><i className="fas fa-angle-right"></i> Shop</a>
          <a href="/contact"><i className="fas fa-angle-right"></i> Contact</a>
        </div>

        <div className="box">
          <h3>extra links</h3>
          <a href="/login"><i className="fas fa-angle-right"></i> Login</a>
          <a href="/register"><i className="fas fa-angle-right"></i> Register</a>
          <a href="/cart"><i className="fas fa-angle-right"></i> Cart</a>
          <a href="/orders"><i className="fas fa-angle-right"></i> Orders</a>
        </div>

        <div className="box">
          <h3>contact info</h3>
          <p><i className="fas fa-envelope"></i> bookheaven@email.com</p>
          <p><i className="fas fa-map-marker-alt"></i> Karachi, Pakistan</p>
        </div>

      </div>

      <div className="credit">© 2025 <span>Book Heaven</span> | All rights reserved!</div>
    </section>
  );
}

export default Footer;

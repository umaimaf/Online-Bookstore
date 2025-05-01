import React from 'react';
import { Link } from 'react-router-dom';
import { getImageForProduct } from '../utils/imageMap';
import '../css/style.css';

function About() {
  return (
    <div className="about">
      <div className="flex">
        <div className="image">
          <img src={getImageForProduct('about-img.jpg')} alt="About Us" />
        </div>
        <div className="content">
          <h3>About Us</h3>
          <p>
              Welcome to <strong>Book Haven</strong>, your ultimate online bookstore.
              We're passionate about bringing books to life for readers across the country.
              Whether you're looking for trending tech guides, academic resources, or inspirational reads — we've got you covered.
            </p>

            <p>
              At Book Haven, we pride ourselves on our handpicked selection, fast delivery,
              and customer-first service. Our mission is to make quality books more accessible and enjoyable for everyone.
            </p>
          <Link to="/shop" className="btn">Shop Now</Link>
        </div>
      </div>
    </div>
  );
}

export default About;

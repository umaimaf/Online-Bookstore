import React from 'react';
import { Link } from 'react-router-dom';
import { getImageForProduct } from '../utils/imageMap';
import '../css/style.css';

function Home() {
  const featuredBooks = [
    {
      id: 1,
      name: "The Silent Patient",
      image: "Silent Patient.webp",
      price: 1500
    },
    {
      id: 2,
      name: "Forty Rules of Love",
      image: "Fourty Rules Of Love.webp",
      price: 2000
    },
    {
      id: 3,
      name: "The Kite Runner",
      image: "The Kite Runner.jpg",
      price: 2500
    }
  ];

  return (
    <>
      <div className="home">
        <div className="content">
          <span>Welcome To</span>
          <h3>Book Store</h3>
          <p>Discover a world of stories at your fingertips</p>
        </div>
      </div>

      <section className="featured">
        <h1 className="title">Featured Books</h1>
        <div className="box-container">
          {featuredBooks.map(book => (
            <div className="box" key={book.id}>
              <div className="image">
                <img src={getImageForProduct(book.image)} alt={book.name} />
              </div>
              <div className="content">
                <h3>{book.name}</h3>
                <div className="price">Rs. {book.price}</div>
                <button className="btn">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about">
        <div className="flex">
          <div className="image">
            <img src={getImageForProduct('about-img.jpg')} alt="About Us" />
          </div>
          <div className="content">
            <h3>About Us</h3>
            <p>Welcome to our bookstore! We're passionate about connecting readers with their next favorite book.</p>
            <Link to="/about" className="btn">Read More</Link>
          </div>
        </div>
      </section>

      <section className="home-contact">
        <div className="content">
          <h3>Have Any Questions?</h3>
          <p>Feel free to reach out to us. We're here to help you find your next favorite book!</p>
          <Link to="/contact" className="btn">Contact Us</Link>
        </div>
      </section>
    </>
  );
}

export default Home;


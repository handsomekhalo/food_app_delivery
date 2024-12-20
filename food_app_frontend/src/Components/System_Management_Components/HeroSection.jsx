import React from 'react';
import { SearchBar } from './SearchBar';
// import deliveryImageSrc from '../../images/delivery_man.jpg';
import deliveryImageSrc from '../../images/delivery scooter.jpg';
// import deliveryImageSrc from '../../images/hut.jpg';

export const HeroSection = () => {
  return (
    <header className="hero-section">
      <div className="hero-text">
        <h1>
          Fastest <span className="highlight">Delivery</span> & Easy <span className="highlight">Pickup</span>.
        </h1>
        <p>Food Delivery Service & Restaurant</p>
        <SearchBar />
      </div>
      <div className="hero-image">
        <img src={deliveryImageSrc} alt="Delivery Man" />
      </div>
    </header>
  );
};

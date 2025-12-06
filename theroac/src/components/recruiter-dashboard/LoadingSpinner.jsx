import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="preloader" style={{ position: 'relative', height: '400px' }}>
      <div className="loading-container">
        <div className="loading"></div>
        <div id="loading-icon">
          <img src="/assets/img/logo/preloader.png" alt="Loading" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

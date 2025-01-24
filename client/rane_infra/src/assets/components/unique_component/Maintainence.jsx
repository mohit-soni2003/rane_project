import React from 'react';

const Maintainence = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Toolbox Illustration */}
        <div style={styles.illustration}>
          <img
            src="/maintain.png" // Replace with your image URL
            alt="Toolbox Illustration"
            style={styles.image}
          />
        </div>

        {/* Maintenance Text */}
        <h1 style={styles.title}>Page under Development...</h1>
        <p style={styles.description}>
          Our website is currently undergoing scheduled Development.
          <br />
          We should be back shortly. Thank you for your patience.
        </p>
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f7f8fa',
    color: '#555',
    fontFamily: "'Roboto', sans-serif",
    textAlign: 'center',
  },
  content: {
    maxWidth: '600px',
    padding: '20px',
  },
  illustration: {
    marginBottom: '20px',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '10px',
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.5',
  },
};

export default Maintainence;

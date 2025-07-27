import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/animation/websiteMaintainence.json';
import { Button } from 'react-bootstrap';

export default function MaintainencePage({ width = '100%', height = 'auto', loop = true }) {
  return (
    <div
      className="d-flex justify-content-center align-items-center flex-column text-center px-3"
      style={{ minHeight: '80vh', width }}
    >
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Lottie
          animationData={animationData}
          loop={loop}
          style={{ width: '100%', height: height }}
        />
      </div>

      <h4 className="mt-4 text-dark fw-semibold">
        This page is currently under maintenance
      </h4>

      <p className="text-muted mb-3" style={{ maxWidth: '600px' }}>
        We’re working hard to improve this page and bring you a better experience.
        Please check back later or contact our team if you need urgent access.
      </p>

      <Button variant="outline-dark" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
}

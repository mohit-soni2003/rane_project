import React from 'react'
import "./Page3.css"
export default function Page3() {
  return (
    <>
    <div className="page3">
    <section className="about-work-area">
      <h2>About Work Area</h2>
      <div className="pg3-content">
        <div className="image-container">
          <img
            src="/map.webp" // Replace with your image path
            alt="Work Area Map"
          />
        </div>
        <div className="text-container">
          <h3>Our Expertise</h3>
          <p>
            With over 5 years of experience in the construction in Railway, RANE
            & RANE'S SONS has become a trusted name in the field of
            construction. Our team of experts has the knowledge, skills, and
            expertise to handle any project, big or small. We have completed
            numerous projects ranging from residential homes to commercial
            buildings, and our clients can attest to our commitment to quality
            and excellence.
          </p>
        </div>
      </div>
    </section>
    </div>
    </>

  )
}

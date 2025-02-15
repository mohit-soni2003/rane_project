import React from "react";

const Department = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading} data-aos="fade" data-aos-delay="400"  data-aos-offset="200">Departments</h2>
      <div style={styles.imagesContainer} data-aos="fade-up" data-aos-delay="300"  data-aos-offset="200">
        {["home", "infrawebp", "logistics", "malwa", "pharma"].map((logo, index) => (
          <div key={index} style={styles.imageWrapper}>
            <img
              src={`/logos/${logo}.webp`}
              alt=""
              style={styles.image}
              className="hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};


const styles = {
  container: {
    backgroundColor: "#F3F4F6", // Equivalent to Tailwind's bg-gray-100
    padding: "5% 0",
    margin:"2% 0px",
    textAlign: "center",

  },
  heading: {
    fontSize: "2.5rem", // Equivalent to Tailwind's text-4xl
    fontWeight: "bold",
    marginBottom: "24px",
    color:"rgb(153, 122, 122)"
  },
  imagesContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
  },
  imageWrapper: {
    textAlign: "center",
  },
  image: {
    width: "128px", // Equivalent to Tailwind's w-32
    height: "128px", // Equivalent to Tailwind's h-32
    objectFit: "contain",
    margin: "0 auto",
    transition: "transform 0.5s ease",
  },
  imageHover: {
    transform: "scale(1.1)",
  },
};
export default Department;

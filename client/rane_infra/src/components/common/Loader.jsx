import Lottie from "lottie-react";
import Loadingcircles from "../../assets/animation/Loadingcircles.json";

function Loader() {
  return (
    <div style={overlayStyle}>
      <div style={lottieWrapperStyle}>
        <Lottie animationData={Loadingcircles} loop />
      </div>
    </div>
  );
}

export default Loader;

/* ---------- STYLES ---------- */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.85)",
  zIndex: 9999,
};

const lottieWrapperStyle = {
  width: "clamp(120px, 20vw, 260px)", // 📱 small → 🖥 large
};

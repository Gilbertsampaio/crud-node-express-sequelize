// src/layouts/PrivateLayout.jsx
import NavBar from '../components/common/NavBar';

export default function PrivateLayout({ children }) {
  return (
    <>
      <NavBar />
      {/* <div className="container"> */}
        {children}
      {/* </div> */}
    </>
  );
}

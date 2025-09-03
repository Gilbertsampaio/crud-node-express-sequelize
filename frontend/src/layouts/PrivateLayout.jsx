// src/layouts/PrivateLayout.jsx
import NavBar from '../components/common/NavBar';
import Footer from '../components/common/Footer';

export default function PrivateLayout({ children }) {
  return (
    <div className="app-wrapper">
      <NavBar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

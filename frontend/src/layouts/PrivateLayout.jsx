// src/layouts/PrivateLayout.jsx
// import NavBar from '../components/common/NavBar';
import Layout from '../components/common/Layout';
import Footer from '../components/common/Footer';

export default function PrivateLayout({ children }) {
  return (
    <div className="app-wrapper">
      <Layout children={children} menuPosition="side"/>
      <Footer />
    </div>
  );
}

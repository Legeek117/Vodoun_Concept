import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './store';
import Navbar from './components/Navbar';
import SoundControl from './components/SoundControl';
import FloatingCart from './components/FloatingCart';
import ScrollToTop from './components/ScrollToTop';
import App from './App';
import GameWorld from './components/GameWorld';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import B2BPage from './pages/B2BPage';
import PantheonPage from './pages/PantheonPage';
import ComptePage from './pages/ComptePage';

export default function RootRouter() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<GameWorld />} />
          <Route path="/accueil" element={
            <>
              <Navbar currentPath="/accueil" />
              <App />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/boutique" element={
            <>
              <Navbar currentPath="/boutique" />
              <ShopPage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/boutique/:collectionId" element={
            <>
              <Navbar currentPath="/boutique" />
              <ShopPage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/boutique/produit/:productId" element={
            <>
              <Navbar currentPath="/boutique" />
              <ProductPage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Navbar currentPath="/contact" />
              <ContactPage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/a-propos" element={
            <>
              <Navbar currentPath="/a-propos" />
              <AboutPage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/projets-pro" element={
            <>
              <Navbar currentPath="/projets-pro" />
              <B2BPage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/pantheon" element={
            <>
              <Navbar currentPath="/pantheon" />
              <PantheonPage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
          <Route path="/compte" element={
            <>
              <Navbar currentPath="/compte" />
              <ComptePage />
              <SoundControl />
              <FloatingCart />
            </>
          } />
        </Routes>
      </Router>
    </CartProvider>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CartProvider } from './store';
import Navbar from './components/Navbar';
import SoundControl from './components/SoundControl';
import FloatingCart from './components/FloatingCart';
import ScrollToTop from './components/ScrollToTop';
import GlobalLoader from './components/GlobalLoader';
import Footer from './components/Footer';

const App = lazy(() => import('./App'));
const CinematicEntrance = lazy(() => import('./components/CinematicEntrance'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage3D = lazy(() => import('./pages/ProductPage3D'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const B2BPage = lazy(() => import('./pages/B2BPage'));
const PantheonPage = lazy(() => import('./pages/PantheonPage'));
const ComptePage = lazy(() => import('./pages/ComptePage'));

export default function RootRouter() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            <Route path="/" element={<CinematicEntrance />} />
            <Route path="/accueil" element={
              <>
                <Navbar currentPath="/accueil" />
                <App />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
            <Route path="/boutique" element={
              <>
                <Navbar currentPath="/boutique" />
                <ShopPage />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
            <Route path="/boutique/:collectionId" element={
              <>
                <Navbar currentPath="/boutique" />
                <ShopPage />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
            <Route path="/boutique/produit/:productId" element={
              <>
                <ProductPage3D />
                <Footer />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Navbar currentPath="/contact" />
                <ContactPage />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
            <Route path="/a-propos" element={
              <>
                <Navbar currentPath="/a-propos" />
                <AboutPage />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
            <Route path="/projets-pro" element={
              <>
                <Navbar currentPath="/projets-pro" />
                <B2BPage />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
            <Route path="/pantheon" element={
              <>
                <Navbar currentPath="/pantheon" />
                <PantheonPage />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
            <Route path="/compte" element={
              <>
                <Navbar currentPath="/compte" />
                <ComptePage />
                <Footer />
                <SoundControl />
                <FloatingCart />
              </>
            } />
          </Routes>
        </Suspense>
      </Router>
    </CartProvider>
  );
}

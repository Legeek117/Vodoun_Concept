import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CartProvider } from './store';
import Navbar from './components/Navbar';
import SoundControl from './components/SoundControl';
import FloatingCart from './components/FloatingCart';
import ScrollToTop from './components/ScrollToTop';
import GlobalLoader from './components/GlobalLoader';
import NavigationTransition from './components/NavigationTransition';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';

const App            = lazy(() => import('./App'));
const CinematicEntrance = lazy(() => import('./components/CinematicEntrance'));
const ShopPage       = lazy(() => import('./pages/ShopPage'));
const ProductPage3D  = lazy(() => import('./pages/ProductPage3D'));
const ContactPage    = lazy(() => import('./pages/ContactPage'));
const AboutPage      = lazy(() => import('./pages/AboutPage'));
const B2BPage        = lazy(() => import('./pages/B2BPage'));
const PantheonPage   = lazy(() => import('./pages/PantheonPage'));
const ComptePage     = lazy(() => import('./pages/ComptePage'));
const AdminPage      = lazy(() => import('./pages/admin/AdminPage'));

/**
 * Layout partagé — évite de répéter Navbar/Footer/SoundControl/FloatingCart
 * sur chaque route, et garantit un wrapper cohérent pour toutes les pages.
 */
function PageLayout({ children, currentPath, withNav = true }) {
  return (
    <>
      {withNav && <Navbar currentPath={currentPath} />}
      {children}
      <Footer />
      <SoundControl />
      <FloatingCart />
    </>
  );
}

/**
 * AppRoutes — monté à l'intérieur du Router, peut donc utiliser useLocation.
 * NavigationTransition est ici pour la même raison.
 */
function AppRoutes() {
  return (
    <>
      {/* Reset scroll + kill ScrollTriggers à chaque changement de route */}
      <ScrollToTop />

      {/*
        Overlay de transition inter-pages.
        Monté en dehors de Suspense pour qu'il soit toujours disponible,
        même quand un chunk lazy est en cours de chargement.
      */}
      <NavigationTransition />

      {/*
        Suspense wraps all lazy routes.
        GlobalLoader sert de fallback lors du PREMIER chargement d'un chunk
        (hard refresh, ouverture directe d'une URL).
        Les navigations suivantes sont couvertes par NavigationTransition.
      */}
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          <Route path="/" element={<CinematicEntrance />} />

          <Route
            path="/accueil"
            element={
              <PageLayout currentPath="/accueil">
                <App />
              </PageLayout>
            }
          />

          <Route
            path="/boutique"
            element={
              <PageLayout currentPath="/boutique">
                <ShopPage />
              </PageLayout>
            }
          />

          <Route
            path="/boutique/:collectionId"
            element={
              <PageLayout currentPath="/boutique">
                <ShopPage />
              </PageLayout>
            }
          />

          {/* Page produit : pas de Navbar standard (ProductPage3D a son propre header) */}
          <Route
            path="/boutique/produit/:productId"
            element={
              <PageLayout currentPath="/boutique" withNav={false}>
                <ProductPage3D />
              </PageLayout>
            }
          />

          <Route
            path="/contact"
            element={
              <PageLayout currentPath="/contact">
                <ContactPage />
              </PageLayout>
            }
          />

          <Route
            path="/a-propos"
            element={
              <PageLayout currentPath="/a-propos">
                <AboutPage />
              </PageLayout>
            }
          />

          <Route
            path="/projets-pro"
            element={
              <PageLayout currentPath="/projets-pro">
                <B2BPage />
              </PageLayout>
            }
          />

          <Route
            path="/pantheon"
            element={
              <PageLayout currentPath="/pantheon">
                <PantheonPage />
              </PageLayout>
            }
          />

          <Route
            path="/compte"
            element={
              <PageLayout currentPath="/compte">
                <ComptePage />
              </PageLayout>
            }
          />

          {/* Admin — layout indépendant sans Navbar/Footer */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function RootRouter() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </LanguageProvider>
  );
}

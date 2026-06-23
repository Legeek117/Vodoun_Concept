import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './store';
import Navbar from './components/Navbar';
import SoundControl from './components/SoundControl';
import App from './App';
import GameWorld from './components/GameWorld';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';

export default function RootRouter() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GameWorld />} />
          <Route path="/accueil" element={
            <>
              <Navbar />
              <App />
              <SoundControl />
            </>
          } />
          <Route path="/boutique" element={
            <>
              <Navbar />
              <ShopPage />
              <SoundControl />
            </>
          } />
          <Route path="/boutique/:collectionId" element={
            <>
              <Navbar />
              <ShopPage />
              <SoundControl />
            </>
          } />
          <Route path="/boutique/produit/:productId" element={
            <>
              <Navbar />
              <ProductPage />
              <SoundControl />
            </>
          } />
          <Route path="/panier" element={
            <>
              <Navbar />
              <CartPage />
              <SoundControl />
            </>
          } />
        </Routes>
      </Router>
    </CartProvider>
  );
}

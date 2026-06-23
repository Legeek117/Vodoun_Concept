import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('vodoun-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vodoun-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && JSON.stringify(item.options) === JSON.stringify(options)
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && JSON.stringify(item.options) === JSON.stringify(options)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, options, cartId: Date.now() }];
    });
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.cartId === cartId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export const ALL_PRODUCTS = [
  {
    id: 'le-veilleur',
    name: 'Le Veilleur',
    category: 'Décorations Festives',
    collection: 'Univers Legba',
    story: 'Le Veilleur se tient à l’entrée comme une présence bienveillante. Sa partie haute, en métal perforé au laser, projette des vévés de lumière ; sa base de raphia tressé diffuse une lueur chaude et vivante. Aligné le long d’une allée ou posté à un seuil, il accueille, oriente et protège.',
    description: 'Totems de lumière en métal perforé et raphia naturel. H 1m à 3m, personnalisable.',
    price: 150000,
    image: '/Le veilleur.png',
    deity: 'Legba',
    available: true,
    variants: ['1m', '2m', '3m'],
  },
  {
    id: 'la-pluie-de-cauris',
    name: 'La Pluie de Cauris',
    category: 'Décorations Festives',
    collection: 'Univers Mami Wata',
    story: 'Ni mur, ni vide : un voile. La Pluie de cauris tombe du plafond en rideaux scintillants qui séparent sans cloisonner. Modulaire, elle s’étire en ligne ou tourne à l’angle pour dessiner des espaces : un salon dans un hall, une scène dans une salle, une vitrine dans la ville.',
    description: 'Cloisons de lumière en cauris, fils d’or et micro-LED. Modulaire et sur mesure.',
    price: 250000,
    image: '/La pluie de cauris.png',
    deity: 'Mami Wata',
    available: true,
    variants: ['2m', '5m', '10m'],
  },
  {
    id: 'les-perles-de-locean',
    name: 'Les Perles de l’Océan',
    category: 'Décorations Festives',
    collection: 'Univers Mami Wata',
    story: 'Chaque perle est un océan condensé : des cauris sertis d’or autour d’un cœur de lumière. Déclinées du diamètre d’un fruit à celui d’une lune, Les Perles de l’Océan se suspendent en grappes ou se posent en majesté sur socle, pour signer halls, vitrines et salons d’une élégance rituelle.',
    description: 'Boules lumineuses de cauris, suspendues ou sur socle.',
    price: 35000,
    image: '/Les perles de l\'océan.png',
    deity: 'Mami Wata',
    available: true,
    variants: ['Ø20', 'Ø40', 'Ø80', 'Ø120'],
  },
  {
    id: 'cristal-de-la-prosperite',
    name: 'Cristal de la Prospérité',
    category: 'Décorations Festives',
    collection: 'Univers Sakpata',
    story: 'Petite par la taille, grande par le sens. Le Cristal de la Prospérité enferme de vrais cauris et des vévés dorés dans une sphère de verre transparent : un vœu d’abondance que l’on suspend au sapin, à une vitrine, ou que l’on offre. Le cadeau d’entreprise qui porte une intention.',
    description: 'Sphère décorative en verre et cauris : symbole d’abondance.',
    price: 18000,
    image: '/Cristal de la prospérité.png',
    deity: 'Sakpata',
    available: true,
    variants: ['S', 'L'],
  },
  {
    id: 'la-couronne-de-loracle',
    name: 'La Couronne de l’Oracle',
    category: 'Décorations Festives',
    collection: 'Univers Legba',
    story: 'Sur une porte, une vitrine ou un mur, la Couronne de l’Oracle annonce la fête tout en racontant une histoire. Cercle de cauris serrés : symbole de prospérité et de protection : elle remplace la couronne de houx par un emblème né du golfe de Guinée. Un cercle qui dit : ici, l’abondance est bienvenue.',
    description: 'Couronne de cauris : l’accueil festif du seuil.',
    price: 42000,
    image: '/La courone de l\'oracle.png',
    deity: 'Legba',
    available: true,
    variants: ['Ø50', 'Ø80'],
  },
  {
    id: 'le-nuage-de-cauris',
    name: 'Le Nuage de Cauris',
    category: 'Décorations Festives',
    collection: 'Univers Mami Wata',
    story: 'Imaginez un nuage descendu se poser dans un salon. Le Nuage de cauris est une suspension organique faite de centaines de coquillages nacrés qui captent et diffusent une lumière douce. Seul, il devient pièce maîtresse ; en archipel, il dessine un ciel intérieur suspendu au-dessus de vos invités.',
    description: 'Suspensions sculpturales en cauris, en forme de nuages de lumière.',
    price: 180000,
    image: '/Le nuage de cauris.png',
    deity: 'Mami Wata',
    available: true,
    variants: ['S', 'M', 'XL'],
  },
  {
    id: 'la-voute-celeste',
    name: 'La Voûte Céleste',
    category: 'Décorations Festives',
    collection: 'Univers Mami Wata',
    story: 'Le cauris fut monnaie, parure et oracle. Suspendu par milliers, il devient ici un ciel. La Voûte céleste tapisse un plafond entier de fils de cauris lumineux et compose une canopée scintillante au-dessus des halls et des réceptions. On ne traverse pas cet espace : on entre sous une voûte d’abondance.',
    description: 'Installations lumineuses grand format en cauris.',
    price: 550000,
    image: '/La Voute céleste.png',
    deity: 'Mami Wata',
    available: true,
    variants: ['Sur mesure'],
  },
  {
    id: 'le-sentinelle',
    name: 'Le Sentinelle',
    category: 'Décorations Festives',
    collection: 'Univers Legba',
    story: 'Gardiens de nuit du patrimoine Vodun, les Sentinelles veillaient autrefois sur les passages et les seuils. La collection les réimagine en sculptures lumineuses monumentales : des cascades de fils teints : rouge, or, indigo, turquoise : qui s’embrasent à la tombée du jour. Posées en allée ou en duo, elles transforment une place ou une galerie marchande en théâtre de lumière.',
    description: 'Lanternes festives multicolores inspirées des masques traditionnels.',
    price: 120000,
    image: '/Le Sentinelle.png',
    deity: 'Legba',
    available: true,
    variants: ['1.5m', '2m'],
  },
  {
    id: 'lanternes-ceremoniales',
    name: 'Lanternes Cérémonielles',
    category: 'Décorations Festives',
    collection: 'Univers Legba',
    story: 'Suspendues en guirlandes au-dessus d’une place ou d’un marché, les Lanternes Cérémonielles ravivent l’esprit de fête. Chaque lanterne porte un visage : masque stylisé percé de lumière : dans des coloris vifs : rouge, vert, indigo, or, blanc. La nuit, elles dessinent un ciel de visages bienveillants au-dessus de la foule.',
    description: 'Lanternes festives multicolores inspirées des masques traditionnels.',
    price: 25000,
    image: '/Lanternes Cérémonielles.png',
    deity: 'Legba',
    available: true,
    variants: ['Set de 3', 'Set de 6', 'Set de 12'],
  },
  {
    id: 'le-rideau-patrimoine',
    name: 'Le Rideau Patrimoine',
    category: 'Décorations Festives',
    collection: 'Tous',
    story: 'Quand une marque ou une nation veut inscrire son identité dans la lumière, le Rideau Patrimoine répond. Façades de cauris et de fils d’or, vévés monumentaux dessinés en LED, symboles qui s’allument à la nuit : c’est une œuvre architecturale autant qu’une décoration. Une signature de prestige pour sièges sociaux, hôtels et ambassades culturelles.',
    description: 'Installations sur mesure, symboles Vodun illuminés, grand format.',
    price: 850000,
    image: '/Le Rideau Patrimoine.png',
    deity: 'Tous',
    available: true,
    variants: ['Sur devis'],
  },
  {
    id: 't-shirt-sérigraphié',
    name: 'T-shirt Sérigraphié Vévé',
    category: 'Mode',
    collection: 'Tous',
    story: 'Porter le sacré au quotidien. Chaque t-shirt est une toile : un vévé sérigraphié à l’or ou en ton-sur-ton, tiré des symboles du panthéon. Coupe contemporaine, coton lourd (220g/m²), et une collection par divinité pour choisir son signe autant que son style.',
    description: 'Coton 220g/m², motifs vévés, collections par divinités.',
    price: 8000,
    image: '/T-shirts sérigraphiés.png',
    deity: 'Tous',
    available: true,
    variants: ['XS', 'S', 'M', 'L', 'XL', '3XL'],
  },
  {
    id: 'casquettes-headwear',
    name: 'Casquettes & Headwear',
    category: 'Mode',
    collection: 'Tous',
    story: 'La tête se couronne aussi. Des casquettes et headwear premium alliant tradition et modernité. Matériaux nobles, finitions artisanales et symboles ancestraux pour un style unique.',
    description: 'Casquettes premium, finitions artisanales, symboles Vodun.',
    price: 15000,
    image: '/Casquettes & Headwear.png',
    deity: 'Tous',
    available: true,
    variants: ['Unique'],
  },
  {
    id: 'bucket-hat-wax',
    name: 'Bucket Hat Wax Premium',
    category: 'Mode',
    collection: 'Tous',
    story: 'La tête se couronne aussi. Bucket hat en wax premium béninois, motifs géométriques Vodun, doublure soie, édition numérotée. Un vestiaire de tête qui passe du street au cérémoniel sans changer d’âme.',
    description: 'Tissu wax premium, motifs géométriques Vodun, doublure soie.',
    price: 12000,
    image: '/Casquettes & Headwear.png',
    deity: 'Tous',
    available: true,
    variants: ['S/M', 'L/XL'],
  },
  {
    id: 'montre-artisanale',
    name: 'Montre Artisanale Vodun',
    category: 'Accessoires',
    collection: 'Tous',
    story: 'Le temps, gravé dans le bois du Bénin. Chaque montre est une pièce numérotée : boîtier en bois local ou métal forgé, cadran orné d’un vévé, bracelet en cuir tanné ou raphia tressé. Au dos, votre gravure. Un objet qui se transmet.',
    description: 'Boîtier bois ou métal forgé, cadran vévé, éditions numérotées.',
    price: 65000,
    image: '/Montres Artisanales.png',
    deity: 'Tous',
    available: true,
    variants: ['Bois', 'Métal'],
  },
  {
    id: 'bracelet-puissance',
    name: 'Bracelet de Puissance',
    category: 'Accessoires',
    collection: 'Par divinité',
    story: 'Un bracelet Vodun n’est pas un bijou. C’est une protection. Perles Asso aux couleurs codées par divinité, ou joncs en bronze coulé à l’ancienne. Chaque bracelet est livré with son certificat de symbolique.',
    description: 'Perles Asso couleurs codées ou bronze coulé, with certificat.',
    price: 3500,
    image: '/Bracelets de puissance.png',
    video: '/b19e787ca1fc41728cd6725092ba5736.mp4',
    deity: 'Tous',
    available: true,
    variants: ['Dan', 'Legba', 'Sakpata', 'Mami Wata'],
  },
  {
    id: 'maroquinerie-sacoches',
    name: 'Maroquinerie & Sacoches',
    category: 'Accessoires',
    collection: 'Tous',
    story: 'L\'élégance du cuir rencontrant l\'artisanat béninois. Des sacoches et accessoires de maroquinerie conçus pour durer, marqués de l\'empreinte Vodun pour une identité forte au quotidien.',
    description: 'Cuir véritable, tannage artisanal, motifs gravés.',
    price: 45000,
    image: '/Maroquinerie & sacoches.png',
    deity: 'Tous',
    available: true,
    variants: ['Petit', 'Moyen', 'Grand'],
  },
  {
    id: 'mobilier-residentiel',
    name: 'Mobilier Résidentiel',
    category: 'Mobilier',
    collection: 'Tous',
    story: 'Le mobilier Vodun Concept transforme votre intérieur en un sanctuaire moderne. Pièces de bois précieux et design contemporain, chaque meuble raconte une part de notre héritage.',
    description: 'Bois précieux, design contemporain, héritage culturel.',
    price: 450000,
    image: '/Mobilier Résidentiel.png',
    deity: 'Tous',
    available: true,
    variants: ['Standard', 'Sur mesure'],
  },
  {
    id: 'le-trone-de-direction',
    name: 'Le Trône de Direction',
    category: 'Mobilier',
    collection: 'Tous',
    story: 'Inspiré des trônes royaux d\'Abomey, ce fauteuil de bureau allie prestige et confort ergonomique. Pour ceux qui dirigent avec sagesse et vision.',
    description: 'Fausteuil de bureau prestige, bois sculpté et cuir.',
    price: 750000,
    image: '/Le trône de direction.png',
    deity: 'Tous',
    available: true,
    variants: ['Premium'],
  },
  {
    id: 'luminaires-led',
    name: 'Luminaires Sacrés LED',
    category: 'Décorations Festives',
    collection: 'Tous',
    story: 'La technologie LED au service du sacré. Des installations lumineuses modulaires utilisant des LED de haute qualité pour créer des ambiances mystiques et protectrices dans vos espaces.',
    description: 'Systèmes LED programmables, basse consommation, design rituel.',
    price: 85000,
    image: '/Led.png',
    deity: 'Tous',
    available: true,
    variants: ['Unique'],
  },
];

export const COLLECTIONS = [
  { id: 'decorations-festives', name: 'Décorations Festives', deity: null },
  { id: 'mode', name: 'Mode', deity: null },
  { id: 'accessoires', name: 'Accessoires', deity: null },
  { id: 'dan', name: 'Univers Dan', deity: 'Dan' },
  { id: 'legba', name: 'Univers Legba', deity: 'Legba' },
  { id: 'sakpata', name: 'Univers Sakpata', deity: 'Sakpata' },
  { id: 'mami-wata', name: 'Univers Mami Wata', deity: 'Mami Wata' },
  { id: 'mobilier', name: 'Mobilier', deity: null },
];

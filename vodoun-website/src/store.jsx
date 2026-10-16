/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { apiGetProducts } from "./api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("VODUN-cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Catalogue : chargé depuis la BDD (API), fallback sur les données locales
  const [products, setProducts] = useState(ALL_PRODUCTS);

  useEffect(() => {
    let active = true;
    apiGetProducts()
      .then((list) => {
        if (active && Array.isArray(list) && list.length) {
          // Fusionner les données API avec story_en du catalogue local
          const merged = list.map((apiProduct) => {
            const local = ALL_PRODUCTS.find((p) => p.id === apiProduct.id);
            return local ? { ...apiProduct, story_en: local.story_en } : apiProduct;
          });
          setProducts(merged);
        }
      })
      .catch(() => { /* hors-ligne : on garde le fallback local avec story_en */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem("VODUN-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          JSON.stringify(item.options) === JSON.stringify(options),
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id &&
            JSON.stringify(item.options) === JSON.stringify(options)
            ? { ...item, quantity: item.quantity + quantity }
            : item,
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
          item.cartId === cartId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        products,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export const useProducts = () => useContext(CartContext).products;

export const ALL_PRODUCTS = [
  {
    id: "le-veilleur",
    name: `Le Veilleur`,
    category: "Décorations Festives",
    collection: "Univers Legba",
    story: `Le Veilleur se tient à l'entrée comme une présence bienveillante. Sa partie haute, en métal perforé au laser, projette des vévés de lumière ; sa base de raphia tressé diffuse une lueur chaude et vivante. Aligné le long d'une allée ou posté à un seuil, il accueille, oriente et protège.`,
    story_en: `The Veilleur stands at the entrance like a benevolent presence. Its upper part, in laser-perforated metal, projects vévé patterns of light; its braided raphia base diffuses a warm, living glow. Lined along an alley or posted at a threshold, it welcomes, guides and protects.`,
    description: `Totems de lumière en métal perforé et raphia naturel. H 1m à 3m, personnalisable.`,
    price: 150000,
    image: "/Le veilleur.webp",
    deity: "Legba",
    available: true,
    variants: ["1m — Dan","1m — Legba","2m — Dan","2m — Legba","3m — Dan","3m — Legba"],
    delay: "3 à 5 semaines",
    isCustomOrder: true,
  },
  {
    id: "la-pluie-de-cauris",
    name: `La Pluie de Cauris`,
    category: "Décorations Festives",
    collection: "Univers Mami Wata",
    story: `Ni mur, ni vide : un voile. La Pluie de cauris tombe du plafond en rideaux scintillants qui séparent sans cloisonner. Modulaire, elle s'étire en ligne ou tourne à l'angle pour dessiner des espaces : un salon dans un hall, une scène dans une salle, une vitrine dans la ville.`,
    story_en: `Neither wall nor void: a veil. The Rain of Cowries falls from the ceiling in shimmering curtains that separate without partitioning. Modular, it stretches in a line or turns a corner to create spaces: a lounge in a hall, a stage in a room, a window display in the city.`,
    description: `Cloisons de lumière en cauris, fils d'or et micro- LED.Modulaire et sur mesure.`,
    price: 250000,
    image: "/La pluie de cauris.webp",
    deity: "Mami Wata",
    available: true,
    variants: ["2m — Or","2m — Noir Mat","2m — Bois Naturel","5m — Or","5m — Noir Mat","10m — Or"],
    delay: "4 à 6 semaines",
    isCustomOrder: true,
  },
  {
    id: "les-perles-de-locean",
    name: `Les Perles de l'Océan`,
    category: "Décorations Festives",
    collection: "Univers Dan",
    story: `Chaque perle est un océan condensé : des cauris sertis d'or autour d'un cœur de lumière. Déclinées du diamètre d'un fruit à celui d'une lune, Les Perles de l'Océan se suspendent en grappes ou se posent en majesté sur socle, pour signer halls, vitrines et salons d'une élégance rituelle.`,
    story_en: `Each pearl is a condensed ocean: cowrie shells set in gold around a core of light. Ranging from the diameter of a fruit to that of a moon, the Pearls of the Ocean hang in clusters or rest majestically on stands, signing halls, windows and lounges with ritual elegance.`,
    description: `Boules lumineuses de cauris, suspendues ou sur socle.`,
    price: 35000,
    image: "/Les perles de l'océan.webp",
    deity: "Dan",
    available: true,
    variants: ["Ø20 (suspendu)","Ø40 (suspendu)","Ø80 (suspendu)","Ø80 (sur socle)","Ø120 (sur socle)"],
    delay: "2 à 3 semaines",
    isCustomOrder: false,
  },
  {
    id: "cristal-de-la-prosperite",
    name: `Cristal de la Prospérité`,
    category: "Décorations Festives",
    collection: "Univers Sakpata",
    story: `Petite par la taille, grande par le sens. Le Cristal de la Prospérité enferme de vrais cauris et des vévés dorés dans une sphère de verre transparent : un vœu d'abondance que l'on suspend au sapin, à une vitrine, ou que l'on offre. Le cadeau d'entreprise qui porte une intention.`,
    story_en: `Small in size, great in meaning. The Crystal of Prosperity encloses real cowrie shells and golden vévés in a transparent glass sphere: a wish of abundance to hang on a tree, a window, or to give as a gift. The corporate gift that carries an intention.`,
    description: `Sphère décorative en verre et cauris : symbole d'abondance.`,
    price: 18000,
    image: "/Cristal de la prospérité.webp",
    deity: "Sakpata",
    available: true,
    variants: ["S", "L"],
    delay: "1 à 2 semaines",
    isCustomOrder: false,
  },
  {
    id: "la-couronne-de-loracle",
    name: `La Couronne de l'Oracle`,
    category: "Décorations Festives",
    collection: "Univers Legba",
    story: `Sur une porte, une vitrine ou un mur, la Couronne de l'Oracle annonce la fête tout en racontant une histoire. Cercle de cauris serrés, symbole de prospérité et de protection, elle remplace la couronne de houx par un emblème né du golfe de Guinée. Un cercle qui dit : ici, l'abondance est bienvenue.`,
    story_en: `On a door, a window or a wall, the Oracle's Crown announces celebration while telling a story. A circle of tightly packed cowrie shells, symbol of prosperity and protection, it replaces the holly wreath with an emblem born from the Gulf of Guinea. A circle that says: here, abundance is welcome.`,
    description: `Couronne de cauris : l'accueil festif du seuil.`,
    price: 42000,
    image: "/La courone de l'oracle.webp",
    deity: "Legba",
    available: true,
    variants: ["Ø50", "Ø80"],
    delay: "1 à 2 semaines",
    isCustomOrder: false,
  },
  {
    id: "le-nuage-de-cauris",
    name: `Le Nuage de Cauris`,
    category: "Décorations Festives",
    collection: "Univers Mami Wata",
    story: `Imaginez un nuage descendu se poser dans un salon. Le Nuage de cauris est une suspension organique faite de centaines de coquillages nacrés qui captent et diffusent une lumière douce. Seul, il devient pièce maîtresse ; en archipel, il dessine un ciel intérieur suspendu au-dessus de vos invités.`,
    story_en: `Imagine a cloud descending into a living room. The Cloud of Cowries is an organic pendant made of hundreds of pearlescent shells that capture and diffuse soft light. Alone, it becomes a centrepiece; in an archipelago, it draws an indoor sky suspended above your guests.`,
    description: `Suspensions sculpturales en cauris, en forme de nuages de lumière.`,
    price: 180000,
    image: "/Le nuage de cauris.webp",
    deity: "Mami Wata",
    available: true,
    variants: ["S", "M", "XL"],
    delay: "3 à 4 semaines",
    isCustomOrder: false,
  },
  {
    id: "la-voute-celeste",
    name: `La Voûte Céleste`,
    category: "Décorations Festives",
    collection: "Univers Mami Wata",
    story: `Le cauris fut monnaie, parure et oracle. Suspendu par milliers, il devient ici un ciel. La Voûte céleste tapisse un plafond entier de fils de cauris lumineux et compose une canopée scintillante au-dessus des halls et des réceptions. On ne traverse pas cet espace : on entre sous une voûte d'abondance.`,
    story_en: `The cowrie shell was currency, adornment and oracle. Suspended by the thousands, it becomes a sky here. The Celestial Vault covers an entire ceiling with luminous cowrie threads and composes a shimmering canopy above halls and reception rooms. You don't cross this space: you enter beneath a vault of abundance.`,
    description: `Installations lumineuses grand format en cauris.`,
    price: 550000,
    image: "/La Voute céleste.webp",
    deity: "Mami Wata",
    available: true,
    variants: ["Sur mesure"],
    delay: "6 à 8 semaines",
    isCustomOrder: true,
  },
  {
    id: "le-sentinelle",
    name: `Le Sentinelle`,
    category: "Décorations Festives",
    collection: "Univers Legba",
    story: `Gardiens de nuit du patrimoine Vodun, les Sentinelles veillaient autrefois sur les passages et les seuils. La collection les réimagine en sculptures lumineuses monumentales : des cascades de fils teints rouge, or, indigo, turquoise qui s'embrasent à la tombée du jour. Posées en allée ou en duo, elles transforment une place ou une galerie marchande en théâtre de lumière.`,
    story_en: `Night guardians of the Vodun heritage, the Sentinels once watched over passages and thresholds. The collection reimagines them as monumental luminous sculptures: cascades of dyed threads in red, gold, indigo, turquoise that ignite at dusk. Placed in an alley or as a duo, they transform a square or shopping gallery into a theatre of light.`,
    description: `Lanternes festives multicolores inspirées des masques traditionnels.`,
    price: 120000,
    image: "/Le Sentinelle.webp",
    deity: "Legba",
    available: true,
    variants: ["1.5m", "2m"],
    delay: "2 à 4 semaines",
    isCustomOrder: false,
  },
  {
    id: "lanternes-ceremoniales",
    name: `Lanternes Cérémonielles`,
    category: "Décorations Festives",
    collection: "Univers Xevioso",
    story: `Suspendues en guirlandes au-dessus d'une place ou d'un marché, les Lanternes Cérémonielles ravivent l'esprit de fête. Chaque lanterne porte un visage : masque stylisé percé de lumière, dans des coloris vifs rouge, vert, indigo, or, blanc. La nuit, elles dessinent un ciel de visages bienveillants au-dessus de la foule.`,
    story_en: `Hung in garlands above a square or market, the Ceremonial Lanterns revive the spirit of celebration. Each lantern bears a face: a stylised mask pierced with light, in vivid red, green, indigo, gold and white. At night, they draw a sky of benevolent faces above the crowd.`,
    description: `Lanternes festives multicolores inspirées des masques traditionnels.`,
    price: 25000,
    image: "/Lanternes Cérémonielles.webp",
    deity: "Xevioso",
    available: true,
    variants: ["Set de 3", "Set de 6", "Set de 12"],
    delay: "1 semaine",
    isCustomOrder: false,
  },
  {
    id: "le-rideau-patrimoine",
    name: `Le Rideau Patrimoine`,
    category: "Décorations Festives",
    collection: "Tous",
    story: `Quand une marque ou une nation veut inscrire son identité dans la lumière, le Rideau Patrimoine répond. Façades de cauris et de fils d'or, vévés monumentaux dessinés en LED, symboles qui s'allument à la nuit : c'est une œuvre architecturale autant qu'une décoration. Une signature de prestige pour sièges sociaux, hôtels et ambassades culturelles.`,
    story_en: `When a brand or nation wants to inscribe its identity in light, the Heritage Curtain answers. Facades of cowrie shells and gold threads, monumental vévés drawn in LED, symbols that light up at night: it is an architectural work as much as a decoration. A prestige signature for headquarters, hotels and cultural embassies.`,
    description: `Installations sur mesure, symboles Vodun illuminés, grand format.`,
    price: 850000,
    image: "/Le Rideau Patrimoine.webp",
    deity: "Tous",
    available: true,
    variants: ["Sur devis"],
    delay: "Sur devis (projet architectural)",
    isCustomOrder: true,
  },
  {
    id: "t-shirt-sérigraphié",
    name: `T-shirt Sérigraphié Vévé`,
    category: "Mode",
    collection: "Tous",
    story: `Porter le sacré au quotidien. Chaque t-shirt est une toile : un vévé sérigraphié à l'or ou en ton-sur-ton, tiré des symboles du panthéon. Coupe contemporaine, coton lourd 220g/m², et une collection par divinité pour choisir son signe autant que son style.`,
    story_en: `Wearing the sacred every day. Each t-shirt is a canvas: a vévé screen-printed in gold or tone-on-tone, drawn from the symbols of the pantheon. Contemporary cut, heavy 220g/m² cotton, and a collection by deity to choose your sign as much as your style.`,
    description: `Coton 220g/m², motifs vévés, collections par divinités.`,
    price: 8000,
    image: "/T-shirts sérigraphiés.webp",
    deity: "Tous",
    available: true,
    variants: ["XS", "S", "M", "L", "XL", "3XL"],
    delay: "En stock · 3 à 5 jours",
    isCustomOrder: false,
  },
  {
    id: "dad-hat-brode",
    name: `Dad Hat brodé`,
    category: "Mode",
    collection: "Tous",
    story: `La tête se couronne aussi. Coton brossé 6 panneaux, broderie vévé ton-sur-ton. Un vêtement discret qui porte subtilement les valeurs et le signe de votre divinité.`,
    story_en: `The head is crowned too. 6-panel brushed cotton, tone-on-tone vévé embroidery. A discreet garment that subtly carries the values and sign of your deity.`,
    description: `Coton brossé 6 panneaux, broderie vévé ton-sur-ton.`,
    price: 8000,
    image: "/Casquettes & Headwear.webp",
    deity: "Tous",
    available: true,
    variants: ["Taille Unique"],
    delay: "En stock · 3 à 5 jours",
    isCustomOrder: false,
  },
  {
    id: "5-panel-classic",
    name: `5-Panel classic`,
    category: "Mode",
    collection: "Tous",
    story: `Urbain et identitaire. Logo brodé en or véritable, fermeture arrière avec encoche en laiton lourd gravée au symbole de la marque. Une casquette 5 panneaux à l'allure résolument premium.`,
    story_en: `Urban and identity-driven. Logo embroidered in real gold, rear closure with a heavy brass notch engraved with the brand symbol. A 5-panel cap with a resolutely premium look.`,
    description: `Logo brodé or, fermeture laiton gravé du symbole de la marque.`,
    price: 9000,
    image: "/Casquettes & Headwear.webp",
    deity: "Tous",
    available: true,
    variants: ["Taille Unique"],
    delay: "En stock · 3 à 5 jours",
    isCustomOrder: false,
  },
  {
    id: "kufi-premium",
    name: `Kufi premium`,
    category: "Mode",
    collection: "Tous",
    story: `L'icône des gardiens du rituel. Tissu local wax revisité avec subtilité, doublure en pur satin noir pour préserver le cheveu, ce couvre-chef traditionnel se porte fier. Édition limitée signée.`,
    story_en: `The icon of ritual guardians. Locally-sourced wax fabric subtly revisited, pure black satin lining to protect hair, this traditional headwear is worn with pride. Signed limited edition.`,
    description: `Tissu local wax, doublure satin noir, édition limitée signée.`,
    price: 15000,
    image: "/Casquettes & Headwear.webp",
    deity: "Tous",
    available: true,
    variants: ["S/M", "L/XL"],
    delay: "En stock · 3 à 5 jours",
    isCustomOrder: false,
  },
  {
    id: "bucket-hat-wax",
    name: `Bucket Hat Wax Premium`,
    category: "Mode",
    collection: "Tous",
    story: `La tête se couronne aussi. Bucket hat en wax premium béninois, motifs géométriques Vodun, doublure soie, édition numérotée. Un vestiaire de tête qui passe du street au cérémoniel sans changer d'âme.`,
    story_en: `The head is crowned too. Bucket hat in premium Beninese wax, Vodun geometric patterns, silk lining, numbered edition. A headwear that moves from street to ceremonial without changing its soul.`,
    description: `Tissu wax premium, motifs géométriques Vodun, doublure soie.`,
    price: 12000,
    image: "/Casquettes & Headwear.webp",
    deity: "Tous",
    available: true,
    variants: ["S/M", "L/XL"],
    delay: "En stock · 3 à 5 jours",
    isCustomOrder: false,
  },
  {
    id: "chemises-col-mao",
    name: `Chemises Col Mao`,
    category: "Mode",
    collection: "Tous",
    story: `L'élégance posée. La chemise col mao réinterprète le vestiaire formel avec des broderies géométriques tirées des vévés et des boutons de bois tournés. À porter au bureau comme en cérémonie : l'identité Vodun, dans sa version habillée.`,
    story_en: `Quiet elegance. The Mao collar shirt reinterprets formal wear with geometric embroideries drawn from vévés and turned wooden buttons. To wear at the office or at ceremonies: the Vodun identity, in its dressed-up version.`,
    description: `Col mao, broderies géométriques, boutons bois.`,
    price: 35000,
    image: "/T-shirts sérigraphiés.webp",
    deity: "Tous",
    available: true,
    variants: ["S", "M", "L", "XL"],
    delay: "2 à 3 semaines",
    isCustomOrder: false,
  },
  {
    id: "decorations-presences",
    name: `Présences (Décoration)`,
    category: "Décoration",
    collection: "Tous",
    story: `Ces objets ne meublent pas un espace. Ils l'habitent. Masques contemporains, bas-reliefs peints, sculptures Bocio originales, textiles muraux en fibres locales, miroirs encadrés de symboles : chaque objet décoratif porte le geste de l'artisan et la charge du symbole. Des œuvres à vivre, pas seulement à regarder.`,
    story_en: `These objects do not furnish a space. They inhabit it. Contemporary masks, painted bas-reliefs, original Bocio sculptures, wall textiles in local fibres, mirrors framed with symbols: each decorative object carries the artisan's gesture and the weight of the symbol. Works to live with, not just to look at.`,
    description: `Masques, sculptures, textiles muraux. Œuvres d'art décoratives.`,
    price: 85000,
    image: "/Mobilier Résidentiel.webp",
    deity: "Tous",
    available: true,
    variants: ["Masque contemporain","Bas-relief peint","Sculpture Bocio","Textile mural","Miroir gravé"],
    delay: "4 à 6 semaines",
    isCustomOrder: true,
  },
  {
    id: "montre-artisanale",
    name: `Montre Artisanale Vodun`,
    category: "Accessoires",
    collection: "Tous",
    story: `Le temps, gravé dans le bois du Bénin. Chaque montre est une pièce numérotée : boîtier en bois local ou métal forgé, cadran orné d'un vévé, bracelet en cuir tanné ou raphia tressé. Au dos, votre gravure. Un objet qui se transmet.`,
    story_en: `Time, engraved in the wood of Benin. Each watch is a numbered piece: case in local wood or forged metal, dial adorned with a vévé, strap in tanned leather or braided raphia. On the back, your engraving. An object to be passed down.`,
    description: `Boîtier bois ou métal forgé, cadran vévé, éditions numérotées.`,
    price: 65000,
    image: "/Montres Artisanales.webp",
    deity: "Tous",
    available: true,
    variants: ["Bois + Cuir","Bois + Raphia","Métal + Cuir","Métal + Raphia"],
    delay: "3 à 4 semaines · Gravure personnalisée incluse",
    isCustomOrder: true,
    isNumbered: true,
  },
  {
    id: "bracelet-puissance",
    name: `Bracelet de Puissance`,
    category: "Accessoires",
    collection: "Par divinité",
    story: `Un bracelet Vodun n'est pas un bijou. C'est une protection. Perles Asso aux couleurs codées par divinité, ou joncs en bronze coulé à l'ancienne. Chaque bracelet est livré avec son certificat de symbolique.`,
    story_en: `A Vodun bracelet is not jewellery. It is protection. Asso beads in deity-coded colours, or traditionally cast bronze bangles. Each bracelet comes with its certificate of symbolism.`,
    description: `Perles Asso couleurs codées ou bronze coulé, avec certificat.`,
    price: 3500,
    image: "/Bracelets de puissance.webp",
    video: "/b19e787ca1fc41728cd6725092ba5736.mp4",
    deity: "Tous",
    available: true,
    variants: ["Perles Asso — Dan","Perles Asso — Legba","Perles Asso — Sakpata","Perles Asso — Mami Wata","Joncs Bronze","Cuir & Métal Legba","Lapis-lazuli Dan"],
    delay: "En stock · 3 à 5 jours",
    isCustomOrder: false,
    hasCertificate: true,
  },
  {
    id: "maroquinerie-sacoches",
    name: `Maroquinerie & Sacoches`,
    category: "Accessoires",
    collection: "Tous",
    story: `L'élégance du cuir rencontrant l'artisanat béninois. Des sacoches et accessoires de maroquinerie conçus pour durer, marqués de l'empreinte Vodun pour une identité forte au quotidien.`,
    story_en: `The elegance of leather meeting Beninese craftsmanship. Bags and leather goods designed to last, marked with the Vodun imprint for a strong everyday identity.`,
    description: `Cuir véritable, tannage artisanal, motifs gravés.`,
    price: 45000,
    image: "/Maroquinerie & sacoches.webp",
    deity: "Tous",
    available: true,
    variants: ["Tote bag coton","Pochette cuir","Sacoche bandoulière","Sac cabas raphia","Sacoche Business"],
    delay: "1 à 2 semaines",
    isCustomOrder: false,
  },
  {
    id: "mobilier-residentiel",
    name: `Mobilier Résidentiel`,
    category: "Mobilier",
    collection: "Tous",
    story: `Du mobilier qui se transmet. Sièges sculptés à la pyrogravure, tables aux pieds de fer forgé symbolique, lits à baldaquin forgé, rangements à panneaux sacrés : chaque pièce est en bois massif béninois, pensée pour durer une génération et porter, gravée, la mémoire d'un symbole.`,
    story_en: `Furniture that is passed down. Pyrography-sculpted seats, tables with symbolic forged iron legs, forged canopy beds, storage with sacred panels: each piece is in solid Beninese wood, designed to last a generation and carry, engraved, the memory of a symbol.`,
    description: `Bois massif béninois, pyrogravure, incrustations métal — pièce unique signée.`,
    price: 450000,
    image: "/Mobilier Résidentiel.webp",
    deity: "Tous",
    available: true,
    variants: ["Siège sculpté","Table & Console","Lit & Tête de lit","Rangement"],
    delay: "6 à 10 semaines · Pièce unique signée",
    isCustomOrder: true,
  },
  {
    id: "le-trone-de-direction",
    name: `Le Trône de Direction`,
    category: "Mobilier",
    collection: "Univers Ogou",
    story: `La pièce signature. Bois massif sculpté à la main, laque noire mate et incrustations or, vévés gravés en relief, cuir pleine fleur capitonné : Le Trône de Direction est un fauteuil de pouvoir, pivotant et réglable, fabriqué en pièce unique signée pour durer une génération.`,
    story_en: `The signature piece. Hand-sculpted solid wood, matte black lacquer and gold inlays, vévés engraved in relief, full-grain quilted leather: the Throne of Command is a power chair, swivelling and adjustable, made as a signed unique piece to last a generation.`,
    description: `Bois massif sculpté, laque noire + incrustations or, cuir pleine fleur. Pièce unique signée.`,
    price: 750000,
    image: "/Le trône de direction.webp",
    deity: "Ogou",
    available: true,
    variants: ["Finition Or — Cuir Noir","Finition Or — Cuir Brun"],
    delay: "4 à 6 semaines · Pièce unique signée",
    isCustomOrder: true,
    isNumbered: true,
  },
  {
    id: "suspension-metal-perfore",
    name: `Suspension métal perforé`,
    category: "Décoration",
    collection: "Univers Xevioso",
    story: `Des ombres sacrées sur vos murs. Inspirée des lanternes royales, cette suspension en métal travaillé diffuse la lumière à travers des ornementations percées, tissant des vévés d'ombres et de reflets sur votre intérieur.`,
    story_en: `Sacred shadows on your walls. Inspired by royal lanterns, this worked-metal pendant diffuses light through pierced ornamentation, weaving vévés of shadows and reflections across your interior.`,
    description: `Projette des ombres de vévés, ambiance unique et mémorable.`,
    price: 65000,
    image: "/Led.webp",
    deity: "Xevioso",
    available: true,
    variants: ["Bronze", "Noir mat", "Or patiné"],
    delay: "3 à 5 semaines",
    isCustomOrder: false,
  },
  {
    id: "lampe-raphia-tresse",
    name: `Lampe raphia tressé`,
    category: "Décoration",
    collection: "Tous",
    story: `La chaleur des fibres naturelles locales au service de la lumière sacrée. Fabriquée par nos artisans tresseurs, cet abat-jour enveloppe l'ampoule pour créer une lueur ambrée et très chaleureuse, qui rappelle le couchant de Ouidah.`,
    story_en: `The warmth of local natural fibres in service of sacred light. Made by our weaver artisans, this lampshade wraps the bulb to create an amber, very warm glow reminiscent of the sunset in Ouidah.`,
    description: `Abat-jour en fibres naturelles locales, lumière tamisée chaude.`,
    price: 45000,
    image: "/Led.webp",
    deity: "Tous",
    available: true,
    variants: ["S", "M", "L"],
    delay: "2 à 3 semaines",
    isCustomOrder: false,
  },
  {
    id: "lanterne-bronze",
    name: `Lanterne bronze`,
    category: "Décoration",
    collection: "Tous",
    story: `L'art du métal au service de la foi. De lourdes feuilles de bronze soigneusement découpées au laser suivant des motifs géométriques millénaires. Une édition artisanale de pur prestige pour magnifier vos bougies ou ampoules.`,
    story_en: `The art of metal in service of faith. Heavy bronze sheets carefully laser-cut following millennial geometric patterns. A purely prestigious artisan edition to magnify your candles or bulbs.`,
    description: `Motifs géométriques découpés au laser, édition artisanale bronze.`,
    price: 110000,
    image: "/Led.webp",
    deity: "Tous",
    available: true,
    variants: ["Petit format", "Grand format"],
    delay: "4 semaines",
    isCustomOrder: false,
  },
  {
    id: "bougeoir-sculpte-bois",
    name: `Bougeoir sculpté bois`,
    category: "Décoration",
    collection: "Univers Ogou",
    story: `Dans l'intimité, le feu éclaire la voie. Massif, trapu et élégant, ce bougeoir taillé à même la souche du bois tropical béninois arbore les silhouettes longilignes de nos gardiens tutélaires. Idéal pour accueillir un cierge rituel.`,
    story_en: `In intimacy, fire lights the way. Solid, stocky and elegant, this candlestick carved from Beninese tropical wood bears the elongated silhouettes of our tutelary guardians. Ideal for a ritual candle.`,
    description: `Bois massif béninois, formes symboliques ciselées par la main de l'homme.`,
    price: 25000,
    image: "/Led.webp",
    deity: "Ogou",
    available: true,
    variants: ["Taille unique"],
    delay: "En stock · 2 à 4 jours",
    isCustomOrder: false,
  },
  {
    id: "hotels-restaurants-b2b",
    name: `Hôtels & Restaurants`,
    category: "Mobilier",
    collection: "Tous",
    story: `Habiller votre espace d'une identité africaine d'exception. Un projet d'ambiance complet. Mobilier de salle à motifs vévés, luminaires sur mesure pour lobbies premium, masques de réception, et vaisselle artisanale : un accompagnement design et sourcing de bout en bout pour donner à votre établissement une forte identité culturelle.`,
    story_en: `Dress your space with an exceptional African identity. A complete ambience project. Hall furniture with vévé patterns, custom lighting for premium lobbies, reception masks, and artisanal tableware: end-to-end design and sourcing support to give your establishment a strong cultural identity.`,
    description: `Aménagement sur mesure B2B pour hôtels et restaurants, signature afro-premium.`,
    price: 1500000,
    image: "/Mobilier Résidentiel.webp",
    deity: "Tous",
    available: true,
    variants: ["Sur Devis - Étude architecturale"],
    delay: "Projets architecturaux (Sur étude)",
    isCustomOrder: true,
  },
  {
    id: "bureaux-espaces-commerciaux",
    name: `Bureaux & Commerces`,
    category: "Mobilier",
    collection: "Tous",
    story: `Une marque qui vous ressemble, jusque dans les murs. Du bureau de direction en bois massif noir incrusté d'or au comptoir d'accueil gravé, en passant par la signalétique, nous équipons vos espaces de bureau d'une identité Vodun cohérente.`,
    story_en: `A brand that looks like you, right down to the walls. From the executive desk in black solid wood inlaid with gold to the engraved reception counter, including signage, we equip your office spaces with a coherent Vodun identity.`,
    description: `Aménagement sur mesure B2B (Bureau direction, salle d'attente, accueil).`,
    price: 1200000,
    image: "/Mobilier Résidentiel.webp",
    deity: "Tous",
    available: true,
    variants: ["Sur Devis - Projet sur mesure"],
    delay: "Projets professionnels (Sur étude)",
    isCustomOrder: true,
  }
];

export const COLLECTIONS = [
  { id: "decorations-festives", name: "Décorations Festives", deity: null },
  { id: "mode", name: "Mode", deity: null },
  { id: "accessoires", name: "Accessoires", deity: null },
  { id: "dan", name: "Univers Dan", deity: "Dan" },
  { id: "legba", name: "Univers Legba", deity: "Legba" },
  { id: "sakpata", name: "Univers Sakpata", deity: "Sakpata" },
  { id: "mami-wata", name: "Univers Mami Wata", deity: "Mami Wata" },
  { id: "ogou", name: "Univers Ogou", deity: "Ogou" },
  { id: "xevioso", name: "Univers Xevioso", deity: "Xevioso" },
  { id: "mobilier", name: "Mobilier", deity: null },
];

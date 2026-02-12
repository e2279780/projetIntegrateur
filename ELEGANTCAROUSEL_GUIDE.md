# ElegantCarousel - Guide d'Intégration BiblioConnect

## 📋 Vue d'ensemble

`ElegantCarousel` est un composant carousel professionnel et refactorisé pour BiblioConnect, conçu pour afficher les détails des livres avec une navigation fluide en boucle infinie.

### ✅ Spécifications respectées

- ✅ **Refactoring Props** : Accepte une prop `data` (liste d'objets SlideData)
- ✅ **Navigation en boucle infinie** : Dernière slide → première slide et vice-versa
- ✅ **Adaptation BiblioConnect** : Données liées aux livres (ISBN, Titre, Auteur, Image URL)
- ✅ **Icônes lucide-react** : ChevronLeft, ChevronRight pour la navigation
- ✅ **Conversion Tailwind CSS** : Tous les styles en classes Tailwind (pas de CSS externe)
- ✅ **TypeScript** : Interface `SlideData` correspondant aux attributs Firestore

---

## 🚀 Installation

### 1. Vérifier les dépendances

```bash
npm install lucide-react
# Les autres dépendances sont déjà installées
```

### 2. Utiliser le composant

```jsx
import ElegantCarousel from '../components/ElegantCarousel';
// ou TypeScript:
import ElegantCarousel from '../components/ElegantCarousel.tsx';
```

---

## 📖 API du Composant

### Interface `SlideData`

```typescript
interface SlideData {
  isbn: string;              // ISBN du livre (requis)
  title: string;             // Titre du livre (requis)
  author: string;            // Auteur du livre (requis)
  imageUrl: string;          // URL de l'image/couverture (requis)
  description?: string;      // Description optionnelle
  pages?: number;            // Nombre de pages (optionnel)
  rating?: number;           // Note 1-5 (optionnel)
  category?: string;         // Catégorie (optionnel)
  availableCopies?: number;  // Copies disponibles (optionnel)
}
```

### Props du Composant

```typescript
interface ElegantCarouselProps {
  data: SlideData[];              // Liste des slides (REQUIS)
  className?: string;             // Classes Tailwind additionnelles
  onSlideChange?: (index: number) => void;  // Callback au changement de slide
}
```

---

## 💡 Exemples d'utilisation

### Exemple 1 : Slide simple avec une image

```jsx
<ElegantCarousel
  data={[
    {
      isbn: "978-2-07-036694-1",
      title: "Le Seigneur des Anneaux",
      author: "J.R.R. Tolkien",
      imageUrl: "https://example.com/book.jpg",
      description: "Une épopée fantastique incontournable",
      pages: 1200,
      rating: 4.9,
    }
  ]}
/>
```

### Exemple 2 : Carousel avec plusieurs slides

```jsx
const bookSlides = [
  {
    isbn: "978-2-07-036694-1",
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    imageUrl: "https://example.com/lotr.jpg",
    description: "Une épopée fantastique incontournable",
    pages: 1200,
    rating: 4.9,
    availableCopies: 5,
  },
  {
    isbn: "978-2-253-06532-8",
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    imageUrl: "https://example.com/hp.jpg",
    description: "Le début de la saga Harry Potter",
    pages: 223,
    rating: 4.8,
    availableCopies: 3,
  },
];

<ElegantCarousel 
  data={bookSlides}
  onSlideChange={(index) => console.log(`Slide actuelle: ${index}`)}
/>
```

### Exemple 3 : Intégration dans BookDetail

```jsx
// src/pages/BookDetail.jsx
import ElegantCarousel from '../components/ElegantCarousel';

export default function BookDetail() {
  const [book, setBook] = useState(null);

  // Préparer les données pour le carousel
  const carouselData = book ? [
    {
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      imageUrl: book.coverUrl,
      description: book.description,
      pages: book.pages,
      rating: book.rating,
      availableCopies: book.availableCopies,
    },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ElegantCarousel data={carouselData} />
        </div>
        {/* Infos du livre à droite */}
      </div>
    </div>
  );
}
```

---

## 🎨 Personnalisation

### Ajouter des classes Tailwind personnalisées

```jsx
<ElegantCarousel
  data={bookData}
  className="rounded-xl shadow-lg"
/>
```

### Appliquer des styles au parent

```jsx
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl">
  <ElegantCarousel data={bookData} />
</div>
```

---

## 🔄 Navigation en boucle infinie

Le carousel navigue automatiquement en boucle :

```
Slide 1 → Slide 2 → Slide 3 → Slide 1 (boucle)
```

```
Slide 1 ← Slide 3 ← Slide 2 ← Slide 1 (boucle inverse)
```

### Méthodes de navigation

1. **Boutons Prev/Next** (icônes chevron)
2. **Points indicateurs** (dots) - clic pour aller directement
3. **Événement onSlideChange** - pour synchroniser avec d'autres composants

---

## 🎯 Intégration Firestore

Les données viennent directement de Firestore :

```javascript
// databaseService.js
const book = await databaseService.getBookById(bookId);

// Convertir en SlideData
const slideData = {
  isbn: book.isbn,
  title: book.title,
  author: book.author,
  imageUrl: book.coverUrl,  // URL stockée dans Storage
  description: book.description,
  pages: book.pages,
  rating: book.rating,
  availableCopies: book.availableCopies,
};

<ElegantCarousel data={[slideData]} />
```

---

## 🎬 Fonctionnalités

### ✨ Animations

- **Zoom au survol** : L'image zoom légèrement au survol
- **Transition fluide** : 500ms pour les changements
- **Scale du bouton** : Active scale 95% au clic

### ♿ Accessibilité

- **ARIA labels** : Tous les boutons ont des labels accessibles
- **Focus ring** : Ring bleu au focus keyboard
- **Semantic HTML** : Structure HTML correcte

### 📱 Responsive

- **Mobile** : Hauteur 384px (h-96)
- **Desktop** : Hauteur 500px (h-[500px])
- **Padding adapté** : px-6 (mobile) → px-8 (desktop)

---

## 🐛 Dépannage

### Problème : Images ne chargent pas

**Solution** : Vérifier les URLs

```javascript
// Vérifier que coverUrl existe
console.log(book.coverUrl);

// Utiliser un fallback
imageUrl: book.coverUrl || 'https://via.placeholder.com/400x600'
```

### Problème : Carousel vide

**Solution** : Vérifier les données

```jsx
// Ajouter une vérification
if (!carouselData || carouselData.length === 0) {
  return <div>Aucune donnée</div>;
}
<ElegantCarousel data={carouselData} />
```

### Problème : Styles Tailwind non appliqués

**Solution** : S'assurer que Tailwind est configuré dans le projet

```bash
# Vérifier tailwind.config.js existe
npm install -D tailwindcss postcss autoprefixer
```

---

## 📦 Structure des fichiers

```
src/
├── components/
│   ├── ElegantCarousel.jsx      # Version JavaScript
│   └── ElegantCarousel.tsx      # Version TypeScript (recommandée)
├── pages/
│   └── BookDetail.jsx           # Page utilisant le carousel
└── App.jsx                      # Route /book/:bookId
```

---

## 🔗 Intégration avec les autres pages

### Depuis Home.jsx ou Inventory.jsx

```jsx
import { Link } from 'react-router-dom';

// Dans le rendu des livres
<Link to={`/book/${book.id}`}>
  <img src={book.coverUrl} alt={book.title} />
</Link>
```

### Depuis la page de résultats de recherche

```jsx
const handleBookClick = (bookId) => {
  navigate(`/book/${bookId}`);
};
```

---

## 💾 Sauvegarde et lecture de données

Les données affichées viennent de Firestore via `databaseService` :

```javascript
// Lire un livre
const book = await databaseService.getBookById(bookId);

// Convertir pour le carousel
const carouselSlide = {
  isbn: book.isbn,
  title: book.title,
  author: book.author,
  imageUrl: book.coverUrl,
  description: book.description,
  pages: book.pages,
  rating: book.rating,
  availableCopies: book.availableCopies,
};
```

---

## 🎓 Conventions de code

- **JSX/TSX** : Composants fonctionnels avec hooks
- **Tailwind CSS** : Classes utilitaires (pas de CSS personnalisé)
- **lucide-react** : Icônes SVG (remplace FontAwesome quand possible)
- **TypeScript** : Interfaces TypeScript (fichier .tsx recommandé)

---

## 📝 Changelog

### Version 1.0.0 (2026-02-12)

- ✅ Composant ElegantCarousel créé et refactorisé
- ✅ Support navigation en boucle infinie
- ✅ Intégration lucide-react pour les icônes
- ✅ Conversion complète en Tailwind CSS
- ✅ Interface TypeScript SlideData
- ✅ Page BookDetail avec carousel
- ✅ Route /book/:bookId dans App.jsx
- ✅ Documentation complète

---

## 🚀 Prochaines étapes

- [ ] Ajouter des animations de transition entre slides
- [ ] Implémenter le swipe tactile (touch events)
- [ ] Ajouter des contrôles clavier (flèches)
- [ ] Optimiser les images avec lazy loading
- [ ] Ajouter des tests unitaires

---

**Créé pour BiblioConnect © 2026**

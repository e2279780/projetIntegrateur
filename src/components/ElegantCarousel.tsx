import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Interface pour les données de slide correspondant aux attributs Firestore
 */
interface SlideData {
  /** ISBN du livre - correspond à book.isbn */
  isbn: string;
  /** Titre du livre - correspond à book.title */
  title: string;
  /** Auteur du livre - correspond à book.author */
  author: string;
  /** URL de l'image du livre - correspond à book.coverUrl */
  imageUrl: string;
  /** Description optionnelle du livre */
  description?: string;
  /** Nombre de pages optionnel */
  pages?: number;
  /** Note optionnelle (1-5) */
  rating?: number;
  /** Catégorie optionnelle */
  category?: string;
  /** Nombre de copies disponibles */
  availableCopies?: number;
}

interface ElegantCarouselProps {
  /** Liste des slides avec données des livres */
  data: SlideData[];
  /** Classes CSS additionnelles */
  className?: string;
  /** Callback optionnel au changement de slide */
  onSlideChange?: (index: number) => void;
}

/**
 * ElegantCarousel - Composant carousel refactorisé pour BiblioConnect
 * ✅ Refactoring Props avec prop data
 * ✅ Navigation en boucle infinie
 * ✅ Icônes lucide-react (ChevronLeft, ChevronRight)
 * ✅ Tous les styles en Tailwind CSS (pas de CSS externe)
 * ✅ Interface TypeScript pour SlideData correspondant à Firestore
 */
const ElegantCarousel: React.FC<ElegantCarouselProps> = ({
  data = [],
  className = '',
  onSlideChange,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Validation des données
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-lg ${className}`}
      >
        <p className="text-gray-500 text-lg font-medium text-center px-4">
          Aucune donnée disponible pour le carousel
        </p>
      </div>
    );
  }

  // Navigation en boucle infinie
  const handlePrev = () => {
    const newIndex = activeSlide === 0 ? data.length - 1 : activeSlide - 1;
    setActiveSlide(newIndex);
    onSlideChange?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeSlide === data.length - 1 ? 0 : activeSlide + 1;
    setActiveSlide(newIndex);
    onSlideChange?.(newIndex);
  };

  // Aller à un slide spécifique
  const goToSlide = (index: number) => {
    setActiveSlide(index);
    onSlideChange?.(index);
  };

  const currentSlide = data[activeSlide];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Carousel Container Principal */}
      <div className="relative group">
        {/* Slide Display */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border border-gray-100">
          {/* Image Section avec gradient overlay */}
          <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
            {/* Image avec hover zoom effect */}
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay Gradient pour meilleure lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none"></div>
          </div>

          {/* Content Section - Texte sur fond noir */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent px-6 md:px-8 py-10 md:py-14">
            <div className="space-y-4">
              {/* Titre du livre */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg">
                {currentSlide.title}
              </h2>

              {/* Auteur */}
              <p className="text-base md:text-lg font-bold text-blue-300 drop-shadow">
                Par <span className="text-blue-100">{currentSlide.author}</span>
              </p>

              {/* Description optionnelle */}
              {currentSlide.description && (
                <p className="text-sm md:text-base text-gray-200 line-clamp-2 leading-relaxed drop-shadow">
                  {currentSlide.description}
                </p>
              )}

              {/* Métadonnées - Grille responsive */}
              <div className="flex flex-wrap gap-4 pt-3 border-t border-white/20 mt-4">
                {currentSlide.pages && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">📖 Pages</span>
                    <span className="text-sm font-black text-white">{currentSlide.pages}</span>
                  </div>
                )}
                {currentSlide.rating !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">⭐ Note</span>
                    <span className="text-sm font-black text-yellow-300">{currentSlide.rating}/5</span>
                  </div>
                )}
                {currentSlide.availableCopies !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      currentSlide.availableCopies > 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {currentSlide.availableCopies > 0 ? '✓ Disponible' : '✗ Indisponible'}
                    </span>
                  </div>
                )}
                {currentSlide.isbn && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">ISBN</span>
                    <span className="text-xs font-mono text-gray-300">{currentSlide.isbn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Boutons Prev/Next avec icônes lucide-react */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Slide précédent"
          title="Slide précédent"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Slide suivant"
          title="Slide suivant"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Dot Indicators - Navigation par points */}
      {data.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {data.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                index === activeSlide
                  ? 'w-8 h-3 bg-blue-600 shadow-lg shadow-blue-200'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
              aria-current={index === activeSlide ? 'page' : undefined}
            />
          ))}
        </div>
      )}

      {/* Slide Counter - Indicateur de position */}
      <div className="text-center mt-5">
        <p className="text-sm font-bold text-gray-600">
          <span className="text-blue-600">{activeSlide + 1}</span>
          <span className="text-gray-400"> / {data.length}</span>
        </p>
      </div>
    </div>
  );
};

export default ElegantCarousel;

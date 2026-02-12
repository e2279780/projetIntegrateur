import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @typedef {Object} SlideData
 * @property {string} isbn - ISBN du livre
 * @property {string} title - Titre du livre
 * @property {string} author - Auteur du livre
 * @property {string} imageUrl - URL de l'image du livre
 * @property {string} [description] - Description optionnelle du livre
 * @property {number} [rating] - Note optionnelle du livre
 * @property {number} [pages] - Nombre de pages optionnel
 */

/**
 * ElegantCarousel - Composant carousel refactorisé pour BiblioConnect
 * @param {Object} props
 * @param {SlideData[]} props.data - Liste des slides (images, citations, données d'auteur)
 * @param {string} [props.className] - Classes CSS additionnelles
 * @returns {JSX.Element}
 */
export default function ElegantCarousel({ data = [], className = '' }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Validation des données
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center w-full h-96 bg-gray-100 rounded-3xl ${className}`}>
        <p className="text-gray-500 text-lg font-medium">Aucune donnée disponible</p>
      </div>
    );
  }

  // Navigation en boucle infinie
  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  // Aller à un slide spécifique
  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const currentSlide = data[activeSlide];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Carousel Container */}
      <div className="relative group">
        {/* Main Slide Display */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white">
          {/* Image Section */}
          <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>

          {/* Content Section */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-6 md:px-8 py-8 md:py-12">
            <div className="space-y-3">
              {/* Titre */}
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight line-clamp-2">
                {currentSlide.title}
              </h2>

              {/* Auteur */}
              <p className="text-base md:text-lg font-bold text-blue-300">
                Par {currentSlide.author}
              </p>

              {/* Description optionnelle */}
              {currentSlide.description && (
                <p className="text-sm md:text-base text-gray-200 line-clamp-2 leading-relaxed">
                  {currentSlide.description}
                </p>
              )}

              {/* Métadonnées optionnelles */}
              <div className="flex flex-wrap gap-4 pt-2">
                {currentSlide.pages && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Pages</span>
                    <span className="text-sm font-black text-white">{currentSlide.pages}</span>
                  </div>
                )}
                {currentSlide.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Notation</span>
                    <span className="text-sm font-black text-yellow-400">⭐ {currentSlide.rating}/5</span>
                  </div>
                )}
                {currentSlide.isbn && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">ISBN</span>
                    <span className="text-xs font-mono text-gray-300">{currentSlide.isbn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 group/btn bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-110 active:scale-95"
          aria-label="Slide précédent"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 group/btn bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-110 active:scale-95"
          aria-label="Slide suivant"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dot Indicators */}
      {data.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {data.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === activeSlide
                  ? 'w-8 h-3 bg-blue-600 shadow-lg'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
              aria-current={index === activeSlide}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="text-center mt-4">
        <p className="text-sm font-bold text-gray-600">
          {activeSlide + 1} <span className="text-gray-400">/ {data.length}</span>
        </p>
      </div>
    </div>
  );
}

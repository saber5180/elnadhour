import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, X, Check } from 'lucide-react';

/**
 * Navigation compacte pour un grand menu (28+ catégories) :
 * une seule ligne défilante + panneau « toutes les catégories ».
 */
const CategoryNav = ({ categories = [], activeCategory, onSelect }) => {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, categories.length]);

  /** Garder la puce active visible dans le rail */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active="true"]');
    if (!active) return;
    const elRect = el.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    if (aRect.left < elRect.left || aRect.right > elRect.right) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  useEffect(() => {
    if (!isSheetOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsSheetOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSheetOpen]);

  const scrollBy = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(240, el.clientWidth * 0.7), behavior: 'smooth' });
  };

  const handleSelect = (id) => {
    onSelect(id);
    setIsSheetOpen(false);
  };

  const isActive = (id) =>
    id === 'all' ? activeCategory === 'all' : activeCategory === String(id);

  const pillClass = (active) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
      active
        ? 'border-white bg-white text-cafe-900 shadow-sm'
        : 'border-white/15 bg-white/5 text-white/90 hover:border-white/30 hover:bg-white/15'
    }`;

  const arrowClass =
    'hidden shrink-0 rounded-full border border-white/15 bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20 disabled:opacity-0 md:block';

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canScrollLeft}
          className={arrowClass}
          aria-label="Catégories précédentes"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollerRef}
            className="hide-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth py-0.5"
          >
            <button
              type="button"
              onClick={() => handleSelect('all')}
              data-active={isActive('all')}
              className={`${pillClass(isActive('all'))} snap-start`}
            >
              Tout voir
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category.id)}
                data-active={isActive(category.id)}
                className={`${pillClass(isActive(category.id))} snap-start`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Estompage des bords pour indiquer le défilement */}
          {canScrollLeft && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-cafe-900 to-transparent"
              aria-hidden
            />
          )}
          {canScrollRight && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cafe-900 to-transparent"
              aria-hidden
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canScrollRight}
          className={arrowClass}
          aria-label="Catégories suivantes"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 sm:text-sm"
          aria-label="Voir toutes les catégories"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Catégories</span>
        </button>
      </div>

      {isSheetOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setIsSheetOpen(false)}
          role="presentation"
        >
          <div
            className="max-h-[80vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Toutes les catégories"
          >
            <div className="flex items-center justify-between border-b border-cafe-100 px-5 py-3.5">
              <h2 className="font-display text-lg font-bold text-cafe-900">
                Toutes les catégories
              </h2>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="rounded-full p-1.5 text-cafe-600 transition-colors hover:bg-cafe-50 hover:text-cafe-900"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(80vh-4rem)] overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleSelect('all')}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive('all')
                      ? 'border-cafe-700 bg-cafe-50 text-cafe-900'
                      : 'border-cafe-200/70 bg-white text-cafe-700 hover:border-cafe-300 hover:bg-cafe-50/60'
                  }`}
                >
                  <span className="truncate">Tout voir</span>
                  {isActive('all') && <Check className="h-4 w-4 shrink-0 text-cafe-700" />}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelect(category.id)}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive(category.id)
                        ? 'border-cafe-700 bg-cafe-50 text-cafe-900'
                        : 'border-cafe-200/70 bg-white text-cafe-700 hover:border-cafe-300 hover:bg-cafe-50/60'
                    }`}
                  >
                    <span className="truncate">{category.name}</span>
                    {isActive(category.id) && (
                      <Check className="h-4 w-4 shrink-0 text-cafe-700" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryNav;

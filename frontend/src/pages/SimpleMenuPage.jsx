import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Coffee, Star, Clock, X } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MenuItemDescription from '../components/MenuItemDescription';
import CategoryNav from '../components/CategoryNav';
import { mediaUrl } from '../utils/mediaUrl';
import { formatPriceDT } from '../utils/formatPrice';

const STICKY_TOP = 'top-16 md:top-[4.25rem]';

const SimpleMenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  const initialCat =
    catParam && /^\d+$/.test(String(catParam)) ? String(catParam) : 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => api.get('/categories').then((res) => res.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: menuItems, isLoading: itemsLoading } = useQuery(
    'menu-items',
    () => api.get('/menu-items').then((res) => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  const isLoading = categoriesLoading || itemsLoading;

  /** Sync filtre avec ?cat= (cartes « Nos Spécialités », retour navigateur) */
  useEffect(() => {
    const c = searchParams.get('cat');
    if (!c || !/^\d+$/.test(String(c))) {
      setActiveCategory('all');
      return;
    }
    const idStr = String(c);
    if (categories?.length && !categories.some((cat) => String(cat.id) === idStr)) {
      setActiveCategory('all');
      setSearchParams({}, { replace: true });
      return;
    }
    setActiveCategory(idStr);
  }, [searchParams, categories, setSearchParams]);

  const setCategory = useCallback(
    (id) => {
      const next = id === 'all' ? 'all' : String(id);
      setActiveCategory(next);
      if (next === 'all') {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ cat: next }, { replace: true });
      }
    },
    [setSearchParams]
  );

  /** Après chargement : aller en haut ou jusqu’à la section de la catégorie */
  useEffect(() => {
    if (isLoading) return;
    const run = () => {
      if (activeCategory === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document
        .getElementById(`menu-cat-${activeCategory}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const id = window.requestAnimationFrame(run);
    return () => window.cancelAnimationFrame(id);
  }, [activeCategory, isLoading]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setImagePreview(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredItems =
    menuItems?.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || item.category_id.toString() === activeCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  const groupedItems =
    categories?.reduce((acc, category) => {
      const categoryItems = filteredItems.filter((item) => item.category_id === category.id);
      if (categoryItems.length > 0) {
        acc[category.id] = { category, items: categoryItems };
      }
      return acc;
    }, {}) || {};

  const renderMenuCard = (item) => {
    const hasPromo =
      Boolean(item.promotion_text?.trim()) || item.promotion_price != null;
    const hasNew = Boolean(item.is_new);

    const articleBase =
      'group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-lg md:min-h-[200px] md:shadow-md';

    let articleVariant;
    if (hasPromo) {
      articleVariant =
        'promo-glow-border border-amber-300/80 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/45 shadow-[0_0_0_1px_rgba(251,191,36,0.4),0_10px_24px_rgba(217,119,6,0.2)] hover:shadow-[0_0_0_1px_rgba(251,191,36,0.55),0_14px_30px_rgba(217,119,6,0.28)]';
    } else if (hasNew) {
      articleVariant =
        'border-emerald-200/70 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/35 hover:shadow-xl';
    } else {
      articleVariant = 'border-cafe-200/60 bg-white/95';
    }

    return (
      <article
        key={item.id}
        className={`${articleBase} ${articleVariant}`}
        onClick={() =>
          setImagePreview({
            src: mediaUrl(item.image_url) || '/placeholder-food.svg',
            title: item.name,
          })
        }
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setImagePreview({
              src: mediaUrl(item.image_url) || '/placeholder-food.svg',
              title: item.name,
            });
          }
        }}
      >
        <div className="flex min-h-0 flex-1 flex-row items-stretch">
          <div className="relative w-28 shrink-0 overflow-hidden bg-cafe-100 sm:w-36 md:w-44 md:min-h-[11rem]">
            <img
              src={mediaUrl(item.image_url) || '/placeholder-food.svg'}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder-food.svg';
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
            {item.is_new && (
              <div className="absolute left-0 top-0 z-10 h-14 w-14 overflow-hidden">
                <div className="absolute -left-9 top-2.5 w-28 -rotate-45 bg-gradient-to-b from-red-500 to-red-700 py-0.5 text-center text-[9px] font-extrabold uppercase tracking-[0.12em] text-white shadow-md">
                  Nouveau
                </div>
              </div>
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 md:p-4">
            <div className="flex shrink-0 justify-between gap-2 md:gap-3">
              <div className="min-w-0 pr-1">
                <h3 className="font-display text-base font-bold leading-snug text-cafe-900 sm:text-lg md:text-xl">
                  {item.name}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-cafe-600 md:gap-x-3 md:text-sm">
                  <span className="hidden items-center sm:flex">
                    <Clock className="mr-1 h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                    Frais du jour
                  </span>
                  {item.is_recommended && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200/80 md:px-2 md:text-xs">
                      <Star className="mr-1 h-3 w-3 fill-current text-amber-500 md:h-3.5 md:w-3.5" />
                      Recommandé
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 self-start">
                <div
                  className={
                    item.promotion_price
                      ? 'rounded-md bg-cafe-700 py-1 pl-1.5 pr-2 text-right text-white shadow-sm md:py-1.5 md:pl-2 md:pr-3'
                      : 'rounded-md bg-cafe-700 px-2 py-1 text-white md:px-3 md:py-1.5'
                  }
                >
                  {item.promotion_price ? (
                    <div className="flex items-stretch justify-end gap-1.5 leading-tight md:gap-2.5">
                      <span
                        className="w-0.5 shrink-0 self-stretch rounded-full bg-amber-400"
                        aria-hidden
                      />
                      <div className="min-w-0 text-right">
                        <div className="text-[10px] text-white/65 line-through md:text-[11px]">
                          {formatPriceDT(item.price)}
                        </div>
                        <span className="whitespace-nowrap text-sm font-bold md:text-lg">
                          {formatPriceDT(item.promotion_price)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="whitespace-nowrap text-sm font-bold md:text-lg">
                      {formatPriceDT(item.price)}
                    </span>
                  )}
                </div>
                {item.promotion_text && (
                  <span className="relative inline-flex items-center overflow-hidden rounded-md border border-amber-300/70 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-950 shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_6px_14px_rgba(217,119,6,0.22)]">
                    <span className="pointer-events-none absolute inset-y-0 -left-8 w-6 rotate-12 bg-white/70 blur-[1px]" />
                    <span className="relative">Offre</span>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 flex min-h-0 flex-1 flex-col">
              {item.description ? (
                <div className="min-h-0 flex-1 max-w-none">
                  <MenuItemDescription text={item.description} />
                </div>
              ) : (
                <div className="flex-1" aria-hidden />
              )}
              {item.promotion_text && (
                <div className="mt-2 rounded-lg border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-3 py-2.5 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(251,191,36,0.15)]" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-800">
                        Offre spéciale
                      </p>
                      <p className="mt-0.5 text-xs font-medium leading-relaxed text-amber-900">
                        {item.promotion_text}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 flex items-center justify-center">
        <LoadingSpinner text="Chargement du menu..." />
      </div>
    );
  }

  const menuBody =
    Object.keys(groupedItems).length === 0 ? (
      <div className="text-center py-12 md:py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-cafe-100 rounded-full mb-6">
          <Coffee className="h-10 w-10 text-cafe-600" />
        </div>
        <h3 className="text-2xl font-semibold text-cafe-900 mb-2">Aucun résultat</h3>
        <p className="text-cafe-600">Essayez avec d'autres mots-clés</p>
      </div>
    ) : (
      <div className="space-y-7 md:space-y-12">
        {Object.values(groupedItems).map(({ category, items }) => (
          <div
            key={category.id}
            id={`menu-cat-${category.id}`}
            className="scroll-mt-24 space-y-3 md:scroll-mt-36 md:space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 shadow-md backdrop-blur-sm md:gap-3 md:px-5 md:py-2.5 md:shadow-lg">
                <div className="h-1.5 w-1.5 rounded-full bg-cafe-700 md:h-2 md:w-2" />
                <h2 className="font-display text-xl font-bold text-cafe-900 md:text-3xl">
                  {category.name}
                </h2>
                <div className="h-1.5 w-1.5 rounded-full bg-cafe-700 md:h-2 md:w-2" />
              </div>
              {category.description ? (
                <p className="mx-auto mt-2 max-w-2xl text-xs text-cafe-600 md:mt-3 md:text-base">
                  {category.description}
                </p>
              ) : null}
            </div>

            {(category.subcategories || []).length > 0 ? (
              <div className="space-y-5 md:space-y-8">
                {(category.subcategories || []).map((sub) => {
                  const subItems = items.filter((item) => item.subcategory_id === sub.id);
                  if (subItems.length === 0) return null;
                  return (
                    <div key={sub.id} className="space-y-2.5 md:space-y-3">
                      <div className="text-center md:text-left">
                        <h3 className="font-display text-base font-semibold text-cafe-800 md:text-xl">
                          {sub.name}
                        </h3>
                        {sub.description ? (
                          <p className="mt-1 text-xs text-cafe-600 md:text-sm">{sub.description}</p>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 md:gap-3 xl:grid-cols-2 xl:items-stretch">
                        {subItems.map((item) => renderMenuCard(item))}
                      </div>
                    </div>
                  );
                })}
                {items.some((item) => !item.subcategory_id) ? (
                  <div className="grid grid-cols-1 gap-2.5 md:gap-3 xl:grid-cols-2 xl:items-stretch">
                    {items.filter((item) => !item.subcategory_id).map((item) => renderMenuCard(item))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 md:gap-3 xl:grid-cols-2 xl:items-stretch">
                {items.map((item) => renderMenuCard(item))}
              </div>
            )}
          </div>
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 via-white to-cafe-100">
      <div className="relative overflow-hidden">
        {/* Dégradé café animé : bande 200% + translate (CSS global, plus fiable que background-position) */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="menu-hero-gradient-slide" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-6 text-center md:py-12">
          <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm md:mb-4 md:h-20 md:w-20">
            <img src="/icon.png" alt="El Nadhour" className="h-14 w-14 md:h-20 md:w-20" />
          </div>
          <h1 className="mb-1.5 font-display text-3xl font-bold text-white md:mb-3 md:text-6xl">
            Notre Menu
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-sm text-white/90 md:mb-6 md:text-xl">
            Découvrez nos spécialités artisanales préparées avec passion
          </p>
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cafe-600" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border-0 py-2.5 pl-12 pr-4 text-cafe-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 md:py-3"
            />
          </div>
        </div>
        
      </div>

      <div
        className={`sticky ${STICKY_TOP} z-40 border-b border-white/10 bg-cafe-900 shadow-lg`}
      >
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4">
          <CategoryNav
            categories={categories || []}
            activeCategory={activeCategory}
            onSelect={setCategory}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-10">{menuBody}</div>

      {imagePreview && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setImagePreview(null)}
          role="presentation"
        >
          <div
            className="relative inline-flex max-h-[90vh] max-w-[95vw] items-end justify-center"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Aperçu image de ${imagePreview.title}`}
          >
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
              aria-label="Fermer l'aperçu"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={imagePreview.src}
              alt={imagePreview.title}
              className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/placeholder-food.svg';
              }}
            />
            <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/55 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              {imagePreview.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMenuPage;

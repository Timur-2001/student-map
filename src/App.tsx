import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowDownUp, ArrowUpRight, Bookmark, ChevronDown, Info, Map, MapPin, Search, X } from 'lucide-react';
import MapPanel from './components/MapPanel';
import PlaceCard from './components/PlaceCard';
import PlaceDetail from './components/PlaceDetail';
import AboutModal from './components/AboutModal';
import { CategoryIcon } from './components/CategoryIcon';
import { categories, getCategory, placeCount, places, walkingDistance, type FilterCategory, type Place } from './data/places';

type SortOrder = 'recommended' | 'distance' | 'price';
const SAVED_KEY = 'student-map:saved:v1';

function readSavedPlaces(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(stored) ? [...new Set(stored.filter((id): id is string => typeof id === 'string' && places.some((place) => place.id === id)))] : [];
  } catch {
    return [];
  }
}

const sectionCopy: Record<FilterCategory, { title: string; description: string }> = {
  all: { title: 'Загляни после пар', description: 'Знакомые маршруты, новые любимые места.' },
  university: { title: 'Здесь всё начинается', description: 'Наш университет и твоя точка отсчёта на карте.' },
  food: { title: 'На кофе и не только', description: 'Быстрый перекус или долгая встреча с друзьями? Выбирай.' },
  parks: { title: 'Время немного выдохнуть', description: 'Больше свежего воздуха, меньше мыслей о дедлайнах.' },
  leisure: { title: 'Планы на свободный вечер', description: 'За пределами расписания тоже много интересного.' },
  study: { title: 'Большим идеям нужно место', description: 'Сосредоточься на главном. Тихий уголок уже нашёлся.' },
};

function Brand({ small = false }: { small?: boolean }) {
  return <span className={`brand ${small ? 'brand-small' : ''}`}><span className="brand-mark"><Map size={small ? 20 : 25} strokeWidth={1.8} /></span><span>Student <span className="brand-accent">Map</span><span className="brand-period">.</span></span></span>;
}

export default function App() {
  const [category, setCategory] = useState<FilterCategory>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('recommended');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(readSavedPlaces);
  const [savedOnly, setSavedOnly] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const contentRef = useRef<HTMLElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => setToast({ message, id: Date.now() }), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  useEffect(() => {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds)); } catch { /* Private browsing can disable storage; bookmarks still work in memory. */ }
  }, [savedIds]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => () => { if (scrollTimer.current) clearTimeout(scrollTimer.current); }, []);

  const filteredPlaces = useMemo(() => {
    const normalize = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е');
    const search = normalize(query.trim());
    const result = places.filter((place) => {
      if (category !== 'all' && place.category !== category) return false;
      if (savedOnly && !savedIds.includes(place.id)) return false;
      const searchable = normalize([place.name, place.address, place.description, place.details, ...place.tags, getCategory(place.category).fullLabel].join(' '));
      return !search || search.split(/\s+/).every((word) => searchable.includes(word));
    });
    if (sort === 'distance') result.sort((a, b) => walkingDistance(a) - walkingDistance(b));
    if (sort === 'price') result.sort((a, b) => a.price - b.price);
    return result;
  }, [category, query, savedOnly, savedIds, sort]);

  const smoothScroll = useCallback((element: HTMLElement | null) => {
    element?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const selectPlace = useCallback((place: Place) => {
    setSelectedPlace(place);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    // Let the map's fly-to establish spatial context before revealing the details below.
    scrollTimer.current = setTimeout(() => {
      smoothScroll(contentRef.current);
      contentRef.current?.focus({ preventScroll: true });
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 650);
  }, [smoothScroll]);

  function toggleSaved(id: string) {
    const saved = savedIds.includes(id);
    setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(saved ? 'Место удалено из избранного.' : 'Место сохранено. Твои планы теперь под рукой.');
  }

  function resetFilters() {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    setCategory('all');
    setQuery('');
    setSavedOnly(false);
    setSelectedPlace(null);
    setSort('recommended');
  }

  function goHome() {
    resetFilters();
    setFocusRequest((value) => value + 1);
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function chooseCategory(nextCategory: FilterCategory, button: HTMLButtonElement) {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    setCategory(nextCategory);
    setSelectedPlace(null);
    button.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
  }

  const copy = query.trim()
    ? { title: 'Кажется, это то самое', description: `По запросу «${query.trim()}»: ${placeCount(filteredPlaces.length)}.` }
    : savedOnly
      ? { title: 'Твои любимые места', description: 'Сохрани на потом. Или отправляйся прямо сейчас.' }
      : sectionCopy[category];

      
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a className="skip-link" href="#places">Перейти к списку мест</a>
        <header className="site-header">
          <div className="page-container header-inner">
            <div className="header-brand-group">
              <button className="brand-link" onClick={goHome} aria-label="Student Map: вернуться ко всем местам"><Brand /></button>
              <span className="header-tagline">Твой гид между парами</span>
            </div>
            <nav className="header-nav" aria-label="Основная навигация">
              <button className={`favorites-link ${savedOnly ? 'is-active' : ''}`} aria-pressed={savedOnly} onClick={() => {
                if (scrollTimer.current) clearTimeout(scrollTimer.current);
                setSavedOnly((value) => !value);
                setSelectedPlace(null);
                setCategory('all');
                setQuery('');
                setTimeout(() => smoothScroll(contentRef.current), 50);
              }} aria-label={`Избранное, ${placeCount(savedIds.length)}`}>
                <Bookmark size={18} strokeWidth={1.7} fill={savedOnly ? 'currentColor' : 'none'} /><span>Избранное</span>{savedIds.length > 0 && <span className="favorites-count">{savedIds.length}</span>}
              </button>
            </nav>
          </div>
        </header>

        <main className="page-container">
          <section className="map-section" ref={mapSectionRef} aria-labelledby="map-heading">
            <motion.div className="page-intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="city-context"><span className="city-context-icon"><MapPin size={21} strokeWidth={1.7} /></span><span><strong>Иркутск</strong></span></div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55, delay: 0.12 }}>
              <MapPanel
                visiblePlaces={filteredPlaces}
                selectedPlace={selectedPlace}
                query={query}
                filterKey={`${category}:${query.trim()}:${savedOnly}`}
                focusRequest={focusRequest}
                onQueryChange={(value) => {
                  if (scrollTimer.current) clearTimeout(scrollTimer.current);
                  setQuery(value);
                  setSelectedPlace(null);
                }}
                onSelect={selectPlace}
                notify={notify}
              />
            </motion.div>
          </section>
          <section className="category-section" aria-label="Фильтры мест">
            <div className="category-scroll" role="group" aria-label="Категория места">
              {categories.map((item) => (
                <button
                  key={item.id}
                  className={`category-button ${category === item.id ? 'is-active' : ''}`}
                  style={{ '--category-color': item.color, '--category-tint': item.tint } as CSSProperties}
                  onClick={(event) => chooseCategory(item.id, event.currentTarget)}
                  aria-pressed={category === item.id}
                  title={item.fullLabel}
                >
                  <CategoryIcon category={item.id} size={19} />{item.label}
                  {category === item.id && <motion.span className="active-filter-background" layoutId="active-filter" transition={{ type: 'spring', stiffness: 440, damping: 34 }} />}
                </button>
              ))}
            </div>
            <span className="map-place-count"><span />{placeCount(filteredPlaces.length)} на карте</span>
          </section>

          <section className="places-section" id="places" ref={contentRef} tabIndex={-1} aria-labelledby="places-heading">
            <AnimatePresence mode="wait" initial={false}>
              {selectedPlace ? (
                <PlaceDetail
                  key={selectedPlace.id}
                  place={selectedPlace}
                  saved={savedIds.includes(selectedPlace.id)}
                  onSave={toggleSaved}
                  onBack={() => {
                    if (scrollTimer.current) clearTimeout(scrollTimer.current);
                    setSelectedPlace(null);
                  }}
                  onShowMap={() => {
                    if (scrollTimer.current) clearTimeout(scrollTimer.current);
                    smoothScroll(mapSectionRef.current);
                  }}
                  notify={notify}
                />
              ) : (
                <motion.div key="place-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <div className="section-heading">
                    <div><h2 id="places-heading">{copy.title}<span className="heading-count">{filteredPlaces.length}</span></h2><p>{copy.description}</p></div>
                    <label className="sort-select"><ArrowDownUp size={16} strokeWidth={1.7} /><span className="sr-only">Сортировка мест</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}><option value="recommended">Рекомендуем</option><option value="distance">Ближе к ВУЗу</option><option value="price">Сначала дешевле</option></select><ChevronDown size={15} /></label>
                  </div>

                  {savedOnly && <div className="active-saved-note"><Bookmark size={14} />Только избранное<button onClick={() => setSavedOnly(false)} aria-label="Показать не только избранное"><X size={15} /></button></div>}

                  <p className="sr-only" aria-live="polite">{placeCount(filteredPlaces.length)} в списке{category !== 'all' ? `, категория ${getCategory(category).label}` : ''}</p>
                  {filteredPlaces.length > 0 ? (
                    <div className="places-grid" key={`${category}-${savedOnly}-${query.trim()}`}>
                      {filteredPlaces.map((place, index) => <PlaceCard key={place.id} place={place} index={index} saved={savedIds.includes(place.id)} onSelect={selectPlace} onSave={toggleSaved} />)}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-state-icon">{savedOnly ? <Bookmark size={30} strokeWidth={1.4} /> : <Search size={30} strokeWidth={1.4} />}</span>
                      <h3>{savedOnly && !savedIds.length ? 'Здесь будут твои места' : 'Пока ничего не нашлось'}</h3>
                      <p>{savedOnly && !savedIds.length ? 'Нажми на закладку у понравившегося места, и оно останется под рукой.' : 'Попробуй другое название или сбрось фильтры. Город всё ещё полон открытий.'}</p>
                      <button className="primary-button" onClick={resetFilters}>{savedOnly && !savedIds.length ? 'Найти любимое место' : 'Показать все места'}<ArrowUpRight size={17} /></button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="demo-notice"><Info size={15} /><p>Учебная подборка. Цены, удобства и время в пути примерные, фото иллюстративные. Перед визитом уточни информацию о месте.</p></div>
        </main>

        <footer className="page-container site-footer"><button className="brand-link" onClick={goHome} aria-label="Вернуться к началу"><Brand small /></button><span>Меньше искать. Больше жить.</span><span className="footer-location"><ArrowUpRight size={14} /></span></footer>

        <AnimatePresence>{aboutOpen && <AboutModal onClose={closeAbout} />}</AnimatePresence>
        <div className="toast-region" aria-live="polite" aria-atomic="true">
          <AnimatePresence>{toast && <motion.div key={toast.id} className="toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span className="toast-icon"><Info size={16} /></span><span>{toast.message}</span><button onClick={() => setToast(null)} aria-label="Закрыть уведомление"><X size={17} /></button></motion.div>}</AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowUpRight, Crosshair, Expand, GraduationCap, LoaderCircle, LocateFixed, Minus, MousePointer2, Plus, Search, WifiOff, X } from 'lucide-react';
import { CAMPUS_COORDINATES, campus, getCategory, type Place } from '../data/places';
import { CategoryIcon, markerSvg } from './CategoryIcon';

interface MapPanelProps {
  visiblePlaces: Place[];
  selectedPlace: Place | null;
  query: string;
  filterKey: string;
  focusRequest: number;
  onQueryChange: (query: string) => void;
  onSelect: (place: Place) => void;
  notify: (message: string) => void;
}

export default function MapPanel({ visiblePlaces, selectedPlace, query, filterKey, focusRequest, onQueryChange, onSelect, notify }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const tilesRef = useRef<L.TileLayer | null>(null);
  const locationRef = useRef<L.LayerGroup | null>(null);
  const selectRef = useRef(onSelect);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFilter = useRef(filterKey);
  const mountedRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [tileState, setTileState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [locating, setLocating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const searchResults = visiblePlaces.slice(0, 5);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current) return;
    mountedRef.current = true;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      minZoom: 3,
      maxZoom: 19,
      preferCanvas: true,
    }).setView(CAMPUS_COORDINATES, 13.5);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
      keepBuffer: 2,
    }).addTo(map);

    let loadedTiles = 0;
    let consecutiveErrors = 0;
    tiles.on('tileload', () => {
      loadedTiles += 1;
      consecutiveErrors = 0;
      if (mountedRef.current) setTileState('ready');
    });
    tiles.on('tileerror', () => {
      consecutiveErrors += 1;
      if (consecutiveErrors >= 4 && mountedRef.current) setTileState('error');
    });
    const loadingTimeout = window.setTimeout(() => {
      if (!loadedTiles && mountedRef.current) setTileState('error');
    }, 9000);

    L.circle(CAMPUS_COORDINATES, {
      radius: 255,
      color: '#8970dc',
      weight: 1,
      opacity: 0.3,
      dashArray: '4 5',
      fillColor: '#9980e4',
      fillOpacity: 0.07,
      interactive: false,
    }).addTo(map);

    mapRef.current = map;
    tilesRef.current = tiles;
    markersRef.current = L.layerGroup().addTo(map);
    locationRef.current = L.layerGroup().addTo(map);
    setReady(true);

    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(containerRef.current);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(loadingTimeout);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      observer.disconnect();
      tiles.off();
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
      tilesRef.current = null;
      locationRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!ready || !map || !layer) return;

    const renderMarkers = () => {
      layer.clearLayers();
      const points: L.Point[] = [];
      const mapPlaces = [campus, ...visiblePlaces.filter((place) => place.id !== campus.id)];
      const campusPoint = map.project(CAMPUS_COORDINATES, map.getZoom());
      const campusIsResult = visiblePlaces.some((place) => place.id === campus.id);

      for (const place of mapPlaces) {
        const isCampus = place.id === 'campus';
        const selected = selectedPlace?.id === place.id;
        const isReference = isCampus && !campusIsResult && !selected;
        const category = getCategory(place.category);
        const actualPoint = map.project(place.coordinates, map.getZoom());
        let displayPoint = actualPoint;

        // Spread nearby pins in screen space; dotted leaders retain their true locations.
        // This keeps the faculty and its ground-floor canteen independently tappable.
        if (!isCampus) {
          for (let step = 0; step < 64; step += 1) {
            const overlapsCampusLabel = displayPoint.x > campusPoint.x + 25
              && displayPoint.x < campusPoint.x + 195
              && displayPoint.y > campusPoint.y - 70
              && displayPoint.y < campusPoint.y + 25;
            if (!overlapsCampusLabel && points.every((point) => point.distanceTo(displayPoint) >= 62)) break;
            const angle = step * 2.39996;
            const radius = 64 + Math.floor(step / 8) * 20;
            displayPoint = actualPoint.add(L.point(Math.cos(angle) * radius, Math.sin(angle) * radius));
          }
        }
        points.push(displayPoint);
        const displayCoordinates = map.unproject(displayPoint, map.getZoom());

        if (actualPoint.distanceTo(displayPoint) > 5) {
          L.polyline([place.coordinates, displayCoordinates], {
            color: category.color,
            weight: 1.5,
            opacity: 0.45,
            dashArray: '3 4',
            interactive: false,
          }).addTo(layer);
        }

        const icon = L.divIcon({
          className: 'student-marker',
          html: `<div class="map-marker ${isCampus ? 'is-campus' : ''} ${isReference ? 'is-reference' : ''} ${selected ? 'is-selected' : ''}" style="--pin-color:${category.color}"><span class="map-pin">${markerSvg(place.category)}</span></div>`,
          iconSize: isCampus ? [56, 62] : [44, 50],
          iconAnchor: isCampus ? [28, 56] : [22, 44],
        });

        const marker = L.marker(displayCoordinates, {
          icon,
          title: place.name,
          alt: place.name,
          keyboard: true,
          riseOnHover: true,
          opacity: isReference ? 0.7 : 1,
          zIndexOffset: isCampus ? 1000 : selected ? 900 : 100,
        }).addTo(layer);

        marker.on('click', () => selectRef.current(place));
        const element = marker.getElement();
        element?.setAttribute('aria-label', `Открыть место: ${place.name}`);
        element?.setAttribute('aria-pressed', String(selected));

        if (isCampus) {
          const label = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = 'ФБКИ ИГУ';
          const subtitle = document.createElement('span');
          subtitle.textContent = isReference ? 'Твой ориентир на карте' : 'Здесь всё начинается';
          label.append(title, subtitle);
          marker.bindTooltip(label, {
            permanent: true,
            direction: 'right',
            offset: [27, -35],
            className: 'campus-tooltip',
            opacity: isReference ? 0.75 : 1,
          });
        } else {
          const label = document.createElement('span');
          label.textContent = place.name;
          marker.bindTooltip(label, {
            direction: 'top',
            offset: [0, -44],
            className: 'place-tooltip',
          });
        }
      }
    };

    renderMarkers();
    map.on('zoomend', renderMarkers);
    return () => {
      map.off('zoomend', renderMarkers);
      layer.clearLayers();
    };
  }, [ready, visiblePlaces, selectedPlace?.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || selectedPlace || previousFilter.current === filterKey) return;
    const timeout = window.setTimeout(() => {
      previousFilter.current = filterKey;
      if (!visiblePlaces.length) return;
      if (filterKey === 'all::false') {
        map.flyTo(CAMPUS_COORDINATES, 13.5, { duration: 0.7, animate: !reducedMotion() });
      } else {
        const bounds = L.latLngBounds([CAMPUS_COORDINATES, ...visiblePlaces.map((place) => place.coordinates)]);
        map.flyToBounds(bounds, { padding: [70, 75], maxZoom: 16, duration: 0.7, animate: !reducedMotion() });
      }
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [ready, filterKey, visiblePlaces, selectedPlace]);

  useEffect(() => {
    if (!ready || !selectedPlace || !mapRef.current) return;
    mapRef.current.flyTo(selectedPlace.coordinates, Math.max(mapRef.current.getZoom(), 15.5), {
      duration: 0.7,
      animate: !reducedMotion(),
    });
  }, [ready, selectedPlace]);

  useEffect(() => {
    if (!focusRequest || !mapRef.current) return;
    mapRef.current.flyTo(CAMPUS_COORDINATES, 13.5, { duration: 0.8, animate: !reducedMotion() });
  }, [focusRequest]);

  function fitPlaces() {
    const map = mapRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([CAMPUS_COORDINATES, ...visiblePlaces.map((place) => place.coordinates)]);
    map.flyToBounds(bounds, { padding: [70, 80], maxZoom: 16, duration: 0.8, animate: !reducedMotion() });
  }

  function locate() {
    if (!navigator.geolocation) {
      notify('Этот браузер не поддерживает геолокацию. Можно вернуться к ВУЗу кнопкой на карте.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current || !mapRef.current) return;
        const coordinates: L.LatLngTuple = [position.coords.latitude, position.coords.longitude];
        locationRef.current?.clearLayers();
        const group = locationRef.current!;
        L.circle(coordinates, {
          radius: Math.min(position.coords.accuracy, 1000),
          color: '#6b8bea', fillColor: '#6b8bea', fillOpacity: 0.12, weight: 1,
        }).addTo(group);
        L.circleMarker(coordinates, {
          radius: 8, color: '#fff', weight: 3, fillColor: '#5b7fe0', fillOpacity: 1,
        }).bindTooltip('Вы здесь').addTo(group);
        mapRef.current.flyTo(coordinates, 15, { duration: 1, animate: !reducedMotion() });
        setLocating(false);
        notify('Вы отмечены синим. Приложение не сохраняет ваши координаты.');
      },
      (error) => {
        if (!mountedRef.current) return;
        setLocating(false);
        notify(error.code === 1
          ? 'Доступ к геолокации закрыт. Разрешите его в настройках браузера.'
          : 'Не удалось определить местоположение. Попробуйте ещё раз.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  function selectSearchResult(place: Place) {
    setSearchOpen(false);
    inputRef.current?.blur();
    onSelect(place);
  }

  return (
    <div className="map-frame">
      <div ref={containerRef} className="leaflet-map" role="region" aria-label="Интерактивная карта студенческих мест Иркутска" />

      <div className="map-search" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSearchOpen(false);
      }}>
        <div className={`search-input-wrap ${searchOpen && query.trim() ? 'is-open' : ''}`}>
          <Search size={20} strokeWidth={1.8} className="search-icon" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder="Кофе, парк или библиотека..."
            aria-label="Поиск мест по названию, адресу и категории"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={searchOpen && Boolean(query.trim())}
            aria-controls="map-search-results"
            aria-activedescendant={searchOpen && query.trim() && searchResults[activeResult] ? `search-option-${activeResult}` : undefined}
            autoComplete="off"
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setActiveResult(0);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSearchOpen(false);
                inputRef.current?.blur();
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSearchOpen(true);
                setActiveResult((value) => Math.max(0, Math.min(value + 1, searchResults.length - 1)));
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveResult((value) => Math.max(0, value - 1));
              }
              if (event.key === 'Enter' && query.trim() && searchResults[activeResult]) {
                event.preventDefault();
                selectSearchResult(searchResults[activeResult]);
              }
            }}
          />
          {query ? (
            <button className="search-clear" onClick={() => { onQueryChange(''); inputRef.current?.focus(); }} aria-label="Очистить поиск"><X size={17} /></button>
          ) : null}
        </div>
        {searchOpen && query.trim() && (
          <div className="search-results" id="map-search-results" role="listbox" aria-label="Найденные места">
            {searchResults.length ? searchResults.map((place, index) => (
              <button
                key={place.id}
                id={`search-option-${index}`}
                className={`search-result ${activeResult === index ? 'is-active' : ''}`}
                role="option"
                aria-selected={activeResult === index}
                tabIndex={-1}
                onMouseEnter={() => setActiveResult(index)}
                onClick={() => selectSearchResult(place)}
              >
                <span className="search-result-icon" style={{ color: getCategory(place.category).color, background: getCategory(place.category).tint }}><CategoryIcon category={place.category} size={19} /></span>
                <span><strong>{place.name}</strong><small>{place.address.replace('Иркутск, ', '')}</small></span>
                <ArrowUpRight size={16} />
              </button>
            )) : (
              <div className="search-no-results"><strong>Пока ничего не нашлось</strong><span>Попробуй другое слово или категорию.</span></div>
            )}
          </div>
        )}
      </div>

      <div className="map-top-control">
        <button className="map-control" onClick={fitPlaces} title="Показать все найденные места" aria-label="Показать все найденные места"><Expand size={20} strokeWidth={1.7} /></button>
      </div>

      <div className="map-side-controls">
        <div className="zoom-controls">
          <button className="map-control" onClick={() => mapRef.current?.zoomIn()} aria-label="Приблизить карту" title="Приблизить"><Plus size={22} strokeWidth={1.7} /></button>
          <button className="map-control" onClick={() => mapRef.current?.zoomOut()} aria-label="Отдалить карту" title="Отдалить"><Minus size={22} strokeWidth={1.7} /></button>
        </div>
        <button className="map-control location-control" onClick={locate} disabled={locating} aria-label="Определить моё местоположение" title="Моё местоположение">
          {locating ? <LoaderCircle size={21} className="spin" /> : <LocateFixed size={21} strokeWidth={1.7} />}
        </button>
      </div>

      <button className="campus-map-button" onClick={() => {
        mapRef.current?.flyTo(CAMPUS_COORDINATES, 15, { duration: 0.8, animate: !reducedMotion() });
      }} title="Вернуться к университету">
        <span className="campus-button-icon"><GraduationCap size={25} strokeWidth={1.7} /></span>
        <span><strong>ФБКИ ИГУ</strong><small>Твоя точка отсчёта</small></span>
        <Crosshair size={17} className="campus-crosshair" />
      </button>

      <div className="map-hint"><MousePointer2 size={14} /><span>Нажми на метку и узнай больше</span></div>

      {tileState === 'loading' && <div className="map-loading" role="status"><LoaderCircle size={16} className="spin" />Загружаем Иркутск...</div>}
      {tileState === 'error' && (
        <div className="map-error" role="status">
          <WifiOff size={21} />
          <strong>Нет соединения с картой</strong>
          <span>Места и фильтры по-прежнему доступны ниже.</span>
          <button onClick={() => {
            setTileState('loading');
            tilesRef.current?.redraw();
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) setTileState((state) => state === 'loading' ? 'error' : state);
            }, 9000);
            notify('Повторно запрашиваем карту. Проверьте подключение к интернету.');
          }}>Попробовать снова</button>
        </div>
      )}
    </div>
  );
}
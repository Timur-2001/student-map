import { ArrowLeft, ArrowUpRight, Bookmark, Check, Copy, Footprints, MapPin, Navigation, Sparkles, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCategory, routeUrl, walkingLabel, type Place } from '../data/places';
import { CategoryIcon } from './CategoryIcon';
import { PlaceImage } from './PlaceCard';
import { useEffect, useRef, useState } from 'react';

interface PlaceDetailProps {
  place: Place;
  saved: boolean;
  onBack: () => void;
  onSave: (id: string) => void;
  onShowMap: () => void;
  notify: (message: string) => void;
}

export default function PlaceDetail({ place, saved, onBack, onSave, onShowMap, notify }: PlaceDetailProps) {
  const category = getCategory(place.category);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(place.address);
      setCopied(true);
      notify('Адрес скопирован. Хорошей прогулки!');
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      notify('Копирование недоступно. Адрес можно выделить и скопировать вручную.');
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="detail-toolbar">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} />К списку мест</button>
        <button className="text-button" onClick={onShowMap}><MapPin size={16} />Показать на карте</button>
      </div>
      <article className="place-detail">
        <div className="detail-visual">
          <PlaceImage place={place} />
          <span className="detail-photo-note">Фото для настроения</span>
        </div>
        <div className="detail-content">
          <div className="detail-category-line">
            <span className="category-caption" style={{ color: category.color }}><CategoryIcon category={place.category} size={17} />{category.label}</span>
            <button className={`detail-save ${saved ? 'is-saved' : ''}`} onClick={() => onSave(place.id)} aria-pressed={saved} aria-label={saved ? 'Убрать из избранного' : 'Сохранить место'}>
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Сохранено' : 'Сохранить'}
            </button>
          </div>
          
          <h2 id="places-heading">{place.name}</h2>

          <div className="detail-address"><MapPin size={17} /><span>{place.address}</span><button onClick={copyAddress} className="copy-address" title="Скопировать адрес" aria-label="Скопировать адрес">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>
          {place.studentDiscount && (
            <div className="student-discount-badge">
              {place.studentDiscount}
            </div>
          )}
          <p className="detail-description">{place.details}</p>
          <div className="student-reason"><h3><Sparkles size={17} />За что любят студенты</h3><p>{place.studentReason}</p></div>
          <div className="detail-facts">
            <span><Wallet size={17} /><strong>{place.priceLabel}</strong></span>
            <span><Footprints size={17} />{walkingLabel(place)}</span>
          </div>
          <div className="detail-tags">{place.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          {place.id === 'campus' && <p className="campus-coordinates">Координаты: {place.coordinates.join(', ')}</p>}
          <div className="detail-actions">
            <a className="primary-button route-button" href={routeUrl(place)} target="_blank" rel="noopener noreferrer"><Navigation size={18} />Проложить маршрут<ArrowUpRight size={17} /></a>
            {place.source && <a className="venue-link" href={place.source} target="_blank" rel="noopener noreferrer">Сайт места<ArrowUpRight size={16} /></a>}
          </div>
          <p className="route-note">{place.id === 'campus' ? 'Пеший маршрут от вашего местоположения' : 'Пеший маршрут от ФБКИ ИГУ'} в Яндекс Картах</p>
        </div>
      </article>
    </motion.div>
  );
}
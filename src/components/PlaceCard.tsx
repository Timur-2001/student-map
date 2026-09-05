import { ArrowUpRight, Bookmark, Footprints } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCategory, walkingLabel, type Place } from '../data/places';
import { CategoryIcon } from './CategoryIcon';



const getShortDiscount = (discount: string) => {
  const match = discount.match(/\d+\s*%/); // ищем "20%"
  return match ? `Скидка ${match[0]}` : discount;
};


interface PlaceCardProps {
  place: Place;
  saved: boolean;
  index: number;
  onSelect: (place: Place) => void;
  onSave: (id: string) => void;
}

export function PlaceImage({ place, className = '' }: { place: Place; className?: string }) {
  return (
    <img
      src={place.image}
      alt={place.imageAlt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        const image = event.currentTarget;
        if (image.dataset.fallback) return;
        image.dataset.fallback = 'true';
        image.src = '/images/place-fallback.svg';
      }}
    />
  );
}

export default function PlaceCard({ place, saved, index, onSelect, onSave }: PlaceCardProps) {
  const category = getCategory(place.category);

  return (
    <motion.article
      className="place-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.055, 0.22) }}
    >
      <button className="place-card-main" onClick={() => onSelect(place)} aria-label={`Подробнее: ${place.name}`}>
        <div className="place-image-wrap">
          <PlaceImage place={place} />
          <span className="image-open-hint"><ArrowUpRight size={20} /></span>
        </div>
        <div className="place-card-body">
          <div className="place-meta">
            <span className="category-caption" style={{ color: category.color }}>
              <CategoryIcon category={place.category} size={15} />
              {category.label}
            </span>
            <span className="walking-caption"><Footprints size={13} />{walkingLabel(place)}</span>
          </div>
          <div className='wrapper-card'>
          <h3>{place.name}</h3>
          {place.studentDiscount && (
            <div className="student-discount-badge-small">
              {getShortDiscount(place.studentDiscount)}
            </div>
          )}
          </div>
          <p>{place.description}</p>
          
          <div className="place-card-footer">
            <span className={place.price === 0 ? 'price-label free-price' : 'price-label'}>{place.priceLabel}</span>
            <span className="card-tag">{place.tags[0]}</span>
            <ArrowUpRight size={17} className="card-arrow" />
          </div>
        </div>
      </button>
      
      <button
        className={`save-button ${saved ? 'is-saved' : ''}`}
        onClick={() => onSave(place.id)}
        aria-label={saved ? `Убрать ${place.name} из избранного` : `Сохранить ${place.name}`}
        aria-pressed={saved}
        title={saved ? 'Убрать из избранного' : 'В избранное'}
      >
        <Bookmark size={19} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.7} />
      </button>
    </motion.article>
  );
}
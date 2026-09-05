import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Map, X } from 'lucide-react';


export default function AboutModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex="0"]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div ref={dialogRef} className="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-title" initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.25 }}>
        <button className="modal-close" onClick={onClose} aria-label="Закрыть информацию о проекте"><X size={21} /></button>
        <span className="about-brand-mark"><Map size={32} strokeWidth={1.6} /></span>
        <span className="about-eyebrow">ОТ СТУДЕНТА ДЛЯ СТУДЕНТОВ</span>
        <h2 id="about-title">Привет, это<br /><span>Student Map.</span></h2>
        <p>Небольшой гид по большой жизни между парами. Здесь собраны места, где можно выпить кофе, встретиться с друзьями или найти вдохновение для курсовой.</p>
        <p>Это независимый учебный проект о студенческой жизни в Иркутске. Ссылка на личный сайт автора появится позже.</p>
        <a className="about-faculty-link" href="https://fbki.isu.ru/" target="_blank" rel="noopener noreferrer">Узнать больше о ФБКИ ИГУ<ArrowUpRight size={17} /></a>
        <div className="about-disclaimer">Места представлены как тестовая подборка. Цены, удобства и время в пути ориентировочные; фотографии иллюстративные. Проект не является официальным сайтом ИГУ.</div>
        <button className="primary-button about-return" onClick={onClose}>Пойдём исследовать город<ArrowUpRight size={18} /></button>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
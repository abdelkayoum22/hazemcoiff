import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { ShopSettings } from '../types/barbershop';

interface HeroSectionProps {
  settings: ShopSettings;
  onOpenBooking: () => void;
}

const EASE_LUXE = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ settings, onOpenBooking }: HeroSectionProps) {
  const scrollToServices = () => {
    const el = document.querySelector('#services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="accueil" className="relative bg-[#000000] border-b border-[#8C8889]/20">
      <div className="relative min-h-[80vh] lg:min-h-[86vh] flex items-center overflow-hidden">
        <motion.img
          initial={{ scale: 1.03, opacity: 0.75 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_LUXE }}
          src={settings.hero_image || '/assets/aistudio/image_1a42b0d4.png'}
          alt={`Salon ${settings.shop_name} — ${settings.address}, ${settings.city}`}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[center_25%] will-change-transform"
        />

        <div
          className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/82 to-[#000000]/35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/45"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: EASE_LUXE }}
              className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-[#CFCFD3] mb-5"
            >
              {settings.tagline}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: EASE_LUXE }}
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-[4.25rem] font-semibold leading-[1.06] tracking-tight text-[#FFFFFF] mb-6"
            >
              Votre style. <span className="italic font-medium text-[#CFCFD3]">Notre passion.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: EASE_LUXE }}
              className="text-base sm:text-lg text-[#CFCFD3] leading-relaxed max-w-xl mb-10"
            >
              Situé au {settings.address} à {settings.city}, {settings.shop_name} vous accueille
              7j/7 pour des coupes sur mesure, dégradés de précision, coiffures de mariage,
              brushings et taille de barbe soignée.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: EASE_LUXE }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18, ease: EASE_LUXE }}
                onClick={onOpenBooking}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-semibold text-[#000000] bg-[#FFFFFF] hover:bg-[#CFCFD3] rounded transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFCFD3]"
              >
                <span>Réserver maintenant</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18, ease: EASE_LUXE }}
                onClick={scrollToServices}
                className="inline-flex items-center justify-center px-7 py-4 text-sm font-medium text-[#FFFFFF] bg-[#0D0D0F]/85 hover:bg-[#161619] border border-[#8C8889]/40 hover:border-[#CFCFD3] rounded transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFCFD3]"
              >
                Découvrir nos services
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full-width 4-column architectural strip below hero */}
      <div className="bg-[#0A0A0B] border-t border-[#8C8889]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#8C8889]/20">
            <div className="py-5 sm:px-6 first:sm:pl-0">
              <p className="text-xs text-[#8C8889] mb-1">Satisfaction clients</p>
              <p className="text-sm font-medium text-[#FFFFFF] tabular-nums">5,0 / 5 · 15 avis vérifiés</p>
            </div>
            <div className="py-5 sm:px-6">
              <p className="text-xs text-[#8C8889] mb-1">Horaires d’ouverture</p>
              <p className="text-sm font-medium text-[#FFFFFF] tabular-nums">Ouvert 7j/7 jusqu’à 20:30</p>
            </div>
            <div className="py-5 sm:px-6">
              <p className="text-xs text-[#8C8889] mb-1">Téléphone direct</p>
              <p className="text-sm font-medium text-[#FFFFFF] font-[family-name:var(--font-mono)] tabular-nums">
                {settings.phone}
              </p>
            </div>
            <div className="py-5 sm:px-6 last:lg:pr-0">
              <p className="text-xs text-[#8C8889] mb-1">Adresse du salon</p>
              <p className="text-sm font-medium text-[#FFFFFF]">
                {settings.address}, {settings.city}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

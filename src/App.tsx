import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { fetchPublicBootstrap } from './lib/api';
import type { BusinessHour, PublicBootstrapData, ServiceItem, ShopSettings } from './types/barbershop';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutAndPillarsSection } from './components/AboutAndPillarsSection';
import { GalleryAndReviewsSection } from './components/GalleryAndReviewsSection';
import { ContactAndFooter } from './components/ContactAndFooter';

const BookingModal = lazy(() =>
  import('./components/BookingModal').then((m) => ({ default: m.BookingModal }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const FALLBACK_HOURS: BusinessHour[] = [
  { day_of_week: 1, day_name: 'Lundi', is_open: 1, open_time: '13:00', close_time: '20:30' },
  { day_of_week: 2, day_name: 'Mardi', is_open: 1, open_time: '10:00', close_time: '20:30' },
  { day_of_week: 3, day_name: 'Mercredi', is_open: 1, open_time: '10:00', close_time: '20:30' },
  { day_of_week: 4, day_name: 'Jeudi', is_open: 1, open_time: '10:00', close_time: '20:30' },
  { day_of_week: 5, day_name: 'Vendredi', is_open: 1, open_time: '10:00', close_time: '20:30' },
  { day_of_week: 6, day_name: 'Samedi', is_open: 1, open_time: '10:00', close_time: '20:30' },
  { day_of_week: 0, day_name: 'Dimanche', is_open: 1, open_time: '10:00', close_time: '20:30' },
];

const FALLBACK_SETTINGS: ShopSettings = {
  shop_name: 'Hazem Coiff',
  tagline: 'Salon de coiffure & Barbier · Boumhel El Bassatine',
  address: '52 Av. de Paris',
  city: 'Boumhel El Bassatine',
  phone: '25 180 013',
  email: 'hazemcoiffmegrine@gmail.com',
  instagram_url: 'https://www.instagram.com/hazemcoiff/',
  facebook_url: 'https://www.facebook.com/profile.php?id=61552967307064',
  slot_interval_minutes: '30',
  barber_name: 'Hazem',
  barber_role: 'Maître Coiffeur & Barbier · Note 5,0 / 5 (15 avis)',
  about_title: 'Le souci du détail, l’accueil et la maîtrise du geste.',
  about_bio:
    'Installé au 52 Avenue de Paris à Boumhel El Bassatine, Hazem Coiff vous accueille 7 jours sur 7.',
  hero_image: '/assets/aistudio/image_1a42b0d4.png',
  about_image: '/assets/aistudio/Capture_d__cran_2026-11-12_200313_cbb7a2be.png',
  logo_image: '/assets/aistudio/image_0d689771.png',
};

function isAdminLocation(): boolean {
  const cleanPath = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  const search = new URLSearchParams(window.location.search);
  return (
    cleanPath === '/admin' ||
    cleanPath.startsWith('/admin/') ||
    hash === '#admin' ||
    hash.startsWith('#/admin') ||
    search.has('admin')
  );
}

export default function App() {
  const [data, setData] = useState<PublicBootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<ServiceItem | null>(null);
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() =>
    isAdminLocation() ? 'admin' : 'public'
  );

  const lastSyncRef = useRef<number>(0);

  const loadBootstrap = useCallback(async () => {
    try {
      const res = await fetchPublicBootstrap();
      lastSyncRef.current = Date.now();
      setData(res);
      setLoadError(null);
    } catch {
      setLoadError('Impossible de charger les informations du salon. Veuillez actualiser la page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    let source: EventSource | null = null;
    let pollTimer: number | null = null;
    let errorCount = 0;

    const startPollingFallback = () => {
      if (pollTimer !== null) return;
      pollTimer = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadBootstrap();
          window.dispatchEvent(new CustomEvent('hazem:sync'));
        }
      }, 25000);
    };

    try {
      source = new EventSource('/api/public/events');
      source.onmessage = (event) => {
        errorCount = 0;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed?.serverless) {
            source?.close();
            source = null;
            startPollingFallback();
            return;
          }
          if (parsed?.type === 'refresh') {
            loadBootstrap();
            window.dispatchEvent(new CustomEvent('hazem:sync'));
          }
        } catch {
          // ignore malformed messages
        }
      };
      source.onerror = () => {
        errorCount += 1;
        if (errorCount >= 2) {
          source?.close();
          source = null;
          startPollingFallback();
        }
      };
    } catch {
      startPollingFallback();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastSyncRef.current > 30000) {
        loadBootstrap();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      source?.close();
      if (pollTimer !== null) {
        window.clearInterval(pollTimer);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadBootstrap]);

  useEffect(() => {
    if (!data?.settings?.logo_image) return;
    const iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (iconLink) iconLink.href = data.settings.logo_image;
    const appleLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (appleLink) appleLink.href = data.settings.logo_image;
  }, [data?.settings?.logo_image]);

  useEffect(() => {
    const syncRoute = () => {
      setViewMode(isAdminLocation() ? 'admin' : 'public');
    };
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const openBooking = (service: ServiceItem | null = null) => {
    setPreselectedService(service);
    setBookingOpen(true);
  };

  const enterAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setViewMode('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitAdmin = () => {
    window.history.pushState({}, '', '/');
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (viewMode === 'admin') {
    return (
      <MotionConfig reducedMotion="user">
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 text-xs tracking-[0.2em] uppercase text-[#8C8889]">
              Chargement de l’espace admin...
            </div>
          }
        >
          <AdminDashboard
            initialHours={data?.businessHours ?? FALLBACK_HOURS}
            initialSettings={data?.settings ?? FALLBACK_SETTINGS}
            onExitAdmin={exitAdmin}
            onDataMutated={loadBootstrap}
          />
        </Suspense>
      </MotionConfig>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center">
        <p className="font-[family-name:var(--font-display)] italic text-3xl font-medium text-[#FFFFFF] mb-2">
          Hazem Coiff
        </p>
        <p className="text-xs tracking-[0.2em] uppercase text-[#8C8889]">Chargement du salon</p>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-base text-[#FFFFFF] mb-4">{loadError || 'Erreur inattendue.'}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadBootstrap();
          }}
          className="px-5 py-2.5 text-sm font-semibold text-[#000000] bg-[#FFFFFF] hover:bg-[#CFCFD3] rounded transition-colors duration-200 cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#000000] text-[#FFFFFF]">
        <Navbar
          shopName={data.settings.shop_name}
          logoUrl={data.settings.logo_image}
          onOpenBooking={() => openBooking(null)}
        />

        <main>
          <HeroSection
            settings={data.settings}
            onOpenBooking={() => openBooking(null)}
          />

          <ServicesSection
            services={data.services}
            onSelectServiceForBooking={(svc) => openBooking(svc)}
          />

          <AboutAndPillarsSection
            settings={data.settings}
            onOpenBooking={() => openBooking(null)}
          />

          <GalleryAndReviewsSection gallery={data.gallery} />

          <ContactAndFooter
            settings={data.settings}
            businessHours={data.businessHours}
            onOpenBooking={() => openBooking(null)}
            onOpenAdmin={enterAdmin}
          />
        </main>

        {bookingOpen && (
          <Suspense fallback={null}>
            <BookingModal
              isOpen={bookingOpen}
              services={data.services}
              initialService={preselectedService}
              onClose={() => setBookingOpen(false)}
              onBookingCompleted={loadBootstrap}
            />
          </Suspense>
        )}
      </div>
    </MotionConfig>
  );
}

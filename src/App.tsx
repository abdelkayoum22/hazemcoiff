import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { fetchPublicBootstrap } from './lib/api';
import type { PublicBootstrapData, ServiceItem } from './types/barbershop';
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

function isAdminLocation(): boolean {
  const cleanPath = window.location.pathname.replace(/\/+$/, '');
  return cleanPath === '/admin' || window.location.hash === '#admin';
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
    try {
      source = new EventSource('/api/public/events');
      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed?.type === 'refresh') {
            loadBootstrap();
            window.dispatchEvent(new CustomEvent('hazem:sync'));
          }
        } catch {
          // ignore malformed messages
        }
      };
    } catch {
      // ignore if EventSource unavailable
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastSyncRef.current > 30000) {
        loadBootstrap();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      source?.close();
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
      {viewMode === 'admin' ? (
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 text-xs tracking-[0.2em] uppercase text-[#8C8889]">
              Chargement de l’espace admin...
            </div>
          }
        >
          <AdminDashboard
            initialHours={data.businessHours}
            initialSettings={data.settings}
            onExitAdmin={exitAdmin}
            onDataMutated={loadBootstrap}
          />
        </Suspense>
      ) : (
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
      )}
    </MotionConfig>
  );
}

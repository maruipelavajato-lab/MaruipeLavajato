/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PromoBanner } from './components/PromoBanner';
import { LavagensSection } from './components/LavagensSection';
import { EsteticaSection } from './components/EsteticaSection';
import { CatalogSection } from './components/CatalogSection';
import { DownloadAppSection } from './components/DownloadAppSection';
import { AboutAndContact } from './components/AboutAndContact';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SmartScheduler } from './components/SmartScheduler';
import { SmartSchedulerSection } from './components/SmartSchedulerSection';
import { AdminPanelModal } from './components/AdminPanelModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileAppView } from './components/MobileAppView';
import { ZionAgentModal } from './components/ZionAgentModal';
import { OfflineIndicator } from './components/PWAInstallButton';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';

import { Service, CartItem, Appointment, CompanyConfig, OwnerNotification, Testimonial, FaqItem } from './types';
import { getStoredCompanyConfig } from './config/constants';
import { getStoredServices } from './data/services';
import { getStoredAppointments, getOwnerNotifications } from './utils/scheduling';
import { getStoredTestimonials } from './data/testimonials';
import { getStoredFaqs } from './data/faqs';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Config & Catalog State
  const [config, setConfig] = useState<CompanyConfig>(getStoredCompanyConfig);
  const [services, setServices] = useState<Service[]>(getStoredServices);
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments);
  const [notifications, setNotifications] = useState<OwnerNotification[]>(getOwnerNotifications);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(getStoredTestimonials);
  const [faqs, setFaqs] = useState<FaqItem[]>(getStoredFaqs);

  // Cart State with localStorage persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('maruipe_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('maruipe_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // View Mode: Full Website vs Mobile App (auto-enabled inside Android APK, installed PWA, or ?app=1)
  const [isAppMode, setIsAppMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    const isCapacitor =
      Boolean(cap?.isNativePlatform?.()) ||
      window.location.protocol === 'capacitor:' ||
      (window.location.hostname === 'localhost' && window.location.port === '');
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const params = new URLSearchParams(window.location.search);
    return isCapacitor || isStandalone || params.get('app') === '1';
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleInitialService, setScheduleInitialService] = useState<Service | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isZionOpen, setIsZionOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart Handlers
  const handleAddToCart = (service: Service) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
    showToast(`"${service.name}" adicionado ao carrinho!`);
  };

  const handleUpdateCartQuantity = (serviceId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(serviceId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.service.id === serviceId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (serviceId: string) => {
    setCartItems((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Schedule Handlers
  const handleOpenSchedule = (service?: Service) => {
    setScheduleInitialService(service || null);
    setIsScheduleOpen(true);
  };

  const handleAppointmentBooked = (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    const updatedNotifications = getOwnerNotifications();
    setNotifications(updatedNotifications);
    showToast('Agendamento confirmado com sucesso!');
  };

  const scrollToSection = (id: string) => {
    try {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) {
      console.warn('Falha no scroll suave:', e);
    }
  };

  const promoService = services.find((s) => s.id === 'lavagem-especial') || services[0];
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Render Mobile App Mode if active (default inside Android APK and installed PWA)
  if (isAppMode) {
    return (
      <div className="bg-neutral-950 text-neutral-100 min-h-screen">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-amber-500 text-neutral-950 px-4 py-2 rounded-xl font-bold text-xs shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
        <MobileAppView
          services={services}
          config={config}
          cartItems={cartItems}
          appointments={appointments}
          onAppointmentBooked={handleAppointmentBooked}
          onAddToCart={handleAddToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onSwitchToWebsite={() => setIsAppMode(false)}
          onOpenZion={() => setIsZionOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
        />
        <ZionAgentModal
          isOpen={isZionOpen}
          onClose={() => setIsZionOpen(false)}
          services={services}
          config={config}
          onOpenSchedule={(svc) => {
            setIsAppMode(false);
            handleOpenSchedule(svc);
          }}
          onAddToCart={handleAddToCart}
        />
        <AdminPanelModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          config={config}
          onUpdateConfig={setConfig}
          services={services}
          onUpdateServices={setServices}
          appointments={appointments}
          onUpdateAppointments={setAppointments}
          notifications={notifications}
          onUpdateNotifications={setNotifications}
          testimonials={testimonials}
          onUpdateTestimonials={setTestimonials}
          faqs={faqs}
          onUpdateFaqs={setFaqs}
        />
        <PrivacyPolicyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
          config={config}
        />
        <OfflineIndicator />
      </div>
    );
  }

  // Render Full Website
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 bg-amber-500 text-neutral-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        config={config}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSchedule={() => handleOpenSchedule()}
        onOpenAppDownload={() => scrollToSection('baixar-app')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenZion={() => setIsZionOpen(true)}
        isAppMode={isAppMode}
        onToggleAppMode={() => setIsAppMode(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          config={config}
          onOpenSchedule={() => handleOpenSchedule()}
          onViewServices={() => scrollToSection('lavagens')}
          onOpenCatalog={() => scrollToSection('catalogo')}
        />

        {/* Promo Highlight Banner */}
        <PromoBanner
          promoService={promoService}
          config={config}
          onAddToCart={handleAddToCart}
          onOpenSchedule={handleOpenSchedule}
        />

        {/* Lavagens Section */}
        <LavagensSection
          services={services}
          onAddToCart={handleAddToCart}
          onOpenSchedule={handleOpenSchedule}
        />

        {/* Estética Automotiva Section */}
        <EsteticaSection
          services={services}
          config={config}
          onAddToCart={handleAddToCart}
          onOpenSchedule={handleOpenSchedule}
        />

        {/* Full Catalog Section */}
        <CatalogSection
          services={services}
          onAddToCart={handleAddToCart}
          onOpenSchedule={handleOpenSchedule}
        />

        {/* Customer Testimonials Section */}
        <TestimonialsSection
          testimonials={testimonials}
          onOpenSchedule={() => handleOpenSchedule()}
        />

        {/* Smart Scheduling In-Page Section (id="agendamento") */}
        <SmartSchedulerSection
          services={services}
          config={config}
          appointments={appointments}
          onAppointmentBooked={handleAppointmentBooked}
        />

        {/* Download App Section (Parte 3) */}
        <DownloadAppSection
          config={config}
          onOpenMobileAppMode={() => setIsAppMode(true)}
        />

        {/* Frequently Asked Questions Section */}
        <FaqSection
          faqs={faqs}
          config={config}
          onOpenZion={() => setIsZionOpen(true)}
        />

        {/* About & Contact Section */}
        <AboutAndContact
          config={config}
          onOpenSchedule={() => handleOpenSchedule()}
        />
      </main>

      {/* Footer */}
      <Footer
        config={config}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAppDownload={() => scrollToSection('baixar-app')}
        onOpenSchedule={() => handleOpenSchedule()}
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
      />

      {/* Floating WhatsApp, Agente IA Zion and Mobile Quick Bar */}
      <FloatingWhatsApp
        config={config}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSchedule={() => handleOpenSchedule()}
        onOpenAppDownload={() => scrollToSection('baixar-app')}
        onOpenZion={() => setIsZionOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        config={config}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onAppointmentBooked={handleAppointmentBooked}
      />

      {/* Smart Scheduling Modal */}
      <SmartScheduler
        services={services}
        initialService={scheduleInitialService}
        config={config}
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setScheduleInitialService(null);
        }}
        onAppointmentBooked={handleAppointmentBooked}
      />

      {/* Administration Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onUpdateConfig={setConfig}
        services={services}
        onUpdateServices={setServices}
        appointments={appointments}
        onUpdateAppointments={setAppointments}
        notifications={notifications}
        onUpdateNotifications={setNotifications}
        testimonials={testimonials}
        onUpdateTestimonials={setTestimonials}
        faqs={faqs}
        onUpdateFaqs={setFaqs}
      />

      {/* Agente IA Zion Modal */}
      <ZionAgentModal
        isOpen={isZionOpen}
        onClose={() => setIsZionOpen(false)}
        services={services}
        config={config}
        onOpenSchedule={handleOpenSchedule}
        onAddToCart={handleAddToCart}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        config={config}
      />

      <OfflineIndicator />

    </div>
  );
}

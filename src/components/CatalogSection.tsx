import React, { useState } from 'react';
import { ShoppingBag, Calendar, Search, Clock, X } from 'lucide-react';
import { Service, ServiceCategory } from '../types';

interface CatalogSectionProps {
  services: Service[];
  onAddToCart: (service: Service) => void;
  onOpenSchedule: (service: Service) => void;
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  services,
  onAddToCart,
  onOpenSchedule,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = normalizeSearchText(searchQuery.trim());

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    if (!normalizedQuery) return matchesCategory;
    const matchesSearch =
      normalizeSearchText(service.name).includes(normalizedQuery) ||
      normalizeSearchText(service.description).includes(normalizedQuery) ||
      (service.includes?.some((inc) => normalizeSearchText(inc).includes(normalizedQuery)) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalogo" className="py-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold tracking-widest text-amber-500 uppercase mb-2">
              Menu Completo de Serviços
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              CATÁLOGO DE SERVIÇOS
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl">
              Escolha os serviços desejados, adicione ao carrinho para combinar atendimentos ou agende diretamente com hora marcada.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar serviço pelo nome (ex: Vitrificação, Polimento)..."
              aria-label="Pesquisar serviço pelo nome"
              className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar pesquisa"
                className="p-1 rounded-lg text-neutral-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-2 pb-6 overflow-x-auto border-b border-neutral-850 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-850'
            }`}
          >
            Todos os Serviços ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('lavagens')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'lavagens'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-850'
            }`}
          >
            Lavagens Automotivas
          </button>
          <button
            onClick={() => setSelectedCategory('estetica')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'estetica'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-850'
            }`}
          >
            Estética & Detalhamento
          </button>
        </div>

        {/* Catalog Items Grid */}
        {filteredServices.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 text-center space-y-3">
            <Search className="w-8 h-8 text-neutral-500 mx-auto" />
            <p className="text-sm sm:text-base font-bold text-white">
              Nenhum serviço encontrado para “{searchQuery}”
            </p>
            <p className="text-xs sm:text-sm text-neutral-400">
              Tente buscar outro termo ou limpe os filtros para ver todo o catálogo.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="py-2 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:brightness-110 transition-all"
            >
              Mostrar Todos os Serviços
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col justify-between rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 p-5 transition-all"
            >
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-neutral-950 border border-neutral-800/80">
                  <img
                    src={service.image}
                    alt={service.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-neutral-950/80 text-[11px] font-medium text-neutral-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>~{service.durationMinutes} min</span>
                  </div>
                  {service.isPromo && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-amber-500 text-neutral-950 text-[11px] font-black uppercase tracking-wider">
                      Oferta
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display text-xl font-bold text-white">
                    {service.name}
                  </h3>
                  <div className="text-right shrink-0">
                    {service.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        {service.pricePrefix && (
                          <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                            {service.pricePrefix}
                          </span>
                        )}
                        <span className="text-xs font-bold text-amber-400">R$</span>
                        <span className="font-display text-xl font-black text-white">
                          {service.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">
                        {service.priceLabel || 'Consultar preço'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                  {service.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-800/70 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddToCart(service)}
                  className="py-2.5 px-3 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Carrinho</span>
                </button>
                <button
                  onClick={() => onOpenSchedule(service)}
                  className="py-2.5 px-3 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>
    </section>
  );
};

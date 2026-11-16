import React, { useState } from 'react';
import { NewsAnnouncement, UserProfile } from '../../types';
import {
  Search,
  Calendar,
  Clock,
  User,
  Share2,
  Printer,
  ChevronLeft,
  AlertTriangle,
  Check,
  Tag,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  X,
  Maximize2,
} from 'lucide-react';

interface NewsBlogViewProps {
  news: NewsAnnouncement[];
  selectedArticleId?: string;
  currentUser?: UserProfile | null;
  onBackToHome: () => void;
  onNavigateToResident: (tab?: string) => void;
}

export const NewsBlogView: React.FC<NewsBlogViewProps> = ({
  news,
  selectedArticleId,
  currentUser,
  onBackToHome,
  onNavigateToResident,
}) => {
  const [activeArticleId, setActiveArticleId] = useState<string>(
    selectedArticleId || news[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  // Active article being read
  const currentArticle = news.find((n) => n.id === activeArticleId) || news[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://pinardelrio.cr/#noticias/${currentArticle?.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered news list for side navigation or catalog
  const filteredList = news.filter((item) => {
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-emerald-900 text-white py-8 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 text-emerald-200 hover:text-white text-xs font-semibold mb-2 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver al Inicio</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Noticias & Comunicados Oficiales
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                Boletín informativo y avisos oficiales para condóminos de Residencial Pinar del Río.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-emerald-300 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar comunicado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-700/80 text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto text-xs pb-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              Todos ({news.length})
            </button>
            <button
              onClick={() => setCategoryFilter('mantenimiento')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === 'mantenimiento'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              Mantenimiento
            </button>
            <button
              onClick={() => setCategoryFilter('asamblea')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === 'asamblea'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              Asambleas
            </button>
            <button
              onClick={() => setCategoryFilter('comunicado')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === 'comunicado'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              Comunicados Generales
            </button>
          </div>
        </div>
      </div>

      {/* Main Blog Container (Editorial 2-Column Split) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Reading Area (Column Left 8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            {currentArticle ? (
              <div>
                {/* Hero Article Image */}
                {currentArticle.image && (
                  <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-slate-900">
                    <img
                      src={currentArticle.image}
                      alt={currentArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    {/* Floating pill tags on image */}
                    <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-800/90 text-white font-bold text-[11px] uppercase tracking-wider backdrop-blur-xs">
                          {currentArticle.category}
                        </span>
                        {currentArticle.urgent && (
                          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>URGENTE</span>
                          </span>
                        )}
                      </div>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {currentArticle.readTime || '3 min lectura'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Article Body */}
                <div className="p-6 sm:p-10">
                  {/* Metadata bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        PR
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{currentArticle.author}</p>
                        <p className="text-[11px] text-slate-400">Residencial Pinar del Río</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentArticle.date}</span>
                      </span>
                      <span>•</span>
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                        title="Copiar enlace"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="no-print inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Imprimir comunicado"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir</span>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-6 tracking-tight leading-snug">
                    {currentArticle.title}
                  </h2>

                  {/* Lead Summary */}
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 font-medium text-sm leading-relaxed">
                    {currentArticle.summary}
                  </div>

                  {/* Full Text Content */}
                  <div className="mt-6 text-sm text-slate-700 leading-relaxed space-y-4">
                    <p className="text-base leading-relaxed text-slate-800 font-normal">
                      {currentArticle.content}
                    </p>

                    {/* Galería de Fotos del Comunicado (Soporte de 1 a 10 imágenes) */}
                    {currentArticle.photos && currentArticle.photos.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            <span>📸 Galería de Imágenes ({currentArticle.photos.length} de máx. 10)</span>
                          </h4>
                          <span className="text-[11px] text-slate-400">Haz clic en cualquier foto para ampliar</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {currentArticle.photos.map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => setExpandedPhoto(photoUrl)}
                              className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video cursor-pointer hover:border-emerald-600 transition-all shadow-xs"
                            >
                              <img
                                src={photoUrl}
                                alt={`Foto ${pIdx + 1} de ${currentArticle.title}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-opacity">
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Ver</span>
                                </span>
                              </div>
                              <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                                #{pIdx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Condominium Verification Badge */}
                    <div className="mt-10 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Validez y Comunicación Legal • Ley N.º 7933</span>
                      </div>
                      <p>
                        Este comunicado ha sido emitido a través de los canales digitales oficiales de Residencial Pinar del Río para el conocimiento de todos los condóminos, propietarios y residentes.
                      </p>
                    </div>

                    {/* Context Action based on Category */}
                    {currentArticle.category === 'asamblea' && (
                      <div className="mt-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-sky-950">¿Deseas verificar si estás al día para la asamblea?</p>
                          <p className="text-sky-700 mt-0.5">El derecho a voto requiere estar al día en cuotas condominales.</p>
                        </div>
                        <button
                          onClick={() => onNavigateToResident('invoices')}
                          className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl whitespace-nowrap cursor-pointer"
                        >
                          Ver mi estado de cuenta
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Selecciona un comunicado para leerlo.
              </div>
            )}
          </div>

          {/* Sidebar: All News Articles List (Column Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Otros Comunicados ({filteredList.length})</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Pinar del Río</span>
              </div>

              <div className="divide-y divide-slate-100 mt-3 max-h-[600px] overflow-y-auto space-y-3">
                {filteredList.map((item) => {
                  const isCurrent = item.id === activeArticleId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveArticleId(item.id)}
                      className={`pt-3 first:pt-0 p-3 rounded-2xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50/80 border border-emerald-300 shadow-2xs'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold uppercase tracking-wider text-emerald-800">
                          {item.category}
                        </span>
                        <span className="text-slate-400 font-mono">{item.date}</span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {item.summary}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Por {item.author}</span>
                        {isCurrent ? (
                          <span className="text-emerald-700 font-bold">Leyendo ahora</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <span>Leer</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Resident Card Widget in Blog Sidebar */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-6 text-white shadow-xl">
              <h4 className="font-bold text-sm">¿Deseas pagar tu cuota?</h4>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Reporta tu comprobante por SINPE Móvil al <strong>8888-7462</strong> o transferencia bancaria en minutos.
              </p>
              <button
                onClick={() => onNavigateToResident('pay')}
                className="mt-4 w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Pagar Cuota en Línea
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Lightbox para Ampliar Imagen */}
      {expandedPhoto && (
        <div
          onClick={() => setExpandedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              onClick={() => setExpandedPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer z-10 transition-colors"
              title="Cerrar vista ampliada"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedPhoto}
              alt="Vista ampliada"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

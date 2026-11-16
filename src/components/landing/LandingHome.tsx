import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Unit,
  NewsAnnouncement,
  CommunityEvent,
  Amenity,
} from '../../types';
import { CONDO_BANK_INFO } from '../../data/mockData';
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  BookOpen,
  Sparkles,
  Calendar,
  Landmark,
  Copy,
  Check,
  Plus,
  Image as ImageIcon,
  AlertTriangle,
  CreditCard,
  X,
  Clock,
  Wrench,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface LandingHomeProps {
  currentUser: UserProfile | null;
  currentUnit?: Unit;
  news: NewsAnnouncement[];
  events: CommunityEvent[];
  amenities: Amenity[];
  onNavigateToResident: (tab?: string) => void;
  onOpenNewsBlog: (articleId?: string) => void;
  onOpenAiAssistant: (prompt?: string) => void;
  onOpenAuth: () => void;
  onPublishNews?: (article: Omit<NewsAnnouncement, 'id'>) => void;
}

const PRESET_IMAGES = [
  {
    label: 'Condominio & Entorno',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Casa Club & Salón',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Mantenimiento & Obras',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Seguridad & Acceso',
    url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Piscina & Recreación',
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Senderos & Naturaleza',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  },
];

export const LandingHome: React.FC<LandingHomeProps> = ({
  currentUser,
  currentUnit,
  news,
  events,
  amenities,
  onNavigateToResident,
  onOpenNewsBlog,
  onOpenAiAssistant,
  onOpenAuth,
  onPublishNews,
}) => {
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Utility modals & copy states
  const [copiedSinpe, setCopiedSinpe] = useState(false);
  const [copiedIbanIndex, setCopiedIbanIndex] = useState<number | null>(null);
  const [showReglamentoModal, setShowReglamentoModal] = useState(false);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);

  // New Article Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'comunicado' | 'mantenimiento' | 'asamblea' | 'evento'>('comunicado');
  const [newAuthor, setNewAuthor] = useState('Administración General');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState(PRESET_IMAGES[0].url);
  const [newIsUrgent, setNewIsUrgent] = useState(false);
  const [newReadTime, setNewReadTime] = useState('3 min lectura');
  const [formError, setFormError] = useState('');

  const SLIDE_DURATION_MS = 6500;
  const INTERVAL_STEP = 50;

  // Auto-play timer with progress bar
  useEffect(() => {
    if (!isAutoPlaying || news.length === 0) {
      setProgress(0);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + (INTERVAL_STEP / SLIDE_DURATION_MS) * 100;
      });
    }, INTERVAL_STEP);

    return () => clearInterval(timer);
  }, [isAutoPlaying, currentSlide, news.length]);

  const changeSlide = (newIndex: number, dir: 'next' | 'prev') => {
    if (isAnimating || news.length === 0) return;
    setIsAnimating(true);
    setDirection(dir);
    setCurrentSlide(newIndex);
    setProgress(0);
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  const handleNextSlide = () => {
    const nextIdx = (currentSlide + 1) % news.length;
    changeSlide(nextIdx, 'next');
  };

  const handlePrevSlide = () => {
    const prevIdx = (currentSlide - 1 + news.length) % news.length;
    changeSlide(prevIdx, 'prev');
  };

  const activeNotice = news[currentSlide] || news[0];

  const copySinpeNumber = () => {
    navigator.clipboard.writeText(CONDO_BANK_INFO.sinpePhone);
    setCopiedSinpe(true);
    setTimeout(() => setCopiedSinpe(false), 2000);
  };

  const copyIban = (iban: string, idx: number) => {
    navigator.clipboard.writeText(iban);
    setCopiedIbanIndex(idx);
    setTimeout(() => setCopiedIbanIndex(null), 2000);
  };

  // Handle image upload from disk
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit for adding a new announcement
  const handleSaveNewAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('El título del aviso es obligatorio.');
      return;
    }
    if (!newSummary.trim()) {
      setFormError('Ingresa un resumen para el carrusel.');
      return;
    }
    if (!newImageUrl.trim()) {
      setFormError('Selecciona o carga una imagen para el comunicado.');
      return;
    }

    const today = new Date().toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    if (onPublishNews) {
      onPublishNews({
        title: newTitle.trim(),
        category: newCategory,
        date: today,
        author: newAuthor.trim() || 'Administración',
        summary: newSummary.trim(),
        content: newContent.trim() || newSummary.trim(),
        urgent: newIsUrgent,
        image: newImageUrl.trim(),
        readTime: newReadTime || '3 min lectura',
      });
    }

    // Reset and select slide 0 (newly added)
    setCurrentSlide(0);
    setProgress(0);
    setShowAddNewsModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Container: Full desktop presence (1440px), optimized margins */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full space-y-7">

        {/* ========================================================================= */}
        {/* SEGMENTO PRINCIPAL HERO: CARRUSEL DE NOTICIAS & AVISOS (FULL WIDTH)      */}
        {/* ========================================================================= */}
        <section
          aria-label="Carrusel de Noticias y Avisos Oficiales"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300"
        >
          {/* Carousel Top Control Bar */}
          <div className="px-5 sm:px-7 py-3.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/80">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lime-400 text-emerald-950 flex items-center justify-center font-black shadow-xs shrink-0">
                <Megaphone className="w-4 h-4 text-emerald-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-white">
                    Noticias & Avisos Oficiales
                  </h2>
                  <span className="hidden sm:inline-block bg-lime-400/20 text-lime-300 border border-lime-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Boletín de la Comunidad
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  Residencial Pinar del Río • Comunicados de la Junta y Administración
                </p>
              </div>
            </div>

            {/* Action Tools & Playback Navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Button: Agregar Noticia con Imagen */}
              {currentUser?.role === 'admin' && <button
                onClick={() => setShowAddNewsModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                title="Publicar nuevo comunicado con imagen"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agregar Aviso</span>
              </button>}

              {/* Button: Expandir al Blog Oficial */}
              <button
                onClick={() => onOpenNewsBlog()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer border border-emerald-700/60"
                title="Abrir vista de blog para ver todas las publicaciones"
              >
                <BookOpen className="w-3.5 h-3.5 text-lime-300" />
                <span>Ver en Blog</span>
              </button>

              {/* Slider Controls: Prev, Play/Pause, Next */}
              <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/50 rounded-xl p-0.5 shadow-inner">
                <button
                  onClick={handlePrevSlide}
                  className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/80 transition-colors cursor-pointer"
                  title="Aviso anterior"
                  aria-label="Aviso anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                    isAutoPlaying
                      ? 'text-lime-300 bg-emerald-800/70'
                      : 'text-emerald-400 hover:text-white hover:bg-emerald-800/50'
                  }`}
                  title={isAutoPlaying ? 'Pausar rotación automática' : 'Reanudar rotación automática'}
                  aria-label="Alternar rotación automática"
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleNextSlide}
                  className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/80 transition-colors cursor-pointer"
                  title="Aviso siguiente"
                  aria-label="Aviso siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Autoplay Progress Line */}
          <div className="w-full bg-slate-100 h-1 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-700 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Hero Slide Main Stage: Full Width Showcase with Split Media/Content */}
          {activeNotice && (
            <div className="p-6 sm:p-8 lg:p-10">
              <div
                key={activeNotice.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center transition-all duration-300 ease-out ${
                  direction === 'next'
                    ? 'animate-in fade-in slide-in-from-right-4 duration-300'
                    : 'animate-in fade-in slide-in-from-left-4 duration-300'
                }`}
              >
                {/* LEFT: Cinematic Hero Image (7 cols desktop) */}
                <div
                  onClick={() => onOpenNewsBlog(activeNotice.id)}
                  className="lg:col-span-7 h-72 sm:h-96 lg:h-[430px] rounded-2xl sm:rounded-3xl overflow-hidden relative bg-slate-900 shadow-lg cursor-pointer group"
                >
                  <img
                    src={activeNotice.image || PRESET_IMAGES[0].url}
                    alt={activeNotice.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Overlaid Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-emerald-900/90 text-lime-300 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md border border-emerald-700/50 shadow-md">
                        {activeNotice.category}
                      </span>
                      {activeNotice.urgent && (
                        <span className="px-3 py-1 rounded-lg bg-red-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-md animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>COMUNICADO URGENTE</span>
                        </span>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-white font-mono text-[10px] backdrop-blur-md border border-slate-700">
                      {currentSlide + 1} / {news.length}
                    </span>
                  </div>

                  {/* Bottom Image Overlay Caption */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                    <div className="flex items-center gap-2 text-slate-200 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-lime-400" />
                      <span>{activeNotice.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-300 text-[11px] bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Clock className="w-3 h-3" />
                      <span>{activeNotice.readTime || '3 min'}</span>
                    </div>
                  </div>

                  {/* Hover prompt */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                    <span className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-4 h-4 text-emerald-800" />
                      <span>Click para expandir al Blog</span>
                    </span>
                  </div>
                </div>

                {/* RIGHT: Editorial Content & Direct Actions (5 cols desktop) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                  <div className="space-y-3.5">
                    {/* Meta info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-100">
                        {activeNotice.author}
                      </span>
                      <span>•</span>
                      <span>Publicación Oficial</span>
                    </div>

                    {/* Headline */}
                    <h3
                      onClick={() => onOpenNewsBlog(activeNotice.id)}
                      className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug cursor-pointer hover:text-emerald-800 transition-colors"
                    >
                      {activeNotice.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activeNotice.summary}
                    </p>

                    {/* Full Preview Snippet */}
                    {activeNotice.content && activeNotice.content !== activeNotice.summary && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                        "{activeNotice.content.slice(0, 180)}..."
                      </div>
                    )}
                  </div>

                  {/* Primary Call-To-Action (Expandir al Blog) */}
                  <div className="pt-2 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Main Action: Leer en el Blog */}
                      <button
                        onClick={() => onOpenNewsBlog(activeNotice.id)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer group"
                      >
                        <span>Leer Comunicado Completo en el Blog</span>
                        <ArrowRight className="w-4 h-4 text-lime-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Secondary: Preguntar a la IA */}
                      <button
                        onClick={() =>
                          onOpenAiAssistant(
                            `Explícame detalladamente las implicaciones del comunicado: "${activeNotice.title}" para los condóminos de Pinar del Río.`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        title="Hacer consultas sobre este comunicado"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Consultar IA</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>💡</span>
                      <span>Puedes hacer clic en cualquier comunicado para ver el texto íntegro en formato editorial.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Thumbnail Rail */}
              <div className="mt-8 pt-5 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Todos los Avisos del Carrusel ({news.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Selecciona una tarjeta para ir al aviso directamente:
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {news.map((item, idx) => {
                    const isSelected = currentSlide === idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => changeSlide(idx, idx > currentSlide ? 'next' : 'prev')}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Indicator tab */}
                        {isSelected && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-700" />
                        )}

                        <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                          <span
                            className={`font-bold ${
                              isSelected ? 'text-emerald-800' : 'text-slate-500'
                            }`}
                          >
                            #{idx + 1} {item.category}
                          </span>
                          {item.urgent && (
                            <span className="w-2 h-2 rounded-full bg-red-500" title="Urgente" />
                          )}
                        </div>

                        <p
                          className={`text-[11px] font-bold line-clamp-2 leading-tight ${
                            isSelected ? 'text-emerald-950' : 'text-slate-700 group-hover:text-slate-900'
                          }`}
                        >
                          {item.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* BARRA DE ACCESO RÁPIDO PARA USUARIOS (SINPE, PORTAL & REGLAMENTO)         */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
            {/* Quick Access Info for Guests */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                PR
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {currentUser && currentUnit
                    ? `Filial activa: ${currentUnit.number} • ${currentUser.name}`
                    : 'Portal de Autoservicio del Condómino'}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentUser && currentUnit
                    ? `Saldo actual: ₡${currentUnit.currentBalance.toLocaleString('es-CR')} • Cuota: ₡${currentUnit.monthlyQuota.toLocaleString('es-CR')}`
                    : 'Consulta tus cuotas al día, descarga facturas oficiales (Ley 7933) o reserva áreas comunes.'}
                </p>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* SINPE 1-Click Copy */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-xs text-slate-600 font-medium">SINPE:</span>
                <span className="font-mono text-xs font-black text-slate-900">
                  {CONDO_BANK_INFO.sinpePhone}
                </span>
                <button
                  onClick={copySinpeNumber}
                  className="ml-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-slate-200"
                  title="Copiar número de SINPE"
                >
                  {copiedSinpe ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copiedSinpe ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Reglamento */}
              <button
                onClick={() => setShowReglamentoModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                <span>Reglamento Ley 7933</span>
              </button>

              {/* Portal Login / Go to Portal */}
              {currentUser ? (
                <button
                  onClick={() => onNavigateToResident('overview')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span>Ir a Mi Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                  <span>Ingresar con mi Filial</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* COMPONENTES COMPLEMENTARIOS: EVENTOS, CUENTAS Y AMENIDADES                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Card 1: Próximos Eventos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Calendario Comunitario</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">2026</span>
              </div>

              <div className="space-y-3">
                {events.slice(0, 2).map((ev) => (
                  <div key={ev.id} className="flex gap-3 items-start">
                    <div className="bg-emerald-800 text-white rounded-xl p-2 text-center shrink-0 w-11 shadow-2xs">
                      <span className="block text-sm font-extrabold font-mono leading-none">{ev.dayBadge}</span>
                      <span className="block text-[8px] font-bold uppercase mt-0.5 text-emerald-200">{ev.monthBadge}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-snug">{ev.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{ev.location} • {ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">¿Dudas normativas?</span>
              <button
                onClick={() => setShowReglamentoModal(true)}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Reglamento Interno
              </button>
            </div>
          </div>

          {/* Card 2: Cuentas Bancarias IBAN */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-sky-700" />
                  <span>Cuentas Bancarias IBAN</span>
                </h4>
                <span className="text-[10px] text-slate-400">Oficial</span>
              </div>

              <div className="space-y-2.5">
                {CONDO_BANK_INFO.accounts.map((acc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{acc.bank}</span>
                      <button
                        onClick={() => copyIban(acc.iban, idx)}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedIbanIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        <span>{copiedIbanIndex === idx ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 mt-0.5 truncate select-all">{acc.iban}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 text-[10px] text-slate-400">
              {CONDO_BANK_INFO.legalEntity} • Cédula {CONDO_BANK_INFO.legalId}
            </p>
          </div>

          {/* Card 3: Amenidades & Reservas */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Áreas Comunes</span>
                </h4>
                <span className="text-[10px] text-emerald-700 font-bold">4 Áreas</span>
              </div>

              <div className="space-y-2">
                {amenities.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">{a.name}</p>
                      <p className="text-[10px] text-slate-500">Aforo: {a.capacity} pers. • {a.schedule.split(':')[0]}</p>
                    </div>
                    <button
                      onClick={() => onNavigateToResident('reservations')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] cursor-pointer"
                    >
                      Reservar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">¿Avería en zonas verdes?</span>
              <button
                onClick={() => onNavigateToResident('tickets')}
                className="text-slate-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Wrench className="w-3 h-3 text-slate-500" />
                <span>Reportar avería</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MINIMAL QUIET FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-400 mt-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">Residencial Pinar del Río</p>
            <p className="text-[11px]">{CONDO_BANK_INFO.legalEntity} • Cédula Jurídica {CONDO_BANK_INFO.legalId}</p>
          </div>
          <div className="text-[11px] space-y-0.5">
            <p>Atención Administración: +506 2293-4500 • Belén, Costa Rica</p>
            <p className="text-slate-400">Régimen de Propiedad en Condominio Ley N.º 7933</p>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR NUEVO COMUNICADO / NOTICIA CON IMAGEN                      */}
      {/* ========================================================================= */}
      {showAddNewsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4 text-lime-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Agregar Noticia o Aviso con Imagen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Se publicará en el carrusel principal y en el blog de condóminos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddNewsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewAnnouncement} className="mt-4 space-y-4 text-xs">
              {/* Título */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Título del Comunicado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Mantenimiento Preventivo de Portones Principales"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
                  required
                />
              </div>

              {/* Categoría y Autor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs bg-white"
                  >
                    <option value="comunicado">Comunicado General</option>
                    <option value="mantenimiento">Mantenimiento & Obras</option>
                    <option value="asamblea">Asamblea de Propietarios</option>
                    <option value="evento">Evento Comunitario</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Autor / Emisor</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Administración General"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
                  />
                </div>
              </div>

              {/* Resumen */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resumen para el Carrusel <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Breve párrafo introductorio visible en la diapositiva..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
                  required
                />
              </div>

              {/* Contenido Completo (Blog) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contenido Completo (Para lectura extendida en el Blog)
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Escribe los detalles completos del comunicado, fechas, instrucciones para condóminos..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
                />
              </div>

              {/* Selección de Imagen */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Imagen del Comunicado <span className="text-red-500">*</span>
                </label>

                {/* Preset Gallery */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                        newImageUrl === preset.url
                          ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      {newImageUrl === preset.url && (
                        <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom URL or File Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">O pega una URL directa:</span>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">O sube un archivo local:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Image Preview */}
                {newImageUrl && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-900">
                    <img
                      src={newImageUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-2 bg-slate-950/70 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-xs">
                      Vista previa de la imagen seleccionada
                    </span>
                  </div>
                )}
              </div>

              {/* Urgente Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={newIsUrgent}
                  onChange={(e) => setNewIsUrgent(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                />
                <label htmlFor="urgentNotice" className="font-semibold text-slate-800 cursor-pointer">
                  Marcar como Comunicado Urgente (destacado en rojo y badge animado)
                </label>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNewsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Megaphone className="w-3.5 h-3.5 text-lime-400" />
                  <span>Publicar en Carrusel y Blog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGLAMENTO MODAL */}
      {showReglamentoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Estatutos & Reglamento Interno
                </h3>
                <p className="text-xs text-slate-500">
                  Residencial Pinar del Río • Conforme a Ley N.º 7933
                </p>
              </div>
              <button
                onClick={() => setShowReglamentoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900">1. Cuotas de Mantenimiento y Pagos (Art. 21 Ley 7933)</h4>
                <p className="mt-1">
                  Las cuotas vencen el día 05 de cada mes. A partir del día 06 la cuenta incurre en recargo por interés moratorio del 3% mensual. Los comprobantes deben ser reportados por el portal con el código PAY generado.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">2. Horarios de Silencio y Convivencia</h4>
                <p className="mt-1">
                  El cese de música a alto volumen y ruidos molestos rige estrictamente de 22:00 a 06:00 horas todos los días.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">3. Mascotas en Áreas Comunes</h4>
                <p className="mt-1">
                  Pasear siempre provistos de correa y bajo supervisión. Los desechos deben recogerse de inmediato. Queda prohibido el ingreso al vaso de la piscina semiolímpica.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">4. Uso de Áreas Comunes (BBQ y Casa Club)</h4>
                <p className="mt-1">
                  Las reservas deben efectuarse mediante el portal digital con un mínimo de 48 horas. Se debe respetar el aforo máximo y entregar el área aseada.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowReglamentoModal(false)}
                className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs hover:bg-emerald-900 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

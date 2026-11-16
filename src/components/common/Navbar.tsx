import React, { useState } from 'react';
import { UserProfile, AppNotification } from '../../types';
import { PinarLogo } from './PinarLogo';
import {
  Bell,
  User,
  Shield,
  Building2,
  Menu,
  X,
  CreditCard,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  FileText,
  Calendar,
} from 'lucide-react';

export type AppView = 'landing' | 'news' | 'resident' | 'admin' | 'employee';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: () => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  notifications,
  onMarkNotificationRead,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
            title="Ir a inicio de Pinar del Río"
          >
            <PinarLogo size="sm" />
          </button>

          {/* Zone 2: Navigation Links (single-line, clean text) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'landing' ? 'text-emerald-800 font-bold border-b-2 border-emerald-700 pb-0.5' : ''
              }`}
            >
              Inicio & Comunidad
            </button>
            <button
              onClick={() => onNavigate('news')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'news' ? 'text-emerald-800 font-bold border-b-2 border-emerald-700 pb-0.5' : ''
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Noticias & Blog</span>
            </button>
            <button
              onClick={() => onNavigate('resident')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'resident' ? 'text-emerald-800 font-bold border-b-2 border-emerald-700 pb-0.5' : ''
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-sky-600" />
              <span>Portal de Pagos & Condómino</span>
            </button>
            {currentUser && currentUser.role === 'admin' ? (
              <button
                onClick={() => onNavigate('admin')}
                className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin' ? 'text-emerald-800 font-bold border-b-2 border-emerald-700 pb-0.5' : ''
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Panel Administración</span>
              </button>
            ) : null}
            {currentUser && currentUser.role === 'employee' ? (
              <button
                onClick={() => onNavigate('employee')}
                className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'employee' ? 'text-emerald-800 font-bold border-b-2 border-emerald-700 pb-0.5' : ''
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                <span>Mi Portal Funcionario (Horario & Colillas)</span>
              </button>
            ) : null}
          </nav>

          {/* Zone 3: Session State, Notifications & Role Trigger */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notificaciones del condominio"
                aria-label="Abrir notificaciones"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Notificaciones ({unreadCount} nuevas)
                    </span>
                    <span className="text-[10px] text-slate-400">Pinar del Río</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No hay notificaciones</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                            !notif.read ? 'bg-emerald-50/50 font-medium' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-slate-900 font-semibold">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{notif.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-700 bg-slate-50 hover:bg-white text-xs text-slate-800 transition-all cursor-pointer shadow-2xs group"
                title="Ver perfil o cambiar de filial"
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    currentUser.role === 'admin'
                      ? 'bg-sky-100 text-sky-800'
                      : currentUser.role === 'board'
                      ? 'bg-amber-100 text-amber-800'
                      : currentUser.role === 'employee'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : currentUser.role === 'board' ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : currentUser.role === 'employee' ? (
                    <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="font-semibold text-[11px] text-slate-900 truncate max-w-28">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-emerald-700 font-medium">
                    {currentUser.unitNumber || currentUser.roleTitle}
                  </span>
                </div>

                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group"
              >
                <User className="w-3.5 h-3.5 text-lime-400" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            {/* Mobile menu burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú móvil"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-150">
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                currentView === 'landing' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
              }`}
            >
              Inicio & Comunidad
            </button>
            <button
              onClick={() => {
                onNavigate('resident');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                currentView === 'resident' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
              }`}
            >
              <span>Portal de Pagos & Condómino</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                SINPE Móvil
              </span>
            </button>
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                currentView === 'admin' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
              }`}
            >
              <span>Panel de Administración</span>
              <span className="text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                Operaciones
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {currentUser ? `Sesión: ${currentUser.roleTitle}` : 'Modo: Visitante / No logueado'}
            </span>
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="text-emerald-700 font-semibold"
            >
              {currentUser ? 'Cambiar cuenta' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

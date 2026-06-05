/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ParkingSpace, EntryExitLog, Reservation, UserRole } from './types';
import {
  generateInitialSpaces,
  generateInitialLogs,
  generateInitialReservations,
  MOCK_PRE_USERS
} from './utils/mockData';
import { RegistrationForm } from './components/RegistrationForm';
import { ParkingMap } from './components/ParkingMap';
import { QRScannerSimulation } from './components/QRScannerSimulation';
import { GuardPanel } from './components/GuardPanel';
import { JefaturaDashboard } from './components/JefaturaDashboard';
import {
  Car,
  Shield,
  Users,
  Compass,
  Bell,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  Sliders,
  Scale,
  EyeOff,
  UserCheck
} from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const [activeRole, setActiveRole] = useState<UserRole>('conductor');
  const [activeTab, setActiveTab] = useState<'map' | 'register' | 'qr'>('map');

  // Core Database States
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [logs, setLogs] = useState<EntryExitLog[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Simulation & Alert Notifications
  const [simulationActive, setSimulationActive] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Load Database from API endpoints with high-fidelity localStorage fallback
  useEffect(() => {
    // 1. Load active user
    const savedUser = localStorage.getItem('duoc_parking_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // 2. Fetch from Express Backend API
    const loadData = async () => {
      try {
        const spacesRes = await fetch('/api/spaces');
        if (spacesRes.ok) {
          const fetchedSpaces = await spacesRes.json();
          // Ensure correct typing and data presence
          if (Array.isArray(fetchedSpaces) && fetchedSpaces.length > 0) {
            setSpaces(fetchedSpaces);
          } else {
            throw new Error('Empyp database or invalid format');
          }
        } else {
          throw new Error('Spaces fetch failed');
        }

        const logsRes = await fetch('/api/logs');
        if (logsRes.ok) {
          const fetchedLogs = await logsRes.json();
          setLogs(fetchedLogs);
        }

        const resRes = await fetch('/api/reservations');
        if (resRes.ok) {
          const fetchedRes = await resRes.json();
          setReservations(fetchedRes);
        }
      } catch (err) {
        console.warn('API fetch fell back to robust localStorage caches:', err);
        // Fallback to local browser state if backend has no active database
        const savedSpaces = localStorage.getItem('duoc_parking_spaces');
        const savedLogs = localStorage.getItem('duoc_parking_logs');
        const savedReservations = localStorage.getItem('duoc_parking_reservations');

        if (savedSpaces) {
          setSpaces(JSON.parse(savedSpaces));
        } else {
          const initial = generateInitialSpaces();
          setSpaces(initial);
          localStorage.setItem('duoc_parking_spaces', JSON.stringify(initial));
        }

        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        } else {
          const initial = generateInitialLogs();
          setLogs(initial);
          localStorage.setItem('duoc_parking_logs', JSON.stringify(initial));
        }

        if (savedReservations) {
          setReservations(JSON.parse(savedReservations));
        } else {
          const initial = generateInitialReservations();
          setReservations(initial);
          localStorage.setItem('duoc_parking_reservations', JSON.stringify(initial));
        }
      }
    };

    loadData();
  }, []);

  // Sync state helpers to localStorage and Express backend
  const saveSpacesToDb = async (updatedSpaces: ParkingSpace[]) => {
    setSpaces(updatedSpaces);
    localStorage.setItem('duoc_parking_spaces', JSON.stringify(updatedSpaces));
  };

  const handleModifySpace = async (spaceId: number, updates: Partial<ParkingSpace>) => {
    setSpaces(prev => {
      const copy = prev.map(s => s.id === spaceId ? { ...s, ...updates } : s);
      localStorage.setItem('duoc_parking_spaces', JSON.stringify(copy));
      return copy;
    });

    try {
      await fetch(`/api/spaces/${spaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn('Network space update failed:', err);
    }
  };

  const handleAddLog = async (newLog: any) => {
    const fullLog = {
      id: newLog.id || `LOG-${Math.floor(Math.random() * 9000) + 1000}`,
      ...newLog
    };

    setLogs(prev => {
      const updated = [fullLog, ...prev];
      localStorage.setItem('duoc_parking_logs', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullLog)
      });
    } catch (err) {
      console.warn('Network log insertion failed:', err);
    }
  };

  const handleClearLogs = async () => {
    setLogs([]);
    localStorage.setItem('duoc_parking_logs', JSON.stringify([]));
    triggerNotification('🧹 Historial de Bitácoras limpiado correctamente de la base de datos.');

    try {
      await fetch('/api/logs', { method: 'DELETE' });
    } catch (err) {
      console.warn('Network clear logs failed:', err);
    }
  };

  const triggerNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 3)]);
    // Auto erase toast after 5s
    setTimeout(() => {
      setNotifications(prev => prev.filter(m => m !== message));
    }, 5000);
  };

  // Reset System to initial Seeds
  const handleResetSystem = () => {
    if (window.confirm('¿Está seguro de reiniciar todo el sistema de estacionamiento? Esto borrará el registro actual, usuarios nuevos y bitácoras.')) {
      const initialSpaces = generateInitialSpaces();
      const initialLogs = generateInitialLogs();
      const initialRes = generateInitialReservations();

      setSpaces(initialSpaces);
      setLogs(initialLogs);
      setReservations(initialRes);
      setCurrentUser(null);

      localStorage.setItem('duoc_parking_spaces', JSON.stringify(initialSpaces));
      localStorage.setItem('duoc_parking_logs', JSON.stringify(initialLogs));
      localStorage.setItem('duoc_parking_reservations', JSON.stringify(initialRes));
      localStorage.removeItem('duoc_parking_current_user');

      triggerNotification('🔄 Sistema de estacionamientos restaurado a valores por defecto con éxito!');
    }
  };

  // Set preset driver identities for easy evaluation
  const handleLoadPresetUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('duoc_parking_current_user', JSON.stringify(user));
    triggerNotification(`👤 Conectado como ${user.nombre} (${user.tipo})`);
  };

  // Simulator Engine - checking in and out simulated student cars every 10 seconds
  useEffect(() => {
    if (!simulationActive) return;

    const runSimulationStep = () => {
      const isCheckIn = Math.random() < 0.60;

      if (isCheckIn) {
        setSpaces(prevSpaces => {
          const freeSpots = prevSpaces.filter(s => s.status === 'libre');
          if (freeSpots.length === 0) return prevSpaces;

          const chosenSlot = freeSpots[Math.floor(Math.random() * freeSpots.length)];
          const mockNames = ['Julián Retamal', 'Ana María Ojeda', 'Nicolás Vargas', 'Constanza Cuevas', 'Esteban Letelier', 'Bárbara Henríquez', 'Roberto Carlos'];
          const mockPlates = ['XW-RT-23', 'LP-PP-45', 'TY-TY-10', 'HJ-908', 'KJ-UY-41', 'BB-WW-12', 'ZH-QW-99'];
          const mockTypes = ['Estudiante', 'Docente', 'Visita', 'Colaborador'];

          const name = mockNames[Math.floor(Math.random() * mockNames.length)];
          const plate = mockPlates[Math.floor(Math.random() * mockPlates.length)];
          const type = mockTypes[Math.floor(Math.random() * mockTypes.length)];

          const updated = prevSpaces.map(s => s.id === chosenSlot.id ? {
            ...s,
            status: 'ocupado' as const,
            occupiedByName: name,
            occupiedByPlate: plate,
            occupiedByUserType: type as any,
            occupiedSince: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
          } : s);

          // update logs concurrently
          setLogs(prevLogs => {
            const newLog: EntryExitLog = {
              id: `LOG-SIM-${Math.floor(Math.random() * 9000) + 1000}`,
              spaceId: chosenSlot.id,
              spaceLabel: chosenSlot.label,
              rut: '20.553.481-K',
              nombre: name,
              tipoUsuario: type as any,
              patente: plate,
              entrada: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
              registradoPor: 'qr_autonomo'
            };
            const updatedLogs = [newLog, ...prevLogs];
            localStorage.setItem('duoc_parking_logs', JSON.stringify(updatedLogs));
            return updatedLogs;
          });

          localStorage.setItem('duoc_parking_spaces', JSON.stringify(updated));
          triggerNotification(`🟢 Ingreso QR Inteligente: ${name} (${type}) en Slot ${chosenSlot.label}`);
          return updated;
        });

      } else {
        // checkout some simulated car
        setSpaces(prevSpaces => {
          const occupiedSpots = prevSpaces.filter(s => s.status === 'ocupado');
          if (occupiedSpots.length === 0) return prevSpaces;

          const chosenSlot = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)];
          const name = chosenSlot.occupiedByName || 'Conductor Anónimo';
          const plate = chosenSlot.occupiedByPlate || 'SIN_P';

          const updated = prevSpaces.map(s => s.id === chosenSlot.id ? {
            ...s,
            status: 'libre' as const,
            occupiedByName: undefined,
            occupiedByPlate: undefined,
            occupiedByUserType: undefined,
            occupiedSince: undefined,
            reservationId: undefined
          } : s);

          // record exit in logs concurrently
          setLogs(prevLogs => {
            const newLog: EntryExitLog = {
              id: `LOG-SIM-${Math.floor(Math.random() * 9000) + 1000}`,
              spaceId: chosenSlot.id,
              spaceLabel: chosenSlot.label,
              rut: '19.124.901-4',
              nombre: name,
              tipoUsuario: chosenSlot.occupiedByUserType || 'Estudiante',
              patente: plate,
              entrada: chosenSlot.occupiedSince || '08:00',
              salida: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
              registradoPor: 'qr_autonomo'
            };
            const updatedLogs = [newLog, ...prevLogs];
            localStorage.setItem('duoc_parking_logs', JSON.stringify(updatedLogs));
            return updatedLogs;
          });

          localStorage.setItem('duoc_parking_spaces', JSON.stringify(updated));
          triggerNotification(`🔴 Salida QR Inteligente: Slot ${chosenSlot.label} liberado por patente ${plate}`);
          return updated;
        });
      }
    };

    const interval = setInterval(runSimulationStep, 10000);
    return () => clearInterval(interval);
  }, [simulationActive]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between" id="applet-shell">
      
      {/* Dynamic Simulated Floating Broadcast Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none" id="toasts-anchor">
        {notifications.map((note, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-900/95 backdrop-blur-xs text-white rounded-xl shadow-lg text-xs font-semibold border border-slate-700 flex items-center space-x-2.5 animate-slide-in pointer-events-auto"
            id={`toast-${idx}`}
          >
            <Bell className="w-4 h-4 text-yellow-400 animate-bounce" />
            <p className="leading-snug">{note}</p>
          </div>
        ))}
      </div>

      <div>
        {/* DUOC UC Official Branded Top Rail */}
        <header className="bg-slate-900 text-white border-b border-yellow-400/80 py-4 px-4 sm:px-8 shadow-md" id="main-global-header">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Duoc Brand Marks */}
            <div className="flex items-center space-x-3.5" id="brand-logo-bracket">
              <div className="bg-yellow-400 text-slate-900 px-3.5 py-2 rounded-xl font-extrabold text-lg tracking-wider border border-slate-950 flex items-center space-x-1.5 shadow-sm" id="logo-emblem">
                <span>Duoc</span>
                <span className="text-slate-900 font-semibold text-xs border-l border-slate-900/40 pl-1.5">UC</span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight" id="applet-brand-title">
                  Estacionamiento Inteligente <span className="text-yellow-400 uppercase font-bold text-xs bg-white/10 px-2 py-0.5 rounded-md ml-1 tracking-wider">Maipú</span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-300 font-semibold flex items-center space-x-1.5" id="applet-brand-sub">
                  <span>Sede Maipú</span>
                  <span>•</span>
                  <span>110 Cubículos</span>
                  <span>•</span>
                  <span className="text-emerald-400">Protección Ley 19.628</span>
                </p>
              </div>
            </div>

            {/* Quick Simulation Controller panel */}
            <div className="flex flex-wrap items-center gap-3.5 bg-white/10 p-2 rounded-xl border border-white/5" id="sim-dashboard-control">
              <div className="flex items-center space-x-2 text-xs" id="sim-status-label">
                <span className={`w-2.5 h-2.5 rounded-full ${simulationActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-200">Simulación de Tráfico</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSimulationActive(!simulationActive)}
                  className={`p-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${simulationActive ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 border border-yellow-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                  id="toggle-simulator-btn"
                  title={simulationActive ? "Pausar simulación de tráfico" : "Reactivar simulación de tráfico"}
                >
                  {simulationActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase">Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase">Reanudar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetSystem}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 border border-white/5"
                  id="reset-system-btn"
                  title="Restablecer base de datos"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Navigation Rails per Actor profile */}
        <section className="bg-white border-b border-slate-200 shadow-xs" id="actor-navigation-rail">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Swapping Actor buttons with descriptions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3.5" id="actors-swapper-box">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actor / Rol Activo:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl border w-full sm:w-auto overflow-x-auto" id="role-buttons-group">
                <button
                  onClick={() => {
                    setActiveRole('conductor');
                    setActiveTab('map');
                  }}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center space-x-1.5 transition cursor-pointer min-w-max ${activeRole === 'conductor' ? 'bg-slate-900 text-white shadow-xs border-b-2 border-yellow-400' : 'text-slate-600 hover:bg-slate-200'}`}
                  id="act-conductor-btn"
                >
                  <Car className="w-4 h-4" />
                  <span>1. Conductor</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRole('guardia');
                    setActiveTab('map');
                  }}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center space-x-1.5 transition cursor-pointer min-w-max ${activeRole === 'guardia' ? 'bg-slate-900 text-white shadow-xs border-b-2 border-yellow-400' : 'text-slate-600 hover:bg-slate-200'}`}
                  id="act-guardia-btn"
                >
                  <Shield className="w-4 h-4" />
                  <span>2. Guardia Sede</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRole('jefe_seguridad');
                    setActiveTab('map');
                  }}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center space-x-1.5 transition cursor-pointer min-w-max ${activeRole === 'jefe_seguridad' ? 'bg-slate-900 text-white shadow-xs border-b-2 border-yellow-400' : 'text-slate-600 hover:bg-slate-200'}`}
                  id="act-jefe-seguridad-btn"
                >
                  <Sliders className="w-4 h-4 text-yellow-400" />
                  <span>3. Jefe Seguridad</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRole('jefatura');
                  }}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center space-x-1.5 transition cursor-pointer min-w-max ${activeRole === 'jefatura' ? 'bg-slate-900 text-white shadow-xs border-b-2 border-yellow-400' : 'text-slate-600 hover:bg-slate-200'}`}
                  id="act-jefatura-btn"
                >
                  <Users className="w-4 h-4" />
                  <span>4. Jefatura / Informes</span>
                </button>
              </div>
            </div>

            {/* Subtabs for Drivers/Conductores */}
            {activeRole === 'conductor' && (
              <div className="flex gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200" id="driver-sub-tabs">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'map' ? 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
                >
                  Mi Sesión Activa
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'register' ? 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-955 hover:bg-slate-100'}`}
                >
                  Registro Patente
                </button>
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'qr' ? 'bg-yellow-400 text-[#0F2537] shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-960 hover:bg-slate-100'}`}
                >
                  Mi Pase QR
                </button>
              </div>
            )}

            {/* Subtabs for Jefe de Seguridad */}
            {activeRole === 'jefe_seguridad' && (
              <div className="flex gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200" id="jefe-sub-tabs">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'map' ? 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
                >
                  Mapa de Control
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'register' ? 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
                >
                  Bitácora de Incidentes
                </button>
              </div>
            )}

            {/* Subtabs for Guardias */}
            {activeRole === 'guardia' && (
              <div className="flex gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200" id="guard-sub-tabs">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'map' ? 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
                >
                  Mapa Ocupación (Real-Time)
                </button>
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'qr' ? 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
                >
                  Escanear Tótem QR
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${activeTab === 'register' ? 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
                >
                  Bitácora de Guardias / Alertas
                </button>
              </div>
            )}

            {activeRole === 'jefatura' && (
              <div className="text-xs text-slate-500 font-semibold animate-pulse" id="jefatura-info-ribbon">
                🔐 Acceso Seguro a Auditorías Maipú
              </div>
            )}
          </div>
        </section>

        {/* Global Demo Identities selector for fast testing */}
        {activeRole === 'conductor' && !currentUser && (
          <section className="bg-amber-50 border-b border-amber-200 py-3 px-4 sm:px-8" id="quick-presets-section">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-medium gap-3">
              <span className="text-amber-800 font-bold block shrink-0 flex items-center space-x-1">
                <span>💡</span> <span>¿Probando el sistema? Cargue rápido una cuenta de prueba:</span>
              </span>
              <div className="flex flex-wrap gap-2.5" id="presets-buttons-wrap">
                {MOCK_PRE_USERS.map((user, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadPresetUser(user)}
                    className="px-3 py-1.5 bg-white hover:bg-[#0F2537] hover:text-white border border-amber-300 text-amber-900 font-extrabold rounded-lg text-[10px] transition cursor-pointer shadow-xs"
                  >
                    {user.nombre.split(' ')[0]} ({user.tipo})
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content Area Routing */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex-1" id="main-content-flow">
          
          {/* CONDUCTOR VIEWS */}
          {activeRole === 'conductor' && (
            <div className="space-y-6 animate-fade-in" id="conductor-wrapper-block">
              {currentUser && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="driver-logged-summary">
                  <div className="flex items-center space-x-3" id="driver-avatar-section">
                    <div className="w-10 h-10 bg-[#FFD200]/20 text-[#735A00] rounded-full flex items-center justify-center font-bold text-sm">
                      {currentUser.nombre.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Conductor Identificado</span>
                      <h3 className="font-extrabold text-slate-800 text-sm">{currentUser.nombre}</h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold" id="driver-badge-set">
                    <span className="px-3 py-1 bg-slate-100 text-[#0F2537] rounded-xl font-bold border">
                      Perfil: {currentUser.tipo}
                    </span>
                    <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 font-mono tracking-wider font-extrabold rounded-xl">
                      Patente: {currentUser.patente.slice(0, 2)}-{currentUser.patente.slice(2, 4)}-{currentUser.patente.slice(4)}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentUser(null);
                        localStorage.removeItem('duoc_parking_current_user');
                        triggerNotification('Conductor desconectado.');
                      }}
                      className="text-rose-600 font-extrabold hover:underline text-[11px] cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'map' && (
                <div id="driver-tab-map">
                  <div className="mb-4">
                    <h2 className="text-xl font-extrabold text-slate-850 text-slate-800">Mapa de Aforos Sede Maipú</h2>
                    <p className="text-xs text-slate-500">Seleccione un cubículo libre correspondiente a su sector para estacionar o agendar reserva.</p>
                  </div>
                  <ParkingMap
                    spaces={spaces}
                    activeRole={activeRole}
                    currentUser={currentUser}
                    onModifySpace={handleModifySpace}
                    onAddLog={handleAddLog}
                    activeReservations={reservations}
                  />
                </div>
              )}

              {activeTab === 'register' && (
                <div id="driver-tab-register">
                  <RegistrationForm
                    onRegisterSuccess={(user) => {
                      setCurrentUser(user);
                      localStorage.setItem('duoc_parking_current_user', JSON.stringify(user));
                      // check if user has a reservation space
                      triggerNotification(`¡Pase registrado! ${user.nombre} ya posee ID de acceso.`);
                      setActiveTab('map');
                    }}
                    registeredUsers={MOCK_PRE_USERS}
                  />
                </div>
              )}

              {activeTab === 'qr' && (
                <div id="driver-tab-qr">
                  <QRScannerSimulation
                    currentUser={currentUser}
                    spaces={spaces}
                    onModifySpace={handleModifySpace}
                    onAddLog={handleAddLog}
                    activeReservations={reservations}
                  />
                </div>
              )}
            </div>
          )}

          {/* JEFE DE SEGURIDAD VIEWS */}
          {activeRole === 'jefe_seguridad' && (
            <div className="space-y-6 animate-fade-in animate-duration-300" id="jefe-seguridad-wrapper-block">
              {activeTab === 'map' && (
                <div id="jefe-tab-map">
                  <div className="mb-4">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
                      <span className="p-1 px-2.5 bg-slate-900 text-yellow-400 font-mono text-[10px] rounded-lg tracking-wider uppercase font-bold">Jefe de Seguridad</span>
                      <span>Consola de Gestión y Custodia de Aforo</span>
                    </h2>
                    <p className="text-xs text-slate-500">Ejecute bloqueos de calzada preventiva por seguridad y programe reservas institucionales del recinto "Duoc UC Maipú". Como Jefe de Seguridad, no posee facultades para liberar (disponibilizar) espacios.</p>
                  </div>
                  <ParkingMap
                    spaces={spaces}
                    activeRole={activeRole}
                    currentUser={null}
                    onModifySpace={handleModifySpace}
                    onAddLog={handleAddLog}
                    activeReservations={reservations}
                  />
                </div>
              )}

              {activeTab === 'register' && (
                <div id="jefe-tab-register">
                  <div className="mb-4">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
                      <span className="p-1 px-2.5 bg-slate-900 text-yellow-400 font-mono text-[10px] rounded-lg tracking-wider uppercase font-bold">Jefe de Seguridad</span>
                      <span>Historial e Informes de Turnos</span>
                    </h2>
                    <p className="text-xs text-slate-500">Audite reportes, alertas de seguridad y vehículos en recinto de manera directa.</p>
                  </div>
                  <GuardPanel
                    spaces={spaces}
                    logs={logs}
                    onAddLog={handleAddLog}
                    onModifySpace={handleModifySpace}
                    activeReservations={reservations}
                    activeRole={activeRole}
                  />
                </div>
              )}
            </div>
          )}

          {/* GUARD VIEWS */}
          {activeRole === 'guardia' && (
            <div className="space-y-6 animate-fade-in" id="guardia-wrapper-block">
              {activeTab === 'map' && (
                <div id="guard-tab-map">
                  <div className="mb-4">
                    <h2 className="text-xl font-extrabold text-slate-800">Consola Central de Operaciones de Turno</h2>
                    <p className="text-xs text-slate-500">Supervise, bloquee o libere los 110 espacios en tiempo real.</p>
                  </div>
                  <ParkingMap
                    spaces={spaces}
                    activeRole={activeRole}
                    currentUser={null}
                    onModifySpace={handleModifySpace}
                    onAddLog={handleAddLog}
                    activeReservations={reservations}
                  />
                </div>
              )}

              {activeTab === 'qr' && (
                <div id="guard-tab-qr">
                  <QRScannerSimulation
                    currentUser={currentUser}
                    spaces={spaces}
                    onModifySpace={handleModifySpace}
                    onAddLog={handleAddLog}
                    activeReservations={reservations}
                  />
                </div>
              )}

              {activeTab === 'register' && (
                <div id="guard-tab-register">
                  <GuardPanel
                    spaces={spaces}
                    logs={logs}
                    onAddLog={handleAddLog}
                    onModifySpace={handleModifySpace}
                    activeReservations={reservations}
                    activeRole={activeRole}
                  />
                </div>
              )}
            </div>
          )}

          {/* MANAGEMENT (JEFATURA) VIEWS */}
          {activeRole === 'jefatura' && (
            <div className="space-y-6 animate-fade-in animate-duration-300" id="jefatura-wrapper-block">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Consola de Control de Jefatura y Estadísticas</h2>
                  <p className="text-xs text-slate-500">Auditoría del aforo de 110 estacionamientos, bitácoras de incidentes y control de innovación de accesos.</p>
                </div>
                <div className="mt-2 sm:mt-0 flex space-x-2" id="jefatura-actions">
                  <span className="px-3 py-1.5 bg-slate-900 border text-amber-400 font-mono font-bold text-[10px] rounded-lg">
                    ADMINISTRADOR DE SEDE
                  </span>
                </div>
              </div>

              <JefaturaDashboard
                spaces={spaces}
                logs={logs}
                onClearLogs={handleClearLogs}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Branded Legal Disclaimer Footer */}
      <footer className="bg-slate-900 text-white py-6 border-t border-yellow-400" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center sm:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-300">
          <div>
            <p className="font-extrabold text-slate-100">© 2026 Duoc UC Sede Maipú. Dirección de Operaciones e Infraestructura Informática.</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Desarrollado según directrices curriculares y de seguridad de redes.</p>
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-[10px] text-slate-400 uppercase tracking-wide" id="legal-footer-markers">
            <span className="flex items-center space-x-1 text-yellow-400 font-bold" title="Chile Ley 19.628 de Protección de Datos">
              <Scale className="w-3.5 h-3.5 text-yellow-500" />
              <span>LEY 19.628 CUMPLIDO</span>
            </span>
            <span>•</span>
            <span>Aforo Total: 110 Cap</span>
            <span>•</span>
            <button
              onClick={() => {
                alert('Toda la persistencia de patentes y bitácoras de guardias de esta simulación informática se guardan con seguridad local en su navegador (localStorage) bajo la Ley de Datos Personales N° 19.628.');
              }}
              className="hover:text-white hover:underline text-[10px] cursor-pointer"
            >
              Políticas de Privacidad
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

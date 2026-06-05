/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ParkingSpace, SpaceStatus, SpaceType, UserRole, UserType, Reservation } from '../types';
import { Car, Bike, Accessibility, ShieldAlert, Lock, Unlock, Clock, User as UserIcon, Calendar, Check, Search, Filter } from 'lucide-react';

interface ParkingMapProps {
  spaces: ParkingSpace[];
  activeRole: UserRole;
  currentUser: { nombre: string; patente: string; tipo: UserType } | null;
  onModifySpace: (spaceId: number, updates: Partial<ParkingSpace>) => void;
  onAddLog: (log: any) => void;
  activeReservations: Reservation[];
}

export function ParkingMap({
  spaces,
  activeRole,
  currentUser,
  onModifySpace,
  onAddLog,
  activeReservations,
}: ParkingMapProps) {
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [activeSector, setActiveSector] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SpaceStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | SpaceType>('ALL');
  const [searchPlate, setSearchPlate] = useState('');
  
  // Guard-specific manually typed entry form fields
  const [manualName, setManualName] = useState('');
  const [manualPlate, setManualPlate] = useState('');
  const [manualUserType, setManualUserType] = useState<UserType>('Estudiante');
  const [blockReason, setBlockReason] = useState('');

  // Count elements
  const total = spaces.length;
  const occupiedCount = spaces.filter((s) => s.status === 'ocupado').length;
  const reservatedCount = spaces.filter((s) => s.status === 'reservado').length;
  const blockedCount = spaces.filter((s) => s.status === 'bloqueado').length;
  const freeCount = spaces.filter((s) => s.status === 'libre').length;

  // Filtered lists
  const filteredSpaces = spaces.filter((space) => {
    const matchesSector = activeSector === 'ALL' || space.sector === activeSector;
    const matchesStatus = statusFilter === 'ALL' || space.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || space.type === typeFilter;
    const matchesSearch =
      !searchPlate.trim() ||
      (space.occupiedByPlate?.toLowerCase().includes(searchPlate.toLowerCase()) ||
        space.occupiedByName?.toLowerCase().includes(searchPlate.toLowerCase()) ||
        space.label.toLowerCase().includes(searchPlate.toLowerCase()));
    return matchesSector && matchesStatus && matchesType && matchesSearch;
  });

  const getSpaceIcon = (type: SpaceType, sizeClass = 'w-4 h-4') => {
    switch (type) {
      case 'moto':
        return <Bike className={sizeClass} />;
      case 'preferencial':
        return <Accessibility className={sizeClass} />;
      case 'directivo':
        return <ShieldAlert className={sizeClass} />;
      default:
        return <Car className={sizeClass} />;
    }
  };

  const getSpaceStatusLabel = (status: SpaceStatus) => {
    switch (status) {
      case 'libre':
        return 'Disponible';
      case 'ocupado':
        return 'Ocupado';
      case 'reservado':
        return 'Reservado';
      case 'bloqueado':
        return 'Bloqueado';
    }
  };

  const handleSeatClick = (space: ParkingSpace) => {
    setSelectedSpaceId(space.id);
    
    // reset manual forms
    setManualName('');
    setManualPlate('');
    setManualUserType(
      space.sector === 'A' ? 'Docente' : space.sector === 'B' ? 'Estudiante' : 'Visita'
    );
    setBlockReason('');
  };

  const currentSelectedSpace = spaces.find((s) => s.id === selectedSpaceId);

  // Driver action: reserve or occupy
  const handleDriverAction = (action: 'park' | 'reserve') => {
    if (!currentSelectedSpace || !currentUser) return;

    if (action === 'park') {
      onModifySpace(currentSelectedSpace.id, {
        status: 'ocupado',
        occupiedByPlate: currentUser.patente,
        occupiedByName: currentUser.nombre,
        occupiedByUserType: currentUser.tipo,
        occupiedSince: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      });

      // log entry
      onAddLog({
        spaceId: currentSelectedSpace.id,
        spaceLabel: currentSelectedSpace.label,
        rut: 'Registrado',
        nombre: currentUser.nombre,
        tipoUsuario: currentUser.tipo,
        patente: currentUser.patente,
        entrada: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        registradoPor: 'qr_autonomo',
      });
    } else {
      // Reserve
      onModifySpace(currentSelectedSpace.id, {
        status: 'reservado',
        reservationId: `RES-${Date.now().toString().slice(-4)}`,
      });
    }
    setSelectedSpaceId(null);
  };

  // Guard Action: manually register incoming driver
  const handleManualRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedSpace) return;
    if (!manualName.trim() || !manualPlate.trim()) {
      alert('Debe ingresar Nombre del conductor y Patente válida por seguridad.');
      return;
    }

    onModifySpace(currentSelectedSpace.id, {
      status: 'ocupado',
      occupiedByName: manualName.trim(),
      occupiedByPlate: manualPlate.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
      occupiedByUserType: manualUserType,
      occupiedSince: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    });

    onAddLog({
      spaceId: currentSelectedSpace.id,
      spaceLabel: currentSelectedSpace.label,
      rut: 'Ingreso Manual (Rut no cargado)',
      nombre: manualName.trim(),
      tipoUsuario: manualUserType,
      patente: manualPlate.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
      entrada: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      registradoPor: 'guardia',
    });

    setSelectedSpaceId(null);
  };

  // Guard Action: Check-out occupant
  const handleCheckout = () => {
    if (!currentSelectedSpace) return;

    // Log the exit with time
    const plate = currentSelectedSpace.occupiedByPlate || 'SIN_PATENTE';
    const name = currentSelectedSpace.occupiedByName || 'Conductor Anónimo';
    const typeUser = currentSelectedSpace.occupiedByUserType || 'Visita';
    
    onAddLog({
      spaceId: currentSelectedSpace.id,
      spaceLabel: currentSelectedSpace.label,
      rut: 'Rut Registrado',
      nombre: name,
      tipoUsuario: typeUser,
      patente: plate,
      entrada: currentSelectedSpace.occupiedSince || '08:00',
      salida: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      registradoPor: 'guardia',
    });

    // Reset space to free
    onModifySpace(currentSelectedSpace.id, {
      status: 'libre',
      occupiedByName: undefined,
      occupiedByPlate: undefined,
      occupiedByUserType: undefined,
      occupiedSince: undefined,
      reservationId: undefined,
    });

    setSelectedSpaceId(null);
  };

  // Guard Actions: toggle lock/block of slot
  const handleToggleBlockSpace = () => {
    if (!currentSelectedSpace) return;

    if (currentSelectedSpace.status === 'bloqueado') {
      onModifySpace(currentSelectedSpace.id, { status: 'libre' });
    } else {
      onModifySpace(currentSelectedSpace.id, {
        status: 'bloqueado',
        occupiedByName: undefined,
        occupiedByPlate: undefined,
        occupiedByUserType: undefined,
        occupiedSince: undefined,
      });
    }
    setSelectedSpaceId(null);
  };

  // Guard Actions: unlock from reservation
  const handleCancelReservation = () => {
    if (!currentSelectedSpace) return;
    onModifySpace(currentSelectedSpace.id, {
      status: 'libre',
      reservationId: undefined,
    });
    setSelectedSpaceId(null);
  };

  return (
    <div className="space-y-6" id="parking-map-section">
      {/* Dynamic Summary Heuristics Header */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5" id="stats-ribbon">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/60 flex flex-col justify-between" id="stat-capacity">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacidad Duoc</span>
          <div className="flex items-baseline mt-1 group">
            <span className="text-2xl font-extrabold text-slate-800">{total}</span>
            <span className="text-xs font-medium text-slate-400 ml-1">Lugares</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-slate-900 h-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/60 flex flex-col justify-between" id="stat-free">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disponibles</span>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-extrabold text-emerald-600">{freeCount}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">({Math.round((freeCount / total) * 100)}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(freeCount / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/60 flex flex-col justify-between" id="stat-occupied">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ocupados</span>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-extrabold text-rose-600">{occupiedCount}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">({Math.round((occupiedCount / total) * 100)}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-rose-500 h-full transition-all" style={{ width: `${(occupiedCount / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/60 flex flex-col justify-between" id="stat-reserved">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reservas Hoy</span>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-extrabold text-amber-500">{reservatedCount}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">({Math.round((reservatedCount / total) * 100)}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-400 h-full transition-all" style={{ width: `${(reservatedCount / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl shadow-xs border border-slate-200/60 flex flex-col justify-between" id="stat-locked">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inhabilitados</span>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-extrabold text-slate-600">{blockedCount}</span>
            <span className="text-slate-400 text-xs ml-1.5 font-medium">Mantención</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-slate-500 h-full" style={{ width: `${(blockedCount / total) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Grid Filters Control Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between" id="filter-controls-bar">
        {/* Sector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto" id="sector-selector-wrapper">
          <button
            onClick={() => setActiveSector('ALL')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSector === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Todos Sectores ({total})
          </button>
          <button
            onClick={() => setActiveSector('A')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSector === 'A' ? 'bg-yellow-400 text-slate-900 border border-yellow-500 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Sector A: Docentes (30)
          </button>
          <button
            onClick={() => setActiveSector('B')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSector === 'B' ? 'bg-yellow-400 text-slate-900 border border-yellow-500 border border-yellow-500 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Sector B: Alumnos (60)
          </button>
          <button
            onClick={() => setActiveSector('C')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSector === 'C' ? 'bg-yellow-400 text-slate-900 border border-yellow-500 border border-yellow-500 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Sector C: Visitas (20)
          </button>
        </div>

        {/* Filters and search input */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end" id="grid-search-filters">
          {/* Status selector */}
          <div className="flex items-center space-x-1" id="status-select-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">Todo Estado</option>
              <option value="libre">Disponible</option>
              <option value="ocupado">Ocupado</option>
              <option value="reservado">Reservado</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>

          {/* Type selector */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">Tipos de Espacio</option>
            <option value="regular">Regular / Estándar</option>
            <option value="preferencial">Movilidad Reducida</option>
            <option value="directivo">Directivo Sede</option>
            <option value="moto">Motos</option>
          </select>

          {/* Plate text finder */}
          <div className="relative w-full md:w-48" id="search-plate-group">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              placeholder="Buscar patente o slot..."
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Map Layout - 110 spaces */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6" id="grid-layout-box">
        
        {/* Color Legend banner */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg" id="map-color-legend">
          <span className="font-bold text-slate-700">Simbología:</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 bg-emerald-100 border border-emerald-400 rounded-sm"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 bg-rose-100 border border-rose-450 border-rose-400 rounded-sm"></div>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 bg-amber-100 border border-amber-300 rounded-sm"></div>
            <span>Reservado</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 bg-slate-200 border border-slate-400 rounded-sm stripe-bg"></div>
            <span>Bloqueado</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-250 bg-slate-300"></div>
          <div className="flex items-center space-x-2 text-[#0F2537]">
            <Car className="w-3.5 h-3.5" /> <span>Auto</span>
            <Bike className="w-3.5 h-3.5" /> <span>Moto</span>
            <Accessibility className="w-3.5 h-3.5 text-emerald-600" /> <span>Preferencial / Ley</span>
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> <span>Directivos</span>
          </div>
        </div>

        {/* Sectors Layout Render */}
        <div className="space-y-8" id="sectors-layout-grid-render">
          
          {/* Sector A render */}
          {(activeSector === 'ALL' || activeSector === 'A') && (
            <div className="space-y-3" id="rendering-sector-a">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                  <h3 className="font-bold text-slate-800 text-sm">Sector A - Colaboradores y Docentes Sede Maipú</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  Disponibles: {spaces.filter(s => s.sector === 'A' && s.status === 'libre').length} / 30
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">Espacios del A-01 al A-05 preferenciales para Directivos de Sede.</p>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2.5">
                {filteredSpaces
                  .filter((s) => s.sector === 'A')
                  .map((space) => (
                    <button
                      key={space.id}
                      onClick={() => handleSeatClick(space)}
                      className={`relative aspect-square py-1 p-2 text-center rounded-lg border flex flex-col justify-between items-center transition-all cursor-pointer ${
                        space.status === 'libre'
                          ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-800'
                          : space.status === 'ocupado'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : space.status === 'reservado'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-150 bg-slate-200/60 border-slate-300 text-slate-500 bg-stripe-pattern'
                      } ${selectedSpaceId === space.id ? 'ring-2 ring-amber-500 ring-offset-1 transform scale-102 scale-105' : ''}`}
                    >
                      <span className="text-xs font-bold font-mono tracking-tighter block">{space.label}</span>
                      <div className="my-[4px]">
                        {getSpaceIcon(space.type, 'w-4 h-4')}
                      </div>
                      <span className="text-[9px] font-semibold tracking-tighter opacity-80 uppercase block">
                        {space.status === 'libre' ? 'Libre' : space.status === 'ocupado' ? space.occupiedByPlate : space.status === 'reservado' ? 'Reservado' : 'Bloq'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Sector B render */}
          {(activeSector === 'ALL' || activeSector === 'B') && (
            <div className="space-y-3 pt-4" id="rendering-sector-b">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                  <h3 className="font-bold text-slate-800 text-sm">Sector B - Estudiantes Duoc Maipú</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  Disponibles: {spaces.filter(s => s.sector === 'B' && s.status === 'libre').length} / 60
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">Sector de alta rotación en horarios punta. Slots del B-56 al B-60 asignados a Motocicletas.</p>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2.5">
                {filteredSpaces
                  .filter((s) => s.sector === 'B')
                  .map((space) => (
                    <button
                      key={space.id}
                      onClick={() => handleSeatClick(space)}
                      className={`relative aspect-square py-1 p-2 text-center rounded-lg border flex flex-col justify-between items-center transition-all cursor-pointer ${
                        space.status === 'libre'
                          ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-800'
                          : space.status === 'ocupado'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : space.status === 'reservado'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-150 bg-slate-200/60 border-slate-300 text-slate-500 bg-stripe-pattern'
                      } ${selectedSpaceId === space.id ? 'ring-2 ring-amber-500 ring-offset-1 transform scale-102 scale-105' : ''}`}
                    >
                      <span className="text-xs font-bold font-mono tracking-tighter block">{space.label}</span>
                      <div className="my-[4px]">
                        {getSpaceIcon(space.type, 'w-4 h-4')}
                      </div>
                      <span className="text-[9px] font-semibold tracking-tighter opacity-80 uppercase block">
                        {space.status === 'libre' ? 'Libre' : space.status === 'ocupado' ? space.occupiedByPlate : space.status === 'reservado' ? 'Reservado' : 'Bloq'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Sector C render */}
          {(activeSector === 'ALL' || activeSector === 'C') && (
            <div className="space-y-3 pt-4" id="rendering-sector-c">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <h3 className="font-bold text-slate-800 text-sm">Sector C - Visitas / Convenios y Preferencial (Movilidad Reducida)</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  Disponibles: {spaces.filter(s => s.sector === 'C' && s.status === 'libre').length} / 20
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">Slots del C-01 al C-05 equipados preferencialmente para Ley de Estacionamientos de Movilidad Reducida y Embarazadas.</p>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2.5">
                {filteredSpaces
                  .filter((s) => s.sector === 'C')
                  .map((space) => (
                    <button
                      key={space.id}
                      onClick={() => handleSeatClick(space)}
                      className={`relative aspect-square py-1 p-2 text-center rounded-lg border flex flex-col justify-between items-center transition-all cursor-pointer ${
                        space.status === 'libre'
                          ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-800'
                          : space.status === 'ocupado'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : space.status === 'reservado'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-150 bg-slate-200/60 border-slate-300 text-slate-500 bg-stripe-pattern'
                      } ${selectedSpaceId === space.id ? 'ring-2 ring-amber-500 ring-offset-1 transform scale-102 scale-105' : ''}`}
                    >
                      <span className="text-xs font-bold font-mono tracking-tighter block">{space.label}</span>
                      <div className="my-[4px]">
                        {getSpaceIcon(space.type, 'w-4 h-4')}
                      </div>
                      <span className="text-[9px] font-semibold tracking-tighter opacity-80 uppercase block">
                        {space.status === 'libre' ? 'Libre' : space.status === 'ocupado' ? space.occupiedByPlate : space.status === 'reservado' ? 'Reservado' : 'Bloq'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {filteredSpaces.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-xl" id="no-search-results">
              <p className="text-slate-500 text-sm font-medium">No se encontraron estacionamientos con los filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Space Details Drawer / Modal Dialog */}
      {currentSelectedSpace && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40" id="space-detail-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden" id="space-detail-card">
            
            {/* Modal Heading style dependent on state */}
            <div className={`p-5 flex items-center justify-between text-white ${
              currentSelectedSpace.status === 'libre'
                ? 'bg-emerald-600'
                : currentSelectedSpace.status === 'ocupado'
                ? 'bg-[#0F2537]'
                : currentSelectedSpace.status === 'reservado'
                ? 'bg-amber-500'
                : 'bg-slate-700'
            }`} id="space-detail-header-bar">
              <div className="flex items-center space-x-2.5">
                {getSpaceIcon(currentSelectedSpace.type, 'w-5 h-5 text-amber-300')}
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">ESTACIONAMIENTO {currentSelectedSpace.label}</h3>
                  <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full font-bold">
                    Sector {currentSelectedSpace.sector}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSpaceId(null)}
                className="text-white/80 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5" id="space-detail-modal-body">
              {/* Common metadata */}
              <div className="flex gap-4 items-center justify-around text-center text-xs text-slate-500 py-2 border-b bg-slate-50 rounded-lg" id="space-metadata">
                <div>
                  <span className="block font-medium text-slate-400">Tipo Espacio</span>
                  <span className="font-bold text-slate-700 uppercase mt-0.5 block">{currentSelectedSpace.type}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-200"></div>
                <div>
                  <span className="block font-medium text-slate-400">Estado</span>
                  <span className="font-bold text-slate-700 mt-0.5 block">
                    {getSpaceStatusLabel(currentSelectedSpace.status)}
                  </span>
                </div>
              </div>

              {/* Status Specific Renders */}
              {currentSelectedSpace.status === 'ocupado' && (
                <div className="space-y-4" id="occupied-details-block">
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1"><UserIcon className="w-4 h-4 text-slate-400" /> <b>Conductor:</b></span>
                      <span className="font-bold text-slate-800">{currentSelectedSpace.occupiedByName || 'No registrado'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1"><Car className="w-4 h-4 text-slate-400" /> <b>Patente:</b></span>
                      <span className="px-2 py-0.5 font-mono text-sm font-bold bg-amber-100 text-amber-800 border-amber-300 border-dashed border rounded">
                        {currentSelectedSpace.occupiedByPlate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>👤 <b>Categoría:</b></span>
                      <span className="font-bold">{currentSelectedSpace.occupiedByUserType || 'Visita'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1"><Clock className="w-4 h-4 text-slate-400" /> <b>Ingreso:</b></span>
                      <span className="font-bold">{currentSelectedSpace.occupiedSince || 'N/A'}</span>
                    </div>
                  </div>

                  {activeRole === 'guardia' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold flex items-center space-x-2" id="occupied-guard-actions">
                      <span>ℹ️</span>
                      <span>Rol Guardia - Visualización: El aforo de este espacio se controla autónomamente vía lector QR. No se permiten salidas manuales.</span>
                    </div>
                  )}

                  {activeRole === 'jefe_seguridad' && (
                    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center space-x-2" id="occupied-jefe-actions">
                      <span>🔒</span>
                      <span>Protocolo Jefe Seguridad: Restringida la salida manual de autos para mantener custodia fiscal. El aforo se libera por pase QR o administración superior.</span>
                    </div>
                  )}
                </div>
              )}

              {currentSelectedSpace.status === 'reservado' && (
                <div className="space-y-4" id="reservated-details-block">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2" id="res-box">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Calendar className="w-4 h-4" />
                      <span>Espacio Reservado para Hoy</span>
                    </div>
                    {/* Find active reservation if exists */}
                    {activeReservations.find(r => r.spaceId === currentSelectedSpace.id) ? (
                      <div>
                        <p className="mt-1"><b>Conductor:</b> {activeReservations.find(r => r.spaceId === currentSelectedSpace.id)?.nombre}</p>
                        <p><b>Patente:</b> {activeReservations.find(r => r.spaceId === currentSelectedSpace.id)?.patente}</p>
                        <p><b>Horario:</b> {activeReservations.find(r => r.spaceId === currentSelectedSpace.id)?.horaInicio} - {activeReservations.find(r => r.spaceId === currentSelectedSpace.id)?.horaFin}</p>
                      </div>
                    ) : (
                      <p>Reserva programada por el sistema central Duoc para alumnos preferenciales o directivos.</p>
                    )}
                  </div>

                  {activeRole === 'guardia' && (
                    <div className="p-3 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-500 font-semibold flex items-center space-x-2" id="reserved-guard-actions">
                      <span>ℹ️</span>
                      <span>Rol Guardia - Visualización: Las reservas institucionales se asocian de forma automática por el totem. Sin autorización para anular o forzar.</span>
                    </div>
                  )}

                  {activeRole === 'jefe_seguridad' && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2" id="reserved-jefe-actions">
                      <span>🔒</span>
                      <span>No disponibilizable: El Jefe de Seguridad tiene restringida la anulación o remoción de reservas activas del sistema.</span>
                    </div>
                  )}

                  {currentUser && currentUser.patente === activeReservations.find(r => r.spaceId === currentSelectedSpace.id)?.patente && activeRole === 'conductor' ? (
                    <button
                      onClick={() => handleDriverAction('park')}
                      className="w-full py-2 bg-[#0F2537] text-white hover:text-amber-400 font-bold text-sm rounded-xl transition cursor-pointer"
                    >
                      Estacionar Aquí Ahora
                    </button>
                  ) : null}
                </div>
              )}

              {currentSelectedSpace.status === 'bloqueado' && (
                <div className="space-y-4" id="blocked-space-details">
                  <div className="p-3.5 bg-slate-100 rounded-xl text-xs border border-slate-300 text-slate-700 flex items-start space-x-2" id="block-desc-card">
                    <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Espacio Bloqueado por Seguridad</p>
                      <p className="text-slate-500 mt-1">Este estacionamiento está inhabilitado por el cuerpo de seguridad de Duoc UC Maipú debido a mantención o restricciones de seguridad.</p>
                    </div>
                  </div>

                  {activeRole === 'guardia' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold flex items-center space-x-2">
                      <span>ℹ️</span>
                      <span>Rol Guardia - Visualización: Sin privilegios para desbloquear o habilitar zonas de calzada inhabilitadas.</span>
                    </div>
                  )}

                  {activeRole === 'jefe_seguridad' && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
                      <span>🔒</span>
                      <span>No disponibilizable: Según la norma de red Duoc, el Jefe de Seguridad no posee autorización para desbloquear o abrir espacios cerrados de forma directa.</span>
                    </div>
                  )}
                </div>
              )}

              {currentSelectedSpace.status === 'libre' && (
                <div id="libre-action-cases">
                  {/* Conductor Context */}
                  {activeRole === 'conductor' && (
                    <div className="space-y-3" id="driver-park-context">
                      {currentUser ? (
                        <div className="space-y-3">
                          {/* Permit validation checking */}
                          {(currentSelectedSpace.sector === 'A' && currentUser.tipo !== 'Docente' && currentUser.tipo !== 'Directivo' && currentUser.tipo !== 'Colaborador') ? (
                            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs">
                              ⚠️ El <b>Sector A</b> está restringido a Docentes y Personal. Como <b>{currentUser.tipo}</b>, su vehículo arriesga amonestación si estaciona en esta zona sin autorización del guardia.
                            </div>
                          ) : (currentSelectedSpace.sector === 'C' && currentSelectedSpace.type === 'preferencial') ? (
                            <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs">
                              ℹ️ Espacio preferencial reservado por ley para movilidad reducida, embarazadas o tercera edad. Considere dejarlo libre si no cumple la condición.
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">¿Desea estacionar su vehículo patente <b>{currentUser.patente}</b> en este espacio?</p>
                          )}

                          <div className="flex space-x-3 pt-1">
                            <button
                              onClick={() => handleDriverAction('park')}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                            >
                              Estacionar Mi Auto
                            </button>
                            <button
                              onClick={() => handleDriverAction('reserve')}
                              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0F2537] font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                            >
                              Reservar Lugar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-slate-50 border border-dashed rounded-xl" id="must-register-box">
                          <p className="text-xs text-slate-500 mb-2">Debe autorregistrar primero su patente en el formulario de la sección "Conductor" antes de ocupar espacios digitales interactivos.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Guard Context - Read only display for Libre */}
                  {activeRole === 'guardia' && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold flex items-center space-x-2" id="guard-space-admin-form">
                      <span>ℹ️</span>
                      <span>Rol Guardia - Visualización: El espacio se encuentra libre. El guardia no puede reservar ni bloquear este estacionamiento.</span>
                    </div>
                  )}

                  {/* Jefe de Seguridad Context - Block or Reserve */}
                  {activeRole === 'jefe_seguridad' && (
                    <div className="space-y-4" id="jefe-space-admin-form">
                      {/* 1. Block Button */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inhabilitar Espacio</span>
                        </span>
                        <p className="text-[11px] text-slate-500">Previene el uso de este cubículo por mantención de calzada, pintura, accidentes o cono de seguridad.</p>
                        <button
                          type="button"
                          onClick={handleToggleBlockSpace}
                          className="w-full py-1.5 bg-[#0F2537] hover:bg-slate-800 text-white hover:text-amber-400 font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center space-x-1"
                          id="submit-jefe-block"
                        >
                          <span>⚠️ Registrar Bloqueo / Inhabilitar</span>
                        </button>
                      </div>

                      {/* 2. Reservation Form */}
                      <div className="p-3.5 bg-amber-50/50 border border-amber-250 border-amber-200/60 rounded-xl space-y-3">
                        <span className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>Crear Reserva de Seguridad</span>
                        </span>
                        <p className="text-[11px] text-amber-700">Asigne de forma anticipada el cubículo para un conductor autorizado o de rango.</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Patente Vehicular</label>
                            <input
                              type="text"
                              placeholder="FEXS-90"
                              value={manualPlate}
                              onChange={(e) => setManualPlate(e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded-lg font-mono font-semibold uppercase bg-white focus:outline-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Perfil Conductor</label>
                            <select
                              value={manualUserType}
                              onChange={(e) => setManualUserType(e.target.value as UserType)}
                              className="w-full px-1.5 py-1 text-xs border rounded-lg bg-white focus:outline-amber-500"
                            >
                              <option value="Docente">Docente</option>
                              <option value="Estudiante">Estudiante</option>
                              <option value="Colaborador">Colaborador</option>
                              <option value="Visita">Visita</option>
                              <option value="Externo">Externo</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Nombre del Conductor</label>
                          <input
                            type="text"
                            placeholder="Ej: Directivo Duoc Sede Maipú"
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            className="w-full px-2 py-1 text-xs border rounded-lg bg-white focus:outline-amber-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!manualName.trim() || !manualPlate.trim()) {
                              alert('Por favor complete Patente y Nombre para programar la reserva en este cubículo.');
                              return;
                            }
                            const upperPlate = manualPlate.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                            onModifySpace(currentSelectedSpace.id, {
                              status: 'reservado',
                              reservationId: `RES-JF-${Math.floor(Math.random() * 900) + 100}`,
                              occupiedByName: manualName.trim(),
                              occupiedByPlate: upperPlate,
                              occupiedByUserType: manualUserType,
                              occupiedSince: 'Reserva Jefe'
                            });
                            onAddLog({
                              id: `LOG-JF-${Math.floor(Math.random() * 9000) + 1000}`,
                              spaceId: currentSelectedSpace.id,
                              spaceLabel: currentSelectedSpace.label,
                              rut: 'Reserva Jefe Seg',
                              nombre: manualName.trim(),
                              tipoUsuario: manualUserType,
                              patente: upperPlate,
                              entrada: 'Pendiente',
                              registradoPor: 'guardia'
                            });
                            setManualName('');
                            setManualPlate('');
                            setSelectedSpaceId(null);
                          }}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 border border-amber-600 font-extrabold text-xs rounded-lg transition cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Check className="w-4 h-4 text-emerald-900 font-bold" />
                          <span>Agendar Reserva Institucional</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 px-5 py-3.5 flex justify-end" id="space-detail-footer">
              <button
                onClick={() => setSelectedSpaceId(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300 transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

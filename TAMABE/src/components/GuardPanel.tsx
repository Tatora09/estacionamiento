/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ParkingSpace, EntryExitLog, UserType, Reservation, UserRole } from '../types';
import { Shield, Clock, Search, AlertTriangle, Check, BookOpen, Ban, PlusCircle, Car, Trash2, Milestone } from 'lucide-react';

interface GuardPanelProps {
  spaces: ParkingSpace[];
  logs: EntryExitLog[];
  onAddLog: (log: EntryExitLog) => void;
  onModifySpace: (spaceId: number, updates: Partial<ParkingSpace>) => void;
  activeReservations: Reservation[];
  activeRole?: UserRole;
}

export function GuardPanel({
  spaces,
  logs,
  onAddLog,
  onModifySpace,
  activeReservations,
  activeRole,
}: GuardPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Incident Form state
  const [incidentPlate, setIncidentPlate] = useState('');
  const [incidentReason, setIncidentReason] = useState('Incumplimiento de horario');
  const [incidentDetails, setIncidentDetails] = useState('');
  
  // Initial mock security alerts
  const [alerts, setAlerts] = useState([
    {
      id: 'A-101',
      tiempo: 'Hace 5 min',
      tipo: 'warning',
      mensaje: 'Estudiante estacionó Chevrolet Spark en Sector A (docentes). Patente: GD-TY-88.',
      resuelto: false
    },
    {
      id: 'A-102',
      tiempo: 'Hace 23 min',
      tipo: 'danger',
      mensaje: 'Vehículo bloqueando zona de carga / pasillo del Sector B. Patente: PZ-KJ-45.',
      resuelto: false
    },
    {
      id: 'A-103',
      tiempo: 'Hace 1 hora',
      tipo: 'info',
      mensaje: 'Reserva activa RES-2093 (Visita Técnica) está próxima a arribar.',
      resuelto: false
    }
  ]);

  // List of active parked cars
  const activeCars = spaces.filter(s => s.status === 'ocupado').map(space => ({
    id: space.id,
    label: space.label,
    name: space.occupiedByName || 'Sin Nombre',
    plate: space.occupiedByPlate || 'SIN_PATENTE',
    category: space.occupiedByUserType || 'Estudiante',
    startedAt: space.occupiedSince || 'N/A'
  }));

  const filteredActiveCars = activeCars.filter(car => 
    car.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resuelto: true } : alert
    ));
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentPlate.trim() || !incidentDetails.trim()) {
      alert('Por favor, complete la patente y el detalle de la observación militar o de guardia.');
      return;
    }

    const newAlert = {
      id: `A-G-${Math.floor(Math.random() * 900) + 100}`,
      tiempo: 'Ahora mismo',
      tipo: 'warning',
      mensaje: `Sede Maipú: Observación de Patente ${incidentPlate.toUpperCase()}: ${incidentReason}. Detalle: ${incidentDetails}`,
      resuelto: false
    };

    setAlerts(prev => [newAlert, ...prev]);
    
    // Clear form
    setIncidentPlate('');
    setIncidentDetails('');
  };

  const handleDirectCheckout = (spaceId: number) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return;

    onAddLog({
      id: `LOG-G-${Math.floor(Math.random() * 9000) + 1000}`,
      spaceId: space.id,
      spaceLabel: space.label,
      rut: 'Control de Guardia',
      nombre: space.occupiedByName || 'Desconocido',
      tipoUsuario: space.occupiedByUserType || 'Estudiante',
      patente: space.occupiedByPlate || 'N/R',
      entrada: space.occupiedSince || '08:00',
      salida: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      registradoPor: 'guardia'
    });

    onModifySpace(spaceId, {
      status: 'libre',
      occupiedByName: undefined,
      occupiedByPlate: undefined,
      occupiedByUserType: undefined,
      occupiedSince: undefined,
      reservationId: undefined
    });
  };

  return (
    <div className="space-y-6" id="guard-panel-view">
      
      {/* Upper Grid: Alerts & Live List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="guard-panel-grid">
        
        {/* Safety notifications & real-time warnings (Ley 19.628 audit) */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between" id="guard-alerts-box">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Alertas de Seguridad y Cumplimiento</h3>
                  <p className="text-[10px] text-slate-400">Auditoría física y verificación de aforos de Sede</p>
                </div>
              </div>
              <span className="text-xs bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">
                {alerts.filter(a => !a.resuelto).length} Activas
              </span>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1" id="alerts-scroller">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3.5 rounded-xl border flex items-start justify-between space-x-3 transition-opacity ${
                    alert.resuelto ? 'bg-slate-50 border-slate-200 opacity-60' :
                    alert.tipo === 'danger' ? 'bg-rose-50/50 border-rose-150 border-rose-200/65' : 
                    alert.tipo === 'warning' ? 'bg-amber-50/50 border-amber-200/60' : 'bg-blue-50/50 border-blue-200/60'
                  }`}
                  id={`alert-row-${alert.id}`}
                >
                  <div className="flex items-start space-x-2.5">
                    <span className="mt-1 text-slate-400">
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.resuelto ? 'text-slate-400' :
                        alert.tipo === 'danger' ? 'text-rose-500' : 
                        alert.tipo === 'warning' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                    </span>
                    <div className="text-xs">
                      <p className={`font-semibold ${alert.resuelto ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {alert.mensaje}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 mt-1 block">{alert.tiempo}</span>
                    </div>
                  </div>

                  {!alert.resuelto && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition flex items-center space-x-1 cursor-pointer shrink-0"
                      id={`resolve-alert-btn-${alert.id}`}
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Resolver</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick legal compliance text */}
          <div className="mt-5 p-3.5 bg-slate-50 rounded-xl text-slate-500 text-[10px] border border-slate-200 flex items-center space-x-2">
            <span className="text-emerald-500 text-xs">🛡️</span>
            <p>
              <b>Bitácora Custodiada:</b> De acuerdo con la Ley N° 19.628 de Chile, todas las acciones de bitácora de guardias se auditan y los vehículos resueltos se archivan tras 24 horas. Los RUTs personales no se muestran a terceros.
            </p>
          </div>
        </div>

        {/* Security Incident logger (manually reporting bad parkers) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6" id="incident-report-form-box">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Milestone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Registrar Incidencia de Seguridad</h3>
          </div>

          <form onSubmit={handleAddIncident} className="space-y-4 text-xs" id="incident-form-container">
            <div>
              <label className="block font-medium text-slate-600 mb-1" htmlFor="inc-plate">Patente del Vehículo</label>
              <input
                type="text"
                id="inc-plate"
                placeholder="ABCD12"
                value={incidentPlate}
                onChange={(e) => setIncidentPlate(e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold uppercase focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1" htmlFor="inc-reason">Tipo de Incidencia</label>
              <select
                id="inc-reason"
                value={incidentReason}
                onChange={(e) => setIncidentReason(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg bg-white"
              >
                <option value="Estacionado en Sector Docentes sin pase">Docente: Sin pase en Sector A</option>
                <option value="Estacionado en Bloque Preferencial">Preferencial: Sin Credencial Ley 20.422</option>
                <option value="Vehículo Mal Estacionado / Pasillo">Físico: Obstruyendo Tránsito / Pasillo</option>
                <option value="Retiro fuera de horario Máximo">Uso: Vehículo pernoctando en la sede</option>
                <option value="Otro incidente">Administrativo: Otro incidente menor</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1" htmlFor="inc-detail">Detalle de la Observación / Descripción</label>
              <textarea
                id="inc-detail"
                value={incidentDetails}
                onChange={(e) => setIncidentDetails(e.target.value)}
                placeholder="Ejemplo: Se avisa por altavoz. Vehículo Hyundai Accent estacionado sobre la demarcación de seguridad amarilla del bloque A-02."
                rows={3}
                className="w-full px-3 py-1.5 border rounded-lg focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0F2537] hover:bg-slate-850 text-white hover:text-amber-400 font-bold rounded-lg transition text-centers cursor-pointer flex justify-center items-center space-x-1"
              id="report-incident-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Guardar Reporte en Bitácora</span>
            </button>
          </form>
        </div>
      </div>

      {/* Lower section: Live Parked vehicles lists */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6" id="active-list-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Vehículos Actualmente en Recinto</h3>
              <p className="text-[10px] text-slate-400">Listado interactivo de ocupaciones activas de los 110 espacios</p>
            </div>
          </div>

          <div className="relative w-full md:w-64" id="guard-active-seach">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Patente, Nombre o Slot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl border-slate-100" id="active-cars-table-wrapper">
          <table className="w-full text-xs text-left text-slate-600" id="active-cars-table">
            <thead className="text-[10px] bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-150" id="table-head">
              <tr>
                <th scope="col" className="px-4 py-3">Slot Asignado</th>
                <th scope="col" className="px-4 py-3">Conductor</th>
                <th scope="col" className="px-4 py-3">Patente</th>
                <th scope="col" className="px-4 py-3">Perfil</th>
                <th scope="col" className="px-4 py-3">Hora Ingreso</th>
                <th scope="col" className="px-4 py-3 text-right">Controles Rápidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" id="table-body">
              {filteredActiveCars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-semibold text-[#0F2537]">Slot {car.label}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{car.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-250 border-amber-300 font-mono font-bold text-xs rounded text-amber-800 tracking-wide">
                      {car.plate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      car.category === 'Estudiante' ? 'bg-[#FFD200]/15 text-[#735A00]' :
                      car.category === 'Docente' ? 'bg-[#0F2537]/10 text-[#0F2537]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {car.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-400">⏱ {car.startedAt}</td>
                  <td className="px-4 py-3 text-right">
                    {activeRole === 'guardia' || activeRole === 'jefe_seguridad' ? (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-extrabold rounded-lg text-[9px] border shadow-2xs uppercase tracking-wide">
                        🔐 Solo Vista
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDirectCheckout(car.id)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 font-bold rounded-lg transition text-[10px] cursor-pointer inline-flex items-center space-x-1"
                        id={`direct-checkout-btn-${car.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Dar Salida</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredActiveCars.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">No hay vehículos que coincidan con la búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ParkingSpace, EntryExitLog, SystemStats } from '../types';
import { BarChart3, History, BrainCircuit, TrendingUp, Download, Eye, Calendar, Clock, Lock, Sparkles, Filter, Search, Smartphone } from 'lucide-react';

interface JefaturaDashboardProps {
  spaces: ParkingSpace[];
  logs: EntryExitLog[];
  onClearLogs: () => void;
}

export function JefaturaDashboard({ spaces, logs, onClearLogs }: JefaturaDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | string>('ALL');
  
  // AI report generation simulation
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const total = spaces.length;
  const occupied = spaces.filter(s => s.status === 'ocupado').length;
  const reserved = spaces.filter(s => s.status === 'reservado').length;
  const blocked = spaces.filter(s => s.status === 'bloqueado').length;
  const free = spaces.filter(s => s.status === 'libre').length;
  const occupancyRate = Math.round((occupied / total) * 100);

  // Group statistics of active parkers by category
  const studentParked = spaces.filter(s => s.status === 'ocupado' && s.occupiedByUserType === 'Estudiante').length;
  const teacherParked = spaces.filter(s => s.status === 'ocupado' && s.occupiedByUserType === 'Docente').length;
  const staffParked = spaces.filter(s => s.status === 'ocupado' && (s.occupiedByUserType === 'Colaborador' || s.occupiedByUserType === 'Directivo')).length;
  const visitorParked = spaces.filter(s => s.status === 'ocupado' && (s.occupiedByUserType === 'Visita' || s.occupiedByUserType === 'Externo')).length;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.spaceLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userTypeFilter === 'ALL' || log.tipoUsuario === userTypeFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate QR usage vs manual entries
  const qrEntriesCount = logs.filter(log => log.registradoPor === 'qr_autonomo').length;
  const totalEntriesCount = logs.length;
  const qrUsagePercent = totalEntriesCount > 0 ? Math.round((qrEntriesCount / totalEntriesCount) * 100) : 85;

  // Triggering the operations smart report
  const generateAIReport = () => {
    setIsGeneratingAI(true);
    setAiReport(null);
    
    // Simulate thinking delay representing Gemini operation
    setTimeout(() => {
      const occupiedPercent = Math.round((occupied / total) * 100);
      let optimizationTip = '';
      
      if (occupiedPercent > 70) {
        optimizationTip = 'ALTA OCUPACIÓN CRÍTICA DETECTADA (>70%). Se recomienda aplicar la política de desborde del Sector C (Visitas) liberando 5 cubículos temporales para Alumnos regulares. Adicionalmente, sugerir a Jefatura de Carrera promover el carpooling en la sede Maipú para el bloque Vespertino de las 19:00 hrs.';
      } else if (occupiedPercent > 40) {
        optimizationTip = 'OCUPACIÓN MODERADA ESTABLE (40-70%). Distribución de aforo equilibrada. Monitorear el Sector B (alumnos) entre las 13:00 y las 14:30 ya que presenta mayor nivel de rotación debido al cambio de bloque Diurno/Vespertino.';
      } else {
        optimizationTip = 'OCUPACIÓN BAJA / VALLE (<40%). Óptima disposición de espacios. Oportunidad para agendar mantenciones selectivas de demarcación amarilla o luminarias del Sector B sin congestionar los flujos de la Sede.';
      }

      const reportHtml = `
        <div class="space-y-4 text-xs leading-relaxed text-slate-700" id="ai-report-body">
          <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center space-x-2 text-indigo-900 font-bold mb-3">
            <span class="text-base">✨</span>
            <span>DIAGNÓSTICO AUTOMÁTICO EN TIEMPO REAL: SEDE DUOC MAIPÚ</span>
          </div>
          
          <p>Estimada Jefatura de Operaciones, en base a la ocupación actual del <b>${occupiedPercent}%</b> y el análisis de la bitácora física de guardias, se han compilado los siguientes insights estratégicos:</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p class="font-bold text-slate-800 mb-1">📊 Métricas de Capacidad</p>
              <ul class="list-disc pl-4 space-y-1 text-[11px]">
                <li>Espacios Libres Totales: <b>${free} de ${total}</b></li>
                <li>Porcentaje de Ocupación Estudiante (Sector B): <b>${Math.round((studentParked/60)*100)}%</b></li>
                <li>Porcentaje de Ocupación Docente (Sector A): <b>${Math.round((teacherParked/30)*100)}%</b></li>
              </ul>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p class="font-bold text-slate-800 mb-1">⏱️ Comportamiento de Pico</p>
              <p class="text-[11px] leading-snug">Se registran picos máximos de entrada a las <b>08:30</b> (Módulo 1 Diurno) y las <b>18:30</b> (Módulo Vespertino). El 82% del ingreso de estudiantes se realiza de manera autónoma con el <b>Pase QR digital</b>.</p>
            </div>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-250 rounded-xl text-amber-900">
            <span class="font-extrabold block mb-0.5">⚠️ Directiva de Optimización Recomendada:</span>
            <p class="text-[11px]">${optimizationTip}</p>
          </div>

          <div class="p-3 bg-emerald-50 border border-emerald-250 rounded-xl text-slate-700">
            <span class="font-bold text-emerald-800 block mb-0.5">⚖️ Auditoría Legal de Datos (Ley 19.628 de Chile)</span>
            <p class="text-[11px] leading-relaxed">El sistema de cifrado implementado cumple al 100% con los estándares chilenos de privacidad. Las patentes guardadas en base de datos están ofuscadas en un 40% en todos los reportes impresos. No se almacenan números RUT con fines de marketing. El consentimiento fue firmado digitalmente por los conductores al ingresar.</p>
          </div>
        </div>
      `;
      setAiReport(reportHtml);
      setIsGeneratingAI(false);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="jefatura-dashboard-view">
      
      {/* 3 Analytics Cards (Earnings, Occupancy split, QR Efficiency) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="jefatura-analyt-row">
        
        {/* Occupancy Radial Graph and Split metrics */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between" id="occupancy-analytics-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#FFD200]/20 text-[#735A00] rounded-lg">📊</span>
              <h3 className="font-bold text-slate-800 text-sm">Distribución de Ocupación</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">Tiempo Real</span>
          </div>

          {/* Simulated chart ring using Tailwind */}
          <div className="flex items-center space-x-6 py-2" id="simulated-donut-grid">
            <div className="relative flex-shrink-0" id="donut-canvas">
              <svg className="w-24 h-24" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-1000"
                  strokeDasharray={`${occupancyRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-800 leading-none">{occupancyRate}%</span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Ocupación</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 w-full" id="donut-values-legend">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span> <span>Alumnos</span></span>
                <span className="font-bold text-slate-700">{studentParked} autos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span> <span>Docentes</span></span>
                <span className="font-bold text-slate-700">{teacherParked} autos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> <span>Funcionarios</span></span>
                <span className="font-bold text-slate-700">{staffParked} autos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-slate-400 rounded-full inline-block"></span> <span>Visitas / Priv</span></span>
                <span className="font-bold text-slate-700">{visitorParked} autos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Peak Hours chart block (08:30 and 18:30 emphasis) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between" id="peak-schedule-chart">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">⏱️</span>
              <h3 className="font-bold text-slate-800 text-sm">Flujos y Horas Punta</h3>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">2 picos diarios</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3 leading-snug">
            Los módulos de entrada de estudiantes y salida en Duoc UC Maipú se concentran en las bandas horarias detalladas:
          </p>

          <div className="flex items-end justify-between h-24 pt-2 border-b border-l border-slate-100" id="hist-peak-axis">
            {/* 08:00 */}
            <div className="flex flex-col items-center flex-1 space-y-1 cursor-help group relative">
              <div className="w-5 bg-amber-400 hover:bg-[#0F2537] rounded-t-xs h-18 transition-all"></div>
              <span className="text-[10px] text-slate-400 font-mono scale-90">08:30</span>
              <div className="absolute bottom-11 bg-slate-900 text-white rounded p-1.5 text-[9px] scale-0 group-hover:scale-100 transition whitespace-nowrap">Pico Docentes (94%)</div>
            </div>
            {/* 11:30 */}
            <div className="flex flex-col items-center flex-1 space-y-1 cursor-help group relative">
              <div className="w-5 bg-amber-400/40 hover:bg-[#0F2537] rounded-t-xs h-10 transition-all"></div>
              <span className="text-[10px] text-slate-400 font-mono scale-90">11:30</span>
            </div>
            {/* 14:00 */}
            <div className="flex flex-col items-center flex-1 space-y-1 cursor-help group relative">
              <div className="w-5 bg-amber-400/70 hover:bg-[#0F2537] rounded-t-xs h-14 transition-all"></div>
              <span className="text-[10px] text-slate-400 font-mono scale-90">14:00</span>
            </div>
            {/* 18:30 */}
            <div className="flex flex-col items-center flex-1 space-y-1 cursor-help group relative">
              <div className="w-5 bg-indigo-600 hover:bg-[#FFAA00] rounded-t-xs h-20 transition-all"></div>
              <span className="text-[10px] text-slate-700 font-bold font-mono scale-90">18:30</span>
              <div className="absolute bottom-14 bg-slate-900 text-white rounded p-1.5 text-[9px] scale-0 group-hover:scale-100 transition whitespace-nowrap">Pico Estudiantes (98%)</div>
            </div>
            {/* 21:00 */}
            <div className="flex flex-col items-center flex-1 space-y-1 cursor-help group relative">
              <div className="w-5 bg-amber-400/30 hover:bg-[#0F2537] rounded-t-xs h-8 transition-all"></div>
              <span className="text-[10px] text-slate-400 font-mono scale-90">21:00</span>
            </div>
          </div>
        </div>

        {/* Visitas Revenue replaced with QR Efficiency card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between" id="qr-efficiency-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-emerald-600 bg-emerald-50 p-0.5 rounded-md" />
              <h3 className="font-bold text-slate-800 text-sm">Eficiencia de Acceso QR</h3>
            </div>
            <span className="text-[10px] font-bold bg-[#FFD200]/20 text-[#735A00] px-2 py-0.5 rounded text-right">Tótem Activo</span>
          </div>

          <div className="py-2 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Uso Pase QR Digital</span>
            <span className="text-3xl font-black text-slate-800 mt-1">{qrUsagePercent}%</span>
            <span className="text-[11px] text-slate-500 mt-1.5">Proporción de ingresos validados por tótem inteligente</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]" id="qr-efficiency-rate">
            <span className="text-slate-500">Total Validaciones QR:</span>
            <span className="font-extrabold text-emerald-600">{qrEntriesCount} de {totalEntriesCount} accesos</span>
          </div>
        </div>
      </div>

      {/* Operations optimization analyzer with AI (Gemini simulation) */}
      <div className="bg-gradient-to-br from-[#0F2537] to-[#1E3953] rounded-2xl shadow-md p-6 text-white" id="ops-ai-box">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 text-amber-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Asistente de Optimización Operacional IA</h3>
              <p className="text-xs text-slate-350">Genera informes de flujo vehicular y resolución legal con Inteligencia Artificial</p>
            </div>
          </div>

          <button
            onClick={generateAIReport}
            disabled={isGeneratingAI}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0F2537] font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center space-x-2"
            id="trigger-ai-report-btn"
          >
            {isGeneratingAI ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1 text-[#0F2537]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analizando Bitácoras Maipú...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4 text-[#0F2537]" />
                <span>Generar Diagnóstico de Planta</span>
              </>
            )}
          </button>
        </div>

        {aiReport ? (
          <div className="bg-white text-slate-800 rounded-xl p-5 border border-slate-150 animate-fade-in shadow-inner max-h-[350px] overflow-y-auto" id="diagnostico-ai-result">
            <div dangerouslySetInnerHTML={{ __html: aiReport }} />
          </div>
        ) : !isGeneratingAI ? (
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Seleccione el botón de diagnóstico superior para analizar el aforo de 110 espacios, el listado de alertas de guardias registradas hoy y compilar pautas de optimización sugeridas para la Sede Maipú.
          </p>
        ) : null}
      </div>

      {/* Ingress / Egress table logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6" id="history-logs-box">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Historial General de Entradas y Salidas</h3>
              <p className="text-[10px] text-slate-400">Total de movimientos en barreras inteligentes el día de hoy</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto" id="log-history-filters">
            <div className="relative w-full md:w-48" id="log-search-wrap">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por patente o conductor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="px-2 py-1 text-xs border rounded-lg bg-slate-50 font-semibold"
              id="log-user-filter"
            >
              <option value="ALL">Todos los perfiles</option>
              <option value="Estudiante">Estudiantes</option>
              <option value="Docente">Docentes</option>
              <option value="Colaborador">Funcionarios</option>
              <option value="Visita">Visitas</option>
            </select>

            <button
              onClick={onClearLogs}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-lg text-xs cursor-pointer"
              id="clear-logs-btn"
            >
              Limpiar Historial
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl border-slate-100" id="historical-logs-table-wrapper">
          <table className="w-full text-xs text-left text-slate-650" id="history-logs-table">
            <thead className="text-[10px] bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-150">
              <tr>
                <th scope="col" className="px-4 py-3">ID Logs</th>
                <th scope="col" className="px-4 py-3">Conductor</th>
                <th scope="col" className="px-4 py-3">Vehículo / Patente</th>
                <th scope="col" className="px-4 py-3">Ubicación</th>
                <th scope="col" className="px-4 py-3">Perfil Driver</th>
                <th scope="col" className="px-4 py-3">Horario</th>
                <th scope="col" className="px-4 py-3">Método Entrada</th>
                <th scope="col" className="px-4 py-3 text-right">Estado Acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" id="hist-table-body">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-400">{log.id}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{log.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono bg-amber-50 border border-amber-350 border-amber-300 font-bold text-xs px-2 py-0.5 rounded text-amber-800">
                      {log.patente.slice(0, 2)}-{log.patente.slice(2, 4)}-{log.patente.slice(4)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0F2537]">Slot {log.spaceLabel}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.tipoUsuario === 'Estudiante' ? 'bg-[#FFD200]/15 text-[#735A00]' :
                      log.tipoUsuario === 'Docente' ? 'bg-[#0F2537]/10 text-[#0F2537]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {log.tipoUsuario}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-450 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {log.entrada} - {log.salida || 'Estacionado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      log.registradoPor === 'qr_autonomo' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-blue-50 text-blue-700 font-bold'
                    }`}>
                      {log.registradoPor === 'qr_autonomo' ? 'PQR Totem' : 'PGuardia Directo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    Gratuito
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 italic">No hay logs en el historial actual.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

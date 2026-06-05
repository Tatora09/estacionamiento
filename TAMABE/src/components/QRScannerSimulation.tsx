/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, ParkingSpace, EntryExitLog, Reservation } from '../types';
import { QrCode, Smartphone, Disc, ShieldCheck, CheckCircle2, AlertCircle, ScanLine, RotateCw, Volume2 } from 'lucide-react';

interface QRScannerSimulationProps {
  currentUser: User | null;
  spaces: ParkingSpace[];
  onModifySpace: (spaceId: number, updates: Partial<ParkingSpace>) => void;
  onAddLog: (log: EntryExitLog) => void;
  activeReservations: Reservation[];
}

export function QRScannerSimulation({
  currentUser,
  spaces,
  onModifySpace,
  onAddLog,
  activeReservations,
}: QRScannerSimulationProps) {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedDriverName, setScannedDriverName] = useState('');
  const [scannedPlate, setScannedPlate] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [assignedSpaceLabel, setAssignedSpaceLabel] = useState('');

  // Find if user has a reservation or is already parked
  const userReservation = currentUser 
    ? activeReservations.find(r => r.patente === currentUser.patente && r.status === 'pendiente')
    : null;

  const isUserParked = currentUser
    ? spaces.some(s => s.occupiedByPlate === currentUser.patente)
    : false;

  // Let's draw a nice procedurally-patterned QR Code inside an SVG
  const renderMockQR = () => {
    return (
      <svg className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-slate-200" viewBox="0 0 100 100" id="qr-code-vector">
        {/* Safe anchors */}
        <rect x="5" y="5" width="25" height="25" fill="#0F2537" rx="2" />
        <rect x="9" y="9" width="17" height="17" fill="white" rx="1" />
        <rect x="13" y="13" width="9" height="9" fill="#FFAA00" />

        <rect x="70" y="5" width="25" height="25" fill="#0F2537" rx="2" />
        <rect x="74" y="9" width="17" height="17" fill="white" rx="1" />
        <rect x="78" y="13" width="9" height="9" fill="#FFAA00" />

        <rect x="5" y="70" width="25" height="25" fill="#0F2537" rx="2" />
        <rect x="9" y="74" width="17" height="17" fill="white" rx="1" />
        <rect x="13" y="78" width="9" height="9" fill="#FFAA00" />

        <rect x="75" y="75" width="12" height="12" fill="#0F2537" rx="1" />
        
        {/* Procedural noise pattern */}
        <rect x="35" y="8" width="10" height="4" fill="#0F2537" />
        <rect x="50" y="5" width="4" height="15" fill="#0F2537" />
        <rect x="60" y="12" width="6" height="6" fill="#FFAA00" />
        <rect x="35" y="22" width="15" height="4" fill="#0F2537" />
        <rect x="5" y="35" width="8" height="6" fill="#0F2537" />
        <rect x="18" y="38" width="12" height="4" fill="#0F2537" />
        <rect x="35" y="35" width="30" height="4" fill="#0F2537" />
        <rect x="42" y="45" width="6" height="12" fill="#FFAA00" />
        <rect x="12" y="50" width="14" height="8" fill="#0F2537" />
        <rect x="55" y="35" width="4" height="20" fill="#0F2537" />
        <rect x="70" y="35" width="15" height="5" fill="#0F2537" />
        <rect x="80" y="45" width="8" height="8" fill="#FFAA00" />
        <rect x="88" y="60" width="6" height="10" fill="#0F2537" />
        <rect x="35" y="65" width="18" height="6" fill="#0F2537" />
        <rect x="35" y="75" width="8" height="20" fill="#0F2537" />
        <rect x="48" y="82" width="14" height="6" fill="#FFAA00" />
        <rect x="68" y="85" width="5" height="10" fill="#0F2537" />
        <rect x="55" y="60" width="10" height="4" fill="#0F2537" />
      </svg>
    );
  };

  const handleTriggerMockScan = (selectedType: 'current' | 'random_student' | 'random_visitor' | 'error') => {
    setScanStatus('scanning');
    setScanMessage('Leyendo código cifrado Duoc QR...');
    
    // Simulate scan delay (1 second)
    setTimeout(() => {
      let driverName = '';
      let plate = '';
      let userType = 'Estudiante';
      let errorOccured = false;
      let errorMsg = '';
      let targetSpace: ParkingSpace | undefined;

      if (selectedType === 'current') {
        if (!currentUser) {
          errorOccured = true;
          errorMsg = 'No hay conductor registrado actualmente en este navegador.';
        } else if (isUserParked) {
          // If already parked, scan acts as a CHECKOUT!
          const parkedSpace = spaces.find(s => s.occupiedByPlate === currentUser.patente);
          if (parkedSpace) {
            // we will checkout
            onModifySpace(parkedSpace.id, {
              status: 'libre',
              occupiedByPlate: undefined,
              occupiedByName: undefined,
              occupiedSince: undefined,
              occupiedByUserType: undefined,
              reservationId: undefined
            });

            onAddLog({
              id: `LOG-QR-${Math.floor(Math.random() * 9000) + 1000}`,
              spaceId: parkedSpace.id,
              spaceLabel: parkedSpace.label,
              rut: currentUser.rut,
              nombre: currentUser.nombre,
              tipoUsuario: currentUser.tipo,
              patente: currentUser.patente,
              entrada: parkedSpace.occupiedSince || 'N/R',
              salida: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
              registradoPor: 'qr_autonomo'
            });

            setScanStatus('success');
            setScannedDriverName(currentUser.nombre);
            setScannedPlate(currentUser.patente);
            setAssignedSpaceLabel(parkedSpace.label);
            setScanMessage('¡Salida confirmada por QR! Estacionamiento liberado.');
            return;
          } else {
            errorOccured = true;
            errorMsg = 'Error en coincidencia de espacio de parqueo.';
          }
        } else {
          driverName = currentUser.nombre;
          plate = currentUser.patente;
          userType = currentUser.tipo;

          // Find appropriate space
          // If they have reservation, we give them that reservation space
          if (userReservation) {
            targetSpace = spaces.find(s => s.id === userReservation.spaceId);
          } else {
            // Find free space according to sector rule
            if (currentUser.tipo === 'Docente' || currentUser.tipo === 'Colaborador' || currentUser.tipo === 'Directivo') {
              targetSpace = spaces.find(s => s.sector === 'A' && s.status === 'libre');
            } else if (currentUser.tipo === 'Estudiante') {
              targetSpace = spaces.find(s => s.sector === 'B' && s.status === 'libre');
            } else {
              targetSpace = spaces.find(s => s.sector === 'C' && s.status === 'libre');
            }
          }
        }
      } else if (selectedType === 'random_student') {
        driverName = 'Ignacio Valdés';
        plate = 'PL-WD-88';
        userType = 'Estudiante';
        targetSpace = spaces.find(s => s.sector === 'B' && s.status === 'libre');
      } else if (selectedType === 'random_visitor') {
        driverName = 'Visita Inspectora Mineduc';
        plate = 'RT-RT-90';
        userType = 'Visita';
        targetSpace = spaces.find(s => s.sector === 'C' && s.status === 'libre');
      } else if (selectedType === 'error') {
        errorOccured = true;
        errorMsg = 'Código QR Expirado / Firma digital institucional no coincide.';
      }

      if (errorOccured) {
        setScanStatus('error');
        setScanMessage(errorMsg);
        return;
      }

      if (!targetSpace) {
        setScanStatus('error');
        setScanMessage(`No quedan espacios libres en el sector asignado para ${userType}.`);
        return;
      }

      // Successful check-in!
      // Occupy space
      onModifySpace(targetSpace.id, {
        status: 'ocupado',
        occupiedByPlate: plate,
        occupiedByName: driverName,
        occupiedByUserType: userType as any,
        occupiedSince: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        reservationId: undefined // clear reservation if any
      });

      // Append entry log
      onAddLog({
        id: `LOG-QR-${Math.floor(Math.random() * 9000) + 1000}`,
        spaceId: targetSpace.id,
        spaceLabel: targetSpace.label,
        rut: currentUser?.rut || '20.123.456-7',
        nombre: driverName,
        tipoUsuario: userType as any,
        patente: plate,
        entrada: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        registradoPor: 'qr_autonomo'
      });

      setScanStatus('success');
      setScannedDriverName(driverName);
      setScannedPlate(plate);
      setAssignedSpaceLabel(targetSpace.label);
      setScanMessage(`¡Acceso Permitido! Espacio Asignado: ${targetSpace.label}`);

    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="qr-simulation-row">
      
      {/* Driver View (Smartphone Screen Pass) */}
      <div className="bg-slate-100 p-6 md:p-8 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center relative" id="driver-phone-container">
        <div className="absolute top-4 left-4 flex items-center space-x-1 text-slate-500 font-semibold text-xs uppercase tracking-wider">
          <Smartphone className="w-4 h-4" />
          <span>Vista Celular del Conductor</span>
        </div>

        {currentUser ? (
          <div className="w-72 bg-white rounded-3xl shadow-md border-8 border-[#0F2537] overflow-hidden flex flex-col justify-between" style={{ height: '512px' }} id="phone-frame">
            {/* Top Bar Speaker notch style */}
            <div className="w-full bg-[#0F2537] py-2 flex justify-center items-center">
              <div className="w-16 h-3.5 bg-black rounded-full"></div>
            </div>

            {/* Smartpass card header */}
            <div className="bg-gradient-to-r from-[#0F2537] to-[#1E3953] text-white p-4 text-center relative">
              <div className="absolute right-3 top-3 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
              <h4 className="font-extrabold text-[#FFAA00] text-sm tracking-wider">DUOC UC SMARTPASS</h4>
              <p className="text-[10px] text-slate-300">Pase Digital de Estacionamientos</p>
            </div>

            {/* QR block frame */}
            <div className="p-4 flex-1 flex flex-col justify-center text-center space-y-3.5">
              <div className="relative inline-block mx-auto">
                {renderMockQR()}
                <div className="absolute inset-0 bg-amber-500/5 animate-pulse rounded-xl"></div>
              </div>

              <div id="phone-card-user-meta">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Conductor</span>
                <p className="font-bold text-slate-800 text-sm">{currentUser.nombre}</p>
                <span className="inline-block mt-1 font-mono text-xs px-2.5 py-0.5 bg-slate-100 text-[#0F2537] rounded-md font-extrabold border border-slate-300/60">
                  PATENTE: {currentUser.patente.slice(0, 2)}-{currentUser.patente.slice(2, 4)}-{currentUser.patente.slice(4)}
                </span>
              </div>
            </div>

            {/* Pass status footer */}
            <div className="bg-slate-50 border-t p-3 text-center" id="phone-card-footer">
              <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-600 font-semibold" id="pass-auth-beacon">
                {isUserParked ? (
                  <>
                    <Disc className="w-4 h-4 text-rose-500 animate-spin" />
                    <span className="text-rose-700">Vehículo Estacionado</span>
                  </>
                ) : userReservation ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-700">Reserva Vigente: {userReservation.spaceLabel}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700">Pase QR Autorizado Activo</span>
                  </>
                )}
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Cumple con Ley 19.628 Duoc UC Maipú</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-8" id="no-driver-registered-msg">
            <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-bounce" />
            <p className="text-slate-600 font-semibold text-sm">No hay conductor registrado todavía.</p>
            <p className="text-slate-400 text-xs mt-1 max-w-xs">Complete primero los datos personales en la pestaña "Registro Conductor" para habilitar su smartphone digital y pase QR.</p>
          </div>
        )}
      </div>

      {/* Guard Panel (QR Scanner Simulated Tablet Console) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between" id="guard-tablet-container">
        <div>
          <div className="flex items-center space-x-2.5 mb-5">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Tótem Validador QR / Terminal de Guardia</h3>
              <p className="text-[11px] text-slate-400">Simulación interactiva de entrada y salida autónoma</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Simula el sensor óptico físico instalado en la barrera principal de Duoc Sede Maipú. El conductor acerca su celular, el escáner decodifica, valida el RUT de protección de datos, comprueba si hay espacios disponibles para estudiante/docente, y levanta la barrera asignando un slot asignado de manera digital.
          </p>

          {/* Scanner view box simulation */}
          <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video flex flex-col justify-center items-center p-4 border-2 border-slate-700 mb-6" id="scanner-view-port">
            {/* Pulsing red scanning line */}
            {scanStatus === 'scanning' && (
              <div className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" style={{ animationDuration: '1.5s' }}></div>
            )}

            {scanStatus === 'idle' && (
              <div className="text-center text-slate-400 space-y-2">
                <QrCode className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                <span className="text-[11px] font-mono tracking-wider block">TERMINAL EN ESPERA DE QR...</span>
              </div>
            )}

            {scanStatus === 'scanning' && (
              <div className="text-center text-amber-400 space-y-2">
                <RotateCw className="w-8 h-8 mx-auto animate-spin" />
                <span className="text-xs font-mono block">ESCANEAR CÓDIGO QR...</span>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="text-center text-emerald-400 space-y-1.5 animate-fade-in" id="success-scan-terminal-ui">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <span className="text-xs font-bold font-mono tracking-wide block">ACCESO CONCEDIDO ✔</span>
                <span className="text-[10px] text-slate-300 font-mono block">Patente: {scannedPlate} | Piloto: {scannedDriverName}</span>
                <span className="text-xs text-amber-300 font-bold font-mono bg-white/10 px-3 py-1 rounded-full inline-block mt-1">E-Slot asignado: {assignedSpaceLabel}</span>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="text-center text-rose-400 space-y-1.5" id="error-scan-terminal-ui">
                <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
                <span className="text-xs font-bold font-mono block">ACCESO DENEGADO ❌</span>
                <span className="text-[11px] text-slate-300 max-w-xs block">{scanMessage}</span>
              </div>
            )}
          </div>

          {/* Dynamic scan helper details */}
          {scanStatus !== 'idle' && scanStatus !== 'scanning' && (
            <div className="p-3 bg-slate-50 border rounded-xl text-xs mb-6 text-slate-600 animate-fade-in flex items-center justify-between">
              <div>
                <p><b>Mensaje de Estado:</b> {scanMessage}</p>
              </div>
              <button
                onClick={() => setScanStatus('idle')}
                className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 transition text-[10px]"
              >
                Reiniciar Lector
              </button>
            </div>
          )}
        </div>

        {/* Laser Action button panel */}
        <div className="space-y-3" id="scanner-action-buttons">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Acciones de Prueba de Simulación:</span>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleTriggerMockScan('current')}
              disabled={scanStatus === 'scanning'}
              className="py-2.5 bg-[#0F2537] hover:bg-[#1C3B57] hover:text-amber-400 text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer flex flex-col justify-center items-center"
              id="scan-current-driver-btn"
            >
              <span>Escanear Celular</span>
              <span className="text-[9px] opacity-75 font-normal">({currentUser ? 'Vigente' : 'Sin registro'})</span>
            </button>

            <button
              onClick={() => handleTriggerMockScan('random_student')}
              disabled={scanStatus === 'scanning'}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer flex flex-col justify-center items-center"
            >
              <span>Escanear Estudiante</span>
              <span className="text-[9px] text-slate-500 font-normal">Patente: PL-WD-88</span>
            </button>

            <button
              onClick={() => handleTriggerMockScan('random_visitor')}
              disabled={scanStatus === 'scanning'}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer flex flex-col justify-center items-center"
            >
              <span>Escanear Visita</span>
              <span className="text-[9px] text-slate-500 font-normal">Patente: RT-RT-90</span>
            </button>

            <button
              onClick={() => handleTriggerMockScan('error')}
              disabled={scanStatus === 'scanning'}
              className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer flex flex-col justify-center items-center"
            >
              <span>Simular QR Expirado</span>
              <span className="text-[9px] text-rose-500 font-normal">Falla de Acceso</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

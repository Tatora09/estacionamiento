/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'conductor' | 'guardia' | 'jefe_seguridad' | 'jefatura';

export type UserType = 'Estudiante' | 'Docente' | 'Colaborador' | 'Directivo' | 'Visita' | 'Externo';

export interface User {
  rut: string;
  nombre: string;
  correo: string;
  celular: string;
  tipo: UserType;
  patente: string;
  modeloVehiculo?: string;
  aceptaTerminos: boolean; // Ley 19.628 de protección de datos personales
}

export type SpaceStatus = 'libre' | 'ocupado' | 'reservado' | 'bloqueado';
export type SpaceType = 'regular' | 'preferencial' | 'directivo' | 'moto';

export interface ParkingSpace {
  id: number;
  label: string;
  sector: 'A' | 'B' | 'C'; // A: Colaboradores/Docentes, B: Estudiantes, C: Visitas/Preferencial
  type: SpaceType;
  status: SpaceStatus;
  occupiedByPlate?: string;
  occupiedByName?: string;
  occupiedByUserType?: UserType;
  occupiedSince?: string;
  reservationId?: string;
}

export interface Reservation {
  id: string;
  spaceId: number;
  spaceLabel: string;
  rut: string;
  nombre: string;
  patente: string;
  tipoUsuario: UserType;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  status: 'pendiente' | 'activa' | 'completada' | 'cancelada';
}

export interface EntryExitLog {
  id: string;
  spaceId: number;
  spaceLabel: string;
  rut: string;
  nombre: string;
  tipoUsuario: UserType;
  patente: string;
  entrada: string;
  salida?: string;
  montoCobro?: number; // Para visitas / externos
  registradoPor: 'guardia' | 'qr_autonomo';
}

export interface SystemStats {
  ocupacionActual: number;
  capacidadTotal: number;
  espaciosReservados: number;
  espaciosBloqueados: number;
  espaciosLibres: number;
}

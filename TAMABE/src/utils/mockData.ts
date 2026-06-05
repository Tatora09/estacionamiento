/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParkingSpace, EntryExitLog, Reservation, User } from '../types';

// Helper to format Date for Chilean Time zone simulation
export function getFormattedTime(timeOffsetMinutes: number = 0): string {
  const date = new Date();
  if (timeOffsetMinutes !== 0) {
    date.setMinutes(date.getMinutes() + timeOffsetMinutes);
  }
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export function getFormattedDate(): string {
  return new Date().toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 110 Spaces Generator
export function generateInitialSpaces(): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];

  // Sector A: Colaboradores / Docentes (Spots 1 - 30)
  for (let i = 1; i <= 30; i++) {
    let type: 'regular' | 'preferencial' | 'directivo' | 'moto' = 'regular';
    if (i <= 5) type = 'directivo';
    else if (i >= 26) type = 'moto';

    spaces.push({
      id: i,
      label: `A-${i.toString().padStart(2, '0')}`,
      sector: 'A',
      type,
      status: 'libre',
    });
  }

  // Sector B: Estudiantes (Spots 31 - 90)
  for (let i = 31; i <= 90; i++) {
    let type: 'regular' | 'preferencial' | 'directivo' | 'moto' = 'regular';
    if (i >= 86) type = 'moto';

    spaces.push({
      id: i,
      label: `B-${(i - 30).toString().padStart(2, '0')}`,
      sector: 'B',
      type,
      status: 'libre',
    });
  }

  // Sector C: Visitas & Preferencial (Spots 91 - 110)
  for (let i = 91; i <= 110; i++) {
    let type: 'regular' | 'preferencial' | 'directivo' | 'moto' = 'regular';
    if (i <= 95) type = 'preferencial'; // Movilidad Reducida / Embarazadas
    else if (i >= 106) type = 'moto';

    spaces.push({
      id: i,
      label: `C-${(i - 90).toString().padStart(2, '0')}`,
      sector: 'C',
      type,
      status: 'libre',
    });
  }

  // Seed with realistic starting state: EXACTLY 70 occupied spaces and 40 available spaces.
  const occupiedDriversList = [
    // Sector A: 23 drivers
    { name: 'Rodrigo Arriagada Mellado', plate: 'FPST-82', type: 'Directivo', time: '07:45' },
    { name: 'María Loreto Vásquez', plate: 'HWKB-43', type: 'Directivo', time: '07:50' },
    { name: 'Eduardo Elgueta Lagos', plate: 'JYRD-50', type: 'Directivo', time: '08:02' },
    { name: 'Carolina Soto Valdivia', plate: 'KSZP-12', type: 'Directivo', time: '08:15' },
    { name: 'Prof. Francisco Barraza', plate: 'LXCV-95', type: 'Docente', time: '08:18' },
    { name: 'Sebastián Muñoz Jara', plate: 'PLTY-31', type: 'Estudiante', time: '08:20' },
    { name: 'Javier Ignacio Sanhueza', plate: 'RJFW-22', type: 'Estudiante', time: '08:22' },
    { name: 'Camila Paz Orellana', plate: 'TCXG-88', type: 'Estudiante', time: '08:25' },
    { name: 'Felipe Andrés Galdames', plate: 'VGPL-56', type: 'Estudiante', time: '08:30' },
    { name: 'María José Henríquez', plate: 'ZKRD-19', type: 'Colaborador', time: '08:32' },
    { name: 'Carlos Alberto Retamal', plate: 'BCXW-45', type: 'Colaborador', time: '08:35' },
    { name: 'Bastián Antonio Flores', plate: 'DLKF-90', type: 'Estudiante', time: '08:40' },
    { name: 'Valentina Ignacia Durán', plate: 'FHSP-38', type: 'Estudiante', time: '08:42' },
    { name: 'Matías Ignacio Espinoza', plate: 'GJBY-71', type: 'Estudiante', time: '08:45' },
    { name: 'Alejandra María Godoy', plate: 'HPDT-22', type: 'Docente', time: '08:48' },
    { name: 'Fernando Javier Cáceres', plate: 'JWZX-15', type: 'Docente', time: '08:50' },
    { name: 'Nathalie Nicole Astudillo', plate: 'KLTG-67', type: 'Docente', time: '08:52' },
    { name: 'Ignacio Esteban Poblete', plate: 'LPXW-83', type: 'Estudiante', time: '08:55' },
    { name: 'Gonzalo Daniel Vera', plate: 'MNVB-44', type: 'Estudiante', time: '08:58' },
    { name: 'Claudia Andrea Carvajal', plate: 'PTRG-11', type: 'Visita', time: '09:05' },
    { name: 'Cristian Alexis Morales', plate: 'RYKB-99', type: 'Externo', time: '09:10' },
    { name: 'Bárbara Sofía Pezoa', plate: 'TWLV-50', type: 'Estudiante', time: '09:12' },
    { name: 'Diego Alejandro Salazar', plate: 'VCFD-17', type: 'Estudiante', time: '09:15' },

    // Sector B: 40 drivers
    { name: 'Esteban Andrés Pizarro', plate: 'XPLR-29', type: 'Estudiante', time: '08:00' },
    { name: 'Catalina Paz Troncoso', plate: 'ZFTW-84', type: 'Estudiante', time: '08:05' },
    { name: 'Mauricio Alejandro Rivas', plate: 'BKLY-62', type: 'Estudiante', time: '08:10' },
    { name: 'Sofía Elizabeth Parra', plate: 'DHXG-19', type: 'Estudiante', time: '08:12' },
    { name: 'Álvaro Patricio Miranda', plate: 'FJSP-57', type: 'Docente', time: '08:15' },
    { name: 'Francisca Elena Silva', plate: 'GLWT-41', type: 'Docente', time: '08:20' },
    { name: 'Renato Javier Garrido', plate: 'HKDZ-93', type: 'Colaborador', time: '08:21' },
    { name: 'Daniela Constanza Rojas', plate: 'JPRS-10', type: 'Colaborador', time: '08:24' },
    { name: 'Matías Daniel Ortega', plate: 'KTLB-82', type: 'Estudiante', time: '08:28' },
    { name: 'Isidora Esperanza Núñez', plate: 'LWXT-36', type: 'Estudiante', time: '08:30' },
    { name: 'Lucas Gabriel Medina', plate: 'MNVD-78', type: 'Estudiante', time: '08:32' },
    { name: 'Constanza Belén Valenzuela', plate: 'PKRG-49', type: 'Estudiante', time: '08:35' },
    { name: 'Prof. Roberto Santelices', plate: 'RJSW-11', type: 'Docente', time: '08:38' },
    { name: 'Javiera Andrea Concha', plate: 'TYXB-85', type: 'Docente', time: '08:40' },
    { name: 'Patricio Orlando Vidal', plate: 'VHPC-26', type: 'Colaborador', time: '08:42' },
    { name: 'Paulina Alejandra Cáceres', plate: 'WKFD-50', type: 'Estudiante', time: '08:45' },
    { name: 'Kevin Ignacio Contreras', plate: 'XLTB-91', type: 'Estudiante', time: '08:47' },
    { name: 'Antonia Belén Henríquez', plate: 'ZPLG-30', type: 'Estudiante', time: '08:50' },
    { name: 'Guillermo Enrique Riquelme', plate: 'BKWT-74', type: 'Estudiante', time: '08:52' },
    { name: 'Camila Andrea Becerra', plate: 'DFXG-82', type: 'Estudiante', time: '08:55' },
    { name: 'Cristóbal Marcelo Catalán', plate: 'FJLD-49', type: 'Estudiante', time: '08:58' },
    { name: 'Beatriz Hortensia Fuentes', plate: 'GKPB-15', type: 'Visita', time: '09:02' },
    { name: 'Julio César Mendoza', plate: 'HZWD-63', type: 'Externo', time: '09:05' },
    { name: 'Gennaro Andrés Tapia', plate: 'JTYB-11', type: 'Estudiante', time: '09:08' },
    { name: 'Montserrat Ignacia Marín', plate: 'KLPW-88', type: 'Estudiante', time: '09:12' },
    { name: 'Fabián Eduardo Toledo', plate: 'MWXT-29', type: 'Estudiante', time: '09:15' },
    { name: 'Gabriela Patricia Leyton', plate: 'NPLZ-43', type: 'Estudiante', time: '09:18' },
    { name: 'Benjamín Andrés Muñoz', plate: 'PYKD-60', type: 'Estudiante', time: '09:20' },
    { name: 'Verónica Isabel Morales', plate: 'RKWZ-18', type: 'Estudiante', time: '09:22' },
    { name: 'Vicente Tomás Donoso', plate: 'TLXG-92', type: 'Estudiante', time: '09:25' },
    { name: 'Romina Andrea Segovia', plate: 'VCFB-51', type: 'Estudiante', time: '09:28' },
    { name: 'Óscar Antonio Saavedra', plate: 'WHKP-37', type: 'Docente', time: '09:30' },
    { name: 'Catalina Andrea Carrasco', plate: 'XPSZ-84', type: 'Docente', time: '09:32' },
    { name: 'Daniel Esteban Arancibia', plate: 'ZFTD-10', type: 'Estudiante', time: '09:35' },
    { name: 'Florencia Ignacia Romero', plate: 'BKLY-42', type: 'Estudiante', time: '09:38' },
    { name: 'Ricardo Alfonso Bravo', plate: 'DHXW-89', type: 'Estudiante', time: '09:40' },
    { name: 'Fernanda Belén Aguilera', plate: 'FKPT-55', type: 'Estudiante', time: '09:42' },
    { name: 'Matías Eduardo Escobar', plate: 'GJBY-13', type: 'Estudiante', time: '09:45' },
    { name: 'Constanza Paz Sepúlveda', plate: 'HKDW-62', type: 'Estudiante', time: '09:48' },
    { name: 'Gabriel Ignacio Osses', plate: 'JPRS-88', type: 'Estudiante', time: '09:50' },

    // Sector C: 7 drivers
    { name: 'Sofía Alejandra Cabezas', plate: 'KLTG-31', type: 'Estudiante', time: '08:10' },
    { name: 'Pedro Segundo Henríquez', plate: 'LPXW-19', type: 'Docente', time: '08:15' },
    { name: 'Alicia del Carmen Pino', plate: 'MNVB-87', type: 'Colaborador', time: '08:30' },
    { name: 'Tomás Ignacio Garcés', plate: 'PTRG-54', type: 'Estudiante', time: '08:45' },
    { name: 'Carlos Eduardo Tapia', plate: 'RYKB-33', type: 'Estudiante', time: '09:00' },
    { name: 'Camila Andrea Santander', plate: 'TWLV-21', type: 'Estudiante', time: '09:12' },
    { name: 'Álex Marcelo Garrido', plate: 'VCFD-88', type: 'Docente', time: '09:20' }
  ];

  let driverIndex = 0;

  spaces.forEach((space) => {
    // Sector A occupied rule
    const isSectorAOccupied = space.sector === 'A' && space.id <= 23;
    // Sector B occupied rule
    const isSectorBOccupied = space.sector === 'B' && space.id >= 31 && space.id <= 70;
    // Sector C occupied rule
    const isSectorCOccupied = space.sector === 'C' && space.id >= 91 && space.id <= 97;

    if ((isSectorAOccupied || isSectorBOccupied || isSectorCOccupied) && driverIndex < occupiedDriversList.length) {
      const driver = occupiedDriversList[driverIndex];
      space.status = 'ocupado';
      space.occupiedByPlate = driver.plate;
      space.occupiedByName = driver.name;
      space.occupiedByUserType = driver.type as any;
      space.occupiedSince = driver.time;
      driverIndex++;
    } else {
      space.status = 'libre';
      space.occupiedByPlate = undefined;
      space.occupiedByName = undefined;
      space.occupiedByUserType = undefined;
      space.occupiedSince = undefined;
    }
  });

  return spaces;
}

export const MOCK_PRE_USERS: User[] = [
  {
    rut: '18.452.128-K',
    nombre: 'Gonzalo Silva Henríquez',
    correo: 'gon.silva@duocuc.cl',
    celular: '+56 9 8412 5522',
    tipo: 'Estudiante',
    patente: 'HR-PX-92',
    modeloVehiculo: 'Suzuki Swift Gris',
    aceptaTerminos: true
  },
  {
    rut: '12.894.301-4',
    nombre: 'Dra. María Elena Bosch',
    correo: 'ma.bosch@duocuc.cl',
    celular: '+56 9 7254 9911',
    tipo: 'Docente',
    patente: 'GL-RT-41',
    modeloVehiculo: 'Toyota RAV4 Blanco',
    aceptaTerminos: true
  },
  {
    rut: '15.118.406-8',
    nombre: 'Patricia Alcaide',
    correo: 'pa.alcaide@duocuc.cl',
    celular: '+56 9 6112 0044',
    tipo: 'Colaborador',
    patente: 'XD-SW-88',
    modeloVehiculo: 'Hyundai Accent Negro',
    aceptaTerminos: true
  },
  {
    rut: '10.553.892-K',
    nombre: 'Juan Pablo Maipú',
    correo: 'ju.maipu@duocuc.cl',
    celular: '+56 9 5555 1212',
    tipo: 'Directivo',
    patente: 'JP-DC-01',
    modeloVehiculo: 'Mazda CX-5 Azul',
    aceptaTerminos: true
  }
];

export function generateInitialLogs(): EntryExitLog[] {
  return [
    {
      id: 'LOG-101',
      spaceId: 31,
      spaceLabel: 'B-01',
      rut: '19.824.512-3',
      nombre: 'Andrés Carrasco V.',
      tipoUsuario: 'Estudiante',
      patente: 'KJ-GG-82',
      entrada: '07:32',
      salida: '12:15',
      registradoPor: 'qr_autonomo'
    },
    {
      id: 'LOG-102',
      spaceId: 10,
      spaceLabel: 'A-10',
      rut: '15.321.402-K',
      nombre: 'Loreto Fernández',
      tipoUsuario: 'Docente',
      patente: 'LP-TY-91',
      entrada: '08:05',
      salida: '14:20',
      registradoPor: 'guardia'
    },
    {
      id: 'LOG-103',
      spaceId: 92,
      spaceLabel: 'C-02',
      rut: '11.450.219-5',
      nombre: 'Carlos Díaz (Preferencial)',
      tipoUsuario: 'Visita',
      patente: 'TR-FG-38',
      entrada: '08:15',
      registradoPor: 'guardia'
    },
    {
      id: 'LOG-104',
      spaceId: 44,
      spaceLabel: 'B-14',
      rut: '18.411.599-2',
      nombre: 'Bastián Olea',
      tipoUsuario: 'Estudiante',
      patente: 'ZX-CV-71',
      entrada: '08:45',
      salida: '13:00',
      registradoPor: 'qr_autonomo'
    },
    {
      id: 'LOG-105',
      spaceId: 98,
      spaceLabel: 'C-08',
      rut: '8.402.122-8',
      nombre: 'Jorge González Espina',
      tipoUsuario: 'Visita',
      patente: 'FF-WS-12',
      entrada: '09:00',
      salida: '10:45',
      registradoPor: 'guardia'
    },
    {
      id: 'LOG-106',
      spaceId: 2,
      spaceLabel: 'A-02',
      rut: '14.921.332-9',
      nombre: 'Renato Quevedo',
      tipoUsuario: 'Docente',
      patente: 'YT-WE-44',
      entrada: '09:15',
      registradoPor: 'guardia'
    },
    {
      id: 'LOG-107',
      spaceId: 52,
      spaceLabel: 'B-22',
      rut: '20.124.912-K',
      nombre: 'Tamara Muñoz',
      tipoUsuario: 'Estudiante',
      patente: 'PL-YT-11',
      entrada: '09:40',
      registradoPor: 'qr_autonomo'
    },
    {
      id: 'LOG-108',
      spaceId: 108,
      spaceLabel: 'C-18',
      rut: '18.155.332-1',
      nombre: 'Mario Guerrero',
      tipoUsuario: 'Estudiante',
      patente: 'MOTO-450',
      entrada: '10:10',
      salida: '13:50',
      registradoPor: 'qr_autonomo'
    },
    {
      id: 'LOG-109',
      spaceId: 12,
      spaceLabel: 'A-12',
      rut: '13.442.203-K',
      nombre: 'Verónica Saavedra',
      tipoUsuario: 'Colaborador',
      patente: 'PP-AA-99',
      entrada: '10:30',
      registradoPor: 'guardia'
    },
    {
      id: 'LOG-110',
      spaceId: 62,
      spaceLabel: 'B-32',
      rut: '19.452.122-3',
      nombre: 'Fabián Pérez',
      tipoUsuario: 'Estudiante',
      patente: 'CV-BN-88',
      entrada: '11:15',
      registradoPor: 'qr_autonomo'
    }
  ];
}

export function generateInitialReservations(): Reservation[] {
  return [
    {
      id: 'RES-2021',
      spaceId: 1,
      spaceLabel: 'A-01',
      rut: '10.553.892-K',
      nombre: 'Juan Pablo Maipú (Director)',
      patente: 'JP-DC-01',
      tipoUsuario: 'Directivo',
      fecha: getFormattedDate(),
      horaInicio: '08:30',
      horaFin: '18:30',
      status: 'activa'
    },
    {
      id: 'RES-2030',
      spaceId: 10,
      spaceLabel: 'A-10',
      rut: '12.894.301-4',
      nombre: 'María Elena Bosch',
      patente: 'GL-RT-41',
      tipoUsuario: 'Docente',
      fecha: getFormattedDate(),
      horaInicio: '14:00',
      horaFin: '18:00',
      status: 'activa'
    },
    {
      id: 'RES-2036',
      spaceId: 36,
      spaceLabel: 'B-06',
      rut: '18.452.128-K',
      nombre: 'Gonzalo Silva Henríquez',
      patente: 'HR-PX-92',
      tipoUsuario: 'Estudiante',
      fecha: getFormattedDate(),
      horaInicio: '15:20',
      horaFin: '19:30',
      status: 'pendiente'
    },
    {
      id: 'RES-2040',
      spaceId: 40,
      spaceLabel: 'B-10',
      rut: '17.391.223-4',
      nombre: 'Daniela Osorio',
      patente: 'TY-LK-02',
      tipoUsuario: 'Estudiante',
      fecha: getFormattedDate(),
      horaInicio: '16:00',
      horaFin: '21:30',
      status: 'pendiente'
    },
    {
      id: 'RES-2058',
      spaceId: 58,
      spaceLabel: 'B-28',
      rut: '19.332.115-K',
      nombre: 'Martín Cárcamo',
      patente: 'GH-SD-71',
      tipoUsuario: 'Estudiante',
      fecha: getFormattedDate(),
      horaInicio: '18:30',
      horaFin: '22:30',
      status: 'pendiente'
    },
    {
      id: 'RES-2093',
      spaceId: 93,
      spaceLabel: 'C-03',
      rut: '9.215.302-K',
      nombre: 'Visita Técnica Duoc',
      patente: 'VT-DD-90',
      tipoUsuario: 'Visita',
      fecha: getFormattedDate(),
      horaInicio: '10:00',
      horaFin: '14:00',
      status: 'pendiente'
    }
  ];
}

// Logic validation for RUT in Chile
export function validarRut(rutCompleto: string): boolean {
  if (!/^[0-9]+-[0-9kK]$/.test(rutCompleto.replace(/\./g, ''))) return false;
  const tmp = rutCompleto.replace(/\./g, '').split('-');
  let rut = tmp[0];
  const dv = tmp[1].toLowerCase();
  
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  let dvCalc = '0';
  if (dvEsperado === 11) dvCalc = '0';
  else if (dvEsperado === 10) dvCalc = 'k';
  else dvCalc = dvEsperado.toString();
  
  return dvCalc === dv;
}

// Format RUT automatically while typing (e.g., XX.XXX.XXX-X)
export function formatRut(value: string): string {
  // strip all characters except digits and K
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  
  if (clean.length === 1) return clean;
  
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  
  // Format body with dots
  let formattedBody = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formattedBody = body.charAt(i) + formattedBody;
    count++;
    if (count === 3 && i > 0) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
  }
  
  return `${formattedBody}-${dv}`;
}

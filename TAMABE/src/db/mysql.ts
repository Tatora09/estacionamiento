import mysql, { Pool } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { generateInitialSpaces, generateInitialLogs, generateInitialReservations } from '../utils/mockData.ts';

dotenv.config();

let pool: Pool | null = null;
let isDbConnected = false;

// Attempt to create connection pool lazily
export async function getMysqlPool(): Promise<Pool | null> {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = parseInt(process.env.MYSQL_PORT || '3306');

  // If host is not provided, pivot to in-memory fallback smoothly
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    console.log('MySQL host is default/empty. Operating in high-fidelity sandbox mode with in-memory fallbacks.');
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to production MySQL/MariaDB database!');
    connection.release();
    isDbConnected = true;
    return pool;
  } catch (error) {
    console.error('MySQL connection failed, falling back to simulated memory schema:');
    console.error(error);
    pool = null;
    isDbConnected = false;
    return null;
  }
}

export function isConnected(): boolean {
  return isDbConnected;
}

// In-Memory Fallbacks for Sandboxing
let inMemorySpaces: any[] = generateInitialSpaces();
let inMemoryLogs: any[] = generateInitialLogs();
let inMemoryReservations: any[] = generateInitialReservations();

export function initializeLocalState(initialSpaces: any[], initialLogs: any[], initialReservations: any[]) {
  if (inMemorySpaces.length === 0) inMemorySpaces = [...initialSpaces];
  if (inMemoryLogs.length === 0) inMemoryLogs = [...initialLogs];
  if (inMemoryReservations.length === 0) inMemoryReservations = [...initialReservations];
}

// --- DB INTERACTIVE LAYER ---

// 1. SPACES METHODS
export async function getSpaces(): Promise<any[]> {
  const activePool = await getMysqlPool();
  if (!activePool) return inMemorySpaces;

  try {
    const [rows] = await activePool.query('SELECT * FROM espacios ORDER BY id ASC');
    return rows as any[];
  } catch (err) {
    console.warn('Query spaces failed. Serving from cache:', err);
    return inMemorySpaces;
  }
}

export async function updateSpace(id: number, updates: any): Promise<boolean> {
  // Update local cache
  const idx = inMemorySpaces.findIndex(s => s.id === id);
  if (idx !== -1) {
    inMemorySpaces[idx] = { ...inMemorySpaces[idx], ...updates };
  }

  const activePool = await getMysqlPool();
  if (!activePool) return true;

  try {
    const fields = Object.keys(updates)
      .map(key => `\`${key}\` = ?`)
      .join(', ');
    const values = Object.values(updates);

    if (fields.length > 0) {
      await activePool.query(
        `UPDATE espacios SET ${fields} WHERE id = ?`,
        [...values, id]
      );
    }
    return true;
  } catch (err) {
    console.error(`Error updating space table with id ${id}:`, err);
    return false;
  }
}

// 2. LOGS METHODS
export async function getLogs(): Promise<any[]> {
  const activePool = await getMysqlPool();
  if (!activePool) return inMemoryLogs;

  try {
    const [rows] = await activePool.query('SELECT * FROM logs ORDER BY id DESC');
    return rows as any[];
  } catch (err) {
    console.warn('Query logs failed. Serving from cache:', err);
    return inMemoryLogs;
  }
}

export async function addLog(log: any): Promise<boolean> {
  // Push to local cache
  inMemoryLogs.unshift(log);

  const activePool = await getMysqlPool();
  if (!activePool) return true;

  try {
    const { id, spaceId, spaceLabel, rut, nombre, tipoUsuario, patente, entrada, registradoPor, salida } = log;
    await activePool.query(
      `INSERT INTO logs (id, spaceId, spaceLabel, rut, nombre, tipoUsuario, patente, entrada, registradoPor, salida) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE salida = VALUES(salida)`,
      [id, spaceId, spaceLabel, rut, nombre, tipoUsuario, patente, entrada, registradoPor, salida || null]
    );
    return true;
  } catch (err) {
    console.error('Error inserting log into MySQL:', err);
    return false;
  }
}

export async function clearAllLogs(): Promise<boolean> {
  inMemoryLogs = [];
  const activePool = await getMysqlPool();
  if (!activePool) return true;

  try {
    await activePool.query('DELETE FROM logs');
    return true;
  } catch (err) {
    console.error('Error clearing logs table:', err);
    return false;
  }
}

// 3. RESERVATIONS
export async function getReservations(): Promise<any[]> {
  const activePool = await getMysqlPool();
  if (!activePool) return inMemoryReservations;

  try {
    const [rows] = await activePool.query('SELECT * FROM reservas ORDER BY id DESC');
    return rows as any[];
  } catch (err) {
    console.warn('Query reservations failed. Serving from cache:', err);
    return inMemoryReservations;
  }
}

export async function addReservation(reservation: any): Promise<boolean> {
  inMemoryReservations.unshift(reservation);

  const activePool = await getMysqlPool();
  if (!activePool) return true;

  try {
    const { id, spaceId, spaceLabel, rut, nombre, patente, tipoUsuario, fecha, horaInicio, horaFin, status } = reservation;
    await activePool.query(
      `INSERT INTO reservas (id, spaceId, spaceLabel, rut, nombre, patente, tipoUsuario, fecha, horaInicio, horaFin, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, spaceId, spaceLabel, rut, nombre, patente, tipoUsuario, fecha, horaInicio, horaFin, status]
    );
    return true;
  } catch (err) {
    console.error('Error creating reservation in MySQL:', err);
    return false;
  }
}

export async function updateReservationStatus(id: string, status: string): Promise<boolean> {
  const idx = inMemoryReservations.findIndex(r => r.id === id);
  if (idx !== -1) {
    inMemoryReservations[idx].status = status;
  }

  const activePool = await getMysqlPool();
  if (!activePool) return true;

  try {
    await activePool.query('UPDATE reservas SET status = ? WHERE id = ?', [status, id]);
    return true;
  } catch (err) {
    console.error(`Error updating reservation status with id ${id}:`, err);
    return false;
  }
}

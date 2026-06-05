-- Schema DDL para Estacionamiento Duoc UC Maipú (MySQL)
-- Requisitos de conexión para motor MySQL / MariaDB
-- Configura 110 espacios en total, de los cuales exactamente 70 están OCUPADOS con datos ficticios chilenos.

CREATE DATABASE IF NOT EXISTS `duoc-estacionamiento`;
USE `duoc-estacionamiento`;

-- 1. Limpieza preventiva
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS espacios;

-- 2. Tabla de Espacios de Estacionamiento
CREATE TABLE espacios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(10) NOT NULL UNIQUE,
    sector VARCHAR(1) NOT NULL, -- A, B o C
    type VARCHAR(30) NOT NULL, -- regular, preferencial, directivo, moto
    status VARCHAR(20) NOT NULL DEFAULT 'libre', -- libre, ocupado, reservado, bloqueado
    occupiedByPlate VARCHAR(15),
    occupiedByName VARCHAR(100),
    occupiedByUserType VARCHAR(30),
    occupiedSince VARCHAR(10),
    reservationId VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Reservas de Estacionamiento
CREATE TABLE reservas (
    id VARCHAR(50) PRIMARY KEY,
    spaceId INT NOT NULL,
    spaceLabel VARCHAR(10) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    patente VARCHAR(15) NOT NULL,
    tipoUsuario VARCHAR(35) NOT NULL,
    fecha VARCHAR(20) NOT NULL,
    horaInicio VARCHAR(10) NOT NULL,
    horaFin VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente, activa, completada, cancelada
    FOREIGN KEY (spaceId) REFERENCES espacios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bitácora de Movimientos (Ingresos y Salidas)
CREATE TABLE logs (
    id VARCHAR(50) PRIMARY KEY,
    spaceId INT,
    spaceLabel VARCHAR(10) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipoUsuario VARCHAR(35) NOT NULL,
    patente VARCHAR(15) NOT NULL,
    entrada VARCHAR(10) NOT NULL,
    salida VARCHAR(10),
    registradoPor VARCHAR(30) NOT NULL -- guardia, qr_autonomo
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. Inserción de los 110 espacios (70 ocupados con nombres chilenos realistas y 40 libres)
INSERT INTO espacios (id, label, sector, type, status, occupiedByPlate, occupiedByName, occupiedByUserType, occupiedSince) VALUES
-- Sector A: 30 espacios. (A-01 a A-23 ocupados [23 ocupados], A-24 a A-30 libres [7 libres])
(1, 'A-01', 'A', 'directivo', 'ocupado', 'FPST-82', 'Rodrigo Arriagada Mellado', 'Directivo', '07:45'),
(2, 'A-02', 'A', 'directivo', 'ocupado', 'HWKB-43', 'María Loreto Vásquez', 'Directivo', '07:50'),
(3, 'A-03', 'A', 'directivo', 'ocupado', 'JYRD-50', 'Eduardo Elgueta Lagos', 'Directivo', '08:02'),
(4, 'A-04', 'A', 'directivo', 'ocupado', 'KSZP-12', 'Carolina Soto Valdivia', 'Directivo', '08:15'),
(5, 'A-05', 'A', 'directivo', 'ocupado', 'LXCV-95', 'Prof. Francisco Barraza', 'Docente', '08:18'),
(6, 'A-06', 'A', 'regular', 'ocupado', 'PLTY-31', 'Sebastián Muñoz Jara', 'Estudiante', '08:20'),
(7, 'A-07', 'A', 'regular', 'ocupado', 'RJFW-22', 'Javier Ignacio Sanhueza', 'Estudiante', '08:22'),
(8, 'A-08', 'A', 'regular', 'ocupado', 'TCXG-88', 'Camila Paz Orellana', 'Estudiante', '08:25'),
(9, 'A-09', 'A', 'regular', 'ocupado', 'VGPL-56', 'Felipe Andrés Galdames', 'Estudiante', '08:30'),
(10, 'A-10', 'A', 'regular', 'ocupado', 'ZKRD-19', 'María José Henríquez', 'Colaborador', '08:32'),
(11, 'A-11', 'A', 'regular', 'ocupado', 'BCXW-45', 'Carlos Alberto Retamal', 'Colaborador', '08:35'),
(12, 'A-12', 'A', 'regular', 'ocupado', 'DLKF-90', 'Bastián Antonio Flores', 'Estudiante', '08:40'),
(13, 'A-13', 'A', 'regular', 'ocupado', 'FHSP-38', 'Valentina Ignacia Durán', 'Estudiante', '08:42'),
(14, 'A-14', 'A', 'regular', 'ocupado', 'GJBY-71', 'Matías Ignacio Espinoza', 'Estudiante', '08:45'),
(15, 'A-15', 'A', 'regular', 'ocupado', 'HPDT-22', 'Alejandra María Godoy', 'Docente', '08:48'),
(16, 'A-16', 'A', 'regular', 'ocupado', 'JWZX-15', 'Fernando Javier Cáceres', 'Docente', '08:50'),
(17, 'A-17', 'A', 'regular', 'ocupado', 'KLTG-67', 'Nathalie Nicole Astudillo', 'Docente', '08:52'),
(18, 'A-18', 'A', 'regular', 'ocupado', 'LPXW-83', 'Ignacio Esteban Poblete', 'Estudiante', '08:55'),
(19, 'A-19', 'A', 'regular', 'ocupado', 'MNVB-44', 'Gonzalo Daniel Vera', 'Estudiante', '08:58'),
(20, 'A-20', 'A', 'regular', 'ocupado', 'PTRG-11', 'Claudia Andrea Carvajal', 'Visita', '09:05'),
(21, 'A-21', 'A', 'regular', 'ocupado', 'RYKB-99', 'Cristian Alexis Morales', 'Externo', '09:10'),
(22, 'A-22', 'A', 'regular', 'ocupado', 'TWLV-50', 'Bárbara Sofía Pezoa', 'Estudiante', '09:12'),
(23, 'A-23', 'A', 'regular', 'ocupado', 'VCFD-17', 'Diego Alejandro Salazar', 'Estudiante', '09:15'),
(24, 'A-24', 'A', 'regular', 'libre', NULL, NULL, NULL, NULL),
(25, 'A-25', 'A', 'regular', 'libre', NULL, NULL, NULL, NULL),
(26, 'A-26', 'A', 'moto', 'libre', NULL, NULL, NULL, NULL),
(27, 'A-27', 'A', 'moto', 'libre', NULL, NULL, NULL, NULL),
(28, 'A-28', 'A', 'moto', 'libre', NULL, NULL, NULL, NULL),
(29, 'A-29', 'A', 'moto', 'libre', NULL, NULL, NULL, NULL),
(30, 'A-30', 'A', 'moto', 'libre', NULL, NULL, NULL, NULL),

-- Sector B: 60 espacios (B-01 a B-40 ocupados [40 ocupados], B-41 a B-60 libres [20 libres])
(31, 'B-01', 'B', 'regular', 'ocupado', 'XPLR-29', 'Esteban Andrés Pizarro', 'Estudiante', '08:00'),
(32, 'B-02', 'B', 'regular', 'ocupado', 'ZFTW-84', 'Catalina Paz Troncoso', 'Estudiante', '08:05'),
(33, 'B-03', 'B', 'regular', 'ocupado', 'BKLY-62', 'Mauricio Alejandro Rivas', 'Estudiante', '08:10'),
(34, 'B-04', 'B', 'regular', 'ocupado', 'DHXG-19', 'Sofía Elizabeth Parra', 'Estudiante', '08:12'),
(35, 'B-05', 'B', 'regular', 'ocupado', 'FJSP-57', 'Álvaro Patricio Miranda', 'Docente', '08:15'),
(36, 'B-06', 'B', 'regular', 'ocupado', 'GLWT-41', 'Francisca Elena Silva', 'Docente', '08:20'),
(37, 'B-07', 'B', 'regular', 'ocupado', 'HKDZ-93', 'Renato Javier Garrido', 'Colaborador', '08:21'),
(38, 'B-08', 'B', 'regular', 'ocupado', 'JPRS-10', 'Daniela Constanza Rojas', 'Colaborador', '08:24'),
(39, 'B-09', 'B', 'regular', 'ocupado', 'KTLB-82', 'Matías Daniel Ortega', 'Estudiante', '08:28'),
(40, 'B-10', 'B', 'regular', 'ocupado', 'LWXT-36', 'Isidora Esperanza Núñez', 'Estudiante', '08:30'),
(41, 'B-11', 'B', 'regular', 'ocupado', 'MNVD-78', 'Lucas Gabriel Medina', 'Estudiante', '08:32'),
(42, 'B-12', 'B', 'regular', 'ocupado', 'PKRG-49', 'Constanza Belén Valenzuela', 'Estudiante', '08:35'),
(43, 'B-13', 'B', 'regular', 'ocupado', 'RJSW-11', 'Prof. Roberto Santelices', 'Docente', '08:38'),
(44, 'B-14', 'B', 'regular', 'ocupado', 'TYXB-85', 'Javiera Andrea Concha', 'Docente', '08:40'),
(45, 'B-15', 'B', 'regular', 'ocupado', 'VHPC-26', 'Patricio Orlando Vidal', 'Colaborador', '08:42'),
(46, 'B-16', 'B', 'regular', 'ocupado', 'WKFD-50', 'Paulina Alejandra Cáceres', 'Estudiante', '08:45'),
(47, 'B-17', 'B', 'regular', 'ocupado', 'XLTB-91', 'Kevin Ignacio Contreras', 'Estudiante', '08:47'),
(48, 'B-18', 'B', 'regular', 'ocupado', 'ZPLG-30', 'Antonia Belén Henríquez', 'Estudiante', '08:50'),
(49, 'B-19', 'B', 'regular', 'ocupado', 'BKWT-74', 'Guillermo Enrique Riquelme', 'Estudiante', '08:52'),
(50, 'B-20', 'B', 'regular', 'ocupado', 'DFXG-82', 'Camila Andrea Becerra', 'Estudiante', '08:55'),
(51, 'B-21', 'B', 'regular', 'ocupado', 'FJLD-49', 'Cristóbal Marcelo Catalán', 'Estudiante', '08:58'),
(52, 'B-22', 'B', 'regular', 'ocupado', 'GKPB-15', 'Beatriz Hortensia Fuentes', 'Visita', '09:02'),
(53, 'B-23', 'B', 'regular', 'ocupado', 'HZWD-63', 'Julio César Mendoza', 'Externo', '09:05'),
(54, 'B-24', 'B', 'regular', 'ocupado', 'JTYB-11', 'Gennaro Andrés Tapia', 'Estudiante', '09:08'),
(55, 'B-25', 'B', 'regular', 'ocupado', 'KLPW-88', 'Montserrat Ignacia Marín', 'Estudiante', '09:12'),
(56, 'B-26', 'B', 'regular', 'ocupado', 'MWXT-29', 'Fabián Eduardo Toledo', 'Estudiante', '09:15'),
(57, 'B-27', 'B', 'regular', 'ocupado', 'NPLZ-43', 'Gabriela Patricia Leyton', 'Estudiante', '09:18'),
(58, 'B-28', 'B', 'regular', 'ocupado', 'PYKD-60', 'Benjamín Andrés Muñoz', 'Estudiante', '09:20'),
(59, 'B-29', 'B', 'regular', 'ocupado', 'RKWZ-18', 'Verónica Isabel Morales', 'Estudiante', '09:22'),
(60, 'B-30', 'B', 'regular', 'ocupado', 'TLXG-92', 'Vicente Tomás Donoso', 'Estudiante', '09:25'),
(61, 'B-31', 'B', 'regular', 'ocupado', 'VCFB-51', 'Romina Andrea Segovia', 'Estudiante', '09:28'),
(62, 'B-32', 'B', 'regular', 'ocupado', 'WHKP-37', 'Óscar Antonio Saavedra', 'Docente', '09:30'),
(63, 'B-33', 'B', 'regular', 'ocupado', 'XPSZ-84', 'Catalina Andrea Carrasco', 'Docente', '09:32'),
(64, 'B-34', 'B', 'regular', 'ocupado', 'ZFTD-10', 'Daniel Esteban Arancibia', 'Estudiante', '09:35'),
(65, 'B-35', 'B', 'regular', 'ocupado', 'BKLY-42', 'Florencia Ignacia Romero', 'Estudiante', '09:38'),
(66, 'B-36', 'B', 'regular', 'ocupado', 'DHXW-89', 'Ricardo Alfonso Bravo', 'Estudiante', '09:40'),
(67, 'B-37', 'B', 'regular', 'ocupado', 'FKPT-55', 'Fernanda Belén Aguilera', 'Estudiante', '09:42'),
(68, 'B-38', 'B', 'regular', 'ocupado', 'GJBY-13', 'Matías Eduardo Escobar', 'Estudiante', '09:45'),
(69, 'B-39', 'B', 'regular', 'ocupado', 'HKDW-62', 'Constanza Paz Sepúlveda', 'Estudiante', '09:48'),
(70, 'B-40', 'B', 'regular', 'ocupado', 'JPRS-88', 'Gabriel Ignacio Osses', 'Estudiante', '09:50'),
(71, 'B-41', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(72, 'B-42', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(73, 'B-43', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(74, 'B-44', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(75, 'B-45', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(76, 'B-46', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(77, 'B-47', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(78, 'B-48', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(79, 'B-49', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(80, 'B-50', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(81, 'B-51', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(82, 'B-52', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(83, 'B-53', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(84, 'B-54', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(85, 'B-55', 'B', 'regular', 'libre', NULL, NULL, NULL, NULL),
(86, 'B-56', 'B', 'moto', 'libre', NULL, NULL, NULL, NULL),
(87, 'B-57', 'B', 'moto', 'libre', NULL, NULL, NULL, NULL),
(88, 'B-58', 'B', 'moto', 'libre', NULL, NULL, NULL, NULL),
(89, 'B-59', 'B', 'moto', 'libre', NULL, NULL, NULL, NULL),
(90, 'B-60', 'B', 'moto', 'libre', NULL, NULL, NULL, NULL),

-- Sector C: 20 espacios (C-01 a C-07 ocupados [7 ocupados], C-08 a C-20 libres [13 libres])
(91, 'C-01', 'C', 'preferencial', 'ocupado', 'KLTG-31', 'Sofía Alejandra Cabezas', 'Estudiante', '08:10'),
(92, 'C-02', 'C', 'preferencial', 'ocupado', 'LPXW-19', 'Pedro Segundo Henríquez', 'Docente', '08:15'),
(93, 'C-03', 'C', 'preferencial', 'ocupado', 'MNVB-87', 'Alicia del Carmen Pino', 'Colaborador', '08:30'),
(94, 'C-04', 'C', 'preferencial', 'ocupado', 'PTRG-54', 'Tomás Ignacio Garcés', 'Estudiante', '08:45'),
(95, 'C-05', 'C', 'preferencial', 'ocupado', 'RYKB-33', 'Carlos Eduardo Tapia', 'Estudiante', '09:00'),
(96, 'C-06', 'C', 'regular', 'ocupado', 'TWLV-21', 'Camila Andrea Santander', 'Estudiante', '09:12'),
(97, 'C-07', 'C', 'regular', 'ocupado', 'VCFD-88', 'Álex Marcelo Garrido', 'Docente', '09:20'),
(98, 'C-08', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(99, 'C-09', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(100, 'C-10', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(101, 'C-11', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(102, 'C-12', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(103, 'C-13', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(104, 'C-14', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(105, 'C-15', 'C', 'regular', 'libre', NULL, NULL, NULL, NULL),
(106, 'C-16', 'C', 'moto', 'libre', NULL, NULL, NULL, NULL),
(107, 'C-17', 'C', 'moto', 'libre', NULL, NULL, NULL, NULL),
(108, 'C-18', 'C', 'moto', 'libre', NULL, NULL, NULL, NULL),
(109, 'C-19', 'C', 'moto', 'libre', NULL, NULL, NULL, NULL),
(110, 'C-20', 'C', 'moto', 'libre', NULL, NULL, NULL, NULL);

-- 6. Agregar un par de alertas simuladas históricas para poblar los logs iniciales de forma exitosa
INSERT INTO logs (id, spaceId, spaceLabel, rut, nombre, tipoUsuario, patente, entrada, salida, registradoPor) VALUES
('LOG-7001', 15, 'A-15', '17.842.112-K', 'Ricardo Alfonso Bravo', 'Estudiante', 'DHXW-89', '08:12', '09:40', 'qr_autonomo'),
('LOG-7002', 35, 'B-05', '12.449.201-9', 'Álvaro Patricio Miranda', 'Docente', 'FJSP-57', '08:15', NULL, 'guardia'),
('LOG-7003', 92, 'C-02', '11.590.231-5', 'Pedro Segundo Henríquez', 'Docente', 'LPXW-19', '08:15', NULL, 'qr_autonomo'),
('LOG-7004', 1, 'A-01', '16.202.934-2', 'Rodrigo Arriagada Mellado', 'Directivo', 'FPST-82', '07:45', NULL, 'guardia');

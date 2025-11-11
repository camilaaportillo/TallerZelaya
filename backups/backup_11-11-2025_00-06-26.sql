-- Backup de Base de Datos
-- Generado: 11/11/2025 00:06:26
-- Base de datos: dbtallerb
-- Usuario: Luis Angel Arias Anaya (luisu11@gmail.com)

--
-- Estructura de tabla para `bitacora`
--

DROP TABLE IF EXISTS `bitacora`;
CREATE TABLE `bitacora` (
  `id_bitacora` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tabla_afectada` varchar(50) DEFAULT NULL,
  `id_registro_afectado` int(11) DEFAULT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `modulo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_bitacora`),
  KEY `idx_bitacora_usuario` (`id_usuario`),
  KEY `idx_bitacora_fecha` (`fecha_hora`),
  KEY `idx_bitacora_accion` (`accion`),
  KEY `idx_bitacora_modulo` (`modulo`),
  KEY `idx_bitacora_tabla` (`tabla_afectada`),
  CONSTRAINT `bitacora_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bitacora`
--

INSERT INTO `bitacora` VALUES ('1', '3', 'Luis Angel Arias Anaya', 'LOGIN', 'Inicio de sesión exitoso - Rol: Administrador', NULL, NULL, NULL, NULL, '2025-11-09 22:36:19', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Autenticación'),
('2', '3', 'Luis Angel Arias Anaya', 'LOGIN', 'Inicio de sesión exitoso - Rol: Administrador', NULL, NULL, NULL, NULL, '2025-11-09 22:42:13', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', 'Autenticación'),
('3', '3', 'Luis Angel Arias Anaya', 'INSERT', 'Compra registrada #26 - Proveedor: Ana López - Total: $26.30', 'compra', '26', NULL, NULL, '2025-11-09 22:43:46', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Compras'),
('4', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Stock actualizado: Aro +2 unidades (Compra #26)', 'repuesto', '7', NULL, NULL, '2025-11-09 22:43:46', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Inventario'),
('5', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Stock actualizado: Asiento +5 unidades (Compra #26)', 'repuesto', '3', NULL, NULL, '2025-11-09 22:43:46', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Inventario'),
('6', '3', 'Luis Angel Arias Anaya', 'LOGIN', 'Inicio de sesión exitoso - Rol: Administrador', NULL, NULL, NULL, NULL, '2025-11-09 22:52:38', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Autenticación'),
('7', '3', 'Luis Angel Arias Anaya', 'LOGIN', 'Inicio de sesión exitoso - Rol: Administrador', NULL, NULL, NULL, NULL, '2025-11-10 13:04:30', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Autenticación'),
('8', '3', 'Luis Angel Arias Anaya', 'INSERT', 'Usuario creado: Usuario de Prueba - Correo: usuario@gmail.com - Rol: Empleado', 'usuario', '6', NULL, NULL, '2025-11-10 13:21:26', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('9', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Usuario actualizado: Usuario de Prueba - Cambios: Estado: Activo → Inactivo', 'usuario', '6', NULL, NULL, '2025-11-10 13:23:45', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('10', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Usuario actualizado: Usuario de Prueba - Cambios: Estado: Inactivo → Activo', 'usuario', '6', NULL, NULL, '2025-11-10 13:24:06', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('11', '3', 'Luis Angel Arias Anaya', 'INSERT', 'Empresa creada: Empresa de Prueba - Correo: empresa@gmail.com - Tel: 22736394', 'empresa', '11', NULL, NULL, '2025-11-10 13:40:12', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Empresas'),
('12', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Empresa actualizada: Empresa Prueba - Cambios: Nombre: Empresa de Prueba → Empresa Prueba, Correo: empresa@gmail.com → empresaprueba@gmail.com, Teléfono: 22736394 → 22736393', 'empresa', '11', NULL, NULL, '2025-11-10 13:40:57', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Empresas'),
('13', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Empresa deshabilitada: Empresa Prueba - Correo: empresaprueba@gmail.com - Tel: 22736393', 'empresa', '11', NULL, NULL, '2025-11-10 13:41:31', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Empresas'),
('14', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Empresa habilitada: Empresa Prueba - Correo: empresaprueba@gmail.com - Tel: 22736393', 'empresa', '11', NULL, NULL, '2025-11-10 13:41:48', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Empresas'),
('15', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Marca deshabilitada: Specialized', 'marca', '2', NULL, NULL, '2025-11-10 13:56:02', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Marcas'),
('16', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Marca habilitada: Specialized', 'marca', '2', NULL, NULL, '2025-11-10 13:56:12', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Marcas'),
('17', '3', 'Luis Angel Arias Anaya', 'INSERT', 'Marca creada: prueba', 'marca', '11', NULL, NULL, '2025-11-10 13:56:43', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Marcas'),
('18', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Marca actualizada: prueba → Prueba', 'marca', '11', NULL, NULL, '2025-11-10 13:56:59', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Marcas'),
('19', '3', 'Luis Angel Arias Anaya', 'INSERT', 'Cliente creado: Prueba cliente - Tel: 2267-3983 - Correo: prueba@gmail.com', 'cliente', '32', NULL, NULL, '2025-11-10 14:10:51', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Clientes'),
('20', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Cliente actualizado: Prueba - Cambios: Nombre: Prueba cliente → Prueba, Teléfono: 2267-3983 → No asignado', 'cliente', '32', NULL, NULL, '2025-11-10 14:11:09', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Clientes'),
('21', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Cliente dado de baja: Prueba - Correo: prueba@gmail.com', 'cliente', '32', NULL, NULL, '2025-11-10 14:11:26', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Clientes'),
('22', '3', 'Luis Angel Arias Anaya', 'INSERTAR', 'Nueva medida creada: 26x1.96', 'medida', '7', NULL, NULL, '2025-11-10 15:46:22', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Medidas'),
('23', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Medida actualizada: 26x1.96 → 26x1.95', 'medida', '7', NULL, NULL, '2025-11-10 15:46:34', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Medidas'),
('24', '3', 'Luis Angel Arias Anaya', 'ELIMINAR', 'Medida desactivada: 26x1.95', 'medida', '7', NULL, NULL, '2025-11-10 15:46:41', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Medidas'),
('25', '3', 'Luis Angel Arias Anaya', 'ELIMINAR', 'Medida desactivada: 26x1.95', 'medida', '7', NULL, NULL, '2025-11-10 15:46:41', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Medidas'),
('26', '3', 'Luis Angel Arias Anaya', 'ACTIVAR', 'Medida activada: 26x1.95', 'medida', '7', NULL, NULL, '2025-11-10 15:46:53', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Medidas'),
('27', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Precio actualizado para repuesto ASIBIAES64 - asiento: De $0.00 a $5.00', 'repuesto', '11', NULL, NULL, '2025-11-10 16:00:23', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Inventario'),
('28', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Precio actualizado para repuesto ASIBIAES64 - asiento: De $5.00 a $5.50', 'repuesto', '11', NULL, NULL, '2025-11-10 16:03:22', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', 'Inventario'),
('29', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Precio actualizado para repuesto ASIBIAES64 - asiento: De $5.50 a $5.65', 'repuesto', '11', NULL, NULL, '2025-11-10 16:10:08', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Inventario'),
('30', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Precio actualizado para repuesto MASCANES20 - Masa: De $0.00 a $4.20', 'repuesto', '6', NULL, NULL, '2025-11-10 16:10:50', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Inventario'),
('31', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Precio actualizado para repuesto MASCANES20 - Masa: De $4.20 a $4.25', 'repuesto', '6', NULL, NULL, '2025-11-10 16:18:39', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Inventario'),
('32', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Precio actualizado para repuesto PARCUBES14 - Parche: De $0.00 a $1.00', 'repuesto', '9', NULL, NULL, '2025-11-10 16:20:45', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Inventario'),
('33', '3', 'Luis Angel Arias Anaya', 'INSERTAR', 'Nueva medida creada: 15\"', 'medida', '8', NULL, NULL, '2025-11-10 16:31:56', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', 'Medidas'),
('34', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Precio actualizado para repuesto PARCUBES14 - Parche: De $1.51 a $1.50', 'repuesto', '9', NULL, NULL, '2025-11-10 16:34:28', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', 'Inventario'),
('35', '3', 'Luis Angel Arias Anaya', 'LOGIN', 'Inicio de sesión exitoso - Rol: Administrador', NULL, NULL, NULL, NULL, '2025-11-10 23:39:42', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Autenticación'),
('36', '3', 'Luis Angel Arias Anaya', 'INSERTAR', 'Proveedor creado: Prueba - Tel: 11111111 - Correo: prueba@gmail.com', 'proveedor', '11', NULL, NULL, '2025-11-10 23:40:20', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Proveedores'),
('37', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Proveedor actualizado: La prueba - Tel: 11111111 - Correo: prueba@gmail.com', 'proveedor', '11', NULL, NULL, '2025-11-10 23:40:36', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Proveedores'),
('38', '3', 'Luis Angel Arias Anaya', 'ELIMINAR', 'Proveedor desactivado: La prueba - Tel: 11111111 - Correo: prueba@gmail.com', 'proveedor', '11', NULL, NULL, '2025-11-10 23:40:50', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Proveedores'),
('39', '3', 'Luis Angel Arias Anaya', 'ACTIVAR', 'Proveedor habilitado: La prueba - Tel: 11111111 - Correo: prueba@gmail.com', 'proveedor', '11', NULL, NULL, '2025-11-10 23:40:57', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Proveedores'),
('40', '3', 'Luis Angel Arias Anaya', 'INSERTAR', 'Repuesto creado: PRUPRU2618 - Prueba - Stock mínimo: 10', 'repuesto', '12', NULL, NULL, '2025-11-10 23:53:49', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Repuestos'),
('41', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Repuesto actualizado: PRUPRU2618 - Prueba - Stock mínimo: 10', 'repuesto', '12', NULL, NULL, '2025-11-10 23:54:13', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Repuestos'),
('42', '3', 'Luis Angel Arias Anaya', 'ELIMINAR', 'Repuesto eliminado: PRUPRU2618 - Prueba', 'repuesto', '12', NULL, NULL, '2025-11-10 23:54:22', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Repuestos'),
('43', '3', 'Luis Angel Arias Anaya', 'INSERTAR', 'Herramienta creada: Martillo - Stock: 1', 'herramienta', '1', NULL, NULL, '2025-11-11 00:05:17', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Herramientas'),
('44', '3', 'Luis Angel Arias Anaya', 'ACTUALIZAR', 'Herramienta actualizada: Martillito - Stock: 1', 'herramienta', '1', NULL, NULL, '2025-11-11 00:05:28', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Herramientas'),
('45', '3', 'Luis Angel Arias Anaya', 'ELIMINAR', 'Herramienta eliminada: Martillito', 'herramienta', '1', NULL, NULL, '2025-11-11 00:05:36', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Herramientas');

--
-- Estructura de tabla para `cliente`
--

DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente` (
  `id_cliente` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` VALUES ('1', 'Consumidor Final', NULL, NULL, '1'),
('3', 'Luis Hernández', '7890-1234', NULL, '1'),
('5', 'Jorge Ramírez', '7001-2233', 'jorge.ramirez@yahoo.com', '1'),
('6', 'Lucía Fernández', '7456-9876', NULL, '0'),
('8', 'Miguel Castillo', '7123-4567', 'miguel.castillo@hotmail.com', '1'),
('10', 'Pedro Sánchez', '7988-1122', NULL, '1'),
('12', 'gerson levi pineda', '7923-8768', 'gerson45g@gmail.com', '1'),
('14', 'luis', '1212-1212', 'aa22088@ues.edu.sv', '1'),
('15', 'levi zelaya', '1212-1212', 'levi@gmail.com', '1'),
('17', 'pedro', '1121-2122', NULL, '1'),
('20', 'armando', '7623-4154', 'armando@sasa.com', '1'),
('21', 'Maria', '6745-2315', '', '1'),
('22', 'Antonio Perez', '9849-3528', 'antonio@gmail.com', '1'),
('32', 'Prueba', NULL, 'prueba@gmail.com', '0');

--
-- Estructura de tabla para `codigos_recuperacion`
--

DROP TABLE IF EXISTS `codigos_recuperacion`;
CREATE TABLE `codigos_recuperacion` (
  `id_codigo` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `expiracion` datetime NOT NULL,
  `utilizado` tinyint(4) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_codigo`),
  KEY `idx_codigo_expiracion` (`codigo`,`expiracion`,`utilizado`),
  KEY `idx_id_usuario` (`id_usuario`),
  CONSTRAINT `fk_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `codigos_recuperacion`
--

INSERT INTO `codigos_recuperacion` VALUES ('5', '4', '464993', '2025-10-28 16:06:46', '1', '2025-10-28 16:01:46');

--
-- Estructura de tabla para `compra`
--

DROP TABLE IF EXISTS `compra`;
CREATE TABLE `compra` (
  `id_compra` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `precio` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `id_proveedor` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `facturaImagen` longblob DEFAULT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `fk_compra_proveedor` (`id_proveedor`),
  KEY `fk_compra_usuario` (`id_usuario`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`) ON UPDATE CASCADE,
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compra`
--

INSERT INTO `compra` VALUES ('19', '42.75', '2025-10-29', '1', '3', NULL),
('20', '18.00', '2025-10-29', '1', '3', NULL),
('21', '5.00', '2025-10-29', '1', '3', NULL),
('22', '5.25', '2025-10-29', '1', '3', NULL),
('23', '31.25', '2025-10-29', '1', '3', NULL),
('24', '6.25', '2025-10-30', '1', '3', NULL),
('25', '21.00', '2025-10-30', '1', '3', NULL),
('26', '26.30', '2025-11-08', '2', '3', 'factura_69116d823afc37.26866034.jpg');

--
-- Estructura de tabla para `detallescompra`
--

DROP TABLE IF EXISTS `detallescompra`;
CREATE TABLE `detallescompra` (
  `id_detalles_compra` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cantidad` int(10) unsigned NOT NULL,
  `id_compra` int(10) unsigned NOT NULL,
  `id_repuesto` int(10) unsigned NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `subTotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalles_compra`),
  KEY `fk_detalle_compra` (`id_compra`),
  KEY `fk_detalle_repuesto` (`id_repuesto`),
  CONSTRAINT `fk_detalle_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detallescompra`
--

INSERT INTO `detallescompra` VALUES ('25', '3', '19', '7', '5.25', '15.75'),
('26', '4', '19', '3', '6.75', '27.00'),
('27', '3', '20', '3', '6.00', '18.00'),
('28', '1', '21', '7', '5.00', '5.00'),
('29', '1', '22', '10', '5.25', '5.25'),
('30', '5', '23', '5', '6.25', '31.25'),
('31', '1', '24', '7', '6.25', '6.25'),
('32', '3', '25', '1', '7.00', '21.00'),
('33', '2', '26', '7', '4.40', '8.80'),
('34', '5', '26', '3', '3.50', '17.50');

--
-- Estructura de tabla para `detalleventa`
--

DROP TABLE IF EXISTS `detalleventa`;
CREATE TABLE `detalleventa` (
  `id_detalle_venta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cantidad` int(10) unsigned NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `id_venta` int(10) unsigned NOT NULL,
  `id_repuesto` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `fk_detalleventa_venta` (`id_venta`),
  KEY `fk_detalleventa_repuesto` (`id_repuesto`),
  CONSTRAINT `fk_detalleventa_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_detalleventa_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalleventa`
--

INSERT INTO `detalleventa` VALUES ('13', '1', '6.00', '11', '7'),
('14', '1', '7.00', '12', '3'),
('15', '1', '6.00', '12', '7'),
('16', '1', '6.50', '12', '5'),
('17', '2', '14.00', '13', '3'),
('18', '1', '7.00', '14', '5');

--
-- Estructura de tabla para `empresa`
--

DROP TABLE IF EXISTS `empresa`;
CREATE TABLE `empresa` (
  `id_empresa` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_empresa`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `telefono` (`telefono`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` VALUES ('1', 'Distribuidora Centro', 'contacto@dcentro.com', '22221111', 'Activo'),
('2', 'Repuestos El Salvador', 'ventas@resv.com', '23332222', 'Activo'),
('3', 'BiciExpress', 'info@biciExpress.com', '24443333', 'Activo'),
('4', 'Taller Rodado', 'contacto@tallerrodado.com', '25554444', 'Activo'),
('5', 'Importadora Pedal', 'ventas@importpedal.com', '26665555', 'Activo'),
('6', 'CicloPro', 'info@ciclopro.com', '27776666', 'Activo'),
('7', 'Bicicletas Unidas', 'contacto@bicunidas.com', '28887777', 'Activo'),
('8', 'Repuestos MTB', 'ventas@repuestosmtb.com', '29998888', 'Activo'),
('9', 'Taller Velocidad', 'info@tallervelocidad.com', '30009999', 'Activo'),
('10', 'CicloService', 'contacto@cicloservice.com', '31110000', 'Activo'),
('11', 'Empresa Prueba', 'empresaprueba@gmail.com', '22736393', 'Activo');

--
-- Estructura de tabla para `herramienta`
--

DROP TABLE IF EXISTS `herramienta`;
CREATE TABLE `herramienta` (
  `id_herramienta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `stock_actual` int(10) unsigned NOT NULL DEFAULT 0,
  `imagen_path` varchar(255) DEFAULT NULL,
  `id_marca` int(10) unsigned NOT NULL,
  `id_medida` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_herramienta`),
  KEY `fk_herramienta_marca` (`id_marca`),
  KEY `fk_herramienta_medida` (`id_medida`),
  CONSTRAINT `fk_herramienta_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`) ON UPDATE CASCADE,
  CONSTRAINT `fk_herramienta_medida` FOREIGN KEY (`id_medida`) REFERENCES `medida` (`id_medida`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `herramienta`
--

--
-- Estructura de tabla para `marca`
--

DROP TABLE IF EXISTS `marca`;
CREATE TABLE `marca` (
  `id_marca` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_marca`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `marca`
--

INSERT INTO `marca` VALUES ('1', 'Shimano', 'Activo'),
('2', 'Specialized', 'Activo'),
('3', 'Trek', 'Inactivo'),
('4', 'Giant', 'Activo'),
('5', 'Cannondale', 'Activo'),
('6', 'Scott', 'Activo'),
('7', 'Bianchi', 'Activo'),
('8', 'Merida', 'Activo'),
('9', 'KTM', 'Activo'),
('10', 'Cube', 'Activo'),
('11', 'Prueba', 'Activo');

--
-- Estructura de tabla para `medida`
--

DROP TABLE IF EXISTS `medida`;
CREATE TABLE `medida` (
  `id_medida` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `medida_bicicleta` varchar(50) NOT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_medida`),
  UNIQUE KEY `medida_bicicleta` (`medida_bicicleta`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medida`
--

INSERT INTO `medida` VALUES ('1', '12', 'Activo'),
('2', '16', 'Activo'),
('3', '20', 'Activo'),
('4', '26', 'Activo'),
('5', '27', 'Activo'),
('6', 'Estandar', 'Activo'),
('7', '26x1.95', 'Activo'),
('8', '15\"', 'Activo');

--
-- Estructura de tabla para `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
CREATE TABLE `proveedor` (
  `id_proveedor` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `correo` varchar(150) NOT NULL,
  `id_empresa` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `telefono` (`telefono`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_proveedor_empresa` (`id_empresa`),
  CONSTRAINT `fk_proveedor_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` VALUES ('1', 'Juan Pérez', '70001111', 'Activo', 'juan.perez@gmail.com', '1'),
('2', 'Ana López', '71112222', 'Activo', 'ana.lopez@hotmail.com', '2'),
('3', 'Luis Martínez', '72223333', 'Activo', 'luis.martinez@yahoo.com', '3'),
('4', 'María Gómez', '73334444', 'Activo', 'maria.gomez@gmail.com', '4'),
('5', 'Carlos Hernández', '74445555', 'Activo', 'carlos.hernandez@hotmail.com', '5'),
('6', 'Sofía Torres', '75556666', 'Activo', 'sofia.torres@gmail.com', '6'),
('7', 'Jorge Ramírez', '76667777', 'Activo', 'jorge.ramirez@yahoo.com', '7'),
('8', 'Lucía Fernández', '77778888', 'Activo', 'lucia.fernandez@gmail.com', '8'),
('9', 'Miguel Castillo', '78889999', 'Activo', 'miguel.castillo@hotmail.com', '9'),
('10', 'Valeria Rivas', '79990000', 'Inactivo', 'valeria.rivas@gmail.com', '10'),
('11', 'La prueba', '11111111', 'Activo', 'prueba@gmail.com', '11');

--
-- Estructura de tabla para `reparaciones`
--

DROP TABLE IF EXISTS `reparaciones`;
CREATE TABLE `reparaciones` (
  `id_reparacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `detalles_reparacion` varchar(255) NOT NULL,
  `costos_reparacion` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `id_cliente` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_reparacion`),
  KEY `fk_reparacion_cliente` (`id_cliente`),
  KEY `fk_reparacion_usuario` (`id_usuario`),
  CONSTRAINT `fk_reparacion_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_reparacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reparaciones`
--

--
-- Estructura de tabla para `repuesto`
--

DROP TABLE IF EXISTS `repuesto`;
CREATE TABLE `repuesto` (
  `id_repuesto` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `stock_minimo` int(10) unsigned NOT NULL,
  `stock_actual` int(11) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `imagen_path` varchar(255) DEFAULT NULL,
  `id_marca` int(10) unsigned NOT NULL,
  `id_medida` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_repuesto`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `fk_repuesto_marca` (`id_marca`),
  KEY `fk_repuesto_medida` (`id_medida`),
  CONSTRAINT `fk_repuesto_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`) ON UPDATE CASCADE,
  CONSTRAINT `fk_repuesto_medida` FOREIGN KEY (`id_medida`) REFERENCES `medida` (`id_medida`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `repuesto`
--

INSERT INTO `repuesto` VALUES ('1', 'LLAKTM2018', 'Llanta', 'Negra con franja azul', '11', '3', '9.00', 'imgs-repuestos/repuesto_LLAKTM2018_1762657669.jpg', '9', '3'),
('2', 'RINMER2050', 'Rin', '26 rayos', '10', '0', '8.50', NULL, '8', '3'),
('3', 'ASISHI1219', 'Asiento', 'Para niños', '5', '9', '7.00', NULL, '1', '1'),
('5', 'FREBIAES69', 'Juego de Frenos', 'Tipo V brake', '5', '3', '7.00', NULL, '7', '6'),
('6', 'MASCANES20', 'Masa', 'Masa trasera de hierro', '5', '0', '4.25', NULL, '5', '6'),
('7', 'AROKTM1694', 'Aro', 'De hierro', '3', '5', '6.00', NULL, '9', '2'),
('8', 'PARSHI2089', 'Parrilla', 'Parrilla con reflector', '6', '0', NULL, NULL, '1', '3'),
('9', 'PARCUBES14', 'Parche', 'Parche negro', '10', '0', '1.50', NULL, '10', '6'),
('10', 'LLACAN2678', 'Llanta auxiliar', 'para bicicleta 12', '6', '1', '6.00', NULL, '5', '4'),
('11', 'ASIBIAES64', 'asiento', 'negro-estandar', '3', NULL, '5.65', 'imgs-repuestos/repuesto_ASIBIAES64_1762656322.jpeg', '7', '6');

--
-- Estructura de tabla para `rol`
--

DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` VALUES ('1', 'Administrador'),
('2', 'Empleado');

--
-- Estructura de tabla para `servicios_venta`
--

DROP TABLE IF EXISTS `servicios_venta`;
CREATE TABLE `servicios_venta` (
  `id_servicio_venta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) NOT NULL,
  `cantidad` int(10) unsigned NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `id_venta` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_servicio_venta`),
  KEY `id_venta` (`id_venta`),
  CONSTRAINT `servicios_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios_venta`
--

INSERT INTO `servicios_venta` VALUES ('3', 'Nivelacion', '1', '3.50', '3.50', '12'),
('4', 'Nivelacion', '1', '3.50', '3.50', '13');

--
-- Estructura de tabla para `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `id_rol` int(10) unsigned NOT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `uq_usuario_nombre` (`nombre`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` VALUES ('3', 'Luis Angel Arias Anaya', 'luisu11@gmail.com', 'Luis', 'Admin123#', '1', 'Activo'),
('4', 'Levi Gerson zelaya Pineda', 'pz22004@ues.edu.sv', 'Levi12', '$2y$10$yE3HTt/si6EohLGFUIcz0.FBirp.O0zvJAO.ZhlrGLS3Wrv9bCfL.', '2', 'Activo'),
('5', 'Camila', 'camila@gmail.com', 'camila12', '$2y$10$xOEFFyoIE03mCWI7/fyepuRUGQbJ5nU9BdHE48wkGPXEWsJdbWWGu', '1', 'Activo'),
('6', 'Usuario de Prueba', 'usuario@gmail.com', 'user', '$2y$10$rrbL1ExH5aJSoTqopnyd1.ON16xpiW0cxA1Iwm9awxJBIESWT3pD6', '2', 'Activo');

--
-- Estructura de tabla para `venta`
--

DROP TABLE IF EXISTS `venta`;
CREATE TABLE `venta` (
  `id_venta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `id_cliente` int(10) unsigned NOT NULL,
  `estado` enum('Activa','Cancelada') NOT NULL DEFAULT 'Activa',
  PRIMARY KEY (`id_venta`),
  KEY `fk_venta_usuario` (`id_usuario`),
  KEY `fk_venta_cliente` (`id_cliente`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` VALUES ('11', '2025-10-30', '6.00', '3', '14', 'Activa'),
('12', '2025-10-30', '23.00', '3', '1', 'Activa'),
('13', '2025-10-30', '17.50', '3', '1', 'Activa'),
('14', '2025-10-30', '7.00', '3', '1', 'Activa');


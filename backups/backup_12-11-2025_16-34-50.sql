-- Backup de Base de Datos
-- Generado: 12/11/2025 16:34:50
-- Base de datos: dbtallerb3
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bitacora`
--

INSERT INTO `bitacora` VALUES ('1', '3', 'Luis Angel Arias Anaya', 'LOGIN', 'Inicio de sesión exitoso - Rol: Administrador', NULL, NULL, NULL, NULL, '2025-11-12 15:50:54', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Autenticación'),
('2', '3', 'Luis Angel Arias Anaya', 'INSERTAR', 'Herramienta creada: prueba - Stock: 2', 'herramienta', '1', NULL, NULL, '2025-11-12 16:03:10', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Herramientas'),
('3', '3', 'Luis Angel Arias Anaya', 'ELIMINAR', 'Herramienta eliminada: prueba', 'herramienta', '1', NULL, NULL, '2025-11-12 16:03:23', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Herramientas'),
('4', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Usuario actualizado: Camila - Cambios: Estado: Activo → Inactivo', 'usuario', '5', NULL, NULL, '2025-11-12 16:16:05', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('5', '3', 'Luis Angel Arias Anaya', 'INSERT', 'Usuario creado: SDSD - Correo: DAD@GMAIL.COM - Rol: Administrador', 'usuario', '6', NULL, NULL, '2025-11-12 16:17:47', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('6', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Usuario actualizado: Camila - Cambios: Estado: Inactivo → Activo', 'usuario', '5', NULL, NULL, '2025-11-12 16:17:57', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('7', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Usuario actualizado: SDSD - Cambios: Estado: Activo → Inactivo', 'usuario', '6', NULL, NULL, '2025-11-12 16:18:09', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('8', '3', 'Luis Angel Arias Anaya', 'UPDATE', 'Usuario actualizado: Camila - Cambios: Estado: Activo → Inactivo', 'usuario', '5', NULL, NULL, '2025-11-12 16:19:05', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios'),
('9', '3', 'Luis Angel Arias Anaya', 'INSERT', 'Usuario creado: Usuario - Correo: camich4nn@gmail.com - Rol: Administrador', 'usuario', '7', NULL, NULL, '2025-11-12 16:19:36', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'Usuarios');

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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('22', 'Antonio Perez', '9849-3528', 'antonio@gmail.com', '1');

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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compra`
--

INSERT INTO `compra` VALUES ('19', '42.75', '2025-10-29', '1', '3', NULL),
('20', '18.00', '2025-10-29', '1', '3', NULL),
('21', '5.00', '2025-10-29', '1', '3', NULL),
('22', '5.25', '2025-10-29', '1', '3', NULL),
('23', '31.25', '2025-10-29', '1', '3', NULL),
('24', '6.25', '2025-10-30', '1', '3', NULL),
('25', '21.00', '2025-10-30', '1', '3', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('32', '3', '25', '1', '7.00', '21.00');

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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalleventa`
--

INSERT INTO `detalleventa` VALUES ('13', '1', '6.00', '11', '7'),
('14', '1', '7.00', '12', '3'),
('15', '1', '6.00', '12', '7'),
('16', '1', '6.50', '12', '5'),
('17', '2', '14.00', '13', '3'),
('18', '1', '7.00', '14', '5'),
('19', '4', '36.00', '15', '1'),
('20', '2', '18.00', '16', '1'),
('21', '2', '18.00', '17', '1'),
('22', '2', '18.00', '18', '1');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('8', 'Repuestos MTB', 'ventas@repuestosmtb.com', '29998888', 'Inactivo'),
('9', 'Taller Velocidad', 'info@tallervelocidad.com', '30009999', 'Activo'),
('10', 'CicloService', 'contacto@cicloservice.com', '31110000', 'Activo');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('10', 'Cube', 'Activo');

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medida`
--

INSERT INTO `medida` VALUES ('1', '12', 'Activo'),
('2', '16', 'Activo'),
('3', '20', 'Activo'),
('4', '26', 'Activo'),
('5', '27', 'Activo'),
('6', 'Estandar', 'Activo');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('10', 'Valeria Rivas', '79990000', 'Inactivo', 'valeria.rivas@gmail.com', '10');

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `repuesto`
--

INSERT INTO `repuesto` VALUES ('1', 'LLAKTM2018', 'Llanta', 'Negra con franja azul', '11', '1', '9.00', 'imgs-repuestos/repuesto_LLAKTM2018_1762657669.jpg', '9', '3'),
('2', 'RINMER2050', 'Rin', '26 rayos', '10', '0', '8.50', NULL, '8', '3'),
('3', 'ASISHI1219', 'Asiento', 'Para niños', '5', '4', '7.00', NULL, '1', '1'),
('5', 'FREBIAES69', 'Juego de Frenos', 'Tipo V brake', '5', '3', '7.00', NULL, '7', '6'),
('6', 'MASCANES20', 'Masa', 'Masa trasera de hierro', '5', '0', NULL, NULL, '5', '6'),
('7', 'AROKTM1694', 'Aro', 'De hierro', '3', '3', '6.00', NULL, '9', '2'),
('8', 'PARSHI2089', 'Parrilla', 'Parrilla con reflector', '6', '0', NULL, NULL, '1', '3'),
('9', 'PARCUBES14', 'Parche', 'Parche negro', '10', '0', NULL, NULL, '10', '6'),
('10', 'LLACAN2678', 'Llanta auxiliar', 'para bicicleta 12', '6', '1', '6.00', NULL, '5', '4');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` VALUES ('3', 'Luis Angel Arias Anaya', 'luisu11@gmail.com', 'Luis', 'Admin123#', '1', 'Activo'),
('4', 'Levi Gerson zelaya Pineda', 'pz22004@ues.edu.sv', 'Levi12', '$2y$10$yE3HTt/si6EohLGFUIcz0.FBirp.O0zvJAO.ZhlrGLS3Wrv9bCfL.', '2', 'Activo'),
('5', 'Camila', 'camila@gmail.com', 'camila12', '$2y$10$xOEFFyoIE03mCWI7/fyepuRUGQbJ5nU9BdHE48wkGPXEWsJdbWWGu', '1', 'Inactivo'),
('6', 'SDSD', 'DAD@GMAIL.COM', 'DSAD', '$2y$10$VGHQniJK4hDLF/UaFOhbLulxA5fkuMEYEqVlHBQsW8DsTde5kP2I6', '1', 'Inactivo'),
('7', 'Usuario', 'camich4nn@gmail.com', 'Usuario1', '$2y$10$vaLl2C9doUsM3mzy40QcZuqZfjmV0FsDewzmbjRmpbozffpxk5t7a', '1', 'Activo');

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` VALUES ('11', '2025-10-30', '6.00', '3', '14', 'Activa'),
('12', '2025-10-30', '23.00', '3', '1', 'Activa'),
('13', '2025-10-30', '17.50', '3', '1', 'Activa'),
('14', '2025-10-30', '7.00', '3', '1', 'Activa'),
('15', '2025-11-11', '36.00', '3', '5', 'Activa'),
('16', '2025-11-11', '18.00', '3', '5', 'Activa'),
('17', '2025-11-11', '18.00', '3', '1', 'Activa'),
('18', '2025-11-11', '18.00', '3', '1', 'Activa');


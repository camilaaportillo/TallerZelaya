-- Backup de Base de Datos
-- Generado: 28/10/2025 21:43:55
-- Base de datos: dbtallerb2
-- Usuario: camila (camich4nn@gmail.com)

--
-- Estructura de tabla para `cliente`
--

DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente` (
  `id_cliente` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `codigos_recuperacion`
--

INSERT INTO `codigos_recuperacion` VALUES ('42', '3', '156634', '2025-09-30 20:21:29', '1', '2025-09-30 20:16:29');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compra`
--

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detallescompra`
--

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalleventa`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medida`
--

INSERT INTO `medida` VALUES ('1', '12', 'Activo'),
('2', '16', 'Activo'),
('3', '20', 'Activo'),
('4', '26', 'Activo'),
('5', '27', 'Inactivo');

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
  `id_marca` int(10) unsigned NOT NULL,
  `id_medida` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_repuesto`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `fk_repuesto_marca` (`id_marca`),
  KEY `fk_repuesto_medida` (`id_medida`),
  CONSTRAINT `fk_repuesto_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`) ON UPDATE CASCADE,
  CONSTRAINT `fk_repuesto_medida` FOREIGN KEY (`id_medida`) REFERENCES `medida` (`id_medida`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `repuesto`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` VALUES ('1', 'levi pineda', 'leviP@gmail.com', 'levi', '$2y$10$wf70gLTBjuBpZmT710v9hOJWyxC1r/FqfAFjiVppO.6aNZEtO2C0u', '2', 'Inactivo'),
('2', 'Gerson Zelaya', 'gersonZ@gmail.com', 'gerson', '$2y$10$/I1SrvltCKeQ.6XkfkSdAeGuTzEh3HJS3MX2FcRRlW1PBWtZHpJ62', '2', 'Activo'),
('3', 'camila', 'camich4nn@gmail.com', 'camila22', '$2y$10$bwYIdGWbmRQuhuSZVdpJTug/1XiW8SM0G8O39P0MLtG3sj70sH0zm', '1', 'Activo'),
('4', 'Oscarr', 'oscarpsvita9@gmail.com', 'oscar', '$2y$10$iWYeU2X5LrRqsq/LxsuvgeNptuKXl5vRMng7sE.XBTCsBUCI.fZNq', '2', 'Activo');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `venta`
--


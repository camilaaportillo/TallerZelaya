<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

// Verificar permisos (solo administradores pueden ver la bitácora)
if ($_SESSION['usuario_id_rol'] != 1) {
    header('Location: acceso_denegado.php');
    exit;
}

require_once 'conexion.php';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitácora del Sistema - Taller Zelaya</title>
    <link rel="icon" href="imgs/favicon.png" type="image/png">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/bitacora.css">
</head>
<body>
    <!-- Encabezado -->
    <header>
        <button class="logo-btn" onclick="irInicio()">
            <img src="imgs/bicicleta.png" alt="Logo bicicleta">
            <span class="hover-text">Ir al Inicio</span>
        </button>
        <h1>Taller de bicicletas Zelaya</h1>
        <div class="usuario">
            <div class="info-usuario">
                <span id="nombreUsuario" class="nombre-usuario"><?php echo $_SESSION['usuario_usuario']; ?></span>
                <span id="rolUsuario" class="rol-usuario"><?php echo $_SESSION['usuario_id_rol'] == 1 ? 'Administrador' : ''; ?></span>
            </div>
            <button class="user-btn" onclick="toggleMenu()">
                <img src="imgs/logo_user.png" alt="Usuario">
            </button>
            <div id="menuUsuario" class="menu-usuario">
                <a href="#" onclick="cerrarSesion()">Cerrar sesión</a>
            </div>
        </div>
    </header>

    <!-- Contenido principal -->
    <main class="main-content">
        <div class="container">
            <div class="page-header">
                <h2>Bitácora del Sistema</h2>
                <p>Registro de todas las actividades realizadas en el sistema</p>
            </div>

            <!-- Filtros -->
            <div class="filters-card">
                <div class="filters-header">
                    <h3>Filtros</h3>
                    <button class="btn btn-secondary" onclick="resetFilters()">
                        <i class="fas fa-refresh"></i> Limpiar
                    </button>
                </div>
                <div class="filters-body">
                    <div class="filter-row">
                        <div class="filter-group">
                            <label for="fechaInicio">Fecha Inicio:</label>
                            <input type="date" id="fechaInicio" class="form-control">
                        </div>
                        <div class="filter-group">
                            <label for="fechaFin">Fecha Fin:</label>
                            <input type="date" id="fechaFin" class="form-control">
                        </div>
                        <div class="filter-group">
                            <label for="filtroUsuario">Usuario:</label>
                            <select id="filtroUsuario" class="form-control">
                                <option value="">Todos los usuarios</option>
                            </select>
                        </div>
                    </div>
                    <div class="filter-row">
                        <div class="filter-group">
                            <label for="filtroAccion">Acción:</label>
                            <select id="filtroAccion" class="form-control">
                                <option value="">Todas las acciones</option>
                                <option value="CREAR">CREAR</option>
                                <option value="EDITAR">EDITAR</option>
                                <option value="ELIMINAR">ELIMINAR</option>
                                <option value="RESTAURAR">RESTAURAR</option>
                                <option value="BACKUP">BACKUP</option>
                                <option value="LOGIN">LOGIN</option>
                                <option value="LOGOUT">LOGOUT</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="filtroModulo">Módulo:</label>
                            <select id="filtroModulo" class="form-control">
                                <option value="">Todos los módulos</option>
                                <option value="Usuarios">Usuarios</option>
                                <option value="Clientes">Clientes</option>
                                <option value="Bicicletas">Bicicletas</option>
                                <option value="Reparaciones">Reparaciones</option>
                                <option value="Inventario">Inventario</option>
                                <option value="Backups">Backups</option>
                                <option value="Sistema">Sistema</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="filtroTabla">Tabla:</label>
                            <input type="text" id="filtroTabla" class="form-control" placeholder="Filtrar por tabla...">
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-primary" onclick="cargarBitacora()">
                            <i class="fas fa-search"></i> Aplicar Filtros
                        </button>
                        <button class="btn btn-outline" onclick="exportarBitacora()">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Estadísticas -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-number" id="totalRegistros">0</span>
                        <span class="stat-label">Total Registros</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-number" id="totalEliminaciones">0</span>
                        <span class="stat-label">Eliminaciones</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-number" id="totalUsuariosActivos">0</span>
                        <span class="stat-label">Usuarios Activos</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-number" id="totalBackups">0</span>
                        <span class="stat-label">Backups Realizados</span>
                    </div>
                </div>
            </div>

            <!-- Tabla de bitácora -->
            <div class="table-card">
                <div class="table-header">
                    <h3>Registros de Actividad</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <input type="text" id="busquedaGlobal" class="form-control" placeholder="Buscar en todos los campos...">
                            <i class="fas fa-search"></i>
                        </div>
                        <button class="btn btn-secondary" onclick="recargarBitacora()">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="tablaBitacora" class="data-table">
                        <thead>
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Descripción</th>
                                <th>Módulo</th>
                                <th>Tabla</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpoTablaBitacora">
                            <!-- Los datos se cargan via JavaScript -->
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <div class="pagination-info">
                        Mostrando <span id="registrosMostrados">0</span> de <span id="totalRegistrosFooter">0</span> registros
                    </div>
                    <div class="pagination-controls">
                        <button class="btn btn-outline" onclick="cambiarPagina(-1)" id="btnAnterior" disabled>
                            <i class="fas fa-chevron-left"></i> Anterior
                        </button>
                        <span class="page-info">Página <span id="paginaActual">1</span></span>
                        <button class="btn btn-outline" onclick="cambiarPagina(1)" id="btnSiguiente" disabled>
                            Siguiente <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal para ver detalles -->
    <div id="modalDetalles" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles del Registro</h3>
                <button class="close-btn" onclick="cerrarModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Fecha y Hora:</label>
                        <span id="detalleFecha"></span>
                    </div>
                    <div class="detail-item">
                        <label>Usuario:</label>
                        <span id="detalleUsuario"></span>
                    </div>
                    <div class="detail-item">
                        <label>Acción:</label>
                        <span id="detalleAccion" class="badge"></span>
                    </div>
                    <div class="detail-item">
                        <label>Módulo:</label>
                        <span id="detalleModulo"></span>
                    </div>
                    <div class="detail-item">
                        <label>Tabla Afectada:</label>
                        <span id="detalleTabla"></span>
                    </div>
                    <div class="detail-item">
                        <label>ID Registro:</label>
                        <span id="detalleIdRegistro"></span>
                    </div>
                    <div class="detail-item">
                        <label>Dirección IP:</label>
                        <span id="detalleIp"></span>
                    </div>
                    <div class="detail-item full-width">
                        <label>Descripción:</label>
                        <p id="detalleDescripcion" class="description-text"></p>
                    </div>
                    <div class="detail-item full-width">
                        <label>Datos Anteriores:</label>
                        <pre id="detalleDatosAnteriores" class="json-data"></pre>
                    </div>
                    <div class="detail-item full-width">
                        <label>Datos Nuevos:</label>
                        <pre id="detalleDatosNuevos" class="json-data"></pre>
                    </div>
                    <div class="detail-item">
                        <label>User Agent:</label>
                        <span id="detalleUserAgent" class="user-agent"></span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="cerrarModal()">Cerrar</button>
            </div>
        </div>
    </div>

    <!-- Loading overlay -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Cargando bitácora...</p>
    </div>

    <script src="js/bitacora.js"></script>
</body>
</html>
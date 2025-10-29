<?php
// LIMPIAR BUFFER Y DESACTIVAR ERRORES AL INICIO
error_reporting(0);
ini_set('display_errors', 0);

// Limpiar cualquier salida anterior
while (ob_get_level()) {
    ob_end_clean();
}

// Configurar zona horaria para El Salvador
date_default_timezone_set('America/El_Salvador');

// DEBUG: Verificar configuración
error_log("🇸🇻 Zona horaria configurada: " . date_default_timezone_get());
error_log("🕒 Hora actual en El Salvador: " . date('Y-m-d H:i:s'));
session_start();

// Incluir archivo de conexión
require_once 'conexion.php';

// Configuración
$backup_dir = 'C:/xampp/htdocs/TallerZelaya/backups/';
$max_backups = 10; // Número máximo de backups a mantener
$schedule_file = 'C:/xampp/htdocs/TallerZelaya/backups/backup_schedule.json';

// CREAR PROTECCIÓN AUTOMÁTICA
function createBackupProtection($backup_dir) {
    // Crear directorio si no existe
    if (!file_exists($backup_dir)) {
        mkdir($backup_dir, 0700, true); // Permisos restringidos
    }
    
    // Crear archivo .htaccess
    $htaccess_content = '# =============================================
# PROTECCIÓN TOTAL DEL DIRECTORIO BACKUPS
# =============================================

# Denegar acceso a TODOS los archivos
Order Deny,Allow
Deny from all

# Deshabilitar completamente el listado de directorios
Options -Indexes

# Bloquear ejecución de cualquier script
<FilesMatch "\.(php|php5|phtml|html|htm|js|css)$">
    Deny from all
</FilesMatch>

# Bloquear acceso directo a archivos SQL
<FilesMatch "\.(sql)$">
    Deny from all
</FilesMatch>

# Prevenir acceso desde cualquier IP
<RequireAll>
    Require all denied
</RequireAll>

# Mensaje de error personalizado
ErrorDocument 403 "Acceso denegado"';
    
    $htaccess_file = $backup_dir . '.htaccess';
    file_put_contents($htaccess_file, $htaccess_content);
    
    // Crear index.html vacío para evitar listado
    $index_content = '<!DOCTYPE html>
<html>
<head>
    <title>Acceso denegado</title>
</head>
<body>
    <h1>403 - Acceso denegado</h1>
    <p>No tienes permisos para acceder a este directorio.</p>
</body>
</html>';
    
    $index_file = $backup_dir . 'index.html';
    file_put_contents($index_file, $index_content);
    
    // Establecer permisos seguros
    chmod($backup_dir, 0700);
    chmod($htaccess_file, 0644);
    chmod($index_file, 0644);
}

// Llamar la función de protección
createBackupProtection($backup_dir);

// Crear directorio de backups si no existe
if (!file_exists($backup_dir)) {
    mkdir($backup_dir, 0777, true);
}

// Inicializar archivo de programación si no existe
if (!file_exists($schedule_file)) {
    file_put_contents($schedule_file, json_encode(['schedules' => []]));
}

// Obtener la acción solicitada (tanto POST como GET)
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

// Para acciones de descarga, manejarlas inmediatamente
if ($action === 'download') {
    downloadBackup();
    exit;
}

// Para otras acciones, continuar con JSON
header('Content-Type: application/json');

switch ($action) {
    case 'create_backup':
        createBackup();
        break;
    case 'list_backups':
        listBackups();
        break;
    case 'restore_backup':
        restoreBackup();
        break;
    case 'delete_backup':
        deleteBackup();
        break;
    case 'upload_backup':
        uploadBackup();
        break;
    case 'get_stats':
        getStats();
        break;
    case 'check_password':
        checkPassword();
        break;
    case 'save_schedule':
        saveSchedule();
        break;
    case 'list_schedules':
        listSchedules();
        break;
    case 'delete_schedule':
        deleteSchedule();
        break;
    case 'check_scheduled_backups':
        $result = checkScheduledBackups();
        echo json_encode($result);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}

// NUEVA FUNCIÓN PARA DESCARGAR BACKUP
function downloadBackup() {
    global $backup_dir;
    
    $filename = isset($_GET['filename']) ? $_GET['filename'] : '';
    
    if (empty($filename)) {
        die('Nombre de archivo no especificado');
    }
    
    // Validar que el archivo sea .sql y esté en el directorio correcto
    if (pathinfo($filename, PATHINFO_EXTENSION) != 'sql') {
        die('Tipo de archivo no válido');
    }
    
    $filepath = $backup_dir . $filename;
    
    if (!file_exists($filepath)) {
        die('Archivo no encontrado');
    }
    
    // Configurar headers para descarga
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($filepath) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filepath));
    
    // Limpiar buffer de salida
    flush();
    
    // Leer y enviar archivo
    readfile($filepath);
    exit;
}

// Función para crear backup
function createBackup() {
    global $conn, $backup_dir, $max_backups;
    
    try {
        // Verificar contraseña primero
        if (!verifyPasswordForAction('create_backup')) {
            echo json_encode([
                'success' => false, 
                'message' => 'Contraseña de administrador requerida'
            ]);
            return;
        }
        
        // Generar nombre de archivo con formato: backup_dd-mm-YYYY_HH-MM-SS.sql
        $filename = 'backup_' . date('d-m-Y_H-i-s') . '.sql';
        $filepath = $backup_dir . $filename;
        
        // Obtener todas las tablas
        $tables = array();
        $result = $conn->query('SHOW TABLES');
        while ($row = $result->fetch_row()) {
            $tables[] = $row[0];
        }
        
        // Crear contenido del backup
        $output = "-- Backup de Base de Datos\n";
        $output .= "-- Generado: " . date('d/m/Y H:i:s') . "\n";
        $output .= "-- Base de datos: " . $GLOBALS['db'] . "\n";
        $output .= "-- Usuario: " . $_SESSION['usuario_nombre'] . " (" . $_SESSION['usuario_correo'] . ")\n\n";
        
        // Recorrer tablas
        foreach ($tables as $table) {
            // Obtener estructura de la tabla
            $output .= "--\n-- Estructura de tabla para `$table`\n--\n\n";
            $output .= "DROP TABLE IF EXISTS `$table`;\n";
            
            $create_table = $conn->query("SHOW CREATE TABLE `$table`");
            $row = $create_table->fetch_row();
            $output .= $row[1] . ";\n\n";
            
            // Obtener datos de la tabla
            $output .= "--\n-- Volcado de datos para la tabla `$table`\n--\n\n";
            
            $data = $conn->query("SELECT * FROM `$table`");
            if ($data->num_rows > 0) {
                $output .= "INSERT INTO `$table` VALUES ";
                
                $first = true;
                while ($row = $data->fetch_row()) {
                    if (!$first) {
                        $output .= ",\n";
                    }
                    
                    $output .= "(";
                    $first_field = true;
                    foreach ($row as $value) {
                        if (!$first_field) {
                            $output .= ", ";
                        }
                        if ($value === null) {
                            $output .= "NULL";
                        } else {
                            $output .= "'" . $conn->real_escape_string($value) . "'";
                        }
                        $first_field = false;
                    }
                    $output .= ")";
                    $first = false;
                }
                $output .= ";\n\n";
            }
        }
        
        // Guardar archivo
        if (file_put_contents($filepath, $output)) {
            // Limpiar backups antiguos si excedemos el límite
            cleanupOldBackups();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Backup creado correctamente',
                'filename' => $filename
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Error al guardar el archivo de backup'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Error al crear backup: ' . $e->getMessage()
        ]);
    }
}

// Función para listar backups
function listBackups() {
    global $backup_dir;
    
    try {
        // Limpiar buffer de salida por si hay algún warning/notice
        if (ob_get_length()) {
            ob_clean();
        }

        // Verificar si el directorio existe
        if (!is_dir($backup_dir)) {
            throw new Exception("El directorio de backups no existe: " . $backup_dir);
        }
        
        $backups = [];
        $files = scandir($backup_dir);
        
        if ($files === false) {
            throw new Exception("No se pudo leer el directorio de backups: " . $backup_dir);
        }
        
        foreach ($files as $file) {
            if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) == 'sql') {
                $filepath = $backup_dir . $file;
                $backups[] = [
                    'filename' => $file,
                    'date' => date('d/m/Y H:i:s', filemtime($filepath)),
                    'size' => formatSize(filesize($filepath))
                ];
            }
        }
        
        // Ordenar por fecha (más reciente primero)
        usort($backups, function($a, $b) use ($backup_dir) {
            return filemtime($backup_dir . $b['filename']) - filemtime($backup_dir . $a['filename']);
        });
        
        echo json_encode(['success' => true, 'backups' => $backups]);
        
    } catch (Exception $e) {
        // Asegurarse de que no hay nada en el buffer
        if (ob_get_length()) {
            ob_clean();
        }
        echo json_encode(['success' => false, 'message' => 'Error al listar backups: ' . $e->getMessage()]);
    }
}

// Función para restaurar backup
function restoreBackup() {
    global $conn, $backup_dir;
    
    // Verificar contraseña primero
    if (!verifyPasswordForAction('restore_backup')) {
        echo json_encode([
            'success' => false, 
            'message' => 'Contraseña de administrador requerida'
        ]);
        return;
    }
    
    $filename = isset($_POST['filename']) ? $_POST['filename'] : '';
    $filepath = $backup_dir . $filename;
    
    if (!file_exists($filepath)) {
        echo json_encode(['success' => false, 'message' => 'Archivo de backup no encontrado']);
        return;
    }
    
    try {
        // Leer contenido del archivo
        $sql = file_get_contents($filepath);
        
        // Desactivar comprobación de claves foráneas
        $conn->query('SET FOREIGN_KEY_CHECKS=0');
        
        // Ejecutar consultas
        if ($conn->multi_query($sql)) {
            do {
                // Limpiar resultados
                if ($result = $conn->store_result()) {
                    $result->free();
                }
            } while ($conn->more_results() && $conn->next_result());
        }
        
        // Reactivar comprobación de claves foráneas
        $conn->query('SET FOREIGN_KEY_CHECKS=1');
        
        echo json_encode(['success' => true, 'message' => 'Backup restaurado correctamente']);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Error al restaurar backup: ' . $e->getMessage()
        ]);
    }
}

// Función para eliminar backup
function deleteBackup() {
    global $backup_dir;
    
    // Verificar contraseña primero
    if (!verifyPasswordForAction('delete_backup')) {
        echo json_encode([
            'success' => false, 
            'message' => 'Contraseña de administrador requerida'
        ]);
        return;
    }
    
    $filename = isset($_POST['filename']) ? $_POST['filename'] : '';
    $filepath = $backup_dir . $filename;
    
    if (!file_exists($filepath)) {
        echo json_encode(['success' => false, 'message' => 'Archivo de backup no encontrado']);
        return;
    }
    
    if (unlink($filepath)) {
        echo json_encode(['success' => true, 'message' => 'Backup eliminado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el backup']);
    }
}

// Función para subir backup
function uploadBackup() {
    global $backup_dir;
    
    // Verificar contraseña primero
    if (!verifyPasswordForAction('upload_backup')) {
        echo json_encode([
            'success' => false, 
            'message' => 'Contraseña de administrador requerida'
        ]);
        return;
    }
    
    if (!isset($_FILES['backup-file']) || $_FILES['backup-file']['error'] != UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Error al subir el archivo']);
        return;
    }
    
    $uploaded_file = $_FILES['backup-file'];
    $filename = isset($_POST['backup-name']) && !empty($_POST['backup-name']) 
                ? $_POST['backup-name'] . '.sql' 
                : $uploaded_file['name'];
    
    // Validar extensión
    if (pathinfo($filename, PATHINFO_EXTENSION) != 'sql') {
        echo json_encode(['success' => false, 'message' => 'Solo se permiten archivos .sql']);
        return;
    }
    
    $filepath = $backup_dir . $filename;
    
    if (move_uploaded_file($uploaded_file['tmp_name'], $filepath)) {
        echo json_encode(['success' => true, 'message' => 'Backup subido correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar el archivo']);
    }
}

// Función para obtener estadísticas
function getStats() {
    global $backup_dir, $conn, $schedule_file;
    
    // Contar backups
    $backup_count = 0;
    $total_size = 0;
    
    $files = scandir($backup_dir);
    foreach ($files as $file) {
        if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) == 'sql') {
            $backup_count++;
            $total_size += filesize($backup_dir . $file);
        }
    }
    
    // Contar programaciones
    $schedule_count = 0;
    if (file_exists($schedule_file)) {
        $schedules = json_decode(file_get_contents($schedule_file), true);
        $schedule_count = count($schedules['schedules']);
    }
    
    // Verificar conexión a BD
    $db_status = $conn->ping() ? 'Conectado' : 'Desconectado';
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'backup_count' => $backup_count,
            'storage_used' => formatSize($total_size),
            'db_status' => $db_status,
            'schedule_count' => $schedule_count,
            'backup_path' => 'Ubicación segura del servidor'
        ]
    ]);
}

// Función para verificar contraseña
function checkPassword() {
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $action_type = isset($_POST['action_type']) ? $_POST['action_type'] : '';
    
    if (empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Contraseña requerida']);
        return;
    }
    
    // Verificar si el usuario está logueado y es administrador
    if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_id_rol'] != 1) {
        echo json_encode(['success' => false, 'message' => 'Se requiere rol de administrador']);
        return;
    }
    
    // Buscar usuario en la base de datos para verificar contraseña
    try {
        $stmt = $GLOBALS['conn']->prepare("SELECT contrasena FROM usuario WHERE id_usuario = ?");
        $stmt->bind_param("i", $_SESSION['usuario_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();
        
        if ($usuario) {
            // Verificar contraseña
            $stored_password = $usuario['contrasena'];
            
            // Intentar con password_verify primero (si la contraseña está hasheada)
            if (password_verify($password, $stored_password)) {
                // Contraseña correcta
                $_SESSION['password_verified_' . $action_type] = true;
                $_SESSION['password_verified_time'] = time();
                
                echo json_encode(['success' => true, 'message' => 'Contraseña correcta']);
            } else {
                // Si no coincide, intentar comparación directa (para contraseñas en texto plano)
                if ($password === $stored_password) {
                    $_SESSION['password_verified_' . $action_type] = true;
                    $_SESSION['password_verified_time'] = time();
                    
                    echo json_encode(['success' => true, 'message' => 'Contraseña correcta']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
                }
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error al verificar contraseña: ' . $e->getMessage()]);
    }
}

// Función auxiliar para verificar contraseña para una acción específica
function verifyPasswordForAction($action_type) {
    // Verificar si es administrador
    if (!isset($_SESSION['usuario_id_rol']) || $_SESSION['usuario_id_rol'] != 1) {
        return false;
    }
    
    // Verificar si la contraseña fue verificada recientemente (últimos 5 minutos)
    if (isset($_SESSION['password_verified_' . $action_type]) && 
        isset($_SESSION['password_verified_time']) &&
        (time() - $_SESSION['password_verified_time']) < 300) {
        return true;
    }
    
    return false;
}

// Función para guardar programación
function saveSchedule() {
    global $schedule_file;
    
    // Verificar contraseña primero
    if (!verifyPasswordForAction('save_schedule')) {
        echo json_encode([
            'success' => false, 
            'message' => 'Contraseña de administrador requerida'
        ]);
        return;
    }
    
    $type = isset($_POST['type']) ? $_POST['type'] : '';
    $time = isset($_POST['time']) ? $_POST['time'] : '';
    $day = isset($_POST['day']) ? $_POST['day'] : null;
    $active = isset($_POST['active']) ? filter_var($_POST['active'], FILTER_VALIDATE_BOOLEAN) : true;
    
    if (empty($type) || empty($time)) {
        echo json_encode(['success' => false, 'message' => 'Frecuencia y hora son requeridos']);
        return;
    }
    
    $schedules = json_decode(file_get_contents($schedule_file), true);
    
    // Generar ID único
    $id = uniqid();
    
    $new_schedule = [
        'id' => $id,
        'type' => $type,
        'time' => $time,
        'active' => $active,
        'created_by' => $_SESSION['usuario_nombre'],
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    if ($type == 'weekly' || $type == 'monthly') {
        if ($day === null) {
            echo json_encode(['success' => false, 'message' => 'Día requerido para esta frecuencia']);
            return;
        }
        $new_schedule['day'] = $day;
    }
    
    $schedules['schedules'][] = $new_schedule;
    
    if (file_put_contents($schedule_file, json_encode($schedules, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Programación guardada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar la programación']);
    }
}

// Función para listar programaciones
function listSchedules() {
    global $schedule_file;
    
    if (!file_exists($schedule_file)) {
        echo json_encode(['success' => true, 'schedules' => []]);
        return;
    }
    
    $schedules = json_decode(file_get_contents($schedule_file), true);
    echo json_encode(['success' => true, 'schedules' => $schedules['schedules']]);
}

// Función para eliminar programación
function deleteSchedule() {
    global $schedule_file;
    
    // Verificar contraseña primero
    if (!verifyPasswordForAction('delete_schedule')) {
        echo json_encode([
            'success' => false, 
            'message' => 'Contraseña de administrador requerida'
        ]);
        return;
    }
    
    $id = isset($_POST['id']) ? $_POST['id'] : '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de programación requerido']);
        return;
    }
    
    $schedules = json_decode(file_get_contents($schedule_file), true);
    
    $found = false;
    foreach ($schedules['schedules'] as $key => $schedule) {
        if ($schedule['id'] == $id) {
            unset($schedules['schedules'][$key]);
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        echo json_encode(['success' => false, 'message' => 'Programación no encontrada']);
        return;
    }
    
    // Reindexar array
    $schedules['schedules'] = array_values($schedules['schedules']);
    
    if (file_put_contents($schedule_file, json_encode($schedules, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Programación eliminada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar la programación']);
    }
}
// Función para verificar y ejecutar backups programados
function checkScheduledBackups() {
    global $schedule_file, $backup_dir;

    // ARCHIVO DE LOCK - evita ejecuciones múltiples
    $lock_file = $backup_dir . 'backup_lock.txt';
    $lock_timeout = 300; // 5 minutos de timeout

    // Verificar si ya hay un backup en ejecución
    if (file_exists($lock_file)) {
        $lock_time = file_get_contents($lock_file);
        // Si el lock tiene menos de 5 minutos, salir
        if (time() - $lock_time < $lock_timeout) {
            return [
                'success' => true, 
                'executed' => 0, 
                'message' => 'Backup ya está siendo ejecutado por otro usuario',
                'locked' => true
            ];
        } else {
            // Lock expirado, eliminarlo
            unlink($lock_file);
        }
    }

    if (!file_exists($schedule_file)) {
        return ['success' => true, 'executed' => 0, 'message' => 'No hay programaciones configuradas'];
    }

    try {
        $schedules = json_decode(file_get_contents($schedule_file), true);
        
        if (!is_array($schedules) || !isset($schedules['schedules'])) {
            return ['success' => true, 'executed' => 0, 'message' => 'Formato de programaciones inválido'];
        }

        $current_date = date('Y-m-d');
        $current_hour = date('H:i');
        $current_day_of_week = date('w');
        $current_day_of_month = date('j');
        
        $executed_count = 0;
        $executed_backups = [];

        // DEBUG: Registrar la hora actual y las programaciones
        error_log("=== VERIFICACIÓN BACKUP PROGRAMADO ===");
        error_log("Hora actual: " . $current_hour);
        error_log("Día de la semana: " . $current_day_of_week);
        error_log("Día del mes: " . $current_day_of_month);

        foreach ($schedules['schedules'] as $schedule) {
            if (!$schedule['active']) {
                continue;
            }
            
            $last_run_file = $backup_dir . 'last_run_' . $schedule['id'] . '.txt';
            $last_run = file_exists($last_run_file) ? file_get_contents($last_run_file) : '';
            
            // Si ya se ejecutó hoy, saltar
            if ($last_run == $current_date) {
                error_log("Programación " . $schedule['id'] . " ya ejecutada hoy");
                continue;
            }
            
            $should_run = false;
            
            switch ($schedule['type']) {
                case 'daily':
                    if ($current_hour == $schedule['time']) {
                        $should_run = true;
                    }
                    break;
                    
                case 'weekly':
                    if (isset($schedule['day']) && $current_day_of_week == $schedule['day'] && $current_hour == $schedule['time']) {
                        $should_run = true;
                    }
                    break;
                    
                case 'monthly':
                    if (isset($schedule['day']) && $current_day_of_month == $schedule['day'] && $current_hour == $schedule['time']) {
                        $should_run = true;
                    }
                    break;
            }
            
            if ($should_run) {
                error_log("✅ Ejecutando programación: " . $schedule['id']);
                // CREAR LOCK - evitar que otros usuarios ejecuten
                file_put_contents($lock_file, time());
                
                // Ejecutar backup
                $backup_result = createScheduledBackup($schedule['id']);
                
                if ($backup_result) {
                    // Marcar como ejecutado hoy
                    file_put_contents($last_run_file, $current_date);
                    $executed_count++;
                    $executed_backups[] = $schedule['id'];
                    
                    // Registrar en log
                    error_log("✅ Backup automático ejecutado: " . $schedule['id'] . " - " . date('Y-m-d H:i:s'));
                } else {
                    error_log("❌ Falló backup programado: " . $schedule['id']);
                }
                
                // ELIMINAR LOCK después de ejecutar
                unlink($lock_file);
            } else {
                error_log("❌ No cumple condiciones: " . $schedule['id'] . " - Hora programada: " . $schedule['time'] . " - Hora actual: " . $current_hour);
            }
        }
        
        $message = $executed_count > 0 
            ? "Se ejecutaron {$executed_count} backups programados"
            : 'No se requirió ejecutar backups programados en este momento';
            
        return [
            'success' => true,
            'executed' => $executed_count,
            'message' => $message
        ];
        
    } catch (Exception $e) {
        // Asegurarse de eliminar el lock en caso de error
        if (file_exists($lock_file)) {
            unlink($lock_file);
        }
        
        error_log("❌ Error en checkScheduledBackups: " . $e->getMessage());
        return [
            'success' => false,
            'executed' => 0,
            'message' => 'Error al verificar backups programados: ' . $e->getMessage()
        ];
    }
}
// Función para crear backup programado
function createScheduledBackup($schedule_id) {
    global $conn, $backup_dir, $max_backups;
    
    try {
        // Generar nombre de archivo con formato: backup_auto_dd-mm-YYYY_HH-MM-SS.sql
        $filename = 'backup_auto_' . date('d-m-Y_H-i-s') . '.sql';
        $filepath = $backup_dir . $filename;
        
        // Obtener todas las tablas
        $tables = array();
        $result = $conn->query('SHOW TABLES');
        while ($row = $result->fetch_row()) {
            $tables[] = $row[0];
        }
        
        // Crear contenido del backup
        $output = "-- Backup Automático de Base de Datos\n";
        $output .= "-- Generado: " . date('d/m/Y H:i:s') . "\n";
        $output .= "-- Programación ID: " . $schedule_id . "\n";
        $output .= "-- Base de datos: " . $GLOBALS['db'] . "\n\n";
        
        // Recorrer tablas
        foreach ($tables as $table) {
            // Obtener estructura de la tabla
            $output .= "--\n-- Estructura de tabla para `$table`\n--\n\n";
            $output .= "DROP TABLE IF EXISTS `$table`;\n";
            
            $create_table = $conn->query("SHOW CREATE TABLE `$table`");
            $row = $create_table->fetch_row();
            $output .= $row[1] . ";\n\n";
            
            // Obtener datos de la tabla
            $output .= "--\n-- Volcado de datos para la tabla `$table`\n--\n\n";
            
            $data = $conn->query("SELECT * FROM `$table`");
            if ($data->num_rows > 0) {
                $output .= "INSERT INTO `$table` VALUES ";
                
                $first = true;
                while ($row = $data->fetch_row()) {
                    if (!$first) {
                        $output .= ",\n";
                    }
                    
                    $output .= "(";
                    $first_field = true;
                    foreach ($row as $value) {
                        if (!$first_field) {
                            $output .= ", ";
                        }
                        if ($value === null) {
                            $output .= "NULL";
                        } else {
                            $output .= "'" . $conn->real_escape_string($value) . "'";
                        }
                        $first_field = false;
                    }
                    $output .= ")";
                    $first = false;
                }
                $output .= ";\n\n";
            }
        }
        
        // Guardar archivo
        if (file_put_contents($filepath, $output)) {
            // Limpiar backups antiguos si excedemos el límite
            cleanupOldBackups();
            
            error_log("Backup automático ejecutado: " . $filename);
        } else {
            error_log("Error al guardar backup automático: " . $filename);
        }
        
    } catch (Exception $e) {
        error_log("Error en backup automático: " . $e->getMessage());
    }
}

// Función para limpiar backups antiguos
function cleanupOldBackups() {
    global $backup_dir, $max_backups;
    
    $files = [];
    $dir_files = scandir($backup_dir);
    
    foreach ($dir_files as $file) {
        if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) == 'sql') {
            $files[] = [
                'filename' => $file,
                'timestamp' => filemtime($backup_dir . $file)
            ];
        }
    }
    
    // Ordenar por fecha (más antiguo primero)
    usort($files, function($a, $b) {
        return $a['timestamp'] - $b['timestamp'];
    });
    
    // Eliminar backups excedentes
    if (count($files) > $max_backups) {
        $to_delete = count($files) - $max_backups;
        for ($i = 0; $i < $to_delete; $i++) {
            unlink($backup_dir . $files[$i]['filename']);
        }
    }
}

// Función auxiliar para formatear tamaño
function formatSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $index = 0;
    
    while ($bytes >= 1024 && $index < count($units) - 1) {
        $bytes /= 1024;
        $index++;
    }
    
    return round($bytes, 2) . ' ' . $units[$index];
}
?>
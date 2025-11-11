<?php
session_start();
// Activar reporte de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Log para ver el método HTTP
error_log("Método HTTP: " . $_SERVER['REQUEST_METHOD']);
error_log("Datos POST: " . print_r($_POST, true));

header("Content-Type: application/json; charset=UTF-8");

// Incluir conexión y bitácora
include "conexion.php";
include "bitacora_helper.php";

// Verificar si es POST de manera más flexible
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Error: Método no permitido. Método recibido: " . $_SERVER['REQUEST_METHOD']);
    echo json_encode([
        "status" => "error",
        "mensaje" => "Método no permitido. Se esperaba POST."
    ]);
    exit;
}

// Verificar conexión
if ($conn->connect_error) {
    error_log("Error de conexión: " . $conn->connect_error);
    echo json_encode([
        "status" => "error",
        "mensaje" => "Error de conexión a la base de datos"
    ]);
    exit;
}

// Verificar que los datos POST existen
if (empty($_POST)) {
    error_log("Error: Datos POST vacíos");
    echo json_encode([
        "status" => "error",
        "mensaje" => "No se recibieron datos"
    ]);
    exit;
}

// Obtener y validar datos
$id = isset($_POST['id_usuario']) ? (int)$_POST['id_usuario'] : 0;
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
$rol = isset($_POST['rol']) ? (int)$_POST['rol'] : 0;
$estado = isset($_POST['estado']) ? trim($_POST['estado']) : '';

error_log("Datos procesados - ID: $id, Nombre: $nombre, Correo: $correo, Rol: $rol, Estado: $estado");

// Validaciones
if (!$id || $id <= 0) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "ID de usuario no válido: $id"
    ]);
    exit;
}

if (empty($nombre) || empty($correo) || !$rol || empty($estado)) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "Todos los campos son obligatorios"
    ]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "Formato de correo electrónico no válido: $correo"
    ]);
    exit;
}

// Obtener datos anteriores para la bitácora
$sql_anterior = "SELECT nombre, correo, id_rol, estado FROM usuario WHERE id_usuario = ?";
$stmt_anterior = $conn->prepare($sql_anterior);
$stmt_anterior->bind_param("i", $id);
$stmt_anterior->execute();
$result_anterior = $stmt_anterior->get_result();
$usuario_anterior = $result_anterior->fetch_assoc();
$stmt_anterior->close();

// Preparar y ejecutar consulta
try {
    $sql = "UPDATE usuario SET nombre=?, correo=?, id_rol=?, estado=? WHERE id_usuario=?";
    error_log("Ejecutando SQL: $sql");
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }
    
    $stmt->bind_param("ssisi", $nombre, $correo, $rol, $estado, $id);
    
    if ($stmt->execute()) {
        $filasAfectadas = $stmt->affected_rows;
        error_log("Filas afectadas: $filasAfectadas");
        
        if ($filasAfectadas > 0) {
            // ✅ REGISTRAR EN BITÁCORA - ACTUALIZACIÓN DE USUARIO
            $cambios = [];
            
            if ($usuario_anterior['nombre'] !== $nombre) {
                $cambios[] = "Nombre: {$usuario_anterior['nombre']} → $nombre";
            }
            if ($usuario_anterior['correo'] !== $correo) {
                $cambios[] = "Correo: {$usuario_anterior['correo']} → $correo";
            }
            if ($usuario_anterior['id_rol'] != $rol) {
                $rol_anterior = ($usuario_anterior['id_rol'] == 1) ? 'Administrador' : 'Empleado';
                $rol_nuevo = ($rol == 1) ? 'Administrador' : 'Empleado';
                $cambios[] = "Rol: $rol_anterior → $rol_nuevo";
            }
            if ($usuario_anterior['estado'] !== $estado) {
                $cambios[] = "Estado: {$usuario_anterior['estado']} → $estado";
            }
            
            $descripcion = "Usuario actualizado: $nombre";
            if (!empty($cambios)) {
                $descripcion .= " - Cambios: " . implode(", ", $cambios);
            }
            
            registrarEnBitacora(
                'UPDATE',
                $descripcion,
                'usuario',
                $id,
                'Usuarios'
            );
            
            echo json_encode([
                "status" => "success",
                "mensaje" => "Usuario actualizado correctamente"
            ]);
        } else {
            echo json_encode([
                "status" => "info", 
                "mensaje" => "No se realizaron cambios en el usuario (posiblemente los datos son iguales)"
            ]);
        }
    } else {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Excepción: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "mensaje" => "Error interno del servidor: " . $e->getMessage()
    ]);
}

$conn->close();
?>
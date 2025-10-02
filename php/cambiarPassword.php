<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Habilitar errores para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar método
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode(["status" => "error", "mensaje" => "Método no permitido"]);
    exit;
}

// Incluir conexión
include "conexion.php";

// Verificar si la conexión se estableció
if (!$conn) {
    echo json_encode(["status" => "error", "mensaje" => "Error de conexión a la base de datos"]);
    exit;
}

// Verificar sesión - solo necesitamos el correo
if (!isset($_SESSION['usuario_correo'])) {
    echo json_encode(["status" => "error", "mensaje" => "Sesión no válida. Por favor, inicie sesión nuevamente."]);
    exit;
}

// Obtener datos
$password_actual = $_POST['actualContrasena'] ?? '';
$nueva_password = $_POST['nuevaContrasena'] ?? '';
$confirmar_password = $_POST['confirmarContrasena'] ?? '';

// Validaciones básicas
if (empty($password_actual) || empty($nueva_password) || empty($confirmar_password)) {
    echo json_encode(["status" => "error", "mensaje" => "Todos los campos son obligatorios"]);
    exit;
}

if ($nueva_password !== $confirmar_password) {
    echo json_encode(["status" => "error", "mensaje" => "Las nuevas contraseñas no coinciden"]);
    exit;
}

if ($password_actual === $nueva_password) {
    echo json_encode(["status" => "error", "mensaje" => "La nueva contraseña debe ser diferente a la actual"]);
    exit;
}

if (strlen($nueva_password) < 6) {
    echo json_encode(["status" => "error", "mensaje" => "La nueva contraseña debe tener al menos 6 caracteres"]);
    exit;
}

// Solo necesitamos el correo (es único)
$correo = $_SESSION['usuario_correo'];

try {
    // Buscar usuario solo por correo
    $stmt = $conn->prepare("SELECT id_usuario, contrasena, estado FROM usuario WHERE correo = ?");
    
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conn->error);
    }
    
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "mensaje" => "Usuario no encontrado"]);
        exit;
    }

    $usuario = $result->fetch_assoc();
    $contrasena_actual_hash = $usuario['contrasena'];
    $estado = $usuario['estado'];

    // Verificar si la cuenta está activa
    if ($estado === 'Inactivo') {
        echo json_encode(["status" => "error", "mensaje" => "Tu cuenta está inactiva. No puedes cambiar la contraseña."]);
        exit;
    }

    // Verificar contraseña actual
    if (!password_verify($password_actual, $contrasena_actual_hash)) {
        echo json_encode(["status" => "error", "mensaje" => "La contraseña actual es incorrecta"]);
        exit;
    }

    // Encriptar nueva contraseña
    $nueva_password_hash = password_hash($nueva_password, PASSWORD_DEFAULT);

    // Actualizar en base de datos usando solo el correo
    $stmt = $conn->prepare("UPDATE usuario SET contrasena = ? WHERE correo = ?");
    
    if (!$stmt) {
        throw new Exception("Error preparando update: " . $conn->error);
    }
    
    $stmt->bind_param("ss", $nueva_password_hash, $correo);
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success", 
            "mensaje" => "Contraseña cambiada correctamente"
        ]);
    } else {
        throw new Exception("Error ejecutando update: " . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Error en cambiarPassword: " . $e->getMessage());
    echo json_encode([
        "status" => "error", 
        "mensaje" => "Error en el servidor. Intente nuevamente."
    ]);
}

$conn->close();
?>
<?php
// Archivo temporal para debug
session_start();
header('Content-Type: application/json; charset=utf-8');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simular datos de sesión para testing
$_SESSION['usuario_id'] = 1;
$_SESSION['usuario_correo'] = 'tu_correo@ejemplo.com';

include "conexion.php";

// Datos de prueba
$_POST = [
    'actualContrasena' => 'password_actual',
    'nuevaContrasena' => 'nueva_password123',
    'confirmarContrasena' => 'nueva_password123'
];

try {
    // Tu código de cambiarPassword aquí...
    $id_usuario = $_SESSION['usuario_id'];
    $correo = $_SESSION['usuario_correo'];
    
    echo json_encode([
        "status" => "success",
        "mensaje" => "Conexión funcionando - ID: $id_usuario, Correo: $correo"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "Error: " . $e->getMessage()
    ]);
}
?>
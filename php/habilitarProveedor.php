<?php
include "conexion.php";
include "bitacora_helper.php";

// Obtener datos del usuario desde el POST
$id_usuario = $_POST['id_usuario'] ?? null;
$nombre_usuario = $_POST['nombre_usuario'] ?? 'Sistema';

if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

// Obtener datos del proveedor antes de habilitar
$sql_select = "SELECT nombre, telefono, correo FROM proveedor WHERE id_proveedor = $id";
$result_select = mysqli_query($conn, $sql_select);
$proveedor = mysqli_fetch_assoc($result_select);

$sql = "UPDATE proveedor SET estado = 'Activo' WHERE id_proveedor = $id";
if (mysqli_query($conn, $sql)) {
    // REGISTRAR EN BITÁCORA - Establecer sesión temporal
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if ($id_usuario && $nombre_usuario) {
        $_SESSION['usuario_id'] = $id_usuario;
        $_SESSION['usuario_nombre'] = $nombre_usuario;
    }
    
    $descripcion = "Proveedor habilitado: {$proveedor['nombre']} - Tel: {$proveedor['telefono']} - Correo: {$proveedor['correo']}";
    registrarEnBitacora('EDITAR', $descripcion, 'proveedor', $id, 'Proveedores');
    
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor habilitado correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo habilitar"]);
}
exit;
?>
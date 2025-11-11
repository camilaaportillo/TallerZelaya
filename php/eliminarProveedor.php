<?php
include "conexion.php";
include "bitacora_helper.php";

// Obtener datos del usuario desde el POST
$id_usuario = $_POST['id_usuario'] ?? null;
$nombre_usuario = $_POST['nombre_usuario'] ?? 'Sistema';

$id = $_POST['id'];

// Obtener datos del proveedor antes de eliminar
$sql_select = "SELECT nombre, telefono, correo FROM proveedor WHERE id_proveedor = '$id'";
$result_select = mysqli_query($conn, $sql_select);
$proveedor = mysqli_fetch_assoc($result_select);

$sql = "UPDATE `proveedor` SET `estado` = 'Inactivo' WHERE `proveedor`.`id_proveedor` ='$id'";

if (mysqli_query($conn, $sql)) {
    // REGISTRAR EN BITÁCORA - Establecer sesión temporal
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if ($id_usuario && $nombre_usuario) {
        $_SESSION['usuario_id'] = $id_usuario;
        $_SESSION['usuario_nombre'] = $nombre_usuario;
    }
    
    $descripcion = "Proveedor desactivado: {$proveedor['nombre']} - Tel: {$proveedor['telefono']} - Correo: {$proveedor['correo']}";
    registrarEnBitacora('ELIMINAR', $descripcion, 'proveedor', $id, 'Proveedores');
    
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor eliminado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}
exit;
?>
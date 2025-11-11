<?php
include "conexion.php";
include "bitacora_helper.php";

// Obtener datos del usuario desde el POST
$id_usuario = $_POST['id_usuario'] ?? null;
$nombre_usuario = $_POST['nombre_usuario'] ?? 'Sistema';

$id = $_POST['id'];
$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];
$id_empresa = $_POST['id_empresa'];

// Obtener datos antiguos para la bitácora
$sql_old = "SELECT nombre, telefono, correo, id_empresa FROM proveedor WHERE id_proveedor = '$id'";
$result_old = mysqli_query($conn, $sql_old);
$proveedor_old = mysqli_fetch_assoc($result_old);

$sql = "UPDATE `proveedor` 
        SET `nombre` = '$nombre', 
            `telefono` = '$telefono', 
            `correo` = '$correo', 
            `id_empresa` = '$id_empresa' 
        WHERE `id_proveedor` = '$id'";

header('Content-Type: application/json');

if (mysqli_query($conn, $sql)) {
    // REGISTRAR EN BITÁCORA - Establecer sesión temporal
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if ($id_usuario && $nombre_usuario) {
        $_SESSION['usuario_id'] = $id_usuario;
        $_SESSION['usuario_nombre'] = $nombre_usuario;
    }
    
    $descripcion = "Proveedor actualizado: $nombre - Tel: $telefono - Correo: $correo";
    registrarEnBitacora('ACTUALIZAR', $descripcion, 'proveedor', $id, 'Proveedores');
    
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor actualizado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}

exit;
?>
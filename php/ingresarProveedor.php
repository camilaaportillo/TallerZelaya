<?php
include "conexion.php";
include "bitacora_helper.php";

// Obtener datos del usuario desde el POST
$id_usuario = $_POST['id_usuario'] ?? null;
$nombre_usuario = $_POST['nombre_usuario'] ?? 'Sistema';

$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];
$id_empresa = $_POST['id_empresa'];

$sql = "INSERT INTO `proveedor` (`nombre`, `telefono`, `estado`, `correo`, `id_empresa`) 
        VALUES ('$nombre', '$telefono', 'Activo', '$correo', '$id_empresa')";

if (mysqli_query($conn, $sql)) {
    $nuevo_id = mysqli_insert_id($conn);
    
    // REGISTRAR EN BITÁCORA - Establecer sesión temporal
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if ($id_usuario && $nombre_usuario) {
        $_SESSION['usuario_id'] = $id_usuario;
        $_SESSION['usuario_nombre'] = $nombre_usuario;
    }
    
    $descripcion = "Proveedor creado: $nombre - Tel: $telefono - Correo: $correo";
    registrarEnBitacora('INSERTAR', $descripcion, 'proveedor', $nuevo_id, 'Proveedores');
    
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor registrado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}

exit;
?>
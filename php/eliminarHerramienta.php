<?php
include "conexion.php";
include "bitacora_helper.php";

// Obtener datos del usuario desde el POST
$id_usuario = $_POST['id_usuario'] ?? null;
$nombre_usuario = $_POST['nombre_usuario'] ?? 'Sistema';

$id = intval($_POST['id']);

// Primero obtener los datos de la herramienta para la bitácora
$sql_select = "SELECT nombre, imagen_path FROM herramienta WHERE id_herramienta = $id";
$result = $conn->query($sql_select);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $nombre_herramienta = $row['nombre'];
    $imagen_path = $row['imagen_path'];
    
    // Eliminar la imagen si existe
    if ($imagen_path && file_exists("../" . $imagen_path)) {
        unlink("../" . $imagen_path);
    }

    // Ahora eliminar la herramienta
    $sql = "DELETE FROM herramienta WHERE id_herramienta = $id";

    if (mysqli_query($conn, $sql)) {
        // REGISTRAR EN BITÁCORA - Establecer sesión temporal
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if ($id_usuario && $nombre_usuario) {
            $_SESSION['usuario_id'] = $id_usuario;
            $_SESSION['usuario_nombre'] = $nombre_usuario;
        }
        
        $descripcion = "Herramienta eliminada: $nombre_herramienta";
        registrarEnBitacora('ELIMINAR', $descripcion, 'herramienta', $id, 'Herramientas');
        
        echo json_encode(["status" => "exito", "mensaje" => "Herramienta eliminada correctamente."]);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
    }
} else {
    echo json_encode(["status" => "error", "mensaje" => "Herramienta no encontrada."]);
}

$conn->close();
?>
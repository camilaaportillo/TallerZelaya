<?php
include "conexion.php";
include "bitacora_helper.php";

// Obtener datos del usuario desde el POST
$id_usuario = $_POST['id_usuario'] ?? null;
$nombre_usuario = $_POST['nombre_usuario'] ?? 'Sistema';

$id = intval($_POST['id']);

// Primero obtener los datos del repuesto para la bitácora
$sql_select = "SELECT codigo, nombre, imagen_path FROM repuesto WHERE id_repuesto = $id";
$result = $conn->query($sql_select);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $codigo_repuesto = $row['codigo'];
    $nombre_repuesto = $row['nombre'];
    $imagen_path = $row['imagen_path'];
    
    // Eliminar la imagen si existe
    if ($imagen_path && file_exists("../" . $imagen_path)) {
        unlink("../" . $imagen_path);
    }

    // Ahora eliminar el repuesto
    $sql = "DELETE FROM repuesto WHERE id_repuesto = $id";

    if (mysqli_query($conn, $sql)) {
        // REGISTRAR EN BITÁCORA - Establecer sesión temporal
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if ($id_usuario && $nombre_usuario) {
            $_SESSION['usuario_id'] = $id_usuario;
            $_SESSION['usuario_nombre'] = $nombre_usuario;
        }
        
        $descripcion = "Repuesto eliminado: $codigo_repuesto - $nombre_repuesto";
        registrarEnBitacora('ELIMINAR', $descripcion, 'repuesto', $id, 'Repuestos');
        
        echo json_encode(["status" => "exito", "mensaje" => "Repuesto eliminado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
    }
} else {
    echo json_encode(["status" => "error", "mensaje" => "Repuesto no encontrado."]);
}

$conn->close();
?>
<?php
include "conexion.php";

$id = intval($_POST['id']);

// Primero obtener la ruta de la imagen para eliminarla
$sql_select = "SELECT imagen_path FROM herramienta WHERE id_herramienta = $id";
$result = $conn->query($sql_select);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $imagen_path = $row['imagen_path'];
    
    // Eliminar la imagen si existe
    if ($imagen_path && file_exists("../" . $imagen_path)) {
        unlink("../" . $imagen_path);
    }
}

// Ahora eliminar la herramienta
$sql = "DELETE FROM herramienta WHERE id_herramienta = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Herramienta eliminada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}

$conn->close();
?>
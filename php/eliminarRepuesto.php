<?php
include "conexion.php";

$id = intval($_POST['id']);

// Primero obtener la ruta de la imagen para eliminarla
$sql_select = "SELECT imagen_path FROM repuesto WHERE id_repuesto = $id";
$result = $conn->query($sql_select);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $imagen_path = $row['imagen_path'];
    
    // Eliminar la imagen si existe
    if ($imagen_path && file_exists("../" . $imagen_path)) {
        unlink("../" . $imagen_path);
    }
}

// Ahora eliminar el repuesto
$sql = "DELETE FROM repuesto WHERE id_repuesto = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Repuesto eliminado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}

$conn->close();
?>
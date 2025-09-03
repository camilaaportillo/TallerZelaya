<?php
include "conexion.php";

// Verificar que se reciba el ID
if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

// Actualizar el estado de la marca a Activo
$sql = "UPDATE `marca` SET `estado` = 'Activo' WHERE `id_marca` = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode([
        "status" => "exito",
        "mensaje" => "Marca habilitada correctamente"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No se pudo habilitar la marca: " . $conn->error
    ]);
}

$conn->close();
exit;
?>

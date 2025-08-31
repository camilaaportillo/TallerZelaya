
<?php
include "conexion.php"; // tu archivo de conexión

$id = $_POST['id'];

// Eliminación lógica: cambiamos estado a 'Inactivo'
$sql = "UPDATE `marca` SET `estado` = 'Inactivo' WHERE `marca`.`id_marca` = $id";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(["status" => "exito", "mensaje" => "Marca eliminada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al eliminar: " . $conn->error]);
}

exit;
?>

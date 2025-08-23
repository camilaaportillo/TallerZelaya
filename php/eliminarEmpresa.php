<?php
include "conexion.php"; // tu archivo de conexión

$id = $_POST['id'];

$sql = "UPDATE `empresa` SET `estado` = 'Inactivo' WHERE `empresa`.`id_empresa` = $id";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(["status" => "exito", "mensaje" => "Empresa eliminada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al eliminar: " . $conn->error]);
}

exit;
?>

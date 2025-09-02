<?php
include "conexion.php";

if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

$sql = "UPDATE `marca` SET `estado` = 'Activo' WHERE `id_marca` = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Marca habilitada correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo habilitar"]);
}
exit;
?>

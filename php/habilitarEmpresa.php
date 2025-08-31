<?php
include "conexion.php";

if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

$sql = "UPDATE `empresa` SET `estado` = 'Activo' WHERE `empresa`.`id_empresa` = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Empresa habilitado correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo habilitar"]);
}
exit;
?>
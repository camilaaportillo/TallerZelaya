<?php
include "conexion.php";

if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

$sql = "UPDATE proveedor SET estado = 1 WHERE id_proveedor = $id";
if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor habilitado correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo habilitar"]);
}
exit;
?>

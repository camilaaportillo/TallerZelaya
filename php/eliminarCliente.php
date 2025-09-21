<?php
include "conexion.php";

// Validar que llegue el id
if (!isset($_POST['id_cliente'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID de cliente no recibido"]);
    exit;
}

$id = intval($_POST['id_cliente']);

// Cambiar estado a Inactivo
$sql = "UPDATE cliente SET estado = 'Inactivo' WHERE id_cliente = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Cliente dado de baja correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo dar de baja"]);
}

exit;
?>

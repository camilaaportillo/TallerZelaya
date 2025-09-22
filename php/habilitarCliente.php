<?php
header('Content-Type: application/json; charset=utf-8');
include "conexion.php";

if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

// Ajusta 'clientes' si tu tabla tiene otro nombre
$sql = "UPDATE cliente SET estado = 1 WHERE id_cliente = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode([
        "status" => "exito",
        "mensaje" => "Cliente habilitado correctamente"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No se pudo habilitar el cliente: " . $conn->error
    ]);
}

$conn->close();
exit;
?>

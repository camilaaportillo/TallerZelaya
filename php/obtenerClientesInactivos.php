<?php
// mostrar errores en desarrollo (quitar en producción)
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
include "conexion.php";

// Ajusta el nombre de la tabla si tu DB la llama distinto
$sql = "SELECT id_cliente, nombre, telefono, correo, estado
        FROM cliente
        WHERE estado = 0
        ORDER BY nombre ASC";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["status" => "error", "mensaje" => "Error en la consulta: " . mysqli_error($conn)]);
    exit;
}

$clientes = [];
while ($row = mysqli_fetch_assoc($result)) {
    $clientes[] = $row;
}

echo json_encode($clientes, JSON_UNESCAPED_UNICODE);
$conn->close();
exit;
?>

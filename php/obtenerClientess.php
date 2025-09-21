<?php
include "conexion.php";

// Consulta clientes activos
$sql = "SELECT id_cliente, nombre, telefono, correo, estado 
        FROM cliente 
        WHERE estado = 1
        ORDER BY nombre ASC";

$result = mysqli_query($conn, $sql);

$clientes = [];

while($row = mysqli_fetch_assoc($result)) {
    $clientes[] = $row;
}

echo json_encode($clientes);
?>

<?php
include "conexion.php";

$sql = "SELECT * FROM `marca`
        WHERE estado = 'Activo'
        ORDER BY nombre ASC";

$result = $conn->query($sql);

$marcas = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $marcas[] = $row;
    }
}

echo json_encode($marcas, JSON_UNESCAPED_UNICODE);

$conn->close();
?>


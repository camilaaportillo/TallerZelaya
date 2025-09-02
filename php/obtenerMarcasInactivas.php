<?php
include "conexion.php";

$sql = "SELECT * FROM `marca` WHERE `estado` = 'Inactivo'";
$result = $conn->query($sql);

$marcas = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $marcas[] = $row;
    }
}

echo json_encode($marcas, JSON_UNESCAPED_UNICODE);

$conn->close();
?>

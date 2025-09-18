<?php
include "conexion.php";

$sql = "SELECT * FROM `medida`";

$result = $conn->query($sql);

$medidas = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $medidas[] = $row;
    }
}

echo json_encode($medidas, JSON_UNESCAPED_UNICODE);

$conn->close();
?>
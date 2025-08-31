<?php
include "conexion.php";

$sql = "SELECT * FROM `empresa` WHERE `empresa`.`estado`= 2;";
$result = $conn->query($sql);

$empresas = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $empresas[] = $row;
    }
}

echo json_encode($empresas, JSON_UNESCAPED_UNICODE);

$conn->close();
?>

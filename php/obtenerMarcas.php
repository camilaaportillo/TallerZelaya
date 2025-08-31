<?php
include "conexion.php";

$sql = "SELECT * FROM `marca` 
        ORDER BY CASE 
                    WHEN estado='Activo' THEN 1
                    WHEN estado='Inactivo' THEN 2
                    ELSE 3
                 END, nombre ASC";

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

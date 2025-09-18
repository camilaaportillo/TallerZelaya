<?php
include "conexion.php";

$sql = "SELECT r.codigo, r.id_repuesto, r.nombre, r.descripcion, r.stock_minimo, m.nombre as marca, me.medida_bicicleta as medida
        FROM repuesto r
        INNER JOIN marca m ON r.id_marca = m.id_marca
        INNER JOIN medida me ON r.id_medida = me.id_medida";

$result = $conn->query($sql);

$repuestos = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $repuestos[] = $row;
    }
}

echo json_encode($repuestos, JSON_UNESCAPED_UNICODE);

$conn->close();
?>
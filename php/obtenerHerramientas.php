<?php
include "conexion.php";

header('Content-Type: application/json; charset=utf-8');

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(["error" => "Error de conexión: " . $conn->connect_error]);
    exit;
}

$sql = "SELECT h.id_herramienta, h.nombre, h.descripcion, h.stock_actual, 
               h.imagen_path, h.id_marca, h.id_medida,
               m.nombre as marca, me.medida_bicicleta as medida
        FROM herramienta h
        INNER JOIN marca m ON h.id_marca = m.id_marca
        INNER JOIN medida me ON h.id_medida = me.id_medida
        ORDER BY h.nombre";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => "Error en consulta: " . $conn->error]);
    $conn->close();
    exit;
}

$herramientas = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $herramientas[] = $row;
    }
}

// Limpiar el buffer de salida por si hay espacios
if (ob_get_length()) {
    ob_clean();
}

echo json_encode($herramientas, JSON_UNESCAPED_UNICODE);

$conn->close();
exit; // Asegurar que no se envíe nada después
?>
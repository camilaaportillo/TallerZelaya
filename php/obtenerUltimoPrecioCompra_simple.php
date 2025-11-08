<?php
header('Content-Type: application/json; charset=utf-8');

// Respuesta simple de prueba
$id_repuesto = isset($_GET['id_repuesto']) ? intval($_GET['id_repuesto']) : 0;

if ($id_repuesto > 0) {
    echo json_encode([
        'success' => true,
        'ultimo_precio_compra' => 25.75,
        'fecha_compra' => '2024-01-20',
        'message' => 'Datos de prueba - ID: ' . $id_repuesto
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'ID de repuesto no válido'
    ]);
}
?>
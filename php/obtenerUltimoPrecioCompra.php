<?php
// php/obtenerUltimoPrecioCompra.php - VERSIÓN FINAL
header('Content-Type: application/json; charset=utf-8');

// Deshabilitar errores para el usuario
error_reporting(0);

$response = [];

try {
    // 1. Verificar parámetro
    if (!isset($_GET['id_repuesto']) || empty($_GET['id_repuesto'])) {
        throw new Exception("ID de repuesto no proporcionado");
    }
    
    $id_repuesto = intval($_GET['id_repuesto']);
    if ($id_repuesto <= 0) {
        throw new Exception("ID de repuesto inválido");
    }
    
    // 2. Incluir conexión
    if (!file_exists('conexion.php')) {
        throw new Exception("Archivo de conexión no encontrado");
    }
    
    require_once 'conexion.php';
    
    // 3. Verificar conexión
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos");
    }
    
    // 4. Consulta SQL - Buscar el último precio de compra
    $sql = "SELECT dc.precioUnitario, c.fecha 
            FROM detallescompra dc
            INNER JOIN compra c ON dc.id_compra = c.id_compra
            WHERE dc.id_repuesto = ?
            ORDER BY c.fecha DESC, c.id_compra DESC
            LIMIT 1";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id_repuesto);
    
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando la consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $response = [
            'success' => true,
            'ultimo_precio_compra' => floatval($row['precioUnitario']),
            'fecha_compra' => $row['fecha']
        ];
    } else {
        $response = [
            'success' => true,
            'ultimo_precio_compra' => null,
            'message' => 'No hay compras registradas para este repuesto'
        ];
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => $e->getMessage()
    ];
}

// Enviar respuesta
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
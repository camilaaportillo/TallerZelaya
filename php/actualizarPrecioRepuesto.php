<?php
include "conexion.php";

// Agregar headers para CORS y JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'mensaje' => 'Método no permitido']);
    exit;
}

// Log para debug
error_log("Solicitud recibida en actualizarPrecioRepuesto.php");

try {
    $input = file_get_contents('php://input');
    error_log("Datos recibidos: " . $input);
    
    $datos = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    $id_repuesto = $datos['id_repuesto'] ?? null;
    $nuevo_precio = $datos['nuevo_precio'] ?? null;
    $motivo = $datos['motivo'] ?? 'Ajuste desde inventario';
    
    error_log("ID Repuesto: " . $id_repuesto . ", Nuevo Precio: " . $nuevo_precio);
    
    if (!$id_repuesto || !$nuevo_precio) {
        echo json_encode(['status' => 'error', 'mensaje' => 'Datos incompletos']);
        exit;
    }
    
    if ($nuevo_precio <= 0) {
        echo json_encode(['status' => 'error', 'mensaje' => 'El precio debe ser mayor a 0']);
        exit;
    }
    
    // Verificar que el repuesto existe
    $stmt = $conn->prepare("SELECT nombre, precio FROM repuesto WHERE id_repuesto = ?");
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id_repuesto);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'mensaje' => "Repuesto con ID $id_repuesto no encontrado en la base de datos"]);
    exit;
}
    
    $repuesto = $result->fetch_assoc();
    $precio_anterior = $repuesto['precio'];
    
    error_log("Precio anterior: " . $precio_anterior);
    
    // Actualizar el precio
    $stmt = $conn->prepare("UPDATE repuesto SET precio = ? WHERE id_repuesto = ?");
    if (!$stmt) {
        throw new Exception("Error preparando update: " . $conn->error);
    }
    
    $stmt->bind_param("di", $nuevo_precio, $id_repuesto);
    
    if ($stmt->execute()) {
        error_log("Precio actualizado exitosamente");
        echo json_encode([
            'status' => 'success', 
            'mensaje' => "Precio actualizado correctamente de $$precio_anterior a $$nuevo_precio"
        ]);
    } else {
        throw new Exception("Error al actualizar precio: " . $stmt->error);
    }
    
} catch (Exception $e) {
    error_log("Error en actualizarPrecioRepuesto: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'mensaje' => 'Error en el servidor: ' . $e->getMessage()]);
}


$conn->close();
?>
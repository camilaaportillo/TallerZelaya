<?php
// Limpiar buffer
while (ob_get_level()) {
    ob_end_clean();
}

header('Content-Type: application/json');

try {
    require_once 'conexion_mysqli.php'; // Usar MySQLi
    
    $id_venta = $_GET['id_venta'] ?? '';
    
    if (empty($id_venta)) {
        throw new Exception('ID de venta no proporcionado');
    }
    
    $conn = conexionMysqli();
    
    $sql = "SELECT c.correo, c.nombre as cliente_nombre
            FROM venta v 
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente 
            WHERE v.id_venta = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_venta);
    $stmt->execute();
    $result = $stmt->get_result();
    $resultado = $result->fetch_assoc();
    
    if ($resultado) {
        if (!empty($resultado['correo'])) {
            echo json_encode([
                'success' => true, 
                'correo' => $resultado['correo'],
                'cliente_nombre' => $resultado['cliente_nombre'],
                'message' => 'Correo encontrado'
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'correo' => '',
                'cliente_nombre' => $resultado['cliente_nombre'],
                'message' => 'El cliente ' . $resultado['cliente_nombre'] . ' no tiene correo electrónico registrado'
            ]);
        }
    } else {
        throw new Exception('No se encontró la venta o el cliente');
    }
    
} catch (Exception $e) {
    // Limpiar buffer antes de error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
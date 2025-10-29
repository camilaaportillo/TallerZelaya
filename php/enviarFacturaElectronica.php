<?php
// Limpiar cualquier buffer de salida
while (ob_get_level()) {
    ob_end_clean();
}

header('Content-Type: application/json');

try {
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener datos JSON
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    if (!$input) {
        throw new Exception('No se recibieron datos');
    }
    
    $id_venta = $input['id_venta'] ?? '';
    $correo_destino = $input['correo'] ?? '';
    
    if (empty($id_venta) || empty($correo_destino)) {
        throw new Exception('Datos incompletos');
    }
    
    // Incluir archivos
    require_once 'conexion_mysqli.php'; // Usar MySQLi
    require_once 'config_email.php';
    
    $conn = conexionMysqli();
    
    // Obtener datos de la venta
    $sql_venta = "SELECT v.id_venta, v.fecha, v.total, 
                         c.nombre as cliente_nombre, c.correo as cliente_correo,
                         u.nombre as usuario_nombre
                  FROM venta v 
                  INNER JOIN cliente c ON v.id_cliente = c.id_cliente 
                  INNER JOIN usuario u ON v.id_usuario = u.id_usuario 
                  WHERE v.id_venta = ?";
    
    $stmt = $conn->prepare($sql_venta);
    $stmt->bind_param("i", $id_venta);
    $stmt->execute();
    $result = $stmt->get_result();
    $venta = $result->fetch_assoc();
    
    if (!$venta) {
        throw new Exception('Venta no encontrada');
    }
    
    // Obtener productos
    $sql_productos = "SELECT dv.cantidad, dv.subtotal,
                             r.nombre, r.codigo, r.precio as precio_unitario
                      FROM detalleventa dv
                      INNER JOIN repuesto r ON dv.id_repuesto = r.id_repuesto
                      WHERE dv.id_venta = ?";
    
    $stmt_productos = $conn->prepare($sql_productos);
    $stmt_productos->bind_param("i", $id_venta);
    $stmt_productos->execute();
    $result_productos = $stmt_productos->get_result();
    $productos = $result_productos->fetch_all(MYSQLI_ASSOC);
    
    // Obtener servicios
    $sql_servicios = "SELECT descripcion, cantidad, precio, subtotal
                      FROM servicios_venta 
                      WHERE id_venta = ?";
    
    $stmt_servicios = $conn->prepare($sql_servicios);
    $stmt_servicios->bind_param("i", $id_venta);
    $stmt_servicios->execute();
    $result_servicios = $stmt_servicios->get_result();
    $servicios = $result_servicios->fetch_all(MYSQLI_ASSOC);
    
    // Preparar datos para la factura
    $datos_factura = [
        'id_venta' => $venta['id_venta'],
        'fecha' => $venta['fecha'],
        'total' => $venta['total'],
        'cliente_nombre' => $venta['cliente_nombre'],
        'usuario_nombre' => $venta['usuario_nombre'],
        'productos' => $productos,
        'servicios' => $servicios
    ];
    
    // Usar ConfigEmail para enviar la factura
    $mailer = new ConfigEmail();
    $enviado = $mailer->enviarFacturaElectronica(
        $correo_destino,
        $venta['cliente_nombre'],
        $datos_factura
    );
    
    if ($enviado) {
        echo json_encode([
            'success' => true, 
            'message' => 'Factura enviada correctamente a ' . $correo_destino
        ]);
    } else {
        throw new Exception('No se pudo enviar el correo. Por favor, intente más tarde.');
    }
    
} catch (Exception $e) {
    // Limpiar buffer antes de enviar error
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    error_log("Error en enviarFactura: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar la factura: ' . $e->getMessage()
    ]);
}
?>
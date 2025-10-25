<?php
header('Content-Type: application/json');
include 'conexion.php';

$response = array('success' => false, 'detalle' => array());

try {
    $id_venta = $_GET['id_venta'] ?? 0;

    if (!$id_venta) {
        throw new Exception('ID de venta no especificado');
    }

    // Obtener información general de la venta
    $sqlVenta = "SELECT v.*, c.nombre as cliente_nombre, u.nombre as usuario_nombre
                 FROM venta v
                 LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
                 INNER JOIN usuario u ON v.id_usuario = u.id_usuario
                 WHERE v.id_venta = ?";
    
    $stmtVenta = $conn->prepare($sqlVenta);
    $stmtVenta->bind_param("i", $id_venta);
    $stmtVenta->execute();
    $resultVenta = $stmtVenta->get_result();
    
    if ($resultVenta->num_rows === 0) {
        throw new Exception('Venta no encontrada');
    }

    $venta = $resultVenta->fetch_assoc();
    $stmtVenta->close();

    // Obtener productos de la venta
    $sqlProductos = "SELECT dv.cantidad, dv.subtotal, r.nombre, r.codigo, r.precio as precio_unitario
                     FROM detalleventa dv
                     INNER JOIN repuesto r ON dv.id_repuesto = r.id_repuesto
                     WHERE dv.id_venta = ? AND dv.id_repuesto != 0";
    
    $stmtProductos = $conn->prepare($sqlProductos);
    $stmtProductos->bind_param("i", $id_venta);
    $stmtProductos->execute();
    $resultProductos = $stmtProductos->get_result();

    $productos = array();
    while ($row = $resultProductos->fetch_assoc()) {
        $productos[] = $row;
    }
    $stmtProductos->close();

    // Obtener servicios/reparaciones de la venta
    $sqlServicios = "SELECT descripcion, cantidad, precio, subtotal
                     FROM servicios_venta 
                     WHERE id_venta = ?";
    
    $stmtServicios = $conn->prepare($sqlServicios);
    $stmtServicios->bind_param("i", $id_venta);
    $stmtServicios->execute();
    $resultServicios = $stmtServicios->get_result();

    $servicios = array();
    while ($row = $resultServicios->fetch_assoc()) {
        $servicios[] = $row;
    }
    $stmtServicios->close();

    $response['success'] = true;
    $response['detalle'] = array(
        'venta' => $venta,
        'productos' => $productos,
        'servicios' => $servicios
    );

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>
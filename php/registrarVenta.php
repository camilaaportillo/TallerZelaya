<?php
header('Content-Type: application/json');
include 'conexion.php';

$response = array('success' => false, 'message' => '', 'id_venta' => null);

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Datos inválidos');
    }

    // 1. Registrar la venta principal
    $sqlVenta = "INSERT INTO venta (fecha, total, id_usuario, id_cliente, estado) 
                 VALUES (?, ?, ?, ?, 'Activa')";
    $stmt = $conn->prepare($sqlVenta);
    $stmt->bind_param("sdii", 
        $data['fecha'],
        $data['total'],
        $data['id_usuario'],
        $data['id_cliente']
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Error al registrar venta: ' . $stmt->error);
    }
    
    $id_venta = $stmt->insert_id;
    $stmt->close();

    // 2. Registrar productos en detalleventa y actualizar stock
    if (isset($data['productos']) && is_array($data['productos'])) {
        foreach ($data['productos'] as $producto) {
            // Registrar detalle de venta
            $sqlDetalle = "INSERT INTO detalleventa (cantidad, subtotal, id_venta, id_repuesto) 
                           VALUES (?, ?, ?, ?)";
            $stmtDetalle = $conn->prepare($sqlDetalle);
            $stmtDetalle->bind_param("idii", 
                $producto['cantidad'],
                $producto['subtotal'],
                $id_venta,
                $producto['id_repuesto']
            );
            
            if (!$stmtDetalle->execute()) {
                throw new Exception('Error al registrar detalle: ' . $stmtDetalle->error);
            }
            $stmtDetalle->close();

            // Actualizar stock
            $sqlUpdateStock = "UPDATE repuesto 
                              SET stock_actual = stock_actual - ? 
                              WHERE id_repuesto = ? AND stock_actual >= ?";
            $stmtUpdate = $conn->prepare($sqlUpdateStock);
            $stmtUpdate->bind_param("iii", 
                $producto['cantidad'],
                $producto['id_repuesto'],
                $producto['cantidad']
            );
            
            if (!$stmtUpdate->execute()) {
                throw new Exception('Error al actualizar stock: ' . $stmtUpdate->error);
            }
            
            if ($stmtUpdate->affected_rows === 0) {
                throw new Exception("Stock insuficiente para el producto: {$producto['nombre']}");
            }
            $stmtUpdate->close();
        }
    }

    // 3. Registrar reparaciones
    if (isset($data['reparaciones']) && is_array($data['reparaciones'])) {
        foreach ($data['reparaciones'] as $reparacion) {
            $sqlDetalleReparacion = "INSERT INTO detalleventa (cantidad, subtotal, id_venta, id_repuesto) 
                                    VALUES (?, ?, ?, 0)";
            $stmtDetalleRep = $conn->prepare($sqlDetalleReparacion);
            $stmtDetalleRep->bind_param("idi", 
                $reparacion['cantidad'],
                $reparacion['subtotal'],
                $id_venta
            );
            
            if (!$stmtDetalleRep->execute()) {
                throw new Exception('Error al registrar reparación: ' . $stmtDetalleRep->error);
            }
            $stmtDetalleRep->close();
        }
    }

    $response['success'] = true;
    $response['message'] = 'Venta registrada correctamente';
    $response['id_venta'] = $id_venta;

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>
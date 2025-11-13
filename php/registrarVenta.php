<?php
// Limpiar cualquier buffer de salida
while (ob_get_level()) {
    ob_end_clean();
}

header('Content-Type: application/json');

// Incluir la conexión original por ahora para evitar problemas
include 'conexion.php';

$response = array('success' => false, 'message' => '', 'id_venta' => null);

try {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('No se recibieron datos');
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }
    
    if (!$data) {
        throw new Exception('Datos inválidos');
    }

    // Iniciar transacción para asegurar la integridad de los datos
    $conn->begin_transaction();

    try {
        // 1. Registrar la venta principal
        $sqlVenta = "INSERT INTO venta (fecha, total, id_usuario, id_cliente, estado) 
                     VALUES (?, ?, ?, ?, 'Activa')";
        $stmt = $conn->prepare($sqlVenta);
        if (!$stmt) {
            throw new Exception('Error al preparar venta: ' . $conn->error);
        }
        
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
                // Verificar stock primero
                $sqlCheckStock = "SELECT stock_actual FROM repuesto WHERE id_repuesto = ?";
                $stmtCheck = $conn->prepare($sqlCheckStock);
                $stmtCheck->bind_param("i", $producto['id_repuesto']);
                $stmtCheck->execute();
                $result = $stmtCheck->get_result();
                $stock = $result->fetch_assoc();
                $stmtCheck->close();
                
                if (!$stock || $stock['stock_actual'] < $producto['cantidad']) {
                    throw new Exception("Stock insuficiente para el producto: {$producto['nombre']}. Stock actual: " . ($stock['stock_actual'] ?? 0));
                }

                // Registrar detalle de venta
                $sqlDetalle = "INSERT INTO detalleventa (cantidad, subtotal, id_venta, id_repuesto) 
                               VALUES (?, ?, ?, ?)";
                $stmtDetalle = $conn->prepare($sqlDetalle);
                if (!$stmtDetalle) {
                    throw new Exception('Error al preparar detalle: ' . $conn->error);
                }
                
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
                                  WHERE id_repuesto = ?";
                $stmtUpdate = $conn->prepare($sqlUpdateStock);
                if (!$stmtUpdate) {
                    throw new Exception('Error al preparar actualización de stock: ' . $conn->error);
                }
                
                $stmtUpdate->bind_param("ii", 
                    $producto['cantidad'],
                    $producto['id_repuesto']
                );
                
                if (!$stmtUpdate->execute()) {
                    throw new Exception('Error al actualizar stock: ' . $stmtUpdate->error);
                }
                
                $stmtUpdate->close();
            }
        }

        // 3. Registrar reparaciones
        if (isset($data['reparaciones']) && is_array($data['reparaciones'])) {
            foreach ($data['reparaciones'] as $reparacion) {
                $sqlServicio = "INSERT INTO servicios_venta (descripcion, cantidad, precio, subtotal, id_venta) 
                            VALUES (?, ?, ?, ?, ?)";
                $stmtServicio = $conn->prepare($sqlServicio);
                if (!$stmtServicio) {
                    throw new Exception('Error al preparar servicio: ' . $conn->error);
                }
                
                $stmtServicio->bind_param("siddi", 
                    $reparacion['nombre'],
                    $reparacion['cantidad'],
                    $reparacion['precio'],
                    $reparacion['subtotal'],
                    $id_venta
                );
                
                if (!$stmtServicio->execute()) {
                    throw new Exception('Error al registrar servicio: ' . $stmtServicio->error);
                }
                $stmtServicio->close();
            }
        }

        // Confirmar transacción
        $conn->commit();

        // Registrar en bitácora manualmente después de la transacción
        registrarEnBitacoraManual($data, $id_venta);

        $response['success'] = true;
        $response['message'] = 'Venta registrada correctamente';
        $response['id_venta'] = $id_venta;

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    
    // Log del error para debugging
    error_log("Error en registrarVenta: " . $e->getMessage());
}

// Cerrar conexión si existe
if (isset($conn)) {
    $conn->close();
}

echo json_encode($response);
exit;

// Función para registrar en bitácora de forma manual
function registrarEnBitacoraManual($data, $id_venta) {
    try {
        $host = "localhost";
        $user = "root";
        $pass = "";
        $db   = "dbtallerb";
        
        $conn_bitacora = new mysqli($host, $user, $pass, $db);
        
        if ($conn_bitacora->connect_error) {
            return; // Silenciar error de bitácora
        }
        
        // Obtener información del usuario
        $usuario_id = $data['usuario_bitacora']['id'] ?? $data['id_usuario'] ?? null;
        $usuario_nombre = $data['usuario_bitacora']['nombre'] ?? 'Sistema';
        
        if (!$usuario_id) return;
        
        $ip_address = getClientIp();
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido';
        
        $descripcion = "Venta registrada #$id_venta - Total: $" . $data['total'];
        
        $sql = "INSERT INTO bitacora (id_usuario, nombre_usuario, accion, descripcion, tabla_afectada, ip_address, user_agent, modulo) 
                VALUES (?, ?, 'CREAR', ?, 'venta', ?, ?, 'Ventas')";
        
        $stmt = $conn_bitacora->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("issss", 
                $usuario_id,
                $usuario_nombre,
                $descripcion,
                $ip_address,
                $user_agent
            );
            $stmt->execute();
            $stmt->close();
        }
        
        $conn_bitacora->close();
        
    } catch (Exception $e) {
        // Silenciar errores de bitácora
        error_log("Error en bitácora manual: " . $e->getMessage());
    }
}

function getClientIp() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}
?>
<?php
header('Content-Type: application/json');
include 'conexion.php';

$response = array('success' => false, 'repuestos' => array());

try {
    $sql = "SELECT r.id_repuesto, r.codigo, r.nombre, r.descripcion, 
                   r.stock_minimo, r.stock_actual, r.precio, 
                   m.nombre as marca, md.medida_bicicleta as medida
            FROM repuesto r 
            INNER JOIN marca m ON r.id_marca = m.id_marca 
            INNER JOIN medida md ON r.id_medida = md.id_medida
            WHERE r.stock_actual > 0 AND m.estado = 'Activo'";
    
    $result = $conn->query($sql);
    
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $response['repuestos'][] = $row;
        }
        $response['success'] = true;
    } else {
        throw new Exception('Error en la consulta SQL: ' . $conn->error);
    }
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>
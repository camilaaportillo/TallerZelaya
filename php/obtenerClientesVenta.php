<?php
header('Content-Type: application/json');
include 'conexion.php';

$response = array('success' => false, 'clientes' => array());

try {
    $sql = "SELECT id_cliente, nombre, telefono, correo, estado FROM cliente WHERE estado = 1";
    $result = $conn->query($sql);
    
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $response['clientes'][] = $row;
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
<?php
header('Content-Type: application/json');
include 'conexion.php';

$response = array('success' => false, 'ventas' => array());

try {
    // Obtener parámetros de filtro
    $fecha_desde = $_GET['fecha_desde'] ?? '';
    $fecha_hasta = $_GET['fecha_hasta'] ?? '';
    $id_cliente = $_GET['id_cliente'] ?? '';

    // Construir consulta base
    $sql = "SELECT v.id_venta, v.fecha, v.total, v.estado,
                   c.nombre as cliente_nombre,
                   u.nombre as usuario_nombre
            FROM venta v
            LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
            INNER JOIN usuario u ON v.id_usuario = u.id_usuario
            WHERE 1=1";

    $params = array();
    $types = '';

    // Aplicar filtros
    if (!empty($fecha_desde)) {
        $sql .= " AND v.fecha >= ?";
        $params[] = $fecha_desde;
        $types .= 's';
    }

    if (!empty($fecha_hasta)) {
        $sql .= " AND v.fecha <= ?";
        $params[] = $fecha_hasta;
        $types .= 's';
    }

    if (!empty($id_cliente)) {
        $sql .= " AND v.id_cliente = ?";
        $params[] = $id_cliente;
        $types .= 'i';
    }

    $sql .= " ORDER BY v.fecha DESC, v.id_venta DESC";

    // Preparar y ejecutar consulta
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    $ventas = array();
    while ($row = $result->fetch_assoc()) {
        // Formatear datos
        $row['total_formateado'] = '$' . number_format($row['total'], 2);
        $row['cliente_nombre'] = $row['cliente_nombre'] ?: 'Consumidor Final';
        $ventas[] = $row;
    }

    $response['success'] = true;
    $response['ventas'] = $ventas;

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>
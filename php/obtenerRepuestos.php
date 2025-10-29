<?php
include "conexion.php";

// Verificar si es una solicitud POST con filtros
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Si viene con JSON en el body (para filtros)
    $input = file_get_contents('php://input');
    
    // Verificar si el input no está vacío
    if (empty($input)) {
        $input = [];
    } else {
        $input = json_decode($input, true);
        if ($input === null) {
            $input = [];
        }
    }
    
    $sql = "SELECT r.id_repuesto, r.codigo, r.nombre, r.descripcion, r.stock_minimo, r.stock_actual, 
                   r.precio, r.id_marca, r.id_medida,
                   m.nombre as marca, me.medida_bicicleta as medida
            FROM repuesto r
            INNER JOIN marca m ON r.id_marca = m.id_marca
            INNER JOIN medida me ON r.id_medida = me.id_medida
            WHERE 1=1";
    
    $params = [];
    $types = "";

    // Aplicar filtros si existen
    if (!empty($input['busqueda'])) {
        $sql .= " AND (r.nombre LIKE ? OR r.codigo LIKE ? OR r.descripcion LIKE ?)";
        $busqueda = "%" . $input['busqueda'] . "%";
        array_push($params, $busqueda, $busqueda, $busqueda);
        $types .= "sss";
    }
    
    if (!empty($input['marca'])) {
        $sql .= " AND r.id_marca = ?";
        $params[] = $input['marca'];
        $types .= "i";
    }
    
    // Filtro por stock
    if (!empty($input['stock'])) {
        if ($input['stock'] === 'bajo') {
            $sql .= " AND r.stock_actual <= r.stock_minimo AND r.stock_actual > 0";
        } elseif ($input['stock'] === 'critico') {
            $sql .= " AND r.stock_actual = 0";
        } elseif ($input['stock'] === 'normal') {
            $sql .= " AND r.stock_actual > r.stock_minimo";
        }
    }
    
    // Filtro por precio
    if (!empty($input['precio'])) {
        if ($input['precio'] === 'sin_precio') {
            $sql .= " AND (r.precio IS NULL OR r.precio <= 0)";
        } elseif ($input['precio'] === 'con_precio') {
            $sql .= " AND r.precio > 0";
        }
    }

    $sql .= " ORDER BY r.stock_actual ASC, r.nombre ASC";

    // Preparar statement con parámetros
    if (!empty($params)) {
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            echo json_encode(['error' => 'Error preparando consulta: ' . $conn->error]);
            exit;
        }
    } else {
        // Si no hay parámetros, ejecutar consulta simple
        $result = $conn->query($sql);
        if (!$result) {
            echo json_encode(['error' => 'Error en consulta: ' . $conn->error]);
            exit;
        }
    }
    
} else {
    // Solicitud GET normal (sin filtros) - mantiene compatibilidad
    $sql = "SELECT r.id_repuesto, r.codigo, r.nombre, r.descripcion, r.stock_minimo, r.stock_actual, 
                   r.precio, r.id_marca, r.id_medida,
                   m.nombre as marca, me.medida_bicicleta as medida
            FROM repuesto r
            INNER JOIN marca m ON r.id_marca = m.id_marca
            INNER JOIN medida me ON r.id_medida = me.id_medida
            ORDER BY r.nombre";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        echo json_encode(['error' => 'Error en consulta GET: ' . $conn->error]);
        exit;
    }
}

$repuestos = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $repuestos[] = $row;
    }
}

echo json_encode($repuestos, JSON_UNESCAPED_UNICODE);

// Cerrar conexión
if (isset($stmt)) {
    $stmt->close();
}
$conn->close();
?>
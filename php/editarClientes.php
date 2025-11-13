<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

// Validar si llegaron los datos
if (!isset($_POST['id_cliente']) || !isset($_POST['nombre'])) {
    echo json_encode(["status" => "error", "mensaje" => "Datos incompletos"]);
    exit;
}

$id = intval($_POST['id_cliente']);
$nombre = trim($_POST['nombre']);
$telefono = isset($_POST['telefono']) && $_POST['telefono'] !== "" ? $_POST['telefono'] : null;
$correo = isset($_POST['correo']) && $_POST['correo'] !== "" ? $_POST['correo'] : null;

// Validar datos
if (empty($nombre)) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre del cliente es obligatorio"]);
    exit;
}

if (strlen($nombre) < 2) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre debe tener al menos 2 caracteres"]);
    exit;
}

// Validar teléfono si se proporciona
if ($telefono && !preg_match('/^\d{4}-\d{4}$/', $telefono)) {
    echo json_encode(["status" => "error", "mensaje" => "Formato de teléfono inválido. Use: 1234-5678"]);
    exit;
}

// Validar correo si se proporciona
if ($correo && !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "mensaje" => "Formato de correo electrónico no válido"]);
    exit;
}

// Obtener datos anteriores para la bitácora
$sql_anterior = "SELECT nombre, telefono, correo FROM cliente WHERE id_cliente = ?";
$stmt_anterior = $conn->prepare($sql_anterior);
$stmt_anterior->bind_param("i", $id);
$stmt_anterior->execute();
$result_anterior = $stmt_anterior->get_result();
$cliente_anterior = $result_anterior->fetch_assoc();
$stmt_anterior->close();

if (!$cliente_anterior) {
    echo json_encode(["status" => "error", "mensaje" => "Cliente no encontrado"]);
    exit;
}

// Evitar duplicados en nombre
$sql_check = "SELECT id_cliente FROM cliente WHERE nombre = ? AND id_cliente != ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("si", $nombre, $id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if (mysqli_num_rows($result_check) > 0) {
    echo json_encode(["status" => "duplicado", "mensaje" => "Ya existe un cliente con ese nombre"]);
    $stmt_check->close();
    exit;
}
$stmt_check->close();

// Actualizar cliente
$sql = "UPDATE cliente SET nombre = ?, telefono = ?, correo = ? WHERE id_cliente = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $nombre, $telefono, $correo, $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    $cambios = [];
    
    if ($cliente_anterior['nombre'] !== $nombre) {
        $cambios[] = "Nombre: {$cliente_anterior['nombre']} → $nombre";
    }
    
    if ($cliente_anterior['telefono'] !== $telefono) {
        $tel_anterior = $cliente_anterior['telefono'] ?? 'No asignado';
        $tel_nuevo = $telefono ?? 'No asignado';
        $cambios[] = "Teléfono: $tel_anterior → $tel_nuevo";
    }
    
    if ($cliente_anterior['correo'] !== $correo) {
        $correo_anterior = $cliente_anterior['correo'] ?? 'No asignado';
        $correo_nuevo = $correo ?? 'No asignado';
        $cambios[] = "Correo: $correo_anterior → $correo_nuevo";
    }
    
    $descripcion = "Cliente actualizado: $nombre";
    if (!empty($cambios)) {
        $descripcion .= " - Cambios: " . implode(", ", $cambios);
    } else {
        $descripcion .= " - Sin cambios detectados";
    }
    
    registrarEnBitacora(
        'EDITAR',
        $descripcion,
        'cliente',
        $id,
        'Clientes'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Cliente actualizado correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error en la base de datos: " . mysqli_error($conn)]);
}

$stmt->close();
$conn->close();
exit;
?>
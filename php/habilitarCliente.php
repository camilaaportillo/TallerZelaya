<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include "conexion.php";
include "bitacora_helper.php";

if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

// Obtener datos del cliente antes de habilitar para la bitácora
$sql_info = "SELECT nombre, telefono, correo FROM cliente WHERE id_cliente = ?";
$stmt_info = $conn->prepare($sql_info);
$stmt_info->bind_param("i", $id);
$stmt_info->execute();
$result_info = $stmt_info->get_result();
$cliente_info = $result_info->fetch_assoc();
$stmt_info->close();

if (!$cliente_info) {
    echo json_encode(["status" => "error", "mensaje" => "Cliente no encontrado"]);
    exit;
}

// Actualizar estado a Activo
$sql = "UPDATE cliente SET estado = 1 WHERE id_cliente = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if (mysqli_query($conn, $sql)) {
    // ✅ REGISTRAR EN BITÁCORA
    $descripcion = "Cliente habilitado: {$cliente_info['nombre']}";
    if ($cliente_info['telefono']) $descripcion .= " - Tel: {$cliente_info['telefono']}";
    if ($cliente_info['correo']) $descripcion .= " - Correo: {$cliente_info['correo']}";
    
    registrarEnBitacora(
        'UPDATE',
        $descripcion,
        'cliente',
        $id,
        'Clientes'
    );
    
    echo json_encode([
        "status" => "exito",
        "mensaje" => "Cliente habilitado correctamente"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No se pudo habilitar el cliente: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();
exit;
?>
<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

// Validar que llegue el id
if (!isset($_POST['id_cliente'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID de cliente no recibido"]);
    exit;
}

$id = intval($_POST['id_cliente']);

// Obtener datos del cliente antes de eliminar para la bitácora
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

// Cambiar estado a Inactivo
$sql = "UPDATE cliente SET estado = 'Inactivo' WHERE id_cliente = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    $descripcion = "Cliente dado de baja: {$cliente_info['nombre']}";
    if ($cliente_info['telefono']) $descripcion .= " - Tel: {$cliente_info['telefono']}";
    if ($cliente_info['correo']) $descripcion .= " - Correo: {$cliente_info['correo']}";
    
    registrarEnBitacora(
        'UPDATE',
        $descripcion,
        'cliente',
        $id,
        'Clientes'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Cliente dado de baja correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo dar de baja"]);
}

$stmt->close();
$conn->close();
exit;
?>
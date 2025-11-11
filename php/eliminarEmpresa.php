<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

$id = $_POST['id'] ?? '';

if (empty($id)) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

// Obtener datos de la empresa antes de eliminar para la bitácora
$sql_info = "SELECT nombre, correo, telefono FROM empresa WHERE id_empresa = ?";
$stmt_info = $conn->prepare($sql_info);
$stmt_info->bind_param("i", $id);
$stmt_info->execute();
$result_info = $stmt_info->get_result();
$empresa_info = $result_info->fetch_assoc();
$stmt_info->close();

if (!$empresa_info) {
    echo json_encode(["status" => "error", "mensaje" => "Empresa no encontrada"]);
    exit;
}

// "Eliminar" (deshabilitar) la empresa
$sql = "UPDATE empresa SET estado = 'Inactivo' WHERE id_empresa = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    registrarEnBitacora(
        'UPDATE',
        "Empresa deshabilitada: {$empresa_info['nombre']} - Correo: {$empresa_info['correo']} - Tel: {$empresa_info['telefono']}",
        'empresa',
        $id,
        'Empresas'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Empresa deshabilitada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al deshabilitar: " . $conn->error]);
}

$stmt->close();
$conn->close();
exit;
?>
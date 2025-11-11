<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

// Obtener datos de la empresa antes de habilitar para la bitácora
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

$sql = "UPDATE empresa SET estado = 'Activo' WHERE id_empresa = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    registrarEnBitacora(
        'UPDATE',
        "Empresa habilitada: {$empresa_info['nombre']} - Correo: {$empresa_info['correo']} - Tel: {$empresa_info['telefono']}",
        'empresa',
        $id,
        'Empresas'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Empresa habilitada correctamente"]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "No se pudo habilitar: " . $conn->error]);
}

$stmt->close();
$conn->close();
exit;
?>
<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

$id = $_POST['id'] ?? '';

if (empty($id)) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

// Obtener datos de la marca antes de eliminar para la bitácora
$sql_info = "SELECT nombre FROM marca WHERE id_marca = ?";
$stmt_info = $conn->prepare($sql_info);
$stmt_info->bind_param("i", $id);
$stmt_info->execute();
$result_info = $stmt_info->get_result();
$marca_info = $result_info->fetch_assoc();
$stmt_info->close();

if (!$marca_info) {
    echo json_encode(["status" => "error", "mensaje" => "Marca no encontrada"]);
    exit;
}

// "Eliminar" (deshabilitar) la marca
$sql = "UPDATE marca SET estado = 'Inactivo' WHERE id_marca = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    registrarEnBitacora(
        'UPDATE',
        "Marca deshabilitada: {$marca_info['nombre']}",
        'marca',
        $id,
        'Marcas'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Marca deshabilitada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al eliminar: " . $conn->error]);
}

$stmt->close();
$conn->close();
exit;
?>
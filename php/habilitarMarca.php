<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

// Verificar que se reciba el ID
if (!isset($_POST['id'])) {
    echo json_encode(["status" => "error", "mensaje" => "ID no recibido"]);
    exit;
}

$id = intval($_POST['id']);

// Obtener datos de la marca antes de habilitar para la bitácora
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

// Actualizar el estado de la marca a Activo
$sql = "UPDATE marca SET estado = 'Activo' WHERE id_marca = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    registrarEnBitacora(
        'UPDATE',
        "Marca habilitada: {$marca_info['nombre']}",
        'marca',
        $id,
        'Marcas'
    );
    
    echo json_encode([
        "status" => "exito",
        "mensaje" => "Marca habilitada correctamente"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "mensaje" => "No se pudo habilitar la marca: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();
exit;
?>
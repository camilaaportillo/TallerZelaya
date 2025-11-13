<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

$id = $_POST['id'] ?? '';
$nombre = $_POST['nombre'] ?? '';

// Validar datos
if (empty($id) || empty($nombre)) {
    echo json_encode(["status" => "error", "mensaje" => "Todos los campos son obligatorios"]);
    exit;
}

// Limpiar y validar nombre
$nombre = trim($nombre);
if (strlen($nombre) < 2) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre debe tener al menos 2 caracteres"]);
    exit;
}

// Obtener datos anteriores para la bitácora
$sql_anterior = "SELECT nombre FROM marca WHERE id_marca = ?";
$stmt_anterior = $conn->prepare($sql_anterior);
$stmt_anterior->bind_param("i", $id);
$stmt_anterior->execute();
$result_anterior = $stmt_anterior->get_result();
$marca_anterior = $result_anterior->fetch_assoc();
$stmt_anterior->close();

if (!$marca_anterior) {
    echo json_encode(["status" => "error", "mensaje" => "Marca no encontrada"]);
    exit;
}

// Verificar duplicados (excluyendo la marca actual)
$sql_verificar = "SELECT id_marca FROM marca WHERE nombre = ? AND id_marca != ?";
$stmt_verificar = $conn->prepare($sql_verificar);
$stmt_verificar->bind_param("si", $nombre, $id);
$stmt_verificar->execute();
$result_verificar = $stmt_verificar->get_result();

if ($result_verificar->num_rows > 0) {
    echo json_encode(["status" => "error", "mensaje" => "Ya existe otra marca con este nombre"]);
    $stmt_verificar->close();
    exit;
}
$stmt_verificar->close();

// Actualizar marca
$sql = "UPDATE marca SET nombre = ? WHERE id_marca = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $nombre, $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    $descripcion = "Marca actualizada: {$marca_anterior['nombre']} → $nombre";
    
    registrarEnBitacora(
        'EDITAR',
        $descripcion,
        'marca',
        $id,
        'Marcas'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Marca editada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al editar: " . $conn->error]);
}

$stmt->close();
$conn->close();
exit;
?>
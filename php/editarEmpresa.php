<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

$id = $_POST['id'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$correo = $_POST['correo'] ?? '';
$telefono = $_POST['telefono'] ?? '';

// Validar datos
if (empty($id) || empty($nombre) || empty($correo) || empty($telefono)) {
    echo json_encode(["status" => "error", "mensaje" => "Todos los campos son obligatorios"]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "mensaje" => "Formato de correo electrónico no válido"]);
    exit;
}

if (!preg_match('/^\d{8}$/', $telefono)) {
    echo json_encode(["status" => "error", "mensaje" => "El teléfono debe tener 8 dígitos"]);
    exit;
}

// Obtener datos anteriores para la bitácora
$sql_anterior = "SELECT nombre, correo, telefono FROM empresa WHERE id_empresa = ?";
$stmt_anterior = $conn->prepare($sql_anterior);
$stmt_anterior->bind_param("i", $id);
$stmt_anterior->execute();
$result_anterior = $stmt_anterior->get_result();
$empresa_anterior = $result_anterior->fetch_assoc();
$stmt_anterior->close();

if (!$empresa_anterior) {
    echo json_encode(["status" => "error", "mensaje" => "Empresa no encontrada"]);
    exit;
}

// Verificar duplicados (excluyendo la empresa actual)
$sql_verificar = "SELECT id_empresa FROM empresa WHERE (nombre = ? OR correo = ? OR telefono = ?) AND id_empresa != ?";
$stmt_verificar = $conn->prepare($sql_verificar);
$stmt_verificar->bind_param("sssi", $nombre, $correo, $telefono, $id);
$stmt_verificar->execute();
$result_verificar = $stmt_verificar->get_result();

if ($result_verificar->num_rows > 0) {
    echo json_encode(["status" => "error", "mensaje" => "Ya existe otra empresa con estos datos"]);
    exit;
}
$stmt_verificar->close();

// Actualizar empresa
$sql = "UPDATE empresa SET nombre=?, correo=?, telefono=? WHERE id_empresa=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $nombre, $correo, $telefono, $id);

if ($stmt->execute()) {
    // ✅ REGISTRAR EN BITÁCORA
    $cambios = [];
    
    if ($empresa_anterior['nombre'] !== $nombre) {
        $cambios[] = "Nombre: {$empresa_anterior['nombre']} → $nombre";
    }
    if ($empresa_anterior['correo'] !== $correo) {
        $cambios[] = "Correo: {$empresa_anterior['correo']} → $correo";
    }
    if ($empresa_anterior['telefono'] !== $telefono) {
        $cambios[] = "Teléfono: {$empresa_anterior['telefono']} → $telefono";
    }
    
    $descripcion = "Empresa actualizada: $nombre";
    if (!empty($cambios)) {
        $descripcion .= " - Cambios: " . implode(", ", $cambios);
    } else {
        $descripcion .= " - Sin cambios detectados";
    }
    
    registrarEnBitacora(
        'EDITAR',
        $descripcion,
        'empresa',
        $id,
        'Empresas'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Empresa editada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al editar: " . $conn->error]);
}

$stmt->close();
$conn->close();
exit;
?>
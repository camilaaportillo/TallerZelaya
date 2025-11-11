<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

$nombre = $_POST['nombre'] ?? '';
$correo = $_POST['correo'] ?? '';
$telefono = $_POST['telefono'] ?? '';

// Validar datos
if (empty($nombre) || empty($correo) || empty($telefono)) {
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

// Verificar duplicados
$sql_verificar = "SELECT id_empresa FROM empresa WHERE nombre = ? OR correo = ? OR telefono = ?";
$stmt_verificar = $conn->prepare($sql_verificar);
$stmt_verificar->bind_param("sss", $nombre, $correo, $telefono);
$stmt_verificar->execute();
$result_verificar = $stmt_verificar->get_result();

if ($result_verificar->num_rows > 0) {
    $empresa_existente = $result_verificar->fetch_assoc();
    echo json_encode(["status" => "error", "mensaje" => "Ya existe una empresa con estos datos"]);
    exit;
}
$stmt_verificar->close();

// Insertar empresa
$sql = "INSERT INTO empresa (nombre, correo, telefono) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $nombre, $correo, $telefono);

if ($stmt->execute()) {
    $nuevo_id = $stmt->insert_id;
    
    // ✅ REGISTRAR EN BITÁCORA
    registrarEnBitacora(
        'INSERT',
        "Empresa creada: $nombre - Correo: $correo - Tel: $telefono",
        'empresa',
        $nuevo_id,
        'Empresas'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Empresa ingresada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al ingresar: " . $conn->error]);
}

$stmt->close();
$conn->close();
exit;
?>
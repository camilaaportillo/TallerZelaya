<?php
session_start();
include "conexion.php";
include "bitacora_helper.php";

$nombre = $_POST['nombre'] ?? '';
$telefono = isset($_POST['telefono']) && $_POST['telefono'] !== "" ? $_POST['telefono'] : null;
$correo = isset($_POST['correo']) && $_POST['correo'] !== "" ? $_POST['correo'] : null;

// Validar datos
if (empty($nombre)) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre del cliente es obligatorio"]);
    exit;
}

// Limpiar y validar nombre
$nombre = trim($nombre);
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

// Validar duplicado SOLO por nombre
$checkSql = "SELECT id_cliente FROM cliente WHERE nombre = ?";
$stmt_check = $conn->prepare($checkSql);
$stmt_check->bind_param("s", $nombre);
$stmt_check->execute();
$checkResult = $stmt_check->get_result();

if(mysqli_num_rows($checkResult) > 0) {
    echo json_encode(["status" => "duplicado", "mensaje" => "Ya existe un cliente con ese nombre."]);
    $stmt_check->close();
    exit;
}
$stmt_check->close();

// Insertar cliente (manejar NULL correctamente)
$sql = "INSERT INTO cliente (nombre, telefono, correo, estado) VALUES (?, ?, ?, 1)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $nombre, $telefono, $correo);

if($stmt->execute()){
    $nuevo_id = $stmt->insert_id;
    
    // ✅ REGISTRAR EN BITÁCORA
    $descripcion = "Cliente creado: $nombre";
    if ($telefono) $descripcion .= " - Tel: $telefono";
    if ($correo) $descripcion .= " - Correo: $correo";
    
    registrarEnBitacora(
        'INSERT',
        $descripcion,
        'cliente',
        $nuevo_id,
        'Clientes'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Cliente registrado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al registrar: " . mysqli_error($conn)]);
}

$stmt->close();
$conn->close();
exit;
?>
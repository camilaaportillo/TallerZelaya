<?php 
session_start();
include "conexion.php";
include "bitacora_helper.php";

$nombre = $_POST['nombre'] ?? '';

// Validar datos
if (empty($nombre)) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre de la marca es obligatorio"]);
    exit;
}

// Limpiar y validar nombre
$nombre = trim($nombre);
if (strlen($nombre) < 2) {
    echo json_encode(["status" => "error", "mensaje" => "El nombre debe tener al menos 2 caracteres"]);
    exit;
}

// Verificar si la marca ya existe
$checkSql = "SELECT id_marca FROM marca WHERE nombre = ?";
$stmt_check = $conn->prepare($checkSql);
$stmt_check->bind_param("s", $nombre);
$stmt_check->execute();
$checkResult = $stmt_check->get_result();

if(mysqli_num_rows($checkResult) > 0){
    // Marca duplicada
    echo json_encode(["status" => "duplicado", "mensaje" => "Esta marca ya está registrada."]);
    $stmt_check->close();
    exit;
}
$stmt_check->close();

// Insertar nueva marca
$sql = "INSERT INTO marca (nombre, estado) VALUES (?, 'Activo')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $nombre);

if ($stmt->execute()) {
    $nuevo_id = $stmt->insert_id;
    
    // ✅ REGISTRAR EN BITÁCORA
    registrarEnBitacora(
        'INSERT',
        "Marca creada: $nombre",
        'marca',
        $nuevo_id,
        'Marcas'
    );
    
    echo json_encode(["status" => "exito", "mensaje" => "Marca ingresada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al ingresar: " . $conn->error]);
}

$stmt->close();
$conn->close();
exit;
?>
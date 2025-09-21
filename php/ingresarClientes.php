<?php
include "conexion.php";

$nombre = $_POST['nombre'];
$telefono = !empty($_POST['telefono']) ? $_POST['telefono'] : null;
$correo = !empty($_POST['correo']) ? $_POST['correo'] : null;

// Validar duplicado por nombre o correo si existe
$checkSql = "SELECT * FROM cliente WHERE nombre = '$nombre' OR (correo IS NOT NULL AND correo = '$correo')";
$checkResult = mysqli_query($conn, $checkSql);

if(mysqli_num_rows($checkResult) > 0) {
    echo json_encode(["status" => "error", "mensaje" => "No se puede registrar, el cliente ya existe."]);
    exit;
}

// Insertar cliente
$sql = "INSERT INTO cliente (nombre, telefono, correo, estado) VALUES ('$nombre', '$telefono', '$correo', 1)";
$result = mysqli_query($conn, $sql);

if($result){
    echo json_encode(["status" => "exito", "mensaje" => "Cliente registrado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al registrar: " . $conn->error]);
}
?>

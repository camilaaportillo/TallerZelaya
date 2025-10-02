<?php
include "conexion.php";

$nombre = mysqli_real_escape_string($conn, $_POST['nombre']);
$telefono = isset($_POST['telefono']) && $_POST['telefono'] !== "" ? mysqli_real_escape_string($conn, $_POST['telefono']) : null;
$correo = isset($_POST['correo']) && $_POST['correo'] !== "" ? mysqli_real_escape_string($conn, $_POST['correo']) : null;

// Validar duplicado SOLO por nombre
$checkSql = "SELECT * FROM cliente WHERE nombre = '$nombre'";
$checkResult = mysqli_query($conn, $checkSql);

if(mysqli_num_rows($checkResult) > 0) {
    echo json_encode(["status" => "duplicado", "mensaje" => "Ya existe un cliente con ese nombre."]);
    exit;
}

// Insertar cliente (manejar NULL correctamente)
$sql = "INSERT INTO cliente (nombre, telefono, correo, estado) VALUES ('$nombre', ";
$sql .= $telefono !== null ? "'$telefono'" : "NULL";
$sql .= ", ";
$sql .= $correo !== null ? "'$correo'" : "NULL";
$sql .= ", 1)";

$result = mysqli_query($conn, $sql);

if($result){
    echo json_encode(["status" => "exito", "mensaje" => "Cliente registrado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al registrar: " . mysqli_error($conn)]);
}
?>
<?php 
include "conexion.php";

$nombre = $_POST['nombre'];

// Verificar si la marca ya existe
$checkSql = "SELECT id_marca FROM marca WHERE nombre = '$nombre'";
$checkResult = mysqli_query($conn, $checkSql);

if(mysqli_num_rows($checkResult) > 0){
    // Marca duplicada
    echo json_encode(["status" => "duplicado", "mensaje" => "Esta marca ya está registrada."]);
    exit;
}

// Insertar nueva marca
$sql = "INSERT INTO marca (nombre, estado) VALUES ('$nombre', 1)";
$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(["status" => "exito", "mensaje" => "Marca ingresada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al ingresar: " . $conn->error]);
}

exit;
?>

<?php
include "conexion.php";

$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];

$sql = "INSERT INTO empresa (nombre, correo, telefono) 
        VALUES ('$nombre', '$correo', '$telefono')";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(["status" => "exito", "mensaje" => "Empresa ingresada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al ingresar: " . $conn->error]);
}

exit;
?>

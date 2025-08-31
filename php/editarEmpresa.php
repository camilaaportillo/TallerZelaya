<?php
include "conexion.php"; // tu archivo de conexión

$id = $_POST['id'];
$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];

$sql = "UPDATE empresa SET nombre='$nombre', correo='$correo', telefono='$telefono' WHERE id_empresa=$id";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(["status" => "exito", "mensaje" => "Empresa editada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al editar: " . $conn->error]);
}

exit;
?>

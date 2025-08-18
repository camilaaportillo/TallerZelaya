<?php
include "conexion.php"; // tu archivo de conexión

$id = $_POST['id'];
$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];

$sql = "UPDATE empresa SET nombre='$nombre', correo='$correo', telefono='$telefono' WHERE id_empresa=$id";

if ($conn->query($sql) === TRUE) {
    echo "Empresa actualizada correctamente";
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>

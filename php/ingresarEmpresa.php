<?php
include "conexion.php";

$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];

$sql = "INSERT INTO empresa (nombre, correo, telefono) 
        VALUES ('$nombre', '$correo', '$telefono')";

if ($conn->query($sql) === TRUE) {
    echo "Empresa agregada correctamente.";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>

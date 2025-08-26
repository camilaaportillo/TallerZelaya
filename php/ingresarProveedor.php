<?php
include "conexion.php";

$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];
$id_empresa = $_POST['id_empresa'];

$sql = "INSERT INTO `proveedor` (`nombre`, `telefono`, `estado`, `correo`, `id_empresa`) 
        VALUES ('$nombre', '$telefono', 'Activo', '$correo', '$id_empresa')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor registrado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
    echo $sql;
    echo $conn->error;
}
exit;
?>

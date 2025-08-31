<?php
include "conexion.php";

$id = $_POST['id'];
$nombre = $_POST['nombre'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];
$id_empresa = $_POST['id_empresa'];

$sql = "UPDATE `proveedor` 
        SET `nombre` = '$nombre', 
            `telefono` = '$telefono', 
            `correo` = '$correo', 
            `id_empresa` = '$id_empresa' 
        WHERE `id_proveedor` = '$id'";

header('Content-Type: application/json');

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor actualizado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}


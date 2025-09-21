<?php
include "conexion.php";

$id = $_POST['id'];
$nombre = $_POST['nombre'];
$descripcion = $_POST['descripcion'];
$stock = $_POST['stock'];
$marca = $_POST['id_marca'];
$medida = $_POST['id_medida'];

$sql = "UPDATE `repuesto` 
        SET `nombre` = '$nombre', 
            `descripcion` = '$descripcion', 
            `stock_minimo` = '$stock', 
            `id_marca` = '$marca', 
            `id_medida` = '$medida' 
        WHERE `id_repuesto` = '$id'";

header('Content-Type: application/json');

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Repuesto actualizado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}

exit;
?>
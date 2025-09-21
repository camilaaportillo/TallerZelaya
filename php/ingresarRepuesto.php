<?php
include "conexion.php";

$codigo = $_POST['codigo'];
$nombre = $_POST['nombre'];
$descripcion = $_POST['descripcion'];
$stock = $_POST['stock'];
$id_marca = $_POST['id_marca'];
$id_medida = $_POST['id_medida'];

$sql = "INSERT INTO `repuesto`(`codigo`, `nombre`, `descripcion`, `stock_minimo`, `id_marca`, `id_medida`) 
        VALUES ('$codigo','$nombre','$descripcion','$stock','$id_marca','$id_medida')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Repuesto registrado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
    echo $sql;
    echo $conn->error;
}
exit;
?>
<?php
include "conexion.php"; 

$id = $_POST['id'];
$nombre = $_POST['nombre'];



$sql = "UPDATE marca SET nombre='$nombre'WHERE id_marca=$id";



$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(["status" => "exito", "mensaje" => "Marca editada correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error al editar: " . $conn->error]);
}

exit;
?>

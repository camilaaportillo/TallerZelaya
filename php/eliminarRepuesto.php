<?php
include "conexion.php";

$id = $_POST['id'];

$sql = "DELETE FROM `repuesto` WHERE `repuesto`.`id_repuesto` = '$id'";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Repuesto eliminado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}
exit;
?>
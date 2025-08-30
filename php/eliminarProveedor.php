<?php
include "conexion.php";

$id = $_POST['id'];

$sql = "UPDATE `proveedor` SET `estado` = 'Inactivo' WHERE `proveedor`.`id_proveedor` ='$id'";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Proveedor eliminado correctamente."]);
} else {
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}
exit;
?>

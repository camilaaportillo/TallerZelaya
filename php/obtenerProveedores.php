<?php
include "conexion.php";

$sql = "SELECT p.id_proveedor, p.nombre, p.correo, p.telefono, e.nombre AS empresa
        FROM proveedor p
        INNER JOIN empresa e ON p.id_empresa = e.id_empresa
        WHERE p.estado = 1";

$result = mysqli_query($conn, $sql);

$proveedores = [];
while ($row = mysqli_fetch_assoc($result)) {
    $proveedores[] = $row;
}

echo json_encode($proveedores);
exit;
?>

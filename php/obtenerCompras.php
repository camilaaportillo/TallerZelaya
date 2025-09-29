<?php
include("conexion.php");

header("Content-Type: application/json; charset=utf-8");

$sql = "SELECT c.id_compra, c.precio AS total, c.fecha, c.facturaImagen,
               p.nombre AS proveedor, e.nombre AS empresa
        FROM compra c
        INNER JOIN proveedor p ON c.id_proveedor = p.id_proveedor
        INNER JOIN empresa e ON p.id_empresa = e.id_empresa
        ORDER BY c.fecha DESC";

$result = $conn->query($sql);

$compras = [];
while ($row = $result->fetch_assoc()) {
    $compras[] = [
        "id_compra" => (int)$row["id_compra"],
        "proveedor" => $row["proveedor"],
        "empresa"   => $row["empresa"],
        "fecha"     => $row["fecha"],
        "total"     => (float)$row["total"],
        "factura"   => $row["facturaImagen"]
    ];
}

echo json_encode($compras, JSON_UNESCAPED_UNICODE);
$conn->close();
?>
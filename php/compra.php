<?php
include("conexion.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Decodificar JSON
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data["proveedor"], $data["fecha"], $data["usuario"], $data["productos"])) {
        echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
        exit;
    }

    $proveedor = intval($data["proveedor"]);
    $fecha = $data["fecha"];
    $usuario = intval($data["usuario"]);
    $productos = $data["productos"];

    // Calcular total de la compra
    $total = 0;
    foreach ($productos as $p) {
        $total += $p["cantidad"] * $p["precio"];
    }

    // 1. Insertar en compra
    $sqlCompra = "INSERT INTO compra (precio, fecha, id_proveedor, id_usuario) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sqlCompra);
    $stmt->bind_param("dsii", $total, $fecha, $proveedor, $usuario);
    $stmt->execute();
    $idCompra = $stmt->insert_id;

    // 2. Insertar cada detalle y actualizar stock
    $sqlDetalle = "INSERT INTO detallescompra (id_compra, id_repuesto, cantidad, precio_unitario)
                   VALUES (?, ?, ?, ?)";
    $stmtDet = $conn->prepare($sqlDetalle);

    $sqlUpdate = "UPDATE repuesto SET stock_actual = stock_actual + ? WHERE id_repuesto = ?";
    $stmtUpd = $conn->prepare($sqlUpdate);

    foreach ($productos as $p) {
        $idRepuesto = intval($p["id_repuesto"]);
        $cantidad   = intval($p["cantidad"]);
        $precio     = floatval($p["precio"]);

        // detalle_compra
        $stmtDet->bind_param("iiid", $idCompra, $idRepuesto, $cantidad, $precio);
        $stmtDet->execute();

        // actualizar stock
        $stmtUpd->bind_param("ii", $cantidad, $idRepuesto);
        $stmtUpd->execute();
    }

    header("Content-Type: application/json");
    echo json_encode(["status" => "success", "message" => "Compra registrada correctamente"]);
}
?>

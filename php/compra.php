<?php
header("Content-Type: application/json; charset=UTF-8");
include "conexion.php";

try {
    // ====== Validaciones iniciales ======
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Método no permitido. Use POST.");
    }
    
    if (!isset($_POST["proveedor"], $_POST["fecha"], $_POST["usuario"], $_POST["productos"])) {
        throw new Exception("Datos incompletos.");
    }

    $proveedor = intval($_POST["proveedor"]);
    $fecha = $_POST["fecha"];
    $usuario = intval($_POST["usuario"]);
    $productos = json_decode($_POST["productos"], true);

    if (!$productos || !is_array($productos) || count($productos) === 0) {
        throw new Exception("No se enviaron productos válidos.");
    }

    // ====== Manejo de la factura (si viene) ======
    $facturaNombreFinal = null;
    if (isset($_FILES["factura"]) && $_FILES["factura"]["error"] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES["factura"]["name"], PATHINFO_EXTENSION);
        $facturaNombreFinal = uniqid("factura_", true) . "." . strtolower($ext);

        $rutaDestino = __DIR__ . "/../facturas/" . $facturaNombreFinal;
        if (!move_uploaded_file($_FILES["factura"]["tmp_name"], $rutaDestino)) {
            throw new Exception("Error al guardar la factura en el servidor.");
        }
    }

    // ====== Iniciar transacción ======
    $conn->begin_transaction();

    // Primero calculamos el total en base a los productos
    $precioTotal = 0;
    foreach ($productos as $i => $p) {
        if (!isset($p["producto"], $p["cantidad"], $p["precio"])) {
            throw new Exception("Formato de producto inválido.");
        }

        $cantidad = intval($p["cantidad"]);
        $precioUnitario = floatval($p["precio"]);
        $productos[$i]["subtotal"] = $cantidad * $precioUnitario;
        $precioTotal += $productos[$i]["subtotal"];
    }

    // Insertar compra
    $stmt = $conn->prepare("INSERT INTO compra (precio, fecha, id_proveedor, id_usuario, facturaImagen) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("dsiis", $precioTotal, $fecha, $proveedor, $usuario, $facturaNombreFinal);
    $stmt->execute();
    $idCompra = $stmt->insert_id;
    $stmt->close();

    // Insertar detalles y ACTUALIZAR STOCK
    $stmtDetalle = $conn->prepare(
        "INSERT INTO detallescompra (cantidad, id_compra, id_repuesto, precioUnitario, subTotal)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmtDetalle->bind_param("iiidd", $cantidad, $idCompra, $idRepuesto, $precioUnitario, $subTotal);

    // ✅ CORREGIDO: Quitamos la columna ultima_compra que no existe
    $stmtStock = $conn->prepare(
        "UPDATE repuesto 
         SET stock_actual = stock_actual + ?
         WHERE id_repuesto = ?"
    );
    $stmtStock->bind_param("ii", $cantidadStock, $idRepuestoStock);

    foreach ($productos as $p) {
        $cantidad = intval($p["cantidad"]);
        $idRepuesto = intval($p["producto"]);
        $precioUnitario = floatval($p["precio"]);
        $subTotal = $p["subtotal"];
        
        // Insertar detalle de compra
        $stmtDetalle->execute();

        // ✅ ACTUALIZAR stock del repuesto (sin ultima_compra)
        $cantidadStock = $cantidad;
        $idRepuestoStock = $idRepuesto;
        $stmtStock->execute();
    }

    $stmtDetalle->close();
    $stmtStock->close();

    // Confirmar transacción
    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Compra registrada correctamente y stock actualizado.",
        "id_compra" => $idCompra,
        "precio_total" => $precioTotal
    ]);

} catch (Exception $e) {
    if ($conn && $conn->connect_errno === 0) {
        $conn->rollback();
    }
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
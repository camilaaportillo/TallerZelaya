<?php
include "conexion.php";
include "bitacora_helper.php";

// Obtener datos del usuario desde el POST
$id_usuario = $_POST['id_usuario'] ?? null;
$nombre_usuario = $_POST['nombre_usuario'] ?? 'Sistema';

// Configuración para subida de archivos
$directorio_imagenes = "../imgs-repuestos/";
$ruta_imagen = null;

// Crear directorio si no existe
if (!file_exists($directorio_imagenes)) {
    mkdir($directorio_imagenes, 0777, true);
}

// Obtener datos del formulario
$codigo = mysqli_real_escape_string($conn, $_POST['codigo']);
$nombre = mysqli_real_escape_string($conn, $_POST['nombre']);
$descripcion = mysqli_real_escape_string($conn, $_POST['descripcion']);
$stock = intval($_POST['stock']);
$id_marca = intval($_POST['id_marca']);
$id_medida = intval($_POST['id_medida']);

// Validar duplicado en el servidor (nombre + marca + medida)
$sql_duplicado = "SELECT COUNT(*) as total FROM repuesto 
                  WHERE nombre = '$nombre' 
                  AND id_marca = '$id_marca' 
                  AND id_medida = '$id_medida'";
$result_duplicado = $conn->query($sql_duplicado);
$row_duplicado = $result_duplicado->fetch_assoc();

if ($row_duplicado['total'] > 0) {
    echo json_encode(["status" => "error", "mensaje" => "Ya existe un repuesto con el mismo nombre, marca y medida."]);
    exit;
}

// Verificar si se subió una imagen
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $archivo_temporal = $_FILES['imagen']['tmp_name'];
    $nombre_archivo = $_FILES['imagen']['name'];
    $extension = strtolower(pathinfo($nombre_archivo, PATHINFO_EXTENSION));
    
    // Validar que sea una imagen
    $extensiones_permitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($extension, $extensiones_permitidas)) {
        echo json_encode(["status" => "error", "mensaje" => "Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)."]);
        exit;
    }
    
    // Validar tamaño (máximo 2MB)
    if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
        echo json_encode(["status" => "error", "mensaje" => "La imagen no debe pesar más de 2MB."]);
        exit;
    }
    
    // Generar nombre único para la imagen
    $nuevo_nombre = "repuesto_" . $codigo . "_" . time() . "." . $extension;
    $ruta_destino = $directorio_imagenes . $nuevo_nombre;
    
    // Mover archivo al directorio
    if (move_uploaded_file($archivo_temporal, $ruta_destino)) {
        $ruta_imagen = "imgs-repuestos/" . $nuevo_nombre;
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Error al subir la imagen."]);
        exit;
    }
}

// Preparar la consulta SQL
if ($ruta_imagen) {
    $sql = "INSERT INTO `repuesto`(`codigo`, `nombre`, `descripcion`, `stock_minimo`, `id_marca`, `id_medida`, `imagen_path`) 
            VALUES ('$codigo','$nombre','$descripcion','$stock','$id_marca','$id_medida','$ruta_imagen')";
} else {
    $sql = "INSERT INTO `repuesto`(`codigo`, `nombre`, `descripcion`, `stock_minimo`, `id_marca`, `id_medida`) 
            VALUES ('$codigo','$nombre','$descripcion','$stock','$id_marca','$id_medida')";
}

if (mysqli_query($conn, $sql)) {
    $nuevo_id = mysqli_insert_id($conn);
    
    // REGISTRAR EN BITÁCORA - Establecer sesión temporal
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if ($id_usuario && $nombre_usuario) {
        $_SESSION['usuario_id'] = $id_usuario;
        $_SESSION['usuario_nombre'] = $nombre_usuario;
    }
    
    $descripcion = "Repuesto creado: $codigo - $nombre - Stock mínimo: $stock";
    registrarEnBitacora('INSERTAR', $descripcion, 'repuesto', $nuevo_id, 'Repuestos');
    
    echo json_encode(["status" => "exito", "mensaje" => "Repuesto registrado correctamente."]);
} else {
    // Si hay error, eliminar la imagen subida
    if ($ruta_imagen && file_exists("../" . $ruta_imagen)) {
        unlink("../" . $ruta_imagen);
    }
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}

$conn->close();
?>
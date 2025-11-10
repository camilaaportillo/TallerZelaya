<?php
include "conexion.php";

// Configuración para subida de archivos
$directorio_imagenes = "../imgs-herramientas/";
$ruta_imagen = null;

// Crear directorio si no existe
if (!file_exists($directorio_imagenes)) {
    mkdir($directorio_imagenes, 0777, true);
}

// Obtener datos del formulario
$id_herramienta = intval($_POST['id']);
$nombre = mysqli_real_escape_string($conn, $_POST['nombre']);
$descripcion = mysqli_real_escape_string($conn, $_POST['descripcion']);
$stock = intval($_POST['stock']);
$id_marca = intval($_POST['id_marca']);
$id_medida = intval($_POST['id_medida']);

// Validar duplicado al editar
$sql_duplicado = "SELECT COUNT(*) as total FROM herramienta 
                  WHERE nombre = '$nombre' 
                  AND id_marca = '$id_marca' 
                  AND id_medida = '$id_medida'
                  AND id_herramienta != $id_herramienta";
$result_duplicado = $conn->query($sql_duplicado);
$row_duplicado = $result_duplicado->fetch_assoc();

if ($row_duplicado['total'] > 0) {
    echo json_encode(["status" => "error", "mensaje" => "Ya existe otra herramienta con el mismo nombre, marca y medida."]);
    exit;
}

// Obtener información actual para manejar la imagen existente
$sql_actual = "SELECT imagen_path FROM herramienta WHERE id_herramienta = $id_herramienta";
$result_actual = $conn->query($sql_actual);
$herramienta_actual = $result_actual->fetch_assoc();
$imagen_anterior = $herramienta_actual['imagen_path'];

// Manejar eliminación de imagen existente
if (isset($_POST['eliminar_imagen']) && $_POST['eliminar_imagen'] == '1') {
    if ($imagen_anterior && file_exists("../" . $imagen_anterior)) {
        unlink("../" . $imagen_anterior);
    }
    $ruta_imagen = null;
}

// Manejar subida de nueva imagen
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
    
    // Eliminar imagen anterior si existe
    if ($imagen_anterior && file_exists("../" . $imagen_anterior)) {
        unlink("../" . $imagen_anterior);
    }
    
    // Generar nombre único para la nueva imagen
    $nuevo_nombre = "herramienta_" . preg_replace('/[^a-zA-Z0-9]/', '_', $nombre) . "_" . time() . "." . $extension;
    $ruta_destino = $directorio_imagenes . $nuevo_nombre;
    
    // Mover archivo al directorio
    if (move_uploaded_file($archivo_temporal, $ruta_destino)) {
        $ruta_imagen = "imgs-herramientas/" . $nuevo_nombre;
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Error al subir la imagen."]);
        exit;
    }
}

// Preparar la consulta SQL
if (isset($_POST['eliminar_imagen']) && $_POST['eliminar_imagen'] == '1') {
    $sql = "UPDATE herramienta SET 
            nombre = '$nombre',
            descripcion = '$descripcion',
            stock_actual = '$stock',
            id_marca = '$id_marca',
            id_medida = '$id_medida',
            imagen_path = NULL
            WHERE id_herramienta = $id_herramienta";
} elseif ($ruta_imagen) {
    $sql = "UPDATE herramienta SET 
            nombre = '$nombre',
            descripcion = '$descripcion',
            stock_actual = '$stock',
            id_marca = '$id_marca',
            id_medida = '$id_medida',
            imagen_path = '$ruta_imagen'
            WHERE id_herramienta = $id_herramienta";
} else {
    $sql = "UPDATE herramienta SET 
            nombre = '$nombre',
            descripcion = '$descripcion',
            stock_actual = '$stock',
            id_marca = '$id_marca',
            id_medida = '$id_medida'
            WHERE id_herramienta = $id_herramienta";
}

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status" => "exito", "mensaje" => "Herramienta actualizada correctamente."]);
} else {
    // Si hay error, eliminar la nueva imagen subida
    if ($ruta_imagen && file_exists("../" . $ruta_imagen)) {
        unlink("../" . $ruta_imagen);
    }
    echo json_encode(["status" => "error", "mensaje" => "Error: " . mysqli_error($conn)]);
}

$conn->close();
?>
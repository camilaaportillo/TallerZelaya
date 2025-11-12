<?php
session_start();
if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_id_rol'] != 1) {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
    exit;
}

require_once '../conexion.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get_bitacora':
        getBitacora();
        break;
    case 'get_usuarios':
        getUsuarios();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}

function getBitacora() {
    global $conn;
    
    try {
        $sql = "SELECT b.*, u.nombre as nombre_usuario 
                FROM bitacora b 
                LEFT JOIN usuario u ON b.id_usuario = u.id_usuario 
                ORDER BY b.fecha_hora DESC 
                LIMIT 1000";
        
        $result = $conn->query($sql);
        $bitacora = [];
        
        while ($row = $result->fetch_assoc()) {
            $bitacora[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'bitacora' => $bitacora
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar bitácora: ' . $e->getMessage()
        ]);
    }
}

function getUsuarios() {
    global $conn;
    
    try {
        $sql = "SELECT id_usuario as id, nombre 
                FROM usuario 
                WHERE activo = 1 
                ORDER BY nombre";
        
        $result = $conn->query($sql);
        $usuarios = [];
        
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'usuarios' => $usuarios
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar usuarios: ' . $e->getMessage()
        ]);
    }
}
?>
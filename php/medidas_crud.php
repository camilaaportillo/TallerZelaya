<?php
include 'conexion.php';

// ✅ AGREGAR MANEJO DE ERRORES
header('Content-Type: application/json');

// ✅ VERIFICAR CONEXIÓN
if ($conn->connect_error) {
    echo json_encode(["error" => "Error de conexión a la base de datos: " . $conn->connect_error]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Verificar si se solicita un estado específico
        if (isset($_GET['estado'])) {
            $estado = $_GET['estado'];
            
            // ✅ VERIFICAR QUE LA CONSULTA PREPARADA FUNCIONA
            $sql = "SELECT * FROM medida WHERE estado = ? ORDER BY id_medida DESC";
            $stmt = $conn->prepare($sql);
            
            if (!$stmt) {
                // ❌ SI LA PREPARACIÓN FALLA
                error_log("Error en prepare: " . $conn->error);
                echo json_encode(["error" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $stmt->bind_param("s", $estado);
            
            if (!$stmt->execute()) {
                // ❌ SI LA EJECUCIÓN FALLA
                error_log("Error en execute: " . $stmt->error);
                echo json_encode(["error" => "Error al ejecutar consulta: " . $stmt->error]);
                break;
            }
            
            $result = $stmt->get_result();
            $medidas = [];
            while ($row = $result->fetch_assoc()) {
                $medidas[] = $row;
            }
            
            $stmt->close();
            echo json_encode($medidas);
        } 
        // Obtener medida específica por ID
        else if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM medida WHERE id_medida = ?");
            
            if (!$stmt) {
                echo json_encode(["error" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $stmt->bind_param("i", $id);
            
            if (!$stmt->execute()) {
                echo json_encode(["error" => "Error al ejecutar consulta: " . $stmt->error]);
                break;
            }
            
            $result = $stmt->get_result();
            $medida = $result->fetch_assoc();
            $stmt->close();
            echo json_encode($medida);
        } 
        // Obtener todas las medidas (activas por defecto)
        else {
            $result = $conn->query("SELECT * FROM medida WHERE estado = 'Activo' ORDER BY id_medida DESC");
            
            if (!$result) {
                echo json_encode(["error" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $medidas = [];
            while ($row = $result->fetch_assoc()) {
                $medidas[] = $row;
            }
            echo json_encode($medidas);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Si se envía estado, es una activación/desactivación
        if (isset($data['id_medida']) && isset($data['estado'])) {
            $stmt = $conn->prepare("UPDATE medida SET estado = ? WHERE id_medida = ?");
            
            if (!$stmt) {
                echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $stmt->bind_param("si", $data['estado'], $data['id_medida']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Estado de medida actualizado correctamente"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al actualizar estado de medida: " . $stmt->error]);
            }
            $stmt->close();
        }
        // Actualizar medida existente (nombre)
        else if (isset($data['id_medida'])) {
            $stmt = $conn->prepare("UPDATE medida SET medida_bicicleta = ? WHERE id_medida = ?");
            
            if (!$stmt) {
                echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $stmt->bind_param("si", $data['medida_bicicleta'], $data['id_medida']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Medida actualizada correctamente"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al actualizar medida: " . $stmt->error]);
            }
            $stmt->close();
        } 
        // Crear nueva medida
        else {
            $stmt = $conn->prepare("INSERT INTO medida (medida_bicicleta, estado) VALUES (?, 'Activo')");
            
            if (!$stmt) {
                echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $stmt->bind_param("s", $data['medida_bicicleta']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Medida creada correctamente", "id" => $stmt->insert_id]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al crear medida: " . $stmt->error]);
            }
            $stmt->close();
        }
        break;
    
    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'];
        
        $stmt = $conn->prepare("UPDATE medida SET estado = 'Inactivo' WHERE id_medida = ?");
        
        if (!$stmt) {
            echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
            break;
        }
        
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Medida desactivada correctamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al desactivar medida: " . $stmt->error]);
        }
        $stmt->close();
        break;
    
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}

$conn->close();
?>
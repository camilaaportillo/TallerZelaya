<?php
include 'conexion.php'; 

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Verificar si se solicita un estado específico
        if (isset($_GET['estado'])) {
            $estado = $_GET['estado'];
            $stmt = $conn->prepare("SELECT * FROM medida WHERE estado = ? ORDER BY id_medida DESC");
            $stmt->bind_param("s", $estado);
            $stmt->execute();
            $result = $stmt->get_result();
            $medidas = [];
            while ($row = $result->fetch_assoc()) {
                $medidas[] = $row;
            }
            echo json_encode($medidas);
        } 
        // Obtener medida específica por ID
        else if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM medida WHERE id_medida = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $medida = $result->fetch_assoc();
            echo json_encode($medida);
        } 
        // Obtener todas las medidas (activas por defecto)
        else {
            $result = $conn->query("SELECT * FROM medida WHERE estado = 'Activo' ORDER BY id_medida DESC");
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
            $stmt->bind_param("si", $data['estado'], $data['id_medida']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Estado de medida actualizado correctamente"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al actualizar estado de medida"]);
            }
        }
        // Actualizar medida existente (nombre)
        else if (isset($data['id_medida'])) {
            $stmt = $conn->prepare("UPDATE medida SET medida_bicicleta = ? WHERE id_medida = ?");
            $stmt->bind_param("si", $data['medida_bicicleta'], $data['id_medida']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Medida actualizada correctamente"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al actualizar medida"]);
            }
        } 
        // Crear nueva medida
        else {
            // Establecer estado como Activo por defecto
            $stmt = $conn->prepare("INSERT INTO medida (medida_bicicleta, estado) VALUES (?, 'Activo')");
            $stmt->bind_param("s", $data['medida_bicicleta']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Medida creada correctamente", "id" => $stmt->insert_id]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al crear medida"]);
            }
        }
        break;
    
    case 'DELETE':
        // En lugar de eliminar, cambiamos el estado a Inactivo
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'];
        
        $stmt = $conn->prepare("UPDATE medida SET estado = 'Inactivo' WHERE id_medida = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Medida desactivada correctamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al desactivar medida"]);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}

$conn->close();
?>
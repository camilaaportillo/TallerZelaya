<?php
include 'conexion.php'; 

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM medida WHERE id_medida = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $medida = $result->fetch_assoc();
            echo json_encode($medida);
        } else {
            // Obtener todas las medidas
            $result = $conn->query("SELECT * FROM medida ORDER BY id_medida DESC");
            $medidas = [];
            while ($row = $result->fetch_assoc()) {
                $medidas[] = $row;
            }
            echo json_encode($medidas);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['id_medida'])) {
            // Actualizar medida existente
            $stmt = $conn->prepare("UPDATE medida SET medida_bicicleta = ? WHERE id_medida = ?");
            $stmt->bind_param("si", $data['medida_bicicleta'], $data['id_medida']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Medida actualizada correctamente"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al actualizar medida"]);
            }
        } else {
            // Crear nueva medida
            $stmt = $conn->prepare("INSERT INTO medida (medida_bicicleta) VALUES (?)");
            $stmt->bind_param("s", $data['medida_bicicleta']);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Medida creada correctamente", "id" => $stmt->insert_id]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al crear medida"]);
            }
        }
        break;
    
    case 'DELETE':
        // Eliminar medida
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'];
        
        $stmt = $conn->prepare("DELETE FROM medida WHERE id_medida = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Medida eliminada correctamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al eliminar medida"]);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}

$conn->close();
?>
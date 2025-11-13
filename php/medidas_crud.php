<?php
include 'conexion.php';
include 'bitacora_helper.php';

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
            // Obtener datos actuales para la bitácora
            $stmt_select = $conn->prepare("SELECT * FROM medida WHERE id_medida = ?");
            $stmt_select->bind_param("i", $data['id_medida']);
            $stmt_select->execute();
            $result = $stmt_select->get_result();
            $medida_actual = $result->fetch_assoc();
            $stmt_select->close();
            
            $stmt = $conn->prepare("UPDATE medida SET estado = ? WHERE id_medida = ?");
            
            if (!$stmt) {
                echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $stmt->bind_param("si", $data['estado'], $data['id_medida']);
            
            if ($stmt->execute()) {
                // Registrar en bitácora
                $accion = $data['estado'] == 'Activo' ? 'ACTIVAR' : 'DESACTIVAR';
                $descripcion = $data['estado'] == 'Activo' ? 
                    "Medida activada: {$medida_actual['medida_bicicleta']}" : 
                    "Medida desactivada: {$medida_actual['medida_bicicleta']}";
                
                registrarEnBitacora('EDITAR', $descripcion, 'medida', $data['id_medida'], 'Medidas');
                
                echo json_encode(["success" => true, "message" => "Estado de medida actualizado correctamente"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al actualizar estado de medida: " . $stmt->error]);
            }
            $stmt->close();
        }
        // Actualizar medida existente (nombre)
        else if (isset($data['id_medida'])) {
            // Obtener datos actuales para la bitácora
            $stmt_select = $conn->prepare("SELECT * FROM medida WHERE id_medida = ?");
            $stmt_select->bind_param("i", $data['id_medida']);
            $stmt_select->execute();
            $result = $stmt_select->get_result();
            $medida_actual = $result->fetch_assoc();
            $stmt_select->close();
            
            $stmt = $conn->prepare("UPDATE medida SET medida_bicicleta = ? WHERE id_medida = ?");
            
            if (!$stmt) {
                echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
                break;
            }
            
            $stmt->bind_param("si", $data['medida_bicicleta'], $data['id_medida']);
            
            if ($stmt->execute()) {
                // Registrar en bitácora
                $descripcion = "Medida actualizada: {$medida_actual['medida_bicicleta']} → {$data['medida_bicicleta']}";
                registrarEnBitacora('EDITAR', $descripcion, 'medida', $data['id_medida'], 'Medidas');
                
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
                $nuevo_id = $stmt->insert_id;
                
                // Registrar en bitácora
                $descripcion = "Nueva medida creada: {$data['medida_bicicleta']}";
                registrarEnBitacora('CREAR', $descripcion, 'medida', $nuevo_id, 'Medidas');
                
                echo json_encode(["success" => true, "message" => "Medida creada correctamente", "id" => $nuevo_id]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al crear medida: " . $stmt->error]);
            }
            $stmt->close();
        }
        break;
    
    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'];
        
        // Obtener datos actuales para la bitácora
        $stmt_select = $conn->prepare("SELECT * FROM medida WHERE id_medida = ?");
        $stmt_select->bind_param("i", $id);
        $stmt_select->execute();
        $result = $stmt_select->get_result();
        $medida_actual = $result->fetch_assoc();
        $stmt_select->close();
        
        $stmt = $conn->prepare("UPDATE medida SET estado = 'Inactivo' WHERE id_medida = ?");
        
        if (!$stmt) {
            echo json_encode(["success" => false, "message" => "Error en la consulta: " . $conn->error]);
            break;
        }
        
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            // Registrar en bitácora
            $descripcion = "Medida desactivada: {$medida_actual['medida_bicicleta']}";
            registrarEnBitacora('ELIMINAR', $descripcion, 'medida', $id, 'Medidas');
            
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
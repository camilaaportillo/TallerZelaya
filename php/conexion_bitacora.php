<?php
class ConexionBitacora {
    private $conn;
    private $bitacora_activa = true;
    private $usuario_bitacora = null;
    private $registrando_bitacora = false; // Bandera para evitar recursión
    
    public function __construct($usuario_id = null, $usuario_nombre = null) {
        $host = "localhost";
        $user = "root";
        $pass = "";
        $db   = "dbtallerb";
        
        $this->conn = new mysqli($host, $user, $pass, $db);
        
        if ($this->conn->connect_error) {
            throw new Exception("Error de conexión: " . $this->conn->connect_error);
        }
        
        $this->conn->set_charset("utf8mb4");
        
        // Configurar usuario para bitácora si se proporciona
        if ($usuario_id && $usuario_nombre) {
            $this->usuario_bitacora = [
                'id' => $usuario_id,
                'nombre' => $usuario_nombre
            ];
        }
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    /**
     * Ejecuta consulta y registra en bitácora si es INSERT, UPDATE, DELETE
     */
    public function ejecutarConsulta($sql, $modulo = 'Sistema') {
        $result = $this->conn->query($sql);
        
        // Registrar en bitácora solo para operaciones que modifican datos
        // y no estamos ya registrando en bitácora (evitar recursión)
        if ($this->bitacora_activa && 
            $this->usuario_bitacora && 
            !$this->registrando_bitacora &&
            $this->esOperacionModificacion($sql)) {
            $this->registrarEnBitacora($sql, $modulo);
        }
        
        return $result;
    }
    
    /**
     * Detecta si la consulta modifica datos
     */
    private function esOperacionModificacion($sql) {
        $sql = trim(strtoupper($sql));
        return strpos($sql, 'INSERT') === 0 || 
               strpos($sql, 'UPDATE') === 0 || 
               strpos($sql, 'DELETE') === 0;
    }
    
    /**
     * Registra la operación en la bitácora
     */
    private function registrarEnBitacora($sql, $modulo) {
        // Activar bandera para evitar recursión
        $this->registrando_bitacora = true;
        
        try {
            $accion = $this->determinarAccion($sql);
            $tabla = $this->extraerTabla($sql);
            
            $ip_address = $this->getClientIp();
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido';
            
            $descripcion = "Ejecutado: " . substr($sql, 0, 200); // Limitar longitud
            
            // Usar query directo para evitar llamar a ejecutarConsulta nuevamente
            $sqlBitacora = "INSERT INTO bitacora (id_usuario, nombre_usuario, accion, descripcion, tabla_afectada, ip_address, user_agent, modulo) 
                           VALUES ('{$this->usuario_bitacora['id']}', 
                                   '{$this->conn->real_escape_string($this->usuario_bitacora['nombre'])}', 
                                   '{$this->conn->real_escape_string($accion)}', 
                                   '{$this->conn->real_escape_string($descripcion)}', 
                                   '{$this->conn->real_escape_string($tabla)}', 
                                   '{$this->conn->real_escape_string($ip_address)}', 
                                   '{$this->conn->real_escape_string($user_agent)}', 
                                   '{$this->conn->real_escape_string($modulo)}')";
            
            $this->conn->query($sqlBitacora);
            
        } catch (Exception $e) {
            // Silenciar errores de bitácora para no afectar la operación principal
            error_log("Error en bitácora: " . $e->getMessage());
        } finally {
            // Desactivar bandera
            $this->registrando_bitacora = false;
        }
    }
    
    private function determinarAccion($sql) {
        $sql = trim(strtoupper($sql));
        if (strpos($sql, 'INSERT') === 0) return 'INSERT';
        if (strpos($sql, 'UPDATE') === 0) return 'UPDATE';
        if (strpos($sql, 'DELETE') === 0) return 'DELETE';
        return 'OTHER';
    }
    
    private function extraerTabla($sql) {
        // Extrae el nombre de la tabla (simplificado)
        preg_match('/(?:FROM|INTO|UPDATE)\s+`?(\w+)`?/i', $sql, $matches);
        return $matches[1] ?? 'desconocida';
    }
    
    private function getClientIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        }
    }
    
    public function close() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
?>
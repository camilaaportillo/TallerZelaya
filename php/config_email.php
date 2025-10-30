<?php
// php/config_email.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// RUTAS CORRECTAS para PHPMailer - BUSCAR EN CARPETA HERMANA
$phpmailer_paths = [
    __DIR__ . '/../phpmailer/src/Exception.php',  // Carpeta al mismo nivel que php/
    __DIR__ . '/../../phpmailer/src/Exception.php', // Otra posible ubicación
    'phpmailer/src/Exception.php' // Ruta relativa
];

$phpmailer_loaded = false;
foreach ($phpmailer_paths as $path) {
    if (file_exists($path)) {
        require $path;
        require str_replace('Exception.php', 'PHPMailer.php', $path);
        require str_replace('Exception.php', 'SMTP.php', $path);
        $phpmailer_loaded = true;
        break;
    }
}

if (!$phpmailer_loaded) {
    throw new Exception('No se pudo encontrar PHPMailer. Buscado en: ' . implode(', ', $phpmailer_paths));
}

class ConfigEmail {
    private $mail;
    
    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->configurar();
    }
    
    private function configurar() {
        try {
            // Cargar configuración SMTP
            $config = include 'config_smtp.php';
            
            // Configuración del servidor
            $this->mail->isSMTP();
            $this->mail->Host = $config['host'];
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $config['usuario'];
            $this->mail->Password = $config['password'];
            $this->mail->SMTPSecure = $config['seguro'];
            $this->mail->Port = $config['puerto'];
            
            // CONFIGURACIÓN UTF-8 PARA CARACTERES ESPECIALES
            $this->mail->CharSet = 'UTF-8';
            $this->mail->Encoding = 'base64';
            
            // Configuración del remitente
            $this->mail->setFrom($config['email_from'], $config['nombre_from']);
            $this->mail->isHTML(true);
            
            // Configuraciones para mejor compatibilidad
            $this->mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
            // Timeout más largo
            $this->mail->Timeout = 30;
            
        } catch (Exception $e) {
            error_log("Error configurando PHPMailer: " . $e->getMessage());
            throw new Exception("Error en configuración de email: " . $e->getMessage());
        }
    }
    
    public function enviarCorreoRecuperacion($destinatario, $nombre, $token = '', $codigo_verificacion = null) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($destinatario, $nombre);
            
            // Obtener la URL base automáticamente
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $base_url = $protocol . '://' . $host . '/tallerZelaya';
            
            $link_recuperacion = $base_url . '/restablecer_password.php?token=' . $token;
            
            if ($codigo_verificacion) {
                // FORMATO CORRECTO PARA ASUNTO CON ACENTOS
                $this->mail->Subject = 'Código de Verificación - Taller de Bicicletas Zelaya';
                $body = $this->crearCuerpoCorreoConCodigo($nombre, $link_recuperacion, $codigo_verificacion);
                $this->mail->AltBody = $this->crearCuerpoTextoPlanoConCodigo($nombre, $link_recuperacion, $codigo_verificacion);
            } else {
                // FORMATO CORRECTO PARA ASUNTO CON ACENTOS
                $this->mail->Subject = 'Restablecer Contraseña - Taller de Bicicletas Zelaya';
                $body = $this->crearCuerpoCorreoConEnlace($nombre, $link_recuperacion);
                $this->mail->AltBody = $this->crearCuerpoTextoPlanoConEnlace($nombre, $link_recuperacion);
            }
            
            $this->mail->Body = $body;
            
            if ($this->mail->send()) {
                error_log("✅ Correo enviado exitosamente a: $destinatario");
                return true;
            } else {
                error_log("❌ Error PHPMailer: " . $this->mail->ErrorInfo);
                return false;
            }
            
        } catch (Exception $e) {
            error_log("💥 Exception enviando correo: " . $e->getMessage());
            return false;
        }
    }

    // ✅ NUEVO MÉTODO: Cuerpo de email con código
    private function crearCuerpoCorreoConCodigo($nombre, $link, $codigo) {
        // FORMATO DÍA/MES/AÑO
        $expiracion = date('d/m/Y H:i', time() + (5 * 60));
        
        return "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .codigo { font-size: 32px; font-weight: bold; text-align: center; background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; color: #333; border: 2px dashed #667eea; }
                .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
                .link-box { background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔧 Taller de Bicicletas Zelaya</h1>
                    <p>Restablecimiento de Contraseña</p>
                </div>
                <div class='content'>
                    <h2>Hola $nombre,</h2>
                    <p>Has solicitado restablecer tu contraseña para el sistema del taller.</p>
                    
                    <p>Usa el siguiente código de verificación:</p>
                    
                    <div class='codigo'>$codigo</div>
                    
                    <p><strong>Opcional:</strong> También puedes usar este enlace directo:</p>
                    <div style='text-align: center;'>
                        <a href='$link' class='btn'>Restablecer Contraseña</a>
                    </div>
                    
                    <div class='link-box'>$link</div>
                    
                    <div class='warning'>
                        <strong>⚠️ Importante:</strong>
                        <ul>
                            <li>El código expira el: <strong>$expiracion</strong></li>
                            <li>No compartas este código con nadie</li>
                            <li>Si no solicitaste este cambio, ignora este correo</li>
                        </ul>
                    </div>
                    
                    <p>Saludos cordiales,<br><strong>El equipo de Taller Zelaya</strong></p>
                </div>
                <div class='footer'>
                    <p>Este es un correo automático, no respondas a este mensaje</p>
                    <p>© " . date('Y') . " Taller de Bicicletas Zelaya</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    // ✅ NUEVO MÉTODO: Versión texto plano con código
    private function crearCuerpoTextoPlanoConCodigo($nombre, $link, $codigo) {
        // FORMATO DÍA/MES/AÑO
        $expiracion = date('d/m/Y H:i', time() + (5 * 60));
        
        return "
CÓDIGO DE VERIFICACIÓN - TALLER DE BICICLETAS ZELAYA
=====================================================

Hola $nombre,

Has solicitado restablecer tu contraseña para el sistema del taller.

Tu código de verificación es:

    $codigo

También puedes usar este enlace directo:
$link

INFORMACIÓN IMPORTANTE:
- El código expira el: $expiracion
- No compartas este código con nadie
- Si no solicitaste este cambio, ignora este correo

Saludos cordiales,
El equipo de Taller Zelaya

---------------------------------
Este es un correo automático, no respondas a este mensaje.
© " . date('Y') . " Taller de Bicicletas Zelaya
        ";
    }

    // ✅ MÉTODO PARA ENVIAR FACTURA ELECTRÓNICA
    public function enviarFacturaElectronica($destinatario, $nombre, $datos_factura) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($destinatario, $nombre);
            
            // ASUNTO CORREGIDO CON UTF-8
            $this->mail->Subject = "Factura Electrónica - Venta #" . $datos_factura['id_venta'] . " - Taller de Bicicletas Zelaya";
            
            $body = $this->crearCuerpoFacturaHTML($datos_factura);
            $this->mail->Body = $body;
            $this->mail->AltBody = $this->crearCuerpoFacturaTexto($datos_factura);
            
            if ($this->mail->send()) {
                error_log("✅ Factura enviada exitosamente a: $destinatario - Venta #" . $datos_factura['id_venta']);
                return true;
            } else {
                error_log("❌ Error enviando factura: " . $this->mail->ErrorInfo);
                return false;
            }
            
        } catch (Exception $e) {
            error_log("💥 Exception enviando factura: " . $e->getMessage());
            return false;
        }
    }

    private function crearCuerpoFacturaHTML($datos) {
        // CONVERTIR FECHA A FORMATO DÍA/MES/AÑO
        $fecha_formateada = $this->formatearFecha($datos['fecha']);
        
        $html = "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .table th { background-color: #f8f9fa; font-weight: bold; color: #333; }
                .total { background: #28a745; color: white; font-weight: bold; font-size: 1.3em; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
                .section-title { background: #e9ecef; padding: 15px; margin: 25px 0 15px 0; font-weight: bold; border-left: 4px solid #007bff; }
                .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔧 Taller de Bicicletas Zelaya</h1>
                    <p>Primera Avenida Sur, Barrio El Centro • San Martín #11, San Salvador</p>
                </div>
                
                <div class='content'>
                    <h2>Factura Electrónica #" . $datos['id_venta'] . "</h2>
                    
                    <div class='info-box'>
                        <p><strong>Fecha:</strong> " . $fecha_formateada . "</p>
                        <p><strong>Cliente:</strong> " . htmlspecialchars($datos['cliente_nombre']) . "</p>
                        <p><strong>Atendido por:</strong> " . htmlspecialchars($datos['usuario_nombre']) . "</p>
                    </div>";
        
        // Productos
        if (!empty($datos['productos'])) {
            $html .= "<div class='section-title'>📦 Productos</div>
            <table class='table'>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>SubTotal</th>
                </tr>";
            
            foreach ($datos['productos'] as $producto) {
                $html .= "
                <tr>
                    <td>" . htmlspecialchars($producto['nombre']) . " (" . htmlspecialchars($producto['codigo']) . ")</td>
                    <td>" . $producto['cantidad'] . "</td>
                    <td>$" . number_format($producto['precio_unitario'], 2) . "</td>
                    <td>$" . number_format($producto['subtotal'], 2) . "</td>
                </tr>";
            }
            $html .= "</table>";
        }
        
        // Servicios
        if (!empty($datos['servicios'])) {
            $html .= "<div class='section-title'>🔧 Servicios/Reparaciones</div>
            <table class='table'>
                <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>SubTotal</th>
                </tr>";
            
            foreach ($datos['servicios'] as $servicio) {
                $html .= "
                <tr>
                    <td>" . htmlspecialchars($servicio['descripcion']) . "</td>
                    <td>" . $servicio['cantidad'] . "</td>
                    <td>$" . number_format($servicio['precio'], 2) . "</td>
                    <td>$" . number_format($servicio['subtotal'], 2) . "</td>
                </tr>";
            }
            $html .= "</table>";
        }
        
        $html .= "
                    <div class='total'>
                        TOTAL: $" . number_format($datos['total'], 2) . "
                    </div>
                    
                    <div class='footer'>
                        <p><strong>📝 NOTA:</strong> La mano de obra está incluida en el precio total</p>
                        <p>¡Gracias por su preferencia! • Taller de Bicicletas Zelaya</p>
                        <p><small>Este es un correo automático, no responda a este mensaje</small></p>
                    </div>
                </div>
            </div>
        </body>
        </html>";
        
        return $html;
    }

    private function crearCuerpoFacturaTexto($datos) {
        // CONVERTIR FECHA A FORMATO DÍA/MES/AÑO
        $fecha_formateada = $this->formatearFecha($datos['fecha']);
        
        $texto = "FACTURA ELECTRONICA - Taller de Bicicletas Zelaya\n";
        $texto .= "=====================================================\n\n";
        $texto .= "Venta #" . $datos['id_venta'] . "\n";
        $texto .= "Fecha: " . $fecha_formateada . "\n";
        $texto .= "Cliente: " . $datos['cliente_nombre'] . "\n";
        $texto .= "Atendido por: " . $datos['usuario_nombre'] . "\n\n";
        
        if (!empty($datos['productos'])) {
            $texto .= "PRODUCTOS:\n";
            $texto .= "----------\n";
            foreach ($datos['productos'] as $producto) {
                $texto .= "- " . $producto['nombre'] . " (" . $producto['codigo'] . ") x" . $producto['cantidad'] . " = $" . number_format($producto['subtotal'], 2) . "\n";
            }
            $texto .= "\n";
        }
        
        if (!empty($datos['servicios'])) {
            $texto .= "SERVICIOS/REPARACIONES:\n";
            $texto .= "-----------------------\n";
            foreach ($datos['servicios'] as $servicio) {
                $texto .= "- " . $servicio['descripcion'] . " x" . $servicio['cantidad'] . " = $" . number_format($servicio['subtotal'], 2) . "\n";
            }
            $texto .= "\n";
        }
        
        $texto .= "TOTAL: $" . number_format($datos['total'], 2) . "\n\n";
        $texto .= "NOTA: La mano de obra está incluida en el precio total\n\n";
        $texto .= "¡Gracias por su preferencia!\n";
        $texto .= "Taller de Bicicletas Zelaya\n";
        
        return $texto;
    }

    // ✅ NUEVO MÉTODO PARA FORMATEAR FECHAS
    private function formatearFecha($fecha) {
        // Si la fecha ya está en formato d/m/Y, la dejamos igual
        if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}/', $fecha)) {
            return $fecha;
        }
        
        // Si viene en formato Y-m-d (de base de datos), la convertimos
        if (preg_match('/^\d{4}-\d{1,2}-\d{1,2}/', $fecha)) {
            return date('d/m/Y', strtotime($fecha));
        }
        
        // Si no reconocemos el formato, devolvemos la fecha original
        return $fecha;
    }

    // Métodos existentes que deben estar presentes
    private function crearCuerpoCorreoConEnlace($nombre, $link) {
        // FORMATO DÍA/MES/AÑO
        $expiracion = date('d/m/Y H:i', time() + (5 * 60));
        
        return "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
                .link-box { background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔧 Taller de Bicicletas Zelaya</h1>
                    <p>Restablecimiento de Contraseña</p>
                </div>
                <div class='content'>
                    <h2>Hola $nombre,</h2>
                    <p>Has solicitado restablecer tu contraseña para el sistema del taller.</p>
                    
                    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    
                    <div style='text-align: center;'>
                        <a href='$link' class='btn'>Restablecer Contraseña</a>
                    </div>
                    
                    <div class='link-box'>$link</div>
                    
                    <div class='warning'>
                        <strong>⚠️ Importante:</strong>
                        <ul>
                            <li>El enlace expira el: <strong>$expiracion</strong></li>
                            <li>No compartas este enlace con nadie</li>
                            <li>Si no solicitaste este cambio, ignora este correo</li>
                        </ul>
                    </div>
                    
                    <p>Saludos cordiales,<br><strong>El equipo de Taller Zelaya</strong></p>
                </div>
                <div class='footer'>
                    <p>Este es un correo automático, no respondas a este mensaje</p>
                    <p>© " . date('Y') . " Taller de Bicicletas Zelaya</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    private function crearCuerpoTextoPlanoConEnlace($nombre, $link) {
        // FORMATO DÍA/MES/AÑO
        $expiracion = date('d/m/Y H:i', time() + (5 * 60));
        
        return "
RESTABLECIMIENTO DE CONTRASEÑA - TALLER DE BICICLETAS ZELAYA
=============================================================

Hola $nombre,

Has solicitado restablecer tu contraseña para el sistema del taller.

Haz clic en el siguiente enlace para restablecer tu contraseña:

$link

INFORMACIÓN IMPORTANTE:
- El enlace expira el: $expiracion
- No compartas este enlace con nadie
- Si no solicitaste este cambio, ignora este correo

Saludos cordiales,
El equipo de Taller Zelaya

---------------------------------
Este es un correo automático, no respondas a este mensaje.
© " . date('Y') . " Taller de Bicicletas Zelaya
        ";
    }
} // CIERRE DE LA CLASE ConfigEmail
?>
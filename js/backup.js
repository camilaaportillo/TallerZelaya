// FUNCIÓN AUXILIAR PARA CERRAR MODALES DE FORMA SEGURA
function closeModal(modalId) {
    console.log('🚪 Cerrando modal:', modalId);

    const modalElement = document.getElementById(modalId);

    if (!modalElement) {
        console.error('❌ No se encontró el modal:', modalId);
        return;
    }

    // Usar Bootstrap Modal si está inicializado
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
        console.log('✅ Modal cerrado con Bootstrap');
    } else {
        // Cierre manual como fallback
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        // Remover backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        console.log('✅ Modal cerrado manualmente');
    }

    // Limpiar variables globales
    if (modalId === 'restoreModal') {
        currentBackupToRestore = '';
    } else if (modalId === 'deleteModal') {
        currentBackupToDelete = '';
    } else if (modalId === 'passwordModal') {
        document.getElementById('admin-password').value = '';
    }
}
// =============================================
// SISTEMA DE BACKUPS AUTOMÁTICOS CON LOCK
// =============================================

class BackupMonitor {
    constructor() {
        this.isMonitoring = false;
        this.checkInterval = null;
        this.init();
    }

    init() {
        this.startPolling();
        this.setupEventListeners();
    }

    startPolling() {
        // Verificar cada 1 minuto (60000 ms)
        const jitter = Math.random() * 30000; // 0-30 segundos de variación

        setTimeout(() => {
            this.checkInterval = setInterval(() => {
                this.checkBackups();
            }, 60000); // 1 minuto

            // Verificar inmediatamente después del jitter
            this.checkBackups();
        }, jitter);
    }

    stopPolling() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    async checkBackups() {
        // Solo verificar si la página está visible
        if (document.visibilityState !== 'visible') {
            return;
        }

        try {
            const response = await fetch('php/backup_manager.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=check_scheduled_backups'
            });

            const data = await response.json();
            this.handleBackupResult(data);
        } catch (error) {
            console.error('❌ Error verificando backups:', error);
        }
    }

    handleBackupResult(data) {
        console.log('📊 Respuesta backup automático:', data);

        if (data.success) {
            if (data.executed > 0) {
                // Backup ejecutado por ESTE usuario
                console.log('✅ Backup automático ejecutado:', data.message);
                this.showNotification(`🤖 Backup automático ejecutado: ${data.message}`, 'success');
                this.refreshUI();
            } else if (data.locked) {
                // Backup siendo ejecutado por OTRO usuario
                console.log('⏳ Backup en ejecución por otro usuario');
                this.showNotification('🔒 Backup automático en ejecución...', 'info');

                // Reintentar en 10 segundos para actualizar la lista
                setTimeout(() => {
                    this.refreshUI();
                }, 10000);
            } else {
                // No se requirió ejecutar backup
                console.log('ℹ️ ', data.message);
            }
        } else {
            console.error('❌ Error en backup automático:', data.message);
        }
    }

    showNotification(message, type = 'success') {
        const alertClass = type === 'info' ? 'alert-info' : 'alert-success';
        const icon = type === 'info' ? 'fa-info-circle' : 'fa-robot';

        // Buscar si ya existe una notificación
        let existingNotification = document.querySelector('.backup-auto-notification');

        if (!existingNotification) {
            const notification = document.createElement('div');
            notification.className = `alert ${alertClass} backup-auto-notification position-fixed`;
            notification.style.cssText = `
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 350px;
                animation: slideInRight 0.3s ease-out;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            notification.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas ${icon} fa-2x me-3"></i>
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${type === 'info' ? '🔒 Backup en Progreso' : '🤖 Backup Automático'}</h6>
                        <p class="mb-0 small">${message}</p>
                        <small class="text-muted">${new Date().toLocaleTimeString()}</small>
                    </div>
                    <button type="button" class="btn-close btn-sm" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            `;

            document.body.appendChild(notification);

            // Auto-eliminar después de 8 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 8000);
        }
    }

    refreshUI() {
        // Actualizar la interfaz llamando a las funciones globales existentes
        if (typeof window.loadBackups === 'function') window.loadBackups();
        if (typeof window.loadStats === 'function') window.loadStats();
        if (typeof window.loadSchedules === 'function') window.loadSchedules();
    }

    setupEventListeners() {
        // Pausar cuando la página no es visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.startPolling();
            } else {
                this.stopPolling();
            }
        });
    }
}

// =============================================
// CÓDIGO EXISTente - SIN MODIFICACIONES
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el monitor de backups automáticos
    window.backupMonitor = new BackupMonitor();

    // Verificar permisos primero
    if (!verificarPermisosBackup()) {
        return;
    }

    // Elementos del DOM
    const btnCreateBackup = document.getElementById('btn-create-backup');
    const btnUploadBackup = document.getElementById('btn-upload-backup');
    const btnRefreshList = document.getElementById('btn-refresh-list');
    const btnScheduleBackup = document.getElementById('btn-schedule-backup');
    const btnUploadSubmit = document.getElementById('btn-upload-submit');
    const btnScheduleSubmit = document.getElementById('btn-schedule-submit');
    const btnPasswordSubmit = document.getElementById('btn-password-submit');
    const btnRestoreConfirm = document.getElementById('btn-restore-confirm');
    const btnDeleteConfirm = document.getElementById('btn-delete-confirm');
    const btnRefreshSchedules = document.getElementById('btn-refresh-schedules');
    const backupList = document.getElementById('backup-list');
    const noBackups = document.getElementById('no-backups');
    const backupProgress = document.getElementById('backup-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const autoRefresh = document.getElementById('auto-refresh');
    const schedulesList = document.getElementById('schedules-list');
    const noSchedules = document.getElementById('no-schedules');
    const scheduleType = document.getElementById('schedule-type');
    const weeklyDayContainer = document.getElementById('weekly-day-container');
    const monthlyDayContainer = document.getElementById('monthly-day-container');

    // Variables
    let autoRefreshInterval;
    let currentBackupToRestore = '';
    let currentBackupToDelete = '';
    let currentScheduleToDelete = '';
    let currentActionType = '';

    // Inicializar
    init();

    function init() {
        // Cargar lista de backups
        loadBackups();

        // Cargar estadísticas
        loadStats();

        // Cargar programaciones
        loadSchedules();

        // Iniciar auto-actualización de la interfaz
        startAutoRefresh();

        // Configurar event listeners
        setupEventListeners();

        // Inicializar campos de programación
        updateScheduleFields();
        // INICIALIZAR VALIDACIÓN DE CONTRASEÑA
        setupPasswordValidation();
    }

    function setupEventListeners() {
        // Botón crear backup
        btnCreateBackup.addEventListener('click', function () {
            currentActionType = 'create_backup';
            showPasswordModal('crear un nuevo backup');
        });

        // Botón programar backup
        btnScheduleBackup.addEventListener('click', function () {
            currentActionType = 'save_schedule';
            showPasswordModal('programar un backup automático');
        });

        // Botón confirmar subida
        btnUploadSubmit.addEventListener('click', uploadBackup);

        // Botón confirmar programación
        btnScheduleSubmit.addEventListener('click', saveSchedule);

        // Botón actualizar programaciones
        btnRefreshSchedules.addEventListener('click', function () {
            loadSchedules();
            showAlert('Programaciones actualizadas', 'info');
        });

        // Botón confirmar contraseña
        btnPasswordSubmit.addEventListener('click', verifyPassword);

        // BOTÓN CONFIRMAR RESTAURACIÓN - CORREGIDO
        btnRestoreConfirm.addEventListener('click', function () {
            console.log('🖱️ Botón restaurar confirmado clickeado - SOLICITANDO CONTRASEÑA');
            currentActionType = 'restore_backup';
            // Cerrar modal de confirmación primero
            closeModal('restoreModal');
            showPasswordModal('restaurar el backup');
        });

        // BOTÓN CONFIRMAR ELIMINACIÓN - CORREGIDO
        btnDeleteConfirm.addEventListener('click', function () {
            console.log('🖱️ Botón eliminar confirmado clickeado - SOLICITANDO CONTRASEÑA');
            currentActionType = 'delete_backup';
            // Cerrar modal de confirmación primero
            closeModal('deleteModal');
            showPasswordModal('eliminar el backup');
        });

        // Cambio en tipo de programación
        scheduleType.addEventListener('change', function () {
            updateScheduleFields();
        });

        // Auto-actualización de interfaz
        autoRefresh.addEventListener('change', function () {
            if (this.checked) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        });

        // Enter en campo de contraseña
        document.getElementById('admin-password').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevenir envío del formulario
                verifyPassword();
            }
        });
    }
    // Función para verificar permisos
    function verificarPermisosBackup() {
        const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
        const rol = usuario.rol || sessionStorage.getItem('usuario_rol') || '';

        document.getElementById('rol-actual').textContent = rol;

        if (rol !== 'Administrador' && rol !== '1') {
            document.getElementById('permisos-mensaje').textContent =
                'Solo los administradores pueden acceder al módulo de backups.';
            document.getElementById('permisos-alert').classList.remove('d-none');

            // Deshabilitar todos los botones
            document.querySelectorAll('button').forEach(btn => {
                if (btn.id !== 'btn-refresh-list') {
                    btn.disabled = true;
                }
            });

            return false;
        }

        return true;
    }

    // Función para mostrar modal de contraseña
    function showPasswordModal(action) {
    const passwordMessage = document.getElementById('password-message');
    if (passwordMessage) {
        passwordMessage.textContent = `Para ${action}, ingrese su contraseña de administrador:`;
    }
    
    // Resetear estado del formulario
    resetPasswordForm();
    
    const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    passwordModal.show();

    // Enfocar campo de contraseña
    setTimeout(() => {
        const passwordInput = document.getElementById('admin-password');
        if (passwordInput) {
            passwordInput.focus();
        }
    }, 500);
}
    // Función para resetear el formulario de contraseña
   function resetPasswordForm() {
    const passwordInput = document.getElementById('admin-password');
    const passwordError = document.getElementById('password-error');
    const passwordSuccess = document.getElementById('password-success');
    const passwordAlert = document.getElementById('password-alert');
    
    if (passwordInput) {
        // Limpiar campo
        passwordInput.value = '';
        
        // Resetear clases de validación
        passwordInput.classList.remove('is-invalid', 'is-valid');
    }
    
    if (passwordError) {
        passwordError.style.display = 'none';
        passwordError.textContent = 'Por favor ingrese su contraseña';
    }
    
    if (passwordSuccess) {
        passwordSuccess.style.display = 'none';
    }
    
    if (passwordAlert) {
        passwordAlert.classList.add('d-none');
    }
    
    // Restaurar botón
    const submitBtn = document.getElementById('btn-password-submit');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Verificar';
        submitBtn.disabled = false;
    }
}

    // Función para mostrar error en el campo de contraseña
   function showPasswordError(message) {
    console.log('🔴 Mostrando error de contraseña:', message);
    
    const passwordInput = document.getElementById('admin-password');
    const passwordError = document.getElementById('password-error');
    const passwordAlert = document.getElementById('password-alert');
    const passwordAlertMessage = document.getElementById('password-alert-message');
    
    // Validar que los elementos existan
    if (!passwordInput) {
        console.error('❌ No se encontró passwordInput');
        return;
    }
    
    // Mostrar error en el campo
    passwordInput.classList.remove('is-valid');
    passwordInput.classList.add('is-invalid');
    
    // Mostrar mensaje de error debajo del input
    if (passwordError) {
        passwordError.textContent = message || 'Contraseña incorrecta';
        passwordError.style.display = 'block';
    }
    
    // Mostrar alerta adicional si existe
    if (passwordAlert && passwordAlertMessage) {
        passwordAlertMessage.textContent = message || 'Contraseña incorrecta';
        passwordAlert.classList.remove('d-none');
    }
    
    // Enfocar y seleccionar el campo
    passwordInput.focus();
    passwordInput.select();
}

    // Función para mostrar éxito en el campo de contraseña
   function showPasswordSuccess() {
    const passwordInput = document.getElementById('admin-password');
    const passwordSuccess = document.getElementById('password-success');
    const passwordAlert = document.getElementById('password-alert');
    
    if (passwordInput) {
        // Mostrar éxito en el campo
        passwordInput.classList.remove('is-invalid');
        passwordInput.classList.add('is-valid');
    }
    
    if (passwordAlert) {
        passwordAlert.classList.add('d-none');
    }
    
    // Mostrar mensaje de éxito si existe
    if (passwordSuccess) {
        passwordSuccess.style.display = 'block';
    }
}
    // Función mejorada para validar contraseña en tiempo real
   function setupPasswordValidation() {
    const passwordInput = document.getElementById('admin-password');
    
    if (!passwordInput) {
        console.error('❌ No se encontró el campo de contraseña');
        return;
    }
    
    passwordInput.addEventListener('input', function() {
        if (this.value.trim().length > 0) {
            // Remover estados de error cuando el usuario empiece a escribir
            this.classList.remove('is-invalid');
            hidePasswordError();
        }
    });
    
    // Validar al perder el foco
    passwordInput.addEventListener('blur', function() {
        if (this.value.trim().length === 0) {
            showPasswordError('Por favor ingrese su contraseña');
        }
    });
}

// Función para ocultar errores de contraseña
function hidePasswordError() {
    const passwordError = document.getElementById('password-error');
    const passwordAlert = document.getElementById('password-alert');
    
    if (passwordError) {
        passwordError.style.display = 'none';
    }
    
    if (passwordAlert) {
        passwordAlert.classList.add('d-none');
    }
}

    // Función para verificar contraseña
    function verifyPassword() {
    const passwordInput = document.getElementById('admin-password');
    
    if (!passwordInput) {
        console.error('❌ No se encontró el campo de contraseña');
        showAlert('Error: No se puede acceder al campo de contraseña', 'danger');
        return;
    }
    
    const password = passwordInput.value.trim();

    // Validación básica del lado del cliente
    if (!password) {
        showPasswordError('Por favor ingrese su contraseña');
        return;
    }

    if (password.length < 4) {
        showPasswordError('La contraseña debe tener al menos 4 caracteres');
        return;
    }

    console.log('🔐 Verificando contraseña para acción:', currentActionType);

    // Mostrar estado de carga en el botón
    const submitBtn = document.getElementById('btn-password-submit');
    if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verificando...';
        submitBtn.disabled = true;

        // Ocultar errores previos
        hidePasswordError();

        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=check_password&password=${encodeURIComponent(password)}&action_type=${currentActionType}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('📨 Respuesta de verificación:', data);
            
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            if (data.success) {
                // Mostrar éxito y proceder
                showPasswordSuccess();
                
                // Pequeño delay para que el usuario vea el check verde
                setTimeout(() => {
                    closeModal('passwordModal');
                    console.log('✅ Contraseña correcta, ejecutando acción:', currentActionType);
                    executeActionAfterPassword();
                }, 800);
                
            } else {
                // Mostrar error específico del servidor
                showPasswordError(data.message || 'Contraseña incorrecta');
            }
        })
        .catch(error => {
            console.error('❌ Error de conexión:', error);
            
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            showPasswordError('Error de conexión con el servidor');
        });
    } else {
        console.error('❌ No se encontró el botón de verificar');
        showAlert('Error: No se puede acceder al botón de verificación', 'danger');
    }
}
    // Función para ejecutar acción después de verificar contraseña
    function executeActionAfterPassword() {
        console.log('🎯 Ejecutando acción después de contraseña:', currentActionType);

        // Cerrar modal de contraseña primero
        closeModal('passwordModal');

        switch (currentActionType) {
            case 'create_backup':
                console.log('🚀 Iniciando creación de backup...');
                createBackup();
                break;
            case 'upload_backup':
                console.log('📤 Mostrando modal de subida...');
                const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
                uploadModal.show();
                break;
            case 'restore_backup':
                console.log('🔁 Restaurando backup:', currentBackupToRestore);
                if (currentBackupToRestore) {
                    // CERRAR MODAL DE CONFIRMACIÓN PRIMERO
                    closeModal('restoreModal');
                    restoreBackup(currentBackupToRestore);
                } else {
                    console.error('❌ No hay backup seleccionado para restaurar');
                    showAlert('No hay backup seleccionado para restaurar', 'danger');
                }
                break;
            case 'delete_backup':
                console.log('🗑️ Eliminando backup:', currentBackupToDelete);
                if (currentBackupToDelete) {
                    // CERRAR MODAL DE CONFIRMACIÓN PRIMERO
                    closeModal('deleteModal');
                    deleteBackup(currentBackupToDelete);
                } else {
                    console.error('❌ No hay backup seleccionado para eliminar');
                    showAlert('No hay backup seleccionado para eliminar', 'danger');
                }
                break;
            case 'save_schedule':
                console.log('⏰ Mostrando modal de programación...');
                const scheduleModal = new bootstrap.Modal(document.getElementById('scheduleModal'));
                scheduleModal.show();
                break;
            case 'delete_schedule':
                console.log('🗑️ Eliminando programación...');
                deleteScheduleConfirmed();
                break;
        }
    }
    // Función para crear backup
    function createBackup() {
        console.log('🛠️ Iniciando proceso de creación de backup...');

        // Mostrar progreso
        backupProgress.style.display = 'block';
        updateProgress(0);

        // Deshabilitar botón
        btnCreateBackup.disabled = true;
        btnCreateBackup.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creando...';

        // Simular progreso
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 90) {
                clearInterval(progressInterval);
            }
            updateProgress(progress);
        }, 300);

        // Hacer petición al servidor
        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=create_backup'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('📊 Respuesta del servidor:', data);

                clearInterval(progressInterval);
                updateProgress(100);

                if (data.success) {
                    showAlert('✅ ' + data.message, 'success');
                    // Recargar listas
                    loadBackups();
                    loadStats();
                } else {
                    showAlert('❌ ' + data.message, 'danger');
                }

                // Restaurar interfaz
                setTimeout(() => {
                    backupProgress.style.display = 'none';
                    btnCreateBackup.disabled = false;
                    btnCreateBackup.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Crear Backup';
                }, 2000);
            })
            .catch(error => {
                console.error('❌ Error en createBackup:', error);
                clearInterval(progressInterval);
                backupProgress.style.display = 'none';
                btnCreateBackup.disabled = false;
                btnCreateBackup.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Crear Backup';
                showAlert('❌ Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función para subir backup
    function uploadBackup() {
        const fileInput = document.getElementById('backup-file');
        const backupName = document.getElementById('backup-name');

        if (!fileInput.files.length) {
            showAlert('Por favor selecciona un archivo', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'upload_backup');
        formData.append('backup-file', fileInput.files[0]);
        formData.append('backup-name', backupName.value);

        fetch('php/backup_manager.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Backup subido correctamente', 'success');
                    // Cerrar modal
                    const uploadModal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
                    uploadModal.hide();
                    // Limpiar formulario
                    document.getElementById('upload-form').reset();
                    // Actualizar lista
                    loadBackups();
                    loadStats();
                } else {
                    showAlert('Error al subir backup: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                showAlert('Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función mejorada para restaurar backup
    function restoreBackup(filename) {
        console.log('🔁 Restaurando backup:', filename);

        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=restore_backup&filename=' + encodeURIComponent(filename)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('📨 Respuesta de restauración:', data);

                if (data.success) {
                    showAlert('✅ Backup restaurado correctamente', 'success');
                } else {
                    showAlert('❌ Error al restaurar backup: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('❌ Error en restoreBackup:', error);
                showAlert('❌ Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función para eliminar backup
    function deleteBackup(filename) {
        console.log('🗑️ Eliminando backup:', filename);

        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=delete_backup&filename=' + encodeURIComponent(filename)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('📨 Respuesta de eliminación:', data);
                if (data.success) {
                    showAlert('✅ Backup eliminado correctamente', 'success');
                    // Actualizar lista
                    loadBackups();
                    loadStats();
                    if (typeof loadBackupLogs === 'function') loadBackupLogs();
                } else {
                    showAlert('❌ Error al eliminar backup: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('❌ Error en deleteBackup:', error);
                showAlert('❌ Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función para guardar programación
    function saveSchedule() {
        const type = document.getElementById('schedule-type').value;
        const time = document.getElementById('schedule-time').value;
        const active = document.getElementById('schedule-active').checked;
        let day = null;

        if (type === 'weekly') {
            day = document.getElementById('schedule-day-week').value;
        } else if (type === 'monthly') {
            day = document.getElementById('schedule-day-month').value;
        }

        const params = new URLSearchParams({
            action: 'save_schedule',
            type: type,
            time: time,
            active: active
        });

        if (day !== null) {
            params.append('day', day);
        }

        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Programación guardada correctamente', 'success');
                    // Cerrar modal
                    const scheduleModal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
                    scheduleModal.hide();
                    // Limpiar formulario
                    document.getElementById('schedule-form').reset();
                    // Actualizar lista de programaciones
                    loadSchedules();
                    loadStats();
                } else {
                    showAlert('Error al guardar programación: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                showAlert('Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función para cargar lista de backups
    function loadBackups() {
        console.log('📂 Cargando lista de backups...');
        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=list_backups'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    displayBackups(data.backups);
                } else {
                    showAlert('Error al cargar backups: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('❌ Error cargando backups:', error);
                showAlert('Error de conexión al cargar backups: ' + error.message, 'danger');
            });
    }

    // Función para cargar programaciones
    function loadSchedules() {
        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=list_schedules'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displaySchedules(data.schedules);
                } else {
                    showAlert('Error al cargar programaciones: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                showAlert('Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función para cargar estadísticas
    function loadStats() {
        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=get_stats'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('backup-count').textContent = data.stats.backup_count;
                    document.getElementById('storage-used').textContent = data.stats.storage_used;
                    document.getElementById('db-status').textContent = data.stats.db_status;
                    document.getElementById('schedule-count').textContent = data.stats.schedule_count;

                }
            })
            .catch(error => {
                console.error('Error al cargar estadísticas:', error);
            });
    }

    // Función para mostrar backups en la tabla
    function displayBackups(backups) {
        if (!backups || backups.length === 0) {
            backupList.innerHTML = '';
            noBackups.style.display = 'block';
            return;
        }

        noBackups.style.display = 'none';

        let html = '';
        backups.forEach(backup => {
            html += `
                <tr>
                    <td>
                        <i class="fas fa-file-code text-primary me-2"></i>
                        ${backup.filename}
                    </td>
                    <td>${backup.date}</td>
                    <td>${backup.size}</td>
                    
                    <td>
                        <div class="backup-actions">
                            <button class="btn btn-sm btn-outline-primary btn-action" 
                                    onclick="downloadBackup('${backup.filename}')" 
                                    title="Descargar">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning btn-action" 
                                    onclick="showRestoreModal('${backup.filename}')" 
                                    title="Restaurar">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-action" 
                                    onclick="showDeleteModal('${backup.filename}')" 
                                    title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        backupList.innerHTML = html;
    }

    // Función para mostrar programaciones
    function displaySchedules(schedules) {
        if (schedules.length === 0) {
            schedulesList.innerHTML = '';
            noSchedules.style.display = 'block';
            return;
        }

        noSchedules.style.display = 'none';

        let html = '';
        schedules.forEach(schedule => {
            let frecuencia = '';
            let detalles = '';

            switch (schedule.type) {
                case 'daily':
                    frecuencia = 'Diario';
                    detalles = `Todos los días a las ${schedule.time}`;
                    break;
                case 'weekly':
                    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    frecuencia = 'Semanal';
                    detalles = `${dias[schedule.day]} a las ${schedule.time}`;
                    break;
                case 'monthly':
                    frecuencia = 'Mensual';
                    detalles = `Día ${schedule.day} de cada mes a las ${schedule.time}`;
                    break;
            }

            html += `
                <div class="schedule-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${frecuencia}</h6>
                            <p class="mb-1 text-muted">${detalles}</p>
                            <small class="text-muted">
                                Creado por: ${schedule.created_by || 'Sistema'} 
                                el ${schedule.created_at || 'Fecha no disponible'}
                            </small>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="badge ${schedule.active ? 'bg-success' : 'bg-secondary'} schedule-badge me-2">
                                ${schedule.active ? 'Activo' : 'Inactivo'}
                            </span>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteSchedule('${schedule.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        schedulesList.innerHTML = html;
    }

    // Función para actualizar campos de programación
    function updateScheduleFields() {
        const type = scheduleType.value;

        weeklyDayContainer.style.display = 'none';
        monthlyDayContainer.style.display = 'none';

        if (type === 'weekly') {
            weeklyDayContainer.style.display = 'block';
        } else if (type === 'monthly') {
            monthlyDayContainer.style.display = 'block';
        }
    }

    // Función para descargar backup
    function downloadBackup(filename) {
        window.location.href = 'php/backup_manager.php?action=download&filename=' + encodeURIComponent(filename);
    }

    // Función para mostrar modal de restauración
    function showRestoreModal(filename) {
        currentBackupToRestore = filename;
        document.getElementById('restore-filename').textContent = filename;

        // Cerrar cualquier modal de contraseña abierto primero
        closeModal('passwordModal');

        const restoreModal = new bootstrap.Modal(document.getElementById('restoreModal'));
        restoreModal.show();
    }


    // Función para mostrar modal de eliminación
    function showDeleteModal(filename) {
        currentBackupToDelete = filename;
        document.getElementById('delete-filename').textContent = filename;

        // Cerrar cualquier modal de contraseña abierto primero
        closeModal('passwordModal');

        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();
    }

    // Función para eliminar programación
    function deleteSchedule(scheduleId) {
        currentActionType = 'delete_schedule';
        currentScheduleToDelete = scheduleId;
        showPasswordModal('eliminar la programación');
    }

    // Función para eliminar programación después de verificar contraseña
    function deleteScheduleConfirmed() {
        fetch('php/backup_manager.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=delete_schedule&id=' + encodeURIComponent(currentScheduleToDelete)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Programación eliminada correctamente', 'success');
                    loadSchedules();
                    loadStats();
                } else {
                    showAlert('Error al eliminar programación: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                showAlert('Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función para actualizar barra de progreso
    function updateProgress(percent) {
        progressBar.style.width = percent + '%';
        progressPercent.textContent = Math.round(percent) + '%';
    }

  // Función para mostrar notificaciones estilo toast
function showAlert(message, type = 'info') {
    console.log(`📢 Mostrando alerta [${type}]:`, message);
    
    // Definir iconos y colores según el tipo
    const alertConfig = {
        'success': {
            icon: 'fa-check-circle',
            bgClass: 'alert-success',
            title: 'Éxito'
        },
        'danger': {
            icon: 'fa-exclamation-circle',
            bgClass: 'alert-danger',
            title: 'Error'
        },
        'warning': {
            icon: 'fa-exclamation-triangle',
            bgClass: 'alert-warning',
            title: 'Advertencia'
        },
        'info': {
            icon: 'fa-info-circle',
            bgClass: 'alert-info',
            title: 'Información'
        }
    };
    
    const config = alertConfig[type] || alertConfig.info;
    
    // Buscar si ya existe una notificación con el mismo mensaje
    const existingNotifications = document.querySelectorAll('.custom-alert-notification');
    for (let notif of existingNotifications) {
        if (notif.querySelector('.alert-message').textContent === message) {
            console.log('⚠️ Notificación duplicada, ignorando...');
            return;
        }
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert ${config.bgClass} custom-alert-notification position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        max-width: 500px;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
        border: none;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-start">
            <i class="fas ${config.icon} fa-2x me-3 mt-1"></i>
            <div class="flex-grow-1">
                <h6 class="mb-1 fw-bold">${config.title}</h6>
                <p class="mb-0 small alert-message">${message}</p>
                <small class="text-muted">${new Date().toLocaleTimeString()}</small>
            </div>
            <button type="button" class="btn-close btn-sm ms-2 mt-1" onclick="closeNotification(this)"></button>
        </div>
    `;
    
    // Agregar al cuerpo del documento
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 6 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            fadeOutNotification(notification);
        }
    }, 6000);
    
    console.log('✅ Notificación mostrada correctamente');
}

// Función para cerrar notificaciones
function closeNotification(closeButton) {
    const notification = closeButton.closest('.custom-alert-notification');
    if (notification) {
        fadeOutNotification(notification);
    }
}

// Función para animación de desvanecimiento
function fadeOutNotification(notification) {
    notification.style.transition = 'all 0.3s ease-out';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Función para mostrar notificaciones del sistema (backups automáticos)
function showSystemNotification(message, type = 'info') {
    const alertClass = type === 'info' ? 'alert-info' : 'alert-success';
    const icon = type === 'info' ? 'fa-info-circle' : 'fa-robot';
    const title = type === 'info' ? '🔒 Sistema' : '🤖 Backup Automático';

    // Buscar si ya existe una notificación del sistema
    let existingNotification = document.querySelector('.backup-auto-notification');

    if (!existingNotification) {
        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} backup-auto-notification position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9998;
            min-width: 350px;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 8px;
            border: none;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icon} fa-2x me-3"></i>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${title}</h6>
                    <p class="mb-0 small">${message}</p>
                    <small class="text-muted">${new Date().toLocaleTimeString()}</small>
                </div>
                <button type="button" class="btn-close btn-sm" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-eliminar después de 8 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                fadeOutNotification(notification);
            }
        }, 8000);
    }
}

    // Función para iniciar auto-actualización de interfaz
    function startAutoRefresh() {
        autoRefreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadBackups();
                loadStats();
            }
        }, 30000);
    }

    // Función para detener auto-actualización
    function stopAutoRefresh() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    }

    // Hacer funciones globales para los botones en la tabla
    window.downloadBackup = downloadBackup;
    window.showRestoreModal = showRestoreModal;
    window.showDeleteModal = showDeleteModal;
    window.deleteSchedule = deleteSchedule;
    window.loadBackups = loadBackups;
    window.loadStats = loadStats;
    window.loadSchedules = loadSchedules;
    window.closeModal = closeModal;
    // Hacer funciones globales para las notificaciones
    window.showAlert = showAlert;
    window.closeNotification = closeNotification;
    window.fadeOutNotification = fadeOutNotification;
    window.showSystemNotification = showSystemNotification;
}); 
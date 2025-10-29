// FUNCIÓN AUXILIAR PARA CERRAR MODALES DE FORMA SEGURA
function closeModal(modalId) {
    console.log('🚪 Cerrando modal:', modalId);
    
    const modalElement = document.getElementById(modalId);
    
    if (!modalElement) {
        console.error('❌ No se encontró el modal:', modalId);
        return;
    }
    
    // Método 1: Usar Bootstrap Modal
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
        console.log('✅ Modal cerrado con Bootstrap');
    } else {
        // Método 2: Cierre manual
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Remover backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        console.log('✅ Modal cerrado manualmente');
    }
    
    // Limpiar variables
    if (modalId === 'restoreModal') {
        currentBackupToRestore = '';
    } else if (modalId === 'deleteModal') {
        currentBackupToDelete = '';
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
        const jitter = Math.random() * 50000; // 0-30 segundos de variación

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

    //  BOTÓN CONFIRMAR RESTAURACIÓN 
    btnRestoreConfirm.addEventListener('click', function () {
        console.log('🖱️ Botón restaurar confirmado clickeado - SOLICITANDO CONTRASEÑA');
        currentActionType = 'restore_backup';
        showPasswordModal('restaurar el backup');
    });

    // BOTÓN CONFIRMAR ELIMINACIÓN 
    btnDeleteConfirm.addEventListener('click', function () {
        console.log('🖱️ Botón eliminar confirmado clickeado - SOLICITANDO CONTRASEÑA');
        currentActionType = 'delete_backup';
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
        document.getElementById('password-message').textContent =
            `Para ${action}, ingrese su contraseña de administrador:`;
        document.getElementById('admin-password').value = '';

        const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
        passwordModal.show();

        // Enfocar campo de contraseña
        setTimeout(() => {
            document.getElementById('admin-password').focus();
        }, 500);
    }

    // Función para verificar contraseña
    function verifyPassword() {
        const password = document.getElementById('admin-password').value;

        if (!password) {
            showAlert('Por favor ingrese su contraseña', 'warning');
            return;
        }

        console.log('🔐 Verificando contraseña para acción:', currentActionType);

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
                if (data.success) {
                    // Cerrar modal
                    const passwordModal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
                    passwordModal.hide();

                    // Ejecutar la acción correspondiente
                    console.log('✅ Contraseña correcta, ejecutando acción:', currentActionType);
                    executeActionAfterPassword();
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                    document.getElementById('admin-password').value = '';
                    document.getElementById('admin-password').focus();
                }
            })
            .catch(error => {
                console.error('❌ Error de conexión:', error);
                showAlert('Error de conexión: ' + error.message, 'danger');
            });
    }

    // Función para ejecutar acción después de verificar contraseña
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
                restoreBackup(currentBackupToRestore);
            } else {
                console.error('❌ No hay backup seleccionado para restaurar');
                showAlert('Error: No hay backup seleccionado', 'danger');
            }
            break;
        case 'delete_backup':
            console.log('🗑️ Eliminando backup:', currentBackupToDelete);
            if (currentBackupToDelete) {
                deleteBackup(currentBackupToDelete);
            } else {
                console.error('❌ No hay backup seleccionado para eliminar');
                showAlert('Error: No hay backup seleccionado', 'danger');
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

    // Función para restaurar backup
 
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
        
        // CERRAR EL MODAL PRIMERO - FORZAR CIERRE
        closeModal('restoreModal');
        
        if (data.success) {
            showAlert('✅ Backup restaurado correctamente', 'success');
        } else {
            showAlert('❌ Error al restaurar backup: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('❌ Error en restoreBackup:', error);
        
        // Cerrar modal incluso en caso de error
        closeModal('restoreModal');
        
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
        
        // CERRAR EL MODAL PRIMERO - FORZAR CIERRE
        closeModal('deleteModal');
        
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
        
        // Cerrar modal incluso en caso de error
        closeModal('deleteModal');
        
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
        const restoreModal = new bootstrap.Modal(document.getElementById('restoreModal'));
        restoreModal.show();
    }

    // Función para mostrar modal de eliminación
    function showDeleteModal(filename) {
        currentBackupToDelete = filename;
        document.getElementById('delete-filename').textContent = filename;
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

    // Función para mostrar alertas
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
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
}); 
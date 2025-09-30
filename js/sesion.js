(function () {
    'use strict';

    class SistemaSesion {
        constructor(quitarLoaderCallback) {
            this.usuario = null;
            this.quitarLoader = quitarLoaderCallback;
            this.inicializar();
        }

        inicializar() {
            // ✅ MOSTRAR EL BODY INMEDIATAMENTE (por si hay CSS inline ocultándolo)
            this.mostrarBody();
            
            this.cargarUsuario();
            this.actualizarHeader();
            
            if (this.protegerRutas()) {
                if (this.quitarLoader) {
                    this.quitarLoader();
                }
            }
        }

        mostrarBody() {
            // ✅ FORZAR QUE EL BODY SEA VISIBLE
            if (document.body) {
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
            }
        }

        cargarUsuario() {
            if (sessionStorage.getItem('loggedin') === 'true') {
                const usuarioData = sessionStorage.getItem('usuario');
                if (usuarioData) {
                    this.usuario = JSON.parse(usuarioData);
                }
            }
        }

        actualizarHeader() {
            const nombreUsuarioElement = document.getElementById('nombreUsuario');
            const rolUsuarioElement = document.getElementById('rolUsuario');

            if (nombreUsuarioElement && rolUsuarioElement) {
                if (this.usuario && this.usuario.usuario) { 
                    nombreUsuarioElement.textContent = this.usuario.usuario;
                    rolUsuarioElement.textContent = `(${this.getNombreRol()})`;
                } else if (this.usuario && this.usuario.nombre) {
                    nombreUsuarioElement.textContent = this.usuario.nombre;
                    rolUsuarioElement.textContent = `(${this.getNombreRol()})`;
                } else {
                    nombreUsuarioElement.textContent = 'Invitado';
                    rolUsuarioElement.textContent = '';
                }
            } else if (nombreUsuarioElement) {
                if (this.usuario && this.usuario.usuario) {
                    nombreUsuarioElement.textContent = this.usuario.usuario;
                } else if (this.usuario && this.usuario.nombre) {
                    nombreUsuarioElement.textContent = this.usuario.nombre;
                } else {
                    nombreUsuarioElement.textContent = 'Invitado';
                }
            }
        }

        obtenerRol() {
            return this.usuario ? this.usuario.rol : null;
        }

        esAdministrador() {
            return this.obtenerRol() === 1;
        }

        esEmpleado() {
            return this.obtenerRol() === 2;
        }

        tienePermiso(rolRequerido) {
            const rolActual = this.obtenerRol();
            if (rolActual === 1) return true;
            return rolActual === rolRequerido;
        }

        getNombreRol() {
            const rol = this.obtenerRol();
            switch (rol) {
                case 1: return 'Administrador';
                case 2: return 'Empleado';
                default: return 'Invitado';
            }
        }

        protegerRutas() {
            const paginaActual = window.location.pathname.split('/').pop();
            const rutasSoloAdministrador = ['usuario.html', 'empresa.html'];

            if (rutasSoloAdministrador.includes(paginaActual) && !this.esAdministrador()) {
                alert('❌ Acceso restringido. Solo administradores pueden acceder a esta página.');
                window.location.href = 'index.html';
                return false;
            }

            return true;
        }

        verificarSesion() {
            const loggedin = sessionStorage.getItem('loggedin');
            if (loggedin !== 'true') {
                window.location.href = 'login.html';
                return false;
            }
            return true;
        }

        cerrarSesion() {
            sessionStorage.removeItem('usuario');
            sessionStorage.removeItem('loggedin');
            sessionStorage.removeItem('usuario_rol');
            window.location.href = 'login.html';
        }

        obtenerUsuario() {
            return this.usuario;
        }

        estaLogueado() {
            return sessionStorage.getItem('loggedin') === 'true';
        }
    }

    // LÓGICA PRINCIPAL
    const loggedin = sessionStorage.getItem('loggedin');
    const paginasProtegidas = [
        'index.html', 'usuario.html', 'clientes.html', 'compra.html',
        'marcas.html', 'clientesInactivos.html', 'empresa.html',
        'marcasInactivas.html', 'medidas.html', 'proveedor.html', 'repuestos.html'
    ];
    const paginaActual = window.location.pathname.split('/').pop();

    // REDIRIGIR INMEDIATAMENTE SI NO ESTÁ LOGUEADO
    if (loggedin !== 'true' && paginasProtegidas.includes(paginaActual)) {
        window.location.replace('login.html');
        return;
    }

    // ✅ INICIALIZACIÓN MEJORADA
    if (loggedin === 'true') {
        document.addEventListener('DOMContentLoaded', function () {
            // ✅ CREAR LOADER SOLO SI ES NECESARIO (no en index.html)
            let loader = null;
            let quitarLoader = function() {};
            
            if (paginaActual !== 'index.html') {
                const crearLoader = function () {
                    const loader = document.createElement('div');
                    loader.id = 'seguridad-loader';
                    loader.innerHTML = `
                        <div style="
                            position: fixed;
                            top: 0; left: 0;
                            width: 100%; height: 100%;
                            background: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 9999;
                            font-family: Arial, sans-serif;
                        ">
                            <div style="text-align: center;">
                                <div style="
                                    width: 40px; height: 40px;
                                    border: 4px solid #f3f3f3;
                                    border-top: 4px solid #667eea;
                                    border-radius: 50%;
                                    animation: spin 1s linear infinite;
                                    margin: 0 auto 20px;
                                "></div>
                                <p>Verificando permisos...</p>
                            </div>
                        </div>
                        <style>
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        </style>
                    `;
                    document.body.appendChild(loader);
                    return loader;
                };

                loader = crearLoader();
                
                quitarLoader = function () {
                    if (loader && loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                };

                setTimeout(quitarLoader, 3000);
            }

            // ✅ INICIALIZAR SISTEMA
            const sistema = new SistemaSesion(quitarLoader);
        });
    }

    // FUNCIONES GLOBALES
    window.verificarSesion = function () {
        const sistema = new SistemaSesion();
        return sistema.verificarSesion();
    };

    window.cerrarSesion = function () {
        const sistemaSesion = new SistemaSesion();
        sistemaSesion.cerrarSesion();
    };

    window.toggleMenu = function () {
        const menu = document.getElementById('menuUsuario');
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    };

    window.irInicio = function () {
        window.location.href = 'index.html';
    };
    window.obtenerUsuarioLogueado = function () {
        // Crear instancia temporal para obtener usuario
        const tempSistema = new SistemaSesion();
        tempSistema.cargarUsuario();
        return tempSistema.obtenerUsuario();
    };

    window.esAdministrador = function () {
        const tempSistema = new SistemaSesion();
        tempSistema.cargarUsuario();
        return tempSistema.esAdministrador();
    };

    window.esEmpleado = function () {
        const tempSistema = new SistemaSesion();
        tempSistema.cargarUsuario();
        return tempSistema.esEmpleado();
    };

    window.tienePermiso = function (rolRequerido) {
        const tempSistema = new SistemaSesion();
        tempSistema.cargarUsuario();
        return tempSistema.tienePermiso(rolRequerido);
    };

    window.getNombreRol = function () {
        const tempSistema = new SistemaSesion();
        tempSistema.cargarUsuario();
        return tempSistema.getNombreRol();
    };

    window.restringirAccesoPorRol = function (rolRequerido) {
        const tempSistema = new SistemaSesion();
        tempSistema.cargarUsuario();
        if (!tempSistema.tienePermiso(rolRequerido)) {
            alert('No tienes permisos para realizar esta acción');
            return false;
        }
        return true;
    };

    // Event listener para cerrar menú
    if (loggedin === 'true') {
        document.addEventListener('click', function (e) {
            const menu = document.getElementById('menuUsuario');
            const userBtn = document.querySelector('.user-btn');

            if (menu && userBtn && !menu.contains(e.target) && !userBtn.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
    }
})();
(function () {
    'use strict';

    class SistemaSesion {
        constructor(quitarLoaderCallback) {
            this.usuario = null;
            this.rol = '';
            this.quitarLoader = quitarLoaderCallback;
            this.inicializar();
        }

        inicializar() {
            console.log('🔍 Inicializando sistema de sesión...');

            // Verificación básica de sesión
            if (!this.verificarSesionBasica()) {
                return;
            }

            this.cargarUsuario();

            // ✅ SI NO ES ADMINISTRADOR Y ESTÁ EN PÁGINA ADMIN, REDIRIGIR AL INDEX
            if (this.esPaginaAdmin() && !this.esAdministrador()) {
                console.log('🚫 No es administrador - Redirigiendo al index...');
                this.redirigirAlIndex();
                return;
            }

            this.configurarMenu();
            this.mostrarContenido();

            if (this.quitarLoader) {
                this.quitarLoader();
            }
        }

        verificarSesionBasica() {
            const loggedin = sessionStorage.getItem('loggedin');
            const usuarioStorage = sessionStorage.getItem('usuario');

            console.log('📊 Estado sesión:');
            console.log('- loggedin:', loggedin);
            console.log('- usuarioStorage:', usuarioStorage ? 'EXISTE' : 'NO EXISTE');

            if (loggedin !== 'true' || !usuarioStorage) {
                console.warn('⚠️ No hay sesión activa - Redirigiendo al login');
                this.redirigirALogin();
                return false;
            }

            return true;
        }

        cargarUsuario() {
            try {
                this.usuario = JSON.parse(sessionStorage.getItem('usuario'));
                this.rol = this.obtenerRolUsuario();
                console.log('👤 Usuario cargado:', this.usuario.nombre);
                console.log('🎭 Rol determinado:', this.rol);

                this.actualizarHeader();
            } catch (error) {
                console.error('❌ Error cargando usuario:', error);
                this.redirigirALogin();
            }
        }

        obtenerRolUsuario() {
            // Fuentes del rol en orden de prioridad (igual que permisos.js)
            const fuentes = [
                sessionStorage.getItem('usuario_rol'),
                this.usuario?.rol,
                this.usuario?.id_rol?.toString()
            ];

            console.log('🔍 Buscando rol en fuentes:', fuentes);

            for (let fuente of fuentes) {
                if (fuente) {
                    return this.normalizarRol(fuente);
                }
            }

            return 'Sin rol';
        }

        normalizarRol(rol) {
            const rolString = String(rol).trim();
            console.log('🛠️ Normalizando rol:', rolString);

            const mapeoRoles = {
                '1': 'Administrador',
                '2': 'Empleado',
                'administrador': 'Administrador',
                'empleado': 'Empleado',
                'admin': 'Administrador'
            };

            const rolLower = rolString.toLowerCase();
            const rolNormalizado = mapeoRoles[rolLower] || mapeoRoles[rolString] || rolString;
            console.log('🎯 Rol normalizado:', rolNormalizado);

            return rolNormalizado;
        }

        esPaginaAdmin() {
            let paginaActual = window.location.pathname.split('/').pop();
            if (paginaActual === '' || paginaActual === 'TallerZelaya') {
                paginaActual = 'index.html';
            }

            const paginasAdmin = [
                'usuario.html',
                'empresa.html',
                'marcas.html',
                'proveedor.html',
                'compra.html'
            ];

            const esAdmin = paginasAdmin.includes(paginaActual);
            console.log('📄 Verificando página:', paginaActual, 'Es admin?:', esAdmin);
            return esAdmin;
        }

        esAdministrador() {
            const esAdmin = this.rol === 'Administrador';
            console.log('👑 Verificando si es administrador:', this.rol, '=== Administrador →', esAdmin);
            return esAdmin;
        }

        esEmpleado() {
            return this.rol === 'Empleado';
        }

        redirigirAlIndex() {
            console.log('🏠 Redirigiendo al index...');
            window.location.href = 'index.html';
        }

        redirigirALogin() {
            console.log('🔒 Redirigiendo al login...');
            window.location.href = 'login.html';
        }

        mostrarContenido() {
            // ✅ MOSTRAR EL BODY (igual que permisos.js)
            if (document.body) {
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
            }
            console.log('👀 Contenido hecho visible');
        }

        configurarMenu() {
            console.log('🔧 Configurando interfaz para rol:', this.rol);
            const elementosAdmin = document.querySelectorAll('.admin-only');

            if (this.esEmpleado()) {
                console.log('👷 Ocultando elementos admin - MODO EMPLEADO');
                elementosAdmin.forEach(el => {
                    el.style.display = 'none';
                });
                document.body.classList.add('modo-empleado');
            } else {
                console.log('👨‍💼 Mostrando todos los elementos - MODO ADMINISTRADOR');
                elementosAdmin.forEach(el => {
                    el.style.display = '';
                });
                document.body.classList.remove('modo-empleado');
            }
        }

        actualizarHeader() {
            const nombreUsuarioElement = document.getElementById('nombreUsuario');
            const rolUsuarioElement = document.getElementById('rolUsuario');

            if (nombreUsuarioElement && this.usuario) {
                const nombre = this.usuario.usuario || this.usuario.nombre || 'Usuario';
                nombreUsuarioElement.textContent = nombre;
                console.log('👤 Nombre actualizado:', nombre);
            }

            if (rolUsuarioElement) {
                rolUsuarioElement.textContent = this.rol;
                const rolClase = this.rol.toLowerCase();
                rolUsuarioElement.className = `rol-usuario rol-${rolClase}`;
                console.log('🎭 Rol actualizado:', this.rol, 'Clase CSS:', `rol-${rolClase}`);
            }
        }

        // ✅ MÉTODOS ADICIONALES PARA COMPATIBILIDAD
        obtenerRol() {
            return this.rol;
        }

        tienePermiso(rolRequerido) {
            if (this.esAdministrador()) return true;
            return this.rol === rolRequerido;
        }

        getNombreRol() {
            return this.rol;
        }

        verificarSesion() {
            return this.verificarSesionBasica();
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


    const loggedin = sessionStorage.getItem('loggedin');
    const paginasProtegidas = [
        'index.html', 'usuario.html', 'clientes.html', 'compra.html',
        'marcas.html', 'clientesInactivos.html', 'empresa.html',
        'marcasInactivas.html', 'medidas.html', 'proveedor.html', 'repuestos.html'];
    let paginaActual = window.location.pathname.split('/').pop();
    console.log('📍 Página actual original:', paginaActual);

    // Si la página está vacía,(muestra index.html por defecto)
    if (paginaActual === '' || paginaActual === 'TallerZelaya') {
        paginaActual = 'index.html';
        console.log('🔄 Página actual corregida a:', paginaActual);
    }
    //REDIRIGIR INMEDIATAMENTE SI NO ESTÁ LOGUEADO
    if (loggedin !== 'true' && (paginaActual === 'index.html' || paginasProtegidas.includes(paginaActual))) {
        console.log('🚫 No logueado - Redirigiendo a login');
        window.location.replace('login.html');
        return;
    }
    //redirigir si está logueado y accede a login
    if (loggedin === 'true' && paginaActual === 'login.html') {
        console.log('✅ Ya logueado - Redirigiendo a index');
        window.location.replace('index.html');
        return;
    }
   
    if (loggedin === 'true') {
        document.addEventListener('DOMContentLoaded', function () {
            console.log('🚀 DOM cargado - Iniciando sistema de sesión...');

            // CREAR LOADER SOLO SI ES NECESARIO
            let loader = null;
            let quitarLoader = function () { };

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

                // Quitar loader después de 3 segundos máximo
                setTimeout(quitarLoader, 3000);
            }

            // ✅ INICIALIZAR SISTEMA
            try {
                const sistema = new SistemaSesion(quitarLoader);
            } catch (error) {
                console.error('💥 Error inicializando sistema:', error);
                quitarLoader();
            }
        });
    }

    // FUNCIONES GLOBALES (MANTENIDAS PARA COMPATIBILIDAD)
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
        const tempSistema = new SistemaSesion();
        return tempSistema.obtenerUsuario();
    };

    window.esAdministrador = function () {
        const tempSistema = new SistemaSesion();
        return tempSistema.esAdministrador();
    };

    window.esEmpleado = function () {
        const tempSistema = new SistemaSesion();
        return tempSistema.esEmpleado();
    };

    window.tienePermiso = function (rolRequerido) {
        const tempSistema = new SistemaSesion();
        return tempSistema.tienePermiso(rolRequerido);
    };

    window.getNombreRol = function () {
        const tempSistema = new SistemaSesion();
        return tempSistema.getNombreRol();
    };

    window.restringirAccesoPorRol = function (rolRequerido) {
        const tempSistema = new SistemaSesion();
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
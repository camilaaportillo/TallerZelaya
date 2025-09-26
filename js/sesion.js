// js/sesion.js - VERSIÓN COMPLETA CON MOSTRAR ROL
(function () {
    'use strict';

    // 🔥 BLOQUEAR RENDERIZADO INMEDIATAMENTE
    if (document.body) {
        document.body.style.visibility = 'hidden';
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.style.visibility = 'hidden';
        });
    }

    // VERIFICACIÓN ULTRA-RÁPIDA
    const loggedin = sessionStorage.getItem('loggedin');
    const paginasProtegidas = [
        'index.html', 'usuario.html', 'clientes.html', 'compra.html',
        'marcas.html', 'clientesInactivos.html', 'empresa.html',
        'marcasInactivas.html', 'medidas.html', 'proveedor.html', 'repuestos.html'
    ];
    const paginaActual = window.location.pathname.split('/').pop();

    if (loggedin !== 'true' && paginasProtegidas.includes(paginaActual)) {
        window.location.replace('login.html');
        return;
    }

    // SI PASA LA VERIFICACIÓN, MOSTRAR CONTENIDO
    if (loggedin === 'true') {
        const revelar = function () {
            document.body.style.visibility = 'visible';
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', revelar);
        } else {
            revelar();
        }
    }

    class SistemaSesion {
        constructor() {
            this.usuario = null;
            this.inicializar();
        }

        inicializar() {
            this.cargarUsuario();
            this.actualizarHeader();
            this.protegerRutas();
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
                    nombreUsuarioElement.textContent = this.usuario.usuario; // Mostrar el username
                    rolUsuarioElement.textContent = `(${this.getNombreRol()})`;
                } else if (this.usuario && this.usuario.nombre) {
                    // Fallback: si no existe usuario, mostrar nombre
                    nombreUsuarioElement.textContent = this.usuario.nombre;
                    rolUsuarioElement.textContent = `(${this.getNombreRol()})`;
                } else {
                    nombreUsuarioElement.textContent = 'Invitado';
                    rolUsuarioElement.textContent = '';
                }
            } else if (nombreUsuarioElement) {
                // Fallback: si no existe el elemento rol
                if (this.usuario && this.usuario.usuario) {
                    nombreUsuarioElement.textContent = this.usuario.usuario;
                } else if (this.usuario && this.usuario.nombre) {
                    nombreUsuarioElement.textContent = this.usuario.nombre;
                } else {
                    nombreUsuarioElement.textContent = 'Invitado';
                }
            }
        }

        // FUNCIONES PARA ROLES
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
            if (rolActual === 1) return true; // Admin tiene acceso a todo
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

    //  FUNCIONES GLOBALES
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

    window.obtenerUsuarioLogueado = function () {
        const sistema = new SistemaSesion();
        return sistema.obtenerUsuario();
    };

    window.esAdministrador = function () {
        const sistema = new SistemaSesion();
        return sistema.esAdministrador();
    };

    window.esEmpleado = function () {
        const sistema = new SistemaSesion();
        return sistema.esEmpleado();
    };

    window.tienePermiso = function (rolRequerido) {
        const sistema = new SistemaSesion();
        return sistema.tienePermiso(rolRequerido);
    };

    window.getNombreRol = function () {
        const sistema = new SistemaSesion();
        return sistema.getNombreRol();
    };

    window.restringirAccesoPorRol = function (rolRequerido) {
        const sistema = new SistemaSesion();
        if (!sistema.tienePermiso(rolRequerido)) {
            alert('No tienes permisos para realizar esta acción');
            return false;
        }
        return true;
    };

    // Event listeners
    if (loggedin === 'true') {
        document.addEventListener('click', function (e) {
            const menu = document.getElementById('menuUsuario');
            const userBtn = document.querySelector('.user-btn');

            if (menu && userBtn && !menu.contains(e.target) && !userBtn.contains(e.target)) {
                menu.style.display = 'none';
            }
        });

        document.addEventListener('DOMContentLoaded', function () {
            new SistemaSesion();
        });
    }
})();
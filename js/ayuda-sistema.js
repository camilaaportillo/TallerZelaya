const configAyuda = {
    'inicio': {
        titulo: 'Ayuda - Página Principal',
        archivo: 'inicio_ayuda.pdf',
        descripcion: 'Manual de uso del dashboard principal'
    },
    'ventas': {
        titulo: 'Ayuda - Módulo de Ventas',
        archivo: 'ayuda_ventas.pdf',
        descripcion: 'Gestión de ventas y servicios'
    },
    'inventario': {
        titulo: 'Ayuda - Control de Inventario',
        archivo: 'ayuda_inventario.pdf',
        descripcion: 'Administración de stock e inventario'
    },
    'clientes': {
        titulo: 'Ayuda - Gestión de Clientes',
        archivo: 'ayudaregistro_datos.pdf',
        descripcion: 'Registro y gestión de clientes'
    },
    'compras': {
        titulo: 'Ayuda - Módulo de Compras',
        archivo: 'ayuda_compras.pdf',
        descripcion: 'Procesos de compra y adquisiciones'
    },
    'repuestos': {
        titulo: 'Ayuda - Gestión de Repuestos',
        archivo: 'ayudaregistro_datos.pdf',
        descripcion: 'Catálogo y control de repuestos'
    },
    'proveedor': {
        titulo: 'Ayuda - Proveedores',
        archivo: 'ayudaregistro_datos.pdf',
        descripcion: 'Administración de proveedores'
    },
    'marcas': {
        titulo: 'Ayuda - Gestión de Marcas',
        archivo: 'ayudaregistro_datos.pdf',
        descripcion: 'Catálogo de marcas'
    },
    'medidas': {
        titulo: 'Ayuda - Unidades de Medida',
        archivo: 'ayudaregistro_datos.pdf',
        descripcion: 'Configuración de unidades de medida'
    },
    'usuarios': {
        titulo: 'Ayuda - Gestión de Usuarios',
        archivo: 'ayuda_usuarios.pdf',
        descripcion: 'Administración de usuarios del sistema'
    },
    'empresas': {
        titulo: 'Ayuda - Configuración de Empresa',
        archivo: 'ayudaregistro_datos.pdf',
        descripcion: 'Datos y configuración de la empresa'
    },
    'backup': {
        titulo: 'Ayuda - Copias de Seguridad',
        archivo: 'ayuda_backups.pdf',
        descripcion: 'Respaldo y recuperación de datos'
    },
    'perfil': {
        titulo: 'Ayuda - Perfil de usuario',
        archivo: 'ayuda_perfil.pdf',
        descripcion: 'Gestion de tus datos de usuario'
    }
};

function mostrarAyuda(modulo) {
    const config = configAyuda[modulo];
    
    if (!config) {
        alert('Ayuda no disponible para este módulo');
        return;
    }
    //Mostrar el modal
    document.getElementById('modalAyuda').style.display = 'flex';
    
    //Configurar título
    document.querySelector('.modal-header h2').innerHTML = 
        `<i class="fas fa-question-circle"></i> ${config.titulo}`;
    
    //Cargar el PDF específico del módulo
    const pdfUrl = `docs_ayuda/${config.archivo}#toolbar=0&navpanes=0&scrollbar=0`;
    document.getElementById('pdfObject').data = pdfUrl;

    document.body.style.overflow = 'hidden';
    
    //Actualizar función de descarga
    window.descargarPDFActual = function() {
        const link = document.createElement('a');
        link.href = `docs_ayuda/${config.archivo}`;
        link.download = config.archivo;
        link.click();
    };
}

//ocultar ayuda
function ocultarAyuda() {
    document.getElementById('modalAyuda').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('pdfObject').data = '';
}
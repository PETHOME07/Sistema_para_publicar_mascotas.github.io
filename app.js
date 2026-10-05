async function mostrarPropietario()
{
 const respuesta = await fetch('/api/devuelva_todo_propietario');
 const data = await respuesta.json();
 const tbodypropietarios=document.getElementById('filaspropietario')
 for(let i=0;i<data.length;i++){
     const fila=data[i];
     const filahtml=document.createElement ('tr');
     filahtml.innerHTML='<td>'+fila.nombre+'</td>'+
     '<td>'+fila.telefono+'</td>';
      tbodypropietarios.appendChild(filahtml);
 }
} 

function convertirBufferAImagen(imagenBuffer) {
    if (!imagenBuffer || !imagenBuffer.data || imagenBuffer.data.length === 0) {
        return "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop";
    }
    try {
        const bytes = new Uint8Array(imagenBuffer.data);
        let binario = '';
        for (let i = 0; i < bytes.length; i++) {
            binario += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binario);
        return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
        console.error('Error al convertir la imagen:', error);
        return "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop";
    }
}

// ✅ FUNCIÓN PRINCIPAL — Conecta base de datos con WhatsApp
async function listaDePublicidades()
{
    const respuesta = await fetch('/api/listaPublicaciones');
    const data = await respuesta.json();
    
    const contenedor = document.getElementById('contenedor-mascotas');
    
    contenedor.innerHTML = ''; // Limpiar antes de cargar

    for(let i=0;i<data.length;i++){
        const fila=data[i];
        const date=new Date(fila.fecha);
        
        // 📅 Formatear fecha
        const options = {
            weekday:'long',
            year:'numeric', 
            month:'long',
            day:'numeric',
        };
        
        // 🖼️ Convertir imagen
        const Imagen = convertirBufferAImagen(fila.imagen);

        // ✅ CONSTRUIR ENLACE DE WHATSAPP desde la base de datos
        // Asegurar que el número tenga código de país de Bolivia (591)
        let numeroLimpio = String(fila.telefono).replace(/\D/g, ''); // Quitar todo lo que no sea número
        if (numeroLimpio.length === 7 || numeroLimpio.length === 8) {
            numeroLimpio = '591' + numeroLimpio;
        }
        if (!numeroLimpio.startsWith('591')) {
            numeroLimpio = '591' + numeroLimpio;
        }

        // 💬 Mensaje automático con los datos de la mascota
        const textoMensaje = `Hola! Vi tu publicación de ${fila.nombre_mascota}. Tengo información sobre tu mascota. Por favor contáctame. Gracias!`;
        const mensajeCodificado = encodeURIComponent(textoMensaje);
        
        // 🔗 Enlace final de WhatsApp
        const enlaceWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;

        // 📦 Generar tarjeta con enlace de WhatsApp
        const div=`<div class="mascota-tarjeta">
            <img src="${Imagen}" alt="${fila.nombre_mascota}" class="mascota-img" loading="lazy">
            <div class="mascota-info">
                <h3 class="mascota-nombre">${fila.nombre_mascota}</h3>
                <div class="mascota-datos">
                    <div class="dato-fila">
                        <span class="icono">🐶</span>
                        <span>${fila.descripcion_raza} - ${fila.descripcion_mascota}</span>
                    </div>
                    <div class="dato-fila">
                        <span class="icono">👤</span>
                        <span>Nombre del Propietario: ${fila.nombre_propietario}</span>
                    </div>
                    <div class="dato-fila">
                        <span class="icono">📍</span>
                        <span>${fila.descripcion_publicidad}</span>
                    </div>
                    <div class="dato-fila">
                        <span class="icono">📅</span>
                        <span>Fecha de publicación: ${date.toLocaleDateString("es-ES", options)}</span>
                    </div>
                    <div class="dato-fila">
                        <span class="icono">📞</span>
                        <span>Teléfono de Contacto: ${fila.telefono}</span>
                    </div>
                    <div class="dato-fila">
                        <span class="icono">💰</span>
                        <span>Recompensa: ${fila.recompensa}</span>
                    </div>
                </div>
                <!-- ✅ BOTÓN QUE ABRE WHATSAPP -->
                <a href="${enlaceWhatsApp}" target="_blank" rel="noopener" class="btn-contactar">
                    CONTACTAR
                </a>
            </div>
        </div>`;
        contenedor.innerHTML += div;
    }
}

async function registrarPublicidad() {
    const formulario = document.getElementById('formulario-registro');
    const mensaje = document.getElementById('mensaje-registro');
    const boton = formulario.querySelector('button');
    const archivo = document.getElementById('imagen').files[0];
    if (!formulario.reportValidity()) {
        return;
    }
    mensaje.textContent = 'Registrando...';
    mensaje.className = 'mensaje';
    boton.disabled = true;
    try {
        const imagen = await convertirImagenABase64(archivo);
        const datos = Object.fromEntries(new FormData(formulario));
        datos.imagen = imagen;
        const respuesta = await fetch('/api/registro-publicidad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(resultado.error || 'No fue posible registrar la publicación.');
        }
        formulario.reset();
        mensaje.textContent = resultado.mensaje;
        mensaje.className = 'mensaje exito';
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.className = 'mensaje error';
    } finally {
        boton.disabled = false;
    }
}

function convertirImagenABase64(archivo) {
    return new Promise((resolver, rechazar) => {
        const lector = new FileReader();
        lector.onload = () => {
            const imagen = lector.result.split(',')[1];
            resolver(imagen);
        };
        lector.onerror = () => rechazar(new Error('No fue posible leer la imagen.'));
        lector.readAsDataURL(archivo);
    });
}

async function cargarRazas() {
    const selectorRaza = document.getElementById('razaCode');
    if (!selectorRaza) {
        return;
    }
    try {
        const respuesta = await fetch('/api/razas');
        const razas = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error();
        }
        selectorRaza.innerHTML = '<option value="">Seleccione una raza</option>';
        for (const raza of razas) {
            const opcion = document.createElement('option');
            opcion.value = raza.cod;
            opcion.textContent = raza.descripcion;
            selectorRaza.appendChild(opcion);
        }
    } catch (error) {
        selectorRaza.innerHTML = '<option value="">No fue posible cargar las razas</option>';
        selectorRaza.disabled = true;
    }
}

const formularioRegistro = document.getElementById('formulario-registro');
if (formularioRegistro) {
    cargarRazas();
}

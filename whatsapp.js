// ==========================================
// CONEXIÓN CON WHATSAPP - Proyecto Mascotas
// ==========================================

// ✅ Función que arma el enlace de WhatsApp
function generarEnlaceWhatsApp(telefono, nombreMascota) {
    // 1. Limpiar el número — dejar solo dígitos
    let numeroLimpio = String(telefono).replace(/\D/g, '');

    // 2. Agregar código de Bolivia si no lo tiene (591)
    if (!numeroLimpio.startsWith('591')) {
        numeroLimpio = '591' + numeroLimpio;
    }

    // 3. Crear el mensaje automático
    const texto = `Hola! Vi tu publicación de ${nombreMascota}. Tengo información sobre tu mascota. Por favor contáctame. Gracias! 🐾`;

    // 4. Convertir el mensaje para que WhatsApp lo entienda
    const mensajeCodificado = encodeURIComponent(texto);

    // 5. Devolver el enlace completo
    return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
}

// ✅ Exportar para usarlo en app.js
if (typeof module !== 'undefined') {
    module.exports = { generarEnlaceWhatsApp };
}
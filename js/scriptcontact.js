function validarFormulario() {
    var nombre = document.getElementById("nombre").value;
    var email = document.getElementById("email").value;
    var mensaje = document.getElementById("mensaje").value;

    // Validar nombre alfanumérico
    var nombreValido = /^[a-zA-Z0-9\s]+$/.test(nombre);
    if (!nombreValido) {
        alert("Por favor, ingresa un nombre válido.");
        return false;
    }

    // Validar email válido
    var emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return false;
    }

    // Validar mensaje con más de 5 caracteres
    if (mensaje.length < 5) {
        alert("Por favor, ingresa un mensaje con al menos 5 caracteres.");
        return false;
    }

    // Abrir herramienta de envío de emails predeterminada
    var subject = "Mensaje de contacto";
    var body = "Nombre: " + nombre + "\nEmail: " + email + "\nMensaje: " + mensaje;
    window.location.href = "mailto:tuemail@example.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    return true;
}

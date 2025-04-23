document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // Obtener usuarios desde localStorage
    function getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }

    // Guardar usuarios en localStorage
    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    // Guardar sesión activa
    function setUsuarioActivo(user) {
        localStorage.setItem("usuarioActivo", JSON.stringify(user));
    }

    // Registro
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("register-name").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const username = document.getElementById("register-username").value.trim();
            const password = document.getElementById("register-password").value.trim();

            if (!name || !email || !username || !password) {
                alert("⚠️ Por favor, completa todos los campos.");
                return;
            }

            let users = getUsers();

            // Evitar duplicados
            if (users.some(user => user.username === username)) {
                alert("⚠️ El nombre de usuario ya está registrado. Prueba con otro.");
                return;
            }

            const nuevoUsuario = { name, email, username, password };
            users.push(nuevoUsuario);
            saveUsers(users);

            alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
            window.location.href = "index.html";
        });
    }

    // Inicio de sesión
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("login-username").value.trim();
            const password = document.getElementById("login-password").value.trim();

            let users = getUsers();
            let user = users.find(user => user.username === username && user.password === password);

            if (user) {
                alert("✅ Inicio de sesión exitoso.");
                setUsuarioActivo(user);
                window.location.href = "menu.html";
            } else {
                const errorMsg = document.getElementById("error-message");
                if (errorMsg) {
                    errorMsg.textContent = "❌ Usuario o contraseña incorrectos.";
                } else {
                    alert("❌ Usuario o contraseña incorrectos.");
                }
            }
        });
    }
});

// Recuperar contraseña
function recoverPassword() {
    let username = prompt("🔒 Ingrese su nombre de usuario:");

    if (!username) {
        alert("⚠️ Debes ingresar un usuario.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(user => user.username === username);

    if (userIndex !== -1) {
        let newPassword = prompt("🆕 Ingresa tu nueva contraseña:");
        if (newPassword) {
            users[userIndex].password = newPassword;
            localStorage.setItem("users", JSON.stringify(users));
            alert("✅ Contraseña restablecida con éxito.");
        } else {
            alert("⚠️ No ingresaste una nueva contraseña.");
        }
    } else {
        alert("❌ El usuario no existe.");
    }
}

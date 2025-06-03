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

            const users = getUsers();

            if (users.some(user => user.username === username)) {
                alert("⚠️ El nombre de usuario ya está registrado.");
                return;
            }

            const nuevoUsuario = { name, email, username, password };
            users.push(nuevoUsuario);
            saveUsers(users);

            alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
            window.location.href = "index.html";
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = document.getElementById("login-username").value.trim();
            const password = document.getElementById("login-password").value.trim();

            const users = getUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
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

// Recuperación de contraseña
function recoverPassword() {
    const username = prompt("🔒 Ingrese su nombre de usuario:");
    if (!username) return alert("⚠️ Debes ingresar un usuario.");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(user => user.username === username);

    if (index !== -1) {
        const newPassword = prompt("🆕 Ingresa tu nueva contraseña:");
        if (newPassword) {
            users[index].password = newPassword;
            localStorage.setItem("users", JSON.stringify(users));
            alert("✅ Contraseña restablecida con éxito.");
        } else {
            alert("⚠️ No ingresaste una nueva contraseña.");
        }
    } else {
        alert("❌ El usuario no existe.");
    }
}

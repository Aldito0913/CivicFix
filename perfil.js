document.addEventListener("DOMContentLoaded", () => {
    const usernameEl = document.getElementById("username");
    const emailEl = document.getElementById("email");
    const roleEl = document.getElementById("role");

    const newName = document.getElementById("newName");
    const newEmail = document.getElementById("newEmail");
    const newPassword = document.getElementById("newPassword");

    const editForm = document.querySelector(".edit-form");
    const editBtn = document.getElementById("editProfileBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const editFormForm = document.getElementById("editProfileForm");

    // Función para obtener todos los usuarios
    function getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }

    // Función para guardar todos los usuarios
    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    // Función para obtener usuario activo (ahora corregida)
    function getActiveUser() {
        return JSON.parse(localStorage.getItem("usuarioActivo"));
    }

    // Función para actualizar usuario activo (ahora corregida)
    function setActiveUser(user) {
        localStorage.setItem("usuarioActivo", JSON.stringify(user));
    }

    const activeUser = getActiveUser();

    if (!activeUser) {
        alert("No hay ningún usuario activo. Por favor, inicia sesión.");
        window.location.href = "index.html";
        return;
    }

    // Mostrar datos del usuario
    usernameEl.textContent = activeUser.username;
    emailEl.textContent = activeUser.email || "Sin correo";

    // Editar perfil
    editBtn.addEventListener("click", () => {
        const isActive = editForm.classList.contains("active");
        if (!isActive) {
            editForm.classList.add("active");
            editBtn.textContent = "Ocultar Formulario";
            newName.value = activeUser.username;
            newEmail.value = activeUser.email || "";
            newPassword.value = "";
        } else {
            editForm.classList.remove("active");
            editFormForm.reset();
            editBtn.textContent = "Editar Perfil";
        }
    });

    cancelBtn.addEventListener("click", () => {
        editForm.classList.remove("active");
        editFormForm.reset();
        editBtn.textContent = "Editar Perfil";
    });

    editFormForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const updatedName = newName.value.trim();
        const updatedEmail = newEmail.value.trim();
        const updatedPassword = newPassword.value.trim();

        if (!updatedName || !updatedEmail) {
            alert("Nombre y correo no pueden estar vacíos.");
            return;
        }

        let users = getUsers();
        const index = users.findIndex(u => u.username === activeUser.username && u.password === activeUser.password);

        if (index !== -1) {
            users[index].username = updatedName;
            users[index].email = updatedEmail;
            if (updatedPassword) {
                users[index].password = updatedPassword;
            }

            // Guardar en localStorage
            saveUsers(users);

            // Actualizar el usuario activo
            const updatedUser = { ...users[index] };
            setActiveUser(updatedUser);

            // Refrescar en pantalla
            usernameEl.textContent = updatedUser.username;
            emailEl.textContent = updatedUser.email;

            alert("Perfil actualizado con éxito.");
            editForm.classList.remove("active");
            editBtn.textContent = "Editar Perfil";
            editFormForm.reset();
        } else {
            alert("No se pudo actualizar el perfil.");
        }
    });
});

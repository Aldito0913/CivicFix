document.addEventListener("DOMContentLoaded", () => {
    const usernameEl = document.getElementById("username");
    const emailEl = document.getElementById("email");
    const roleEl = document.getElementById("role");
    const profileImgEl = document.getElementById("profileImg");

    const newName = document.getElementById("newName");
    const newEmail = document.getElementById("newEmail");
    const newPassword = document.getElementById("newPassword");
    const newProfileImgMain = document.getElementById("newProfileImgMain");

    const editForm = document.getElementById("editForm");
    const editBtn = document.getElementById("editProfileBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const editFormForm = document.getElementById("editProfileForm");

    function getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    function getActiveUser() {
        return JSON.parse(localStorage.getItem("usuarioActivo"));
    }

    function setActiveUser(user) {
        localStorage.setItem("usuarioActivo", JSON.stringify(user));
    }

    let activeUser = getActiveUser();

    if (!activeUser) {
        alert("No hay ningún usuario activo. Por favor, inicia sesión.");
        window.location.href = "index.html";
        return;
    }

    // Mostrar datos iniciales
    usernameEl.textContent = activeUser.username;
    emailEl.textContent = activeUser.email || "Sin correo";
    profileImgEl.src = activeUser.profileImage || "default-avatar.png";

    // Mostrar formulario
    editBtn.addEventListener("click", () => {
        editForm.classList.toggle("active");
        editBtn.textContent = editForm.classList.contains("active") ? "Ocultar Formulario" : "Editar Perfil";

        if (editForm.classList.contains("active")) {
            newName.value = activeUser.username;
            newEmail.value = activeUser.email || "";
            newPassword.value = "";
        } else {
            editFormForm.reset();
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

        const users = getUsers();
        const index = users.findIndex(u => u.username === activeUser.username && u.password === activeUser.password);

        if (index !== -1) {
            users[index].username = updatedName;
            users[index].email = updatedEmail;
            if (updatedPassword) {
                users[index].password = updatedPassword;
            }

            // Guardar posibles cambios de imagen
            users[index].profileImage = activeUser.profileImage;

            // Actualizar almacenamiento
            saveUsers(users);
            const updatedUser = { ...users[index] };
            setActiveUser(updatedUser);
            activeUser = updatedUser;

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

    // Imagen desde input principal (fuera del form) — se guarda automáticamente
    newProfileImgMain.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            profileImgEl.src = base64Image;

            // Actualizar usuario activo
            activeUser.profileImage = base64Image;
            setActiveUser(activeUser);

            // También actualizar en la lista de usuarios
            const users = getUsers();
            const index = users.findIndex(u => u.username === activeUser.username && u.password === activeUser.password);
            if (index !== -1) {
                users[index].profileImage = base64Image;
                saveUsers(users);
            }
        };

        reader.readAsDataURL(file);
    });
});

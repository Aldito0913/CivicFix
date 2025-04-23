document.addEventListener("DOMContentLoaded", function () {
    // Inicializar el mapa
    const map = L.map('map').setView([13.6986, -89.1914], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let selectedLat = null;
    let selectedLng = null;
    let tempMarker = null; // Para almacenar el marcador temporal

    // Mapeo de organizaciones por categoría
    const organizacionesPorCategoria = {
        "Daño Estructural": "Ministerio de Vivienda (MIVI)",
        "Daño a la Infraestructura": "Ministerio de Obras Públicas y Transporte (MOPT)",
        "Daños por Naturaleza": "Protección Civil",
        "Daños en Techo": "Ministerio de Vivienda (MIVI)",
        "Daños en Fachada": "Ministerio de Vivienda (MIVI)",
        "Daños por Accidentes": "Policía Nacional Civil (PNC)",
        "Daños en Servicios Básicos": "ANDA / CEL / SIGET",
        "Otros Daños": "Alcaldía Municipal o entidad local"
    };

    function esMovil() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function cargarReportesGuardados() {
        const reportes = JSON.parse(localStorage.getItem('reportes')) || [];
        reportes.forEach(reporte => {
            agregarMarcador(reporte.lat, reporte.lng, reporte.descripcion, reporte.imagenURL, reporte.categoria);
        });
    }

    cargarReportesGuardados();

    if (!esMovil()) {
        map.on('click', function (e) {
            selectedLat = e.latlng.lat;
            selectedLng = e.latlng.lng;

            if (tempMarker) {
                map.removeLayer(tempMarker);
            }

            tempMarker = L.marker([selectedLat, selectedLng]).addTo(map)
                .bindPopup("📍 Ubicación seleccionada").openPopup();

            console.log(`Ubicación seleccionada: ${selectedLat}, ${selectedLng}`);
        });
    }

    function asignarCategoria(descripcion) {
        const categorias = {
            "Daño Estructural": ["colapso", "grieta", "fisura", "cimiento", "muro", "desplome"],
            "Daño a la Infraestructura": ["bache", "hueco", "calle", "puente", "pavimento", "asfalto"],
            "Daños por Naturaleza": ["inundación", "terremoto", "deslave", "tormenta", "lluvia"],
            "Daños en Techo": ["gotera", "filtración", "techo roto", "techo dañado"],
            "Daños en Fachada": ["vidrio roto", "fachada dañada", "ventana rota", "pared dañada"],
            "Daños por Accidentes": ["colisión", "accidente vehicular", "choque"],
            "Daños en Servicios Básicos": ["corte de agua", "corte de luz", "fuga de gas", "energía eléctrica"],
            "Otros Daños": []
        };

        const descripcionLower = descripcion.toLowerCase();

        for (let categoria in categorias) {
            for (let palabra of categorias[categoria]) {
                if (descripcionLower.includes(palabra)) {
                    return categoria;
                }
            }
        }

        return "Otros Daños";
    }

    document.getElementById('reportar').addEventListener('click', function () {
        const descripcionInput = document.getElementById('descripcion');
        const imagenInput = document.getElementById('imagen');
        const descripcion = descripcionInput.value.trim();

        if (!descripcion) {
            alert('⚠️ Por favor, ingresa una descripción.');
            return;
        }

        const categoria = asignarCategoria(descripcion);
        const organizacion = organizacionesPorCategoria[categoria] || "Entidad correspondiente";
        console.log(`Categoría asignada: ${categoria}`);
        console.log(`Organización asignada: ${organizacion}`);

        function procesarReporte(lat, lng) {
            let imagenURL = '';

            if (imagenInput.files.length > 0) {
                const reader = new FileReader();
                reader.readAsDataURL(imagenInput.files[0]);
                reader.onload = function (e) {
                    imagenURL = e.target.result;
                    agregarMarcador(lat, lng, descripcion, imagenURL, categoria);
                    guardarReporte(lat, lng, descripcion, imagenURL, categoria);
                    limpiarCampos();
                };
            } else {
                agregarMarcador(lat, lng, descripcion, '', categoria);
                guardarReporte(lat, lng, descripcion, '', categoria);
                limpiarCampos();
            }

            alert('✅ Reporte subido con éxito');
        }

        if (esMovil()) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    procesarReporte(position.coords.latitude, position.coords.longitude);
                },
                function () {
                    alert('⚠️ No se pudo obtener tu ubicación.');
                }
            );
        } else {
            if (selectedLat !== null && selectedLng !== null) {
                procesarReporte(selectedLat, selectedLng);
            } else {
                alert('⚠️ Haz clic en el mapa para seleccionar una ubicación.');
            }
        }
    });

    function agregarMarcador(lat, lng, descripcion, imagenURL, categoria) {
        const organizacion = organizacionesPorCategoria[categoria] || "Entidad correspondiente";

        let popupContent = `<b>Categoría:</b> ${categoria}<br><b>Organización:</b> ${organizacion}<br><b>${descripcion}</b>`;
        if (imagenURL) {
            popupContent += `<br><img src="${imagenURL}" width="100px">`;
        }

        L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg',
                iconSize: [20, 20]
            })
        }).addTo(map)
            .bindPopup(popupContent)
            .openPopup();
    }

    function limpiarCampos() {
        document.getElementById('descripcion').value = "";
        document.getElementById('imagen').value = "";
        console.log("Campos limpiados después de agregar el reporte.");
    }

    function guardarReporte(lat, lng, descripcion, imagenURL, categoria) {
        const reportes = JSON.parse(localStorage.getItem('reportes')) || [];
        reportes.push({ lat, lng, descripcion, imagenURL, categoria });
        localStorage.setItem('reportes', JSON.stringify(reportes));
    }

    document.getElementById('homeBtn').addEventListener('click', function() {
        window.location.href = 'menu.html';
    });
});

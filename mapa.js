document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([13.6986, -89.1914], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let selectedLat = null;
    let selectedLng = null;
    let tempMarker = null;

    const iconosPorOrganizacion = {
        "Ministerio de Vivienda (MIVI)": "alcaldia.jpg",
        "Ministerio de Obras Públicas y Transporte (MOPT)": "mopt.png",
        "Protección Civil": "proteccioncivil.png",
        "Policía Nacional Civil (PNC)": "pnc.png",
        "ANDA / CEL / SIGET": "anda.png",
        "Alcaldía Municipal o entidad local": "delsur.png",
        "Entidad correspondiente": "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg"
    };

    function esMovil() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function cargarReportesGuardados() {
        const reportes = JSON.parse(localStorage.getItem('reportes')) || [];
        reportes.forEach(reporte => {
            const { categoria, organizacion } = asignarCategoriaYOrganizacion(reporte.descripcion);
            const iconoURL = iconosPorOrganizacion[organizacion] || iconosPorOrganizacion["Entidad correspondiente"];
            agregarMarcador(reporte.lat, reporte.lng, reporte.descripcion, categoria, reporte.imagenURL, organizacion, iconoURL);
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
        });
    }

    function asignarCategoriaYOrganizacion(descripcion) {
        const claves = {
            "Ministerio de Vivienda (MIVI)": {
                categoria: "Daño Estructural",
                palabras: ["colapso", "grieta", "fisura", "cimiento", "muro", "desplome", "techo roto", "techo dañado", "vidrio roto", "fachada dañada", "ventana rota", "pared dañada"]
            },
            "Ministerio de Obras Públicas y Transporte (MOPT)": {
                categoria: "Daño a la Infraestructura",
                palabras: ["bache", "hueco", "calle", "puente", "pavimento", "asfalto"]
            },
            "Protección Civil": {
                categoria: "Daños por Naturaleza",
                palabras: ["inundación", "terremoto", "deslave", "tormenta", "lluvia"]
            },
            "Policía Nacional Civil (PNC)": {
                categoria: "Daños por Accidentes",
                palabras: ["colisión", "accidente vehicular", "choque"]
            },
            "ANDA / CEL / SIGET": {
                categoria: "Daños en Servicios Básicos",
                palabras: ["corte de agua", "corte de luz", "fuga de gas", "energía eléctrica", "tendido eléctrico"]
            },
            "Alcaldía Municipal o entidad local": {
                categoria: "Otros Daños",
                palabras: ["contaminación", "basura", "ruido", "problema", "tendido eléctrico"]
            }
        };

        const descripcionLower = descripcion.toLowerCase();

        for (let organizacion in claves) {
            const { categoria, palabras } = claves[organizacion];
            for (let palabra of palabras) {
                if (descripcionLower.includes(palabra)) {
                    return { categoria, organizacion };
                }
            }
        }

        return { categoria: "Otros Daños", organizacion: "Alcaldía Municipal o entidad local" };
    }

    document.getElementById('reportar').addEventListener('click', function () {
        const descripcionInput = document.getElementById('descripcion');
        const imagenInput = document.getElementById('imagen');
        const descripcion = descripcionInput.value.trim();

        if (!descripcion) {
            alert('⚠️ Por favor, ingresa una descripción.');
            return;
        }

        const { categoria, organizacion } = asignarCategoriaYOrganizacion(descripcion);
        const iconoURL = iconosPorOrganizacion[organizacion] || iconosPorOrganizacion["Entidad correspondiente"];

        function procesarReporte(lat, lng) {
            if (imagenInput.files.length > 0) {
                const reader = new FileReader();
                reader.readAsDataURL(imagenInput.files[0]);
                reader.onload = function (e) {
                    const imagenURL = e.target.result;
                    agregarMarcador(lat, lng, descripcion, categoria, imagenURL, organizacion, iconoURL);
                    guardarReporte(lat, lng, descripcion, imagenURL, categoria);
                    limpiarCampos();
                    alert('✅ Reporte subido con éxito');
                };
            } else {
                agregarMarcador(lat, lng, descripcion, categoria, null, organizacion, iconoURL);
                guardarReporte(lat, lng, descripcion, '', categoria);
                limpiarCampos();
                alert('✅ Reporte subido con éxito');
            }
        }

        if (esMovil()) {
            navigator.geolocation.getCurrentPosition(
                position => procesarReporte(position.coords.latitude, position.coords.longitude),
                () => alert('⚠️ No se pudo obtener tu ubicación.')
            );
        } else {
            if (selectedLat !== null && selectedLng !== null) {
                procesarReporte(selectedLat, selectedLng);
            } else {
                alert('⚠️ Haz clic en el mapa para seleccionar una ubicación.');
            }
        }
    });

    function agregarMarcador(lat, lng, descripcion, categoria, imagenURL, organizacion, iconoURL) {
        let popupContent = 
            `<div style="font-family: Poppins, sans-serif; font-size: 14px; line-height: 1.5;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="font-size: 16px;">📌</span><strong>Categoría:</strong> ${categoria}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <img src="${iconoURL}" alt="icono" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc;" />
                    <div><strong>Organización:</strong> ${organizacion}</div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 8px;">
                    <span style="font-size: 16px;">📝</span><strong>Descripción:</strong> ${descripcion}
                </div>
                ${imagenURL ? `<img src="${imagenURL}" style="width: 100%; max-width: 250px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">` : ''}
            </div>`;

        const marker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: iconoURL,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            })
        }).addTo(map);

        marker.bindPopup(popupContent);
    }

    function limpiarCampos() {
        document.getElementById('descripcion').value = "";
        document.getElementById('imagen').value = "";
    }

    function guardarReporte(lat, lng, descripcion, imagenURL, categoria) {
        const reportes = JSON.parse(localStorage.getItem('reportes')) || [];
        reportes.push({ lat, lng, descripcion, imagenURL, categoria });
        localStorage.setItem('reportes', JSON.stringify(reportes));
    }

    document.getElementById('homeBtn').addEventListener('click', function () {
        const screen = document.getElementById("transition-screen");
        if (screen) {
            screen.innerHTML = '<div class="spinner"></div>';
            screen.classList.add("active");
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 2000);
        } else {
            window.location.href = 'menu.html';
        }
    });
});

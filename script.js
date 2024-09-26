document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll(".repair-checkbox");
    const selectedRepairs = document.getElementById("selectedRepairs");
    const totalPriceElement = document.getElementById("totalPrice");
    const addRepairBtn = document.getElementById("addRepairBtn");
    const addPartBtn = document.getElementById("addPartBtn");
    const toggleRepairFormBtn = document.getElementById("toggleRepairFormBtn");
    const newRepairForm = document.getElementById("newRepairForm");
    const clearSummaryBtn = document.getElementById("clearSummaryBtn");    
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    let totalPrice = 0;

    // Función para actualizar el resumen y el total
    function updateSummary(name, price, isAdding) {
        if (isAdding) {
            // Agregar al resumen
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.setAttribute("data-precio", price);
            listItem.innerHTML = `
                ${name} - $${price} 
                <button type="button" class="btn btn-danger btn-sm float-end remove-btn">Eliminar</button>
            `;
            selectedRepairs.appendChild(listItem);
            totalPrice += price;
        } else {
            // Quitar del resumen
            const items = selectedRepairs.querySelectorAll("li");
            items.forEach(item => {
                if (item.textContent.includes(name)) {
                    selectedRepairs.removeChild(item);
                    totalPrice -= price;
                }
            });
        }
        // Actualizar el precio total
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }
    
    // Evento para eliminar ítems individuales
    selectedRepairs.addEventListener("click", function(event) {
        if (event.target.classList.contains("remove-btn")) {
            const listItem = event.target.closest("li");
            const price = parseFloat(listItem.getAttribute("data-precio"));
            const name = listItem.textContent.split(" - $")[0]; // Obtener el nombre de la reparación
            selectedRepairs.removeChild(listItem);
            totalPrice -= price;
            totalPriceElement.textContent = totalPrice.toFixed(2);
    
            // Asegúrate de desmarcar el checkbox correspondiente
            checkboxes.forEach(checkbox => {
                if (checkbox.value === name) {
                    checkbox.checked = false;
                }
            });
        }
    });

    // Evento para los checkboxes de reparaciones predefinidas
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            const repairName = this.value;
            const repairPrice = parseFloat(this.getAttribute("data-precio"));
            updateSummary(repairName, repairPrice, this.checked);
        });
    });
    
    // Evento para agregar una nueva reparación
    addRepairBtn.addEventListener("click", function () {
        const repairName = document.getElementById("newRepairName").value;
        const repairPrice = parseFloat(document.getElementById("newRepairPrice").value);
        
        if (repairName && repairPrice) {
            // Crear un checkbox para la nueva reparación
            const newRepairCheckbox = document.createElement("div");
            newRepairCheckbox.classList.add("form-check");
            newRepairCheckbox.innerHTML = `
                <input class="form-check-input repair-checkbox" type="checkbox" value="${repairName}" data-precio="${repairPrice}">
                <label class="form-check-label">${repairName} - $${repairPrice}</label>
            `;
            document.getElementById("repairForm").appendChild(newRepairCheckbox); // Corrección aquí
    
            // Agregar evento al nuevo checkbox
            const checkboxInput = newRepairCheckbox.querySelector("input");
            checkboxInput.addEventListener("change", function () {
                updateSummary(repairName, repairPrice, this.checked);
            });
    
            // Limpiar los campos de texto
            document.getElementById("newRepairName").value = '';
            document.getElementById("newRepairPrice").value = '';
        }
    });
    
    // Evento para agregar un repuesto adicional
    addPartBtn.addEventListener("click", function () {
        const partName = document.getElementById("newPartName").value;
        const partPrice = parseFloat(document.getElementById("newPartPrice").value);

        if (partName && partPrice) {
            // Agregar el repuesto al resumen como un ítem independiente
            updateSummary(partName, partPrice, true);
        }
    });
    
    exportPdfBtn.addEventListener("click", function () {
        // Paso 1: Cargar el archivo HTML externo con fetch()
        fetch('./templateODT.html')
            .then(response => response.text())
            .then(htmlContent => {
                // Crear un elemento temporal para insertar el contenido del archivo HTML
                const tempElement = document.createElement('div');
                tempElement.innerHTML = htmlContent;
    
                // Paso 2: Insertar los datos dinámicos en el contenido HTML
                const selectedItems = document.querySelectorAll("#selectedRepairs li"); // Resumen actual
                const totalPrice = document.getElementById("totalPrice").textContent;   // Precio total
    
                // Insertar los ítems de reparaciones seleccionadas en la tabla
                const tbodyElement = tempElement.querySelector('#selectedRepairs'); // Asegúrate de que el ID exista en tu template
                selectedItems.forEach(item => {
                    const repairRow = document.createElement('tr');
                    
                    // Acceder al contenido de `li`
                    const textContent = item.textContent.trim();
                    const [repairName, repairPrice] = textContent.split(" - $");
    
                    // Generar la fila de la tabla
                    repairRow.innerHTML = `<td>${repairName}</td><td>$${repairPrice}</td>`;
                    tbodyElement.appendChild(repairRow);
                });
    
                // Actualizar el total en el HTML
                tempElement.querySelector('h2').textContent = `Total: $${totalPrice}`;
    
                // Paso 3: Generar el PDF desde el contenido HTML
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
    
                // Esperar un momento para que se renderice todo el contenido
                setTimeout(() => {
                    doc.html(tempElement, {
                        callback: function (doc) {
                            doc.save("resumen-reparaciones.pdf");
                        },
                        x: 5, // Ajustar posición X
                        y: 5, // Ajustar posición Y
                        html2canvas: { scale: 0.1 }, // Ajustar el escalado de la imagen si es necesario
                        width: 100, // Ancho del documento
                        windowWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) // Ajuste de tamaño de ventana
                    });
                }, 1000); // Retraso de 1 segundo para asegurar que el contenido se renderice completamente
            })
            .catch(error => console.error('Error al cargar el archivo HTML:', error));
    });
        
    // Evento para borrar el resumen
    clearSummaryBtn.addEventListener("click", function () {
        selectedRepairs.innerHTML = ''; // Eliminar todos los ítems del resumen
        totalPrice = 0; // Reiniciar el total
        totalPriceElement.textContent = totalPrice.toFixed(2); // Actualizar el total mostrado
    });
});

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
    const señaPriceInput = document.getElementById("señaPrice");
    const saldoPriceElement = document.getElementById("saldoPrice");
    
    // Variables de cliente
    const clientNameInput = document.getElementById('clientNameInput');
    const clientDNIInput = document.getElementById('clientDNIInput');
    const clientPhoneInput = document.getElementById('clientPhoneInput');
    const clientAuthInput = document.getElementById('clientAuthInput');

    let totalPrice = 0;

     // Función para actualizar el saldo
     function updateSaldo() {
        const señaPrice = parseFloat(señaPriceInput.value) || 0; // Obtener la seña o 0 si es inválido
        const saldo = totalPrice - señaPrice; // Calcular el saldo
        saldoPriceElement.textContent = saldo.toFixed(2); // Actualizar el saldo en el HTML
    }

    // Actualizar el resumen y el total
    function updateSummary(name, price, isAdding) {
        if (isAdding) {
            // Actualizar el total sumando el precio
            totalPrice += price;
        } else {
            // Actualizar el total restando el precio
            totalPrice -= price;
        }
        totalPriceElement.textContent = totalPrice.toFixed(2); // Mostrar el total
        updateSaldo(); // Actualizar el saldo
    }

    // Escuchar cambios en el input de seña para actualizar el saldo dinámicamente
    señaPriceInput.addEventListener("input", function () {
        updateSaldo();
    });

    selectedRepairs.addEventListener("click", function(event) {
        if (event.target.classList.contains("remove-btn")) {
            const listItem = event.target.closest("li");
            const price = parseFloat(listItem.getAttribute("data-precio"));
            const name = listItem.textContent.split(" - $")[0];
            selectedRepairs.removeChild(listItem);
            totalPrice -= price;
            totalPriceElement.textContent = totalPrice.toFixed(2);
            checkboxes.forEach(checkbox => {
                if (checkbox.value === name) {
                    checkbox.checked = false;
                }
            });
        }
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            const repairName = this.value;
            const repairPrice = parseFloat(this.getAttribute("data-precio"));
            updateSummary(repairName, repairPrice, this.checked);
        });
    });

    addRepairBtn.addEventListener("click", function () {
        const repairName = document.getElementById("newRepairName").value;
        const repairPrice = parseFloat(document.getElementById("newRepairPrice").value);
        
        if (repairName && repairPrice) {
            const newRepairCheckbox = document.createElement("div");
            newRepairCheckbox.classList.add("form-check");
            newRepairCheckbox.innerHTML = `
                <input class="form-check-input repair-checkbox" type="checkbox" value="${repairName}" data-precio="${repairPrice}">
                <label class="form-check-label">${repairName} - $${repairPrice}</label>
            `;
            document.getElementById("repairForm").appendChild(newRepairCheckbox);

            const checkboxInput = newRepairCheckbox.querySelector("input");
            checkboxInput.addEventListener("change", function () {
                updateSummary(repairName, repairPrice, this.checked);
            });

            document.getElementById("newRepairName").value = '';
            document.getElementById("newRepairPrice").value = '';
        }
    });

    addPartBtn.addEventListener("click", function () {
        const partName = document.getElementById("newPartName").value;
        const partPrice = parseFloat(document.getElementById("newPartPrice").value);

        if (partName && partPrice) {
            updateSummary(partName, partPrice, true);
        }
    });

    exportPdfBtn.addEventListener("click", function () {
        fetch('./templateODT.html')
            .then(response => response.text())
            .then(htmlContent => {
                const tempElement = document.createElement('div');
                tempElement.innerHTML = htmlContent;
    
                const removeButtons = document.querySelectorAll(".remove-btn");
                removeButtons.forEach(button => button.remove());
    
                // Paso 1: Captura los datos del cliente
                const clientName = clientNameInput.value;
                const clientDNI = clientDNIInput.value;
                const clientPhone = clientPhoneInput.value;
                const clientAuth = clientAuthInput.value;
    
                // Paso 2: Insertar los datos del cliente en el HTML del template
                const clientNameElement = tempElement.querySelector("#clientName");
                const clientDNIElement = tempElement.querySelector("#clientDNI");
                const clientPhoneElement = tempElement.querySelector("#clientPhone");
                const clientAuthElement = tempElement.querySelector("#clientAuth");
    
                if (clientNameElement && clientDNIElement && clientPhoneElement && clientAuthElement) {
                    clientNameElement.textContent = clientName;
                    clientDNIElement.textContent = clientDNI;
                    clientPhoneElement.textContent = clientPhone;
                    clientAuthElement.textContent = clientAuth;
                } else {
                    console.error("Uno o más campos de cliente no fueron encontrados en el template.");
                }
    
                // Paso 3: Insertar las reparaciones seleccionadas
                const selectedItems = document.querySelectorAll("#selectedRepairs li");
                let totalSum = 0;
                const tbodyElement = tempElement.querySelector('#selectedRepairs');
    
                if (tbodyElement) {
                    selectedItems.forEach(item => {
                        const repairRow = document.createElement('tr');
                        const textContent = item.textContent.trim();
                        const [repairName, repairPrice] = textContent.split(" - $");
    
                        const priceValue = parseFloat(repairPrice);
                        totalSum += priceValue;
    
                        repairRow.innerHTML = `<td>${repairName}</td><td>$${repairPrice}</td>`;
                        tbodyElement.appendChild(repairRow);
                    });
    
                    const totalElement = tempElement.querySelector('#totalAmount');
                    
                    if (totalElement) {
                        totalElement.textContent = totalSum.toFixed(2);
                    } else {
                        console.error("El campo para mostrar el total no fue encontrado.");
                    }
    
                    // Paso 4: Capturar y exportar Seña y Saldo
                    const totalSeñaElement = tempElement.querySelector('#totalSeña');
                    const totalSaldoElement = tempElement.querySelector('#totalSaldo');
    
                    if (totalSeñaElement && totalSaldoElement) {
                        totalSeñaElement.textContent = señaPriceInput.value;
                        totalSaldoElement.textContent = saldoPriceElement.textContent;
                    } else {
                        console.error("El campo para mostrar la seña o el saldo no fue encontrado.");
                    }
    
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
    
                    setTimeout(() => {
                        doc.html(tempElement, {
                            callback: function (doc) {
                                doc.save("resumen-reparaciones.pdf");
                                restoreRemoveButtons();
                            },
                            x: 5,
                            y: 5,
                            html2canvas: { scale: 0.1 },
                            width: 100,
                            windowWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
                        });
                    }, 1000);
                } else {
                    console.error("El elemento tbody para las reparaciones seleccionadas no fue encontrado.");
                }
            })
            .catch(error => console.error('Error al cargar el archivo HTML:', error));
    });
    

    function restoreRemoveButtons() {
        const selectedItems = document.querySelectorAll("#selectedRepairs li");
        selectedItems.forEach(item => {
            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.classList.add("btn", "btn-danger", "btn-sm", "float-end", "remove-btn");
            removeButton.textContent = "Eliminar";
            item.appendChild(removeButton);
        });
    }

    clearSummaryBtn.addEventListener("click", function () {
        selectedRepairs.innerHTML = '';
        totalPrice = 0;
        totalPriceElement.textContent = totalPrice.toFixed(2);
    });
});

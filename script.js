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
    const repairDateInput = document.getElementById('repairDate');

    
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
        checkbox.addEventListener('change', function () {
            const repairName = this.value;
            const repairPrice = parseFloat(this.getAttribute('data-precio'));
            
            if (isNaN(repairPrice)) {
                console.error(`Precio no válido para ${repairName}`);
                return;
            }
    
            if (this.checked) {
                const listItem = document.createElement('li');
                listItem.textContent = `${repairName} - $${repairPrice.toFixed(2)}`;
                listItem.classList.add('list-group-item');
                listItem.setAttribute('data-precio', repairPrice); // Agregar el precio al atributo del elemento
                selectedRepairs.appendChild(listItem);
    
                totalPrice += repairPrice;
            } else {
                const items = Array.from(selectedRepairs.children);
                const itemToRemove = items.find(item => item.textContent.includes(repairName));
                if (itemToRemove) {
                    const priceToRemove = parseFloat(itemToRemove.getAttribute('data-precio'));
                    selectedRepairs.removeChild(itemToRemove);
                    totalPrice -= priceToRemove;
                }
            }
    
            totalPriceElement.textContent = totalPrice.toFixed(2); // Asegura que el valor sea un número formateado
            updateSaldo();
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
            // Crear un nuevo elemento de lista para el repuesto
            const listItem = document.createElement('li');
            listItem.textContent = `${partName} - $${partPrice.toFixed(2)}`;
            listItem.classList.add('list-group-item');
            listItem.setAttribute('data-precio', partPrice); // Agregar el precio al atributo del elemento
    
            // Añadir un botón para eliminar el repuesto
            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.classList.add("btn", "btn-danger", "btn-sm", "float-end", "remove-btn");
            removeButton.textContent = "Eliminar";
            listItem.appendChild(removeButton);
    
            selectedRepairs.appendChild(listItem); // Agregar el repuesto a la lista de repuestos seleccionados
    
            updateSummary(partName, partPrice, true); // Actualizar el resumen y el total
    
            // Limpiar los campos de entrada para el próximo repuesto
            document.getElementById("newPartName").value = '';
            document.getElementById("newPartPrice").value = '';

        }
    });
    
    exportPdfBtn.addEventListener("click", function () {
        fetch('./nuevaOT.html')
            .then(response => response.text())
            .then(htmlContent => {
                const tempElement = document.createElement('div');
                tempElement.innerHTML = htmlContent;
    
                // Crear una instancia del objeto Date para obtener la fecha actual
                var fechaActual = new Date();
                var dia = fechaActual.getDate(); // Día del mes (1-31)
                var mes = fechaActual.getMonth() + 1; // Mes (0-11, por eso sumamos 1)
                var año = fechaActual.getFullYear(); // Año completo (e.g., 2024)
    
                // Asegúrate de que los elementos existen antes de asignar
                const diaElement = tempElement.querySelector('#dia-actual');
                const mesElement = tempElement.querySelector('#mes-actual');
                const añoElement = tempElement.querySelector('#año-actual');
                const diaIngresoElement = tempElement.querySelector('#dia-ingreso');
                const mesIngresoElement = tempElement.querySelector('#mes-ingreso');
                const añoIngresoElement = tempElement.querySelector('#año-ingreso');
                const fechaIngreso = `${dia}/${mes}/${año}`;
                if (diaElement && mesElement && añoElement) {
                    diaElement.innerText = dia;
                    mesElement.innerText = mes;
                    añoElement.innerText = año;
                    diaIngresoElement.innerText = dia;
                    mesIngresoElement.innerText = mes;
                    añoIngresoElement.innerText = año;
                } else {
                    console.error("Uno o más elementos de fecha no fueron encontrados en el template.");
                    return; // Salir de la función si no se encuentran los elementos
                }
                
                 // Captura la fecha seleccionada
                const selectedDate = new Date(repairDateInput.value);
                const diaRetiro = selectedDate.getDate(); // Día del mes (1-31)
                const mesRetiro = selectedDate.getMonth() + 1; // Mes (0-11, por eso sumamos 1)
                const añoRetiro = selectedDate.getFullYear(); // Año completo (e.g., 2024)
                console.log(diaRetiro, mesRetiro, añoRetiro)
                // Asegúrate de que los elementos existen antes de asignar
                const diaRetiroElement = tempElement.querySelector('#dia-retiro');
                const mesRetiroElement = tempElement.querySelector('#mes-retiro');
                const añoRetiroElement = tempElement.querySelector('#año-retiro');
    
                if (diaRetiroElement && mesRetiroElement && añoRetiroElement) {
                    diaRetiroElement.innerText = diaRetiro;
                    mesRetiroElement.innerText = mesRetiro;
                    añoRetiroElement.innerText = añoRetiro;
                } else {
                    console.error("Uno o más elementos de fecha no fueron encontrados en el template.");
                    return; // Salir de la función si no se encuentran los elementos
                }
                
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
                const selectedItems = Array.from(selectedRepairs.children); // Obtener los elementos seleccionados
                let totalSum = 0;
                const tbodyElement = tempElement.querySelector('#selectedRepairs');
    
                if (tbodyElement) {
                    selectedItems.forEach(item => {
                        const textContent = item.textContent.replace("Eliminar", "").trim();
                        const [repairName, repairPrice] = textContent.split(" - $");
    
                        const priceValue = parseFloat(repairPrice);
                        totalSum += priceValue;
                        
                        // Crear un <tr> para la reparación
                        const rowElement = document.createElement('tr');
                
                        // Crear un <td> para el nombre de la reparación
                        const repairNameElement = document.createElement('td');
                        repairNameElement.textContent = repairName;
                
                        // Crear un <td> para el precio
                        const repairPriceElement = document.createElement('td');
                        repairPriceElement.textContent = repairPrice;
                
                        // Agregar los <td> al <tr>
                        rowElement.appendChild(repairNameElement);
                        rowElement.appendChild(repairPriceElement);
                
                        // Agregar el <tr> al <tbody>
                        tbodyElement.appendChild(rowElement);
                    });

                    // Paso 4: Capturar y exportar Seña y Saldo
                    const totalSeñaElement = tempElement.querySelector('#totalSeña');
                    const totalSaldoElement = tempElement.querySelector('#totalSaldo');
                    const totalElement = tempElement.querySelector('#totalPrice');
                    
                    if (totalSeñaElement && totalElement && totalSaldoElement) {
                        totalElement.textContent = totalSum.toFixed(2);
                        totalSeñaElement.textContent = señaPriceInput.value;
                        totalSaldoElement.textContent = saldoPriceElement.textContent;
                    } else {
                        console.error("El campo para mostrar la seña o el saldo no fue encontrado.");
                    }
                    
                    // 1. Insertar en el DOM (invisible)
                    tempElement.style.position = 'absolute';
                    tempElement.style.left = '-9999px';
                    document.body.appendChild(tempElement);
                    
                    html2canvas(tempElement, {
                        scale: 2, // mejora la resolución
                        useCORS: true,
                        logging: false
                    }).then((canvas) => {
                        const imgData = canvas.toDataURL('image/png');
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF('p', 'mm', 'a4'); // formato A4
                    
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                    
                        const scale = 0.8;
                        const imgWidth = pageWidth * scale;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                        const xOffset = (pageWidth - imgWidth) / 2; // Centrado horizontal
                    
                        let position = 0;
                        if (imgHeight < pageHeight) {
                            // Una sola página
                            pdf.addImage(imgData, 'PNG', xOffset, position, imgWidth, imgHeight);
                        } else {
                          // Múltiples páginas
                          let heightLeft = imgHeight;
                          while (heightLeft > 0) {
                            pdf.addImage(imgData, 'PNG', xOffset, position, imgWidth, imgHeight);
                            heightLeft -= pageHeight;
                            position -= pageHeight;
                            if (heightLeft > 0) {
                              pdf.addPage();
                            }
                          }
                        }
                        pdf.save(`${clientDNI}-${fechaIngreso}.pdf`);
                        
                        document.body.removeChild(tempElement);

                      });
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

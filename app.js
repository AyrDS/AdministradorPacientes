/* INPUTS FORMULARIO */
const nombreInput = document.querySelector("#nombre");
const telefonoInput = document.querySelector("#telefono");
const fechaInput = document.querySelector("#fecha");
const horaInput = document.querySelector("#hora");
const sintomasInput = document.querySelector("#sintomas");
/* --------------------- */

/* UI */
const contenedorTurnos = document.querySelector("#turnos");
const formulario = document.querySelector("#nuevo-turno");
/* ------------------ */

let editando;

/* CLASES */
class Turnos {
    constructor() {
        this.turnos = [];
    }

    agregarTurno(turno) {
        this.turnos = [...this.turnos, turno];
    }

    eliminarTurno(id) {
        this.turnos = this.turnos.filter(turno => turno.id !== id);
    }

    editarTurno(turnoActualizado) {
        this.turnos = this.turnos.map(turno => turno.id === turnoActualizado.id ? turnoActualizado : turno);
    }
}

class UI {
    mostrarAlerta(mensaje, tipo) {

        const divMensaje = document.createElement("div");
        divMensaje.classList.add("alert", "text-center", "col-12", "d-block", "fw-bold");

        if (tipo === "error") {
            divMensaje.classList.add("alert-danger");
        } else {
            divMensaje.classList.add("alert-success");
        };

        divMensaje.textContent = mensaje;
        document.querySelector("main").insertBefore(divMensaje, document.querySelector(".contenedor"));

        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    };

    mostrarTurnos({ turnos }) {
        this.limpiarHTML();
        document.querySelector(".tituloTurnos").style.display = "none";
        console.log(turnos);

        turnos.forEach(turno => {
            const { nombre, telefono, fecha, hora, sintomas, id } = turno;

            const divTurno = document.createElement("div");
            divTurno.classList.add("turno", "card", "p-3", "mb-3");
            divTurno.dataset.id = id;

            const nombreParrafo = document.createElement("h3");
            nombreParrafo.classList.add("card-title", "fw-bolder");
            nombreParrafo.textContent = nombre;

            const telefonoParrafo = document.createElement("p");
            telefonoParrafo.innerHTML = `
                <span class="fw-bolder">Teléfono: </span>${telefono}
            `;

            const fechaParrafo = document.createElement("p");
            fechaParrafo.innerHTML = `
                <span class="fw-bolder">Fecha: </span>${fecha}
            `;

            const horaParrafo = document.createElement("p");
            horaParrafo.innerHTML = `
                <span class="fw-bolder">Hora: </span>${hora}
            `;

            const sintomasParrafo = document.createElement("p");
            sintomasParrafo.innerHTML = `
                <span class="fw-bolder">Sintomas: </span>${sintomas}
            `;

            //Botones
            const divBotones = document.createElement("div");
            divBotones.classList.add("d-grid", "gap-2", "d-md-block");

            //Boton para eliminar
            const btnEliminar = document.createElement("button");
            btnEliminar.classList.add("btn", "btn-danger", "mt-2");
            btnEliminar.innerHTML = "Eliminar <i class='fas fa-trash-alt'></i>";
            btnEliminar.onclick = () => eliminarTurno(id);
            divBotones.appendChild(btnEliminar);

            //Boton para editar
            const btnEditar = document.createElement("button");
            btnEditar.classList.add("btn", "btn-info", "mt-2", "ms-2");
            btnEditar.innerHTML = "Editar <i class='fas fa-pen'></i>";
            btnEditar.onclick = () => cargarEdicion(turno);
            divBotones.appendChild(btnEditar);


            divTurno.appendChild(nombreParrafo);
            divTurno.appendChild(telefonoParrafo);
            divTurno.appendChild(fechaParrafo);
            divTurno.appendChild(horaParrafo);
            divTurno.appendChild(sintomasParrafo);
            divTurno.appendChild(divBotones);

            contenedorTurnos.appendChild(divTurno);

        });
    };

    limpiarHTML() {
        while (contenedorTurnos.firstChild) {
            contenedorTurnos.removeChild(contenedorTurnos.firstChild);
        }
    };
}

//Inicializamos las clases
const ui = new UI;
const administrarTurnos = new Turnos;


document.addEventListener("DOMContentLoaded", () => {

    nombreInput.addEventListener("input", datosTurno);
    telefonoInput.addEventListener("input", datosTurno);
    fechaInput.addEventListener("input", datosTurno);
    horaInput.addEventListener("input", datosTurno);
    sintomasInput.addEventListener("input", datosTurno);

    formulario.addEventListener("submit", nuevoTurno);
});

const turnoObj = {
    nombre: "",
    telefono: "",
    fecha: "",
    hora: "",
    sintomas: ""
}

/* FUNCIONES */

//Almacena en un objeto los datos del formulario
function datosTurno(e) {
    turnoObj[e.target.name] = e.target.value;
}

//Valida y agrega un nuevo turno a la clase de Turnos
function nuevoTurno(e) {
    e.preventDefault();

    //Extraigo información del objeto turno
    const { nombre, telefono, fecha, hora, sintomas } = turnoObj;

    // Validamos los inputs
    if (nombre === "" || telefono === "" || fecha === "" || hora === "" || sintomas === "") {
        ui.mostrarAlerta("Todos los campos son obligatorios", "error");

        return;
    };

    if (editando) {

        //Pasar el objeto actualizado
        administrarTurnos.editarTurno({ ...turnoObj });

        ui.mostrarAlerta("Editado correctamente");

        formulario.querySelector("button[type='submit']").textContent = "Crear turno";
        editando = false;

    } else {

        //Generamos un ID único
        turnoObj.id = Date.now();

        //Agregamos el turno al array de Turnos
        administrarTurnos.agregarTurno({ ...turnoObj });        

        //Mensaje de agregado correctamente
        ui.mostrarAlerta("Turno agregado correctamente")
    }

    //Reinicio del obj para próximas validaciones
    reinicarObjeto();

    formulario.reset();

    //Mostrar HTML
    ui.mostrarTurnos(administrarTurnos);
}

function reinicarObjeto() {
    turnoObj.nombre = "";
    turnoObj.telefono = "";
    turnoObj.fecha = "";
    turnoObj.hora = "";
    turnoObj.sintomas = "";
}

function eliminarTurno(id) {
    //Eliminar turno
    administrarTurnos.eliminarTurno(id);

    //Mostrar mensaje
    ui.mostrarAlerta("El turno se eliminó correctamente");

    //Actualizar turnos
    ui.mostrarTurnos(administrarTurnos);
    const cards = document.querySelectorAll(".card");
    if (cards.length <= 0) {
        document.querySelector(".tituloTurnos").style.display = "block";
    };
}

function cargarEdicion(turno) {
    const { nombre, telefono, fecha, hora, sintomas, id } = turno;

    nombreInput.value = nombre;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    //Llenar objeto para validación
    turnoObj.nombre = nombre;
    turnoObj.telefono = telefono;
    turnoObj.fecha = fecha;
    turnoObj.hora = hora;
    turnoObj.sintomas = sintomas;
    turnoObj.id = id;


    //Cambiar texto boton
    formulario.querySelector("button[type='submit']").textContent = "Guardar cambios";

    editando = true;
}
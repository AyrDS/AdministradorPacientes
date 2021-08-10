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
let DB;

/* CLASES */
class Turnos {
    constructor() {
        this.turnos = [];
    }

    agregarTurno(turno) {
        this.turnos = [...this.turnos, turno];
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

    mostrarTurnos() {
        this.limpiarHTML();

        //Leer contenido de la base de datos
        const objectStore = DB.transaction("turnos").objectStore("turnos");

        const fnTextoTitulo = this.textoTitulo;
        const total = objectStore.count();
        total.onsuccess = function () {
            fnTextoTitulo(total.result);
        }
        objectStore.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;

            if (cursor) {
                const { nombre, telefono, fecha, hora, sintomas, id } = cursor.value;

                const divTurno = document.createElement("div");
                divTurno.classList.add("turno", "card", "p-3", "mb-3");
                divTurno.dataset.id = id;

                const nombreParrafo = document.createElement("h3");
                nombreParrafo.classList.add("card-title", "fw-bolder");
                nombreParrafo.textContent = nombre;

                const telefonoParrafo = document.createElement("p");
                telefonoParrafo.innerHTML = `
                <span class="fw-bolder">Teléfono: </span>${telefono}`;

                const fechaParrafo = document.createElement("p");
                fechaParrafo.innerHTML = `
                <span class="fw-bolder">Fecha: </span>${fecha}`;

                const horaParrafo = document.createElement("p");
                horaParrafo.innerHTML = `
                <span class="fw-bolder">Hora: </span>${hora}`;

                const sintomasParrafo = document.createElement("p");
                sintomasParrafo.innerHTML = `
                <span class="fw-bolder">Sintomas: </span>${sintomas}`;

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
                const turno = cursor.value;
                btnEditar.onclick = () => cargarEdicion(turno);
                divBotones.appendChild(btnEditar);


                divTurno.appendChild(nombreParrafo);
                divTurno.appendChild(telefonoParrafo);
                divTurno.appendChild(fechaParrafo);
                divTurno.appendChild(horaParrafo);
                divTurno.appendChild(sintomasParrafo);
                divTurno.appendChild(divBotones);

                contenedorTurnos.appendChild(divTurno);

                //Siguiente elemento de la db
                cursor.continue();
            }
        }
    };

    limpiarHTML() {
        while (contenedorTurnos.firstChild) {
            contenedorTurnos.removeChild(contenedorTurnos.firstChild);
        }
    };

    textoTitulo(resultado) {
        const titulo = document.querySelector(".tituloTurnos")
        if (resultado > 0) {
            titulo.textContent = "Administra tus pacientes"
        } else {
            titulo.textContent = "No hay turnos reservados"
        }
    }
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

    crearDB();
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

        //Edita en IndexedDB
        const transaction = DB.transaction(["turnos"], "readwrite");
        const objectStore = transaction.objectStore("turnos");

        objectStore.put(turnoObj);

        transaction.oncomplete = () => {

            ui.mostrarAlerta("Editado correctamente");

            formulario.querySelector("button[type='submit']").textContent = "Crear turno";
            editando = false;
        }

        transaction.onerror = () => {
            console.log("Hubo un error");
        }


    } else {

        //Generamos un ID único
        turnoObj.id = Date.now();

        //Agregamos el turno al array de Turnos
        administrarTurnos.agregarTurno({ ...turnoObj });

        //Insertar registro en indexedDB
        const transaction = DB.transaction(["turnos"], "readwrite");

        const objectStore = transaction.objectStore("turnos");

        objectStore.add(turnoObj);

        transaction.oncomplete = () => {
            //Mensaje de agregado correctamente
            ui.mostrarAlerta("Turno agregado correctamente")
        }

        transaction.onerror = () => {
            console.log("Hubo un error");
        }

    }

    //Reinicio del obj para próximas validaciones
    reinicarObjeto();

    formulario.reset();

    //Mostrar HTML
    ui.mostrarTurnos();
}

function reinicarObjeto() {
    turnoObj.nombre = "";
    turnoObj.telefono = "";
    turnoObj.fecha = "";
    turnoObj.hora = "";
    turnoObj.sintomas = "";
}

function eliminarTurno(id) {
    const transaction = DB.transaction(["turnos"], "readwrite");
    const objectStore = transaction.objectStore("turnos");

    //Eliminar turno
    objectStore.delete(id);

    transaction.oncomplete = () => {
        //Mostrar mensaje
        ui.mostrarAlerta("El turno se eliminó correctamente");

        //Actualizar turnos
        ui.mostrarTurnos();
    }

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

function crearDB() {
    const crearDB = window.indexedDB.open("turnos", 1);

    crearDB.onerror = function () {
        console.log("Error al crear base de datos");
    };

    crearDB.onsuccess = function () {
        DB = crearDB.result;

        //Mostrar lo que este guardado en la db una vez que este lista
        ui.mostrarTurnos();
    }

    //Definir el schema
    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore("turnos", {
            keyPath: "id",
            autoIncrement: true
        });

        //Definir columnas de la db
        objectStore.createIndex("nombre", "nombre", { unique: false });
        objectStore.createIndex("telefono", "telefono", { unique: false });
        objectStore.createIndex("fecha", "fecha", { unique: false });
        objectStore.createIndex("hora", "hora", { unique: false });
        objectStore.createIndex("sintomas", "sintomas", { unique: false });
        objectStore.createIndex("id", "id", { unique: true });
    }
}
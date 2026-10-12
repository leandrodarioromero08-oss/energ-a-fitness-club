/* ==========================================================
   Energía Fitness Club - js/script.js
   1. Calculadora de plan mensual
   2. Filtro de la grilla de horarios
   3. Modal de detalle de disciplina
   4. Formulario de pase gratis con validación
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    iniciarCalculadora();
    iniciarFiltros();
    iniciarModal();
    iniciarFormulario();
});

/* ----------------------------------------------------------
   1. CALCULADORA
   Los precios viven en el atributo value de cada input del HTML
   (radio name="pase" y checkbox name="adicional").
---------------------------------------------------------- */
function formatearPesos(numero) {
    // 35000 -> "$35.000"
    return "$" + numero.toLocaleString("es-AR");
}

function iniciarCalculadora() {
    const contenedor = document.querySelector(".calculadora");
    const totalEl = document.getElementById("total");
    if (!contenedor || !totalEl) return;

    function calcular() {
        const pase = contenedor.querySelector('input[name="pase"]:checked');
        const adicionales = contenedor.querySelectorAll('input[name="adicional"]:checked');

        let total = pase ? Number(pase.value) : 0;

        adicionales.forEach((check) => {
            total += Number(check.value);
        });

        totalEl.textContent = formatearPesos(total);
    }

    // "change" se dispara al elegir un radio o tildar/destildar un checkbox
    contenedor.addEventListener("change", calcular);
    calcular();
}

/* ----------------------------------------------------------
   2. FILTRO DE HORARIOS
   Cada botón tiene data-filtro (un día, una disciplina o "todos").
   Cada fila tiene data-dia y data-disciplina.
   Las filas que no coinciden reciben la clase "oculto".
---------------------------------------------------------- */
function iniciarFiltros() {
    const botones = document.querySelectorAll(".btn-filtro");
    const filas = document.querySelectorAll("#cuerpo-horarios tr");
    if (!botones.length || !filas.length) return;

    function filtrar(valor) {
        filas.forEach((fila) => {
            const coincide =
                valor === "todos" ||
                fila.dataset.dia === valor ||
                fila.dataset.disciplina === valor;

            fila.classList.toggle("oculto", !coincide);
        });
    }

    botones.forEach((boton) => {
        boton.addEventListener("click", () => {
            botones.forEach((b) => b.classList.remove("activo"));
            boton.classList.add("activo");
            filtrar(boton.dataset.filtro);
        });
    });
}

/* ----------------------------------------------------------
   3. MODAL
   Los datos salen de los data-* de cada .card-disciplina.
   El modal se muestra con la clase "activo".
---------------------------------------------------------- */
function iniciarModal() {
    const modal = document.getElementById("modal");
    const tarjetas = document.querySelectorAll(".card-disciplina");
    if (!modal || !tarjetas.length) return;

    const titulo = document.getElementById("modal-titulo");
    const intensidad = document.getElementById("modal-intensidad");
    const equipo = document.getElementById("modal-equipo");
    const contra = document.getElementById("modal-contra");
    const botonCerrar = document.getElementById("cerrar-modal");

    function abrir(tarjeta) {
        titulo.textContent = tarjeta.dataset.nombre;
        intensidad.textContent = tarjeta.dataset.intensidad;
        equipo.textContent = tarjeta.dataset.equipo;
        contra.textContent = tarjeta.dataset.contra;

        modal.classList.add("activo");
        document.body.style.overflow = "hidden"; // evita scroll de fondo
        botonCerrar.focus();
    }

    function cerrar() {
        modal.classList.remove("activo");
        document.body.style.overflow = "";
    }

    tarjetas.forEach((tarjeta) => {
        // accesibilidad: que también se pueda abrir con teclado
        tarjeta.setAttribute("tabindex", "0");
        tarjeta.setAttribute("role", "button");

        tarjeta.addEventListener("click", () => abrir(tarjeta));
        tarjeta.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                abrir(tarjeta);
            }
        });
    });

    botonCerrar.addEventListener("click", cerrar);

    // clic en el fondo oscuro (fuera del cuadro)
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrar();
    });

    // tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("activo")) cerrar();
    });
}

/* ----------------------------------------------------------
   4. FORMULARIO CON VALIDACIÓN
   Cada validador devuelve "" si está bien, o el mensaje de error.
---------------------------------------------------------- */
const VALIDADORES = {
    nombre: (valor) => {
        const v = valor.trim();
        if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{3,60}$/.test(v) || !v.includes(" ")) {
            return "Ingresá nombre y apellido (solo letras).";
        }
        return "";
    },

    dni: (valor) => {
        if (!/^\d{7,8}$/.test(valor.trim())) {
            return "El DNI debe tener 7 u 8 números, sin puntos ni espacios.";
        }
        return "";
    },

    telefono: (valor) => {
        // se sacan espacios, guiones y paréntesis; acepta +54 y 9 opcionales
        const limpio = valor.replace(/[\s()-]/g, "");
        if (!/^(\+?54)?9?\d{10}$/.test(limpio)) {
            return "Ingresá el teléfono con característica, sin 0 ni 15 (ej: 3794123456).";
        }
        return "";
    },

    email: (valor) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim())) {
            return "Ingresá un correo válido (ej: tunombre@mail.com).";
        }
        return "";
    },
};

function iniciarFormulario() {
    const form = document.getElementById("formulario");
    const mensajeExito = document.getElementById("mensaje-exito");
    if (!form) return;

    function validarCampo(id) {
        const input = document.getElementById(id);
        const errorEl = document.getElementById("error-" + id);
        const mensaje = VALIDADORES[id](input.value);

        errorEl.textContent = mensaje;
        input.classList.toggle("invalido", mensaje !== "");
        return mensaje === "";
    }

    Object.keys(VALIDADORES).forEach((id) => {
        const input = document.getElementById(id);

        // valida al salir del campo
        input.addEventListener("blur", () => validarCampo(id));

        // si ya tenía error, se vuelve a chequear mientras escribe
        input.addEventListener("input", () => {
            if (input.classList.contains("invalido")) validarCampo(id);
            mensajeExito.textContent = "";
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // se validan todos (sin cortar en el primero) para mostrar todos los errores juntos
        const resultados = Object.keys(VALIDADORES).map(validarCampo);

        if (!resultados.every(Boolean)) {
            mensajeExito.textContent = "";
            form.querySelector(".invalido").focus();
            return;
        }

        const nombre = document.getElementById("nombre").value.trim().split(" ")[0];
        const select = document.getElementById("disciplina");
        const disciplina = select.options[select.selectedIndex].text;

        mensajeExito.textContent =
            "¡Gracias, " + nombre + "! Recibimos tu solicitud de pase gratis para " +
            disciplina + ". Te vamos a contactar pronto.";

        form.reset();
    });
}
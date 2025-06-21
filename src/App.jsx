import { useState, useEffect, useRef } from "react";
import "./App.css";
import Erizo from "../public/Erizo.png";
import OsoPolar from "../public/OsoPolar.png";

function App() {
  const letters = "GHIKLNÑMNOPQRSTUVWXYZABCDEF".split("");
  const [modo, setModo] = useState(""); // <<-- NUEVO
  const [data, setData] = useState([]);
  const [preguntasPorLetra, setPreguntasPorLetra] = useState({});
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [estadoLetras, setEstadoLetras] = useState({});
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [letraActualIndex, setLetraActualIndex] = useState(0);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [tiempoFinal, setTiempoFinal] = useState(null);
  const roscoRef = useRef(null);
  const [mostrarPreguntaAyuda, setMostrarPreguntaAyuda] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [posicionNo, setPosicionNo] = useState({ top: "0px", left: "85px" });

  const mostrarCuadroAyuda = () => setMostrarPreguntaAyuda(true);
  const aceptarAyuda = () => {
    setMostrarAyuda(true);
    setMostrarPreguntaAyuda(false);
  };
  const rechazarAyuda = () => setMostrarPreguntaAyuda(false);
  const moverBotonNo = () => {
    const top = Math.random() * 80 + "%";
    const left = Math.random() * 80 + "%";
    setPosicionNo({ top, left });
  };

  const cargarDatos = async (modo) => {
    let archivo;
    switch (modo) {
      case "facil":
        archivo = "palabras_facil.json";
        break;
      case "polar":
        archivo = "palabras_polar.json";
        break;
      case "normal":
        archivo = "palabras_normal.json";
        break;
      default:
        return;
    }

    const respuesta = await fetch(archivo);
    const json = await respuesta.json();
    setData(json);

    const mapa = {};
    letters.forEach((letra) => {
      const opciones = json.filter(
        (entry) => entry.palabra?.[0]?.toUpperCase() === letra
      );
      if (opciones.length > 0) {
        const aleatoria =
          opciones[Math.floor(Math.random() * opciones.length)];
        mapa[letra] = aleatoria;
      }
    });
    setPreguntasPorLetra(mapa);
  };

  useEffect(() => {
    if (modo) {
      cargarDatos(modo);
    }
  }, [modo]);

  useEffect(() => {
    if (!juegoIniciado || juegoTerminado) return;
    const intervalo = setInterval(() => setSegundos((prev) => prev + 1), 1000);
    return () => clearInterval(intervalo);
  }, [juegoIniciado, juegoTerminado]);

useEffect(() => {
  const respondidas = Object.values(estadoLetras).filter(
    (estado) => estado === "correcta" || estado === "incorrecta"
  ).length;

  if (respondidas === letters.length && !juegoTerminado) {
    setJuegoTerminado(true);
    setTiempoFinal(segundos);
  }
}, [estadoLetras, juegoTerminado, segundos]);


  const reiniciarJuego = () => {
    if (!roscoRef.current) return;
    roscoRef.current.classList.add("girar-rosco");

    cargarDatos(modo).then(() => {
      setEstadoLetras({});
      setPreguntaActual(null);
      setRespuesta("");
      setJuegoTerminado(false);
      setJuegoIniciado(false);
      setLetraActualIndex(0);
      setSegundos(0);
      setTiempoFinal(null);
      setTimeout(() => {
        roscoRef.current.classList.remove("girar-rosco");
      }, 1000);
    });
  };

 const handleVerificar = () => {
  if (!preguntaActual) return;
  const correcta = preguntaActual.palabra.toLowerCase().trim();
  const ingresada = respuesta.toLowerCase().trim();
  const resultado = correcta === ingresada ? "correcta" : "incorrecta";

  const letra = letters[letraActualIndex];

  setEstadoLetras((prev) => {
    const nuevoEstado = { ...prev, [letra]: resultado };
    return nuevoEstado;
  });

  setRespuesta("");
  setPreguntaActual(null);

  setTimeout(() => {
    mostrarSiguientePreguntaDisponible();
  }, 100);
};

  const mostrarSiguientePreguntaDisponible = () => {
    let i = letraActualIndex;
    const total = letters.length;

    const letraActual = letters[i];
    setEstadoLetras((prev) => {
  if (!prev[letraActual]) {
    return { ...prev, [letraActual]: "pasada" };
  }
  return prev;
});


    for (let count = 0; count < total; count++) {
      i = (i + 1) % total;
      const letra = letters[i];
      if (!estadoLetras[letra] || estadoLetras[letra] === "pasada") {
  setPreguntaActual(preguntasPorLetra[letra] || null);
  setLetraActualIndex(i);
  return;
}
    }

    setPreguntaActual(null);
  };

  const correctas = Object.values(estadoLetras).filter((v) => v === "correcta").length;
  const incorrectas = Object.values(estadoLetras).filter((v) => v === "incorrecta").length;
  const incorrectasDetalles = letters
    .filter((letra) => estadoLetras[letra] === "incorrecta")
    .map((letra) => ({
      letra,
      correcta: preguntasPorLetra[letra]?.palabra || "",
    }));

  return (
    <>
    {modo === "polar" && <div className="snow"></div>}

      {!modo && (<div className="container-modal">
        <div className="modal-ayuda">
          <h2>Selecciona un modo de juego</h2>
          <div>
          <button onClick={() => setModo("facil")}>Fácil😒</button>
          <button onClick={() => setModo("polar")}>Polar🐻‍❄️</button>
          <button onClick={() => setModo("normal")}>Normal🥲</button>
          </div>
          </div>
        </div>
      )}

      {modo && (
        <>
          <div className="rosco-container" ref={roscoRef}>
            <div className="reloj">
              {Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, "0")}
            </div>
            {letters.map((letra, index) => {
              const angle = (360 / letters.length) * index;
              const estado = estadoLetras[letra];
              return (
<div
  key={index}
  className={`letra ${estado || ""}`}
  style={{
    transform: `rotate(${angle}deg) translate(150px) rotate(-${angle}deg)`,
  }}
  onClick={() => {
    if (!estado) {
      setPreguntaActual(preguntasPorLetra[letra] || null);
      setLetraActualIndex(index);
      setJuegoIniciado(true);
    }
  }}
>
  {letra}
</div>

              );
            })}
          </div>

          <div className="img-container">
          <img
  src={modo === "polar" ? OsoPolar : Erizo}
  alt={modo === "polar" ? "oso polar" : "erizo"}
  onClick={mostrarCuadroAyuda}
/>
          </div>

          {mostrarPreguntaAyuda && (
            <div className="modal-ayuda">
              <p>¿Necesitas una ayuda? u.u</p>
              <div>
              <button onClick={aceptarAyuda}>Sí</button>
              <button onClick={rechazarAyuda}>No</button>
            </div>
            </div>
          )}

          {mostrarAyuda && (
            <div className="modal-ayuda">
              <p>La palabra se encuentra en el diccionario y empieza con la letra seleccionada.</p>
              <div style={{ width:"100%", position: "relative", height: "60px" }}>
                <button onClick={() => setMostrarAyuda(false)}>Gracias :D</button>
                <button
                  style={{
                    position: "absolute",
                    top: posicionNo.top,
                    left: posicionNo.left,
                    transition: "top 0.2s, left 0.2s",
                  }}
                  onClick={moverBotonNo}
                >
                  Puto :(
                </button>
              </div>
            </div>
          )}

          {preguntaActual && (
            <div className="pregunta-box">
              <div className="texto-box">
                <h2>Letra: {preguntaActual.palabra[0].toUpperCase()}</h2>
                <p>{preguntaActual.definition}</p>
              </div>
              <input
                className="respuesta"
                type="text"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Tu respuesta"
              />
              <button className="button-resp" onClick={handleVerificar}>Verificar</button>
              <div className="pasa-container">
                <button className="button-pasa" onClick={mostrarSiguientePreguntaDisponible}>
                  Pasa Palabra
                </button>
              </div>
            </div>
          )}

          {juegoTerminado && (
  <div className={`modal-resumen ${correctas === letters.length ? "victoria" : ""}`}>
    
    <div className="resumen">
      <h2>Juego terminado</h2>
      <p>⏱️ Tiempo total: {Math.floor(tiempoFinal / 60)}:{(tiempoFinal % 60).toString().padStart(2, "0")}</p>
      <p>✅ Correctas: {correctas}</p>
      <p>❌ Incorrectas: {incorrectas}</p>
      <button className="button-nuevo" onClick={reiniciarJuego}>Reiniciar Juego</button>
      {incorrectasDetalles.length > 0 && (
        <>
          <h3 className="incorrectas">Palabras incorrectas:</h3>
          <ul className="incorrectas">
            {incorrectasDetalles.map((item) => (
              <li key={item.letra}>
                Letra {item.letra} era: <strong>{item.correcta}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>

    {correctas === letters.length && (
  <div className="fuegos-artificiales">
    <div className="explosion uno"></div>
  <div className="explosion dos"></div>
  <div className="explosion tres"></div>
  <div className="explosion cuatro"></div>
  <div className="explosion cinco"></div>
    <h1 className="texto-victoria">🎉¡GANASTE!🎉</h1>
  </div>
)}

  </div>
)}

        </>
      )}
    </>
  );
}
export default App;

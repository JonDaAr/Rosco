import { useState, useEffect } from "react";
import data from "../public/palabras.json";
import "./App.css";

function App() {
  const letters = "GHIJKLNÑMOPQRSTUVWXYZABCDEF".split("");
  const [preguntasPorLetra, setPreguntasPorLetra] = useState({});
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [estadoLetras, setEstadoLetras] = useState({});
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  useEffect(() => {
    const mapa = {};
    letters.forEach((letra) => {
      const opciones = data.filter(
        (entry) => entry.palabra?.[0]?.toUpperCase() === letra
      );
      if (opciones.length > 0) {
        const aleatoria = opciones[Math.floor(Math.random() * opciones.length)];
        mapa[letra] = aleatoria;
      }
    });
    setPreguntasPorLetra(mapa);
  }, []);

  const handleVerificar = () => {
    if (!preguntaActual) return;
    const correcta = preguntaActual.palabra.toLowerCase().trim();
    const ingresada = respuesta.toLowerCase().trim();
    const resultado = correcta === ingresada ? "correcta" : "incorrecta";

    const letra = preguntaActual.palabra[0].toUpperCase();
    setEstadoLetras((prev) => {
      const nuevoEstado = { ...prev, [letra]: resultado };
      // Verificar si se terminó el juego
      if (Object.keys(nuevoEstado).length === letters.length) {
        setJuegoTerminado(true);
      }
      return nuevoEstado;
    });

    setRespuesta("");
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
      <div className="rosco-container">
        {letters.map((letra, index) => {
          const total = letters.length;
          const angle = (360 / total) * index;
          const estado = estadoLetras[letra];

          return (
            <div
              key={index}
              className={`letra ${estado}`}
              style={{
                transform: `rotate(${angle}deg) translate(150px) rotate(-${angle}deg)`,
              }}
              onClick={() => {
                if (!estado) setPreguntaActual(preguntasPorLetra[letra] || null);
              }}
            >
              {letra}
            </div>
          );
        })}
      </div>
      <div className="img-container">
      <img src="/src/assets/Erizo.png" alt="erizo" />
      </div>
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
        </div>
      )}

      {juegoTerminado && (
        <div className="resumen">
          <h2>🎉 Juego terminado</h2>
          <p>✅ Correctas: {correctas}</p>
          <p>❌ Incorrectas: {incorrectas}</p>

          {incorrectasDetalles.length > 0 && (
            <>
              <h3>Palabras incorrectas:</h3>
              <ul>
                {incorrectasDetalles.map((item) => (
                  <li key={item.letra}>
                    Letra {item.letra}: era <strong>{item.correcta}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './App.css';

// DIFICULTAD x100
const RANGOS = [
  { nombre: "Noob", auraMin: 0 },
  { nombre: "NPC", auraMin: 5000 },
  { nombre: "Normie", auraMin: 20000 },
  { nombre: "Tryhard", auraMin: 100000 },
  { nombre: "Pro", auraMin: 500000 },
  { nombre: "Hacker", auraMin: 2000000 },
  { nombre: "Insane", auraMin: 10000000 },
  { nombre: "Basado", auraMin: 50000000 },
  { nombre: "Sigma", auraMin: 250000000 },
  { nombre: "Chad", auraMin: 1000000000 },
  { nombre: "Gigachad", auraMin: 5000000000 },
  { nombre: "GOAT", auraMin: 20000000000 },
  { nombre: "Legend", auraMin: 100000000000 },
  { nombre: "Final Boss", auraMin: 500000000000 },
  { nombre: "Admin", auraMin: 2500000000000 },
  { nombre: "GODLIKE", auraMin: 10000000000000 }
];

function App() {
  const [saldo, setSaldo] = useState(0);
  const [auraTotal, setAuraTotal] = useState(0);
  const [pestañaActiva, setPestañaActiva] = useState('niveles');

  const [rebirths, setRebirths] = useState(0);
  const [prestigios, setPrestigios] = useState(0);

  const [maxNivelHistorico, setMaxNivelHistorico] = useState(0);
  const [mostrarNiveles, setMostrarNiveles] = useState(false);

  const [nivelPoderClick, setNivelPoderClick] = useState(1);
  const [nivelAutoClick, setNivelAutoClick] = useState(0);
  const [nivelMultiplicador, setNivelMultiplicador] = useState(0);
  const [nivelProbCritico, setNivelProbCritico] = useState(0);
  const [nivelDanoCritico, setNivelDanoCritico] = useState(0);

  // ==========================================
  // MATEMÁTICAS EXACTAS (Sin redondeos)
  // ==========================================
  // Rebirth: +10% (0.10) | Prestigio: +100% (1.0)
  const bonoAscension = 1 + (rebirths * 0.10) + (prestigios * 1.0);

  const poderClickBase = nivelPoderClick;
  const autoClickBase = nivelAutoClick * 2;
  const multiplicadorGlobal = (1 + (nivelMultiplicador * 0.1)) * bonoAscension;

  const probCritico = nivelProbCritico * 2.25;
  const danoCritico = 2 + (nivelDanoCritico * 0.5);

  // Guardamos los decimales para que el progreso sea 100% fiel
  const clickReal = poderClickBase * multiplicadorGlobal;
  const autoClickReal = autoClickBase * multiplicadorGlobal;

  const costePoderClick = Math.floor(100 * Math.pow(1.5, nivelPoderClick - 1));
  const costeAutoClick = Math.floor(500 * Math.pow(1.5, nivelAutoClick));
  const costeMultiplicador = Math.floor(5000 * Math.pow(2.2, nivelMultiplicador));
  const costeProbCritico = Math.floor(1000 * Math.pow(1.8, nivelProbCritico));
  const costeDanoCritico = Math.floor(2500 * Math.pow(1.9, nivelDanoCritico));

  // ==========================================
  // LÓGICA DE JUEGO
  // ==========================================
  const hacerClic = () => {
    let multiplicadorGolpe = 1;
    const esCritico = (Math.random() * 100) < probCritico;
    if (esCritico) multiplicadorGolpe = danoCritico;

    const auraGanada = clickReal * multiplicadorGolpe;
    setSaldo(s => s + auraGanada);
    setAuraTotal(a => a + auraGanada);
  };

  useEffect(() => {
    if (autoClickReal === 0) return;
    const intervalo = setInterval(() => {
      setSaldo(s => s + autoClickReal);
      setAuraTotal(a => a + autoClickReal);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [autoClickReal]);

  const comprarPoderClick = () => { if (saldo >= costePoderClick) { setSaldo(s => s - costePoderClick); setNivelPoderClick(n => n + 1); } };
  const comprarAutoClick = () => { if (saldo >= costeAutoClick) { setSaldo(s => s - costeAutoClick); setNivelAutoClick(n => n + 1); } };
  const comprarMultiplicador = () => { if (saldo >= costeMultiplicador) { setSaldo(s => s - costeMultiplicador); setNivelMultiplicador(n => n + 1); } };
  const comprarProbCritico = () => { if (saldo >= costeProbCritico && nivelProbCritico < 20) { setSaldo(s => s - costeProbCritico); setNivelProbCritico(n => n + 1); } };
  const comprarDanoCritico = () => { if (saldo >= costeDanoCritico) { setSaldo(s => s - costeDanoCritico); setNivelDanoCritico(n => n + 1); } };

  // ==========================================
  // LÓGICA DE RANGOS
  // ==========================================
  const indexMaxRango = Math.min(2 + (rebirths * 2), RANGOS.length - 1);
  let indexRangoEncontrado = RANGOS.findLastIndex(r => auraTotal >= r.auraMin);
  if (indexRangoEncontrado === -1) indexRangoEncontrado = 0;

  const estancado = indexRangoEncontrado >= indexMaxRango;
  const indexRangoActual = estancado ? indexMaxRango : indexRangoEncontrado;

  const rangoActual = RANGOS[indexRangoActual];
  const siguienteRango = RANGOS[indexRangoActual + 1];

  const puedeHacerRebirth = estancado && indexMaxRango < RANGOS.length - 1;
  const puedeHacerPrestigio = estancado && indexMaxRango === RANGOS.length - 1;

  let porcentajeProgreso = 100;
  if (siguienteRango && !estancado) {
    const auraReqNivel = siguienteRango.auraMin - rangoActual.auraMin;
    const auraConsNivel = auraTotal - rangoActual.auraMin;
    porcentajeProgreso = (auraConsNivel / auraReqNivel) * 100;
  }

  useEffect(() => {
    if (indexRangoActual > maxNivelHistorico) {
      setMaxNivelHistorico(indexRangoActual);
    }
  }, [indexRangoActual, maxNivelHistorico]);

  const ejecutarRenacimiento = () => {
    if (puedeHacerRebirth) setRebirths(r => r + 1);
    else if (puedeHacerPrestigio) { setPrestigios(p => p + 1); setRebirths(0); }
    setSaldo(0); setAuraTotal(0); setNivelPoderClick(1); setNivelAutoClick(0); setNivelMultiplicador(0); setNivelProbCritico(0); setNivelDanoCritico(0);
  };

  return (
      <div className="juego-contenedor">
        <div className="zona-juego">

          {(puedeHacerRebirth || puedeHacerPrestigio) && (
              <button className={`btn-rebirth-flotante ${puedeHacerPrestigio ? 'prestigio' : ''}`} onClick={ejecutarRenacimiento}>
                <div className="icono-rebirth">🔄</div>
                <div>
                  <strong>{puedeHacerPrestigio ? 'PRESTIGIO' : 'REBIRTH'}</strong>
                  <span>{puedeHacerPrestigio ? '+100% Aura' : '+10% Aura'}</span>
                </div>
              </button>
          )}

          <div className="estadisticas-top">

            <div className="rango-contenedor">
              <div className="rango-badge interactivo" onClick={() => setMostrarNiveles(!mostrarNiveles)}>
                👑 {rangoActual.nombre} {mostrarNiveles ? '▴' : '▾'}
              </div>

              {mostrarNiveles && (
                  <div className="dropdown-rangos">
                    {RANGOS.map((rango, index) => {
                      const estaDesbloqueado = index <= maxNivelHistorico;
                      const esActual = index === indexRangoActual;

                      return (
                          <div key={index} className={`dropdown-item ${estaDesbloqueado ? 'desbloqueado' : 'bloqueado'} ${esActual ? 'actual' : ''}`}>
                            <span className="rango-nombre">{estaDesbloqueado ? rango.nombre : '???'}</span>
                            <span className="rango-req">{estaDesbloqueado ? rango.auraMin.toLocaleString() : '???'} Aura</span>
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>

            {/* Usamos Math.floor() SOLO para visualizar los números de forma limpia */}
            <div className="monedas-totales"><span>{Math.floor(saldo).toLocaleString()} Aura</span></div>
            <div style={{ color: '#7a7a9a', fontSize: '0.9rem', marginBottom: '10px' }}>Aura Acumulada: {Math.floor(auraTotal).toLocaleString()}</div>

            {/* Mostramos 1 decimal para que quede claro que estamos ganando +1.1, +1.2... */}
            <div className="monedas-segundo">+{clickReal.toFixed(1)} per click | +{autoClickReal.toFixed(1)}/sec</div>

            <div className="contenedor-progreso">
              <div className={`barra-progreso ${estancado ? 'max-level' : ''}`} style={{ width: `${porcentajeProgreso}%` }}></div>
              <span className="texto-progreso">
              {puedeHacerPrestigio ? '¡NIVEL MÁXIMO! HAZ PRESTIGIO' : puedeHacerRebirth ? '¡BLOQUEO ALCANZADO! HAZ REBIRTH' : `Siguiente: ${siguienteRango?.nombre} (${siguienteRango?.auraMin.toLocaleString()})`}
            </span>
            </div>

          </div>

          <div className="zona-clic" onClick={hacerClic}>
            <div className="personaje-placeholder">¡PIKAR!</div>
          </div>
        </div>

        <div className="panel-derecho">
          <div className="menu-tabs">
            <button className={pestañaActiva === 'niveles' ? 'tab activa' : 'tab'} onClick={() => setPestañaActiva('niveles')}>💪 Mejoras</button>
            <button className={pestañaActiva === 'mascotas' ? 'tab activa' : 'tab'} onClick={() => setPestañaActiva('mascotas')}>🐾 Mascotas</button>
            <button className={pestañaActiva === 'skins' ? 'tab activa' : 'tab'} onClick={() => setPestañaActiva('skins')}>👕 Skins</button>
            <button className={pestañaActiva === 'stats' ? 'tab activa' : 'tab'} onClick={() => setPestañaActiva('stats')}>📊 Stats</button>
          </div>

          <div className="menu-contenido">
            {pestañaActiva === 'niveles' && (
                <div className="lista-mejoras">
                  <div className="mejora-card"><div className="icono-mejora">👆</div><div className="info-mejora"><h4>Click Power</h4><p>+{multiplicadorGlobal.toFixed(2)} por click <br/><span>Lv. {nivelPoderClick}</span></p></div><button className="btn-comprar" onClick={comprarPoderClick} disabled={saldo < costePoderClick}>✨ {costePoderClick.toLocaleString()}</button></div>
                  <div className="mejora-card"><div className="icono-mejora">⏱</div><div className="info-mejora"><h4>Auto Click</h4><p>+{(2 * multiplicadorGlobal).toFixed(1)} por sec <br/><span>Lv. {nivelAutoClick}</span></p></div><button className="btn-comprar" onClick={comprarAutoClick} disabled={saldo < costeAutoClick}>✨ {costeAutoClick.toLocaleString()}</button></div>
                  <div className="mejora-card"><div className="icono-mejora">💪</div><div className="info-mejora"><h4>Aura Multiplier</h4><p>x{multiplicadorGlobal.toFixed(2)} all aura <br/><span>Lv. {nivelMultiplicador}</span></p></div><button className="btn-comprar" onClick={comprarMultiplicador} disabled={saldo < costeMultiplicador}>✨ {costeMultiplicador.toLocaleString()}</button></div>
                  <div className="mejora-card"><div className="icono-mejora">🎯</div><div className="info-mejora"><h4>Crit Chance</h4><p>{probCritico.toFixed(2)}% chance <br/><span>{nivelProbCritico >= 20 ? 'MÁXIMO' : `Lv. ${nivelProbCritico}/20`}</span></p></div><button className="btn-comprar" onClick={comprarProbCritico} disabled={saldo < costeProbCritico || nivelProbCritico >= 20}>{nivelProbCritico >= 20 ? 'MAX' : `✨ ${costeProbCritico.toLocaleString()}`}</button></div>
                  <div className="mejora-card"><div className="icono-mejora">💥</div><div className="info-mejora"><h4>Golpe de Chad</h4><p>x{danoCritico.toFixed(1)} daño crítico <br/><span>Lv. {nivelDanoCritico}</span></p></div><button className="btn-comprar" onClick={comprarDanoCritico} disabled={saldo < costeDanoCritico}>✨ {costeDanoCritico.toLocaleString()}</button></div>
                </div>
            )}
            {pestañaActiva === 'mascotas' && <div className="placeholder-tab">Sección de Mascotas en construcción...</div>}
            {pestañaActiva === 'skins' && <div className="placeholder-tab">Sección de Skins en construcción...</div>}
            {pestañaActiva === 'stats' && (
                <div className="lista-mejoras">
                  <h3 style={{color: '#a0d2eb', textAlign: 'center'}}>Estadísticas Generales</h3>
                  <div className="mejora-card"><div className="info-mejora"><h4>Rebirths Realizados</h4><p style={{fontSize: '1.2rem', color: 'white'}}>{rebirths}</p><p>Bono actual: +{(rebirths * 10).toFixed(0)}%</p></div></div>
                  <div className="mejora-card"><div className="info-mejora"><h4>Prestigios (GODLIKE)</h4><p style={{fontSize: '1.2rem', color: '#f1c40f'}}>{prestigios}</p><p>Bono actual: +{(prestigios * 100).toFixed(0)}%</p></div></div>
                  <div className="mejora-card"><div className="info-mejora"><h4>Multiplicador Total de Ascensión</h4><p style={{fontSize: '1.2rem', color: '#4cd137'}}>x{bonoAscension.toFixed(2)}</p></div></div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default App;
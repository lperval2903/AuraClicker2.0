import { useState, useEffect } from 'react';
import './App.css';

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

const RAREZAS_MASCOTAS = [
  { id: 'comun', nombre: 'Común', color: '#95a5a6', prob: 60, multBase: 2 },
  { id: 'poco_comun', nombre: 'Poco Común', color: '#2ecc71', prob: 20, multBase: 5 },
  { id: 'raro', nombre: 'Rara', color: '#3498db', prob: 10, multBase: 12 },
  { id: 'especial', nombre: 'Especial', color: '#e67e22', prob: 5, multBase: 30 },
  { id: 'epico', nombre: 'Épica', color: '#9b59b6', prob: 3.5, multBase: 100 },
  { id: 'legendario', nombre: 'Legendaria', color: '#f1c40f', prob: 1.3, multBase: 500 },
  { id: 'mitico', nombre: 'Mítica', color: '#e74c3c', prob: 0.2, multBase: 2500 }
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

  const [textosFlotantes, setTextosFlotantes] = useState([]);

  const [inventarioMascotas, setInventarioMascotas] = useState([]);
  const [mascotaEquipada, setMascotaEquipada] = useState(null);

  // ESTADOS DE UI PARA HUEVOS
  const [estadoRuleta, setEstadoRuleta] = useState({ activa: false, items: [], ganador: null, girando: false });
  const [premiosMultiples, setPremiosMultiples] = useState(null); // Guardará el array de 5 o 10 mascotas

  const costeHuevo = 100000;

  // ==========================================
  // MATEMÁTICAS EXACTAS
  // ==========================================
  const bonoAscension = Number(1 + (rebirths * 0.10) + (prestigios * 1.0)) || 1;
  const bonoMascota = mascotaEquipada && mascotaEquipada.multiplicador ? Number(mascotaEquipada.multiplicador) : 1;
  const multiplicadorGlobal = Number(Math.pow(1.5, nivelMultiplicador) * bonoAscension * bonoMascota) || 1;

  const poderClickBase = Number(nivelPoderClick) || 1;
  const autoClickBase = Number(nivelAutoClick * 2) || 0;
  const probCritico = Number(nivelProbCritico * 2.25) || 0;
  const danoCritico = Number(2 + (nivelDanoCritico * 0.5)) || 2;

  const clickReal = poderClickBase * multiplicadorGlobal;
  const autoClickReal = autoClickBase * multiplicadorGlobal;

  const costePoderClick = Math.floor(100 * Math.pow(1.5, nivelPoderClick - 1));
  const costeAutoClick = Math.floor(500 * Math.pow(1.5, nivelAutoClick));
  const costeMultiplicador = Math.floor(5000 * Math.pow(2.2, nivelMultiplicador));
  const costeProbCritico = Math.floor(1000 * Math.pow(1.8, nivelProbCritico));
  const costeDanoCritico = Math.floor(2500 * Math.pow(1.9, nivelDanoCritico));

  // ==========================================
  // LÓGICA DE MASCOTAS
  // ==========================================
  const generarMascotaAleatoria = () => {
    const tiradaRareza = Math.random() * 100;
    let probAcumulada = 0;
    let rarezaObtenida = RAREZAS_MASCOTAS[0];

    for (let r of RAREZAS_MASCOTAS) {
      probAcumulada += r.prob;
      if (tiradaRareza <= probAcumulada) { rarezaObtenida = r; break; }
    }
    return crearMascotaEspecifica(rarezaObtenida);
  };

  const crearMascotaEspecifica = (rarezaObj) => {
    const tiradaNivel = Math.random();
    let fase = 1;
    if (tiradaNivel > 0.5) fase = 2;
    if (tiradaNivel > 0.75) fase = 3;
    if (tiradaNivel > 0.90) fase = 4;
    if (tiradaNivel > 0.98) fase = 5;

    const multFinal = rarezaObj.multBase * (1 + ((fase - 1) * 0.20));
    return {
      idUnico: Math.random().toString(36).substring(2, 9),
      rareza: rarezaObj,
      fase: fase,
      multiplicador: multFinal
    };
  };

  const abrirHuevos = (cantidad) => {
    const costeTotal = costeHuevo * cantidad;
    if (saldo < costeTotal) return;
    setSaldo(s => s - costeTotal);

    // Generamos las mascotas requeridas
    const mascotasGanadas = Array.from({ length: cantidad }).map(() => generarMascotaAleatoria());

    if (cantidad === 1) {
      // TIRON ÚNICO: Ruleta estilo CS
      const mascotaGanadora = mascotasGanadas[0];
      const itemsVisuales = Array.from({ length: 55 }).map(() => generarMascotaAleatoria());
      itemsVisuales[45] = mascotaGanadora;

      setEstadoRuleta({ activa: true, items: itemsVisuales, ganador: mascotaGanadora, girando: false });
      setTimeout(() => { setEstadoRuleta(prev => ({ ...prev, girando: true })); }, 100);
      setTimeout(() => { setInventarioMascotas(prev => [...prev, mascotaGanadora]); }, 5500);
    } else {
      // MULTIPLES TIRONES: Drop instantáneo con modal de resumen
      setInventarioMascotas(prev => [...prev, ...mascotasGanadas]);
      setPremiosMultiples(mascotasGanadas);
    }
  };

  const cerrarRuleta = () => setEstadoRuleta({ activa: false, items: [], ganador: null, girando: false });
  const cerrarPremiosMultiples = () => setPremiosMultiples(null);

  const equiparMascota = (mascota) => { setMascotaEquipada(mascota); };

  const fusionarMascotas = (indexRareza) => {
    const rarezaActual = RAREZAS_MASCOTAS[indexRareza];
    const rarezaSiguiente = RAREZAS_MASCOTAS[indexRareza + 1];

    const cantidadNecesaria = rarezaActual.id === 'legendario' ? 5 : 10;
    const mascotasDisponibles = inventarioMascotas.filter(m => m.rareza.id === rarezaActual.id);
    if (mascotasDisponibles.length < cantidadNecesaria) return;

    const sacrificios = mascotasDisponibles.slice(0, cantidadNecesaria);
    const idsSacrificados = sacrificios.map(m => m.idUnico);

    if (mascotaEquipada && idsSacrificados.includes(mascotaEquipada.idUnico)) {
      setMascotaEquipada(null);
    }

    const nuevaMascota = crearMascotaEspecifica(rarezaSiguiente);

    setInventarioMascotas(prev => {
      const inventarioFiltrado = prev.filter(m => !idsSacrificados.includes(m.idUnico));
      return [...inventarioFiltrado, nuevaMascota];
    });
  };

  // ==========================================
  // LÓGICA DE JUEGO BÁSICA
  // ==========================================
  const hacerClic = (e) => {
    let multiplicadorGolpe = 1;
    const esCritico = (Math.random() * 100) < probCritico;
    if (esCritico) multiplicadorGolpe = danoCritico;

    const auraBase = Number(clickReal) || 1;
    const auraExtra = esCritico ? (auraBase * multiplicadorGolpe) - auraBase : 0;
    const auraGanada = auraBase + auraExtra;

    if (!isNaN(auraGanada)) {
      setSaldo(s => Number(s) + auraGanada);
      setAuraTotal(a => Number(a) + auraGanada);
    }

    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    const idUnico = Math.random().toString(36).substring(2, 9);
    const nuevosTextos = [{ id: idUnico + '-base', x: x, y: y, valor: auraBase, tipo: 'normal' }];
    if (esCritico) nuevosTextos.push({ id: idUnico + '-crit', x: x + 40, y: y - 20, valor: auraExtra, tipo: 'critico' });

    setTextosFlotantes(prev => [...prev, ...nuevosTextos]);
    setTimeout(() => { setTextosFlotantes(prev => prev.filter(f => !nuevosTextos.some(n => n.id === f.id))); }, 1000);
  };

  useEffect(() => {
    if (!autoClickReal || autoClickReal <= 0 || isNaN(autoClickReal)) return;
    const intervalo = setInterval(() => {
      setSaldo(s => Number(s) + autoClickReal);
      setAuraTotal(a => Number(a) + autoClickReal);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [autoClickReal]);

  const comprarPoderClick = () => { if (saldo >= costePoderClick) { setSaldo(s => s - costePoderClick); setNivelPoderClick(n => n + 1); } };
  const comprarAutoClick = () => { if (saldo >= costeAutoClick) { setSaldo(s => s - costeAutoClick); setNivelAutoClick(n => n + 1); } };
  const comprarMultiplicador = () => { if (saldo >= costeMultiplicador) { setSaldo(s => s - costeMultiplicador); setNivelMultiplicador(n => n + 1); } };
  const comprarProbCritico = () => { if (saldo >= costeProbCritico && nivelProbCritico < 20) { setSaldo(s => s - costeProbCritico); setNivelProbCritico(n => n + 1); } };
  const comprarDanoCritico = () => { if (saldo >= costeDanoCritico) { setSaldo(s => s - costeDanoCritico); setNivelDanoCritico(n => n + 1); } };

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
    porcentajeProgreso = ((auraTotal - rangoActual.auraMin) / (siguienteRango.auraMin - rangoActual.auraMin)) * 100;
  }

  useEffect(() => { if (indexRangoActual > maxNivelHistorico) setMaxNivelHistorico(indexRangoActual); }, [indexRangoActual, maxNivelHistorico]);

  const ejecutarRenacimiento = () => {
    if (puedeHacerRebirth) setRebirths(r => r + 1);
    else if (puedeHacerPrestigio) { setPrestigios(p => p + 1); setRebirths(0); }
    setSaldo(0); setAuraTotal(0); setNivelPoderClick(1); setNivelAutoClick(0); setNivelMultiplicador(0); setNivelProbCritico(0); setNivelDanoCritico(0);
  };

  const numerosRomanos = ["", "I", "II", "III", "IV", "V"];
  const botonDevAura = () => { const trampa = 100000000000000000; setSaldo(s => Number(s) + trampa); setAuraTotal(a => Number(a) + trampa); };

  return (
      <div className="juego-contenedor">

        {/* MODAL RULETA x1 */}
        {estadoRuleta.activa && (
            <div className="modal-ruleta-overlay">
              <div className="modal-ruleta-contenido">
                <h2>Abriendo Huevo...</h2>
                <div className="ruleta-ventana">
                  <div className="ruleta-linea-centro"></div>
                  <div className="ruleta-cinta" style={{ transform: estadoRuleta.girando ? `translateX(calc(-${45 * 140}px + 50vw - 70px + ${Math.random() * 60 - 30}px))` : 'translateX(50vw)' }}>
                    {estadoRuleta.items.map((masc, idx) => (
                        <div key={idx} className="ruleta-carta" style={{ borderBottomColor: masc.rareza.color }}>
                          <div className="carta-fase">Fase {numerosRomanos[masc.fase]}</div>
                          <div className="carta-nombre" style={{ color: masc.rareza.color }}>{masc.rareza.nombre}</div>
                          <div className="carta-mult">x{masc.multiplicador.toFixed(1)}</div>
                        </div>
                    ))}
                  </div>
                </div>
                {inventarioMascotas.some(m => m.idUnico === estadoRuleta.ganador?.idUnico) && (
                    <div className="ruleta-premio-revelado">
                      <h3 style={{ color: estadoRuleta.ganador.rareza.color }}>¡{estadoRuleta.ganador.rareza.nombre}!</h3>
                      <button className="btn-comprar" onClick={cerrarRuleta}>Aceptar</button>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* MODAL MULTIPLES PREMIOS (x5 y x10) */}
        {premiosMultiples && (
            <div className="modal-ruleta-overlay">
              <div className="modal-ruleta-contenido">
                <h2 style={{ color: '#f1c40f' }}>¡Nuevas Mascotas Obtenidas!</h2>
                <div className="grid-premios-multiples">
                  {premiosMultiples.map((masc, idx) => (
                      <div key={idx} className="mascota-item" style={{ borderBottom: `4px solid ${masc.rareza.color}`, minWidth: '110px' }}>
                        <div className="mascota-fase">Fase {numerosRomanos[masc.fase]}</div>
                        <div className="mascota-nombre" style={{ color: masc.rareza.color }}>{masc.rareza.nombre}</div>
                        <div className="mascota-mult">x{masc.multiplicador.toFixed(1)}</div>
                      </div>
                  ))}
                </div>
                <button className="btn-comprar" style={{ marginTop: '30px' }} onClick={cerrarPremiosMultiples}>Continuar</button>
              </div>
            </div>
        )}

        <button onClick={botonDevAura} style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: '#c0392b', color: 'white', border: '2px solid #e74c3c', borderRadius: '8px', padding: '10px 15px', fontWeight: 'bold', cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>🛠️ DEV: +1aa Aura</button>

        <div className="zona-juego">
          {(puedeHacerRebirth || puedeHacerPrestigio) && (
              <button className={`btn-rebirth-flotante ${puedeHacerPrestigio ? 'prestigio' : ''}`} onClick={ejecutarRenacimiento}>
                <div className="icono-rebirth">🔄</div>
                <div><strong>{puedeHacerPrestigio ? 'PRESTIGIO' : 'REBIRTH'}</strong><span>{puedeHacerPrestigio ? '+100% Aura' : '+10% Aura'}</span></div>
              </button>
          )}

          <div className="estadisticas-top">
            <div className="rango-contenedor">
              <div className="rango-badge interactivo" onClick={() => setMostrarNiveles(!mostrarNiveles)}>👑 {rangoActual.nombre} {mostrarNiveles ? '▴' : '▾'}</div>
              {mostrarNiveles && (
                  <div className="dropdown-rangos">
                    {RANGOS.map((rango, index) => {
                      const estaDesbloqueado = index <= maxNivelHistorico;
                      return (
                          <div key={index} className={`dropdown-item ${estaDesbloqueado ? 'desbloqueado' : 'bloqueado'} ${index === indexRangoActual ? 'actual' : ''}`}>
                            <span className="rango-nombre">{estaDesbloqueado ? rango.nombre : '???'}</span>
                            <span className="rango-req">{estaDesbloqueado ? rango.auraMin.toLocaleString() : '???'} Aura</span>
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>

            <div className="monedas-totales"><span>{Math.floor(saldo).toLocaleString()} Aura</span></div>
            <div style={{ color: '#7a7a9a', fontSize: '0.9rem', marginBottom: '10px' }}>Aura Acumulada: {Math.floor(auraTotal).toLocaleString()}</div>
            <div className="monedas-segundo">+{clickReal.toFixed(1)} per click | +{autoClickReal.toFixed(1)}/sec</div>

            {mascotaEquipada && (
                <div className="indicador-mascota" style={{ borderColor: mascotaEquipada.rareza.color }}>
                  🐾 Equipada: {mascotaEquipada.rareza.nombre} Fase {numerosRomanos[mascotaEquipada.fase]} (x{mascotaEquipada.multiplicador.toFixed(1)} Aura)
                </div>
            )}

            <div className="contenedor-progreso">
              <div className={`barra-progreso ${estancado ? 'max-level' : ''}`} style={{ width: `${porcentajeProgreso}%` }}></div>
              <span className="texto-progreso">{puedeHacerPrestigio ? '¡NIVEL MÁXIMO! HAZ PRESTIGIO' : puedeHacerRebirth ? '¡BLOQUEO ALCANZADO! HAZ REBIRTH' : `Siguiente: ${siguienteRango?.nombre} (${siguienteRango?.auraMin.toLocaleString()})`}</span>
            </div>
          </div>

          <div className="zona-clic" onClick={hacerClic}><div className="personaje-placeholder">¡PIKAR!</div></div>
          {textosFlotantes.map(flotante => (<div key={flotante.id} className={`numero-flotante ${flotante.tipo}`} style={{ left: flotante.x, top: flotante.y }}>+{flotante.valor.toFixed(1)}</div>))}
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

            {pestañaActiva === 'mascotas' && (
                <div className="lista-mejoras">

                  {/* BOTONES MÚLTIPLES DE HUEVOS */}
                  <div className="botones-huevo">
                    <button className="btn-huevo" onClick={() => abrirHuevos(1)} disabled={saldo < costeHuevo}>
                      🥚 x1<br/><span>✨ {costeHuevo.toLocaleString()}</span>
                    </button>
                    <button className="btn-huevo" onClick={() => abrirHuevos(5)} disabled={saldo < costeHuevo * 5}>
                      🥚 x5<br/><span>✨ {(costeHuevo * 5).toLocaleString()}</span>
                    </button>
                    <button className="btn-huevo" onClick={() => abrirHuevos(10)} disabled={saldo < costeHuevo * 10}>
                      🥚 x10<br/><span>✨ {(costeHuevo * 10).toLocaleString()}</span>
                    </button>
                  </div>

                  <div className="contratos-contenedor">
                    <h4 style={{color: '#a0d2eb', margin: '0 0 10px 0'}}>Fusión de Mascotas (Trade-Up)</h4>
                    <div className="grid-contratos">
                      {RAREZAS_MASCOTAS.map((rareza, index) => {
                        if (index === RAREZAS_MASCOTAS.length - 1) return null;

                        const cantidadQueTengo = inventarioMascotas.filter(m => m.rareza.id === rareza.id).length;
                        const cantidadNecesaria = rareza.id === 'legendario' ? 5 : 10;
                        const rarezaSiguiente = RAREZAS_MASCOTAS[index + 1];
                        const puedeFusionar = cantidadQueTengo >= cantidadNecesaria;

                        if (cantidadQueTengo === 0 && !puedeFusionar) return null;

                        return (
                            <div key={rareza.id} className="contrato-item" style={{ borderLeftColor: rareza.color }}>
                              <div className="contrato-info">
                                <span style={{color: rareza.color}}>{rareza.nombre}</span>
                                <span style={{color: '#7a7a9a'}}> {cantidadQueTengo} / {cantidadNecesaria}</span>
                              </div>
                              <button
                                  className="btn-fusionar"
                                  disabled={!puedeFusionar}
                                  onClick={() => fusionarMascotas(index)}
                                  style={{ backgroundColor: puedeFusionar ? rarezaSiguiente.color : '#3f3f74', color: puedeFusionar ? 'black' : '#7a7a9a' }}
                              >
                                Crear {rarezaSiguiente.nombre}
                              </button>
                            </div>
                        )
                      })}
                    </div>
                  </div>

                  <h4 style={{color: '#a0d2eb', marginTop: '20px', marginBottom: '10px'}}>Tus Mascotas ({inventarioMascotas.length})</h4>
                  <div className="grid-mascotas">
                    {inventarioMascotas.length === 0 ? (
                        <p style={{color: '#555577', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center'}}>Aún no tienes mascotas. ¡Abre un huevo!</p>
                    ) : (
                        [...inventarioMascotas].reverse().map((mascota) => (
                            <div
                                key={mascota.idUnico}
                                className={`mascota-item ${mascotaEquipada?.idUnico === mascota.idUnico ? 'equipada' : ''}`}
                                style={{ borderBottom: `4px solid ${mascota.rareza.color}` }}
                                onClick={() => equiparMascota(mascota)}
                            >
                              <div className="mascota-fase">Fase {numerosRomanos[mascota.fase]}</div>
                              <div className="mascota-nombre" style={{ color: mascota.rareza.color }}>{mascota.rareza.nombre}</div>
                              <div className="mascota-mult">x{mascota.multiplicador.toFixed(1)} Aura</div>
                            </div>
                        ))
                    )}
                  </div>
                </div>
            )}

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
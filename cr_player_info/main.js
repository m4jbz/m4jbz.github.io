// Estas constantes son objetos HTML del index.html con esa clase
// form es el formulario donde se pide el tag del player
// nameDiv es un div donde se pondra el nombre del player
// deckCotainer es para las imagenes y nombre de las cartas de mazo
// battlelogContainer parecido a deckContainer pero para el registro de battallas
const form = document.getElementById("playerForm");
const nameDiv = document.getElementById("name");
const deckContainer = document.getElementById("deck");
const battlelogContainer = document.getElementById("battlelog");

// Esto se "activa" cuando el boton del form es presionado
form.addEventListener("submit", async (e) => {
  // e.preventDefault() es crucial - sin esto, el formulario haría un "page refresh"
  // que interrumpiría nuestra aplicación JavaScript. Esto convierte un formulario
  // HTML tradicional en una Single Page Application (SPA)
  e.preventDefault();
  // Obtiene el tag, trim es para quitar espacios en el inicio y fin de la string
  const playerTag = document.getElementById("tagInput").value.trim();

  if (!playerTag) {
    alert("Por favor ingresa un tag de jugador");
    return;
  }

  // Validar formato básico del tag (debe empezar con #)
  if (!playerTag.startsWith('#')) {
    alert("El tag debe empezar con # (ejemplo: #ABC123)");
    return;
  }

  // Validar longitud mínima del tag
  if (playerTag.length < 10) {
    alert("El tag es demasiado corto. Verifica que esté completo");
    return;
  }

  if (playerTag.length > 10) {
    alert("El tag es demasiado largo. Verifica que el formato del tag");
    return;
  }

  // Convierte #ABC123 -> %23ABC123
  const encodedTag = encodeURIComponent(playerTag);

  // Limpia el HTML que haya tenido de player pasados. Inicializa el HTML
  // para los datos del player
  deckContainer.innerHTML = "";
  battlelogContainer.innerHTML = "";
  nameDiv.innerHTML = "";

  try {
    // NOTA: Las líneas comentadas son para producción (servidor deployed)
    // La línea activa es para desarrollo local (localhost:3000)
    const deckRes = await fetch(`https://cr-player-info.onrender.com/player/${encodedTag}`);
/*     const deckRes = await fetch(`http://localhost:3000/player/${encodedTag}`); */
    // Verificación de respuesta exitosa - fetch() no rechaza automáticamente en errores HTTP
    // Debemos verificar manualmente si response.ok es false (status 400+)
    if (!deckRes.ok) {
      let errorInfo;
      try {
        errorInfo = await deckRes.json();
      } catch {
        // Si no es JSON válido, usar el texto directo
        errorInfo = { message: await deckRes.text() };
      }
 
      if (deckRes.status === 404) {
        // Tag no encontrado - mensaje específico y claro
        nameDiv.innerHTML = `
          <div class="error-message">
            <h3>❌ Jugador no encontrado</h3>
            <p>El tag "${playerTag}" no existe o es incorrecto.</p>
            <p>Verifica que:</p>
            <ul>
              <li>El tag empiece con #</li>
              <li>Todas las letras y números sean correctos</li>
              <li>No hayas copiado espacios adicionales</li>
            </ul>
          </div>
        `;
        return; // Salir de la función, no continuar con battlelog
      }
    }
    // Obtiene los datos del server del player
    const playerData = await deckRes.json();

    nameDiv.innerHTML = `<strong>${playerData.name}</strong><br>`; // Nombre del player

    // Esta variable es para las evoluciones del juego, el juego solo permite
    // 2 evoluciones por mazo, entonces si el jugador tiene mas cartas con evoluciones
    // en el mazo, el juego solo ocupa las primeras dos, y asi solo muestra la
    // imagen de la evolucion de las primeras dos y no las demas
    let evoSlot = 0;

    // Loop para pasar por cada carta del mazo
    playerData.currentDeck.forEach(card => {
      // Aumentar el contador de espacios de evoluciones
      evoSlot++;
      // Obtiene la URL de la imagen de la carta. Si evoSlot es menor o igual 2 (como mencione anteriormente)
      // y el jugador tiene esa carta evolutiva, usar la imagen de la evolucion, si no usar la imagen normal
      const imgUrl = (card.evolutionLevel && evoSlot <= 2) ? card.iconUrls.evolutionMedium : card.iconUrls.medium;
      // Crea un div para cada carta con su imagen
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.innerHTML = `<img src="${imgUrl}" alt="${card.name}"><p>${card.name}</p>`;
      // Y lo adjunta como hijo de deckContainer
      deckContainer.appendChild(cardDiv);
    });

    const logRes = await fetch(`https://cr-player-info.onrender.com/player/${encodedTag}/battlelog`);
/*     const logRes = await fetch(`http://localhost:3000/player/${encodedTag}/battlelog`); */
    if (!logRes.ok) throw new Error(await logRes.text());
    const battlelog = await logRes.json();

    // Loop para cada batalla del jugador
    battlelog.forEach(battle => {
      const div = document.createElement("div");

      div.className = "battle";
      div.innerHTML = `
        <p>${battle.result}</p>
      `;
      battlelogContainer.appendChild(div);
    });

  } catch (err) {
    console.error("ERROR: " + err);
    alert("An error occurred.");
  }
});

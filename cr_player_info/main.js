const battlelogContainer = document.getElementById("battlelog");
const deckContainer = document.getElementById("deck");
const form = document.getElementById("playerForm");
const nameDiv = document.getElementById("name");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const playerTag = document.getElementById("tagInput").value.trim();
  const encodedTag = encodeURIComponent(playerTag);

  deckContainer.innerHTML = "";
  battlelogContainer.innerHTML = "";
  nameDiv.innerHTML = "";

  try {
    // const deckRes = await fetch(`https://cr-player-info.onrender.com/player/${encodedTag}`);
    const deckRes = await fetch(`http://localhost:3000/player/${encodedTag}`);
    if (!deckRes.ok) throw new Error(await deckRes.text());
    const deckData = await deckRes.json();

    nameDiv.innerHTML = `<strong>${deckData.name}</strong><br>`;

    let i = 0;

    deckData.currentDeck.forEach(card => {
      i++;
      const imgUrl = (card.evolutionLevel && i <= 2) ? card.iconUrls.evolutionMedium : card.iconUrls.medium;
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.innerHTML = `<img src="${imgUrl}" alt="${card.name}"><p>${card.name}</p>`;
      deckContainer.appendChild(cardDiv);
    });

    // const logRes = await fetch(`https://cr-player-info.onrender.com/player/${encodedTag}/battlelog`);
    const logRes = await fetch(`http://localhost:3000/player/${encodedTag}/battlelog`);
    if (!logRes.ok) throw new Error(await logRes.text());
    const battlelog = await logRes.json();

    battlelog.forEach(battle => {
      const div = document.createElement("div");

      let resultEmoji;
      if (battle.result === "Win") resultEmoji = "🟩";
      else if (battle.result === "Lose") resultEmoji = "🟥";
      else resultEmoji = "⬜"; // empate

      div.className = "battle";
      div.innerHTML = `
        <p>${resultEmoji}</p>
      `;
      battlelogContainer.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al obtener la información.");
  }
});

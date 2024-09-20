if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");

  localStorage.theme = "dark";
} else {
  document.documentElement.classList.remove("dark");

  localStorage.theme = "dark";
}

document
  .getElementById("dark-mode-toggle")
  .addEventListener("click", function () {
    if (localStorage.theme == "light") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  });

document.getElementById("song-saved").addEventListener("click", function () {
  document.getElementById("song-saved").classList.toggle("saved");
});

const url = "https://anchor.fm/s/49f0c604/podcast/rss";

async function fetchPodcastData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  return response.text();
}

function parsePodcastData(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const items = xmlDoc.getElementsByTagName("item");

  return Array.from(items).map((item) => {
    const name =
      item.getElementsByTagName("title")[0]?.textContent ||
      "Título indisponível";
    const artist = "Radio 24hB <br> 24 horas de Estudos Bíblicos";
    const album =
      "Igreja Evangelica Congregacional Vale da Benção em Candeias, Jaboatão, Pernambuco, Brasil";
    const url =
      item.getElementsByTagName("enclosure")[0]?.getAttribute("url") ||
      "URL indisponível";
    const cover_art_url =
      item.getElementsByTagName("itunes:image")[0]?.getAttribute("href") ||
      "Imagem indisponível";

    return { name, artist, album, url, cover_art_url };
  });
}

async function getPodcastData() {
  try {
    const xmlText = await fetchPodcastData(url);
    const podcastData = parsePodcastData(xmlText);
    return podcastData;
  } catch (error) {
    console.error("Erro ao buscar dados do podcast:", error);
  }
}

async function initializeAmplitude() {
  try {
    const podcastData = await getPodcastData();

    // Inicializa o Amplitude com os dados de podcast
    Amplitude.init({
      bindings: {
        37: "prev",
        39: "next",
        32: "play_pause",
      },
      callbacks: {
        timeupdate: function () {
          let percentage = Amplitude.getSongPlayedPercentage();

          if (isNaN(percentage)) {
            percentage = 0;
          }

          let slider = document.getElementById("song-percentage-played");
          slider.style.backgroundSize = percentage + "% 100%";
        },
      },
      songs: podcastData, // Use os dados obtidos do podcast aqui
      start_song: 0,
      autoplay: true,
    });
  } catch (error) {
    console.error("Erro ao inicializar Amplitude:", error);
  }
}

// Chama a função para inicializar o Amplitude
console.time("Tempo de Execução");
initializeAmplitude();
console.timeEnd("Tempo de Execução");

Amplitude.setShuffle(true);
window.onkeydown = function (e) {
  return !(e.keyCode == 32);
};

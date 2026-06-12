const toast = document.querySelector(".toast");
let toastTimer;

function showPlaceholder(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

document.querySelectorAll("[data-placeholder]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showPlaceholder(button.getAttribute("data-placeholder"));
  });
});

document.querySelectorAll("[data-menu-toggle]").forEach((button) => {
  const header = button.closest(".site-header");
  if (!header) return;

  button.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  header.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-menu-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
});

document.querySelectorAll("[data-evidence-carousel]").forEach((carousel) => {
  const section = carousel.closest(".evidence-timeline-section");
  const previous = section?.querySelector("[data-carousel-prev]");
  const next = section?.querySelector("[data-carousel-next]");
  const cards = carousel.querySelectorAll("[data-evidence-card]");

  function updateCarouselControls() {
    if (cards.length <= 1) {
      if (previous) previous.disabled = true;
      if (next) next.disabled = true;
      return;
    }

    const maximum = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    if (previous) previous.disabled = carousel.scrollLeft <= 2;
    if (next) next.disabled = carousel.scrollLeft >= maximum - 2;
  }

  function moveCarousel(direction) {
    carousel.scrollBy({
      left: direction * Math.max(280, carousel.clientWidth * 0.86),
      behavior: "smooth",
    });
  }

  previous?.addEventListener("click", () => moveCarousel(-1));
  next?.addEventListener("click", () => moveCarousel(1));
  carousel.addEventListener("scroll", updateCarouselControls, { passive: true });
  window.addEventListener("resize", updateCarouselControls);
  updateCarouselControls();
});

const currentProfile = document.querySelector("[data-current-profile]");
const profileNote = document.querySelector("[data-profile-note]");
const workflowSummary = document.querySelector("[data-workflow-summary]");
const communicationSummary = document.querySelector("[data-communication-summary]");
const tokenScore = document.querySelector("[data-token-estimate]");
const tokenLabel = document.querySelector("[data-token-label]");
const tokenMeter = document.querySelector("[data-token-meter]");
const rowSummaryCards = document.querySelectorAll("[data-row-summary]");

const profilePresets = {
  fast: {
    label: "Trabalho rapido",
    note: "Comunicacao util mais curta, atualizacoes leves, explicacao breve.",
    values: {
      "Lideranca do trabalho": "Usuario lidera",
      "Tratamento de perguntas": "Continuar se estiver claro",
      "Detalhe da comunicacao": "Resposta direta",
      "Nivel de linguagem": "Linguagem simples",
      "Atualizacoes de progresso": "Apenas resultado final",
      "Nivel de explicacao": "Apenas faca o trabalho",
      "Status de evidencias": "Apenas status critico",
    },
  },
  standard: {
    label: "Trabalho padrao",
    note: "Padrao claro com limites de aprovacao visiveis.",
    values: {
      "Lideranca do trabalho": "Codex lidera com aprovacao",
      "Tratamento de perguntas": "Agrupar perguntas",
      "Detalhe da comunicacao": "Contexto curto",
      "Nivel de linguagem": "Levemente tecnica",
      "Atualizacoes de progresso": "Atualizacoes por marcos",
      "Nivel de explicacao": "Notas breves",
      "Status de evidencias": "Rotulos basicos de status",
    },
  },
  guided: {
    label: "Trabalho guiado",
    note: "Mais explicacao, progresso visivel, orientacao de proximo passo.",
    values: {
      "Lideranca do trabalho": "Codex lidera com aprovacao",
      "Tratamento de perguntas": "Uma pergunta por vez",
      "Detalhe da comunicacao": "Contexto mais completo",
      "Nivel de linguagem": "Tecnica quando util",
      "Atualizacoes de progresso": "Atualizacoes regulares",
      "Nivel de explicacao": "Passo a passo",
      "Status de evidencias": "Rotulos detalhados de fonte",
    },
  },
  deep: {
    label: "Suporte profundo",
    note: "Maior nivel de explicacao, visibilidade e status de evidencias.",
    values: {
      "Lideranca do trabalho": "Fila de tarefas aprovadas",
      "Tratamento de perguntas": "Perguntar antes de etapas importantes",
      "Detalhe da comunicacao": "Explicacao completa",
      "Nivel de linguagem": "Totalmente tecnica",
      "Atualizacoes de progresso": "Registro detalhado do trabalho",
      "Nivel de explicacao": "Contexto avancado",
      "Status de evidencias": "Status completo de evidencias",
    },
  },
};

let activeProfileKey = "standard";

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedButtonFor(groupName) {
  const group = document.querySelector(`[data-choice-group="${groupName}"]`);
  return group ? group.querySelector(".choice-button.is-selected") : null;
}

function setGroupChoice(groupName, choiceValue) {
  const group = document.querySelector(`[data-choice-group="${groupName}"]`);
  if (!group) return;
  group.querySelectorAll(".choice-button").forEach((button) => {
    button.classList.toggle("is-selected", button.getAttribute("data-choice") === choiceValue);
  });
}

function applyProfile(profileKey) {
  const preset = profilePresets[profileKey];
  if (!preset) return;
  activeProfileKey = profileKey;

  document.querySelectorAll("[data-profile]").forEach((button) => {
    button.classList.toggle("is-selected", button.getAttribute("data-profile") === profileKey);
  });

  Object.entries(preset.values).forEach(([groupName, choiceValue]) => {
    setGroupChoice(groupName, choiceValue);
  });

  updateProfileSummary();
}

function setPersonalizadoProfile() {
  activeProfileKey = "custom";
  document.querySelectorAll("[data-profile]").forEach((button) => button.classList.remove("is-selected"));
  updateProfileSummary();
}

function summaryKey(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function summarize(sectionName) {
  return Array.from(document.querySelectorAll(`[data-summary-section="${sectionName}"]`)).map((group) => {
    const selected = group.querySelector(".choice-button.is-selected");
    const label = group.getAttribute("data-choice-group");
    return {
      key: summaryKey(label),
      label,
      value: selected ? selected.getAttribute("data-choice") : "Nao selecionado",
      score: selected ? Number.parseFloat(selected.getAttribute("data-token-score")) || null : null,
    };
  });
}

function renderSummary(target, rows) {
  if (!target) return;
  target.innerHTML = rows
    .map((row) => `<div><dt>${escapeHTML(row.label)}</dt><dd>${escapeHTML(row.value)}</dd></div>`)
    .join("");
}

function tokenLabelFor(average) {
  if (average <= 1.75) return "Enxuto";
  if (average <= 2.5) return "Eficiente-equilibrado";
  if (average <= 3.25) return "Guiado";
  return "Alto suporte";
}

function tokenLevelFor(score) {
  if (score <= 1.75) return "Enxuto";
  if (score <= 2.5) return "Moderado";
  if (score <= 3.25) return "Forte";
  return "Intensivo";
}

function formatScore(score) {
  return Number.isFinite(score) ? score.toFixed(1) : "0.0";
}

function updateTokenEstimate(rows) {
  const scoredRows = rows.filter((row) => row.score);
  if (!scoredRows.length) return;

  const average = scoredRows.reduce((total, row) => total + row.score, 0) / scoredRows.length;
  const rounded = Math.round(average * 10) / 10;
  const percent = (average / 4) * 100;

  if (tokenScore) tokenScore.textContent = formatScore(rounded);
  if (tokenLabel) tokenLabel.textContent = tokenLabelFor(average);
  if (tokenMeter) tokenMeter.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function updateRowSummaries(rows) {
  rowSummaryCards.forEach((card) => {
    const row = rows.find((item) => item.key === card.getAttribute("data-row-summary"));
    if (!row) return;

    const score = row.score || 0;
    const percent = (score / 4) * 100;
    const value = card.querySelector("[data-row-value]");
    const scoreDisplay = card.querySelector("[data-row-score]");
    const label = card.querySelector("[data-row-label]");
    const meter = card.querySelector("[data-row-meter]");

    if (value) value.textContent = row.value;
    if (scoreDisplay) scoreDisplay.textContent = formatScore(score);
    if (label) label.textContent = tokenLevelFor(score);
    if (meter) meter.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  });
}

function updateProfileSummary() {
  if (currentProfile) {
    currentProfile.textContent =
      activeProfileKey === "custom" ? "Personalizado" : profilePresets[activeProfileKey]?.label || "Personalizado";
  }

  if (profileNote) {
    profileNote.textContent =
      activeProfileKey === "custom"
        ? "Perfil personalizado. As configuracoes abaixo foram ajustadas manualmente."
        : profilePresets[activeProfileKey]?.note || "";
  }

  const workflowRows = summarize("workflow");
  const communicationRows = summarize("communication");
  const scoredRows = [...workflowRows, ...communicationRows];
  renderSummary(workflowSummary, workflowRows);
  renderSummary(communicationSummary, communicationRows);
  updateRowSummaries(scoredRows);
  updateTokenEstimate(scoredRows);
}

document.querySelectorAll("[data-profile]").forEach((button) => {
  button.addEventListener("click", () => {
    applyProfile(button.getAttribute("data-profile"));
  });
});

document.querySelectorAll("[data-choice-group]").forEach((group) => {
  if (group.getAttribute("data-summary-section") === "profile") return;

  group.querySelectorAll(".choice-button").forEach((button) => {
    button.addEventListener("click", () => {
      group.querySelectorAll(".choice-button").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      setPersonalizadoProfile();
    });
  });
});

updateProfileSummary();

(() => {
  const searchPages = [
    { title: "Inicio", url: "index.html" },
    { title: "Evidencias", url: "audit-summary.html" },
    { title: "Personalizar", url: "customize.html" },
    { title: "Boas praticas", url: "best-practices.html" },
    { title: "Solucao de problemas", url: "troubleshooting.html" },
  ];

  const searchPresets = [
    {
      label: "Facil para usuario",
      options: [
        {
          key: "start",
          label: "Como eu comeco?",
          query: "start setup buyer workspace guide customize",
          answerTitle: "Como comecar com NoDrift",
          answer:
            "Depois da compra, o guia de configuracao do comprador conduz voce pela instalacao e pelo primeiro uso. O site publico nao publica a sequencia exata de configuracao nem a linguagem operacional interna.",
          links: [
            { page: "Inicio", title: "Visao geral", url: "index.html#top" },
            { page: "Personalizar", title: "Personalizar", url: "customize.html#workflow-settings-heading" },
          ],
        },
        {
          key: "files",
          label: "Quais arquivos eu recebo?",
          query: "files package buyer private internal workspace",
          answerTitle: "O que o workspace inclui",
          answer:
            "O pacote do comprador inclui materiais protegidos de workspace para aprovacoes, evidencias, continuidade, correcao, configuracao e exemplos. A lista exata de arquivos e informacao interna privada.",
          links: [
            { page: "Inicio", title: "Arquivos do workspace", url: "index.html#included" },
            { page: "Evidencias", title: "Workspace pago", url: "audit-summary.html" },
          ],
        },
        {
          key: "customize",
          label: "Como personalizar?",
          query: "customize communication profile token updates style",
          answerTitle: "Como a personalizacao funciona",
          answer:
            "NoDrift permite que o usuario escolha estilo de comunicacao, nivel de detalhe, visibilidade de progresso e rotulos de evidencia sem enfraquecer as salvaguardas exclusivas do comprador.",
          links: [
            { page: "Personalizar", title: "Configuracoes de fluxo", url: "customize.html#workflow-settings-heading" },
            { page: "Personalizar", title: "Configuracoes de comunicacao", url: "customize.html#communication-settings-heading" },
          ],
        },
        {
          key: "privacy",
          label: "O que permanece privado?",
          query: "private internal protected buyer only public website",
          answerTitle: "O que permanece privado",
          answer:
            "Registros privados de workspace, texto exato de configuracao, checklists diagnosticos, registros de correcao e modelos internos sao exclusivos do comprador. O site explica o produto sem publicar o manual operacional.",
          links: [
            { page: "Evidencias", title: "O que o workspace pago inclui", url: "audit-summary.html" },
            { page: "Solucao de problemas", title: "Solucao de problemas", url: "troubleshooting.html#start" },
          ],
        },
        {
          key: "payments",
          label: "Como os pagamentos funcionam?",
          query: "payment price coming soon buy NoDrift Codex",
          answerTitle: "Status atual de pagamento",
          answer:
            "O pagamento ainda nao esta ativo. NoDrift para Codex v1 tera dois planos no Brasil: Basico por R$195 e Estendido por R$295.",
          links: [
            { page: "Inicio", title: "FAQ", url: "index.html#faq" },
            { page: "Inicio", title: "Visao geral", url: "index.html#top" },
          ],
        },
      ],
    },
    {
      label: "Solucao de problemas",
      options: [
        {
          key: "troubleshooting",
          label: "Algo deu errado",
          query: "troubleshooting wrong setup publishing private public",
          answerTitle: "Use solucao de problemas guiada para compradores",
          answer:
            "A solucao de problemas acontece dentro do workspace do usuario. O guia do comprador fornece a formulacao diagnostica e os checklists exatos; a pagina publica apenas explica o modelo de suporte.",
          links: [
            { page: "Solucao de problemas", title: "Comece aqui", url: "troubleshooting.html#start" },
            { page: "Boas praticas", title: "Boas praticas", url: "best-practices.html#beginner-heading" },
          ],
        },
        {
          key: "private-public",
          label: "Limite privado/publico",
          query: "private public publish upload github files",
          answerTitle: "Pare antes de publicar material privado",
          answer:
            "Antes de publicar, fazer upload, fazer push, compartilhar ou enviar qualquer coisa, separe arquivos publicos do site de registros privados do workspace. Checklists exatos sao exclusivos do comprador.",
          links: [
            { page: "Solucao de problemas", title: "Privacidade", url: "troubleshooting.html#triage-heading" },
            { page: "Evidencias", title: "Limite de afirmacoes", url: "audit-summary.html" },
          ],
        },
        {
          key: "website-state",
          label: "O estado do site esta incerto",
          query: "github pages local preview live website",
          answerTitle: "Separe previa, repositorio e site ativo",
          answer:
            "Previa local, estado do repositorio e GitHub Pages ativo sao estados separados. A orientacao de solucao de problemas do comprador explica como verifica-los com seguranca.",
          links: [
            { page: "Solucao de problemas", title: "Publicacao", url: "troubleshooting.html#triage-heading" },
          ],
        },
      ],
    },
    {
      label: "Tecnico",
      options: [
        {
          key: "reception-layer",
          label: "Camada de recepcao",
          query: "reception layer llm output verify accept record act",
          answerTitle: "O que o NoDrift adiciona",
          answer:
            "NoDrift nao muda o modelo. Ele governa a recepcao: o que a sessao de trabalho aceita, verifica, registra, corrige, rejeita ou usa como base para agir depois que a saida chega.",
          links: [
            { page: "Evidencias", title: "Camada de recepcao", url: "audit-summary.html" },
            { page: "Inicio", title: "Nao controla a IA", url: "index.html#included" },
          ],
        },
        {
          key: "cross-platform",
          label: "Uso entre plataformas",
          query: "Codex Claude Code Claude ChatGPT Gemini DeepSeek",
          answerTitle: "Como o NoDrift se adapta",
          answer:
            "NoDrift pode se adaptar a diferentes workspaces de LLM quando eles oferecem suporte a instrucoes persistentes, arquivos de projeto, referencias ou registros repetiveis de fluxo de trabalho. Os detalhes exatos de adaptacao sao informacoes internas privadas.",
          links: [
            { page: "Evidencias", title: "Entre ferramentas de LLM", url: "audit-summary.html" },
            { page: "Inicio", title: "Pipeline", url: "index.html#faq" },
          ],
        },
        {
          key: "evidence-boundary",
          label: "Limite de evidencias",
          query: "evidence verified complete ready coverage public safe",
          answerTitle: "Limites de evidencias importam",
          answer:
            "NoDrift separa o que foi realmente verificado do que apenas parece plausivel. Afirmacoes amplas de prontidao precisam de evidencia que mostre o escopo real revisado.",
          links: [
            { page: "Evidencias", title: "Resumo completo da auditoria", url: "audit-summary.html" },
            { page: "Boas praticas", title: "Afirmacoes amplas", url: "best-practices.html#beginner-heading" },
          ],
        },
      ],
    },
  ];

  const maximumInitialResults = 8;
  const maximumExpandedResults = 20;
  let searchIndexPromise;
  let searchIndex = [];
  let currentLimit = maximumInitialResults;
  let activePresetKey = "";
  let highlightedTarget;

  function normalizeBuscaText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function slugifyBuscaText(value) {
    return normalizeBuscaText(value).replace(/\s+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "section";
  }

  function cleanBuscaText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getBuscaPreset(key) {
    return searchPresets.flatMap((group) => group.options).find((preset) => preset.key === key);
  }

  function makeBuscaExcerpt(text, title) {
    const source = cleanBuscaText(text.replace(title, " "));
    if (source.length <= 280) return source;
    const shortened = source.slice(0, 280);
    const sentenceEnd = Math.max(shortened.lastIndexOf(". "), shortened.lastIndexOf("? "), shortened.lastIndexOf("! "));
    if (sentenceEnd > 120) return `${shortened.slice(0, sentenceEnd + 1).trim()}...`;
    const wordEnd = shortened.lastIndexOf(" ");
    return `${shortened.slice(0, wordEnd > 120 ? wordEnd : 280).trim()}...`;
  }

  function stripBuscaMarkup(node) {
    return cleanBuscaText(node?.textContent || "");
  }

  function generatedHeadingId(heading, index) {
    return `search-${String(index + 1).padStart(2, "0")}-${slugifyBuscaText(stripBuscaMarkup(heading))}`;
  }

  function addGeneratedBuscaAnchors(root = document) {
    root.querySelectorAll("main h1, main h2, main h3, main h4").forEach((heading, index) => {
      if (!heading.id) heading.id = generatedHeadingId(heading, index);
    });
  }

  function highlightCurrentTarget() {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    if (highlightedTarget) highlightedTarget.classList.remove("search-target-highlight");
    highlightedTarget = target;
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
      target.classList.add("search-target-highlight");
      window.setTimeout(() => target.classList.remove("search-target-highlight"), 2600);
    });
  }

  function extractPageBuscaEntries(html, page) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    addGeneratedBuscaAnchors(doc);
    const main = doc.querySelector("main") || doc.body;
    const headings = [...main.querySelectorAll("h1, h2, h3, h4")];

    return headings
      .map((heading, index) => {
        const title = stripBuscaMarkup(heading);
        if (!title || title.length < 3) return null;
        const container = heading.closest("article, section") || heading.parentElement || heading;
        const text = stripBuscaMarkup(container);
        if (text.length < 45) return null;
        const id = heading.id || generatedHeadingId(heading, index);
        return {
          page: page.title,
          title,
          url: `${page.url}#${id}`,
          text,
          excerpt: makeBuscaExcerpt(text, title),
        };
      })
      .filter(Boolean);
  }

  async function loadBuscaIndex() {
    if (searchIndexPromise) return searchIndexPromise;
    searchIndexPromise = Promise.all(
      searchPages.map(async (page) => {
        try {
          const response = await fetch(page.url, { cache: "no-cache" });
          if (!response.ok) throw new Error(`Could not load ${page.url}`);
          return extractPageBuscaEntries(await response.text(), page);
        } catch {
          const currentFile = window.location.pathname.split("/").pop() || "index.html";
          if (currentFile === page.url || (currentFile === "" && page.url === "index.html")) {
            return extractPageBuscaEntries(document.documentElement.outerHTML, page);
          }
          return [];
        }
      })
    ).then((groups) => {
      searchIndex = groups.flat();
      return searchIndex;
    });
    return searchIndexPromise;
  }

  function scoreBuscaEntry(entry, query) {
    const normalizedQuery = normalizeBuscaText(query);
    if (!normalizedQuery) return 0;
    const tokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 1);
    const title = normalizeBuscaText(entry.title);
    const body = normalizeBuscaText(`${entry.page} ${entry.title} ${entry.text}`);
    let score = body.includes(normalizedQuery) ? 60 : 0;

    tokens.forEach((token) => {
      if (title.includes(token)) score += 12;
      if (body.includes(token)) score += 4;
    });

    const matchedTokens = tokens.filter((token) => body.includes(token)).length;
    if (tokens.length > 2 && matchedTokens < Math.ceil(tokens.length / 3)) return 0;
    return score;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function markBuscaTerms(text, query) {
    const escaped = escapeHtml(text);
    const tokens = normalizeBuscaText(query)
      .split(/\s+/)
      .filter((token) => token.length > 2)
      .slice(0, 6);
    if (!tokens.length) return escaped;
    return tokens.reduce((current, token) => {
      const expression = new RegExp(`(${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
      return current.replace(expression, "<mark>$1</mark>");
    }, escaped);
  }

  function buildBuscaModal() {
    if (document.querySelector("[data-global-search-modal]")) return;

    const modal = document.createElement("div");
    modal.className = "global-search-modal";
    modal.setAttribute("data-global-search-modal", "");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "global-search-title");
    modal.innerHTML = `
      <div class="global-search-dialog">
        <div class="global-search-header">
          <div class="global-search-title-block">
            <h2 id="global-search-title">Buscar no site</h2>
            <p class="global-search-categories">Categorias predefinidas: facil para usuario, solucao de problemas, tecnico.</p>
          </div>
          <button class="global-search-close" type="button" data-search-close aria-label="Fechar busca">x</button>
        </div>
        <div class="global-search-body">
          <div class="global-search-controls">
            <input class="global-search-input" type="search" data-search-input placeholder="Buscar no site" autocomplete="off" />
            <select class="global-search-select" data-search-presets aria-label="Buscas predefinidas">
              <option value="">Buscas predefinidas</option>
            </select>
          </div>
          <p class="global-search-help" data-search-status>Perguntas predefinidas mostram primeiro uma resposta direta. Buscas digitadas mostram secoes correspondentes.</p>
          <div class="global-search-results" data-search-results></div>
          <button class="global-search-more" type="button" data-search-more hidden>Mostrar mais resultados</button>
        </div>
      </div>
    `;

    const select = modal.querySelector("[data-search-presets]");
    searchPresets.forEach((group) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.label;
      group.options.forEach((preset) => {
        const option = document.createElement("option");
        option.value = preset.key;
        option.textContent = preset.label;
        optgroup.append(option);
      });
      select.append(optgroup);
    });

    document.body.append(modal);
  }

  function renderPresetAnswer(preset) {
    return `
      <article class="global-search-answer">
        <span>Resposta direta</span>
        <h3>${escapeHtml(preset.answerTitle)}</h3>
        <p>${escapeHtml(preset.answer)}</p>
      </article>
    `;
  }

  function renderPresetLinks(preset) {
    if (!preset.links?.length) return "";
    return `
      <div class="global-search-guided-links" aria-label="Melhores links de apoio">
        <h3>Melhores links de apoio</h3>
        <div>
          ${preset.links
            .map(
              (link) => `
                <a class="global-search-guided-link" href="${escapeHtml(link.url)}">
                  <span>${escapeHtml(link.page)}</span>
                  <strong>${escapeHtml(link.title)}</strong>
                </a>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderSectionResults(entries, query) {
    return entries
      .map(
        (entry) => `
          <a class="global-search-result" href="${escapeHtml(entry.url)}">
            <span>${escapeHtml(entry.page)}</span>
            <strong>${markBuscaTerms(entry.title, query)}</strong>
            <p>${markBuscaTerms(entry.excerpt, query)}</p>
          </a>
        `
      )
      .join("");
  }

  function renderBuscaResults(query) {
    const modal = document.querySelector("[data-global-search-modal]");
    if (!modal) return;
    const resultsElement = modal.querySelector("[data-search-results]");
    const status = modal.querySelector("[data-search-status]");
    const more = modal.querySelector("[data-search-more]");
    const preset = getBuscaPreset(activePresetKey);
    const trimmed = query.trim();
    const effectiveQuery = preset?.query || trimmed;

    if (!trimmed && !preset) {
      resultsElement.innerHTML = `<p class="global-search-empty">Escolha uma busca predefinida ou digite uma palavra para buscar nas paginas visiveis do site.</p>`;
      status.textContent = "Perguntas predefinidas mostram primeiro uma resposta direta. Buscas digitadas mostram secoes correspondentes.";
      more.hidden = true;
      return;
    }

    const ranked = searchIndex
      .map((entry) => ({ entry, score: scoreBuscaEntry(entry, effectiveQuery) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.entry);

    if (preset) {
      const visible = ranked.slice(0, currentLimit === maximumExpandedResults ? 8 : 4);
      const related = visible.length
        ? `<h3 class="global-search-related-heading">Secoes relacionadas</h3>${renderSectionResults(visible, effectiveQuery)}`
        : "";

      resultsElement.innerHTML = `${renderPresetAnswer(preset)}${renderPresetLinks(preset)}${related}`;
      const linkCount = preset.links?.length || 0;
      const linkLabel = linkCount === 1 ? "link principal" : "links principais";
      status.textContent = `Mostrando uma resposta direta, ${linkCount} ${linkLabel}${
        visible.length ? ` e ${visible.length} secao${visible.length === 1 ? "" : "oes"} relacionada${visible.length === 1 ? "" : "s"}.` : "."
      }`;
      more.hidden = ranked.length <= visible.length || currentLimit >= maximumExpandedResults;
      return;
    }

    const visible = ranked.slice(0, currentLimit);
    status.textContent = ranked.length
      ? `${ranked.length} secao${ranked.length === 1 ? "" : "oes"} correspondente${ranked.length === 1 ? "" : "s"} encontrada${ranked.length === 1 ? "" : "s"}. Mostrando ${visible.length}.`
      : "Nenhuma secao correspondente encontrada.";

    resultsElement.innerHTML = visible.length
      ? renderSectionResults(visible, trimmed)
      : `<p class="global-search-empty">Nenhum resultado encontrado para "${escapeHtml(trimmed)}". Tente uma palavra mais ampla ou escolha uma busca predefinida.</p>`;

    more.hidden = ranked.length <= currentLimit || currentLimit >= maximumExpandedResults;
  }

  async function openGlobalBusca() {
    buildBuscaModal();
    const modal = document.querySelector("[data-global-search-modal]");
    const input = modal.querySelector("[data-search-input]");
    const select = modal.querySelector("[data-search-presets]");
    const header = document.querySelector(".site-header");
    header?.classList.remove("is-menu-open");
    header?.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    await loadBuscaIndex();
    currentLimit = maximumInitialResults;
    select.value = "";
    activePresetKey = "";
    renderBuscaResults(input.value);
    input.focus();
  }

  function closeGlobalBusca() {
    const modal = document.querySelector("[data-global-search-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function installGlobalBusca() {
    addGeneratedBuscaAnchors();
    window.addEventListener("hashchange", highlightCurrentTarget);
    highlightCurrentTarget();

    const nav = document.querySelector(".nav-links");
    if (nav && !nav.querySelector("[data-search-open]")) {
      const button = document.createElement("button");
      button.className = "nav-search-button";
      button.type = "button";
      button.setAttribute("data-search-open", "");
      button.textContent = "Busca";
      nav.append(button);
    }

    buildBuscaModal();
    const modal = document.querySelector("[data-global-search-modal]");
    const input = modal.querySelector("[data-search-input]");
    const select = modal.querySelector("[data-search-presets]");
    const more = modal.querySelector("[data-search-more]");

    document.querySelectorAll("[data-search-open]").forEach((button) => {
      button.addEventListener("click", openGlobalBusca);
    });

    modal.querySelector("[data-search-close]").addEventListener("click", closeGlobalBusca);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeGlobalBusca();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeGlobalBusca();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openGlobalBusca();
      }
    });

    input.addEventListener("input", () => {
      currentLimit = maximumInitialResults;
      select.value = "";
      activePresetKey = "";
      renderBuscaResults(input.value);
    });

    select.addEventListener("change", () => {
      currentLimit = maximumInitialResults;
      activePresetKey = select.value;
      const preset = getBuscaPreset(activePresetKey);
      input.value = preset?.label || "";
      renderBuscaResults(input.value);
      input.focus();
    });

    more.addEventListener("click", () => {
      currentLimit = maximumExpandedResults;
      renderBuscaResults(input.value);
    });

    modal.addEventListener("click", (event) => {
      const link = event.target.closest(".global-search-result, .global-search-guided-link");
      if (!link) return;
      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      closeGlobalBusca();
      if (destination.pathname === current.pathname && destination.hash) {
        event.preventDefault();
        window.location.hash = destination.hash;
        highlightCurrentTarget();
      }
    });
  }

  installGlobalBusca();
})();

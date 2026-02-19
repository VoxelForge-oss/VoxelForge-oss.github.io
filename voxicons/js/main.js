const categories = ["generic", "minecraft", "brand", "badge"];
let currentModalIcon = "";

/* ===============================
   RENDER ICONS
=================================*/
function renderIcons(filter = "") {
    const container = document.getElementById("iconsGrid");
    container.innerHTML = "";

    categories.forEach(category => {
        const filtered = icons.filter(icon =>
            icon.type === category &&
            (
                icon.name.toLowerCase().includes(filter.toLowerCase()) ||
                icon.type.toLowerCase().includes(filter.toLowerCase())
            )
        );

        if (!filtered.length) return;

        const header = document.createElement("h2");
        header.textContent =
            category.charAt(0).toUpperCase() + category.slice(1) + " Icons";
        header.className = `category-header category-${category}`;
        container.appendChild(header);

        const grid = document.createElement("div");
        grid.className = "grid-container";

        filtered.forEach((icon, i) => {
            const card = document.createElement("div");
            card.className = "card";

            const id = `${category}${i}`;

            card.innerHTML = `
                <img src="${icon.src}" 
                     alt="${icon.name}" 
                     loading="lazy"
                     onclick="openBadgeModal('${icon.src}')">

                <div class="url" 
                     data-url="${icon.src}" 
                     id="${id}">
                     ${icon.name}
                </div>

                <div class="button-row">

                    <div class="dropdown">
                        <button>Copy ▼</button>
                        <div class="dropdown-content">
                            <button onclick="copyUrl('${id}','url')">URL</button>
                            <button onclick="copyUrl('${id}','html')">HTML</button>
                            <button onclick="copyUrl('${id}','markdown')">Markdown</button>
                        </div>
                    </div>

                    <button onclick="openBadgeModal('${icon.src}')">
                        Generate Badge
                    </button>

                </div>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);
    });
}

/* ===============================
   COPY URL / HTML / MARKDOWN
=================================*/
function copyUrl(id, type) {
    const urlDiv = document.getElementById(id);
    const url = urlDiv.getAttribute("data-url").trim();
    const fullUrl = window.location.origin + url;
    const alt = urlDiv.textContent.trim();

    let text = "";

    if (type === "url") {
        text = fullUrl;
    }
    else if (type === "html") {
        text = `<img src="${fullUrl}" alt="${alt}">`;
    }
    else if (type === "markdown") {
        text = `![${alt}](${fullUrl})`;
    }

    navigator.clipboard.writeText(text)
        .then(() => showToast("Copied!"))
        .catch(() => showToast("Copy failed!", true));
}

/* ===============================
   BADGE MODAL
=================================*/
function openBadgeModal(src) {
    currentModalIcon = src;

    document.getElementById("modalIconPreview").src = src;
    document.getElementById("modalUrlInput").value = "";
    document.getElementById("modalPreview").innerHTML = "";
    document.getElementById("badgeModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("badgeModal").style.display = "none";
}

/* ===============================
   LIVE PREVIEW
=================================*/
document.getElementById("modalUrlInput").addEventListener("input", e => {
    const url = e.target.value.trim();
    const preview = document.getElementById("modalPreview");

    if (isValidURL(url)) {
        preview.innerHTML =
            `<a href="${url}" target="_blank">
                <img src="${currentModalIcon}" alt="Badge Preview">
             </a>`;
    } else {
        preview.innerHTML = "";
    }
});

/* ===============================
   COPY BADGE
=================================*/
function copyBadge(type) {
    const url = document.getElementById("modalUrlInput").value.trim();

    if (!isValidURL(url)) {
        showToast("Invalid URL!", true);
        return;
    }

    const fullImageUrl = window.location.origin + currentModalIcon;

    let text = "";

    if (type === "html") {
        text = `<a href="${url}" target="_blank">
    <img src="${fullImageUrl}" alt="Badge">
</a>`;
    }
    else if (type === "markdown") {
        text = `[![Badge](${fullImageUrl})](${url})`;
    }

    navigator.clipboard.writeText(text)
        .then(() => showToast("Copied!"))
        .catch(() => showToast("Copy failed!", true));
}

/* ===============================
   URL VALIDATION
=================================*/
function isValidURL(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

/* ===============================
   TOAST
=================================*/
function showToast(msg, isError = false) {
    Toastify({
        text: msg,
        duration: 2500,
        gravity: "top",
        position: "right",
        backgroundColor: isError ? "#ff5555" : "#00c8ff",
        stopOnFocus: true
    }).showToast();
}

/* ===============================
   SEARCH
=================================*/
document.getElementById("searchBar")
    .addEventListener("input", e => renderIcons(e.target.value));

renderIcons();

/* ===============================
   BACK TO TOP
=================================*/
const backToTop = document.getElementById("backToTop");

window.onscroll = () => {
    backToTop.style.display =
        document.documentElement.scrollTop > 300 ? "block" : "none";
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

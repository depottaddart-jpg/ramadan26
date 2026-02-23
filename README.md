# 🌙 رمضان 2026 — Ramadan 2026 Recipe Website

A beautiful, fully static Arabic-language recipe website celebrating Ramadan 2026. Browse, search, and filter 75 traditional and modern Ramadan recipes — from harira soup and bastilla to tiramisu and cheesecake — all presented in a responsive, RTL (right-to-left) interface.

---

## ✨ Features

- **75 Ramadan recipes** stored in a single `recettes.json` file — easy to extend
- **8 recipe categories**: Main dishes, Appetizers, Desserts, Soups, Fish, Poultry, Beverages, and Other
- **Live search** — filter by recipe title or ingredients as you type
- **Category filtering** — click any category button or card to filter the grid instantly
- **Recipe modal** — click any card to open a full recipe detail view with ingredients, step-by-step instructions, and chef tips
- **Responsive design** — mobile-friendly with a hamburger nav menu
- **RTL layout** — built from the ground up for Arabic (`dir="rtl"`)
- **Scroll-to-top button** and smooth scrolling between sections
- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript; no frameworks or build tools required

---

## 📁 Project Structure

```
ramadan-2026-recettes/
├── index.html       # Main HTML file — layout, sections, and modal markup
├── styles.css       # All styling: layout, animations, RTL support, responsive breakpoints
├── app.js           # App logic: data fetching, rendering, search/filter, modal, scroll effects
└── recettes.json    # Recipe data — 75 recipes as a JSON array
```

---

## 🚀 Getting Started

Because the app fetches `recettes.json` via `fetch()`, you need to serve the files from a local server (not just open `index.html` directly in a browser).

### Option 1 — Python (no install needed)

```bash
cd ramadan-2026-recettes
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

### Option 2 — Node.js `serve`

```bash
npx serve ramadan-2026-recettes
```

### Option 3 — VS Code Live Server extension

Right-click `index.html` → **Open with Live Server**.

---

## 📦 Recipe Data Format

Each recipe in `recettes.json` follows this schema:

```json
{
  "id": 1,
  "page": 3,
  "title": "Recipe title in Arabic",
  "time": "40 دقيقة",
  "servings": "4 أشخاص",
  "cost": "50 درهم",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["Step 1", "Step 2"],
  "chef_tip": "Optional tip shown in the modal",
  "presentation": "Optional serving suggestion",
  "image": "placeholder.jpg"
}
```

To add a new recipe, append a new object to the array in `recettes.json`. Categories are inferred automatically from the recipe title by the `categorizeRecipe()` function in `app.js`.

---

## 🏷️ Category System

Categories are assigned dynamically based on keywords in the recipe title:

| Category Key | Label (Arabic) | Examples |
|---|---|---|
| `principal` | أطباق رئيسية | Rice dishes, kebab, pasta, pizza |
| `entree` | مقبلات | Salads, zaalouk, hummus, mezza |
| `dessert` | حلويات | Cakes, tiramisu, cookies, baklava |
| `soupe` | شوربات | Harira, asparagus soup, Vietnamese pho |
| `poisson` | أسماك | Fish, squid, shrimp, surimi |
| `volaille` | دواجن | Chicken, turkey, coquelet |
| `boisson` | مشروبات | Juices, smoothies, tea |
| `autre` | أخرى | Everything else |

---

## 🌐 Deployment

This is a fully static site — deploy it anywhere:

- **GitHub Pages**: push to a repo and enable Pages in Settings
- **Netlify / Vercel**: drag and drop the folder or connect your repo
- **Any static host**: upload the four files as-is

No build step, no environment variables, no server required.

---

## 🤝 Contributing

Contributions are welcome! To add recipes or fix data quality issues:

1. Fork the repository
2. Edit `recettes.json` — follow the schema above
3. Test locally with a dev server
4. Open a pull request with a description of what you added or changed

For UI improvements, `styles.css` and `app.js` are well-commented and straightforward to modify.

---

## 📄 License

This project is open source. Feel free to use, adapt, and share it.

---

*رمضان كريم 🌙*

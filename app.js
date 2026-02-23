/**
 * Ramadan 2026 Recipes Website - JavaScript
 * Handles JSON data fetching, recipe rendering, search/filter, and interactions
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    jsonFile: 'recettes.json',
    animationDelay: 50,
    debounceDelay: 300,
    modalAnimationDuration: 300
};

// ========================================
// State Management
// ========================================
const state = {
    recipes: [],
    filteredRecipes: [],
    currentCategory: 'all',
    searchQuery: '',
    isLoading: true
};

// ========================================
// DOM Elements
// ========================================
const elements = {
    recipesGrid: null,
    loading: null,
    noResults: null,
    recipeCount: null,
    searchInput: null,
    filterBtns: null,
    categoryCards: null,
    modal: null,
    modalBody: null,
    modalClose: null,
    scrollTop: null,
    header: null,
    navToggle: null,
    navMenu: null
};

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    loadRecipes();
});

/**
 * Cache DOM elements for better performance
 */
function initializeElements() {
    elements.recipesGrid = document.getElementById('recipes-grid');
    elements.loading = document.getElementById('loading');
    elements.noResults = document.getElementById('no-results');
    elements.recipeCount = document.getElementById('recipe-count');
    elements.searchInput = document.getElementById('search-input');
    elements.filterBtns = document.querySelectorAll('.filter-btn');
    elements.categoryCards = document.querySelectorAll('.category-card');
    elements.modal = document.getElementById('recipe-modal');
    elements.modalBody = document.getElementById('modal-body');
    elements.modalClose = document.querySelector('.modal-close');
    elements.scrollTop = document.getElementById('scroll-top');
    elements.header = document.querySelector('.header');
    elements.navToggle = document.querySelector('.nav-toggle');
    elements.navMenu = document.querySelector('.nav-menu');
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Search functionality with debounce
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.searchQuery = e.target.value.trim().toLowerCase();
            filterRecipes();
        }, CONFIG.debounceDelay);
    });

    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            setActiveFilter(btn);
            state.currentCategory = category;
            filterRecipes();
            scrollToRecipes();
        });
    });

    // Category cards
    elements.categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            const filterBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
            if (filterBtn) {
                setActiveFilter(filterBtn);
                state.currentCategory = category;
                filterRecipes();
                scrollToRecipes();
            }
        });
    });

    // Modal close
    elements.modalClose.addEventListener('click', closeModal);
    elements.modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Scroll to top button
    window.addEventListener('scroll', handleScroll);

    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);

    // Mobile navigation toggle
    elements.navToggle.addEventListener('click', toggleMobileNav);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = elements.header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Data Loading
// ========================================
async function loadRecipes() {
    try {
        const response = await fetch(CONFIG.jsonFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        state.recipes = data;
        state.filteredRecipes = data;
        state.isLoading = false;

        // Update UI
        updateRecipeCount();
        updateCategoryCounts();
        renderRecipes();
        hideLoading();
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError();
    }
}

// ========================================
// Recipe Rendering
// ========================================
function renderRecipes() {
    if (state.filteredRecipes.length === 0) {
        elements.recipesGrid.innerHTML = '';
        elements.noResults.style.display = 'block';
        return;
    }

    elements.noResults.style.display = 'none';
    elements.recipesGrid.innerHTML = state.filteredRecipes.map((recipe, index) =>
        createRecipeCard(recipe, index)
    ).join('');

    // Add click listeners to recipe cards
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const recipeId = parseInt(card.dataset.id);
            const recipe = state.recipes.find(r => r.id === recipeId);
            if (recipe) {
                openModal(recipe);
            }
        });
    });
}

function createRecipeCard(recipe, index) {
    const category = categorizeRecipe(recipe.title);
    const categoryLabel = getCategoryLabel(category);
    const time = recipe.time || 'غير محدد';
    const servings = recipe.servings || 'غير محدد';
    const cost = recipe.cost || 'غير محدد';

    return `
        <article class="recipe-card" data-id="${recipe.id}" role="listitem" style="animation-delay: ${index * CONFIG.animationDelay}ms">
            <div class="recipe-image">
                <span class="recipe-category">${categoryLabel}</span>
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
                <div class="recipe-meta">
                    <span class="recipe-meta-item">
                        <span class="recipe-meta-icon">⏱️</span>
                        ${escapeHtml(time)}
                    </span>
                    <span class="recipe-meta-item">
                        <span class="recipe-meta-icon">👥</span>
                        ${escapeHtml(servings)}
                    </span>
                    <span class="recipe-meta-item">
                        <span class="recipe-meta-icon">💰</span>
                        ${escapeHtml(cost)}
                    </span>
                </div>
            </div>
        </article>
    `;
}

// ========================================
// Recipe Categorization
// ========================================
function categorizeRecipe(title) {
    const titleLower = title.toLowerCase();

    // Fish/Seafood dishes
    if (titleLower.includes('سمك') || titleLower.includes('سوريمي') ||
        titleLower.includes('حبار') || titleLower.includes('روبيان') ||
        titleLower.includes('ميلفوي')) {
        return 'poisson';
    }

    // Desserts
    if (titleLower.includes('حلوى') || titleLower.includes('كيك') ||
        titleLower.includes('بسكويت') || titleLower.includes('شيبوا') ||
        titleLower.includes('كراميل') || titleLower.includes('كريم') ||
        titleLower.includes('تيراميسو') || titleLower.includes('فالن') ||
        titleLower.includes(' غريبة') || titleLower.includes('حرشة') ||
        titleLower.includes('موفين') || titleLower.includes('كيكة')) {
        return 'dessert';
    }

    // Soups
    if (titleLower.includes('شوربة') || titleLower.includes('حريرة') ||
        titleLower.includes('حساء')) {
        return 'soupe';
    }

    // Poultry
    if (titleLower.includes('دجاج') || titleLower.includes('ديك رومي') ||
        titleLower.includes('كوكلي')) {
        return 'volaille';
    }

    // Main dishes
    if (titleLower.includes('أرز') || titleLower.includes('كباب') ||
        titleLower.includes('كفتة') || titleLower.includes('طاجين') ||
        titleLower.includes('بريوات') || titleLower.includes('مقلوبة') ||
        titleLower.includes('مسقعة') || titleLower.includes('محشي') ||
        titleLower.includes('بيتزا') || titleLower.includes('معكرونة') ||
        titleLower.includes('رافيول') || titleLower.includes('باستا') ||
        titleLower.includes('سيجار')) {
        return 'principal';
    }

    // Appetizers/Starters
    if (titleLower.includes('مقبلات') || titleLower.includes('سلطة') ||
        titleLower.includes('زعلوك') || titleLower.includes('بابا غنوج') ||
        titleLower.includes('حمص') || titleLower.includes('فتوش') ||
        titleLower.includes('ميزة') || titleLower.includes('نيم')) {
        return 'entree';
    }

    // Beverages
    if (titleLower.includes('مشروب') || titleLower.includes('عصير') ||
        titleLower.includes('شاي') || titleLower.includes('قهوة')) {
        return 'boisson';
    }

    return 'autre';
}

function getCategoryLabel(category) {
    const labels = {
        principal: 'طبق رئيسي',
        entree: 'مقبلات',
        dessert: 'حلويات',
        soupe: 'شوربة',
        poisson: 'أسماك',
        volaille: 'دواجن',
        autre: 'أخرى'
    };
    return labels[category] || 'وصفات';
}

// ========================================
// Filtering & Search
// ========================================
function filterRecipes() {
    let filtered = [...state.recipes];

    // Filter by category
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(recipe => {
            const category = categorizeRecipe(recipe.title);
            return category === state.currentCategory;
        });
    }

    // Filter by search query
    if (state.searchQuery) {
        filtered = filtered.filter(recipe => {
            const titleMatch = recipe.title.toLowerCase().includes(state.searchQuery);
            const ingredientsMatch = recipe.ingredients.some(ing =>
                ing.toLowerCase().includes(state.searchQuery)
            );
            return titleMatch || ingredientsMatch;
        });
    }

    state.filteredRecipes = filtered;
    renderRecipes();
}

function setActiveFilter(activeBtn) {
    elements.filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');

    // Update category cards
    elements.categoryCards.forEach(card => {
        if (card.dataset.category === activeBtn.dataset.category) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function scrollToRecipes() {
    const recipesSection = document.getElementById('recipes');
    const headerHeight = elements.header.offsetHeight;
    const searchSectionHeight = document.querySelector('.search-section').offsetHeight;
    const targetPosition = recipesSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - searchSectionHeight - 20;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// ========================================
// Modal Functions
// ========================================
function openModal(recipe) {
    const category = categorizeRecipe(recipe.title);
    const categoryLabel = getCategoryLabel(category);

    const modalContent = `
        <div class="recipe-detail-header">
            <h2 class="recipe-detail-title" id="modal-title">${escapeHtml(recipe.title)}</h2>
            <div class="recipe-detail-meta">
                <span class="recipe-detail-meta-item">
                    <span class="recipe-detail-meta-icon">📂</span>
                    ${categoryLabel}
                </span>
                <span class="recipe-detail-meta-item">
                    <span class="recipe-detail-meta-icon">⏱️</span>
                    ${escapeHtml(recipe.time || 'غير محدد')}
                </span>
                <span class="recipe-detail-meta-item">
                    <span class="recipe-detail-meta-icon">👥</span>
                    ${escapeHtml(recipe.servings || 'غير محدد')}
                </span>
                <span class="recipe-detail-meta-item">
                    <span class="recipe-detail-meta-icon">💰</span>
                    ${escapeHtml(recipe.cost || 'غير محدد')}
                </span>
            </div>
        </div>

        <div class="recipe-detail-section">
            <h3 class="recipe-detail-section-title">
                <span>🧺</span>
                المكونات
            </h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ing => `
                    <li class="ingredient-item">${escapeHtml(ing)}</li>
                `).join('')}
            </ul>
        </div>

        <div class="recipe-detail-section">
            <h3 class="recipe-detail-section-title">
                <span>👨‍🍳</span>
                طريقة التحضير
            </h3>
            <ol class="instructions-list">
                ${recipe.instructions.map((inst, index) => `
                    <li class="instruction-item">
                        <span class="instruction-number">${index + 1}</span>
                        <span class="instruction-text">${escapeHtml(inst)}</span>
                    </li>
                `).join('')}
            </ol>
        </div>

        ${recipe.chef_tip ? `
            <div class="recipe-detail-section">
                <h3 class="recipe-detail-section-title">
                    <span>💡</span>
                    نصيحة الشيف
                </h3>
                <p>${escapeHtml(recipe.chef_tip)}</p>
            </div>
        ` : ''}
    `;

    elements.modalBody.innerHTML = modalContent;
    elements.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus management for accessibility
    elements.modalClose.focus();
}

function closeModal() {
    elements.modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// UI Updates
// ========================================
function updateRecipeCount() {
    if (elements.recipeCount) {
        elements.recipeCount.textContent = state.recipes.length;
    }
}

function updateCategoryCounts() {
    const categories = ['principal', 'entree', 'dessert', 'soupe', 'poisson', 'volaille', 'boisson', 'autre'];

    categories.forEach(category => {
        const count = state.recipes.filter(recipe => categorizeRecipe(recipe.title) === category).length;
        const countElement = document.getElementById(`count-${category}`);
        if (countElement) {
            countElement.textContent = `${count} وصفة`;
        }
    });
}

function hideLoading() {
    if (elements.loading) {
        elements.loading.style.display = 'none';
    }
}

function showError() {
    elements.loading.innerHTML = `
        <div class="error-message">
            <p>عذراً، حدث خطأ في تحميل الوصفات</p>
            <button class="btn btn-primary" onclick="location.reload()">إعادة المحاولة</button>
        </div>
    `;
}

// ========================================
// Scroll & Header Effects
// ========================================
function handleScroll() {
    // Show/hide scroll to top button
    if (window.pageYOffset > 500) {
        elements.scrollTop.classList.add('visible');
    } else {
        elements.scrollTop.classList.remove('visible');
    }
}

function handleHeaderScroll() {
    if (window.pageYOffset > 50) {
        elements.header.classList.add('scrolled');
    } else {
        elements.header.classList.remove('scrolled');
    }
}

function toggleMobileNav() {
    elements.navToggle.classList.toggle('active');
    elements.navMenu.classList.toggle('active');
    elements.navToggle.setAttribute(
        'aria-expanded',
        elements.navToggle.classList.contains('active')
    );
}

// Scroll to top button click
elements.scrollTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Performance Optimization
// ========================================
// Lazy loading for images (if needed in future)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Debounce utility for search
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

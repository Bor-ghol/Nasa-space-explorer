class SpaceExplorer {
    constructor() {
        this.API_KEY = 'VDVaB9r7l3ImHR5wXjCRsuiEoukYpZe3FW1MZs7q';
        this.BASE_URL = 'https://api.nasa.gov/planetary/apod';
        this.initializeElements();
        this.setupEventListeners();
        this.loadFavorites();
    }

    initializeElements() {
        this.dateInput = document.getElementById('dateInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.spaceData = document.getElementById('spaceData');
        this.additionalImages = document.getElementById('additionalImages');
        this.favoritesList = document.getElementById('favoritesList');
        
        // Set max date to today
        this.dateInput.max = new Date().toISOString().split('T')[0];
    }

    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.randomBtn.addEventListener('click', () => this.handleRandomSearch());
    }

    async handleSearch() {
        const date = this.dateInput.value;
        if (!date) {
            this.displayError('Please select a date');
            return;
        }

        try {
            const data = await this.fetchSpaceData(date);
            this.displaySpaceData(data);
        } catch (error) {
            this.displayError(error.message);
        }
    }

    async handleRandomSearch() {
        try {
            const data = await this.fetchRandomSpaceData();
            this.displayMultipleImages(data);
        } catch (error) {
            this.displayError(error.message);
        }
    }

    async fetchSpaceData(date) {
        const response = await fetch(`${this.BASE_URL}?api_key=${this.API_KEY}&date=${date}`);
        if (!response.ok) throw new Error('Failed to fetch space data');
        return await response.json();
    }

    async fetchRandomSpaceData() {
        const response = await fetch(`${this.BASE_URL}?api_key=${this.API_KEY}&count=6`);
        if (!response.ok) throw new Error('Failed to fetch random space data');
        return await response.json();
    }

    displaySpaceData(data) {
        const mediaContent = data.media_type === 'image' 
            ? `<img src="${data.url}" alt="${data.title}">`
            : `<iframe src="${data.url}" frameborder="0"></iframe>`;

        this.spaceData.innerHTML = `
            <h2>${data.title}</h2>
            <p>Date: ${data.date}</p>
            ${mediaContent}
            <p>${data.explanation}</p>
            <button class="favorite-btn" onclick="spaceExplorer.addToFavorites(${this.safeStringify(data)})">
                Add to Favorites
            </button>
        `;
        this.additionalImages.innerHTML = '';
    }

    displayMultipleImages(data) {
        this.spaceData.innerHTML = '<h2>Random Space Images</h2>';
        this.additionalImages.innerHTML = data.map(item => `
            <div class="image-item">
                <h3>${item.title}</h3>
                <img src="${item.url}" alt="${item.title}">
                <p>Date: ${item.date}</p>
                <button class="favorite-btn" onclick='spaceExplorer.addToFavorites(${this.safeStringify(item)})'>
                    Add to Favorites
                </button>
            </div>
        `).join('');
    }

    safeStringify(data) {
        return JSON.stringify(data).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    }

    displayError(message) {
        this.spaceData.innerHTML = `<p class="error">Error: ${message}</p>`;
        this.additionalImages.innerHTML = '';
    }

    addToFavorites(data) {
        let favorites = this.getFavorites();
        if (!favorites.some(fav => fav.date === data.date)) {
            favorites.push(data);
            localStorage.setItem('spaceFavorites', JSON.stringify(favorites));
            this.loadFavorites();
        }
    }

    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem('spaceFavorites')) || [];
        } catch {
            return [];
        }
    }

    loadFavorites() {
        const favorites = this.getFavorites();
        this.favoritesList.innerHTML = favorites.map(item => `
            <div class="image-item">
                <h3>${item.title}</h3>
                <img src="${item.url}" alt="${item.title}">
                <p>Date: ${item.date}</p>
                <button class="favorite-btn" onclick="spaceExplorer.removeFromFavorites('${item.date}')">
                    Remove from Favorites
                </button>
            </div>
        `).join('');
    }

    removeFromFavorites(date) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(item => item.date !== date);
        localStorage.setItem('spaceFavorites', JSON.stringify(favorites));
        this.loadFavorites();
    }
}

const spaceExplorer = new SpaceExplorer();
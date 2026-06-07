// API Configuration
const API_BASE_URL = 'https://v2.jokeapi.dev/joke';

// DOM Elements
const jokeDisplay = document.getElementById('jokeDisplay');
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const jokeTypeSelect = document.getElementById('jokeType');
const jokeCountSpan = document.getElementById('jokeCount');
const errorMessage = document.getElementById('errorMessage');

// State
let currentJoke = '';
let jokeCount = 0;

// Event Listeners
getJokeBtn.addEventListener('click', fetchJoke);
copyBtn.addEventListener('click', copyJokeToClipboard);
jokeTypeSelect.addEventListener('change', fetchJoke);

/**
 * Fetch a random joke from the API
 */
async function fetchJoke() {
    const jokeType = jokeTypeSelect.value;
    
    // Show loading state
    setLoadingState(true);
    hideError();
    currentJoke = '';
    
    try {
        const url = buildJokeAPIUrl(jokeType);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if joke was found
        if (data.error) {
            throw new Error('Could not fetch joke. Please try again.');
        }
        
        // Format and display the joke
        displayJoke(data);
        jokeCount++;
        updateJokeCount();
        
    } catch (error) {
        console.error('Error fetching joke:', error);
        showError(error.message || 'Failed to fetch joke. Please check your connection and try again.');
        jokeDisplay.innerHTML = '<p class="loading">Failed to load joke. Please try again.</p>';
    } finally {
        setLoadingState(false);
    }
}

/**
 * Build the API URL based on selected joke type
 * @param {string} jokeType - The type of joke to fetch
 * @returns {string} The complete API URL
 */
function buildJokeAPIUrl(jokeType) {
    const categories = {
        'any': 'Any',
        'general': 'General',
        'programming': 'Programming',
        'knock-knock': 'Knock-Knock'
    };
    
    const category = categories[jokeType] || 'Any';
    return `${API_BASE_URL}/${category}`;
}

/**
 * Display the joke in the UI
 * @param {object} jokeData - The joke data from the API
 */
function displayJoke(jokeData) {
    jokeDisplay.classList.remove('loading');
    
    if (jokeData.type === 'twopart') {
        // Handle two-part jokes (setup and delivery)
        jokeDisplay.classList.add('two-part');
        jokeDisplay.innerHTML = `
            <div class="joke-part-setup">${escapeHtml(jokeData.setup)}</div>
            <div class="joke-part-delivery">${escapeHtml(jokeData.delivery)}</div>
        `;
        currentJoke = `${jokeData.setup}\n${jokeData.delivery}`;
    } else {
        // Handle single-part jokes
        jokeDisplay.classList.remove('two-part');
        jokeDisplay.innerHTML = `<p>${escapeHtml(jokeData.joke)}</p>`;
        currentJoke = jokeData.joke;
    }
}

/**
 * Copy the current joke to clipboard
 */
async function copyJokeToClipboard() {
    if (!currentJoke) {
        showError('No joke to copy. Get a joke first!');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(currentJoke);
        
        // Show feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#4caf50';
        copyBtn.style.color = 'white';
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
        }, 2000);
        
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy joke. Please try again.');
    }
}

/**
 * Set loading state for the get joke button
 * @param {boolean} isLoading - Whether the app is loading
 */
function setLoadingState(isLoading) {
    getJokeBtn.disabled = isLoading;
    
    if (isLoading) {
        getJokeBtn.textContent = '⏳ Loading...';
        jokeDisplay.classList.add('loading');
        jokeDisplay.innerHTML = '<p class="loading">Fetching a joke...</p>';
    } else {
        getJokeBtn.textContent = 'Get Joke';
    }
}

/**
 * Update the joke counter display
 */
function updateJokeCount() {
    jokeCountSpan.textContent = jokeCount;
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load a joke on page load
document.addEventListener('DOMContentLoaded', fetchJoke);

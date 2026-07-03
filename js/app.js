// Storage utility functions
const STORAGE_KEY = 'complaints_data';

/**
 * Fetch all complaints from local storage.
 * @returns {Array} Array of complaint objects.
 */
function getComplaints() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading from localstorage:", e);
        return [];
    }
}

/**
 * Save a new complaint to local storage.
 * @param {Object} complaint - The complaint details.
 */
function saveComplaint(complaint) {
    try {
        const complaints = getComplaints();
        complaints.unshift(complaint); // Add to the beginning of the list
        localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
        console.error("Error writing to localstorage:", e);
    }
}

/**
 * Delete a complaint by its unique identifier.
 * @param {string} id - The ID of the complaint to delete.
 */
function deleteComplaint(id) {
    try {
        const complaints = getComplaints();
        const updated = complaints.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Error deleting from localstorage:", e);
    }
}

/**
 * Display a modern, self-destructing success toast alert.
 * @param {string} message - Message to display.
 */
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast-success toast-anim';
    toast.innerHTML = `
        <span class="toast-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        </span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    // Trigger transition
    setTimeout(() => toast.classList.add('show'), 10);

    // Self-destruct toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// Page Specific Initializations
document.addEventListener('DOMContentLoaded', () => {
    // Determine context based on element existence
    const complaintsGrid = document.getElementById('complaints-grid');
    const complaintForm = document.getElementById('complaint-form');

    if (complaintsGrid) {
        initDashboard(complaintsGrid);
    }

    if (complaintForm) {
        initRegistrationForm(complaintForm);
    }
});

/**
 * Initializes the home page/dashboard rendering and search event bindings.
 * @param {HTMLElement} grid - The container to render cards in.
 */
function initDashboard(grid) {
    const searchInput = document.getElementById('search-complaints');
    
    // Initial Render
    renderComplaints(grid);

    // Live search event listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderComplaints(grid, e.target.value.trim());
        });
    }
}

/**
 * Render complaints matching search terms onto the grid.
 * @param {HTMLElement} grid - Grid DOM node.
 * @param {string} query - Filter keyword.
 */
function renderComplaints(grid, query = '') {
    grid.innerHTML = '';
    const complaints = getComplaints();
    
    // Normalize filter queries
    const normalizedQuery = query.toLowerCase();
    const filtered = complaints.filter(item => {
        return item.name.toLowerCase().includes(normalizedQuery) || 
               item.city.toLowerCase().includes(normalizedQuery) ||
               item.complaint.toLowerCase().includes(normalizedQuery);
    });

    if (filtered.length === 0) {
        renderEmptyState(grid, query);
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-card complaint-card animated-fade';
        
        // Get initials for profile picture representation
        const initials = item.name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

        card.innerHTML = `
            <div>
                <div class="card-header">
                    <div class="user-info">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-meta">
                            <h3>${escapeHtml(item.name)}</h3>
                            <span>${item.timestamp}</span>
                        </div>
                    </div>
                    <span class="city-badge">${escapeHtml(item.city)}</span>
                </div>
                <div class="card-body">
                    <p class="complaint-text">${escapeHtml(item.complaint)}</p>
                </div>
            </div>
            <div class="card-footer">
                <div class="mobile-info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>${escapeHtml(item.mobile)}</span>
                </div>
                <button class="btn-delete" title="Delete complaint" data-id="${item.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;

        // Delete button listener
        const deleteBtn = card.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove this complaint?')) {
                deleteComplaint(item.id);
                showToast('Complaint removed successfully');
                renderComplaints(grid, query);
            }
        });

        grid.appendChild(card);
    });
}

/**
 * Renders a clean interface placeholder if no complaints match filter.
 * @param {HTMLElement} grid - Grid container node.
 * @param {string} query - The search query filtering the dataset.
 */
function renderEmptyState(grid, query) {
    const isFiltered = query.length > 0;
    const title = isFiltered ? 'No matches found' : 'All Clear!';
    const desc = isFiltered 
        ? `We couldn't find any complaints matching "${escapeHtml(query)}". Try clearing your search.`
        : 'There are currently no registered complaints. Feel free to report a new issue!';
    
    const actionButton = isFiltered 
        ? `<button id="clear-search" class="btn-primary" style="margin-top: 8px;">Clear Search</button>`
        : `<a href="register.html" class="btn-primary" style="margin-top: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            File a Complaint
           </a>`;

    grid.innerHTML = `
        <div class="empty-state animated-fade" style="grid-column: 1 / -1;">
            <div class="empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h2>${title}</h2>
            <p>${desc}</p>
            ${actionButton}
        </div>
    `;

    const clearBtn = document.getElementById('clear-search');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('search-complaints');
            if (searchInput) searchInput.value = '';
            renderComplaints(grid);
        });
    }
}

/**
 * Initializes the registration page form validator and submission listener.
 * @param {HTMLFormElement} form - The form element.
 */
function initRegistrationForm(form) {
    // Restrict mobile number inputs to digits only
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
        mobileInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const city = document.getElementById('city').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const complaint = document.getElementById('complaint').value.trim();

        // Extra Validation
        if (!name || !city || !mobile || !complaint) {
            alert('Please fill out all the fields.');
            return;
        }

        if (mobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        // Construct object
        const newComplaint = {
            id: Date.now().toString(),
            name,
            city,
            mobile,
            complaint,
            timestamp: getFormattedDateTime()
        };

        // Save
        saveComplaint(newComplaint);

        // UI success notification and redirection
        showToast('Complaint registered successfully! Redirecting...');
        
        // Disable submission button to prevent double-submit
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1800);
    });
}

/**
 * Formats a date object to readable local representation.
 * @returns {string} Date string.
 */
function getFormattedDateTime() {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date().toLocaleDateString('en-US', options);
}

/**
 * Helper to escape HTML characters, preventing XSS injection.
 * @param {string} str - Raw string.
 * @returns {string} Sanitized string.
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

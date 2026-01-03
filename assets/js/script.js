const form = document.getElementById('wifi-form');
const cardContainer = document.getElementById('guest-card-container');
const qrImage = document.getElementById('qr-image');
const displaySsid = document.getElementById('display-ssid');
const displayPassword = document.getElementById('display-password');
const errorMessage = document.getElementById('error-message');
const openNetworkCheckbox = document.getElementById('open-network');
const hidePasswordCheckbox = document.getElementById('hide-password');
const passwordInput = document.getElementById('password');
const passwordLabel = document.getElementById('password-label');
const passwordContainer = document.getElementById('password-container');
const encryptionInput = document.getElementById('encryption');
const printArea = document.getElementById('print-area');

// New Event Listeners for Customization (replacing inline handlers)
const editTitleBtn = document.getElementById('edit-title-btn');
const editSubtitleBtn = document.getElementById('edit-subtitle-btn');
const editFooterBtn = document.getElementById('edit-footer-btn');
const editDetailsBtn = document.getElementById('edit-details-btn');
const printBtn = document.getElementById('print-btn');
const shareBtn = document.getElementById('share-btn');

if (editTitleBtn) editTitleBtn.addEventListener('click', () => editField('display-title'));
if (editSubtitleBtn) editSubtitleBtn.addEventListener('click', () => editField('display-subtitle'));
if (editFooterBtn) editFooterBtn.addEventListener('click', () => editField('display-footer'));

if (editDetailsBtn) {
    editDetailsBtn.addEventListener('click', () => {
        document.body.classList.remove('mobile-card-active'); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
if (printBtn) {
    printBtn.addEventListener('click', () => {
        updatePrintArea();
        window.print();
    });
}
if (shareBtn) shareBtn.addEventListener('click', shareCard);

// Toggle Password Field logic
function updatePasswordState() {
    const isOpen = openNetworkCheckbox.checked;
    
    if (isOpen) {
        encryptionInput.value = 'nopass';
        passwordInput.value = '';
        
        passwordContainer.classList.add('collapsed');
        
        // Disable hide password option
        hidePasswordCheckbox.checked = false;
        hidePasswordCheckbox.disabled = true;
        hidePasswordCheckbox.parentNode.nextElementSibling.classList.add('opacity-50');
    } else {
        encryptionInput.value = 'WPA';
        
        passwordContainer.classList.remove('collapsed');
        
            // Re-enable hide password option
        hidePasswordCheckbox.disabled = false;
            hidePasswordCheckbox.parentNode.nextElementSibling.classList.remove('opacity-50');
    }
}

// Event Listener
openNetworkCheckbox.addEventListener('change', updatePasswordState);

// Run on load from state
// (Wait until DOM is fully loaded or just run it now if script is deferred/at end)
passwordContainer.classList.add('smooth-collapse');
const passwordSectionElement = document.getElementById('password-section');
if (passwordSectionElement) {
    passwordSectionElement.classList.add('smooth-collapse');
}



function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Helper to visual polish card for export (Print/Share)
function cleanUpCardForExport(clone) {
    // Remove glass effects and borders that cause artifacts
    clone.classList.remove('glass-panel', 'border-t', 'border-white/40');
    
    // Set solid background to match theme (dark blue/gray)
    // Using a specific hex that matches the dark theme aesthetic
    // Set solid background to match theme (dark blue/gray)
    // Using CSS variable value manually here for canvas export
    clone.style.backgroundColor = '#1e293b'; // slate-800

    clone.style.border = 'none';
    clone.style.boxShadow = 'none';
    clone.style.borderRadius = '16px'; // Ensure rounded corners are clean
    
    // Clean up QR code container
    const qrContainer = clone.querySelector('.bg-white');
    if (qrContainer) {
        qrContainer.classList.remove('shadow-lg'); // Remove shadow causing gray artifacts
        qrContainer.style.borderRadius = '12px';
    }
    
    // Remove any other shadows
    clone.querySelectorAll('*').forEach(el => el.style.boxShadow = 'none');
    
    return clone;
}

// Share Card Functionality
async function shareCard() {
    // Clone the card to modify it for capture without affecting the view
    const originalCard = document.getElementById('guest-card');
    const clone = originalCard.cloneNode(true);
    
    // Position off-screen for capture
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    // Use a fixed width or ensure it has enough space. 
    // offsetWidth might be constrained by parent or flex container in current context.
    // Let's set a generous fixed width suitable for a "card" export.
    clone.style.width = '400px'; 
    clone.style.height = 'auto';
    clone.style.padding = '2rem'; // ensure padding is consistent
    
    // Apply visual polish
    cleanUpCardForExport(clone);
    
    // Remove no-print elements (like buttons) for the image
    clone.querySelectorAll('.no-print').forEach(el => el.remove());

    document.body.appendChild(clone);
    
    try {
        // Determine scale based on device pixel ratio for sharp images
        const scale = window.devicePixelRatio || 2;
        
        const canvas = await html2canvas(clone, {
            scale: scale,
            backgroundColor: null, 
            logging: false,
            useCORS: true
        });

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            // Create file for sharing
            const file = new File([blob], 'guest-pass.png', { type: 'image/png' });
            
            // Check if Web Share API is supported and can share files
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'WiFi Guest Pass',
                        text: 'Here is the WiFi access card!',
                        files: [file]
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') console.error('Share failed:', err);
                }
            } else {
                // Fallback: Download image
                const link = document.createElement('a');
                link.download = 'guest-pass.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
            
            // Cleanup
            document.body.removeChild(clone);
            
        }, 'image/png');
        
    } catch (err) {
        console.error('Capture failed:', err);
        showError('Failed to capture image. Please try again.');
        if (document.body.contains(clone)) document.body.removeChild(clone);
    }
}

// Sync card to print area
function updatePrintArea() {
    const cardContent = document.getElementById('guest-card').cloneNode(true);
    
    // Remove all no-print elements from the clone
    const noPrintElements = cardContent.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.remove());

    // Remove responsive sizing classes that might mess up print layout
    cardContent.classList.remove('w-full', 'md:w-1/2', 'glass-panel', 'border-t', 'border-white/40', 'h-full', 'min-h-screen');
    
    // Apply consistent clean style (Ink Friendly)
    cleanUpCardForExport(cardContent);
    
    // OVERRIDE for PRINT specifically to make it practical physical size
    cardContent.style.background = 'white';
    cardContent.style.color = 'black';
    cardContent.style.border = '2px solid black'; // Clean border for paper
    cardContent.style.borderRadius = '12px';
    
    // Set a practical fixed width and let height be auto
    cardContent.style.width = '350px'; 
    cardContent.style.minWidth = '350px';
    cardContent.style.maxWidth = '350px';
    cardContent.style.height = 'auto'; // CRITICAL: Stop stretching
    cardContent.style.margin = '0'; // Flex container handles centering
    cardContent.style.boxShadow = 'none';
    
    // Force text colors to black for print
    cardContent.querySelectorAll('*').forEach(el => {
        el.style.color = 'black';
        el.style.textShadow = 'none';
        el.style.borderColor = 'black';
        // Remove glass backgrounds from inputs/buttons if any remain
        el.style.background = 'transparent'; 
    });

    // Fix QR code for print
    const qr = cardContent.querySelector('#qr-image');
    if (qr) {
        qr.style.filter = 'none';
        qr.style.opacity = '1';
    }

    printArea.innerHTML = '';
    printArea.appendChild(cardContent);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Explicitly get encryption value to ensure it's correct
    const currentEncryption = encryptionInput.value;
    
    // Client-side Validation
    if (currentEncryption !== 'nopass' && !data.password) {
        showError("Oops! Don't forget the password (or check 'This is an Open Network')");
        return;
    }

    try {
        // WiFi QR Code Format: WIFI:T:WPA;S:mynetwork;P:mypass;;
        // Escape characters: \ -> \\, ; -> \;, , -> \,, : -> \:
        const escape = (str) => str.replace(/([\\;,":])/g, '\\$1');

        let qrString = `WIFI:T:${currentEncryption};S:${escape(data.ssid)};`;
        if (data.password) {
            qrString += `P:${escape(data.password)};`;
        }
        
        qrString += ';';

        // Generate QR Code
        
        const qrUrl = await QRCode.toDataURL(qrString, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#00000000' // Transparent background
            }
        });

        // Update Card
        qrImage.src = qrUrl;
        displaySsid.textContent = data.ssid;
        
        // Update custom text: ONLY if not already set (preserve edits) -> Actually better to just NOT update them here.
        // The user edits them properly in place now. We shouldn't overwrite them with defaults on every generation.
        // document.getElementById('display-title').textContent = ... (Removed to preserve user edits)
        
        const passwordSection = document.getElementById('password-section'); 

        if (currentEncryption === 'nopass' || hidePasswordCheckbox.checked) {
            // Hide password section for open networks or when user chose to hide
            passwordSection.classList.add('collapsed');
        } else {
            passwordSection.classList.remove('collapsed');
            // Check if open network is NOT checked before showing password
            if (!openNetworkCheckbox.checked) {
                    displayPassword.textContent = data.password;
            }
        }
        
        // Show Card
        cardContainer.classList.remove('hidden');
        // Trigger reflow
        void cardContainer.offsetWidth; 
        cardContainer.classList.remove('opacity-0');
        
        // Update print area
        updatePrintArea(); 

        // Scroll to card on mobile only and hide form
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile-card-active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

    } catch (err) {
        console.error(err);
        showError('Failed to generate QR code'); 
    }
});

// Unused animation function removed

// Real-time card visibility updates
function updateCardVisibility() {
    const passwordSection = document.getElementById('password-section');
    
    // If open network OR hide password checked -> hide
    const shouldHide = openNetworkCheckbox.checked || hidePasswordCheckbox.checked;
    
    // Use helper for better animation
    // But direct class toggle is safer for sync issues if we spam click.
    // The CSS `max-height: 100px` tweak I did is robust enough for now 
    // without risking complex JS race conditions on height.
    // I will stick to the CSS class toggle I just improved, 
    // but ensure the state is applied correctly.
    
    if (shouldHide) {
        passwordSection.classList.add('collapsed');
    } else {
        passwordSection.classList.remove('collapsed');
    }
    
    // Sync print area after visual update
    setTimeout(updatePrintArea, 300); 
}

// Also update print area on input changes
// Customization inputs removed, listeners removed

hidePasswordCheckbox.addEventListener('change', updateCardVisibility);

// "Update Needed" Logic
const generateBtn = form.querySelector('button[type="submit"]');
const btnText = generateBtn.querySelector('span');
const originalBtnText = btnText.textContent;
let isCardGenerated = false;

function triggerUpdateState() {
    if (!isCardGenerated) return;
    
    generateBtn.classList.add('btn-update-needed');
    btnText.textContent = 'Update QR Code';
}

function resetUpdateState() {
    generateBtn.classList.remove('btn-update-needed');
    btnText.textContent = originalBtnText;
    isCardGenerated = true; // Mark as generated so future edits trigger it
}

// Watch for changes that affect QR Code specifically
const criticalInputs = ['ssid', 'password', 'open-network', 'encryption'];
criticalInputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (el.type === 'checkbox') {
        el.addEventListener('change', triggerUpdateState);
    } else {
        el.addEventListener('input', triggerUpdateState);
    }
});

// Hook into the existing form submit to reset state
form.addEventListener('submit', () => {
    // Determine if we should really reset. 
    // The main submit handler is async but runs instantly.
    // We can safely reset here.
    resetUpdateState();
});
openNetworkCheckbox.addEventListener('change', () => {
        updatePasswordState();
        updateCardVisibility();
});

// Customization Logic Replaced by Edit-in-Place

// Edit in Place Function
window.editField = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return; 

    // Stop if parent already has an input (already editing)
    const parent = el.parentNode;
    if (parent.querySelector('input')) return;

    const currentText = el.textContent;

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    // Added 'edit-input' class for easier identification if needed
    input.className = 'edit-input bg-transparent text-white border-b border-white/50 focus:outline-none focus:border-white w-full text-center font-inherit p-0 m-0';
    
    // Match styles
    const styles = window.getComputedStyle(el);
    input.style.font = styles.font;
    input.style.letterSpacing = styles.letterSpacing;
    input.style.textTransform = styles.textTransform;
    input.style.color = 'white'; // Force white text color

    // Stop propagation so clicking input doesn't re-trigger parent onclick
    input.addEventListener('click', (e) => e.stopPropagation());

    // Swap
    el.classList.add('hidden');
    parent.insertBefore(input, el);
    input.focus();
    input.select(); // Select all text for easy replacement

    // Save on blur or enter
    const save = () => {
        const newValue = input.value;
        if (newValue.trim()) {
             el.textContent = newValue;
        }
        input.remove();
        el.classList.remove('hidden');
        updatePrintArea(); // Sync for print
    };

    // Handle saving
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur(); // Trigger save via blur
        }
    });
};



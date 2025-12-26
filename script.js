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

// Toggle Password Field logic
function updatePasswordState() {
    const isOpen = openNetworkCheckbox.checked;
    
    if (isOpen) {
        encryptionInput.value = 'nopass';
        passwordInput.value = '';
        passwordContainer.style.display = 'none';
        
        // Disable hide password option
        hidePasswordCheckbox.checked = false;
        hidePasswordCheckbox.disabled = true;
        hidePasswordCheckbox.parentNode.nextElementSibling.classList.add('opacity-50');
    } else {
        encryptionInput.value = 'WPA';
        passwordContainer.style.display = 'block';
        
            // Re-enable hide password option
        hidePasswordCheckbox.disabled = false;
            hidePasswordCheckbox.parentNode.nextElementSibling.classList.remove('opacity-50');
    }
}

// Event Listener
openNetworkCheckbox.addEventListener('change', updatePasswordState);

// Run on load to ensure correct state
updatePasswordState();

// Real-time card text updates
document.getElementById('card-title').addEventListener('input', (e) => {
    document.getElementById('display-title').textContent = e.target.value || 'Wi-Fi Access';
});
document.getElementById('card-subtitle').addEventListener('input', (e) => {
    document.getElementById('display-subtitle').textContent = e.target.value || 'Guest Pass';
});
document.getElementById('card-footer').addEventListener('input', (e) => {
    document.getElementById('display-footer').textContent = e.target.value || 'Scan to connect automatically';
});

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

    // Apply consistent clean style
    cleanUpCardForExport(cardContent);
    
    // Print specific overrides (white background for paper saving if desired, 
    // but user asked for "same color background", presumably referring to the dark card)
    // Actually, for PRINT, usually white is better, but user complained about "gray color".
    // Let's stick to the high-contrast dark card as it looks premium, unless they want ink-saving.
    // "it should just be all the same color background"
    
    // Re-applying white for print media query override issues if needed,
    // but let's try to honor the dark theme if that's what they liked in the share.
    // Wait, for *PRINT* specifically, usually people want white.
    // The previous print logic set it to white/black text.
    // Let's keep print as "Ink Friendly" (White) but clean, 
    // and Share as "Digital Premium" (Dark).
    
    // OVERRIDE for PRINT specifically to stay ink-friendly but clean
    cardContent.style.background = 'white';
    cardContent.style.color = 'black';
    cardContent.style.border = '2px solid black'; // Clean border for paper
    
        // Force text colors for print
    const texts = cardContent.querySelectorAll('*');
    texts.forEach(el => {
        el.style.color = 'black';
        el.style.textShadow = 'none';
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
        // Using QRCode from qrcodejs or similar library. 
        // Syntax: QRCode.toDataURL(text, options) -> Promise<url>
        
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
        
        // Update custom text
        document.getElementById('display-title').textContent = data['card-title'] || 'Wi-Fi Access';
        document.getElementById('display-subtitle').textContent = data['card-subtitle'] || 'Guest Pass';
        document.getElementById('display-footer').textContent = data['card-footer'] || 'Scan to connect automatically';
        
        const passwordSection = document.getElementById('password-section'); 

        if (currentEncryption === 'nopass' || hidePasswordCheckbox.checked) {
            // Hide password section for open networks or when user chose to hide
            passwordSection.style.display = 'none';
        } else {
            passwordSection.style.display = 'block';
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

// Real-time card visibility updates
function updateCardVisibility() {
    const passwordSection = document.getElementById('password-section');
    
    // If open network OR hide password checked -> hide
    if (openNetworkCheckbox.checked || hidePasswordCheckbox.checked) {
        passwordSection.style.display = 'none';
    } else {
        passwordSection.style.display = 'block';
    }
    
    // Sync print area after visual update
    setTimeout(updatePrintArea, 0);
}

// Also update print area on input changes
const customizationInputs = ['card-title', 'card-subtitle', 'card-footer'];
customizationInputs.forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        // Small delay to let the main card update first
        setTimeout(updatePrintArea, 0); 
    });
});

hidePasswordCheckbox.addEventListener('change', updateCardVisibility);
openNetworkCheckbox.addEventListener('change', () => {
        updatePasswordState();
        updateCardVisibility();
});

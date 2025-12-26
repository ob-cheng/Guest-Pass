# Guest Pass

A premium, client-side WiFi QR code generator designed to create beautiful, printable access cards for your guests.

[**🌐 Try it Online**](https://ob-cheng.github.io/Guest-Pass/)

## 🔒 Privacy & Security

**Your data never leaves your device.**

This application is built as a **100% Client-Side Application**.
*   **No Server:** There is no backend server processing your information.
*   **Local Processing:** When you type your WiFi password, it is processed entirely within your browser's memory using JavaScript.
*   **Zero-Knowledge:** We cannot see, store, or transmit your network credentials because the code runs strictly on your machine.

## ⚙️ How It Works

The QR code generation logic follows standard WiFi connection protocols, but implemented entirely in the browser:

1.  **String Formatting:** The app takes your SSID and Password and formats them into a standardized string that smartphones recognize:
    `WIFI:T:WPA;S:YourNetworkName;P:YourPassword;;`
2.  **Visual Encoding:** We use a JavaScript library (`qrcode.js`) to convert this text string into a matrix of black and white pixels (the QR code) directly in the DOM.
3.  **Image Generation:** When you click "Share," we use `html2canvas` to take a high-resolution screenshot of the DOM element and convert it to a PNG blob, all without external APIs.

## 💻 Installation & Usage

### 1. Clone the Repository
Start by cloning the project to your local machine:
```bash
git clone https://github.com/ob-cheng/Guest-Pass.git
cd Guest-Pass
```

### 2. Run Locally
While this is a static site that *can* work by just opening the file, we recommend running a local server for the best development experience.

**Method A: VS Code Live Server (Recommended)**
1.  Open the folder in **Visual Studio Code**.
2.  Install the **Live Server** extension (if you haven't already).
3.  Right-click `index.html` and select **"Open with Live Server"**.

**Method B: Python Simple Server**
If you have Python installed, you can launch a quick local server:
```bash
# Python 3
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Method C: Drag & Drop**
Refactoring to client-side means you can also just locate the folder and double-click `index.html`. 
*Note: Ensure the `assets` folder is present in the same directory.*

## ✨ Features
*   **Secure:** 100% offline-capable logic.
*   **Instant:** Real-time preview and generation.
*   **Responsive:** Works beautifully on mobile and desktop.
*   **Export Ready:** Purpose-built "Print" (clean, ink-friendly) and "Share Image" (premium dark mode) features.

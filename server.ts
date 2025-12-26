import express from 'express';
import type { Request, Response } from 'express';
import QRCode from 'qrcode';
import path from 'node:path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Types
interface GenerateRequest {
    ssid: string;
    password?: string;
    encryption?: 'WPA' | 'WEP' | 'nopass';
    hidden?: boolean;
}

// Routes
app.post('/generate', async (req: Request<{}, {}, GenerateRequest>, res: Response) => {
    try {
        const { ssid, password, encryption = 'WPA', hidden = false } = req.body;

        if (encryption !== 'nopass' && !password) {
            res.status(400).json({ error: 'Password is required for secure networks' });
            return;
        }

        // WiFi QR Code Format: WIFI:T:WPA;S:mynetwork;P:mypass;;
        // Escape characters: \ -> \\, ; -> \;, , -> \,, : -> \:
        const escape = (str: string) => str.replace(/([\\;,":])/g, '\\$1');

        let qrString = `WIFI:T:${encryption};S:${escape(ssid)};`;
        if (password) {
            qrString += `P:${escape(password)};`;
        }
        if (hidden) {
            qrString += `H:true;`;
        }
        qrString += ';';

        const qrDataUrl = await QRCode.toDataURL(qrString, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#00000000' // Transparent background
            }
        });

        res.json({ qrCode: qrDataUrl });

    } catch (error) {
        console.error('QR Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

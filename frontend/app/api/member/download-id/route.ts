import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateRequest } from "@/lib/member/auth";

export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "pdf";

    const userDocRef = adminDb.collection("users").doc(auth.uuid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return new Response("Member profile not found", { status: 404 });
    }

    const userData = userDoc.data() || {};
    const name = userData.name || "Member";
    const email = userData.email || "";
    const neoId = userData.neoId || "NEO-XXXX-XXXX-XXXX";
    const qrCodeBase64 = userData.qrCode || "";
    const role = (userData.role || "MEMBER").toUpperCase();
    const status = (userData.status || "ACTIVE").toUpperCase();
    const verificationLevel = (userData.verificationLevel || "VERIFIED").toUpperCase();
    const createdAt = userData.createdAt || new Date().toISOString();
    
    // Format Member Since date
    const memberSinceStr = new Date(createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    // ── Generate SVG ─────────────────────────────────────────────────────────
    if (format === "svg" || format === "png") {
      // To satisfy PNG format locally without binary dependencies, we can return the beautiful SVG
      // since browsers render SVGs natively as high-resolution images, and we can trigger download
      // as SVG or render to canvas.
      
      const logoPath = path.join(process.cwd(), "public/newlogo.png");
      let logoBase64 = "";
      if (fs.existsSync(logoPath)) {
        logoBase64 = fs.readFileSync(logoPath).toString("base64");
      }

      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 700" width="450" height="700">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#050505" />
              <stop offset="50%" stop-color="#0E0E0E" />
              <stop offset="100%" stop-color="#030303" />
            </linearGradient>
            <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#00E5A8" />
              <stop offset="100%" stop-color="#0EA5E9" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <stop offset="0%" stop-color="#00E5A8" />
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Luxury Card Base -->
          <rect x="10" y="10" width="430" height="680" rx="24" ry="24" fill="url(#bgGrad)" stroke="#00E5A8" stroke-width="2" stroke-opacity="0.25" />
          
          <!-- Inner Glow Frame -->
          <rect x="25" y="25" width="400" height="650" rx="16" ry="16" fill="none" stroke="url(#neonGrad)" stroke-width="1.5" stroke-opacity="0.15" />

          <!-- Top Logo Section -->
          ${logoBase64 ? `<image href="data:image/png;base64,${logoBase64}" x="125" y="55" width="200" height="50" preserveAspectRatio="xMidYMid meet" />` : `
            <text x="225" y="85" fill="#00E5A8" font-family="system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="2" text-anchor="middle">NEOFACE</text>
          `}

          <!-- Header Divider -->
          <line x1="45" y1="130" x2="405" y2="130" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />

          <!-- User Details / Badge -->
          <g transform="translate(0, 160)">
            <!-- Verification Level Badge -->
            <rect x="155" y="0" width="140" height="26" rx="13" fill="#00E5A8" fill-opacity="0.08" stroke="#00E5A8" stroke-opacity="0.2" stroke-width="1" />
            <circle cx="170" cy="13" r="4" fill="#00E5A8" />
            <text x="230" y="18" fill="#00E5A8" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" letter-spacing="1" text-anchor="middle">${verificationLevel}</text>

            <!-- Name -->
            <text x="225" y="55" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${name}</text>
            <text x="225" y="75" fill="#888888" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">${email}</text>
          </g>

          <!-- Large QR Code Area -->
          <g transform="translate(115, 275)">
            <!-- Glassmorphism border for QR -->
            <rect x="-10" y="-10" width="240" height="240" rx="16" ry="16" fill="#FFFFFF" fill-opacity="0.02" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1" />
            ${qrCodeBase64 ? `<image href="${qrCodeBase64}" x="0" y="0" width="220" height="220" />` : `
              <rect x="0" y="0" width="220" height="220" fill="#222222" rx="8" />
              <text x="110" y="115" fill="#666666" text-anchor="middle">QR CODE</text>
            `}
          </g>

          <!-- Footer Identity Info -->
          <g transform="translate(0, 565)">
            <!-- NeoID Banner -->
            <text x="225" y="0" fill="#00E5A8" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="1" text-anchor="middle">${neoId}</text>
            
            <line x1="45" y1="20" x2="405" y2="20" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />

            <!-- Row 1: Role & Status -->
            <text x="50" y="45" fill="#555555" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" letter-spacing="0.5">ROLE</text>
            <text x="50" y="65" fill="#DDDDDD" font-family="system-ui, sans-serif" font-size="13" font-weight="600">${role}</text>

            <text x="225" y="45" fill="#555555" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" letter-spacing="0.5" text-anchor="middle">STATUS</text>
            <text x="225" y="65" fill="#00E5A8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${status}</text>

            <text x="400" y="45" fill="#555555" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" letter-spacing="0.5" text-anchor="end">MEMBER SINCE</text>
            <text x="400" y="65" fill="#DDDDDD" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="end">${memberSinceStr}</text>
          </g>
        </svg>
      `.trim();

      return new Response(svgContent, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="neoface_id_${neoId.toLowerCase()}.svg"`
        }
      });
    }

    // ── Generate PDF ─────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    // Identity Card Dimensions: 400 pt x 600 pt
    const page = pdfDoc.addPage([400, 600]);

    // 1. Draw Background (Luxury Black)
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 400,
      height: 600,
      color: rgb(6/255, 6/255, 6/255)
    });

    // 2. Draw Frame Border (Neon Green Glow Accent)
    page.drawRectangle({
      x: 12,
      y: 12,
      width: 376,
      height: 576,
      borderColor: rgb(0/255, 229/255, 168/255),
      borderWidth: 1.5,
      opacity: 0.8
    });

    // 3. Draw Subtly Inset Frame (Dark Slate Accent)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: 360,
      height: 560,
      borderColor: rgb(255/255, 255/255, 255/255),
      borderWidth: 1,
      opacity: 0.05
    });

    // 4. Embed and Draw Logo
    const logoPath = path.join(process.cwd(), "public/newlogo.png");
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBuffer);
      page.drawImage(logoImage, {
        x: 110,
        y: 520,
        width: 180,
        height: 45
      });
    } else {
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      page.drawText("NEOFACE", {
        x: 140,
        y: 530,
        size: 24,
        font: fontBold,
        color: rgb(0/255, 229/255, 168/255)
      });
    }

    // Divider Line
    page.drawLine({
      start: { x: 35, y: 500 },
      end: { x: 365, y: 500 },
      color: rgb(255/255, 255/255, 255/255),
      thickness: 0.75,
      opacity: 0.1
    });

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontCourier = await pdfDoc.embedFont(StandardFonts.CourierBold);

    // 5. Draw Badges and Header Info
    // Verification Level Badge Box
    page.drawRectangle({
      x: 130,
      y: 460,
      width: 140,
      height: 22,
      color: rgb(0/255, 229/255, 168/255),
      opacity: 0.06
    });
    page.drawRectangle({
      x: 130,
      y: 460,
      width: 140,
      height: 22,
      borderColor: rgb(0/255, 229/255, 168/255),
      borderWidth: 0.5,
      opacity: 0.3
    });
    // Little Dot
    page.drawCircle({
      x: 145,
      y: 471,
      size: 3,
      color: rgb(0/255, 229/255, 168/255)
    });
    // Badge Text
    page.drawText(verificationLevel, {
      x: 160,
      y: 467,
      size: 9,
      font: fontBold,
      color: rgb(0/255, 229/255, 168/255)
    });

    // Member Name
    const nameWidth = fontBold.widthOfTextAtSize(name, 18);
    page.drawText(name, {
      x: 200 - nameWidth / 2,
      y: 425,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Email
    const emailWidth = fontRegular.widthOfTextAtSize(email, 10);
    page.drawText(email, {
      x: 200 - emailWidth / 2,
      y: 410,
      size: 10,
      font: fontRegular,
      color: rgb(136/255, 136/255, 136/255)
    });

    // 6. Draw QR Code
    if (qrCodeBase64) {
      // Embed QR code image
      const qrImageBuffer = Buffer.from(qrCodeBase64.replace(/^data:image\/png;base64,/, ""), "base64");
      const qrImage = await pdfDoc.embedPng(qrImageBuffer);
      
      // QR Code Container
      page.drawRectangle({
        x: 105,
        y: 205,
        width: 190,
        height: 190,
        color: rgb(1, 1, 1),
        borderColor: rgb(255/255, 255/255, 255/255),
        borderWidth: 0.5,
        opacity: 0.05
      });

      page.drawImage(qrImage, {
        x: 110,
        y: 210,
        width: 180,
        height: 180
      });
    }

    // 7. Footer Details
    // NeoID
    const neoIdWidth = fontCourier.widthOfTextAtSize(neoId, 16);
    page.drawText(neoId, {
      x: 200 - neoIdWidth / 2,
      y: 160,
      size: 16,
      font: fontCourier,
      color: rgb(0/255, 229/255, 168/255)
    });

    // Footer divider line
    page.drawLine({
      start: { x: 35, y: 140 },
      end: { x: 365, y: 140 },
      color: rgb(255/255, 255/255, 255/255),
      thickness: 0.75,
      opacity: 0.1
    });

    // Details Grid Labels
    page.drawText("ROLE", { x: 35, y: 115, size: 8, font: fontBold, color: rgb(85/255, 85/255, 85/255) });
    page.drawText(role, { x: 35, y: 95, size: 11, font: fontBold, color: rgb(220/255, 220/255, 220/255) });

    page.drawText("STATUS", { x: 170, y: 115, size: 8, font: fontBold, color: rgb(85/255, 85/255, 85/255) });
    page.drawText(status, { x: 170, y: 95, size: 11, font: fontBold, color: rgb(0/255, 229/255, 168/255) });

    page.drawText("MEMBER SINCE", { x: 275, y: 115, size: 8, font: fontBold, color: rgb(85/255, 85/255, 85/255) });
    page.drawText(memberSinceStr, { x: 275, y: 95, size: 11, font: fontBold, color: rgb(220/255, 220/255, 220/255) });

    // Output PDF bytes
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="neoface_id_${neoId.toLowerCase()}.pdf"`,
        "Content-Length": pdfBuffer.length.toString()
      }
    });
  } catch (err: any) {
    console.error("Error in /api/member/download-id:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

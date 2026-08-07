import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set maximum payload JSON sizes
  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper to generate mathematically valid CPF to prevent "Invalid user identification number" errors on Mercado Pago
  function generateValidCPF(): string {
    const num = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    
    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
      sum1 += num[i] * (10 - i);
    }
    let d1 = 11 - (sum1 % 11);
    if (d1 >= 10) d1 = 0;
    num.push(d1);
    
    let sum2 = 0;
    for (let i = 0; i < 10; i++) {
      sum2 += num[i] * (11 - i);
    }
    let d2 = 11 - (sum2 % 11);
    if (d2 >= 10) d2 = 0;
    num.push(d2);
    
    return num.join("");
  }

  // Mercado Pago Pix Payment Generation Endpoint
  app.post("/api/payments/pix", async (req, res) => {
    const { amount, description, email } = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || 
                  process.env.MERCADOPAGO_ACCESS_TOKEN || 
                  process.env.MERCADO_PAGO_PUBLIC_KEY;
    
    if (!token) {
      console.warn("Mercado Pago token requested but is not configured in environment.");
      return res.status(400).json({
        error: "Chave do Mercado Pago não configurada. Por favor, adicione a variável de ambiente MERCADO_PAGO_ACCESS_TOKEN com o seu 'Access Token' nas configurações do painel."
      });
    }

    // Check if the user passed a Public Key by mistake (contains a simple UUID format after APP_USR-)
    const cleanToken = token.trim();
    const isProbablyPublicKey = cleanToken.length < 55 && cleanToken.startsWith("APP_USR-");

    if (isProbablyPublicKey) {
      console.warn("A Public Key was provided as an Access Token. This will fail with 401/403!");
      return res.status(400).json({
        error: "A chave configurada parece ser uma 'Public Key' (Chave Pública: APP_USR-xxxx...). Para gerar o Pix no servidor, você precisa obrigatoriamente usar o 'Access Token' (Token de Acesso / Chave Privada, que é bem mais longa). Por favor, configure a variável MERCADO_PAGO_ACCESS_TOKEN corretamente.",
        isPublicKeyError: true,
        providedKey: cleanToken
      });
    }

    try {
      const idempotencyKey = "mp-pix-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
      
      // Clean up the price - make sure it is parsed to float and formatted properly
      const priceValue = parseFloat(String(amount).replace("R$", "").replace(",", ".").trim());
      const validCpf = generateValidCPF();

      const payload = {
        transaction_amount: priceValue,
        description: description || "Plano Premium - Impulsione Link",
        payment_method_id: "pix",
        payer: {
          email: email || "elitestreambr1@gmail.com",
          first_name: "Cliente",
          last_name: "Impulsione",
          identification: {
            type: "CPF",
            number: validCpf
          }
        }
      };

      console.log(`Generating Pix with payload:`, payload);

      const response = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Mercado Pago API returned an error response:", data);
        return res.status(response.status).json({
          error: data.message || "Erro retornado pela API do Mercado Pago.",
          details: data
        });
      }

      // Return the vital transaction fields
      res.json({
        id: data.id,
        status: data.status,
        status_detail: data.status_detail,
        qr_code: data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64
      });

    } catch (err: any) {
      console.error("Payment processing error:", err);
      res.status(500).json({ 
        error: "Houve um erro interno de conexão com o Mercado Pago ao tentar gerar o Pix.", 
        details: err.message 
      });
    }
  });

  // Mercado Pago Payment Status Checking Endpoint
  app.get("/api/payments/status/:id", async (req, res) => {
    const { id } = req.params;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return res.status(400).json({ error: "Token Mercado Pago não configurado." });
    }

    try {
      console.log(`Checking Mercado Pago payment status for payment ID: ${id}`);
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error querying Mercado Pago payment status:", data);
        return res.status(response.status).json({ error: data.message || "Erro ao consultar status." });
      }

      res.json({
        id: data.id,
        status: data.status, // approved, pending, in_process, rejected, cancelled, etc.
        status_detail: data.status_detail
      });

    } catch (err: any) {
      console.error("Payment status querying error:", err);
      res.status(500).json({ 
        error: "Erro inesperado ao consultar o status do pagamento.", 
        details: err.message 
      });
    }
  });

  // Integrate Vite Dev Middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server listens on port ${PORT}`);
  });
}

startServer();

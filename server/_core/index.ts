import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { parse } from "cookie";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  addCartLine,
  createCart,
  getCart,
  getProducts,
  removeCartLine,
  updateCartLine,
} from "../shopify";

const CART_COOKIE = "bisu_shopify_cart";

function getCartId(req: express.Request) {
  return parse(req.headers.cookie ?? "")[CART_COOKIE];
}

function setCartId(req: express.Request, res: express.Response, cartId: string) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isHttps = forwardedProto === "https" || req.secure;
  const attributes = [
    `${CART_COOKIE}=${encodeURIComponent(cartId)}`,
    "Path=/",
    "HttpOnly",
    "Max-Age=2592000",
    isHttps ? "Secure" : "",
    isHttps ? "SameSite=None" : "SameSite=Lax",
    isHttps ? "Partitioned" : "",
  ].filter(Boolean);
  const value = attributes.join("; ");
  res.append("Set-Cookie", value);
}

function sendError(res: express.Response, error: unknown) {
  const message = error instanceof Error ? error.message : "The Shopify request failed.";
  res.status(502).json({ error: message });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });

  app.get("/api/shopify/products", async (_req, res) => {
    try {
      res.json({ products: await getProducts() });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/api/shopify/cart", async (req, res) => {
    const cartId = getCartId(req);
    if (!cartId) return res.json({ cart: null });
    try {
      res.json({ cart: await getCart(cartId) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/shopify/cart/lines", async (req, res) => {
    const variantId = typeof req.body?.variantId === "string" ? req.body.variantId : "";
    const quantity = Math.max(1, Math.min(25, Number(req.body?.quantity ?? 1)));
    if (!variantId || !Number.isInteger(quantity)) return res.status(400).json({ error: "A valid Shopify variant is required." });
    try {
      const existingCartId = getCartId(req);
      const cart = existingCartId
        ? await addCartLine(existingCartId, variantId, quantity)
        : await createCart(variantId, quantity);
      if (!cart) return res.status(502).json({ error: "Shopify did not return a cart." });
      setCartId(req, res, cart.id);
      res.json({ cart });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.put("/api/shopify/cart/lines", async (req, res) => {
    const cartId = getCartId(req);
    const lineId = typeof req.body?.lineId === "string" ? req.body.lineId : "";
    const quantity = Math.max(0, Math.min(25, Number(req.body?.quantity ?? 0)));
    if (!cartId || !lineId || !Number.isInteger(quantity)) return res.status(400).json({ error: "A valid cart line is required." });
    try {
      const cart = await updateCartLine(cartId, lineId, quantity);
      res.json({ cart });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.delete("/api/shopify/cart/lines/:lineId", async (req, res) => {
    const cartId = getCartId(req);
    if (!cartId) return res.json({ cart: null });
    try {
      const cart = await removeCartLine(cartId, req.params.lineId);
      res.json({ cart });
    } catch (error) {
      sendError(res, error);
    }
  });

  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });

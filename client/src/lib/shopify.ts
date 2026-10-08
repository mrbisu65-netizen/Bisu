export type CatalogProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  imageUrl: string | null;
  variantId: string | null;
  price: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    product: { title: string; handle: string };
  };
};

export type StorefrontCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: { nodes: CartLine[] };
};

export const safeCatalog: CatalogProduct[] = [
  {
    id: "gid://shopify/Product/15417431294083",
    title: "Instagram Views",
    handle: "instagram-views",
    description: "Legitimate visibility support for a post or campaign, with customer-provided target details.",
    productType: "Digital marketing service",
    imageUrl: null,
    variantId: "gid://shopify/ProductVariant/67715933339779",
    price: { amount: "60.00", currencyCode: "INR" },
    availableForSale: true,
  },
  {
    id: "gid://shopify/Product/15417431523459",
    title: "High-quality Instagram Likes",
    handle: "high-quality-instagram-likes",
    description: "High-quality engagement support for Instagram content. Share the target post details after payment.",
    productType: "Digital marketing service",
    imageUrl: null,
    variantId: "gid://shopify/ProductVariant/67715934683267",
    price: { amount: "35.00", currencyCode: "INR" },
    availableForSale: true,
  },
  {
    id: "gid://shopify/Product/15417431556227",
    title: "Website Creation",
    handle: "website-creation",
    description: "A focused website build for creators, small businesses, and digital brands.",
    productType: "Web creation service",
    imageUrl: null,
    variantId: "gid://shopify/ProductVariant/67715934716035",
    price: { amount: "899.00", currencyCode: "INR" },
    availableForSale: true,
  },
  {
    id: "gid://shopify/Product/15417431621763",
    title: "Mobile App Creation",
    handle: "mobile-app-creation",
    description: "A practical mobile app build with a clear scope, screens, and delivery plan.",
    productType: "App creation service",
    imageUrl: null,
    variantId: "gid://shopify/ProductVariant/67715934781571",
    price: { amount: "999.00", currencyCode: "INR" },
    availableForSale: true,
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "The storefront request failed.");
  return payload;
}

export async function loadProducts() {
  try {
    const payload = await request<{ products: CatalogProduct[] }>("/api/shopify/products");
    return payload.products.length ? payload.products : safeCatalog;
  } catch {
    return safeCatalog;
  }
}

export async function loadCart() {
  try {
    const payload = await request<{ cart: StorefrontCart | null }>("/api/shopify/cart");
    return payload.cart;
  } catch {
    return null;
  }
}

export async function addToCart(variantId: string, quantity = 1) {
  const payload = await request<{ cart: StorefrontCart }>("/api/shopify/cart/lines", {
    method: "POST",
    body: JSON.stringify({ variantId, quantity }),
  });
  return payload.cart;
}

export async function updateCartLine(lineId: string, quantity: number) {
  const payload = await request<{ cart: StorefrontCart }>("/api/shopify/cart/lines", {
    method: "PUT",
    body: JSON.stringify({ lineId, quantity }),
  });
  return payload.cart;
}

export async function removeCartLine(lineId: string) {
  const payload = await request<{ cart: StorefrontCart }>(`/api/shopify/cart/lines/${encodeURIComponent(lineId)}`, {
    method: "DELETE",
  });
  return payload.cart;
}

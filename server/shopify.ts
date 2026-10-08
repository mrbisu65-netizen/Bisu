type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  featuredImage: { url: string; altText: string | null } | null;
  variants: {
    nodes: Array<{
      id: string;
      title: string;
      price: ShopifyMoney;
      availableForSale: boolean;
    }>;
  };
};

type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: ShopifyMoney };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        price: ShopifyMoney;
        product: { title: string; handle: string };
      };
    }>;
  };
};

type ShopifyResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export type StorefrontProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  imageUrl: string | null;
  variantId: string | null;
  price: ShopifyMoney | null;
  availableForSale: boolean;
};

export type StorefrontCart = ShopifyCart;

function getShopifyConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) {
    throw new Error("Shopify storefront is not configured yet.");
  }
  return {
    endpoint: `https://${domain}/api/2025-10/graphql.json`,
    token,
  };
}

async function storefrontRequest<T>(query: string, variables?: Record<string, unknown>) {
  const { endpoint, token } = getShopifyConfig();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as ShopifyResponse<T>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.map(error => error.message).join("; ") || "Shopify request failed.");
  }
  return payload.data as T;
}

function assertUserErrors(errors: Array<{ message: string }> | undefined) {
  if (errors?.length) {
    throw new Error(errors.map(error => error.message).join("; "));
  }
}

export async function getProducts() {
  const data = await storefrontRequest<{ products: { nodes: ShopifyProductNode[] } }>(`
    query CatalogProducts {
      products(first: 50, query: "status:active") {
        nodes {
          id
          title
          handle
          description
          productType
          featuredImage { url altText }
          variants(first: 1) {
            nodes { id title price { amount currencyCode } availableForSale }
          }
        }
      }
    }
  `);

  return data.products.nodes.map((product): StorefrontProduct => {
    const variant = product.variants.nodes[0];
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      productType: product.productType,
      imageUrl: product.featuredImage?.url ?? null,
      variantId: variant?.id ?? null,
      price: variant?.price ?? null,
      availableForSale: variant?.availableForSale ?? false,
    };
  });
}

const cartFields = `
  id
  checkoutUrl
  totalQuantity
  cost { totalAmount { amount currencyCode } }
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          price { amount currencyCode }
          product { title handle }
        }
      }
    }
  }
`;

export async function getCart(cartId: string) {
  const data = await storefrontRequest<{ cart: ShopifyCart | null }>(
    `query Cart($id: ID!) { cart(id: $id) { ${cartFields} } }`,
    { id: cartId },
  );
  return data.cart;
}

export async function createCart(variantId: string, quantity: number) {
  const data = await storefrontRequest<{
    cartCreate: { cart: ShopifyCart | null; userErrors: Array<{ message: string }> };
  }>(
    `mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { ${cartFields} }
        userErrors { message }
      }
    }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );
  assertUserErrors(data.cartCreate.userErrors);
  return data.cartCreate.cart;
}

export async function addCartLine(cartId: string, variantId: string, quantity: number) {
  const data = await storefrontRequest<{
    cartLinesAdd: { cart: ShopifyCart | null; userErrors: Array<{ message: string }> };
  }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${cartFields} }
        userErrors { message }
      }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  );
  assertUserErrors(data.cartLinesAdd.userErrors);
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontRequest<{
    cartLinesUpdate: { cart: ShopifyCart | null; userErrors: Array<{ message: string }> };
  }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${cartFields} }
        userErrors { message }
      }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  assertUserErrors(data.cartLinesUpdate.userErrors);
  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(cartId: string, lineId: string) {
  const data = await storefrontRequest<{
    cartLinesRemove: { cart: ShopifyCart | null; userErrors: Array<{ message: string }> };
  }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${cartFields} }
        userErrors { message }
      }
    }`,
    { cartId, lineIds: [lineId] },
  );
  assertUserErrors(data.cartLinesRemove.userErrors);
  return data.cartLinesRemove.cart;
}

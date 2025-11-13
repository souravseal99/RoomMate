export const INVENTORY_EVENTS = {
  REFRESH_SHOPPING_CART: 'refreshShoppingCart',
} as const;

export const dispatchRefreshShoppingCart = () => {
  window.dispatchEvent(new CustomEvent(INVENTORY_EVENTS.REFRESH_SHOPPING_CART));
};

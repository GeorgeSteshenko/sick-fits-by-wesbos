export default function calcTotalPrice(cart) {
  return cart.reduce((tally, cartItem) => {
    if (!cartItem.product) return tally; // Items can be deleted, but could still be in a cart

    return tally + cartItem.quantity * cartItem.product.price;
  }, 0);
}

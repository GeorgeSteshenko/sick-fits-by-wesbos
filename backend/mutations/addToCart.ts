/* eslint-disable */
import { KeystoneContext } from '@keystone-next/types';
import { Session } from '../types';

import { CartItemCreateInput } from '../.keystone/schema-types';

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  // 1. Query user, check is signed in
  const seshn = context.session as Session;

  if (!seshn.itemId) {
    throw new Error('You must be logged in to do this');
  }
  // 2. Qry the current users cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: seshn.itemId }, product: { id: productId } },
    resolveFields: 'id, quantity',
  });
  const [existingCartItem] = allCartItems;
  // 3. See if item is in the cart
  // 4. If it is, increment by 1
  if (existingCartItem) {
    console.log(
      `There are already ${existingCartItem.quantity}, increment by 1!`
    );
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }
  // 5. If not, create a new cart itm
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: seshn.itemId } },
    },
  });
}

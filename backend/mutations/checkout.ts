/* eslint-disable */
import { KeystoneContext } from '@keystone-next/types';

import {
  CartItemCreateInput,
  OrderCreateInput,
} from '../.keystone/schema-types';
import stripeConfig from '../lib/stripe';
import { CartItem } from '../schemas/CartItem';

const graphql = String.raw;

interface Arguments {
  token: string;
}

export default async function checkout(
  root: any,
  { token }: Arguments,
  context: KeystoneContext
): Promise<OrderCreateInput> {
  // 1. Ensure user signed in
  const userId = context.session.itemId;

  if (!userId)
    throw new Error('Sorry, you must be signed in to create an order!');

  // 1.1 Query current user
  const user = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: graphql`
        id
        name
        email
        cart {
            id
            quantity
            product {
                name
                price
                description
                photo {
                    id
                    image {
                        id
                        publicUrlTransformed
                    }
                }
            }
        }
      `,
  });

  console.dir(user, { depth: null });

  // 2. Calc total price of the cart
  const cartItems = user.cart.filter((cartItem) => cartItem.product);
  const amount = cartItems.reduce(function (
    tally: number,
    cartItem: CartItemCreateInput
  ) {
    return tally + cartItem.quantity * cartItem.product.price;
  },
  0);

  console.log(amount);

  // 3. Create payment/charge with stripe

  const charge = await stripeConfig.paymentIntents
    .create({
      amount,
      currency: 'USD',
      confirm: true,
      payment_method: token,
    })
    .catch((err) => {
      console.log(err);
      throw Error(err.message);
    });

  console.log(charge);

  // 4. Convert the cart items into order items

  const orderItems = cartItems.map((cartItem) => {
    const orderItem = {
      name: cartItem.product.name,
      description: cartItem.product.description,
      quantity: cartItem.quantity,
      photo: { connect: { id: cartItem.product.photo.id } },
    };

    return orderItem;
  });
  // 5. Create order and return it
  const order = await context.lists.Order.createOne({
    data: {
      total: charge.amount,
      charge: charge.id,
      items: { create: orderItems },
      user: { connect: { id: userId } },
    },
  });
  // 6. Clear old cart items
  const cartItemIds = user.cart.map((cartItem) => cartItem.id);

  await context.lists.CartItem.deleteMany({
    ids: cartItemIds,
  });

  return order;
}

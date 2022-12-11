import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs) {
  // if session === undefined it'll return false, because !!undefined === false, ortherwise true
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

export const permissions = {
  ...generatedPermissions,
  // Add custom permission that is not in a list
  isAwesome({ session }: ListAccessArgs) {
    return session?.data.name.includes('Yegor');
  },
};

// Rules based function
// Returns bool true/false, or a filter which limits which products user can CRUD
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;

    // Do user have the perm of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // If not, is user an owner?
    return { user: { id: session.itemId } };
  },
  canOrder({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;

    // Do user have the perm of canOrder
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // If not, is user an owner?
    return { user: { id: session.itemId } };
  },
  canManageOrderItems({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;

    // Do user have the perm of canManageOrderItems
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // If not, is user an owner?
    return { order: { user: { id: session.itemId } } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;

    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // Should only see avaliable prods based on status field
    return { status: 'AVALIABLE' };
  },
};

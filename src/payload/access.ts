import type { Access } from "payload";

export const anyone: Access = () => true;

export const authenticated: Access = ({ req }) => Boolean(req.user);

// Public reads see only visible documents; editors see everything.
export const visibleOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true;
  return { visible: { equals: true } };
};

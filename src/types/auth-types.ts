type Role = {
  __typename: string;
  id: number;
  key: string;
  label: string;
};

type Organization = {
  __typename: string;
  id: number;
  logo: string;
  name: string;
  address1: string;
  telephone: string;
  email: string;
};

type Product = {
  __typename: string;
  id: number;
  slug: string;
  name: string;
};

type Operations = {
  [key: string]: boolean;
};

export type UserAccount = {
  __typename: string;
  id: number;
  avatar: string | null;
  fullname: string;
  firstname: string;
  lastname: string;
  phone: string;
  username: string;
  email: string;
  signature: string;
  Roles: Role[];
  Organization: Organization;
  Product: string;
  operations: Operations;
};

type LoginCredential = {
  __typename: string;
  identifier: string;
  orgId: number;
  phone: string;
  productSlug: string;
  userId: number;
};

type Auth = {
  currentUser: UserAccount;
  credential: LoginCredential;
  avatar: string | null;
  pending: boolean;
};

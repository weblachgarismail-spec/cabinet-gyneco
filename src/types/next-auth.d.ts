import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      displayName: string | null;
      themeColor: string | null;
    };
  }

  interface User {
    role: string;
    displayName: string | null;
    themeColor: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    displayName: string | null;
    themeColor: string | null;
  }
}

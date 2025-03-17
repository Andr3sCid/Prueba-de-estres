export interface IMinimalistJwtPayload {
    aud?: string;
    context?: any; // Cambia `any` por el tipo correcto si sabes la estructura exacta.
    exp?: string;
    iss?: string;
    nbf?: string;
    sub?: string;
  }

export interface IJwtHeader {
    kid?: string;
  }

export interface IJwtPayload {
    context?: {
      callee?: string;
      features?: Record<string, any>;
      group?: string;
      server?: string;
      tenant?: string;
      user?: {
        role?: string;
      };
    };
    email?: string;
    iss?: string;
    name?: string;
    picture?: string;
    sub?: string;
  }

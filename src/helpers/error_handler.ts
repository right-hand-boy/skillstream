import { GraphQLError } from "graphql";

export class InsternalServerError {
  constructor(message?: string) {
    throw new GraphQLError(message || "Internal Server Error", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: { status: 500 },
      },
    });
  }
}

export class SyntaxError {
  constructor(message: string) {
    throw new GraphQLError(message, {
      extensions: {
        code: "GRAPHQL_PARSE_FAILED",
        http: { status: 401 },
      },
    });
  }
}

export class ConflictError {
  constructor(message: string, extensions?: Record<string, any>) {
    throw new GraphQLError(message, {
      extensions: {
        code: "CONFLICT",
        http: { status: 409 },
        ...extensions,
      },
    });
  }
}
export class BadRequestError {
  constructor(message: string, extensions?: Record<string, any>) {
    throw new GraphQLError(message, {
      extensions: {
        code: "BAD_REQUEST",
        http: { status: 400 },
        ...extensions,
      },
    });
  }
}

export class AuthenticationError {
  constructor(message: string, extensions?: Record<string, any>) {
    throw new GraphQLError(message, {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
        ...extensions,
      },
    });
  }
}
export class AuthorizationError {
  constructor(message: string, extensions?: Record<string, any>) {
    throw new GraphQLError(message, {
      extensions: {
        code: "UNAUTHORIZED",
        http: { status: 400 },
        ...extensions,
      },
    });
  }
}

// export class ValidationError {
//   constructor(message: string) {
//     super(message, "GRAPHQL_VALIDATION_FAILED");

//     Object.defineProperty(this, "name", { value: "ValidationError" });
//   }
// }

// export class ForbiddenError {
//   constructor(message: string, extensions?: Record<string, any>) {
//     super(message, "FORBIDDEN", extensions);

//     Object.defineProperty(this, "name", { value: "ForbiddenError" });
//   }
// }

// export class PersistedQueryNotFoundError {
//   constructor() {
//     super("PersistedQueryNotFound", "PERSISTED_QUERY_NOT_FOUND");

//     Object.defineProperty(this, "name", {
//       value: "PersistedQueryNotFoundError",
//     });
//   }
// }

// export class PersistedQueryNotSupportedError {
//   constructor() {
//     super("PersistedQueryNotSupported", "PERSISTED_QUERY_NOT_SUPPORTED");

//     Object.defineProperty(this, "name", {
//       value: "PersistedQueryNotSupportedError",
//     });
//   }
// }

// export class UserInputError {
//   constructor(message: string, extensions?: Record<string, any>) {
//     super(message, "BAD_USER_INPUT", extensions);

//     Object.defineProperty(this, "name", { value: "UserInputError" });
//   }
// }

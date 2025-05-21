import { json } from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import http from "http";
import { Secret } from "jsonwebtoken";

import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { configDotenv } from "dotenv";
import type { CorsOptionsDelegate } from "cors";
import { Request, Response } from "express";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { CustomJwtPayload } from "./middleware/auth";
import gatewaySchema from "./resolvers";
import { UserAccount } from "./types/auth-types";
import sequelize from "./utils/db.connection";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import { CorsOptions } from "cors";
import Contract from "./models/contract.model";
import Payment from "./models/payment.model";
import { Transaction } from "sequelize";
import UserBalance from "./models/user_balance.model";
import { checkPaymentStatus } from "./services/services";
import userBalanceResolver from "./resolvers/userBalance";
import Token from "./models/token.model";
import User from "./models/user.model";
import { log } from "console";

configDotenv();
const app = express();
const httpServer = http.createServer(app);

export interface MyContext {
  req: Request;
  res: Response;
  token?: string;
  user: UserAccount | null;
  pubsub: PubSub;
}

const corsOptions: CorsOptionsDelegate = (origin, callback) => {
  const allowedOrigins = [
    "https://skillstream-959dd.web.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};

app.use(cors(corsOptions));


const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/subscription",
});

const getDynamicContext = async (ctx: any) => {
  const token = ctx.connectionParams?.authorization?.split(" ")[1];
  const user = authentication(token);
  return user;
};

const pubsub = new PubSub();
const serverCleanup = useServer(
  {
    schema: gatewaySchema,
    context: async (ctx, msg, args) => {
      const user = await getDynamicContext(ctx);
      return { ctx, msg, args, pubsub, user };
    },
  },
  wsServer
);

(async () => {
  const server = new ApolloServer<MyContext>({
    schema: gatewaySchema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    introspection: true,
  });

  await server.start();

  app.use(
    "/graphql",
    [
      cors(corsOptions),
      cookieParser(),
      json({ limit: "50mb" }),
    ],
    expressMiddleware(server, {
      context: async ({ req, res }: { req: Request; res: Response }) => {
        const token = req.headers.authorization?.split(" ")[1];
        let user = null;

        // Skip authentication for certain operations
        if (
          req.body.operationName === "IntrospectionQuery" ||
          req.body.operationName === "CreateUser" ||
          req.body.operationName === "LoginUser" ||
          req.body.operationName === "RequestResetPassword" ||
          req.body.operationName === "ResetPassword" ||
          req.body.operationName === "CreateAdminFeedback"
        ) {
          return { req, res, user, pubsub };
        }

        // Authenticate the user if a token is provided
        if (token) {
          user = authentication(token);
        }

        return { req, res, user, pubsub };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
  );

  console.log(
    `\n🚀  Server ready at http://localhost:${process.env.PORT || 4000}/graphql`
  );

  // Synchronize Sequelize models with the database
  sequelize
    .sync({ alter: true }) // Use `alter: true` to update tables without dropping them
    .then(() => {
      console.log("Database synchronized!");
    })
    .catch((error) => {
      console.error("Error synchronizing database:", error);
    });
})();

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
  });
});

function authentication(token: string | undefined): UserAccount | null {
  const secret = process.env.JWT_SECRET as Secret;

  if (!token) {
    return null; // Return null if no token is provided
  }

  try {
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;
    const user = decoded.user;

    if (!user) {
      throw new GraphQLError("Invalid Token or User is not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
          http: { status: 401 },
        },
      });
    }

    return user;
  } catch (error) {
    throw new GraphQLError("Invalid Token or User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }
}

app.get("/api/verify-payment/:id", async (req, res) => {
  let t: Transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
  });
  const contract = await Contract.update(
    { status: "Funded" },
    { where: { id: req.params.id } }
  ).then(
    async () =>
      await Contract.findOne({
        where: {
          id: req.params.id,
        },
        include: [Payment],
      })
  );
  console.log({ contract });

  try {
    const pay = contract?.payment?.dataValues;
    if (!pay) {
      throw new Error("payment not found1");
    }
    console.log({ pay });
    const payment = await Payment.update(
      {
        status: "Funded",
      },
      {
        where: {
          id: pay?.id,
        },
      }
    ).then(async () => await Payment.findByPk(pay?.id));

    if (!payment) {
      throw new Error(`Payment not found2`);
    }
    if (!contract) {
      throw new Error(`contract not found`);
    }

    await UserBalance.update(
      {
        balance: sequelize.literal(
          `balance - ${payment.amount + payment.amount * 0.03}`
        ),
      },
      {
        where: { user_id: payment?.employer_id },

        transaction: t,
      }
    );
    try {
      const status = await checkPaymentStatus(payment.tx_ref);
      await t.commit();
      console.log("Payment was successfully verified");
      return status.data.data.status;
    } catch (error) {
      await t.rollback();
      console.log("Payment can't be verified", error);
    }
  } catch (error) {
    if (t) {
      await t.rollback();
    }
    throw new Error(`${error}`);
  }
});

app.get("/api/verify-deposit/:id/:tx_ref", async (req, res) => {
  const response = await checkPaymentStatus(req.params.tx_ref);
  if (response.data.data.status == "success") {
    console.log(response.data);
    return userBalanceResolver.Mutation.verifyDeposit(
      req.params.id,
      response.data.data.amount
    );
  }
});

app.get("/api/payment-success", async (req, res) => {
  console.log("payment succeeded !");
});

app.get("/api/verify", async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };
    const verificationToken = await Token.findOne({ where: { token } });

    if (!verificationToken || verificationToken.expiryDate < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const user = await User.findByPk(verificationToken.userId);
    if (user) {
      user.is_verified = true;
      await user.save();
    }

    await verificationToken.destroy();

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ error });
  }
});

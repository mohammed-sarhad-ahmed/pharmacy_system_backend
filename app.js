import express from "express";
import { config } from "dotenv";

const app = express();

if (process.env.NODE_ENV === "dev") {
  config({
    path: "./dev.env"
  });
} else {
  config({
    path: "./prod.env"
  });
}

export default app;

import { Router } from "express";
import {
  stkPushHandler,
  stkCallbackHandler,
  b2cHandler,
  b2cCallbackHandler,
  listTransactionsHandler,
} from "../controllers/mpesaController.js";

const router = Router();

router.post("/stkpush", stkPushHandler);
router.post("/stk-callback", stkCallbackHandler);

router.post("/b2c", b2cHandler);
router.post("/b2c-callback", b2cCallbackHandler);

router.get("/transactions", listTransactionsHandler);

export default router;


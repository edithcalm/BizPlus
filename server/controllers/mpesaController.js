import { initiateStkPush, initiateB2CPayment, initiateB2BPayment } from "../services/mpesaService.js";
import { addTransaction, getTransactions } from "../services/dbService.js";

export async function stkPushHandler(req, res) {
  try {
    const { phone, amount } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ error: "phone and amount are required" });
    }

    const resp = await initiateStkPush({ phone, amount });
    return res.json({ status: "pending", data: resp });
  } catch (err) {
    const apiError = err?.response?.data;
    console.error("STK error", apiError || err.message);
    const message =
      apiError?.errorMessage ||
      apiError?.error ||
      apiError?.fault?.faultstring ||
      err.message ||
      "STK push failed";
    return res.status(500).json({ error: message });
  }
}

export async function stkCallbackHandler(req, res) {
  try {
    const callback = req.body.Body?.stkCallback;
    if (!callback) {
      return res.status(400).json({ error: "Invalid callback" });
    }

    const resultCode = callback.ResultCode;
    const meta = callback.CallbackMetadata?.Item || [];

    const getItem = (name) => meta.find((x) => x.Name === name)?.Value;

    const amount = getItem("Amount");
    const mpesaReceipt = getItem("MpesaReceiptNumber");
    const phone = getItem("PhoneNumber");

    addTransaction({
      type: "income",
      status: resultCode === 0 ? "success" : "failed",
      amount: Number(amount || 0),
      phone: phone || "",
      reference: mpesaReceipt || "",
      source: "STK Push",
      createdAt: new Date().toISOString(),
    });

    res.json({ received: true });
  } catch (err) {
    console.error("STK callback error", err);
    res.status(500).json({ error: "Callback error" });
  }
}

export async function b2cHandler(req, res) {
  try {
    const { phone, amount, remarks } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ error: "phone and amount are required" });
    }

    const resp = await initiateB2CPayment({ phone, amount, remarks });
    return res.json({ status: "pending", data: resp });
  } catch (err) {
    const apiError = err?.response?.data;
    console.error("B2C error", apiError || err.message);
    const message =
      apiError?.errorMessage ||
      apiError?.error ||
      apiError?.fault?.faultstring ||
      err.message ||
      "B2C payment failed";
    return res.status(500).json({ error: message });
  }
}

export async function b2cCallbackHandler(req, res) {
  try {
    const result = req.body.Result || {};
    const params = result.ResultParameters?.ResultParameter || [];

    const getParam = (name) => params.find((x) => x.Key === name)?.Value;

    const amount = getParam("TransactionAmount");
    const phone = getParam("ReceiverPartyPublicName") || "";
    const transId = getParam("TransactionReceipt");

    addTransaction({
      type: "expense",
      status: result.ResultCode === 0 ? "success" : "failed",
      amount: Number(amount || 0),
      phone,
      reference: transId || "",
      source: "B2C Payment",
      createdAt: new Date().toISOString(),
    });

    res.json({ received: true });
  } catch (err) {
    console.error("B2C callback error", err);
    res.status(500).json({ error: "Callback error" });
  }
}

export async function b2bHandler(req, res) {
  try {
    const { businessNumber, amount, remarks, channel } = req.body;
    if (!businessNumber || !amount) {
      return res.status(400).json({ error: "businessNumber and amount are required" });
    }

    const resp = await initiateB2BPayment({ businessNumber, amount, remarks, channel });
    return res.json({ status: "pending", data: resp });
  } catch (err) {
    const apiError = err?.response?.data;
    console.error("B2B error", apiError || err.message);
    const message =
      apiError?.errorMessage ||
      apiError?.error ||
      apiError?.fault?.faultstring ||
      err.message ||
      "B2B payment failed";
    return res.status(500).json({ error: message });
  }
}

export function listTransactionsHandler(_req, res) {
  const txs = getTransactions();
  res.json({ transactions: txs });
}


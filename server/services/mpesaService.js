import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_BASE_URL,
  MPESA_INITIATOR_NAME,
  MPESA_SECURITY_CREDENTIAL,
  MPESA_STK_CALLBACK_URL,
  MPESA_B2C_CALLBACK_URL,
} = process.env;

export async function getMpesaAccessToken() {
  const url = `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const { data } = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  return data.access_token;
}

function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
}

function getStkPassword(timestamp) {
  const str = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(str).toString("base64");
}

export async function initiateStkPush({ phone, amount }) {
  const token = await getMpesaAccessToken();
  const timestamp = getTimestamp();
  const password = getStkPassword(timestamp);

  const url = `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`;

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Number(amount),
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: MPESA_STK_CALLBACK_URL,
    AccountReference: "BizPlus",
    TransactionDesc: "BizPlus STK payment",
  };

  const { data } = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
}

export async function initiateB2CPayment({ phone, amount, remarks }) {
  const token = await getMpesaAccessToken();

  const url = `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`;

  const payload = {
    InitiatorName: MPESA_INITIATOR_NAME,
    SecurityCredential: MPESA_SECURITY_CREDENTIAL,
    CommandID: "BusinessPayment",
    Amount: Number(amount),
    PartyA: MPESA_SHORTCODE,
    PartyB: phone,
    Remarks: remarks || "BizPlus B2C payment",
    QueueTimeOutURL: MPESA_B2C_CALLBACK_URL,
    ResultURL: MPESA_B2C_CALLBACK_URL,
    Occasion: "BizPlus",
  };

  const { data } = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
}

export async function initiateB2BPayment({
  businessNumber,
  amount,
  remarks,
  channel,
}) {
  const token = await getMpesaAccessToken();

  const url = `${MPESA_BASE_URL}/mpesa/b2b/v1/paymentrequest`;

  const payload = {
    Initiator: MPESA_INITIATOR_NAME,
    SecurityCredential: MPESA_SECURITY_CREDENTIAL,
    CommandID: "BusinessPayBill", // generic business payment
    SenderIdentifierType: 4, // shortcode
    RecieverIdentifierType: 4,
    Amount: Number(amount),
    PartyA: MPESA_SHORTCODE,
    PartyB: businessNumber,
    Remarks: remarks || `BizPlus B2B (${channel})`,
    QueueTimeOutURL: MPESA_B2C_CALLBACK_URL,
    ResultURL: MPESA_B2C_CALLBACK_URL,
    AccountReference: "BizPlus B2B",
  };

  const { data } = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
}


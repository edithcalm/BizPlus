import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../data/transactions.json");

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    return { transactions: [] };
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw || '{"transactions": []}');
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function addTransaction(tx) {
  const db = readDb();
  db.transactions.unshift({
    id: `TX-${Date.now()}`,
    ...tx,
  });
  writeDb(db);
}

export function getTransactions() {
  return readDb().transactions;
}


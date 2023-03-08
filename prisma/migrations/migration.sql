CREATE TABLE "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
   "zip" TEXT NOT NULL,
   "billing_name"    TEXT NOT NULL,
  "billing_address" TEXT NOT NULL,
  "billing_city"    TEXT NOT NULL,
  "billing_state"   TEXT NOT NULL,
  "billing_zip"    TEXT NOT NULL,
  "work_phone"      TEXT NOT NULL,
  "home_phone"     TEXT NOT NULL,
  "mobile_phone"    TEXT NOT NULL,
  
);
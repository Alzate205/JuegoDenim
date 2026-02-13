-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "totalWeeks" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIGURANDO'
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "rawMaterialInventory" INTEGER NOT NULL,
    "finishedGoodsInventory" INTEGER NOT NULL,
    CONSTRAINT "InventoryState_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "createdWeek" INTEGER NOT NULL,
    "dueWeek" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "deliveredQuantity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    CONSTRAINT "CustomerOrder_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "requestedWeek" INTEGER NOT NULL,
    "estimatedWeek" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalCost" REAL NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "PurchaseOrder_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "cash" REAL NOT NULL,
    "totalDebt" REAL NOT NULL,
    "interestsPaid" REAL NOT NULL,
    "weeklyProfit" REAL NOT NULL,
    "accumulatedProfit" REAL NOT NULL,
    CONSTRAINT "FinancialState_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "startWeek" INTEGER NOT NULL,
    "endWeek" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effectsJson" TEXT NOT NULL,
    CONSTRAINT "GameEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "dataJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Decision_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Decision_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_code_key" ON "Game"("code");

-- CreateIndex
CREATE INDEX "Player_gameId_idx" ON "Player"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryState_gameId_week_key" ON "InventoryState"("gameId", "week");

-- CreateIndex
CREATE INDEX "CustomerOrder_gameId_idx" ON "CustomerOrder"("gameId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_gameId_idx" ON "PurchaseOrder"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialState_gameId_week_key" ON "FinancialState"("gameId", "week");

-- CreateIndex
CREATE INDEX "GameEvent_gameId_idx" ON "GameEvent"("gameId");

-- CreateIndex
CREATE INDEX "Decision_gameId_week_idx" ON "Decision"("gameId", "week");

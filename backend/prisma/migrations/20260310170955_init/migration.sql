-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "numeroJugadores" INTEGER NOT NULL,
    "edadMinima" INTEGER NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descripcion" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "games_nombre_idx" ON "games"("nombre");

-- CreateIndex
CREATE INDEX "games_tipo_idx" ON "games"("tipo");

-- CreateIndex
CREATE INDEX "games_disponible_idx" ON "games"("disponible");

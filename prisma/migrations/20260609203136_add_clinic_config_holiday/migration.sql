-- CreateTable
CREATE TABLE "ClinicConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "workStartAM" INTEGER NOT NULL DEFAULT 9,
    "workEndAM" INTEGER NOT NULL DEFAULT 13,
    "workStartPM" INTEGER NOT NULL DEFAULT 15,
    "workEndPM" INTEGER NOT NULL DEFAULT 19,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "ClinicConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "label" TEXT,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

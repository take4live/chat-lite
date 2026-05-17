-- CreateTable
CREATE TABLE "message_comments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "message_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_comments_messageId_createdAt_idx" ON "message_comments"("messageId", "createdAt");

-- AddForeignKey
ALTER TABLE "message_comments" ADD CONSTRAINT "message_comments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_comments" ADD CONSTRAINT "message_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

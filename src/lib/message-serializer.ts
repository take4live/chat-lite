type AuthorRow = { id: string; name: string; email: string | null };

type CommentRow = {
  id: string;
  body: string;
  createdAt: Date;
  author: AuthorRow;
};

type MessageRow = {
  id: string;
  body: string;
  createdAt: Date;
  author: AuthorRow;
  comments: CommentRow[];
};

export function serializeMessage(m: MessageRow) {
  return {
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    author: { id: m.author.id, name: m.author.name, email: m.author.email },
    comments: m.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      author: { id: c.author.id, name: c.author.name, email: c.author.email },
    })),
  };
}

export const messageWithCommentsInclude = {
  author: { select: { id: true, name: true, email: true } },
  comments: {
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" as const },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  },
} as const;

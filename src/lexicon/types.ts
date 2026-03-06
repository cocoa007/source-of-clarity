export const LEXICON_COMMENT = "com.source-of-clarity.temp.comment";
export const LEXICON_REACTION = "com.source-of-clarity.temp.reaction";

export interface CommentRecord {
  subject: { principal: string; name: string; txId?: string };
  text: string;
  lineNumber?: number;
  lineRange?: { start: number; end: number };
  replyRef?: {
    root: { uri: string; cid: string };
    parent: { uri: string; cid: string };
  };
  createdAt: string;
}

export interface ReactionRecord {
  subject: { uri: string; cid: string };
  emoji: string;
  createdAt: string;
}

export interface Comment extends CommentRecord {
  uri: string;
  cid: string;
  authorDid: string;
  authorHandle?: string;
  reactions: Record<string, number>;
  userReaction?: string;
  replyCount: number;
}

export const ALLOWED_REACTIONS = [
  "\u{1F44D}",
  "\u{2764}\u{FE0F}",
  "\u{1F525}",
  "\u{1F440}",
  "\u{1F680}",
  "\u{26A0}\u{FE0F}",
];

export type PasteDoc = {
  _id: string;
  content: string;
  expiresAt: Date | null;
  maxViews: number | null;
  views: number;
};

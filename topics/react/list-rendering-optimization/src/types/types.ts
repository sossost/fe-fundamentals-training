export type ItemData = {
  id: string;
  title: string;
  likeCount: number;
  likedUsers: string[];
};

export type ItemsNormalized = {
  ids: string[];
  byId: Record<string, ItemData>;
};

declare namespace Steam {
  interface WishlistEntrySub {
    id: number;
    discount_block: string;
    discount_pct: number;
    price: number;
  }

  interface WishlistEntry {
    name: string;
    capsule: string;
    review_score: number;
    review_desc: string;
    reviews_total: string;
    reviews_percent: number;
    release_date: string;
    release_string: string;
    platform_icons: string;
    subs: WishlistEntrySub[];
    type: string;
    screenshots: string[];
    review_css: string;
    priority: number;
    added: number;
    background: string;
    rank: number;
    tags: string[];
    is_free_game: boolean;
    early_access: number;
    mac: number;
    win: number;
  }

  type WishlistData = Record<string, WishlistEntry>;
}

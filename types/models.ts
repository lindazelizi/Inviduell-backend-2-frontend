export type Property = {
  id: string;
  title: string;
  description?: string | null;
  location: string | null;
  price_per_night: number;
  is_active: boolean;
  owner_id?: string;
  created_at?: string;

  // nya fält
  main_image_url?: string | null;
  image_urls?: string[] | null;
};

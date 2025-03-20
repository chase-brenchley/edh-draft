export interface Card {
  id: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  mana_cost: string;
  cmc: number;
  colors: string[];
  color_identity: string[];
  type_line: string;
  oracle_text: string;
  rarity: string;
  set: string;
  set_name: string;
  collector_number: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  is_commander: boolean;
  is_land: boolean;
  is_basic_land: boolean;
  legalities: {
    [key: string]: string;
  };
  prices: {
    [key: string]: string | null;
  };
  edhrec_rank?: number;
} 
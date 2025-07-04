export interface ContentImage {
  _id: string;
  title: string;
  description: string;
  button_name: string;
  button_route: string;
  images: {
    url: string;
  }[];
  images_mobile: {
    url: string;
  }[];
}
export interface ContentType {
  page_title: {
    en: string;
    id: string;
  };
  _id: string;
  meta_title: {
    en: string;
    id: string;
  };
  meta_description: {
    en: string;
    id: string;
  };
  type: number;
  slug: string;
  small_text: {
    en: string;
    id: string;
  };
  small_text2: {
    en: string;
    id: string;
  };
  title: {
    en: string;
    id: string;
  };
  sub_title1: {
    en: string;
    id: string;
  };
  sub_title2: {
    en: string;
    id: string;
  };
  sub_title3: {
    en: string;
    id: string;
  };
  description: {
    en: string;
    id: string;
  };
  banner:
    | {
        id: ContentImage;
        en: ContentImage;
      }[]
    | [];
  use_list: false;
  show_on_homepage: false;
  publish_date: string;
  category_id: {
    _id: string;
    slug: string;
    name: {
      en: string;
      id: string;
    };
  };
  body: {
    type: number;
    title: {
      en: string;
      id: string;
    };
    text: {
      en: string;
      id: string;
    };
    image_size: number;
    top: number;
    left: number;
    button_name: {
      en: string;
      id: string;
    };
    button_route: string;
    images:
      | {
          en: ContentImage;
          id: ContentImage;
        }[]
      | [];
    _id: string;
  }[];
  body2: {
    title: {
      en: string;
      id: string;
    };
    text: {
      en: string;
      id: string;
    };
    _id: string;
  }[];
  bottom_text: {
    en: string;
    id: string;
  };
  bottom_button_name: {
    en: string;
    id: string;
  };
  bottom_description2: {
    en: string;
    id: string;
  };
  bottom_text2: {
    en: string;
    id: string;
  };
  bottom_button_route: string;
  active_status: boolean;
  total_view: number;
  order: number;
  images:
    | {
        id: ContentImage;
        en: ContentImage;
      }[]
    | [];
  images2:
    | {
        id: ContentImage;
        en: ContentImage;
      }[]
    | [];
  thumbnail_images:
    | {
        id: ContentImage;
        en: ContentImage;
      }[]
    | [];
  thumbnail_images2:
    | {
        id: ContentImage;
        en: ContentImage;
      }[]
    | [];
  // Sustainability Commitment Fields
  sustainability_commitment_title?: {
    en: string;
    id: string;
  };
  sustainability_commitment_ceo_name?: {
    en: string;
    id: string;
  };
  sustainability_commitment_ceo_position?: {
    en: string;
    id: string;
  };
  sustainability_commitment_ceo_image?:
    | {
        id: ContentImage;
        en: ContentImage;
      }[]
    | [];
  sustainability_commitment_ceo_quote?: {
    en: string;
    id: string;
  };
  jam_kerja: string;
  related: ContentType[] | [];
  related2: [];
  category: number;
  organization_id: string;
  created_at: string;
  created_by: string;
}

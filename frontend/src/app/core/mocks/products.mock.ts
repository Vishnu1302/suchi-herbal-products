import { Product } from "../models/product.model";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Brahmi Hair Oil",
    slug: "brahmi-hair-oil",
    description:
      "Cold-pressed Brahmi oil infused with neem and amla extracts. Promotes hair growth and nourishes the scalp.",
    ingredients: "Brahmi extract, Neem, Amla, Coconut oil base",
    usage: "Apply to scalp, massage gently, leave 30 mins before washing",
    benefits: "Hair growth, dandruff control, scalp nourishment",
    price: 249,
    images: [
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600",
    ],
    category: "oil",
    inStock: true,
    stockCount: 85,
    originalPrice: 299,
  },
  {
    id: "prod-002",
    name: "Eucalyptus Essential Oil",
    slug: "eucalyptus-essential-oil",
    description:
      "Pure steam-distilled Eucalyptus oil. Ideal for aromatherapy and cold relief.",
    ingredients: "100% Eucalyptus globulus essential oil",
    usage: "Diffuse 5-7 drops or dilute in carrier oil for topical use",
    benefits: "Respiratory support, mental clarity, antimicrobial",
    price: 399,
    images: [
      "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600",
    ],
    category: "oil",
    inStock: true,
    stockCount: 45,
  },
  {
    id: "prod-003",
    name: "Neem & Tulsi Herbal Shampoo",
    slug: "neem-tulsi-herbal-shampoo",
    description:
      "Gentle sulphate-free shampoo enriched with neem and tulsi extracts for a clean, healthy scalp.",
    ingredients: "Neem leaf extract, Tulsi extract, Bhringraj, Aloe vera",
    usage:
      "Massage into wet hair, lather, rinse thoroughly. Use 2-3 times a week.",
    benefits: "Reduces dandruff, strengthens hair, controls scalp oil",
    price: 299,
    images: [
      "https://images.unsplash.com/photo-1585232351009-188b47a5d29e?w=600",
    ],
    category: "shampoo",
    inStock: true,
    stockCount: 120,
  },
  {
    id: "prod-004",
    name: "Reetha Amla Shampoo",
    slug: "reetha-amla-shampoo",
    description:
      "Traditional Ayurvedic soapnut and amla blend that cleanses gently and adds natural shine.",
    ingredients: "Reetha (Soapnut) extract, Amla, Shikakai, Methi",
    usage: "Apply to wet hair, lather well, rinse. Follow with conditioner.",
    benefits: "Natural shine, frizz control, strengthens roots",
    price: 249,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
    ],
    category: "shampoo",
    inStock: true,
    stockCount: 90,
  },
  {
    id: "prod-005",
    name: "Kumkumadi Face Cream",
    slug: "kumkumadi-face-cream",
    description:
      "Luxury saffron-infused face cream inspired by the classical Kumkumadi tailam for radiant skin.",
    ingredients: "Saffron, Sandalwood, Lotus extract, Shea butter",
    usage: "Apply a small amount on cleansed face morning and evening.",
    benefits: "Brightening, anti-aging, deep moisturisation",
    price: 499,
    images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600"],
    category: "cream",
    inStock: true,
    stockCount: 60,
    originalPrice: 999,
  },
  {
    id: "prod-006",
    name: "Ashwagandha Night Cream",
    slug: "ashwagandha-night-cream",
    description:
      "Restorative overnight cream with ashwagandha and manjistha for skin renewal while you sleep.",
    ingredients: "Ashwagandha root extract, Manjistha, Almond oil, Beeswax",
    usage: "Apply generously to face and neck before bed.",
    benefits: "Skin renewal, reduces dark circles, anti-stress",
    price: 449,
    images: [
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600",
    ],
    category: "cream",
    inStock: false,
    stockCount: 0,
    originalPrice: 549,
  },
  {
    id: "prod-007",
    name: "Kumkumadi Glow Serum",
    slug: "kumkumadi-glow-serum",
    description:
      "Lightweight serum with saffron and sandalwood to brighten and even skin tone.",
    ingredients: "Saffron, Sandalwood oil, Rosehip, Vitamin C",
    usage: "Apply 3–4 drops on cleansed face, pat gently until absorbed.",
    benefits: "Brightening, anti-aging, even skin tone",
    price: 399,
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600",
    ],
    category: "serum",
    inStock: true,
    stockCount: 150,
  },
  {
    id: "prod-008",
    name: "Chandan Turmeric Soap",
    slug: "chandan-turmeric-soap",
    description:
      "Handcrafted cold-process soap with sandalwood and turmeric for deep cleansing and glow.",
    ingredients: "Sandalwood powder, Turmeric, Coconut oil, Rose water",
    usage: "Lather and apply on wet skin, rinse well.",
    benefits: "Deep cleansing, skin brightening, gentle exfoliation",
    price: 149,
    images: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600",
    ],
    category: "soap",
    inStock: true,
    stockCount: 200,
    originalPrice: 199,
  },
];

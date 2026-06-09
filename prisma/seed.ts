import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { slugify } from '../src/common/utils/slugify';

function createPrisma() {
  const url = process.env['DATABASE_URL'] ?? 'file:./prisma/database.sqlite';
  const filePath = url.replace(/^file:/, '');
  const absolutePath = path.resolve(filePath);
  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  return new PrismaClient({ adapter } as any);
}

const prisma = createPrisma();

// ---------------------------------------------------------------------------
// Small helpers (Math.random is fine here — this is a one-off seed script).
// ---------------------------------------------------------------------------
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const round = (n: number) => Math.round(n);

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categories = [
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Watches', slug: 'watches' },
  { name: 'Hats', slug: 'hats' },
  { name: 'Mobiles', slug: 'mobiles' },
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Shoes', slug: 'shoes' },
];

// ---------------------------------------------------------------------------
// Per-category bases. Each base is expanded into one product per variant,
// so productCount = bases * variants (currently 5 * 3 = 15 per category).
// ---------------------------------------------------------------------------
type Base = {
  brand: string;
  model: string;
  basePrice: number;
  features: string[];
  // Optional override for the image search keyword (used in mixed
  // categories like Accessories where each base is a different kind of item).
  imageKeyword?: string;
};

type CategoryConfig = {
  slug: string;
  noun: string;
  variants: string[];
  // Keyword used to fetch a matching real photo from LoremFlickr.
  keyword: string;
  bases: Base[];
};

const featurePools: Record<string, string[]> = {
  headphones: [
    'Industry leading active noise cancellation.',
    'Up to 30 hours battery life.',
    'Crystal clear hands-free calling.',
    'Hi-Res audio certified.',
    'Multipoint Bluetooth connection.',
    'Fast charging: 5 hours from a 3 minute charge.',
  ],
  watches: [
    'Always-On Retina display.',
    'Heart rate and blood oxygen monitoring.',
    'Crash and fall detection.',
    'Water resistant up to 50m.',
    'Up to 18 hours battery life.',
    'Built-in GPS tracking.',
  ],
  hats: [
    'Breathable lightweight fabric.',
    'Adjustable strap for a perfect fit.',
    'UV protection for sunny days.',
    'Durable stitched construction.',
    'One size fits most.',
  ],
  mobiles: [
    'Brilliant Super Retina display.',
    'Pro-grade triple camera system.',
    'All-day battery life.',
    '5G connectivity.',
    'Fast and secure face unlock.',
    'Ceramic shield front protection.',
  ],
  laptops: [
    'Powerful multi-core processor.',
    'Stunning high-resolution display.',
    'All-day battery up to 18 hours.',
    'Backlit keyboard and large trackpad.',
    'Fast SSD storage.',
    'Thin and lightweight aluminium body.',
  ],
  accessories: [
    'Premium build quality.',
    'Long-lasting battery.',
    'Compact and travel friendly.',
    'Universal device compatibility.',
    'Fast wired and wireless charging.',
  ],
  shoes: [
    'Soft responsive foam cushioning.',
    'Breathable mesh upper.',
    'Durable rubber outsole.',
    'Lightweight everyday comfort.',
    'Secure lace-up fit.',
  ],
};

const categoryConfigs: CategoryConfig[] = [
  {
    slug: 'headphones',
    noun: 'Headphones',
    keyword: 'headphones',
    variants: ['Black', 'Silver', 'Midnight Blue'],
    bases: [
      {
        brand: 'Sony',
        model: 'WH-1000XM5',
        basePrice: 28990,
        features: featurePools.headphones,
      },
      {
        brand: 'Sony',
        model: 'WH-1000XM4',
        basePrice: 22990,
        features: featurePools.headphones,
      },
      {
        brand: 'Bose',
        model: 'QuietComfort 45',
        basePrice: 26990,
        features: featurePools.headphones,
      },
      {
        brand: 'JBL',
        model: 'Tour One M2',
        basePrice: 19990,
        features: featurePools.headphones,
      },
      {
        brand: 'Sennheiser',
        model: 'Momentum 4',
        basePrice: 27990,
        features: featurePools.headphones,
      },
    ],
  },
  {
    slug: 'watches',
    noun: 'Smartwatch',
    keyword: 'smartwatch',
    variants: ['40mm', '44mm', '44mm GPS + Cellular'],
    bases: [
      {
        brand: 'Apple',
        model: 'Watch SE 2nd Gen',
        basePrice: 22990,
        features: featurePools.watches,
      },
      {
        brand: 'Apple',
        model: 'Watch Series 9',
        basePrice: 41990,
        features: featurePools.watches,
      },
      {
        brand: 'Samsung',
        model: 'Galaxy Watch 6',
        basePrice: 28999,
        features: featurePools.watches,
      },
      {
        brand: 'Garmin',
        model: 'Venu 3',
        basePrice: 44990,
        features: featurePools.watches,
      },
      {
        brand: 'Fitbit',
        model: 'Versa 4',
        basePrice: 19999,
        features: featurePools.watches,
      },
    ],
  },
  {
    slug: 'hats',
    noun: 'Hat',
    keyword: 'hat',
    variants: ['Black', 'Beige', 'Navy'],
    bases: [
      {
        brand: 'Redsea',
        model: 'Luffy Straw',
        basePrice: 799,
        features: featurePools.hats,
      },
      {
        brand: 'Nike',
        model: 'Dri-FIT Club',
        basePrice: 1295,
        features: featurePools.hats,
      },
      {
        brand: 'Adidas',
        model: 'Trefoil Baseball',
        basePrice: 1199,
        features: featurePools.hats,
      },
      {
        brand: 'New Era',
        model: '9FORTY',
        basePrice: 1799,
        features: featurePools.hats,
      },
      {
        brand: 'Kangol',
        model: 'Bermuda Bucket',
        basePrice: 2499,
        features: featurePools.hats,
      },
    ],
  },
  {
    slug: 'mobiles',
    noun: 'Smartphone',
    keyword: 'smartphone',
    variants: ['128GB', '256GB', '512GB'],
    bases: [
      {
        brand: 'Apple',
        model: 'iPhone 15',
        basePrice: 79900,
        features: featurePools.mobiles,
      },
      {
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        basePrice: 134900,
        features: featurePools.mobiles,
      },
      {
        brand: 'Samsung',
        model: 'Galaxy S24',
        basePrice: 74999,
        features: featurePools.mobiles,
      },
      {
        brand: 'Google',
        model: 'Pixel 8',
        basePrice: 75999,
        features: featurePools.mobiles,
      },
      {
        brand: 'OnePlus',
        model: '12',
        basePrice: 64999,
        features: featurePools.mobiles,
      },
    ],
  },
  {
    slug: 'laptops',
    noun: 'Laptop',
    keyword: 'laptop',
    variants: ['8GB / 256GB', '16GB / 512GB', '16GB / 1TB'],
    bases: [
      {
        brand: 'Apple',
        model: 'MacBook Air M2',
        basePrice: 99990,
        features: featurePools.laptops,
      },
      {
        brand: 'Apple',
        model: 'MacBook Pro 14',
        basePrice: 169990,
        features: featurePools.laptops,
      },
      {
        brand: 'Dell',
        model: 'XPS 13',
        basePrice: 124990,
        features: featurePools.laptops,
      },
      {
        brand: 'HP',
        model: 'Spectre x360',
        basePrice: 139990,
        features: featurePools.laptops,
      },
      {
        brand: 'Lenovo',
        model: 'ThinkPad X1 Carbon',
        basePrice: 149990,
        features: featurePools.laptops,
      },
    ],
  },
  {
    slug: 'accessories',
    noun: '',
    keyword: 'gadget',
    variants: ['Black', 'White', 'Grey'],
    bases: [
      {
        brand: 'Samsung',
        model: 'Galaxy Buds2 Pro',
        basePrice: 11990,
        features: featurePools.accessories,
        imageKeyword: 'earbuds',
      },
      {
        brand: 'Anker',
        model: 'PowerCore 20000mAh Power Bank',
        basePrice: 2999,
        features: featurePools.accessories,
        imageKeyword: 'powerbank',
      },
      {
        brand: 'Logitech',
        model: 'MX Master 3S Mouse',
        basePrice: 8995,
        features: featurePools.accessories,
        imageKeyword: 'computer-mouse',
      },
      {
        brand: 'JBL',
        model: 'Flip 6 Bluetooth Speaker',
        basePrice: 9999,
        features: featurePools.accessories,
        imageKeyword: 'speaker',
      },
      {
        brand: 'Urban Carry',
        model: 'Leather Laptop Backpack',
        basePrice: 4999,
        features: featurePools.accessories,
        imageKeyword: 'backpack',
      },
    ],
  },
  {
    slug: 'shoes',
    noun: 'Shoes',
    keyword: 'sneakers',
    variants: ['UK 7', 'UK 8', 'UK 9'],
    bases: [
      {
        brand: 'Nike',
        model: 'Revolution 7 Running',
        basePrice: 3495,
        features: featurePools.shoes,
      },
      {
        brand: 'Adidas',
        model: 'Ultraboost Light',
        basePrice: 8999,
        features: featurePools.shoes,
      },
      {
        brand: 'Puma',
        model: 'RS-X Efekt',
        basePrice: 6499,
        features: featurePools.shoes,
      },
      {
        brand: 'Reebok',
        model: 'Nano X3',
        basePrice: 7499,
        features: featurePools.shoes,
      },
      {
        brand: 'New Balance',
        model: '574 Core',
        basePrice: 5999,
        features: featurePools.shoes,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Review content pools
// ---------------------------------------------------------------------------
const reviewerNames = [
  'Vijaya',
  'Arun',
  'Meera',
  'Karthik',
  'Divya',
  'Sanjay',
  'Nidhi',
  'Rahul',
  'Pooja',
  'Imran',
  'Anjali',
  'Vikram',
  'Sneha',
  'Deepak',
  'Farhan',
  'Priya',
  'Rohit',
  'Lakshmi',
  'Aditya',
  'Kavya',
];

const reviewComments = [
  'Excellent quality, exceeded my expectations.',
  'Great value for the price.',
  'Works exactly as described, very happy.',
  'Good product but delivery was slow.',
  'Comfortable and well built.',
  'Battery life is impressive.',
  'Decent, but could be better for the price.',
  'Absolutely love it, would buy again.',
  'Solid performance, no complaints.',
  'Not bad, does the job.',
];

const reviewTitles = [
  'Highly recommended',
  'Worth it',
  'Very good',
  'Could be better',
  'Amazing product',
  'Satisfied',
  'Great buy',
  undefined,
];

// Weighted toward positive ratings, like a real store.
const ratingPool = [5, 5, 5, 5, 4, 4, 4, 3, 3, 2];

const discountChoices = [0, 0, 5, 10, 15, 20, 25, 30, 38];

const userAddresses = [
  {
    name: 'Nandhu Santhosh',
    country: 'India',
    flatHouseBuilding: 'Munjanattu House',
    mobileNumber: '6238973581',
    alternativeMobileNumber: '8078785794',
    pincode: '689667',
    city: 'Seethathodu',
    state: 'Kerala',
    isDefault: true,
  },
  {
    name: 'Nandhu Santhosh (Office)',
    country: 'India',
    flatHouseBuilding: 'Tech Park, Tower B',
    mobileNumber: '6238973581',
    pincode: '560103',
    city: 'Bengaluru',
    state: 'Karnataka',
    isDefault: false,
  },
];

// ---------------------------------------------------------------------------
// Build the product list from the category configs.
// ---------------------------------------------------------------------------
type GeneratedProduct = {
  categorySlug: string;
  title: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  stock: number;
  isTodayDeal: boolean;
  isRecommended: boolean;
  ratingAverage: number;
  ratingCount: number;
  images: { url: string; alt: string; sortOrder: number }[];
  features: { text: string; sortOrder: number }[];
  reviews: {
    reviewerName: string;
    rating: number;
    title?: string;
    comment: string;
    isVerified: boolean;
  }[];
};

function buildProducts(): GeneratedProduct[] {
  const products: GeneratedProduct[] = [];
  const usedSlugs = new Set<string>();
  let counter = 0;

  for (const cfg of categoryConfigs) {
    for (const base of cfg.bases) {
      cfg.variants.forEach((variant, variantIndex) => {
        counter += 1;

        const titleParts = [base.brand, base.model, cfg.noun, `(${variant})`]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        const title = titleParts;

        // Unique slug
        let slug = slugify(`${base.brand} ${base.model} ${variant}`);
        if (usedSlugs.has(slug)) {
          slug = `${slug}-${counter}`;
        }
        usedSlugs.add(slug);

        // Pricing: nudge price per variant, then apply a random discount.
        const price = round(base.basePrice * (1 + variantIndex * 0.08));
        const discountPercent = pick(discountChoices);
        const oldPrice =
          discountPercent > 0
            ? round(price / (1 - discountPercent / 100))
            : null;

        // Reviews
        const reviewCount = rand(0, 6);
        const reviews = Array.from({ length: reviewCount }, () => {
          const rating = pick(ratingPool);
          return {
            reviewerName: pick(reviewerNames),
            rating,
            title: pick(reviewTitles),
            comment: pick(reviewComments),
            isVerified: Math.random() > 0.4,
          };
        });
        const ratingCount = reviews.length;
        const ratingAverage =
          ratingCount === 0
            ? 0
            : Math.round(
                (reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount) *
                  10,
              ) / 10;

        // Images (1-3 per product) from LoremFlickr — real photos matched to
        // the category keyword. The `lock` seed makes each image deterministic
        // so a product always shows the same picture across requests.
        const imageKeyword = base.imageKeyword ?? cfg.keyword;
        const imageCount = rand(1, 3);
        const images = Array.from({ length: imageCount }, (_, i) => ({
          url: `https://loremflickr.com/600/600/${imageKeyword}?lock=${counter * 10 + i + 1}`,
          alt: `${base.brand} ${base.model} ${variant}`,
          sortOrder: i + 1,
        }));

        // Features (3 distinct from the pool)
        const featureSet = new Set<string>();
        while (featureSet.size < Math.min(3, base.features.length)) {
          featureSet.add(pick(base.features));
        }
        const features = Array.from(featureSet).map((text, i) => ({
          text,
          sortOrder: i + 1,
        }));

        products.push({
          categorySlug: cfg.slug,
          title,
          slug,
          brand: base.brand,
          description:
            `${base.brand} ${base.model} ${cfg.noun} (${variant}). ${base.features[0]} ${base.features[1] ?? ''}`.trim(),
          price,
          oldPrice,
          discountPercent: discountPercent > 0 ? discountPercent : null,
          stock: rand(0, 120),
          // Distribute landing-page flags so /home always has content.
          isTodayDeal: counter % 4 === 0,
          isRecommended: counter % 3 === 0,
          ratingAverage,
          ratingCount,
          images,
          features,
          reviews,
        });
      });
    }
  }

  return products;
}

async function main() {
  console.log('Seeding e-commerce database...');

  // Clean slate (order matters for FK constraints).
  await prisma.review.deleteMany();
  await prisma.productFeature.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Reset SQLite AUTOINCREMENT counters so IDs are deterministic on every
  // re-seed (category 1 = Headphones, product ids start at 1, etc.).
  try {
    await prisma.$executeRawUnsafe(
      `DELETE FROM sqlite_sequence WHERE name IN ('User','Address','Category','Product','ProductImage','ProductFeature','Review')`,
    );
  } catch {
    // sqlite_sequence may not exist yet on a brand-new database — safe to ignore.
  }

  // Categories
  const categoryIdBySlug: Record<string, number> = {};
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    categoryIdBySlug[created.slug] = created.id;
  }

  // Products + images + features + reviews
  const products = buildProducts();
  for (const product of products) {
    await prisma.product.create({
      data: {
        categoryId: categoryIdBySlug[product.categorySlug],
        title: product.title,
        slug: product.slug,
        brand: product.brand,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        discountPercent: product.discountPercent,
        stock: product.stock,
        isTodayDeal: product.isTodayDeal,
        isRecommended: product.isRecommended,
        ratingAverage: product.ratingAverage,
        ratingCount: product.ratingCount,
        images: { create: product.images },
        features: { create: product.features },
        reviews: { create: product.reviews },
      },
    });
  }

  // Test user + addresses
  const user = await prisma.user.create({
    data: {
      fullName: 'Nandhu Santhosh',
      email: 'nandhusanthosh@gmail.com',
      passwordHash: await bcrypt.hash('12345678', 10),
      phone: '6238973581',
      dateOfBirth: new Date('2002-09-18'),
      addresses: { create: userAddresses },
    },
  });

  const todayDeals = products.filter((p) => p.isTodayDeal).length;
  const recommended = products.filter((p) => p.isRecommended).length;
  console.log(`Categories seeded: ${categories.length}`);
  console.log(`Products seeded: ${products.length}`);
  console.log(`  - today deals: ${todayDeals}`);
  console.log(`  - recommended: ${recommended}`);
  console.log(`Test user: ${user.email} / 12345678`);
  console.log('Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

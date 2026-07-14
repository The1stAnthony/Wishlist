// Curated gift product catalog.
// source_type: 'direct' = real ASIN + local image (Tier 1, floats top)
// source_type: 'handle' = keyword search URL + emoji icon (Tier 2)
// adminProduct: true    = always shown regardless of API state, pinned above all tiers
//
// PA-API → Creators API upgrade path: once 10 aggregate qualifying sales/30d are maintained,
// the search route swaps to live Creators API results. On 403, falls back to this static catalog.
// Regional domain swap (www.amazon.co.uk etc.) is handled client-side via regionalizeAmazonUrl().

const TAG = process.env.AMAZON_AFFILIATE_TAG || 'alliwant0a-20';

const PRODUCTS = [
  // ── Tech & Gadgets — Tier 1 ───────────────────────────────────────────────
  { id: 't1',  category: 'tech', source_type: 'direct', asin: 'B0CQXMXJC5', image: '/images/products/image_t1.png', name: 'Soundcore by Anker Q20i Hybrid Active Noise Cancelling Headphones', price: 69.99,  description: 'Dual-device connection, 40H ANC playtime, Hi-Res Audio, transparency mode' },
  { id: 't2',  category: 'tech', source_type: 'direct', asin: 'B0FQFPB851', image: '/images/products/image_t2.png', name: 'Apple Watch Series 11 GPS 42mm Smartwatch', price: 399.00, description: 'Sleep score, fitness tracker, health monitoring, always-on display, water resistant' },
  { id: 't3',  category: 'tech', source_type: 'direct', asin: 'B0DCBB2YTR', image: '/images/products/image_t3.png', name: 'Anker Laptop Power Bank 25,000mAh 165W', price: 119.99, description: '25,000mAh capacity, 3 USB-C ports (100W max each), built-in retractable cables, airline carry-on friendly' },
  { id: 't4',  category: 'tech', source_type: 'direct', asin: 'B09B2SB77Q', image: '/images/products/image_t4.png', name: 'Amazon Echo Show 5 Kids (newest model)', price: 99.99,  description: 'Designed for kids, Alexa+, parental controls, includes 1 year of Amazon Kids+' },
  { id: 't5',  category: 'tech', source_type: 'direct', asin: 'B0CFPP8C33', image: '/images/products/image_t5.png', name: 'Amazon Kindle Paperwhite Signature Edition 32GB', price: 199.99, description: '20% faster, auto-adjusting front light, wireless charging, weeks of battery life' },
  { id: 't6',  category: 'tech', source_type: 'direct', asin: 'B0GPVFK6SJ', image: '/images/products/image_t6.png', name: 'Sport Band Compatible with C60 Fitness Tracker', price: 9.99,   description: 'Silicone waterproof strap with installation tools' },
  { id: 't7',  category: 'tech', source_type: 'direct', asin: 'B0H28WGFND', image: '/images/products/image_t7.png', name: 'Portable Bluetooth Speaker — IPX5 Waterproof', price: 29.99,  description: '20-hour playtime, IPX5 waterproof, Bluetooth 5.3, TWS pairing' },
  { id: 't8',  category: 'tech', source_type: 'direct', asin: 'B0BQPGJ9LQ', image: '/images/products/image_t8.png', name: 'JBL Vibe Beam True Wireless Earbuds', price: 54.95,  description: 'JBL Deep Bass, Bluetooth 5.2, up to 32 hours of battery life' },
  { id: 't9',  category: 'tech', source_type: 'direct', asin: 'B0C39W85BK', image: '/images/products/image_t9.png', name: 'LED Desk Lamp with USB Charging Port', price: 25.99,  description: 'Stepless dimming, 3 color modes, eye-caring design, 5V 2.4A USB charging port' },
  { id: 't10', category: 'tech', source_type: 'direct', asin: 'B0BXMP12QG', image: '/images/products/image_t10.png', name: 'Fujifilm Instax Mini 12 Camera + Accessory Bundle', price: 159.95, description: 'Includes custom case, 50-sheet film value pack & designer photo album' },

  // ── Tech & Gadgets — Tier 2 ───────────────────────────────────────────────
  { id: 't11', category: 'tech', source_type: 'handle', icon: '🎥', name: 'Mini Portable Projector',        price: 120, description: 'Project movies anywhere, 1080p supported',          search: 'mini portable projector 1080p' },
  { id: 't12', category: 'tech', source_type: 'handle', icon: '⚡', name: 'Wireless Charging Pad',         price: 30,  description: 'Fast-charge iPhone & Android wirelessly',           search: 'wireless charging pad fast charge' },
  { id: 't13', category: 'tech', source_type: 'handle', icon: '💫', name: 'Ring Light Kit',                price: 45,  description: 'Ideal for photos, reels & video calls',             search: 'ring light selfie photography kit' },
  { id: 't14', category: 'tech', source_type: 'handle', icon: '🎬', name: 'Action Camera 4K',              price: 350, description: 'Waterproof 4K — capture every adventure',            search: 'gopro action camera 4k waterproof' },
  { id: 't15', category: 'tech', source_type: 'handle', icon: '🏠', name: 'Smart Display Hub',             price: 100, description: 'Control all your smart devices from one screen',    search: 'google nest hub smart display' },
  { id: 't16', category: 'tech', source_type: 'handle', icon: '🔌', name: 'USB-C Multiport Hub',           price: 35,  description: '6-in-1: HDMI, USB-A, SD card & more',              search: 'usb-c hub adapter multiport laptop' },
  { id: 't17', category: 'tech', source_type: 'handle', icon: '⌨️', name: 'Mechanical Keyboard',          price: 130, description: 'Tactile switches, RGB backlit, wireless',            search: 'mechanical keyboard rgb wireless' },
  { id: 't18', category: 'tech', source_type: 'handle', icon: '🎨', name: 'Digital Drawing Tablet',        price: 80,  description: 'Professional pen input for digital art',             search: 'drawing tablet digital art wacom' },
  { id: 't19', category: 'tech', source_type: 'handle', icon: '🔔', name: 'Smart Video Doorbell',          price: 100, description: 'See who\'s at the door from anywhere',              search: 'smart video doorbell camera ring' },
  { id: 't20', category: 'tech', source_type: 'handle', icon: '🖼️', name: 'Digital Photo Frame (WiFi)',   price: 90,  description: 'Display & share photos remotely via app',            search: 'digital photo frame wifi smart' },
  { id: 't21', category: 'tech', source_type: 'handle', icon: '🎮', name: 'Stream Deck Controller',        price: 150, description: 'One-touch shortcuts for streamers & creators',       search: 'elgato stream deck content creator' },

  // ── Home & Kitchen — Tier 1 ───────────────────────────────────────────────
  { id: 'h1',  category: 'home', source_type: 'direct', asin: 'B08T1XYNG9', image: '/images/products/image_h1.png',  name: 'Scented Candles Gift Set, 12 Pack Soy Wax', price: 22.99,  description: '12 scents in one gift set, ready-to-gift box with aromatherapy travel tins' },
  { id: 'h2',  category: 'home', source_type: 'direct', asin: 'B0GXV36GJK', image: '/images/products/image_h2.png',  name: 'AMZCHEF Espresso Machine with Grinder', price: 299.99, description: '190°F–201°F temp control, 44 grind settings, milk frother, touch screen, cold brew' },
  { id: 'h3',  category: 'home', source_type: 'direct', asin: 'B0D2XX95SJ', image: '/images/products/image_h3.png',  name: 'Luxury 1000GSM Faux Rabbit Fur Throw Blanket', price: 59.99,  description: 'Super heavy, warm & cozy, ruched plush, soft reversible mink blanket' },
  { id: 'h4',  category: 'home', source_type: 'direct', asin: 'B0FJ9DY1RV', image: '/images/products/image_h4.png',  name: 'Ninja HyperHeat 9-in-1 Electric Pressure Cooker 6.5 Qt', price: 169.99, description: '9-in-1 multi cooker — pressure, slow, rice, sous vide & more, PFAS-free pot' },
  { id: 'h5',  category: 'home', source_type: 'direct', asin: 'B0CM5NXPHC', image: '/images/products/image_h5.png',  name: 'Love Cabin Satin Queen Bed Sheet Set — 4 Piece', price: 27.99,  description: 'Silky soft, deep pocket, luxury feel, reduces hair breakage & skin creasing' },
  { id: 'h6',  category: 'home', source_type: 'direct', asin: 'B0C6T3GV7W', image: '/images/products/image_h6.png',  name: '200ML Ceramic Essential Oil Diffuser', price: 24.99,  description: 'Ultrasonic aromatherapy diffuser with 7 color LED lights, auto shut-off, 3 timers' },
  { id: 'h7',  category: 'home', source_type: 'direct', asin: 'B0B15Q3HCQ', image: '/images/products/image_h7.png',  name: 'Ninja DZ550 Foodi 10 Qt DualZone Smart XL Air Fryer', price: 249.99, description: '2 independent baskets, smart cook thermometer, match cook & smart finish modes' },
  { id: 'h8',  category: 'home', source_type: 'direct', asin: 'B0GJFTJBPV', image: '/images/products/image_h8.png',  name: 'Bamboo Cutting Boards Set of 3 with Holder', price: 54.99,  description: 'Large 14"×10" with juice grooves, labels for meat, vegetables & bread' },
  { id: 'h9',  category: 'home', source_type: 'direct', asin: 'B0DKF64J2J', image: '/images/products/image_h9.png',  name: 'Unbreakable Pour Over Coffee Maker 6-Piece Set', price: 49.99,  description: 'Coffee maker, hand grinder, drip kettle, V60 filters (40), measuring spoon' },
  { id: 'h10', category: 'home', source_type: 'direct', asin: 'B0C1CQ52K5', image: '/images/products/image_h10.png', name: 'LBedsure 100% Washed Cotton Duvet Cover Queen', price: 64.99,  description: 'Oatmeal minimalist bedding, linen-like, soft comforter cover for all seasons' },
  { id: 'h11', category: 'home', source_type: 'direct', asin: 'B0BYYZC3Y2', image: '/images/products/image_h11.png', name: 'SONGMICS 4×6 Picture Frames Collage 12-Pack', price: 31.75,  description: 'Multi-picture frame set with glass front, wall décor, cloud white' },

  // ── Home & Kitchen — Tier 2 ───────────────────────────────────────────────
  { id: 'h12', category: 'home', source_type: 'handle', icon: '🌱', name: 'Indoor Herb Garden Kit',        price: 45,  description: 'Grow fresh basil, mint & more on your windowsill',   search: 'indoor herb garden kit starter' },
  { id: 'h13', category: 'home', source_type: 'handle', icon: '🍸', name: 'Cocktail Making Set',           price: 60,  description: 'Shaker, jigger, muddler & recipe book',              search: 'cocktail making set bar tools gift' },
  { id: 'h14', category: 'home', source_type: 'handle', icon: '🌅', name: 'Himalayan Salt Lamp',           price: 30,  description: 'Warm amber glow, natural air purifier',               search: 'himalayan salt lamp large' },
  { id: 'h15', category: 'home', source_type: 'handle', icon: '🍳', name: 'Cast Iron Skillet',             price: 45,  description: 'Pre-seasoned, lasts a lifetime',                      search: 'cast iron skillet pan lodge' },
  { id: 'h16', category: 'home', source_type: 'handle', icon: '👘', name: 'Satin Robe',                   price: 55,  description: 'Luxuriously soft, perfect gift for any occasion',     search: 'satin robe women luxury gift' },
  { id: 'h17', category: 'home', source_type: 'handle', icon: '🧀', name: 'Cheese & Charcuterie Board',   price: 50,  description: 'Acacia wood, comes with utensils',                    search: 'cheese board charcuterie set gift' },
  { id: 'h18', category: 'home', source_type: 'handle', icon: '🫖', name: 'Electric Kettle',              price: 40,  description: 'Temperature control, keep-warm feature',              search: 'electric kettle temperature control' },
  { id: 'h19', category: 'home', source_type: 'handle', icon: '✨', name: 'Wax Melt Warmer Set',           price: 28,  description: 'Ceramic warmer with assorted wax melts',              search: 'wax melt warmer set gift' },
  { id: 'h20', category: 'home', source_type: 'handle', icon: '📒', name: 'Personalised Recipe Book',     price: 32,  description: 'Blank recipe journal to fill with family favourites',  search: 'personalised recipe book journal blank' },
  { id: 'h21', category: 'home', source_type: 'handle', icon: '🥤', name: 'Portable Blender',             price: 35,  description: 'USB-charged, take smoothies anywhere',                search: 'portable blender usb rechargeable' },

  // ── Beauty & Self-Care — Tier 1 ───────────────────────────────────────────
  { id: 'b1',  category: 'beauty', source_type: 'direct', asin: 'B0G6D5MNSX', image: '/images/products/image_b1.png',  name: 'Avocado Skin Care Set 12 Pcs Gift Set', price: 21.97,  description: 'Lip balm, cleanser, serum, face cream, eye cream, toner, lotion & facial mask' },
  { id: 'b2',  category: 'beauty', source_type: 'direct', asin: 'B0GKQK1QV5', image: '/images/products/image_b2.png',  name: 'Dyson Airwrap Co-anda2x Multi-Styler and Dryer', price: 749.99, description: 'Curl, wave & dry with no extreme heat' },
  { id: 'b3',  category: 'beauty', source_type: 'direct', asin: 'B08RD6S5HF', image: '/images/products/image_b3.png',  name: 'BAIMEI IcyMe Gua Sha & Jade Roller Set', price: 13.99,  description: 'Cooling face roller & gua sha tool for depuffing, facial sculpting & jawline definition' },
  { id: 'b4',  category: 'beauty', source_type: 'direct', asin: 'B0BRPZDT35', image: '/images/products/image_b4.png',  name: 'Bath Bombs Salt Balls 12 PCS Gift Set', price: 23.99,  description: 'Vanilla, menthol & rose essential oils, moisturizing & fizzy spa experience' },
  { id: 'b5',  category: 'beauty', source_type: 'direct', asin: 'B0GVSN2F35', image: '/images/products/image_b5.png',  name: '2-in-1 Wrap Cap Silk Press & Hair Scarf', price: 9.99,   description: 'Protective hair scarf for sleep, elegant silk head wrap' },
  { id: 'b6',  category: 'beauty', source_type: 'direct', asin: 'B0FNWRJQFX', image: '/images/products/image_b6.png',  name: 'INIA Glow 4D Wireless Red Light Therapy Mask', price: 249.99, description: 'Dual NIR, 320 LEDs, 4 modes, under-eye cooling, cordless & rechargeable' },
  { id: 'b7',  category: 'beauty', source_type: 'direct', asin: 'B0GTWS17Y5', image: '/images/products/image_b7.png',  name: 'Tree Hut Pink Hibiscus Shower Gift Set for Women', price: 19.99,  description: 'Body scrub, body wash, shave oil & body spray with shea butter' },
  { id: 'b8',  category: 'beauty', source_type: 'direct', asin: 'B07QDSCXXP', image: '/images/products/image_b8.png',  name: 'Garnier Fructis Sleek & Shine Shampoo + Conditioner Set', price: 14.84,  description: 'Plant keratin + argan oil, for frizzy dry hair, 3-piece kit' },
  { id: 'b9',  category: 'beauty', source_type: 'direct', asin: 'B0G7W64M1D', image: '/images/products/image_b9.png',  name: '5-Piece Lip Balm Butter Set', price: 14.98,  description: 'Natural shea butter & avocado oil, hydrating non-sticky lightweight lip care' },
  { id: 'b10', category: 'beauty', source_type: 'direct', asin: 'B0CZ8H7FGR', image: '/images/products/image_b10.png', name: 'PRITECH Facial Cleansing Brush Rechargeable', price: 12.99,  description: 'Silicone face scrubber with heat massage, vibrating exfoliator, waterproof' },

  // ── Beauty & Self-Care — Tier 2 ───────────────────────────────────────────
  { id: 'b11', category: 'beauty', source_type: 'handle', icon: '💅', name: 'Nail Art Kit',               price: 35,  description: 'Gel polish, UV lamp, tools & designs',               search: 'nail art kit gel polish uv lamp' },
  { id: 'b12', category: 'beauty', source_type: 'handle', icon: '🩹', name: 'Sheet Mask Set (30-pack)',   price: 22,  description: 'Hydrating, brightening & firming varieties',           search: 'sheet mask set 30 pack korean' },
  { id: 'b13', category: 'beauty', source_type: 'handle', icon: '🌸', name: 'Perfume Gift Set',           price: 80,  description: 'Curated fragrance set with travel sizes',              search: 'perfume fragrance gift set women' },
  { id: 'b14', category: 'beauty', source_type: 'handle', icon: '💨', name: 'Revlon One-Step Hair Dryer', price: 60,  description: 'Dry & style at the same time',                        search: 'revlon one step hair dryer brush volumizer' },
  { id: 'b15', category: 'beauty', source_type: 'handle', icon: '🚿', name: 'Aromatherapy Shower Steamers', price: 20, description: 'Turn any shower into a spa moment',                  search: 'shower steamers aromatherapy gift set' },
  { id: 'b16', category: 'beauty', source_type: 'handle', icon: '👁️', name: 'Eyeshadow Palette',         price: 45,  description: '24 blendable shades for every look',                  search: 'eyeshadow palette gift makeup' },
  { id: 'b17', category: 'beauty', source_type: 'handle', icon: '🦶', name: 'Foot Spa & Massager',        price: 50,  description: 'Heat, bubbles & massage for tired feet',              search: 'foot spa massager electric heated' },
  { id: 'b18', category: 'beauty', source_type: 'handle', icon: '😁', name: 'Teeth Whitening Kit',        price: 35,  description: 'LED-accelerated whitening, noticeable results',        search: 'teeth whitening kit led home' },
  { id: 'b19', category: 'beauty', source_type: 'handle', icon: '🖌️', name: 'Makeup Brush Set (15-piece)', price: 30, description: 'Vegan, soft synthetic brushes with roll bag',          search: 'makeup brush set 15 piece professional' },
  { id: 'b20', category: 'beauty', source_type: 'handle', icon: '🍊', name: 'Vitamin C Serum',            price: 25,  description: 'Brightening & anti-ageing formula',                   search: 'vitamin c serum brightening face' },
  { id: 'b21', category: 'beauty', source_type: 'handle', icon: '🧺', name: 'Spa Gift Basket',            price: 65,  description: 'Everything for a full at-home spa day',               search: 'spa gift basket set relaxation' },

  // ── Fashion — Tier 1 ──────────────────────────────────────────────────────
  { id: 'f1',  category: 'fashion', source_type: 'direct', asin: 'B0CRR2R22V', image: '/images/products/image_f1.png',  name: 'RIIQIICHY Head Scarf for Women — Silk Printed Square', price: 6.99,   description: 'Versatile 35", wear as scarf, headband or bag tie' },
  { id: 'f2',  category: 'fashion', source_type: 'direct', asin: 'B09P3QGR1D', image: '/images/products/image_f2.png',  name: 'GSOIAX Slim RFID Blocking Leather Bifold Wallet', price: 13.85,  description: 'Carbon fiber, front pocket, credit card holder with gift box' },
  { id: 'f3',  category: 'fashion', source_type: 'direct', asin: 'B0BYCW39WH', image: '/images/products/image_f3.png',  name: 'Versace Man Sunglasses Black Frame Dark Grey Lenses 56MM', price: 195.86, description: 'UV400 polarised lenses, lightweight designer frame' },
  { id: 'f4',  category: 'fashion', source_type: 'direct', asin: 'B0D8FDXTQR', image: '/images/products/image_f4.png',  name: 'HERIER Gold Jewelry Set — Pearl Choker Necklace, Earrings & Bracelet', price: 17.99,  description: 'Dainty 14K gold/silver plated pearl jewelry, wedding & trendy gift' },
  { id: 'f5',  category: 'fashion', source_type: 'direct', asin: 'B0FN3VMQQ4', image: '/images/products/image_f5.png',  name: 'Women Beanie Scarf Gloves Headband Set — Winter 4-Piece', price: 25.99,  description: 'Fleece-lined scarf, touchscreen gloves & ear warmer knit gift set' },
  { id: 'f6',  category: 'fashion', source_type: 'direct', asin: 'B0CBPYWJN9', image: '/images/products/image_f6.png',  name: 'Michael Kors Womens Kensington Shoulder Tote', price: 359.50, description: 'Designer everyday carryall, canvas & leather' },
  { id: 'f7',  category: 'fashion', source_type: 'direct', asin: 'B0GWCC8BVM', image: '/images/products/image_f7.png',  name: '925 Sterling Silver Personalized Birthstone Ring', price: 298.00, description: 'Customizable with 4 names, family ring for mothers & grandmothers' },
  { id: 'f8',  category: 'fashion', source_type: 'direct', asin: 'B07ZH4F2DY', image: '/images/products/image_f8.png',  name: 'Movado Museum Classic Mens Luxury Quartz Watch', price: 696.50, description: 'Refined Swiss engineering, precise quartz movement, minimal maintenance' },
  { id: 'f9',  category: 'fashion', source_type: 'direct', asin: 'B0FGDHCPLH', image: '/images/products/image_f9.png',  name: 'Mini Crossbody Bag for Women — Adjustable Strap', price: 16.99,  description: 'Small spacious tote with zipper pockets for phone, wallet & keys' },
  { id: 'f10', category: 'fashion', source_type: 'direct', asin: 'B00BPR1QO6', image: '/images/products/image_f10.png', name: 'Personalized Hebrew Name Necklace — Custom Nameplate Pendant', price: 599.00, description: 'Dainty gift for her or him, great for Hannukah, Passover, Purim, birthday' },
  { id: 'f11', category: 'fashion', source_type: 'direct', asin: 'B08G4Y4G4N', image: '/images/products/image_f11.png', name: 'Century Star Womens Fuzzy Oversized Hoodie with Pockets', price: 32.99,  description: 'Cozy fleece pullover, athletic sport hooded sweatshirt' },

  // ── Fashion — Tier 2 ──────────────────────────────────────────────────────
  { id: 'f12', category: 'fashion', source_type: 'handle', icon: '🥾', name: 'Ankle Boots',               price: 90,  description: 'Classic style, block heel, all-season',               search: 'ankle boots women block heel classic' },
  { id: 'f13', category: 'fashion', source_type: 'handle', icon: '🕶️', name: 'Aviator Sunglasses',       price: 85,  description: 'Timeless pilot-frame, polarised',                     search: 'aviator sunglasses polarised' },
  { id: 'f14', category: 'fashion', source_type: 'handle', icon: '✨', name: 'Personalised Name Bracelet', price: 28,  description: 'Handcrafted with your name or word',                  search: 'personalised name bracelet gold silver' },
  { id: 'f15', category: 'fashion', source_type: 'handle', icon: '👔', name: 'Linen Shirt (Breezy)',      price: 50,  description: 'Lightweight, wrinkle-resistant everyday shirt',        search: 'linen shirt women men summer' },
  { id: 'f16', category: 'fashion', source_type: 'handle', icon: '🎀', name: 'Velvet Scrunchie Set',      price: 15,  description: '10-pack in jewel tones, no-crease hold',              search: 'velvet scrunchie set hair accessories' },
  { id: 'f17', category: 'fashion', source_type: 'handle', icon: '🩵', name: 'Pearl Drop Earrings',       price: 32,  description: 'Freshwater pearl, sterling silver hooks',              search: 'pearl drop earrings freshwater silver' },
  { id: 'f18', category: 'fashion', source_type: 'handle', icon: '🧥', name: 'Trench Coat',               price: 150, description: 'Classic belted, water-resistant',                     search: 'trench coat women classic belted' },
  { id: 'f19', category: 'fashion', source_type: 'handle', icon: '👟', name: 'Loafers (Slip-on)',         price: 80,  description: 'Leather-look, comfortable all-day wear',               search: 'slip on loafers women leather look' },
  { id: 'f20', category: 'fashion', source_type: 'handle', icon: '🪣', name: 'Bucket Hat',                price: 25,  description: 'Retro style, UV protection',                          search: 'bucket hat women uv protection summer' },
  { id: 'f21', category: 'fashion', source_type: 'handle', icon: '🌟', name: 'Charm Bracelet',            price: 40,  description: 'Add charms for every milestone',                      search: 'charm bracelet silver women gift' },

  // ── Books & Learning — Tier 1 ─────────────────────────────────────────────
  { id: 'k1',  category: 'books', source_type: 'direct', asin: '1635577713', image: '/images/products/image_k1.png',  name: 'A Court of Thorns and Roses Hardcover Box Set', price: 82.95,  description: 'Complete hardcover series box set' },
  { id: 'k2',  category: 'books', source_type: 'direct', asin: 'B00O8PNW6M', image: '/images/products/image_k2.png',  name: 'Scratch The World Travel Map — X-Large 23×33', price: 29.49,  description: 'Frameable scratch-off world map, 50 years of making maps, updated 2025' },
  { id: 'k3',  category: 'books', source_type: 'direct', asin: '1637993218', image: '/images/products/image_k3.png',  name: 'The Complete Cooking for Two Cookbook — 10th Anniversary Edition', price: 59.99,  description: '700+ recipes for everything you\'ll ever want to make' },
  { id: 'k4',  category: 'books', source_type: 'direct', asin: 'B09GCBZJK3', image: '/images/products/image_k4.png',  name: 'Marcus Aurelius Meditations — Adapted for the Contemporary Reader', price: 29.99,  description: 'Greek & Roman Stoic philosophy adapted for modern readers' },
  { id: 'k5',  category: 'books', source_type: 'direct', asin: 'B0DXPBRV12', image: '/images/products/image_k5.png',  name: 'Funny Dog Pizza Jigsaw Puzzle, 1000 Piece', price: 19.99,  description: 'Food kitchen puzzle, interlock perfectly, gifts for mothers & fathers day' },
  { id: 'k6',  category: 'books', source_type: 'direct', asin: '1784882623', image: '/images/products/image_k6.png',  name: 'Leo: Harness the Power of the Zodiac (Astrology, Star Sign)', price: 27.27,  description: 'HG Seeing Stars series — personalised insights for Leo' },
  { id: 'k7',  category: 'books', source_type: 'direct', asin: '9730402973', image: '/images/products/image_k7.png',  name: 'Learn & Retain Spanish, Portuguese, Italian and French with Spaced Repetition', price: 33.99,  description: '1,000+ Anki notes with comparative grammar and vocabulary' },
  { id: 'k8',  category: 'books', source_type: 'direct', asin: 'B0GWHKB2DR', image: '/images/products/image_k8.png',  name: 'Enchanted Feminine Forest Coloring Book for Adults', price: 9.99,   description: '50 intricate designs for relaxation and stress relief' },
  { id: 'k9',  category: 'books', source_type: 'direct', asin: '1984859501', image: '/images/products/image_k9.png',  name: 'There and Back: Photographs from the Edge', price: 50.00,  description: 'Stunning photography coffee table book — nature & architecture' },
  { id: 'k10', category: 'books', source_type: 'direct', asin: 'B0H8J1NYXY', image: '/images/products/image_k10.png', name: 'My Daily Checklist — An ADL Planner for Dementia Patients', price: 18.95,  description: '90-day planner for activities of daily living, giving more independence to elderly patients', adminProduct: true },

  // ── Books & Learning — Tier 2 ─────────────────────────────────────────────
  { id: 'k11', category: 'books', source_type: 'handle', icon: '🌟', name: 'Self-Help Bestseller',        price: 20,  description: 'Top-rated personal growth & happiness book',           search: 'self help book bestseller 2024' },
  { id: 'k12', category: 'books', source_type: 'handle', icon: '🃏', name: 'Card Games Bundle (4-pack)',  price: 35,  description: 'Exploding Kittens, Taco Cat & more',                  search: 'card games bundle party gift' },
  { id: 'k13', category: 'books', source_type: 'handle', icon: '🔍', name: 'True Crime Thriller',         price: 22,  description: 'Can\'t-put-it-down bestselling page-turner',          search: 'true crime thriller bestseller book' },
  { id: 'k14', category: 'books', source_type: 'handle', icon: '🖌️', name: 'Watercolour Set (Professional)', price: 40, description: '48 colours, brushes & watercolour paper',            search: 'watercolour set professional art gift' },
  { id: 'k15', category: 'books', source_type: 'handle', icon: '🧠', name: 'Brain Teasers & Riddles Book', price: 16, description: '250+ riddles, logic puzzles & IQ tests',               search: 'brain teasers riddles puzzle book' },
  { id: 'k16', category: 'books', source_type: 'handle', icon: '🐉', name: 'Fantasy Epic Box Set',        price: 60,  description: 'Complete series — dragons, magic & adventure',         search: 'fantasy epic series box set books' },
  { id: 'k17', category: 'books', source_type: 'handle', icon: '💕', name: 'Romantic Comedy Novel Set',   price: 45,  description: 'Feel-good reads perfect for gifting',                 search: 'romantic comedy novel set gift' },
  { id: 'k18', category: 'books', source_type: 'handle', icon: '🪢', name: 'DIY Craft Kit (Macramé)',    price: 30,  description: 'Everything you need to make your first wall hanging',  search: 'macrame diy craft kit beginners' },
  { id: 'k19', category: 'books', source_type: 'handle', icon: '🚀', name: 'Science & Space Poster Set', price: 20,  description: '6 illustrated posters for the curious mind',           search: 'science space poster set educational' },
  { id: 'k20', category: 'books', source_type: 'handle', icon: '❓', name: 'Trivia Night Game (1000 questions)', price: 25, description: 'Categories for the whole family',              search: 'trivia quiz game 1000 questions family' },
  { id: 'k21', category: 'books', source_type: 'handle', icon: '🗺️', name: 'Vintage Map Art Print',     price: 30,  description: 'Choose any city — personalised wall art',             search: 'personalised city map art print vintage' },

  // ── Experiences — Tier 1 ─────────────────────────────────────────────────
  { id: 'e1',  category: 'experience', source_type: 'direct', asin: 'B0FNCP5M1G', image: '/images/products/image_e1.png',  name: '35-Piece Charcoal Bath & Body Gift Basket', price: 59.99,  description: 'Face skin care kit, home spa basket, bath bomb, self-care birthday gift' },
  { id: 'e2',  category: 'experience', source_type: 'direct', asin: 'B0H1J2754S', image: '/images/products/image_e2.png',  name: 'SHOGUN CANDY — 40-Piece Japanese Snacks & Candy Box', price: 30.99,  description: 'Popin Cookin, kawaii dagashi box, hime gluten-free variety' },
  { id: 'e3',  category: 'experience', source_type: 'direct', asin: 'B0FHQ5BCVZ', image: '/images/products/image_e3.png',  name: 'Chicago Date Night Experience Gift — 40+ Unique Experiences', price: 209.00, description: 'Never-expires gift certificate for couples, windy city adventures & romance' },
  { id: 'e4',  category: 'experience', source_type: 'direct', asin: 'B07P9JF2JY', image: '/images/products/image_e4.png',  name: 'Wine Tasting Flight Sampler Boards 2-Pack', price: 54.99,  description: 'Eight 6oz decanter glasses & 2 wood paddles with chalkboards' },
  { id: 'e5',  category: 'experience', source_type: 'direct', asin: 'B0BX9G4K7N', image: '/images/products/image_e5.png',  name: 'Craftmix Variety Pack — 24 Cocktail & Mocktail Mixers', price: 27.99,  description: 'Skinny mixes, real fruit, vegan low-carb non-GMO, gluten free' },
  { id: 'e6',  category: 'experience', source_type: 'direct', asin: 'B0F1F3K7SS', image: '/images/products/image_e6.png',  name: 'Mini Pottery Wheel for Kids, Beginners & Adults', price: 79.99,  description: '6" two-way rotation clay wheel, 18-piece sculpting tools, at-home pottery kit' },
  { id: 'e7',  category: 'experience', source_type: 'direct', asin: 'B00QVPHKBU', image: '/images/products/image_e7.png',  name: 'Hot Air Balloon Ride Ticket — Round Rock, Texas', price: 419.00, description: 'Sunrise flight over breathtaking scenery, great gift' },
  { id: 'e8',  category: 'experience', source_type: 'direct', asin: 'B0DBZK38DP', image: '/images/products/image_e8.png',  name: 'Date Night Painting Kit for Couples — Sip & Paint', price: 29.99,  description: 'Pre-drawn canvas, sunset heart template, 2-pack 8"×10"' },
  { id: 'e9',  category: 'experience', source_type: 'direct', asin: 'B0752PGG2K', image: '/images/products/image_e9.png',  name: 'Mattel Escape Room in a Box — The Werewolf Experiment', price: 43.99,  description: '19 2D and 3D puzzles, group game for teens and adults, connects to Alexa' },
  { id: 'e10', category: 'experience', source_type: 'direct', asin: 'B0G3VR7P3P', image: '/images/products/image_e10.png', name: 'Custom Concert Ticket Surprise — Personalized Gift', price: 8.99,   description: 'Fake concert ticket gift for Christmas, birthday or Valentine\'s Day' },
  { id: 'e11', category: 'experience', source_type: 'direct', asin: 'B0GJZ98C87', image: '/images/products/image_e11.png', name: 'Blooming Tea Gift Set with Double-Walled Glass Teacup', price: 19.99,  description: '8 handcrafted flowering tea balls, artisan green tea and flower varieties' },

  // ── Experiences — Tier 2 ─────────────────────────────────────────────────
  { id: 'e12', category: 'experience', source_type: 'handle', icon: '🪓', name: 'Axe Throwing Session',    price: 55,  description: 'Surprisingly therapeutic & addictive',                search: 'axe throwing experience session gift' },
  { id: 'e13', category: 'experience', source_type: 'handle', icon: '🪂', name: 'Skydiving Experience',    price: 250, description: 'Tandem jump with a certified instructor',              search: 'skydiving tandem experience gift' },
  { id: 'e14', category: 'experience', source_type: 'handle', icon: '🏄', name: 'Surf Lesson',             price: 80,  description: 'Learn to stand up and ride a wave',                  search: 'surf lesson beginner experience gift' },
  { id: 'e15', category: 'experience', source_type: 'handle', icon: '📸', name: 'Photography Workshop',    price: 90,  description: 'Learn composition, lighting & editing',               search: 'photography workshop class experience gift' },
  { id: 'e16', category: 'experience', source_type: 'handle', icon: '🚣', name: 'Kayaking Tour',           price: 70,  description: 'Guided paddle through scenic waterways',               search: 'kayaking tour guided experience gift' },
  { id: 'e17', category: 'experience', source_type: 'handle', icon: '🏨', name: 'Spa & Hotel Night Away',  price: 200, description: 'Full overnight wellness retreat',                      search: 'spa hotel overnight stay gift voucher' },
  { id: 'e18', category: 'experience', source_type: 'handle', icon: '🏹', name: 'Archery Lesson',          price: 45,  description: 'Channel your inner Robin Hood',                       search: 'archery lesson beginner experience gift' },
  { id: 'e19', category: 'experience', source_type: 'handle', icon: '⛸️', name: 'Ice Skating (Group)',    price: 50,  description: 'Classic winter fun for all abilities',                search: 'ice skating group experience gift' },
  { id: 'e20', category: 'experience', source_type: 'handle', icon: '🥽', name: 'Virtual Reality Gaming', price: 40,  description: 'Immersive VR experience — play together',              search: 'virtual reality gaming experience gift' },
  { id: 'e21', category: 'experience', source_type: 'handle', icon: '🕯️', name: 'Candle-Making Workshop', price: 55,  description: 'Blend scents & pour your own candles',               search: 'candle making workshop class experience gift' },

  // ── Sports & Outdoors — Tier 1 ────────────────────────────────────────────
  { id: 's1',  category: 'sports', source_type: 'direct', asin: 'B07PTNTS3R', image: '/images/products/image_s1.png',  name: 'Gaiam Yoga Mat — Premium 6mm Extra Thick Non-Slip', price: 21.38,  description: 'Non-slip, eco-friendly, 68"L × 24"W, for yoga, pilates & floor workouts' },
  { id: 's2',  category: 'sports', source_type: 'direct', asin: 'B01C5O9RX4', image: '/images/products/image_s2.png',  name: 'KUYOU Running Hydration Vest with 2L Water Bladder', price: 21.98,  description: 'Lightweight insulated backpack, adjustable chest straps, reflective' },
  { id: 's3',  category: 'sports', source_type: 'direct', asin: 'B08DLXZKF7', image: '/images/products/image_s3.png',  name: 'Resistance Bands for Working Out — 5-Pack', price: 13.99,  description: 'Elastic exercise bands for strength training, yoga, physical therapy' },
  { id: 's4',  category: 'sports', source_type: 'direct', asin: 'B0GJCXB189', image: '/images/products/image_s4.png',  name: 'Camping Hammock Tent with Mosquito Net & RainFly', price: 94.99,  description: '3-in-1 waterproof sleeping hammock, lightweight backpacker gear' },
  { id: 's5',  category: 'sports', source_type: 'direct', asin: 'B0F9GYK893', image: '/images/products/image_s5.png',  name: 'Garmin Forerunner 970 Running Smartwatch GPS', price: 764.99, description: 'Fitness smart watch, carbon gray DLC titanium, bundle with P-Bank' },
  { id: 's6',  category: 'sports', source_type: 'direct', asin: 'B0G4GK9JFC', image: '/images/products/image_s6.png',  name: 'Adjustable Dumbbell Set — 5-in-1 Converts to Barbell & Kettlebell', price: 209.99, description: '10/20/30/45/70/90lbs, for men & women strength training at home' },
  { id: 's7',  category: 'sports', source_type: 'direct', asin: 'B07FZ44JPC', image: '/images/products/image_s7.png',  name: 'Gaiam Restore Foam Roller for Muscle Massage', price: 25.65,  description: 'Deep tissue muscle massager for sore muscles & stimulation' },
  { id: 's8',  category: 'sports', source_type: 'direct', asin: 'B07L5KB8BW', image: '/images/products/image_s8.png',  name: 'NORTIV 8 Mens Ankle High Waterproof Hiking Boots', price: 59.99,  description: 'Outdoor lightweight shoes, trekking trails, ankle support' },
  { id: 's9',  category: 'sports', source_type: 'direct', asin: 'B0CP9Y3152', image: '/images/products/image_s9.png',  name: 'STANLEY Quencher H2.0 Tumbler 40 oz with Handle and Straw', price: 45.00,  description: 'Flowstate 3-position lid, cup holder compatible, insulated stainless steel, BPA-free' },
  { id: 's10', category: 'sports', source_type: 'direct', asin: 'B09PH1TF3D', image: '/images/products/image_s10.png', name: 'Jump Rope — Tangle-Free Speed Cable with Ball Bearings', price: 13.99,  description: 'Adjustable steel rope with foam handles for home gym workout' },

  // ── Sports & Outdoors — Tier 2 ────────────────────────────────────────────
  { id: 's11', category: 'sports', source_type: 'handle', icon: '🧺', name: 'Outdoor Picnic Blanket',     price: 30,  description: 'Waterproof backing, folds into carry bag',             search: 'waterproof outdoor picnic blanket' },
  { id: 's12', category: 'sports', source_type: 'handle', icon: '🎵', name: 'Sports Wireless Earbuds',    price: 99,  description: 'Sweatproof, secure-fit hooks, 8hr battery',            search: 'sport wireless earbuds sweatproof workout' },
  { id: 's13', category: 'sports', source_type: 'handle', icon: '🚴', name: 'Bike Phone Mount',           price: 22,  description: 'Universal fit, quick-release, waterproof',             search: 'bike phone mount universal waterproof' },
  { id: 's14', category: 'sports', source_type: 'handle', icon: '🏠', name: 'Pull-Up Bar (Doorframe)',    price: 35,  description: 'No screws, fits most doorframes',                      search: 'doorframe pull up bar no screws' },
  { id: 's15', category: 'sports', source_type: 'handle', icon: '🏓', name: 'Pickleball Set',             price: 55,  description: 'The fastest-growing sport — 4 paddles & balls',        search: 'pickleball set paddles balls game' },
  { id: 's16', category: 'sports', source_type: 'handle', icon: '🌞', name: 'Camping Lantern (Solar)',    price: 30,  description: 'Collapsible, USB-rechargeable, 350 lumens',            search: 'solar camping lantern collapsible usb' },
  { id: 's17', category: 'sports', source_type: 'handle', icon: '⚖️', name: 'Kettlebell (Adjustable)',   price: 60,  description: 'Replaces multiple weights in one',                     search: 'adjustable kettlebell home gym' },
  { id: 's18', category: 'sports', source_type: 'handle', icon: '🥏', name: 'Frisbee Disc Set',           price: 25,  description: 'Ultimate & disc golf set',                             search: 'frisbee disc set ultimate outdoor' },
  { id: 's19', category: 'sports', source_type: 'handle', icon: '🏅', name: 'Marathon Running Belt',      price: 28,  description: 'Slim phone & key holder, bounce-free',                 search: 'running belt marathon phone holder' },
  { id: 's20', category: 'sports', source_type: 'handle', icon: '⭕', name: 'Weighted Hula Hoop',         price: 30,  description: '1kg smart hoop, great core workout',                  search: 'weighted hula hoop fitness exercise' },
  { id: 's21', category: 'sports', source_type: 'handle', icon: '🧗', name: 'Climbing Starter Kit',       price: 90,  description: 'Harness, chalk bag & carabiner set',                  search: 'climbing starter kit harness chalk bag' },

  // ── Food & Drink — Tier 1 ────────────────────────────────────────────────
  { id: 'd1',  category: 'food', source_type: 'direct', asin: 'B0FH5LH4NF', image: '/images/products/image_d1.png',  name: 'Godiva Gold Assorted Chocolate Gift Box 60 Pc', price: 130.00, description: 'Belgian dark & milk chocolates, pralinés, ganaches & caramels, Kosher' },
  { id: 'd2',  category: 'food', source_type: 'direct', asin: 'B0DD1ZF9WK', image: '/images/products/image_d2.png',  name: 'Deluxe Meat and Cheese Gift Basket — Gourmet Charcuterie', price: 74.97,  description: 'Curated aged cheeses, food gifts for men, tailgating & congratulations' },
  { id: 'd3',  category: 'food', source_type: 'direct', asin: 'B07JN5467R', image: '/images/products/image_d3.png',  name: 'Urban Accents Movie Night Popcorn Gift Set', price: 21.95,  description: '3 gourmet popcorn kernel varieties & 5 flavorful seasonings' },
  { id: 'd4',  category: 'food', source_type: 'direct', asin: 'B0F5SFQX8V', image: '/images/products/image_d4.png',  name: 'Thoughtfully Gourmet Birthday Hot Sauce Sampler — 30-Pack', price: 44.99,  description: 'Garlic herb & apple whiskey flavors, gift wrapped for birthdays' },
  { id: 'd5',  category: 'food', source_type: 'direct', asin: 'B0BHLP7J5K', image: '/images/products/image_d5.png',  name: 'Bones Coffee World Tour Sample Pack with Specialty Mug', price: 64.99,  description: '5 single-origin low acid medium roast arabica beans, 4oz packs, ground' },
  { id: 'd6',  category: 'food', source_type: 'direct', asin: 'B0B6KS2FRH', image: '/images/products/image_d6.png',  name: 'Viante Luxury Tea Set with Electric Kettle & Infuser', price: 139.99, description: 'Borosilicate glass, ceramic teapot, 4 cups & bamboo tray, no plastic' },
  { id: 'd7',  category: 'food', source_type: 'direct', asin: 'B0DVF4XDQS', image: '/images/products/image_d7.png',  name: 'Nibble Charcuterie Deluxe Board — Ready to Serve for 4–5', price: 112.95, description: 'Curated meats, cheeses, crackers & jams, fully assembled' },
  { id: 'd8',  category: 'food', source_type: 'direct', asin: 'B07P97N98R', image: '/images/products/image_d8.png',  name: 'Thoughtfully Cocktails Margarita Mixer Gift Set 4-Pack', price: 14.99,  description: 'Blood orange, strawberry, mango, watermelon & lime, includes rimming salt' },
  { id: 'd9',  category: 'food', source_type: 'direct', asin: 'B0B1JMJZT3', image: '/images/products/image_d9.png',  name: 'Thoughtfully Gourmet Truffle Salt & Olive Oil Gift Set', price: 39.99,  description: '4 premium extra virgin olive oils, 2 truffle salts with real truffles' },
  { id: 'd10', category: 'food', source_type: 'direct', asin: 'B0DBLKMPCG', image: '/images/products/image_d10.png', name: 'Kootek 700-Piece Cake Decorating Kit', price: 44.99,  description: 'Springform pans, turntable, piping tips, pastry bags — complete baking tools' },
  { id: 'd11', category: 'food', source_type: 'direct', asin: 'B0FN7KTTTR', image: '/images/products/image_d11.png', name: 'Advent Calendar 2025 — Whiskey Infusion Kit, 24 Days', price: 39.99,  description: 'For infusing vodka & tequila, Christmas gift for dad, husband, him' },

  // ── Food & Drink — Tier 2 ────────────────────────────────────────────────
  { id: 'd12', category: 'food', source_type: 'handle', icon: '🥂', name: 'Champagne & Prosecco Gift Set', price: 75,  description: 'Celebrate in style — with flutes',                    search: 'champagne prosecco gift set celebration' },
  { id: 'd13', category: 'food', source_type: 'handle', icon: '🎂', name: 'Macaron Gift Box (24-piece)',   price: 40,  description: 'Authentic French macarons in pastel flavours',         search: 'macaron gift box french 24 piece' },
  { id: 'd14', category: 'food', source_type: 'handle', icon: '🍣', name: 'Sushi Making Kit',             price: 35,  description: 'Mat, rice paddle, nori & chopsticks',                  search: 'sushi making kit gift beginner' },
  { id: 'd15', category: 'food', source_type: 'handle', icon: '🔥', name: 'BBQ & Grilling Spice Set',     price: 30,  description: '8 rubs & seasonings for the grill master',             search: 'bbq grilling spice rub set gift' },
  { id: 'd16', category: 'food', source_type: 'handle', icon: '🍯', name: 'Artisan Honey Collection',     price: 40,  description: 'Raw, infused & creamed honey varieties',               search: 'artisan honey collection gift set' },
  { id: 'd17', category: 'food', source_type: 'handle', icon: '🍝', name: 'Pasta Making Kit',             price: 45,  description: 'Flour, cutter, drying rack & recipe book',             search: 'pasta making kit gift beginner' },
  { id: 'd18', category: 'food', source_type: 'handle', icon: '🍡', name: 'Japanese Snack Box (30 items)', price: 35, description: 'Unique treats sourced directly from Japan',             search: 'japanese snack box subscription gift' },
  { id: 'd19', category: 'food', source_type: 'handle', icon: '🧀', name: 'Cheese of the Month Club',     price: 80,  description: 'Artisan cheeses delivered monthly',                   search: 'cheese of the month club gift subscription' },
  { id: 'd20', category: 'food', source_type: 'handle', icon: '🫙', name: 'Olive Oil & Balsamic Tasting Set', price: 50, description: 'Premium imported oils & aged vinegars',             search: 'olive oil balsamic vinegar tasting set gift' },
  { id: 'd21', category: 'food', source_type: 'handle', icon: '🍫', name: 'Brownie & Fudge Gift Tower',   price: 55,  description: 'Stacked tins of indulgent chocolatey treats',          search: 'brownie fudge gift tower set' },
];

function buildProducts() {
  return PRODUCTS.map((p) => ({
    ...p,
    amazon_url: p.source_type === 'direct'
      ? `https://www.amazon.com/dp/${p.asin}?tag=${TAG}`
      : `https://www.amazon.com/s?k=${encodeURIComponent(p.search)}&tag=${TAG}`,
  }));
}

const ALL_PRODUCTS = buildProducts();

// Sort: admin products first, then Tier 1 (direct), then Tier 2 (handle)
function sortByTier(arr) {
  return [...arr].sort((a, b) => {
    if (a.adminProduct && !b.adminProduct) return -1;
    if (!a.adminProduct && b.adminProduct) return 1;
    if (a.source_type === 'direct' && b.source_type !== 'direct') return -1;
    if (a.source_type !== 'direct' && b.source_type === 'direct') return 1;
    return 0;
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function searchProducts(q) {
  if (!q?.trim()) return ALL_PRODUCTS;
  const terms = q.toLowerCase().split(/\s+/);
  const matched = ALL_PRODUCTS.filter((p) =>
    terms.some((t) =>
      p.name.toLowerCase().includes(t) ||
      p.description.toLowerCase().includes(t) ||
      p.search?.toLowerCase().includes(t) ||
      p.category.toLowerCase().includes(t)
    )
  );
  return sortByTier(matched);
}

function getByCategory(cat) {
  return sortByTier(ALL_PRODUCTS.filter((p) => p.category === cat));
}

function getBrowseAll() {
  // Shuffle Tier 2 for variety; pin admin + Tier 1 first
  const admin  = ALL_PRODUCTS.filter((p) => p.adminProduct);
  const direct = ALL_PRODUCTS.filter((p) => p.source_type === 'direct' && !p.adminProduct);
  const handle = shuffle(ALL_PRODUCTS.filter((p) => p.source_type === 'handle'));
  return [...admin, ...direct, ...handle];
}

module.exports = { ALL_PRODUCTS, searchProducts, getByCategory, getBrowseAll };

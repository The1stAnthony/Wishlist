// Curated gift product catalog.
// Each product links to an Amazon affiliate search URL so links never go stale.
// Swap `image_url` for real PA API images once 3 qualifying sales unlock access.

const TAG = process.env.AMAZON_AFFILIATE_TAG || 'alliwant0a-20';

function amzUrl(search) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(search)}&tag=${TAG}`;
}

const PRODUCTS = [
  // ── Tech & Gadgets ────────────────────────────────────────────────────────
  { id: 't1',  category: 'tech', name: 'Wireless Noise-Cancelling Headphones', icon: '🎧', price: 348, description: 'Industry-leading noise cancellation, 30-hr battery', search: 'wireless noise cancelling headphones' },
  { id: 't2',  category: 'tech', name: 'Smart Watch',                          icon: '⌚', price: 249, description: 'Track fitness, get notifications & monitor heart rate', search: 'smart watch fitness tracker' },
  { id: 't3',  category: 'tech', name: 'Portable Power Bank',                  icon: '🔋', price: 46,  description: '20,000 mAh — charge your phone 5× over', search: 'portable power bank 20000mah' },
  { id: 't4',  category: 'tech', name: 'Smart Speaker',                        icon: '📢', price: 50,  description: 'Voice assistant, music & smart home control', search: 'amazon echo smart speaker' },
  { id: 't5',  category: 'tech', name: 'E-Reader',                             icon: '📖', price: 140, description: 'Thousands of books, glare-free display, weeks of battery', search: 'kindle e-reader paperwhite' },
  { id: 't6',  category: 'tech', name: 'Fitness Tracker Band',                 icon: '💪', price: 100, description: 'Steps, sleep, heart rate & GPS', search: 'fitness tracker band' },
  { id: 't7',  category: 'tech', name: 'Waterproof Bluetooth Speaker',         icon: '🔊', price: 180, description: '20-hour playtime, IPX7 waterproof', search: 'bluetooth portable speaker waterproof' },
  { id: 't8',  category: 'tech', name: 'True Wireless Earbuds',                icon: '🎵', price: 129, description: 'Compact, 24-hr total battery with charging case', search: 'true wireless earbuds' },
  { id: 't9',  category: 'tech', name: 'LED Desk Lamp',                        icon: '💡', price: 45,  description: 'USB-C charging port, touch dimmer', search: 'led desk lamp usb charging' },
  { id: 't10', category: 'tech', name: 'Instant Print Camera',                 icon: '📷', price: 80,  description: 'Print memories instantly — perfect for parties', search: 'fujifilm instax instant camera' },
  { id: 't11', category: 'tech', name: 'Mini Portable Projector',              icon: '🎥', price: 120, description: 'Project movies anywhere, 1080p supported', search: 'mini portable projector 1080p' },
  { id: 't12', category: 'tech', name: 'Wireless Charging Pad',                icon: '⚡', price: 30,  description: 'Fast-charge iPhone & Android wirelessly', search: 'wireless charging pad fast charge' },
  { id: 't13', category: 'tech', name: 'Ring Light Kit',                       icon: '💫', price: 45,  description: 'Ideal for photos, reels & video calls', search: 'ring light selfie photography kit' },
  { id: 't14', category: 'tech', name: 'Action Camera 4K',                     icon: '🎬', price: 350, description: 'Waterproof 4K — capture every adventure', search: 'gopro action camera 4k waterproof' },
  { id: 't15', category: 'tech', name: 'Smart Display Hub',                    icon: '🏠', price: 100, description: 'Control all your smart devices from one screen', search: 'google nest hub smart display' },
  { id: 't16', category: 'tech', name: 'USB-C Multiport Hub',                  icon: '🔌', price: 35,  description: '6-in-1: HDMI, USB-A, SD card & more', search: 'usb-c hub adapter multiport laptop' },
  { id: 't17', category: 'tech', name: 'Mechanical Keyboard',                  icon: '⌨️', price: 130, description: 'Tactile switches, RGB backlit, wireless', search: 'mechanical keyboard rgb wireless' },
  { id: 't18', category: 'tech', name: 'Digital Drawing Tablet',               icon: '🎨', price: 80,  description: 'Professional pen input for digital art', search: 'drawing tablet digital art wacom' },
  { id: 't19', category: 'tech', name: 'Smart Video Doorbell',                 icon: '🔔', price: 100, description: 'See who\'s at the door from anywhere', search: 'smart video doorbell camera ring' },
  { id: 't20', category: 'tech', name: 'Digital Photo Frame (WiFi)',           icon: '🖼️', price: 90,  description: 'Display & share photos remotely via app', search: 'digital photo frame wifi smart' },
  { id: 't21', category: 'tech', name: 'Stream Deck Controller',               icon: '🎮', price: 150, description: 'One-touch shortcuts for streamers & creators', search: 'elgato stream deck content creator' },

  // ── Home & Kitchen ────────────────────────────────────────────────────────
  { id: 'h1',  category: 'home', name: 'Luxury Scented Candle Set',        icon: '🕯️', price: 45,  description: 'Hand-poured, long-burn premium fragrances', search: 'luxury scented candle set gift' },
  { id: 'h2',  category: 'home', name: 'Espresso & Coffee Maker',          icon: '☕', price: 120, description: 'Barista-quality coffee at home', search: 'espresso coffee maker machine home' },
  { id: 'h3',  category: 'home', name: 'Cozy Weighted Blanket',            icon: '🛋️', price: 65,  description: '15 lb — reduces anxiety, improves sleep', search: 'weighted blanket cozy gift' },
  { id: 'h4',  category: 'home', name: 'Instant Pot Duo',                  icon: '🍲', price: 100, description: '7-in-1 pressure cooker, slow cooker & more', search: 'instant pot duo pressure cooker' },
  { id: 'h5',  category: 'home', name: 'Silk Pillowcase Set',              icon: '😴', price: 50,  description: 'Reduces hair breakage & skin creasing', search: 'silk pillowcase set queen king' },
  { id: 'h6',  category: 'home', name: 'Aromatherapy Diffuser',            icon: '🌿', price: 35,  description: 'Essential oil diffuser with colour-changing light', search: 'aromatherapy essential oil diffuser' },
  { id: 'h7',  category: 'home', name: 'Air Fryer',                        icon: '🍟', price: 80,  description: 'Crispy food with 80% less oil', search: 'air fryer large capacity' },
  { id: 'h8',  category: 'home', name: 'Bamboo Cutting Board Set',         icon: '🪵', price: 40,  description: '3-piece set with juice grooves', search: 'bamboo cutting board set kitchen' },
  { id: 'h9',  category: 'home', name: 'Pour-Over Coffee Set',             icon: '🫖', price: 55,  description: 'Glass dripper, gooseneck kettle & filters', search: 'pour over coffee set gift' },
  { id: 'h10', category: 'home', name: 'Linen Duvet Cover Set',            icon: '🛏️', price: 90,  description: 'Breathable, stonewashed linen — all seasons', search: 'linen duvet cover set bedding' },
  { id: 'h11', category: 'home', name: 'Picture Frame Collage Set',        icon: '🖼️', price: 35,  description: 'Display your favourite memories on any wall', search: 'picture frame collage set wall' },
  { id: 'h12', category: 'home', name: 'Indoor Herb Garden Kit',           icon: '🌱', price: 45,  description: 'Grow fresh basil, mint & more on your windowsill', search: 'indoor herb garden kit starter' },
  { id: 'h13', category: 'home', name: 'Cocktail Making Set',              icon: '🍸', price: 60,  description: 'Shaker, jigger, muddler & recipe book', search: 'cocktail making set bar tools gift' },
  { id: 'h14', category: 'home', name: 'Himalayan Salt Lamp',              icon: '🌅', price: 30,  description: 'Warm amber glow, natural air purifier', search: 'himalayan salt lamp large' },
  { id: 'h15', category: 'home', name: 'Cast Iron Skillet',                icon: '🍳', price: 45,  description: 'Pre-seasoned, lasts a lifetime', search: 'cast iron skillet pan lodge' },
  { id: 'h16', category: 'home', name: 'Satin Robe',                       icon: '👘', price: 55,  description: 'Luxuriously soft, perfect gift for any occasion', search: 'satin robe women luxury gift' },
  { id: 'h17', category: 'home', name: 'Cheese & Charcuterie Board',       icon: '🧀', price: 50,  description: 'Acacia wood, comes with utensils', search: 'cheese board charcuterie set gift' },
  { id: 'h18', category: 'home', name: 'Electric Kettle',                  icon: '🫖', price: 40,  description: 'Temperature control, keep-warm feature', search: 'electric kettle temperature control' },
  { id: 'h19', category: 'home', name: 'Wax Melt Warmer Set',              icon: '✨', price: 28,  description: 'Ceramic warmer with assorted wax melts', search: 'wax melt warmer set gift' },
  { id: 'h20', category: 'home', name: 'Personalised Recipe Book',         icon: '📒', price: 32,  description: 'Blank recipe journal to fill with family favourites', search: 'personalised recipe book journal blank' },
  { id: 'h21', category: 'home', name: 'Portable Blender',                 icon: '🥤', price: 35,  description: 'USB-charged, take smoothies anywhere', search: 'portable blender usb rechargeable' },

  // ── Beauty & Self-Care ────────────────────────────────────────────────────
  { id: 'b1',  category: 'beauty', name: 'Luxury Skincare Gift Set',         icon: '✨', price: 75,  description: 'Cleanser, serum, moisturiser — full routine', search: 'luxury skincare gift set women' },
  { id: 'b2',  category: 'beauty', name: 'Dyson Airwrap Styler',             icon: '💇', price: 600, description: 'Curl, wave & dry with no extreme heat', search: 'dyson airwrap hair styler' },
  { id: 'b3',  category: 'beauty', name: 'Jade Roller & Gua Sha Set',        icon: '💚', price: 20,  description: 'De-puff and lift skin naturally', search: 'jade roller gua sha set face' },
  { id: 'b4',  category: 'beauty', name: 'Bath Bomb Gift Set (12-pack)',      icon: '🛁', price: 30,  description: 'Fizzing colours, moisturising oils', search: 'bath bomb gift set 12 pack' },
  { id: 'b5',  category: 'beauty', name: 'Silk Hair Wrap Towel',             icon: '🎀', price: 25,  description: 'Reduces frizz & breakage while drying', search: 'microfibre silk hair wrap towel' },
  { id: 'b6',  category: 'beauty', name: 'LED Face Mask',                    icon: '😌', price: 40,  description: 'Red & blue light therapy for clearer skin', search: 'led face mask light therapy skin' },
  { id: 'b7',  category: 'beauty', name: 'Sugar Body Scrub Set',             icon: '🍬', price: 25,  description: 'Exfoliating scrubs in 3 scents', search: 'sugar body scrub gift set' },
  { id: 'b8',  category: 'beauty', name: 'Hair Care Gift Set',               icon: '💆', price: 50,  description: 'Shampoo, conditioner & hair mask bundle', search: 'hair care gift set shampoo conditioner' },
  { id: 'b9',  category: 'beauty', name: 'Lip Care Collection',              icon: '💋', price: 28,  description: 'Overnight masks, scrubs & glosses', search: 'lip care gift set collection' },
  { id: 'b10', category: 'beauty', name: 'Electric Face Cleanser',           icon: '🌊', price: 79,  description: 'Sonic cleansing removes 99% of dirt', search: 'electric face cleanser sonic brush' },
  { id: 'b11', category: 'beauty', name: 'Nail Art Kit',                     icon: '💅', price: 35,  description: 'Gel polish, UV lamp, tools & designs', search: 'nail art kit gel polish uv lamp' },
  { id: 'b12', category: 'beauty', name: 'Sheet Mask Set (30-pack)',          icon: '🩹', price: 22,  description: 'Hydrating, brightening & firming varieties', search: 'sheet mask set 30 pack korean' },
  { id: 'b13', category: 'beauty', name: 'Perfume Gift Set',                 icon: '🌸', price: 80,  description: 'Curated fragrance set with travel sizes', search: 'perfume fragrance gift set women' },
  { id: 'b14', category: 'beauty', name: 'Revlon One-Step Hair Dryer',       icon: '💨', price: 60,  description: 'Dry & style at the same time', search: 'revlon one step hair dryer brush volumizer' },
  { id: 'b15', category: 'beauty', name: 'Aromatherapy Shower Steamers',     icon: '🚿', price: 20,  description: 'Turn any shower into a spa moment', search: 'shower steamers aromatherapy gift set' },
  { id: 'b16', category: 'beauty', name: 'Eyeshadow Palette',                icon: '👁️', price: 45,  description: '24 blendable shades for every look', search: 'eyeshadow palette gift makeup' },
  { id: 'b17', category: 'beauty', name: 'Foot Spa & Massager',              icon: '🦶', price: 50,  description: 'Heat, bubbles & massage for tired feet', search: 'foot spa massager electric heated' },
  { id: 'b18', category: 'beauty', name: 'Teeth Whitening Kit',              icon: '😁', price: 35,  description: 'LED-accelerated whitening, noticeable results', search: 'teeth whitening kit led home' },
  { id: 'b19', category: 'beauty', name: 'Makeup Brush Set (15-piece)',       icon: '🖌️', price: 30,  description: 'Vegan, soft synthetic brushes with roll bag', search: 'makeup brush set 15 piece professional' },
  { id: 'b20', category: 'beauty', name: 'Vitamin C Serum',                  icon: '🍊', price: 25,  description: 'Brightening & anti-ageing formula', search: 'vitamin c serum brightening face' },
  { id: 'b21', category: 'beauty', name: 'Spa Gift Basket',                  icon: '🧺', price: 65,  description: 'Everything for a full at-home spa day', search: 'spa gift basket set relaxation' },

  // ── Fashion ───────────────────────────────────────────────────────────────
  { id: 'f1',  category: 'fashion', name: 'Silk Scarf',                   icon: '🧣', price: 45,  description: 'Versatile, wear as scarf, headband or bag tie', search: 'silk scarf women gift' },
  { id: 'f2',  category: 'fashion', name: 'Leather Wallet (Slim)',        icon: '👛', price: 55,  description: 'RFID blocking, holds 12 cards', search: 'slim leather wallet rfid blocking' },
  { id: 'f3',  category: 'fashion', name: 'Luxury Sunglasses',            icon: '😎', price: 120, description: 'UV400 polarised lenses, lightweight frame', search: 'luxury polarised sunglasses women men' },
  { id: 'f4',  category: 'fashion', name: 'Dainty Jewellery Set',         icon: '💎', price: 40,  description: 'Gold-plated necklace, earrings & bracelet', search: 'dainty gold jewellery set necklace earrings' },
  { id: 'f5',  category: 'fashion', name: 'Cashmere Beanie & Scarf Set',  icon: '🧤', price: 70,  description: 'Ultra-soft cashmere blend', search: 'cashmere beanie scarf set gift' },
  { id: 'f6',  category: 'fashion', name: 'Designer Tote Bag',            icon: '👜', price: 85,  description: 'Canvas & leather, everyday carryall', search: 'designer tote bag canvas leather women' },
  { id: 'f7',  category: 'fashion', name: 'Personalised Birthstone Ring', icon: '💍', price: 35,  description: 'Sterling silver with birthstone gem', search: 'birthstone ring sterling silver personalised' },
  { id: 'f8',  category: 'fashion', name: 'Luxury Watch',                 icon: '⌚', price: 200, description: 'Classic design, sapphire crystal glass', search: 'luxury watch classic men women gift' },
  { id: 'f9',  category: 'fashion', name: 'Crossbody Mini Bag',           icon: '👝', price: 60,  description: 'Compact, goes with everything', search: 'crossbody mini bag women gift' },
  { id: 'f10', category: 'fashion', name: 'Initial Pendant Necklace',     icon: '🔤', price: 30,  description: 'Gold or silver, personalised initial', search: 'initial pendant necklace gold personalised' },
  { id: 'f11', category: 'fashion', name: 'Oversized Hoodie',             icon: '👕', price: 55,  description: 'Cosy heavyweight fleece, relaxed fit', search: 'oversized hoodie women cozy fleece' },
  { id: 'f12', category: 'fashion', name: 'Ankle Boots',                  icon: '👢', price: 90,  description: 'Classic style, block heel, all-season', search: 'ankle boots women block heel classic' },
  { id: 'f13', category: 'fashion', name: 'Aviator Sunglasses',           icon: '🕶️', price: 85,  description: 'Timeless pilot-frame, polarised', search: 'aviator sunglasses polarised' },
  { id: 'f14', category: 'fashion', name: 'Personalised Name Bracelet',   icon: '✨', price: 28,  description: 'Handcrafted with your name or word', search: 'personalised name bracelet gold silver' },
  { id: 'f15', category: 'fashion', name: 'Linen Shirt (Breezy)',         icon: '👔', price: 50,  description: 'Lightweight, wrinkle-resistant everyday shirt', search: 'linen shirt women men summer' },
  { id: 'f16', category: 'fashion', name: 'Velvet Scrunchie Set',         icon: '🎀', price: 15,  description: '10-pack in jewel tones, no-crease hold', search: 'velvet scrunchie set hair accessories' },
  { id: 'f17', category: 'fashion', name: 'Pearl Drop Earrings',          icon: '🩵', price: 32,  description: 'Freshwater pearl, sterling silver hooks', search: 'pearl drop earrings freshwater silver' },
  { id: 'f18', category: 'fashion', name: 'Trench Coat',                  icon: '🧥', price: 150, description: 'Classic belted, water-resistant', search: 'trench coat women classic belted' },
  { id: 'f19', category: 'fashion', name: 'Loafers (Slip-on)',            icon: '👟', price: 80,  description: 'Leather-look, comfortable all-day wear', search: 'slip on loafers women leather look' },
  { id: 'f20', category: 'fashion', name: 'Bucket Hat',                   icon: '🪣', price: 25,  description: 'Retro style, UV protection', search: 'bucket hat women uv protection summer' },
  { id: 'f21', category: 'fashion', name: 'Charm Bracelet',               icon: '🌟', price: 40,  description: 'Add charms for every milestone', search: 'charm bracelet silver women gift' },

  // ── Books & Learning ──────────────────────────────────────────────────────
  { id: 'k1',  category: 'books', name: 'Bestselling Novel Box Set',          icon: '📚', price: 55, description: 'Curated box of this year\'s most-loved novels', search: 'bestselling novels box set gift 2024' },
  { id: 'k2',  category: 'books', name: 'Scratch-Off World Map',              icon: '🗺️', price: 25, description: 'Scratch off every country you visit', search: 'scratch off world map travel poster' },
  { id: 'k3',  category: 'books', name: 'Cooking & Recipe Book',              icon: '🍳', price: 35, description: 'Step-by-step guides for all skill levels', search: 'cooking recipe book bestseller gift' },
  { id: 'k4',  category: 'books', name: 'Daily Gratitude Journal',            icon: '📓', price: 20, description: '5-minute morning reflection prompts', search: 'gratitude journal daily prompts mindfulness' },
  { id: 'k5',  category: 'books', name: 'Puzzle (1000-piece)',                icon: '🧩', price: 28, description: 'Landscape & art designs, great for all ages', search: '1000 piece puzzle gift adults' },
  { id: 'k6',  category: 'books', name: 'Astrology & Birth Chart Book',       icon: '♑', price: 18, description: 'Personalised insights based on your star sign', search: 'astrology book star sign birthday' },
  { id: 'k7',  category: 'books', name: 'Language Learning Flashcards',       icon: '🌍', price: 22, description: 'Spanish, French, Japanese & more', search: 'language learning flashcards spanish french' },
  { id: 'k8',  category: 'books', name: 'Adult Colouring Book (Deluxe)',      icon: '🎨', price: 15, description: 'Intricate designs — the original stress-reliever', search: 'adult colouring book deluxe intricate' },
  { id: 'k9',  category: 'books', name: 'Coffee Table Photo Book',            icon: '🏛️', price: 50, description: 'Stunning photography of nature & architecture', search: 'coffee table photo book photography art' },
  { id: 'k10', category: 'books', name: 'Mindfulness & Meditation Book',      icon: '🧘', price: 18, description: 'Practical guide to building a daily practice', search: 'mindfulness meditation book beginners' },
  { id: 'k11', category: 'books', name: 'Self-Help Bestseller',               icon: '🌟', price: 20, description: 'Top-rated personal growth & happiness book', search: 'self help book bestseller 2024' },
  { id: 'k12', category: 'books', name: 'Card Games Bundle (4-pack)',         icon: '🃏', price: 35, description: 'Exploding Kittens, Taco Cat & more', search: 'card games bundle party gift' },
  { id: 'k13', category: 'books', name: 'True Crime Thriller',                icon: '🔍', price: 22, description: 'Can\'t-put-it-down bestselling page-turner', search: 'true crime thriller bestseller book' },
  { id: 'k14', category: 'books', name: 'Watercolour Set (Professional)',     icon: '🖌️', price: 40, description: '48 colours, brushes & watercolour paper', search: 'watercolour set professional art gift' },
  { id: 'k15', category: 'books', name: 'Brain Teasers & Riddles Book',       icon: '🧠', price: 16, description: '250+ riddles, logic puzzles & IQ tests', search: 'brain teasers riddles puzzle book' },
  { id: 'k16', category: 'books', name: 'Fantasy Epic Box Set',               icon: '🐉', price: 60, description: 'Complete series — dragons, magic & adventure', search: 'fantasy epic series box set books' },
  { id: 'k17', category: 'books', name: 'Romantic Comedy Novel Set',          icon: '💕', price: 45, description: 'Feel-good reads perfect for gifting', search: 'romantic comedy novel set gift' },
  { id: 'k18', category: 'books', name: 'DIY Craft Kit (Macramé)',            icon: '🪢', price: 30, description: 'Everything you need to make your first wall hanging', search: 'macrame diy craft kit beginners' },
  { id: 'k19', category: 'books', name: 'Science & Space Poster Set',         icon: '🚀', price: 20, description: '6 illustrated posters for the curious mind', search: 'science space poster set educational' },
  { id: 'k20', category: 'books', name: 'Trivia Night Game (1000 questions)', icon: '❓', price: 25, description: 'Categories for the whole family', search: 'trivia quiz game 1000 questions family' },
  { id: 'k21', category: 'books', name: 'Vintage Map Art Print',             icon: '🗺️', price: 30, description: 'Choose any city — personalised wall art', search: 'personalised city map art print vintage' },

  // ── Experiences ───────────────────────────────────────────────────────────
  { id: 'e1',  category: 'experience', name: 'Spa Day Gift Card',              icon: '💆', price: 100, description: 'Let them choose their perfect treatment', search: 'spa day gift card massage facial' },
  { id: 'e2',  category: 'experience', name: 'Restaurant Gift Card',           icon: '🍽️', price: 75,  description: 'A great dinner experience on you', search: 'restaurant gift card dining experience' },
  { id: 'e3',  category: 'experience', name: 'Cooking Class (for Two)',        icon: '👨‍🍳', price: 120, description: 'Learn a new cuisine together', search: 'cooking class experience gift voucher' },
  { id: 'e4',  category: 'experience', name: 'Wine Tasting Experience',        icon: '🍷', price: 85,  description: 'Guided tasting with food pairing', search: 'wine tasting experience gift voucher' },
  { id: 'e5',  category: 'experience', name: 'Cocktail Making Class',          icon: '🍸', price: 65,  description: 'Mix craft cocktails like a pro', search: 'cocktail making class experience gift' },
  { id: 'e6',  category: 'experience', name: 'Pottery Class',                  icon: '🏺', price: 80,  description: 'Throw and glaze your own ceramics', search: 'pottery class experience gift beginner' },
  { id: 'e7',  category: 'experience', name: 'Hot Air Balloon Ride',           icon: '🎈', price: 250, description: 'Sunrise flight over breathtaking scenery', search: 'hot air balloon ride experience gift' },
  { id: 'e8',  category: 'experience', name: 'Paint & Sip Night',              icon: '🎨', price: 50,  description: 'Guided painting class with wine included', search: 'paint and sip night experience gift' },
  { id: 'e9',  category: 'experience', name: 'Escape Room (Group)',            icon: '🔐', price: 90,  description: 'Team puzzle-solving adventure', search: 'escape room experience group gift' },
  { id: 'e10', category: 'experience', name: 'Concert or Show Tickets',        icon: '🎤', price: 100, description: 'Live music or theatre — unforgettable', search: 'concert tickets live music experience gift' },
  { id: 'e11', category: 'experience', name: 'Afternoon Tea for Two',          icon: '🫖', price: 70,  description: 'Finger sandwiches, scones & luxury tea', search: 'afternoon tea experience gift voucher' },
  { id: 'e12', category: 'experience', name: 'Axe Throwing Session',           icon: '🪓', price: 55,  description: 'Surprisingly therapeutic & addictive', search: 'axe throwing experience session gift' },
  { id: 'e13', category: 'experience', name: 'Skydiving Experience',           icon: '🪂', price: 250, description: 'Tandem jump with a certified instructor', search: 'skydiving tandem experience gift' },
  { id: 'e14', category: 'experience', name: 'Surf Lesson',                    icon: '🏄', price: 80,  description: 'Learn to stand up and ride a wave', search: 'surf lesson beginner experience gift' },
  { id: 'e15', category: 'experience', name: 'Photography Workshop',           icon: '📸', price: 90,  description: 'Learn composition, lighting & editing', search: 'photography workshop class experience gift' },
  { id: 'e16', category: 'experience', name: 'Kayaking Tour',                  icon: '🚣', price: 70,  description: 'Guided paddle through scenic waterways', search: 'kayaking tour guided experience gift' },
  { id: 'e17', category: 'experience', name: 'Spa & Hotel Night Away',         icon: '🏨', price: 200, description: 'Full overnight wellness retreat', search: 'spa hotel overnight stay gift voucher' },
  { id: 'e18', category: 'experience', name: 'Archery Lesson',                 icon: '🏹', price: 45,  description: 'Channel your inner Robin Hood', search: 'archery lesson beginner experience gift' },
  { id: 'e19', category: 'experience', name: 'Ice Skating (Group)',            icon: '⛸️', price: 50,  description: 'Classic winter fun for all abilities', search: 'ice skating group experience gift' },
  { id: 'e20', category: 'experience', name: 'Virtual Reality Gaming',         icon: '🥽', price: 40,  description: 'Immersive VR experience — play together', search: 'virtual reality gaming experience gift' },
  { id: 'e21', category: 'experience', name: 'Candle-Making Workshop',         icon: '🕯️', price: 55,  description: 'Blend scents & pour your own candles', search: 'candle making workshop class experience gift' },

  // ── Sports & Outdoors ─────────────────────────────────────────────────────
  { id: 's1',  category: 'sports', name: 'Yoga Mat (Premium)',             icon: '🧘', price: 80,  description: 'Non-slip, eco-friendly, 6mm cushioning', search: 'premium yoga mat non slip gift' },
  { id: 's2',  category: 'sports', name: 'Hydration Backpack',             icon: '🎒', price: 65,  description: '2L water bladder, fits 15L of gear', search: 'hydration backpack running hiking' },
  { id: 's3',  category: 'sports', name: 'Fitness Resistance Bands Set',   icon: '💪', price: 25,  description: '5 levels from light to extra-heavy', search: 'resistance bands set fitness workout' },
  { id: 's4',  category: 'sports', name: 'Camping Hammock',                icon: '🏕️', price: 40,  description: 'Lightweight, holds 400lbs, sets up in 2 min', search: 'camping hammock lightweight portable' },
  { id: 's5',  category: 'sports', name: 'GPS Running Watch',              icon: '🏃', price: 250, description: 'Pace, distance, heart rate & routes', search: 'gps running watch garmin sports' },
  { id: 's6',  category: 'sports', name: 'Adjustable Dumbbell Set',        icon: '🏋️', price: 200, description: 'Replace 15 sets — quick-change dial', search: 'adjustable dumbbell set home gym' },
  { id: 's7',  category: 'sports', name: 'Foam Roller (Deep Tissue)',      icon: '🧱', price: 35,  description: 'Pre- & post-workout muscle recovery', search: 'foam roller deep tissue massage recovery' },
  { id: 's8',  category: 'sports', name: 'Hiking Boot (Waterproof)',       icon: '🥾', price: 120, description: 'Ankle support, Vibram sole, Gore-Tex', search: 'waterproof hiking boots ankle support' },
  { id: 's9',  category: 'sports', name: 'Insulated Water Bottle (40oz)', icon: '💧', price: 45,  description: 'Keeps drinks cold 24h, hot 12h', search: 'insulated water bottle 40oz stanley' },
  { id: 's10', category: 'sports', name: 'Jump Rope (Speed)',              icon: '🪢', price: 20,  description: 'Bearing handles, adjustable length', search: 'speed jump rope fitness workout' },
  { id: 's11', category: 'sports', name: 'Outdoor Picnic Blanket',         icon: '🧺', price: 30,  description: 'Waterproof backing, folds into carry bag', search: 'waterproof outdoor picnic blanket' },
  { id: 's12', category: 'sports', name: 'Sports Wireless Earbuds',        icon: '🎵', price: 99,  description: 'Sweatproof, secure-fit hooks, 8hr battery', search: 'sport wireless earbuds sweatproof workout' },
  { id: 's13', category: 'sports', name: 'Bike Phone Mount',               icon: '🚴', price: 22,  description: 'Universal fit, quick-release, waterproof', search: 'bike phone mount universal waterproof' },
  { id: 's14', category: 'sports', name: 'Pull-Up Bar (Doorframe)',        icon: '🏠', price: 35,  description: 'No screws, fits most doorframes', search: 'doorframe pull up bar no screws' },
  { id: 's15', category: 'sports', name: 'Pickleball Set',                 icon: '🏓', price: 55,  description: 'The fastest-growing sport — 4 paddles & balls', search: 'pickleball set paddles balls game' },
  { id: 's16', category: 'sports', name: 'Camping Lantern (Solar)',        icon: '🌞', price: 30,  description: 'Collapsible, USB-rechargeable, 350 lumens', search: 'solar camping lantern collapsible usb' },
  { id: 's17', category: 'sports', name: 'Kettlebell (Adjustable)',        icon: '⚖️', price: 60,  description: 'Replaces multiple weights in one', search: 'adjustable kettlebell home gym' },
  { id: 's18', category: 'sports', name: 'Frisbee Disc Set',               icon: '🥏', price: 25,  description: 'Ultimate & disc golf set', search: 'frisbee disc set ultimate outdoor' },
  { id: 's19', category: 'sports', name: 'Marathon Running Belt',          icon: '🏅', price: 28,  description: 'Slim phone & key holder, bounce-free', search: 'running belt marathon phone holder' },
  { id: 's20', category: 'sports', name: 'Weighted Hula Hoop',             icon: '⭕', price: 30,  description: '1kg smart hoop, great core workout', search: 'weighted hula hoop fitness exercise' },
  { id: 's21', category: 'sports', name: 'Climbing Starter Kit',           icon: '🧗', price: 90,  description: 'Harness, chalk bag & carabiner set', search: 'climbing starter kit harness chalk bag' },

  // ── Food & Drink ──────────────────────────────────────────────────────────
  { id: 'd1',  category: 'food', name: 'Premium Chocolate Gift Box',       icon: '🍫', price: 45,  description: 'Artisan truffles & chocolate bars', search: 'premium chocolate gift box artisan' },
  { id: 'd2',  category: 'food', name: 'Wine & Cheese Hamper',             icon: '🍷', price: 90,  description: 'Curated red & white with aged cheeses', search: 'wine cheese hamper gift set' },
  { id: 'd3',  category: 'food', name: 'Gourmet Popcorn Variety Pack',     icon: '🍿', price: 30,  description: '12 flavours from sweet to savoury', search: 'gourmet popcorn variety pack gift' },
  { id: 'd4',  category: 'food', name: 'Hot Sauce Collection (10-pack)',   icon: '🌶️', price: 35,  description: 'Mild to nuclear — for the spice lover', search: 'hot sauce collection variety pack gift' },
  { id: 'd5',  category: 'food', name: 'Specialty Coffee Sampler',         icon: '☕', price: 40,  description: 'Single-origin beans from 6 countries', search: 'specialty coffee sampler gift set beans' },
  { id: 'd6',  category: 'food', name: 'Luxury Tea Gift Set',              icon: '🍵', price: 35,  description: 'Curated loose-leaf teas with infuser', search: 'luxury tea gift set loose leaf infuser' },
  { id: 'd7',  category: 'food', name: 'Charcuterie & Snack Board Kit',   icon: '🧀', price: 55,  description: 'Meats, cheeses, crackers & jams', search: 'charcuterie board kit gift snack' },
  { id: 'd8',  category: 'food', name: 'Cocktail Mixer Gift Set',          icon: '🍸', price: 50,  description: '8 craft mixers — gin, rum, vodka pairings', search: 'cocktail mixer gift set craft' },
  { id: 'd9',  category: 'food', name: 'Truffle & Olive Oil Collection',   icon: '🫒', price: 60,  description: 'Gourmet condiments for the foodie', search: 'truffle olive oil gift set gourmet' },
  { id: 'd10', category: 'food', name: 'Cookie Decorating Kit',            icon: '🍪', price: 30,  description: 'Pre-made dough, cutters & icing colours', search: 'cookie decorating kit gift baking' },
  { id: 'd11', category: 'food', name: 'Beer Advent Calendar',             icon: '🍺', price: 65,  description: '24 craft beers from around the world', search: 'beer advent calendar craft gift' },
  { id: 'd12', category: 'food', name: 'Champagne & Prosecco Gift Set',    icon: '🥂', price: 75,  description: 'Celebrate in style — with flutes', search: 'champagne prosecco gift set celebration' },
  { id: 'd13', category: 'food', name: 'Macaron Gift Box (24-piece)',       icon: '🎂', price: 40,  description: 'Authentic French macarons in pastel flavours', search: 'macaron gift box french 24 piece' },
  { id: 'd14', category: 'food', name: 'Sushi Making Kit',                  icon: '🍣', price: 35,  description: 'Mat, rice paddle, nori & chopsticks', search: 'sushi making kit gift beginner' },
  { id: 'd15', category: 'food', name: 'BBQ & Grilling Spice Set',         icon: '🔥', price: 30,  description: '8 rubs & seasonings for the grill master', search: 'bbq grilling spice rub set gift' },
  { id: 'd16', category: 'food', name: 'Artisan Honey Collection',         icon: '🍯', price: 40,  description: 'Raw, infused & creamed honey varieties', search: 'artisan honey collection gift set' },
  { id: 'd17', category: 'food', name: 'Pasta Making Kit',                 icon: '🍝', price: 45,  description: 'Flour, cutter, drying rack & recipe book', search: 'pasta making kit gift beginner' },
  { id: 'd18', category: 'food', name: 'Japanese Snack Box (30 items)',     icon: '🍡', price: 35,  description: 'Unique treats sourced directly from Japan', search: 'japanese snack box subscription gift' },
  { id: 'd19', category: 'food', name: 'Cheese of the Month Club',         icon: '🧀', price: 80,  description: 'Artisan cheeses delivered monthly', search: 'cheese of the month club gift subscription' },
  { id: 'd20', category: 'food', name: 'Olive Oil & Balsamic Tasting Set', icon: '🫙', price: 50,  description: 'Premium imported oils & aged vinegars', search: 'olive oil balsamic vinegar tasting set gift' },
  { id: 'd21', category: 'food', name: 'Brownie & Fudge Gift Tower',       icon: '🍫', price: 55,  description: 'Stacked tins of indulgent chocolatey treats', search: 'brownie fudge gift tower set' },
];

// Build full product objects with derived URLs
function buildProducts() {
  return PRODUCTS.map((p) => ({
    ...p,
    amazon_url: amzUrl(p.search),
  }));
}

const ALL_PRODUCTS = buildProducts();

function searchProducts(q) {
  if (!q?.trim()) return ALL_PRODUCTS;
  const terms = q.toLowerCase().split(/\s+/);
  return ALL_PRODUCTS.filter((p) =>
    terms.some((t) =>
      p.name.toLowerCase().includes(t) ||
      p.description.toLowerCase().includes(t) ||
      p.search.toLowerCase().includes(t) ||
      p.category.toLowerCase().includes(t)
    )
  );
}

function getByCategory(category) {
  return ALL_PRODUCTS.filter((p) => p.category === category);
}

module.exports = { ALL_PRODUCTS, searchProducts, getByCategory };

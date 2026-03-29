/**
 * knowledge-base.js
 * ─────────────────
 * This is the SINGLE SOURCE OF TRUTH for all business content used by the
 * chat widget. Update this file with your real details — no other file needs
 * to be touched for content changes.
 *
 * All fields marked with ← UPDATE are placeholders you should replace.
 */

export const kb = {

  business: {
    name: 'NextStop Africa Tours Agency',
    tagline: "Explore Africa's Beauty, Culture & Adventure",
    description:
      'A people-centred tourism company creating authentic African travel experiences. ' +
      'We connect travellers with the real Africa — its people, cultures, nature, and history — ' +
      'through professionally guided tours and fully tailor-made packages.',
    email: 'inquire@visitafricatt.com',
    phone: '+256 770 307890 | +32 476 821973',
    location: 'Uganda (East Africa) & Belgium (Europe)',  // ← UPDATE if needed
    social: {
      // ← UPDATE with real handles
      instagram: '',
      facebook: '',
      whatsapp: '+256770307890'
    }
  },

  pages: {
    home: {
      url: '/',
      filename: 'index.html',
      description:
        'The main landing page. Covers tourism activities (wildlife, adventure, cultural), ' +
        'featured destinations, why choose us, our story, and contact details.'
    },
    brochure: {
      url: '/brochure.html',
      filename: 'brochure.html',
      description:
        'The packages brochure page. Contains full tour package listings with detailed ' +
        'itineraries, pricing, durations, and what is included per destination.'
    }
  },

  services: [
    {
      name: 'Safari & Wildlife Tours',
      description:
        'Guided game drives across Africa\'s most iconic national parks and reserves.',
      duration: '3–14 days depending on destination',
      price: 'From $800 per person',  // ← UPDATE with real pricing
      highlights: [
        'Big Five game drives',
        'Gorilla and chimpanzee trekking',
        'Birdwatching and wildlife photography',
        'Night safaris and canoe safaris'
      ]
    },
    {
      name: 'Cultural & Heritage Tours',
      description:
        'Immersive experiences with local communities, ancient kingdoms, and UNESCO sites.',
      duration: '3–10 days',
      price: 'From $600 per person',  // ← UPDATE
      highlights: [
        'Traditional village visits',
        'Historical monuments and museums',
        'Cultural festivals and storytelling nights',
        'Slave route heritage tours (Benin)'
      ]
    },
    {
      name: 'Adventure & Outdoor Packages',
      description:
        'For thrill-seekers: mountain climbing, desert expeditions, and more.',
      duration: '2–12 days',
      price: 'From $500 per person',  // ← UPDATE
      highlights: [
        'Mount Kilimanjaro climbing (Tanzania)',
        'Sahara camel trekking (Morocco/Algeria)',
        'Hot-air balloon rides',
        'Bungee jumping, ziplining, paragliding'
      ]
    },
    {
      name: 'Tailor-Made Custom Packages',
      description:
        'We build a fully personalised itinerary around your country choice, activities, ' +
        'travel dates, group size, and budget.',
      duration: 'Flexible',
      price: 'Quote on request',
      highlights: [
        'Any African country',
        'Solo, couple, family, or group travel',
        'Budget to luxury options',
        'End-to-end logistics and guide arrangement'
      ]
    }
  ],

  destinations: [
    {
      name: 'Uganda',
      tagline: 'The Pearl of Africa',
      highlights: 'Mountain gorillas, source of the Nile, Bwindi Impenetrable Forest, chimpanzee trekking.',
      bestTime: 'June–September & December–February',
      activities: ['Gorilla trekking', 'Wildlife safaris', 'Nile boat cruises', 'Cultural village tours', 'Mountain hiking']
    },
    {
      name: 'Tanzania',
      tagline: 'Safari Capital of Africa',
      highlights: 'Serengeti, Ngorongoro Crater, Mount Kilimanjaro, Zanzibar beaches.',
      bestTime: 'June–October (safari), December–February (beaches)',
      activities: ['Serengeti & Ngorongoro safaris', 'Kilimanjaro climbing', 'Zanzibar beach holidays', 'Maasai cultural visits']
    },
    {
      name: 'Kenya',
      tagline: 'The Original Safari Experience',
      highlights: 'Masai Mara, Maasai culture, white-sand beaches.',
      bestTime: 'July–October & January–March',
      activities: ['Masai Mara game drives', 'Maasai cultural tours', 'Beach holidays', 'Mountain hiking']
    },
    {
      name: 'Rwanda',
      tagline: 'Land of a Thousand Hills',
      highlights: 'Gorilla trekking, Volcanoes National Park, Lake Kivu, forest canopy walks.',
      bestTime: 'June–September & December–February',
      activities: ['Gorilla trekking', 'Forest canopy walk', 'Lake Kivu relaxation', 'Cultural & historical tours']
    },
    {
      name: 'Benin',
      tagline: 'Cradle of African Spirituality',
      highlights: 'Ancient kingdoms, voodoo culture, Ganvié stilt village, slave route heritage.',
      bestTime: 'November–March',
      activities: ['Royal palace tours', 'Ganvié stilt village canoe rides', 'Voodoo festival visits', 'Slave route heritage tours']
    },
    {
      name: 'Morocco',
      tagline: 'Where Africa Meets Europe',
      highlights: 'Sahara Desert, Atlas Mountains, ancient medinas, hammam culture.',
      bestTime: 'March–May & September–November',
      activities: ['Sahara camel trekking', 'Medina shopping tours', 'Atlas Mountains trekking', 'Food & hammam experiences']
    },
    {
      name: 'Algeria',
      tagline: "Sahara's Best Kept Secret",
      highlights: 'Vast desert landscapes, Roman ruins, Tassili n\'Ajjer rock art, Tuareg culture.',
      bestTime: 'October–April',
      activities: ['Sahara desert expeditions', 'Rock art exploration', 'Roman ruins tours', 'Tuareg cultural experiences']
    },
    {
      name: 'Other African Countries',
      tagline: 'Your Dream Destination',
      highlights: 'We cover the entire African continent. Tell us your dream and we\'ll craft the itinerary.',
      bestTime: 'All year round',
      activities: ['Custom itinerary for any African country', 'Activity-based destination guidance']
    }
  ],

  faqs: [
    {
      q: 'Do you offer tailor-made tours?',
      a: 'Absolutely! Every itinerary we create is fully customised to your destination choice, preferred activities, travel dates, group size, and budget. Just reach out and we\'ll build it around you.'
    },
    {
      q: 'What is the best time to visit Africa?',
      a: 'It depends on the destination. East Africa (Uganda, Kenya, Tanzania, Rwanda) is best June–October. North Africa (Morocco, Algeria) is ideal October–April. We can advise based on your preferred countries.'
    },
    {
      q: 'Do you cater to all budget levels?',
      a: 'Yes — from budget-conscious explorers to luxury seekers. We have beautifully crafted packages for every type of traveller and can advise on the best value options.'
    },
    {
      q: 'Are your guides professionally trained?',
      a: 'Yes. Our guides are expert local professionals who know Africa intimately — its wildlife, cultures, history, and the best times and places to be. Many hold formal guiding qualifications.'
    },
    {
      q: 'How do I book a tour?',
      a: 'You can reach us by email at inquire@visitafricatt.com or by phone/WhatsApp on +256 770 307890 or +32 476 821973. You can also view our brochure at /brochure.html for package ideas before getting in touch.'
    },
    {
      q: 'Is travel to Africa safe?',
      a: 'The destinations we specialise in are well-established tourism routes with good safety records. We stay up to date with local conditions and our guides are experienced in keeping travellers safe and comfortable.'
    },
    {
      q: 'Can I see pricing before contacting you?',
      a: 'Our brochure page (/brochure.html) contains package pricing guides. For a precise quote tailored to your group size and dates, we recommend getting in touch directly.'
    }
  ],

  bookingInfo: {
    howToBook:
      'Contact us by email (inquire@visitafricatt.com) or WhatsApp (+256 770 307890). ' +
      'We\'ll discuss your interests, suggest an itinerary, and send a personalised quote.',
    depositPolicy:
      '30% deposit required to confirm your booking.', // ← UPDATE if different
    cancellationPolicy:
      'Cancellations made 30+ days before departure receive a full refund of the deposit. ' +
      'Within 30 days, the deposit is non-refundable.', // ← UPDATE with your real policy
    groupSize:
      'We cater to solo travellers, couples, families, and groups of any size.',
    paymentMethods:
      'Bank transfer, mobile money, and major credit cards accepted.' // ← UPDATE
  },

  aboutUs: {
    mission: 'We are a people-centred tourism company creating authentic African experiences. Our mission is to connect travelers with the real Africa — its people, cultures, nature, and history — through professionally guided tours and fully tailor-made packages.',
    story: 'From lush rainforests to golden deserts, from gorillas to ancient kingdoms, Africa offers the world\'s most diverse and authentic travel experiences. Our company connects you to nature, culture, and adventure with professionally guided tours and tailor-made packages.',
    impact: 'Every journey leaves a deeper understanding of who we are and what we aspire to become as a continent.'
  },

  whyChooseUs: [
    {
      title: 'People-Centred',
      description: 'We put people first — including our clients and the communities we visit. Every tour supports local guides, businesses, and families.'
    },
    {
      title: 'Authentic Experiences',
      description: 'We don\'t do tourist traps. We connect you with real Africa — its true culture, genuine communities, and unfiltered beauty.'
    },
    {
      title: 'Expert Local Guides',
      description: 'Our professionally trained guides know Africa intimately. They know its stories, secrets, and the best moments to be in the right place.'
    },
    {
      title: 'Fully Tailor-Made',
      description: 'Choose your country, your activities, your pace, your budget. We build the journey around you, not the other way around.'
    },
    {
      title: 'All Budget Levels',
      description: 'From budget-conscious explorers to luxury seekers, we have beautifully crafted packages for every type of traveller.'
    },
    {
      title: 'Responsible Tourism',
      description: 'We travel with purpose. Our tours minimise environmental impact, support conservation, and give back to local communities.'
    }
  ],

  tourismActivities: {
    wildlifeAndNature: {
      category: 'Wildlife & Nature',
      activities: [
        'Safari game drives',
        'Walking safaris',
        'Birdwatching',
        'Whale watching',
        'Gorilla trekking',
        'Chimpanzee trekking',
        'Elephant tracking',
        'Wildlife photography',
        'Night safaris',
        'Canoe safaris',
        'River cruises',
        'Wildlife sanctuaries',
        'National parks exploration',
        'Botanical gardens'
      ]
    },
    adventureAndOutdoor: {
      category: 'Adventure & Outdoor Activities',
      activities: [
        'Hiking',
        'Mountain climbing',
        'Rock climbing',
        'Dune bashing',
        'Camel trekking',
        'Horseback riding',
        'Mountain biking',
        'Ziplining',
        'Paragliding',
        'Skydiving',
        'Bungee jumping',
        'Camping',
        'Quad biking (ATV)',
        'Hot-air balloon rides'
      ]
    },
    culturalAndHistorical: {
      category: 'Cultural & Historical Activities',
      activities: [
        'Historical monuments',
        'Museums',
        'Ancient ruins',
        'Old cities and medinas',
        'UNESCO heritage sites',
        'Cultural festivals',
        'Traditional dance',
        'Traditional villages',
        'Storytelling nights'
      ]
    }
  },

  indexPageContent: {
    heroTitle: 'Explore Africa\'s Beauty, Culture & Adventure',
    heroDescription: 'From lush rainforests to golden deserts, from gorillas to ancient kingdoms, Africa offers the world\'s most diverse and authentic travel experiences.',
    whatYouCanDoText: 'From thrilling safaris to ancient cultural encounters, Africa offers experiences found nowhere else on Earth.',
    destinationsIntroText: 'We specialize in unforgettable travel experiences across Africa\'s most iconic landscapes.',
    callToAction: 'View our detailed brochure for full itineraries, package options, and pricing information for all our destinations.'
  },

  brochurePageContent: {
    title: 'Africa Tour Packages & Pricing Brochure',
    description: 'Complete packages with detailed itineraries, day-by-day journey plans, pricing for all budget levels (Budget, Standard, Luxury), and customizable options for each African destination we offer.',
    sections: [
      'Hero Section: Company introduction and value proposition',
      'Countries Banner: Clickable navigation to each destination\'s journey plans',
      'Our Story: About NextStop Africa Tours Agency',
      'Day-by-Day Journey Plans: Detailed itineraries for Uganda, Algeria, Benin, Kenya, Tanzania, Morocco, Rwanda, and Other African Countries',
      'Pricing Table: Complete pricing for Budget, Standard, and Luxury packages across all destinations',
      'Ready to Explore Africa Section: Contact information and inquiry form for bookings'
    ],
    packageTiers: {
      budget: 'Affordable options for cost-conscious travelers with comfortable accommodations and activities',
      standard: 'Mid-range packages balancing comfort and experience for most travelers',
      luxury: 'Premium packages with high-end accommodations and VIP experiences'
    }
  }
}

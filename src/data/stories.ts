import { Dimensions } from 'react-native';

export const LOCK = require('../assets/lock.png');
export const SHARE_ICON = require('../assets/divider.png'); 
export const CHEVRON = require('../assets/chevron_right.png'); 
export const GUIDE = require('../assets/guide1.png'); 

const IMG_BLOSSOM = require('../assets/blossom.png');
const IMG_BUFFALO = require('../assets/buffalo.png');
const IMG_CITRUS = require('../assets/citrus.png');
const IMG_COIN = require('../assets/coin_gate.png');
const IMG_FALCON = require('../assets/falcon_chapel.png');
const IMG_WHARF = require('../assets/old_wharf.png');
const IMG_STEPS = require('../assets/battery_steps.png');
const IMG_CASCADES = require('../assets/cascades_factory.png');
const IMG_SALAMANCA = require('../assets/salamanca.png');
const IMG_GAOL = require('../assets/gaol_ruins.png');

export type StoryPin = {
  id: string;
  title: string;
  coordsText: string;
  lat: number;
  lng: number;
  locked?: boolean;
  image: any;
  description: string;
};

export const stories: StoryPin[] = [
  {
    id: '1',
    title: 'Blossom Shrine',
    coordsText: '–42.8828, 147.3252',
    lat: -42.8828,
    lng: 147.3252,
    locked: false,
    image: IMG_BLOSSOM,
    description:
      'Hidden inside an old garden stands a small wooden pavilion carved with floral motifs. Local lore says a young woman named Saya once lived here — a quiet oracle who believed flowers spoke truths no one else could hear.\n\nVillagers visited her to seek clarity: family troubles, journeys, broken promises. It was said her lotus glowed faintly whenever the answer carried great weight.\n\nOne morning, Saya vanished. Only a single lotus remained in the shrine — untouched by time, petals impossibly fresh.\n\nAt sunrise, the pavilion is said to whisper. Those who sit there long enough claim to hear advice drift through the air like perfume.\n\nSome visitors still report glimpsing the reflection of a woman in nearby puddles, even when no one is standing there.',
  },
  {
    id: '2',
    title: 'Buffalo Ridge Lookout',
    coordsText: '–42.8971, 147.3107',
    lat: -42.8971,
    lng: 147.3107,
    locked: false,
    image: IMG_BUFFALO,
    description:
      'This rocky plateau is tied to an old tale of three guardian buffalo spirits who protected an underground spring — a source of pure water hidden deep beneath the cliffs.\n\nShepherds in the 1800s described seeing massive glowing silhouettes moving in synchronized arcs at night, as if guarding the land.\n\nEarly explorers once attempted to dig for the spring, but the ground trembled violently and the excavation abruptly stopped. Days later, the pits mysteriously collapsed on their own.\n\nToday, hikers take photos at the lookout, sometimes capturing strange violet reflections resembling watchful eyes.\n\nGeologists blame mineral fluorescence — but the legend remains stronger than the science.',
  },
  {
    id: '3',
    title: 'Citrus Vault',
    coordsText: '–42.8763, 147.3331',
    lat: -42.8763,
    lng: 147.3331,
    locked: false,
    image: IMG_CITRUS,
    description:
      'The air here carries an odd citrus scent — even in winter. According to local stories, this hill once housed a hidden workshop run by a mysterious brewer known only as “The Green Maker.”\n\nSailors believed his tonic revived strength during long voyages. Recipes were kept secret, guarded with absolute loyalty.\n\nAfter a fire destroyed the workshop, the scent lingered. At night, the faint clink of bottles can still be heard echoing through the slope.\n\nOccasionally, old engraved glass bottles are unearthed here, although no one knows if any contained the original brew.\n\nEntrepreneurs now visit the site hoping for “good fortune when starting something new.”',
  },
  {
    id: '4',
    title: "Emperor’s Coin Gate",
    coordsText: '–42.8820, 147.3278',
    lat: -42.882,
    lng: 147.3278,
    locked: false,
    image: IMG_COIN,
    description:
      'Before modern buildings stood here, residents found strange golden tokens scattered near the crossroads. Legends said a dragon-messenger guarded a doorway between worlds, leaving coins as warnings or blessings.\n\nMerchants believed that finding a coin before dawn meant upcoming success in trade. Some claimed every deal prospered afterward.\n\nDuring construction works in the 20th century, workers often reported seeing flashes of gold buried in soil — disappearing the moment they tried to dig them up.\n\nArchaeologists later found a handful of ancient Chinese tokens nearby.\n\nLocals say if you hold one of these coins at sunset, you might glimpse the pupil of a dragon forming in the fading light.',
  },
  {
    id: '5',
    title: 'Falcon Sun Chapel',
    coordsText: '–42.8855, 147.3121',
    lat: -42.8855,
    lng: 147.3121,
    locked: false,
    image: IMG_FALCON,
    description:
      'Known as the “Sun’s Eye Chapel,” this small sanctuary honors a tale of a lost traveler saved by a falcon. Exhausted and out of water, he followed the bird circling above one particular spot.\n\nThere, he discovered a spring — and years later, the chapel was built on that very ground.\n\nSailors later visited the site, believing the falcon spirit guided them safely through storms.\n\nInside, a gilded mural glows whenever sunlight enters through the narrow eastern window. The light catches it perfectly, as though by design.\n\nVisitors claim the chapel feels unusually calm, as if watched over by something patient and ancient.',
  },

  {
    id: '6',
    title: 'Old Wharf Docks',
    coordsText: '–42.8810, 147.3320',
    lat: -42.881,
    lng: 147.332,
    locked: false,
    image: IMG_WHARF,
    description:
      'The Old Wharf was Hobart’s maritime heart in the 19th century, bustling with whaling ships and merchant vessels that shaped Tasmania’s early economy.\n\nWarehouses, wooden piers, and shipyards once filled the shoreline, creating constant noise, movement, and danger.\n\nSome stonework still bears the scars of heavy use: rust marks from anchors, rope abrasions, and iron rings hammered into place centuries ago.\n\nArchaeologists continue to uncover pottery, tools, and fragments of sailors’ belongings in the mud.\n\nToday, restored areas blend history with waterfront cafés — a rare mix of rough past and modern calm.',
  },
  {
    id: '7',
    title: 'Battery Point Steps',
    coordsText: '–42.8875, 147.3312',
    lat: -42.8875,
    lng: 147.3312,
    locked: false,
    image: IMG_STEPS,
    description:
      'These hand-built sandstone steps lead into one of Hobart’s oldest neighborhoods. Battery Point was named after the artillery battery installed here in 1818 to defend the harbor.\n\nCraftsmen carved each block by hand, hauling stone from local quarries in harsh conditions.\n\nFrom the top of the stairs, soldiers once watched for approaching ships, ready to sound the alarm.\n\nNow the area is peaceful, lined with colonial cottages and quiet streets.\n\nThe steps symbolize a passage between Hobart’s early military past and its modern charm.',
  },
  {
    id: '8',
    title: 'Cascades Female Factory',
    coordsText: '–42.8970, 147.3083',
    lat: -42.897,
    lng: 147.3083,
    locked: true,
    image: IMG_CASCADES,
    description:
      'This former women’s prison is one of Australia’s most significant convict sites. Built in the early 1800s, it housed transported women and their children.\n\nConditions were severe: overwork, overcrowding, and strict discipline. Yet the women formed underground networks of support and education.\n\nEach courtyard tells a different story — punishment yards, nurseries, and dormitories where thousands lived and struggled.\n\nToday, the site operates as a museum, commemorating the resilience of the women who passed through its gates.\n\nIt is now part of the UNESCO World Heritage listing of convict sites.',
  },
  {
    id: '9',
    title: 'Salamanca Warehouses',
    coordsText: '–42.8850, 147.3305',
    lat: -42.885,
    lng: 147.3305,
    locked: false,
    image: IMG_SALAMANCA,
    description:
      'Constructed in the 1830s from golden local sandstone, these long warehouse terraces once stored wool, timber, and imported goods.\n\nWorkers from many countries labored here: sailors, traders, wharfmen. The area buzzed with commerce day and night.\n\nSome cellars still show original markings used for organizing shipments.\n\nModern Salamanca has evolved into a cultural hub with markets, galleries, and street performances.\n\nYet beneath the lively atmosphere lies the industrial backbone of early Hobart.',
  },
  {
    id: '10',
    title: 'Hobart Gaol Ruins',
    coordsText: '–42.8805, 147.3209',
    lat: -42.8805,
    lng: 147.3209,
    locked: false,
    image: IMG_GAOL,
    description:
      'Built in 1821, this early prison held a wide range of inmates — from petty thieves to political escapees.\n\nIt began as a wooden stockade, later replaced by imposing stone buildings as convict populations increased.\n\nDiscipline was harsh: isolation cells, long hours of labor, and minimal comfort. Many inmates left carvings on remaining walls.\n\nThe gaol gradually declined after newer facilities were constructed, leaving behind haunting fragments of the original complex.\n\nVisitors describe a strange stillness here, as if the stones remember everything.',
  },
];

export const sortStories = (arr: StoryPin[]) =>
  [...arr].sort((a, b) => Number(!!a.locked) - Number(!!b.locked));

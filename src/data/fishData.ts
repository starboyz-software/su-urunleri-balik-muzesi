import { 
  Waves, Info, Clock, Anchor, Zap, Droplet, Wind, Database, Shield, Activity, 
  Heart, Star, Eye, Compass, Target, Award, Box, Cpu, Camera, Coffee, 
  Book, Bookmark, Cloud, Sun, Moon, Battery, Bell, Bluetooth, Cast, Code, 
  Command, Copy, Crop, Crosshair, HelpCircle, Layers, LifeBuoy, Link, List, 
  Maximize, Mic, Fish, Image as ImageIcon, TrendingUp, AlertTriangle, Search
} from 'lucide-react-native';

export const CATEGORIES_DATA = [
  { id: 'all', nameKey: 'categories.cat_all', icon: Waves, screen: 'Marine', filter: 'all' },
  { id: 'endemic', nameKey: 'categories.cat_endemic', icon: Award, screen: 'Marine', filter: 'Endemic' },
  { id: 'economic', nameKey: 'categories.cat_economic', icon: TrendingUp, screen: 'Marine', filter: 'Economic' },
  { id: 'predator', nameKey: 'categories.cat_predator', icon: Zap, screen: 'Marine', filter: 'Predator' },
  { id: 'protected', nameKey: 'categories.cat_protected', icon: Shield, screen: 'Marine', filter: 'Protected' },
];

export const DID_YOU_KNOW_DATA = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  titleKey: `dyk.${i + 1}.title`,
  textKey: `dyk.${i + 1}.text`,
  icon: [
    Info, Clock, Anchor, Zap, Droplet, Wind, Database, Shield, Activity, Waves, 
    Heart, Star, Eye, Compass, Target, Award, Box, Cpu, Camera, Coffee, 
    Book, Bookmark, Cloud, Sun, Moon, Battery, Bell, Bluetooth, Cast, Code, 
    Command, Copy, Crop, Crosshair, HelpCircle, Layers, LifeBuoy, Link, List, 
    Maximize, Mic, Fish, ImageIcon, Star, Heart, Activity, Shield, Database, Droplet, Zap
  ][i % 50] || Info
}));

export const ALL_FISH_DATA = [
  { 
    id: 'lufer', 
    nameKey: 'fish.lufer.name', 
    image: require('../../assets/images/fish_image/lufer.png'), 
    tagKey: 'fish.lufer.tag', 
    category: 'Predator',
    descriptionKey: 'fish.lufer.description',
    species: 'Pomatomus saltatrix'
  },
  { 
    id: 'cipura', 
    nameKey: 'fish.cipura.name', 
    image: require('../../assets/images/fish_image/cipura.png'), 
    tagKey: 'fish.cipura.tag', 
    category: 'Economic',
    descriptionKey: 'fish.cipura.description',
    species: 'Sparus aurata'
  },
  { 
    id: 'kefal', 
    nameKey: 'fish.kefal.name', 
    image: require('../../assets/images/fish_image/kefal.png'), 
    tagKey: 'fish.kefal.tag', 
    category: 'River',
    descriptionKey: 'fish.kefal.description',
    species: 'Mugil cephalus'
  },
  { 
    id: 'gun_baligi', 
    nameKey: 'fish.gun_baligi.name', 
    image: require('../../assets/images/fish_image/gun_baligi.png'), 
    tagKey: 'fish.gun_baligi.tag', 
    category: 'Protected',
    descriptionKey: 'fish.gun_baligi.description',
    species: 'Thalassoma pavo'
  },
  { 
    id: 'kum_mercani', 
    nameKey: 'fish.kum_mercani.name', 
    image: require('../../assets/images/fish_image/kum_mercani.png'), 
    tagKey: 'fish.kum_mercani.tag', 
    category: 'Economic',
    descriptionKey: 'fish.kum_mercani.description',
    species: 'Lithognathus mormyrus'
  },
  { 
    id: 'levrek', 
    nameKey: 'fish.levrek.name', 
    image: require('../../assets/images/fish_image/levrek.png'), 
    tagKey: 'fish.levrek.tag', 
    category: 'Predator',
    descriptionKey: 'fish.levrek.description',
    species: 'Dicentrarchus labrax'
  },
  { 
    id: 'yazili_hani', 
    nameKey: 'fish.yazili_hani.name', 
    image: require('../../assets/images/fish_image/yazili_hani.png'), 
    tagKey: 'fish.yazili_hani.tag', 
    category: 'Protected',
    descriptionKey: 'fish.yazili_hani.description',
    species: 'Serranus scriba'
  },
  { 
    id: 'sarikuyruk_istavrit', 
    nameKey: 'fish.sarikuyruk_istavrit.name', 
    image: require('../../assets/images/fish_image/sarikuyruk_istavrit.png'), 
    tagKey: 'fish.sarikuyruk_istavrit.tag', 
    category: 'Economic',
    descriptionKey: 'fish.sarikuyruk_istavrit.description',
    species: 'Trachurus trachurus'
  },
  { 
    id: 'kupes', 
    nameKey: 'fish.kupes.name', 
    image: require('../../assets/images/fish_image/kupes.png'), 
    tagKey: 'fish.kupes.tag', 
    category: 'Economic',
    descriptionKey: 'fish.kupes.description',
    species: 'Boops boops'
  }
];

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
    id: 'alabalik', 
    nameKey: 'fish.alabalik.name', 
    image: require('../../assets/images/fish_image/alabalik.png'), 
    tagKey: 'fish.alabalik.tag', 
    category: 'Economic',
    descriptionKey: 'fish.alabalik.description',
    species: 'Salmo trutta'
  },
  { 
    id: 'benekli_siraz', 
    nameKey: 'fish.benekli_siraz.name', 
    image: require('../../assets/images/fish_image/benekli_siraz.png'), 
    tagKey: 'fish.benekli_siraz.tag', 
    category: 'River',
    descriptionKey: 'fish.benekli_siraz.description',
    species: 'Capoeta trutta'
  },
  { 
    id: 'biyikli', 
    nameKey: 'fish.biyikli.name', 
    image: require('../../assets/images/fish_image/biyikli.png'), 
    tagKey: 'fish.biyikli.tag', 
    category: 'River',
    descriptionKey: 'fish.biyikli.description',
    species: 'Barbus barbus'
  },
  { 
    id: 'bizir', 
    nameKey: 'fish.bizir.name', 
    image: require('../../assets/images/fish_image/bizir.png'), 
    tagKey: 'fish.bizir.tag', 
    category: 'River',
    descriptionKey: 'fish.bizir.description',
    species: 'Barbus grypus'
  },
  { 
    id: 'caner', 
    nameKey: 'fish.caner.name', 
    image: require('../../assets/images/fish_image/caner.png'), 
    tagKey: 'fish.caner.tag', 
    category: 'Predator',
    descriptionKey: 'fish.caner.description',
    species: 'Luciobarbus esocinus'
  },
  { 
    id: 'elazig_sirazi', 
    nameKey: 'fish.elazig_sirazi.name', 
    image: require('../../assets/images/fish_image/elazig_sirazi.png'), 
    tagKey: 'fish.elazig_sirazi.tag', 
    category: 'Endemic',
    descriptionKey: 'fish.elazig_sirazi.description',
    species: 'Capoeta umbla'
  },
  { 
    id: 'gumus', 
    nameKey: 'fish.gumus.name', 
    image: require('../../assets/images/fish_image/gumus.png'), 
    tagKey: 'fish.gumus.tag', 
    category: 'River',
    descriptionKey: 'fish.gumus.description',
    species: 'Atherina boyeri'
  },
  { 
    id: 'kefal', 
    nameKey: 'fish.kefal.name', 
    image: require('../../assets/images/fish_image/kefal.png'), 
    tagKey: 'fish.kefal.tag', 
    category: 'Economic',
    descriptionKey: 'fish.kefal.description',
    species: 'Squalius cephalus'
  },
  { 
    id: 'kizilkanat', 
    nameKey: 'fish.kizilkanat.name', 
    image: require('../../assets/images/fish_image/kizilkanat.png'), 
    tagKey: 'fish.kizilkanat.tag', 
    category: 'River',
    descriptionKey: 'fish.kizilkanat.description',
    species: 'Scardinius erythrophthalmus'
  },
  { 
    id: 'kupeli', 
    nameKey: 'fish.kupeli.name', 
    image: require('../../assets/images/fish_image/kupeli.png'), 
    tagKey: 'fish.kupeli.tag', 
    category: 'River',
    descriptionKey: 'fish.kupeli.description',
    species: 'Barbus xanthopterus'
  },
  { 
    id: 'sabut', 
    nameKey: 'fish.sabut.name', 
    image: require('../../assets/images/fish_image/sabut.png'), 
    tagKey: 'fish.sabut.tag', 
    category: 'Economic',
    descriptionKey: 'fish.sabut.description',
    species: 'Arabibarbus grypus'
  },
  { 
    id: 'sazan', 
    nameKey: 'fish.sazan.name', 
    image: require('../../assets/images/fish_image/sazan.png'), 
    tagKey: 'fish.sazan.tag', 
    category: 'Economic',
    descriptionKey: 'fish.sazan.description',
    species: 'Cyprinus carpio'
  },
  { 
    id: 'sazan_aynali', 
    nameKey: 'fish.sazan_aynali.name', 
    image: require('../../assets/images/fish_image/sazan_aynali.png'), 
    tagKey: 'fish.sazan_aynali.tag', 
    category: 'Economic',
    descriptionKey: 'fish.sazan_aynali.description',
    species: 'Cyprinus carpio (Aynalı)'
  },
  { 
    id: 'tas_isiran', 
    nameKey: 'fish.tas_isiran.name', 
    image: require('../../assets/images/fish_image/tas_isiran.png'), 
    tagKey: 'fish.tas_isiran.tag', 
    category: 'Endemic',
    descriptionKey: 'fish.tas_isiran.description',
    species: 'Cobitis elazigensis'
  },
  { 
    id: 'yayin', 
    nameKey: 'fish.yayin.name', 
    image: require('../../assets/images/fish_image/yayin.png'), 
    tagKey: 'fish.yayin.tag', 
    category: 'Predator',
    descriptionKey: 'fish.yayin.description',
    species: 'Silurus glanis'
  },
  { 
    id: 'yilan', 
    nameKey: 'fish.yilan.name', 
    image: require('../../assets/images/fish_image/yilan.png'), 
    tagKey: 'fish.yilan.tag', 
    category: 'Protected',
    descriptionKey: 'fish.yilan.description',
    species: 'Anguilla anguilla'
  }
];

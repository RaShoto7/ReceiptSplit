// Database of food items for intelligent autocomplete
// Organized by category for better suggestions

export interface FoodItem {
  name: string;
  category: string;
  keywords: string[];
  avgPrice?: number;
}

export const foodDatabase: FoodItem[] = [
  // === BURGERS ===
  { name: 'Big Mac', category: 'burger', keywords: ['big', 'mac', 'bigmac', 'mcdo', 'mcdonald'] },
  { name: 'Cheeseburger', category: 'burger', keywords: ['cheese', 'burger', 'fromage'] },
  { name: 'Double Cheese', category: 'burger', keywords: ['double', 'cheese', 'dc'] },
  { name: 'Whopper', category: 'burger', keywords: ['whop', 'whopper', 'bk', 'burger king'] },
  { name: 'McChicken', category: 'burger', keywords: ['mc', 'chicken', 'mcchi', 'poulet'] },
  { name: 'Filet-O-Fish', category: 'burger', keywords: ['filet', 'fish', 'poisson'] },
  { name: 'Royal Deluxe', category: 'burger', keywords: ['royal', 'deluxe'] },
  { name: 'CBO', category: 'burger', keywords: ['cbo', 'chicken', 'bacon', 'onion'] },
  { name: 'Bacon Burger', category: 'burger', keywords: ['bacon', 'burg'] },
  { name: 'Veggie Burger', category: 'burger', keywords: ['veggie', 'vegan', 'végé'] },

  // === STEAKS & VIANDES ===
  { name: 'Steak', category: 'viande', keywords: ['st', 'steak', 'boeuf', 'beef'] },
  { name: 'Steak Frites', category: 'viande', keywords: ['steak', 'frites', 'sf'] },
  { name: 'Entrecôte', category: 'viande', keywords: ['entre', 'entrecote', 'côte'] },
  { name: 'Côte de Boeuf', category: 'viande', keywords: ['cote', 'boeuf', 'beef'] },
  { name: 'Bavette', category: 'viande', keywords: ['bav', 'bavette'] },
  { name: 'Filet Mignon', category: 'viande', keywords: ['filet', 'mignon'] },
  { name: 'Tartare', category: 'viande', keywords: ['tart', 'tartare'] },
  { name: 'Carpaccio', category: 'viande', keywords: ['carp', 'carpaccio'] },
  { name: 'Poulet Rôti', category: 'viande', keywords: ['poulet', 'roti', 'chicken'] },
  { name: 'Magret de Canard', category: 'viande', keywords: ['magret', 'canard', 'duck'] },
  { name: 'Côtelettes d\'Agneau', category: 'viande', keywords: ['cotelette', 'agneau', 'lamb'] },

  // === PIZZAS ===
  { name: 'Pizza Margherita', category: 'pizza', keywords: ['marg', 'margherita', 'margarita'] },
  { name: 'Pizza 4 Fromages', category: 'pizza', keywords: ['4', 'fromage', 'quattro', 'formaggi'] },
  { name: 'Pizza Pepperoni', category: 'pizza', keywords: ['pepp', 'pepperoni'] },
  { name: 'Pizza Reine', category: 'pizza', keywords: ['reine', 'regina'] },
  { name: 'Pizza Calzone', category: 'pizza', keywords: ['calz', 'calzone'] },
  { name: 'Pizza Napolitaine', category: 'pizza', keywords: ['napo', 'napoli'] },
  { name: 'Pizza Hawaienne', category: 'pizza', keywords: ['hawa', 'hawaii', 'ananas'] },
  { name: 'Pizza Végétarienne', category: 'pizza', keywords: ['vege', 'légumes'] },
  { name: 'Pizza Kebab', category: 'pizza', keywords: ['kebab', 'turque'] },

  // === PÂTES ===
  { name: 'Spaghetti Bolognaise', category: 'pates', keywords: ['spag', 'bolo', 'bolognaise'] },
  { name: 'Spaghetti Carbonara', category: 'pates', keywords: ['carbo', 'carbonara'] },
  { name: 'Penne Arrabiata', category: 'pates', keywords: ['penne', 'arrabi', 'piquant'] },
  { name: 'Lasagnes', category: 'pates', keywords: ['las', 'lasagne', 'lasagna'] },
  { name: 'Tagliatelles', category: 'pates', keywords: ['tagli', 'tagliatelle'] },
  { name: 'Ravioli', category: 'pates', keywords: ['rav', 'ravioli'] },
  { name: 'Gnocchi', category: 'pates', keywords: ['gno', 'gnocchi'] },
  { name: 'Risotto', category: 'pates', keywords: ['ris', 'risotto'] },

  // === SALADES ===
  { name: 'Salade César', category: 'salade', keywords: ['cesar', 'caesar', 'poulet'] },
  { name: 'Salade Niçoise', category: 'salade', keywords: ['nic', 'nicoise', 'thon'] },
  { name: 'Salade Grecque', category: 'salade', keywords: ['grec', 'feta'] },
  { name: 'Salade Chèvre Chaud', category: 'salade', keywords: ['chevre', 'chaud', 'goat'] },
  { name: 'Salade Composée', category: 'salade', keywords: ['composee', 'mixte'] },

  // === SUSHI & JAPONAIS ===
  { name: 'Sushi', category: 'japonais', keywords: ['sushi', 'sus'] },
  { name: 'Maki', category: 'japonais', keywords: ['maki', 'mak'] },
  { name: 'California Roll', category: 'japonais', keywords: ['calif', 'california', 'roll'] },
  { name: 'Sashimi', category: 'japonais', keywords: ['sash', 'sashimi'] },
  { name: 'Ramen', category: 'japonais', keywords: ['ram', 'ramen', 'nouilles'] },
  { name: 'Gyoza', category: 'japonais', keywords: ['gyo', 'gyoza', 'ravioli'] },
  { name: 'Tempura', category: 'japonais', keywords: ['temp', 'tempura', 'beignet'] },
  { name: 'Edamame', category: 'japonais', keywords: ['eda', 'edamame', 'soja'] },
  { name: 'Yakitori', category: 'japonais', keywords: ['yaki', 'brochette'] },
  { name: 'Chirashi', category: 'japonais', keywords: ['chira', 'chirashi'] },

  // === ASIATIQUE ===
  { name: 'Pad Thaï', category: 'asiatique', keywords: ['pad', 'thai', 'nouilles'] },
  { name: 'Curry', category: 'asiatique', keywords: ['curry', 'cur'] },
  { name: 'Riz Cantonais', category: 'asiatique', keywords: ['riz', 'canton', 'cantonais'] },
  { name: 'Nem', category: 'asiatique', keywords: ['nem', 'nems', 'rouleau'] },
  { name: 'Bo Bun', category: 'asiatique', keywords: ['bo', 'bun', 'bobun'] },
  { name: 'Pho', category: 'asiatique', keywords: ['pho', 'soupe', 'vietnamien'] },
  { name: 'Poulet Général Tao', category: 'asiatique', keywords: ['tao', 'general', 'poulet'] },
  { name: 'Boeuf aux Oignons', category: 'asiatique', keywords: ['boeuf', 'oignon'] },

  // === FAST FOOD ===
  { name: 'Nuggets', category: 'fastfood', keywords: ['nug', 'nugget', 'chicken'] },
  { name: 'Frites', category: 'fastfood', keywords: ['frit', 'frites', 'patate', 'french'] },
  { name: 'Onion Rings', category: 'fastfood', keywords: ['onion', 'ring', 'oignon'] },
  { name: 'Hot Dog', category: 'fastfood', keywords: ['hot', 'dog', 'saucisse'] },
  { name: 'Wrap', category: 'fastfood', keywords: ['wrap', 'tortilla'] },
  { name: 'Tacos', category: 'fastfood', keywords: ['taco', 'tacos', 'mexicain'] },
  { name: 'Kebab', category: 'fastfood', keywords: ['keb', 'kebab', 'döner'] },
  { name: 'Sandwich', category: 'fastfood', keywords: ['sand', 'sandwich'] },
  { name: 'Panini', category: 'fastfood', keywords: ['pan', 'panini'] },
  { name: 'Croque-Monsieur', category: 'fastfood', keywords: ['croque', 'monsieur'] },

  // === ENTRÉES ===
  { name: 'Soupe', category: 'entree', keywords: ['soup', 'soupe', 'potage'] },
  { name: 'Soupe à l\'Oignon', category: 'entree', keywords: ['oignon', 'onion', 'gratinée'] },
  { name: 'Bruschetta', category: 'entree', keywords: ['brusch', 'bruschetta'] },
  { name: 'Foie Gras', category: 'entree', keywords: ['foie', 'gras'] },
  { name: 'Escargots', category: 'entree', keywords: ['escarg', 'escargot', 'snail'] },
  { name: 'Huîtres', category: 'entree', keywords: ['huitre', 'oyster'] },
  { name: 'Charcuterie', category: 'entree', keywords: ['charcut', 'jambon', 'saucisson'] },
  { name: 'Fromage', category: 'entree', keywords: ['fromage', 'cheese'] },

  // === POISSONS & FRUITS DE MER ===
  { name: 'Saumon', category: 'poisson', keywords: ['saum', 'saumon', 'salmon'] },
  { name: 'Saumon Grillé', category: 'poisson', keywords: ['saumon', 'grille', 'grill'] },
  { name: 'Thon', category: 'poisson', keywords: ['thon', 'tuna'] },
  { name: 'Cabillaud', category: 'poisson', keywords: ['cab', 'cabillaud', 'cod'] },
  { name: 'Moules', category: 'poisson', keywords: ['moule', 'mussel'] },
  { name: 'Moules Frites', category: 'poisson', keywords: ['moule', 'frite'] },
  { name: 'Crevettes', category: 'poisson', keywords: ['crev', 'crevette', 'shrimp'] },
  { name: 'Fish & Chips', category: 'poisson', keywords: ['fish', 'chip'] },
  { name: 'Calamars', category: 'poisson', keywords: ['calam', 'calamari', 'squid'] },

  // === DESSERTS ===
  { name: 'Tiramisu', category: 'dessert', keywords: ['tira', 'tiramisu'] },
  { name: 'Fondant au Chocolat', category: 'dessert', keywords: ['fond', 'chocolat', 'moelleux'] },
  { name: 'Crème Brûlée', category: 'dessert', keywords: ['crem', 'brulee'] },
  { name: 'Tarte aux Pommes', category: 'dessert', keywords: ['tarte', 'pomme', 'apple'] },
  { name: 'Tarte au Citron', category: 'dessert', keywords: ['tarte', 'citron', 'lemon'] },
  { name: 'Mousse au Chocolat', category: 'dessert', keywords: ['mousse', 'chocolat'] },
  { name: 'Profiteroles', category: 'dessert', keywords: ['profit', 'profiterole'] },
  { name: 'Panna Cotta', category: 'dessert', keywords: ['panna', 'cotta'] },
  { name: 'Glace', category: 'dessert', keywords: ['glace', 'ice', 'gelato'] },
  { name: 'Sorbet', category: 'dessert', keywords: ['sorb', 'sorbet'] },
  { name: 'Cheesecake', category: 'dessert', keywords: ['cheese', 'cake'] },
  { name: 'Brownie', category: 'dessert', keywords: ['brown', 'brownie'] },
  { name: 'Macaron', category: 'dessert', keywords: ['mac', 'macaron'] },
  { name: 'Éclair', category: 'dessert', keywords: ['eclair', 'éclair'] },
  { name: 'Café Gourmand', category: 'dessert', keywords: ['cafe', 'gourm'] },

  // === BOISSONS ===
  { name: 'Coca-Cola', category: 'boisson', keywords: ['coca', 'cola', 'coke'] },
  { name: 'Coca Zéro', category: 'boisson', keywords: ['coca', 'zero', 'light'] },
  { name: 'Sprite', category: 'boisson', keywords: ['spri', 'sprite'] },
  { name: 'Fanta', category: 'boisson', keywords: ['fanta', 'orange'] },
  { name: 'Orangina', category: 'boisson', keywords: ['orang', 'orangina'] },
  { name: 'Perrier', category: 'boisson', keywords: ['perr', 'perrier', 'gazeuse'] },
  { name: 'Eau', category: 'boisson', keywords: ['eau', 'water', 'evian', 'vittel'] },
  { name: 'Jus d\'Orange', category: 'boisson', keywords: ['jus', 'orange', 'juice'] },
  { name: 'Limonade', category: 'boisson', keywords: ['limo', 'limonade', 'lemonade'] },
  { name: 'Ice Tea', category: 'boisson', keywords: ['ice', 'tea', 'thé'] },

  // === BOISSONS CHAUDES ===
  { name: 'Café', category: 'boisson', keywords: ['caf', 'cafe', 'coffee', 'expresso'] },
  { name: 'Cappuccino', category: 'boisson', keywords: ['capp', 'cappuccino'] },
  { name: 'Latte', category: 'boisson', keywords: ['latt', 'latte'] },
  { name: 'Thé', category: 'boisson', keywords: ['the', 'thé', 'tea'] },
  { name: 'Chocolat Chaud', category: 'boisson', keywords: ['choco', 'chocolat', 'chaud'] },

  // === ALCOOLS ===
  { name: 'Bière', category: 'alcool', keywords: ['biere', 'beer', 'pinte'] },
  { name: 'Bière Pression', category: 'alcool', keywords: ['pression', 'draft'] },
  { name: 'Cocktail', category: 'alcool', keywords: ['cock', 'cocktail'] },
  { name: 'Mojito', category: 'alcool', keywords: ['moj', 'mojito'] },
  { name: 'Margarita', category: 'alcool', keywords: ['marga', 'margarita'] },
  { name: 'Spritz', category: 'alcool', keywords: ['spritz', 'aperol'] },
  { name: 'Vin Rouge', category: 'alcool', keywords: ['vin', 'rouge', 'wine', 'red'] },
  { name: 'Vin Blanc', category: 'alcool', keywords: ['vin', 'blanc', 'white'] },
  { name: 'Rosé', category: 'alcool', keywords: ['rose', 'rosé'] },
  { name: 'Champagne', category: 'alcool', keywords: ['champ', 'champagne'] },
  { name: 'Digestif', category: 'alcool', keywords: ['digest', 'digestif'] },
  { name: 'Whisky', category: 'alcool', keywords: ['whisk', 'whisky', 'bourbon'] },
  { name: 'Rhum', category: 'alcool', keywords: ['rhum', 'rum'] },

  // === MENUS ===
  { name: 'Menu', category: 'menu', keywords: ['menu', 'formule'] },
  { name: 'Menu Enfant', category: 'menu', keywords: ['enfant', 'kid', 'child'] },
  { name: 'Menu du Jour', category: 'menu', keywords: ['jour', 'daily', 'plat'] },
  { name: 'Best Of', category: 'menu', keywords: ['best', 'of', 'mcdo'] },
  { name: 'Maxi Best Of', category: 'menu', keywords: ['maxi', 'best', 'large'] },

  // === SUPPLÉMENTS ===
  { name: 'Supplément Fromage', category: 'supplement', keywords: ['suppl', 'fromage', 'extra'] },
  { name: 'Supplément Sauce', category: 'supplement', keywords: ['sauce', 'suppl'] },
  { name: 'Pain', category: 'supplement', keywords: ['pain', 'bread'] },
  { name: 'Sauce', category: 'supplement', keywords: ['sauce'] },
];

// Function to get suggestions based on input
export function getSuggestions(input: string, limit: number = 8): FoodItem[] {
  if (!input || input.length < 1) return [];

  const searchTerm = input.toLowerCase().trim();
  const results: { item: FoodItem; score: number }[] = [];

  for (const item of foodDatabase) {
    let score = 0;

    // Check name match
    const nameLower = item.name.toLowerCase();
    if (nameLower.startsWith(searchTerm)) {
      score += 100; // Exact start match
    } else if (nameLower.includes(searchTerm)) {
      score += 50; // Contains match
    }

    // Check keywords
    for (const keyword of item.keywords) {
      if (keyword.startsWith(searchTerm)) {
        score += 80; // Keyword start match
      } else if (keyword.includes(searchTerm)) {
        score += 30; // Keyword contains
      }
    }

    if (score > 0) {
      results.push({ item, score });
    }
  }

  // Sort by score and return top matches
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.item);
}

// Get category icon
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    burger: '🍔',
    viande: '🥩',
    pizza: '🍕',
    pates: '🍝',
    salade: '🥗',
    japonais: '🍣',
    asiatique: '🍜',
    fastfood: '🍟',
    entree: '🥄',
    poisson: '🐟',
    dessert: '🍰',
    boisson: '🥤',
    alcool: '🍺',
    menu: '📋',
    supplement: '➕',
  };
  return icons[category] || '🍽️';
}

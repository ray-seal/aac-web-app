export interface AacSymbol {
  id: string;
  text: string;
  imagePath: string;
  category: string;
}

export const aacSymbols: AacSymbol[] = [
  {
    id: 'hello',
    text: 'hello',
    imagePath: '/aac-images/hello.svg',
    category: 'greetings'
  },
  {
    id: 'water',
    text: 'water',
    imagePath: '/aac-images/water.svg',
    category: 'needs'
  },
  {
    id: 'eat',
    text: 'eat',
    imagePath: '/aac-images/eat.svg',
    category: 'actions'
  },
  {
    id: 'play',
    text: 'play',
    imagePath: '/aac-images/play.svg',
    category: 'actions'
  },
  {
    id: 'more',
    text: 'more',
    imagePath: '/aac-images/more.svg',
    category: 'descriptors'
  },
  {
    id: 'help',
    text: 'help',
    imagePath: '/aac-images/help.svg',
    category: 'needs'
  },
  {
    id: 'stop',
    text: 'stop',
    imagePath: '/aac-images/stop.svg',
    category: 'actions'
  },
  {
    id: 'yes',
    text: 'yes',
    imagePath: '/aac-images/yes.svg',
    category: 'responses'
  },
  {
    id: 'no',
    text: 'no',
    imagePath: '/aac-images/no.svg',
    category: 'responses'
  },
  
  {
    id: 'cheese',
    text: 'Cheese',
    imagePath: '/aac-images/cheese.jpeg',
    category: 'food'
  },
  
  {
    id: 'chocolate',
    text: 'Chocolate',
    imagePath: '/aac-images/chocolate.png',
    category: 'food'
  },
  
  {
    id: 'drink',
    text: 'Drink',
    imagePath: '/aac-images/drink.png',
    category: 'food'
  },
  
  {
    id: 'i want',
    text: 'I want',
    imagePath: '/aac-images/i-want.jpg',
    category: 'actions'
  },
  
  {
    id: 'icecream',
    text: 'Icecream',
    imagePath: '/aac-images/icecream.jpeg',
    category: 'food'
  },
  
  {
    id: 'meds',
    text: 'meds',
    imagePath: '/aac-images/meds.jpg',
    category: 'actions'
  },
  
  {
    id: 'sleep',
    text: 'Sleep',
    imagePath: '/aac-images/sleep.png',
    category: 'actions'
  },
  
  {
    id: 'yoghurt',
    text: 'Yoghurt',
    imagePath: '/aac-images/yoghurt.jpeg',
    category: 'actions'
  },
];

export const categories = ['all', 'greetings', 'needs', 'actions', 'descriptors', 'responses'];

export interface AacSymbol {
  id: string;
  text: string;
  imagePath: string;
  category: string;
}

export const aacSymbols: AacSymbol[] = [
  {
    id: 'i want',
    text: 'I want',
    imagePath: '/aac-images/i-want.jpg',
    category: 'actions'
  },
  {
    id: 'hello',
    text: 'Hello',
    imagePath: '/aac-images/hello.svg',
    category: 'greetings'
  },
  
  {
    id: 'eat',
    text: 'To eat',
    imagePath: '/aac-images/eat.svg',
    category: 'actions'
  },
  {
    id: 'more',
    text: 'More',
    imagePath: '/aac-images/more.svg',
    category: 'descriptors'
  },
  {
    id: 'help',
    text: 'Help',
    imagePath: '/aac-images/help.svg',
    category: 'needs'
  },
  {
    id: 'stop',
    text: 'Stop',
    imagePath: '/aac-images/stop.svg',
    category: 'actions'
  },
  {
    id: 'yes',
    text: 'Yes',
    imagePath: '/aac-images/yes.svg',
    category: 'responses'
  },
  {
    id: 'no',
    text: 'No',
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
    id: 'icecream',
    text: 'Icecream',
    imagePath: '/aac-images/icecream.jpeg',
    category: 'food'
  },
  
  {
    id: 'meds',
    text: 'Take meds',
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
    category: 'food'
  },
   {
    id: 'toilet',
    text: 'Toilet',
    imagePath: '/aac-images/toilet.jpg',
    category: 'actions'
  },
   {
    id: 'food',
    text: 'Food',
    imagePath: '/aac-images/food.jpg',
    category: 'actions'
  },
   {
    id: 'underwear',
    text: 'Underwear',
    imagePath: '/aac-images/underwear.jpg',
    category: 'actions'
  },
   {
    id: 'tablet',
    text: 'Tablet',
    imagePath: '/aac-images/tablet.jpg',
    category: 'things'
  },
 {
    id: 'school',
    text: 'Go to school',
    imagePath: '/aac-images/school.jpg',
    category: 'places'
  },
   {
    id: 'home',
    text: 'Go home',
    imagePath: '/aac-images/home.png',
    category: 'places'
  },
 {
    id: 'car',
    text: 'Go in the car',
    imagePath: '/aac-images/car.jpg',
    category: 'activities'
  },
 {
    id: 'crisps',
    text: 'Crisps',
    imagePath: '/aac-images/crisps.jpg',
    category: 'food'
  },
 {
    id: 'egg',
    text: 'Egg',
    imagePath: '/aac-images/egg.jpg',
    category: 'food'
  },
 {
    id: 'apple',
    text: 'Apple',
    imagePath: '/aac-images/apple.jpg',
    category: 'food'
  },
 {
    id: 'shoes-on',
    text: 'Put shoes on',
    imagePath: '/aac-images/shoes-on.jpg',
    category: 'actions'
  },
 {
    id: 'chicken',
    text: 'Chicken',
    imagePath: '/aac-images/chicken.jpg',
    category: 'food'
  },
 {
    id: 'macncheese',
    text: 'Mac N Cheese',
    imagePath: '/aac-images/macncheese.jpg',
    category: 'food'
  },
 {
    id: 'bath',
    text: 'Bath',
    imagePath: '/aac-images/bath.jpg',
    category: 'actions'
  },
 {
    id: 'pasta',
    text: 'Pasta',
    imagePath: '/aac-images/pasta.jpg',
    category: 'food'
  },
 {
    id: 'brush hair',
    text: 'Brush hair',
    imagePath: '/aac-images/brush-hair.jpg',
    category: 'actions'
  },
 {
    id: 'brush teeth',
    text: 'Brush teeth',
    imagePath: '/aac-images/brush-teeth.jpg',
    category: 'actions'
  },

];

export const categories = ['all', 'greetings', 'needs', 'actions', 'descriptors', 'responses'];

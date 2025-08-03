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
  }
];

export const categories = ['all', 'greetings', 'needs', 'actions', 'descriptors', 'responses'];
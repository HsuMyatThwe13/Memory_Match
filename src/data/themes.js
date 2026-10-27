const img = (id) => `/images/cards/${id}.png`;
const bg = (id) => `/images/backgrounds/${id}.png`;
const items = (list) => list.map(([id, label]) => ({ id, label, src: img(id) }));

export const BACK = img("back-img");
export const HOME_BG = bg("bgHome");
export const MENU_BG = bg("bgDefault");

export const THEMES = [
  {
    id: "animals", label: "Animals", cover: img("animalTheme"), bg: bg("bgAnimals"),
    items: items([["bear", "Bear"], ["cat", "Cat"], ["cow", "Cow"], ["dog", "Dog"], ["elephant", "Elephant"],
      ["fish", "Fish"], ["giraffe", "Giraffe"], ["lion", "Lion"], ["monkey", "Monkey"], ["pupple", "Puppy"]]),
  },
  {
    id: "fruits", label: "Fruits", cover: img("fruitTheme"), bg: bg("bgFruits"),
    items: items([["apple", "Apple"], ["avocado", "Avocado"], ["banana", "Banana"], ["dragon-fruit", "Dragon fruit"],
      ["grape", "Grape"], ["pineapple", "Pineapple"], ["strawberry", "Strawberry"],
      ["tangerine", "Tangerine"], ["watermelon", "Watermelon"]]),
  },
  {
    id: "colors", label: "Colors", cover: img("colorTheme"), bg: bg("bgColors"),
    items: items([["blue", "Blue"], ["brown", "Brown"], ["green", "Green"], ["light-blue", "Light blue"],
      ["orange", "Orange"], ["pink", "Pink"], ["purple", "Purple"], ["red", "Red"], ["yellow", "Yellow"]]),
  },
];

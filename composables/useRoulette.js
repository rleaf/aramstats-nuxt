export const useRoulette = () => {
   const roulette = [
      'https://preview.redd.it/dhywo66hzm7d1.jpeg?auto=webp&s=283c651d3956bb6492688825a1c941c5b65acedd',
      'https://preview.redd.it/jdskl1qgy46d1.jpeg?auto=webp&s=38a508dedcec217b3fabd248da0113e98999adb6',
      'https://i.redd.it/6p956lq5yiq81.jpg',
      'https://i.redd.it/k8obvr07gfb91.png',
      'https://i.redd.it/uek3ydziwvtb1.jpg',
      'https://i.redd.it/5l3ooufx99ta1.jpg',
      'https://i.redd.it/sz2ffo73jkqa1.jpg',
      'https://preview.redd.it/bf0e45pkfche1.jpeg?auto=webp&s=4ea27e264e42e94adf0f4fe58c4b71dd06ce7001',
      'https://i.redd.it/49wyhrrefa4e1.jpeg',
   ]

   const dice = useState(() => Math.floor(Math.random() * roulette.length))
   
   return roulette[dice.value]
}
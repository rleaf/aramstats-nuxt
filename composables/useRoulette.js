export const useRoulette = () => {
   const roulette = [
      'https://preview.redd.it/jdskl1qgy46d1.jpeg?auto=webp&s=38a508dedcec217b3fabd248da0113e98999adb6',
      'https://i.redd.it/6p956lq5yiq81.jpg',
      'https://i.redd.it/k8obvr07gfb91.png',
      'https://i.redd.it/uek3ydziwvtb1.jpg',
      'https://i.redd.it/5l3ooufx99ta1.jpg',
      'https://i.redd.it/sz2ffo73jkqa1.jpg',
      'https://preview.redd.it/bf0e45pkfche1.jpeg?auto=webp&s=4ea27e264e42e94adf0f4fe58c4b71dd06ce7001',
      'https://i.redd.it/49wyhrrefa4e1.jpeg',
      'https://i.redd.it/cep9w1o26i1h1.jpg',
      'https://i.redd.it/o31i3ajmppzg1.jpg',
      'https://preview.redd.it/gsxg7651y6tg1.jpeg?auto=webp&s=603dd675b40718c7de0665d66e8bf742aac6f49e',
      'https://preview.redd.it/1c7bs9ndaasg1.jpeg?auto=webp&s=8e5ee1a3925f86d6ad535c40f42685449daa8251',
      'https://preview.redd.it/wnh58o5w43sg1.jpeg?auto=webp&s=bf2e951531c225afdcb45972e8bf1a484855ce6e',
      'https://preview.redd.it/7j8shbejp0rg1.jpeg?auto=webp&s=d5df8ded2ff5ac927dbacfd5bffcd4eca389add6',
      'https://preview.redd.it/zy8caxla25ng1.jpeg?auto=webp&s=c6c3e7de2fc94622f896099e2bc17cf72c5b9324',
      'https://preview.redd.it/vdm261rsx3fg1.jpeg?auto=webp&s=76d6baf27335cd0e5249f6d9d237b910cf1630d9',
      'https://preview.redd.it/ouhwzbexuuzf1.jpeg?auto=webp&s=1a845318769384e37578b16602fb15126f74c66e',
      'https://i.redd.it/pm1g52umbpwf1.jpg',
   ]

   const dice = useState(() => Math.floor(Math.random() * roulette.length))
   
   return roulette[dice.value]
}
export type Category = 'university' | 'food' | 'parks' | 'leisure' | 'study';
export type FilterCategory = Category | 'all';

export interface Place {
  id: string;
  name: string;
  category: Category;
  coordinates: [number, number];
  address: string;
  description: string;
  details: string;
  studentReason: string;
  image: string;
  imageAlt: string;
  price: number;
  priceLabel: string;
  tags: string[];
  source?: string;
}

export const CAMPUS_COORDINATES: [number, number] = [52.249958, 104.264536];

export const categories: {
  id: FilterCategory;
  label: string;
  fullLabel: string;
  color: string;
  tint: string;
}[] = [
  { id: 'all', label: 'Все места', fullLabel: 'Все места', color: '#7660db', tint: '#f0ecfb' },
  { id: 'university', label: 'ВУЗ', fullLabel: 'ВУЗ / Главная точка', color: '#8064df', tint: '#f0ecfb' },
  { id: 'food', label: 'Еда и кофе', fullLabel: 'Еда / Кафе', color: '#d68a45', tint: '#fcf1e6' },
  { id: 'parks', label: 'Прогулки', fullLabel: 'Парки / Прогулки', color: '#589377', tint: '#eaf4ed' },
  { id: 'leisure', label: 'Досуг', fullLabel: 'Досуг / Интересные места', color: '#cc7592', tint: '#faedf2' },
  { id: 'study', label: 'Учёба', fullLabel: 'Учёба / Коворкинги', color: '#608bbd', tint: '#ecf2fa' },
];

// The faculty address is verified. Prices, amenities and walking times are demo estimates.
// Stock photographs illustrate the atmosphere, not the actual venue interiors.
export const places: Place[] = [
  {
    id: 'kofeynik',
    name: 'Ежевика',
    category: 'food',
    coordinates: [52.249131, 104.262432],
    address: 'Иркутск, Улан-Баторская ул., 2',
    description: 'Хороший кофе и вкусная еда, тёплая атмосфера и пауза между парами.',
    details: 'Небольшая кофейня в Академгородке. Можно взять капучино с собой или остаться с ноутбуком, чтобы дописать конспект за чашкой кофе.',
    studentReason: 'Близко к университету, уютно и удобно встретиться с одногруппниками. Кофе и небольшой перекус не съедят весь дневной бюджет.',
    image: 'https://avatars.mds.yandex.net/get-altay/5272526/2a000001821724c633d1b6c9712590851461/XXXL',
    imageAlt: 'Иллюстрация: уютная кофейня с растениями и тёплым светом',
    price: 300,
    studentDiscount: "Скидка студентам ИГУ 20%",
    priceLabel: '250-450 ₽',
    tags: ['Есть Wi-Fi', 'Кофе с собой'],
  },
  {
    id: 'angara',
    name: 'Площадка около библиотеки',
    category: 'parks',
    coordinates: [52.251266, 104.266517],
    address: 'Иркутск, место возле Иркутской областной государственной универсальной научной библиотеки им. И. И. Молчанова-Сибирского',
    description: 'Закрыть конспект, послушать шелест листьев и переключиться.',
    details: 'Тихий парк в шаге от книжных стеллажей. Здесь можно занять лавочку со своей книгой, выпить кофе на траве или просто пройтись по аллеям, когда глаза уже не смотрят в экран.',
    studentReason: 'Бесплатная перезагрузка без лишних движений. Удобно встретиться с одногруппниками между парами, переварить сложную теорию на свежем воздухе или устроить эстетичное свидание без трат на кафе.',
    image: 'https://www.irklib.ru/upload/iblock/b94/b94dce1887a824b3b0957141bf10bf89.jpg',
    imageAlt: 'Набережная в Иркутске, деревья и спокойная река в вечернем свете',
    price: 0,
    priceLabel: 'Бесплатно',
    tags: ['Место посидеть'],
  },
  {
    id: 'molchanovka',
    name: 'Библиотека им. И. И. Молчанова-Сибирского',
    category: 'study',
    coordinates: [52.251308, 104.267689],
    address: 'Иркутск, ул. Лермонтова, 253',
    description: 'Твоё тихое место для больших идей и маленьких дедлайнов.',
    details: 'Областная научная библиотека с читальными залами, книгами, электронными ресурсами и пространствами для самостоятельной работы. Для оформления читательского билета понадобится паспорт.',
    studentReason: 'Здесь проще сосредоточиться, чем в общежитии. Есть рабочие места, интернет и литература для курсовой, а ещё лекции и встречи с интересными людьми.',
    image: 'https://www.irklib.ru/upload/medialibrary/214/214336b38a06d9888ed1c008b5370553.jpg',
    imageAlt: 'Иллюстрация: светлая библиотека с книжными стеллажами',
    price: 0,
    priceLabel: 'Бесплатно',
    tags: ['Есть Wi-Fi', 'Тихое место'],
    source: 'https://www.irklib.ru/',
  },
  {
    id: 'canteen',
    name: 'Столовая',
    category: 'food',
    coordinates: [52.249958, 104.264536],
    address: 'Иркутск, ул. Лермонтова, 126, ИГУ, 1-й этаж',
    description: 'Полноценный обед без длинной дороги и лишних трат.',
    details: 'Университетская столовая. Простая домашняя еда, горячие обеды и выпечка. Попасть в здание можно по правилам пропускного режима ИГУ.',
    studentReason: 'Не нужно выходить из корпуса, чтобы пообедать между парами. Понятное меню и доступные цены делают это место удобной ежедневной остановкой.',
    image: 'https://fbki.isu.ru/file/570bf29d20524.jpg',
    imageAlt: 'Иллюстрация: обеденный зал с деревянными столами',
    price: 220,
    priceLabel: '180-300 ₽',
    tags: ['Бюджетно', 'В корпусе'],
  },
  {
    id: 'academic-park',
    name: 'Парк Академгородка',
    category: 'parks',
    coordinates: [52.249252, 104.265394],
    address: 'Иркутск, Академгородок, зелёная зона между ул. Лермонтова и ул. Фаворского',
    description: 'Зелёные тропинки, свежий воздух и никаких дедлайнов.',
    details: 'Зелёный уголок Академгородка с деревьями и прогулочными дорожками. Подойдёт для неспешной прогулки, утренней пробежки или перерыва на свежем воздухе.',
    studentReason: 'Можно ненадолго сменить обстановку, не уезжая из района университета. Возьми кофе, наушники или друга и выбери свою тропинку.',
    image: 'https://tulskieparki.ru/assets/images/proletarskii/fonovye/DSC_0306.JPG',
    imageAlt: 'Иллюстрация: зелёная аллея парка с деревьями и скамейками',
    price: 0,
    priceLabel: 'Бесплатно',
    tags: ['На свежем воздухе', 'Для пробежки'],
  },
  {
    id: 'coffee-like',
    name: 'Литературное кафе',
    category: 'food',
    coordinates: [52.251331, 104.267419],
    address: 'Иркутск, ул. Лермонтова, 253',
    description: 'Забежать за любимым напитком по дороге в университет.',
    details: 'Кофейная точка рядом с остановкой "Госуниверситет". В демо-подборке есть классический кофе, сезонные напитки и быстрые перекусы навынос.',
    studentReason: 'Удобная остановка по дороге на учёбу. Можно быстро взять напиток с собой и продолжить день без долгого ожидания.',
    image: 'https://avatars.mds.yandex.net/get-altay/10445027/2a0000018b808e2b71d24029467c7f2cc0ab/XXXL',
    imageAlt: 'Иллюстрация: чашка кофе и круассан на столе',
    studentDiscount: "Скидка студентам ИГУ 5%",
    price: 250,
    priceLabel: '200-350 ₽',
    tags: ['Кофе с собой', 'Быстрый перекус'],
  },
  {
    id: 'cinema',
    name: 'Федерация бокса',
    category: 'leisure',
    coordinates: [52.249471, 104.260039],
    address: 'Иркутск, Улан-Баторская ул., 4',
    description: 'Незабываемые эмоции',
    details: 'Место, чтобы заняться чем-то новым и улекательным.',
    studentReason: 'Разрядка энергии — отличный способ выплеснуть накопившееся напряжение после учёбы',
    image: 'https://paevskiydesign.ru/wp-content/uploads/2019/01/SAVAGE-boxing-gym-01-1920x1080.jpg',
    imageAlt: 'Спортивный зал',
    price: 350,
    priceLabel: '-',
    tags: ['Спорт', 'На вечер'],
    source: 'https://www.kino-irk.ru/',
  },
  {
    id: 'campus',
    name: 'ФБКИ ИГУ',
    category: 'university',
    coordinates: CAMPUS_COORDINATES,
    address: 'Иркутск, ул. Лермонтова, 126, VI корпус ИГУ',
    description: 'Твоя точка старта. А дальше начинается целый город.',
    details: 'Факультет бизнес-коммуникаций и информатики Иркутского государственного университета. Находится в VI учебном корпусе, в Академгородке. Именно отсюда мы считаем расстояние до остальных мест.',
    studentReason: 'Здесь встречаются будущие специалисты, рождаются проекты и находятся друзья. Student Map поможет узнать, что интересного есть за пределами аудитории.',
    image: 'https://avatars.mds.yandex.net/get-altay/226077/2a0000015e740e09aafad124b26b6d8f9aea/L_height',
    imageAlt: 'Иллюстрация: современное здание университета',
    price: 0,
    priceLabel: 'Точка старта',
    tags: ['VI корпус ИГУ', 'Наш университет'],
    source: 'https://fbki.isu.ru/',
  },
];

export const campus = places.find((place) => place.id === 'campus')!;

export function getCategory(id: FilterCategory) {
  return categories.find((category) => category.id === id)!;
}

export function walkingDistance(place: Place): number {
  // Haversine distance with a small detour factor is an estimate, not a routed distance.
  const radians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = radians(place.coordinates[0] - CAMPUS_COORDINATES[0]);
  const deltaLng = radians(place.coordinates[1] - CAMPUS_COORDINATES[1]);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(radians(CAMPUS_COORDINATES[0])) * Math.cos(radians(place.coordinates[0]))
    * Math.sin(deltaLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25;
}

export function walkingLabel(place: Place): string {
  const distance = walkingDistance(place);
  return distance < 50 ? 'В университете' : `~${Math.max(2, Math.ceil(distance / 78))} мин от ВУЗа`;
}

export function placeCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const noun = mod10 === 1 && mod100 !== 11 ? 'место' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'места' : 'мест';
  return `${count} ${noun}`;
}

export function routeUrl(place: Place): string {
  const start = place.id === 'campus' ? '' : CAMPUS_COORDINATES.join(',');
  const params = new URLSearchParams({
    mode: 'routes',
    rtext: `${start}~${place.coordinates.join(',')}`,
    rtt: 'pd',
  });
  return `https://yandex.ru/maps/?${params.toString()}`;
}
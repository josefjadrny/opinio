import type { Profile, Role } from '../types/profile';

function p(
  id: string, name: string, role: Role, countryCode: string,
  description: string, likes: number, dislikes: number,
  imageUrl?: string, hoursAgo?: number,
): Profile {
  return {
    id,
    name,
    role,
    imageUrl: imageUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=random`,
    countryCode,
    description,
    addedBy: 'system',
    createdAt: new Date(Date.now() - (hoursAgo ?? Math.random() * 72) * 3600000).toISOString(),
    likes,
    dislikes,
    myVote: null,
  };
}

export const SEED_PROFILES: Profile[] = [
  // Politicians
  p('1', 'Joe Biden', 'politician', 'US', 'Announced new infrastructure plan for rural America', 2840, 3150),
  p('2', 'Donald Trump', 'politician', 'US', 'Claims election was rigged, calls for new investigation', 4200, 5100),
  p('3', 'Volodymyr Zelenskyy', 'politician', 'UA', 'Addresses UN General Assembly, calls for continued support', 6200, 820),
  p('4', 'Emmanuel Macron', 'politician', 'FR', 'Pushes pension reform despite nationwide protests', 1200, 2800),
  p('5', 'Narendra Modi', 'politician', 'IN', 'Launches Digital India 2.0 initiative', 5100, 1900),
  p('6', 'Rishi Sunak', 'politician', 'GB', 'Announces new AI regulation framework', 980, 1450),
  p('7', 'Justin Trudeau', 'politician', 'CA', 'Proposes carbon tax increase for 2025', 1100, 2300),
  p('8', 'Olaf Scholz', 'politician', 'DE', 'Commits to increasing defense spending', 750, 1100),
  p('9', 'Javier Milei', 'politician', 'AR', 'Cuts government spending by 30%, sparks debate', 3800, 2900),
  p('10', 'Lula da Silva', 'politician', 'BR', 'Announces Amazon deforestation crackdown', 2100, 1400),
  p('11', 'Xi Jinping', 'politician', 'CN', 'Expands Belt and Road Initiative to new regions', 1200, 4500),
  p('12', 'Fumio Kishida', 'politician', 'JP', 'Increases military budget amid regional tensions', 900, 600),
  p('13', 'Recep Erdogan', 'politician', 'TR', 'Blocks social media platforms during protests', 400, 3200),

  // Actors
  p('14', 'Keanu Reeves', 'actor', 'US', 'Donates entire Matrix salary to cancer research', 8900, 120),
  p('15', 'Leonardo DiCaprio', 'actor', 'US', 'Launches new climate change documentary', 4500, 800),
  p('16', 'Margot Robbie', 'actor', 'AU', 'Produces new indie film about refugee crisis', 3200, 350),
  p('17', 'Shah Rukh Khan', 'actor', 'IN', 'Breaks box office records with latest release', 6100, 700),
  p('18', 'Cate Blanchett', 'actor', 'AU', 'Speaks at UN about refugee rights', 2800, 200),
  p('19', 'Will Smith', 'actor', 'US', 'Returns to public eye after controversy', 1200, 4200),
  p('20', 'Gal Gadot', 'actor', 'IL', 'Controversial social media post about conflict', 1800, 3100),
  p('21', 'Tom Hanks', 'actor', 'US', 'Warns about AI-generated deepfakes using his likeness', 5400, 180),
  p('22', 'Penelope Cruz', 'actor', 'ES', 'Opens arts foundation for underprivileged youth', 2100, 150),

  // Musicians
  p('23', 'Taylor Swift', 'musician', 'US', 'Endorses voter registration, crashes website', 7800, 2100, '/avatars/23.jpg'),
  p('24', 'Bad Bunny', 'musician', 'US', 'Speaks out about Puerto Rico recovery efforts', 4100, 600),
  p('25', 'BTS', 'musician', 'KR', 'Members begin military service, fans show support', 9200, 300),
  p('26', 'Beyonce', 'musician', 'US', 'Announces free concert series in underserved communities', 6500, 800),
  p('27', 'Ed Sheeran', 'musician', 'GB', 'Wins copyright lawsuit, speaks against music industry practices', 3200, 500),
  p('28', 'Shakira', 'musician', 'CO', 'Tax fraud case resolved, releases diss track', 3800, 1200),
  p('29', 'Kanye West', 'musician', 'US', 'Makes controversial antisemitic statements', 1100, 8900),
  p('30', 'Adele', 'musician', 'GB', 'Announces residency cancellation, fans outraged', 2800, 1900),
  p('31', 'Rihanna', 'musician', 'US', 'Expands Fenty brand to 15 new countries', 5200, 400),

  // Athletes
  p('32', 'Lionel Messi', 'athlete', 'AR', 'Leads Inter Miami to championship victory', 9500, 200, '/avatars/32.jpg'),
  p('33', 'Cristiano Ronaldo', 'athlete', 'PT', 'Scores 900th career goal in Saudi Arabia', 8800, 1200, '/avatars/33.jpg'),
  p('34', 'LeBron James', 'athlete', 'US', 'Speaks on social justice, funds new school', 5400, 1800),
  p('35', 'Naomi Osaka', 'athlete', 'JP', 'Opens mental health clinic for athletes', 3200, 200),
  p('36', 'Novak Djokovic', 'athlete', 'RS', 'Wins record Grand Slam despite vaccine controversy', 4100, 2800),
  p('37', 'Virat Kohli', 'athlete', 'IN', 'Breaks cricket world record, donates to flood relief', 6800, 400),
  p('38', 'Neymar', 'athlete', 'BR', 'Involved in another diving controversy', 2100, 3500),
  p('39', 'Serena Williams', 'athlete', 'US', 'Launches venture capital fund for women founders', 4500, 300),
  p('40', 'Lewis Hamilton', 'athlete', 'GB', 'Pushes for diversity in motorsport', 3800, 900),

  // Business Leaders
  p('41', 'Elon Musk', 'business_leader', 'US', 'Renames Twitter to X, fires 80% of staff', 3200, 7800, '/avatars/41.jpg'),
  p('42', 'Jeff Bezos', 'business_leader', 'US', 'Blue Origin launches first commercial space flight', 1800, 4500),
  p('43', 'Tim Cook', 'business_leader', 'US', 'Apple announces Vision Pro, faces privacy questions', 2900, 1200),
  p('44', 'Jensen Huang', 'business_leader', 'US', 'NVIDIA becomes most valuable company, AI boom continues', 5100, 800),
  p('45', 'Mark Zuckerberg', 'business_leader', 'US', 'Metaverse pivot loses billions, shifts to AI', 1500, 5200),
  p('46', 'Sam Altman', 'business_leader', 'US', 'OpenAI board drama, fired and rehired in 5 days', 3800, 2100),
  p('47', 'Ratan Tata', 'business_leader', 'IN', 'Tata Group donates $100M to education', 6200, 100),
  p('48', 'Bernard Arnault', 'business_leader', 'FR', 'Becomes richest person, LVMH acquires new brands', 1200, 2800),

  // Influencers
  p('49', 'MrBeast', 'influencer', 'US', 'Opens 1000 free wells in Africa', 8200, 600),
  p('50', 'Khaby Lame', 'influencer', 'IT', 'Becomes most followed TikToker, signs movie deal', 4500, 300),
  p('51', 'PewDiePie', 'influencer', 'SE', 'Returns from hiatus with charity livestream', 3800, 500),
  p('52', 'Andrew Tate', 'influencer', 'GB', 'Arrested on trafficking charges, supporters rally', 2800, 7200),
  p('53', 'Charli D\'Amelio', 'influencer', 'US', 'Launches mental health awareness campaign', 2200, 1800),
  p('54', 'Logan Paul', 'influencer', 'US', 'CryptoZoo scam allegations surface', 800, 4500),

  // Journalists
  p('55', 'Tucker Carlson', 'journalist', 'US', 'Launches independent show after Fox News exit', 3200, 4800),
  p('56', 'Christiane Amanpour', 'journalist', 'GB', 'Wins Pulitzer for war zone reporting', 3800, 200),
  p('57', 'Glenn Greenwald', 'journalist', 'US', 'Publishes leaked surveillance documents', 2800, 1500),
  p('58', 'Maria Ressa', 'journalist', 'PH', 'Nobel laureate speaks on press freedom', 4100, 300),
  p('59', 'Joe Rogan', 'journalist', 'US', 'Controversial podcast episode sparks boycott', 3500, 3200),

  // Activists
  p('60', 'Greta Thunberg', 'activist', 'SE', 'Arrested at climate protest, becomes rallying symbol', 5800, 3200),
  p('61', 'Malala Yousafzai', 'activist', 'PK', 'Opens new schools in Taliban-controlled regions', 7200, 200),
  p('62', 'Alexei Navalny', 'activist', 'RU', 'Continues protests from prison, health declining', 6800, 1200),
  p('63', 'Joshua Wong', 'activist', 'CN', 'Sentenced to additional years for democracy protests', 4500, 800),
  p('64', 'Vanessa Nakate', 'activist', 'KE', 'Leads African climate justice movement', 2800, 150),

  // More politicians for better country coverage
  p('65', 'Benjamin Netanyahu', 'politician', 'IL', 'Pushes judicial reform despite mass protests', 1200, 5800),
  p('66', 'Pedro Sanchez', 'politician', 'ES', 'Forms coalition government amid controversy', 800, 1200),
  p('67', 'Jacinda Ardern', 'politician', 'NZ', 'Resigns citing burnout, praised for leadership', 5200, 400),
  p('68', 'Yoon Suk-yeol', 'politician', 'KR', 'Faces impeachment proceedings over martial law', 600, 3800),
  p('69', 'Giorgia Meloni', 'politician', 'IT', 'First female PM pushes anti-immigration policy', 1800, 2900),
  p('70', 'Mohammad bin Salman', 'politician', 'SA', 'NEOM megacity project faces criticism', 900, 4200),

  // More variety
  p('71', 'Oprah Winfrey', 'influencer', 'US', 'Donates $100M to education fund', 5800, 400),
  p('72', 'Pope Francis', 'other', 'AR', 'Calls for peace negotiations in global conflicts', 6500, 800),
  p('73', 'David Attenborough', 'other', 'GB', 'New documentary on ocean conservation premieres', 7800, 100),
  p('74', 'Yuval Noah Harari', 'other', 'IL', 'Warns about AI threats to democracy', 3200, 600),
  p('75', 'Neil deGrasse Tyson', 'other', 'US', 'Debunks viral conspiracy theories', 3800, 800),

  // Germany — enough entries to fill the country tooltip (5 rising + 5 falling)
  p('81', 'Friedrich Merz', 'politician', 'DE', 'Wins federal election, forms new coalition', 4200, 1800),
  p('82', 'Robert Habeck', 'politician', 'DE', 'Defends green energy transition amid criticism', 1900, 3100),
  p('83', 'Annalena Baerbock', 'politician', 'DE', 'Pushes for tougher EU sanctions on Russia', 2800, 1500),
  p('84', 'Karl Lagerfeld', 'other', 'DE', 'Fashion icon legacy celebrated worldwide', 5100, 300),
  p('85', 'Florian Silbereisen', 'musician', 'DE', 'Record-breaking TV special draws 12M viewers', 1600, 800),
  p('86', 'Mesut Özil', 'athlete', 'DE', 'Retirement charity work praised across Europe', 3400, 1100),
  p('87', 'Heiko Maas', 'politician', 'DE', 'Criticised for weak stance on foreign policy', 600, 2700),
  p('88', 'Til Schweiger', 'actor', 'DE', 'Refugee shelter donations spark admiration', 2200, 900),
  p('89', 'Bushido', 'musician', 'DE', 'Mob ties exposed, public trust shattered', 800, 4100),
  p('90', 'Alice Weidel', 'politician', 'DE', 'AfD surge raises fears of far-right governance', 1100, 5200),

  // Recently added (within last 6 hours for "New" badge)
  p('76', 'Alexandria Ocasio-Cortez', 'politician', 'US', 'Introduces Green New Deal 2.0', 180, 220, undefined, 2),
  p('77', 'Kai Cenat', 'influencer', 'US', 'Twitch stream causes Times Square riot', 90, 340, undefined, 4),
  p('78', 'Mbappé', 'athlete', 'FR', 'Signs record-breaking contract with Real Madrid', 420, 80, undefined, 1),
  p('79', 'Ai Weiwei', 'activist', 'CN', 'New art exhibition on surveillance and freedom', 150, 30, undefined, 3),
  p('80', 'Sam Bankman-Fried', 'business_leader', 'US', 'Sentenced for FTX fraud', 50, 8900, undefined, 5),
];

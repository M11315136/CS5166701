const ADJECTIVES = [
    'Swift', 'Bold', 'Brave', 'Dark', 'Wild',
    'Iron', 'Silver', 'Golden', 'Storm', 'Frost',
    'Shadow', 'Thunder', 'Crimson', 'Ancient', 'Phantom',
    'Blazing', 'Icy', 'Mighty', 'Silent', 'Furious',
];

const NOUNS = [
    'Fox', 'Eagle', 'Tiger', 'Dragon', 'Phoenix',
    'Wolf', 'Bear', 'Hawk', 'Lion', 'Falcon',
    'Panther', 'Raven', 'Cobra', 'Lynx', 'Viper',
    'Knight', 'Wizard', 'Hunter', 'Ranger', 'Ninja',
];

export class RandomNameGenerator {
    /** 每次呼叫產生一個形容詞 + 名詞 + 兩位隨機數字的名稱，例如 SilverDragon42 */
    static generate(): string {
        const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const num  = Math.floor(Math.random() * 100);
        return `${adj}${noun}${num}`;
    }
}

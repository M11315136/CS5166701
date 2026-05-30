const ADJECTIVES = [
  "Swift",
  "Bold",
  "Brave",
  "Dark",
  "Wild",
  "Iron",
  "Silver",
  "Golden",
  "Storm",
  "Frost",
  "Shadow",
  "Thunder",
  "Crimson",
  "Ancient",
  "Phantom",
  "Blazing",
  "Icy",
  "Mighty",
  "Silent",
  "Furious",
];

const NOUNS = [
  "Fox",
  "Eagle",
  "Tiger",
  "Dragon",
  "Phoenix",
  "Wolf",
  "Bear",
  "Hawk",
  "Lion",
  "Falcon",
  "Panther",
  "Raven",
  "Cobra",
  "Lynx",
  "Viper",
  "Knight",
  "Wizard",
  "Hunter",
  "Ranger",
  "Ninja",
];

/**
 * 教學版複本
 * 來源檔案：assets/CS5166701/week4/scripts/RandomNameGenerator.ts
 * 起始位置：從 `class RandomNameGenerator` 開始
 *
 * 這個檔案原本負責產生玩家名稱。
 *
 * 主要步驟：
 * 1. 先準備兩份字庫：形容詞與名詞。
 * 2. 隨機從兩份字庫各取一個字。
 * 3. 再產生一個 0 到 99 的數字。
 * 4. 把三部分串成像 `SilverDragon42` 這樣的名稱。
 *
 * 教學閱讀順序：
 * - 先看字庫資料，理解名稱的組成來源。
 * - 再看 `generate()`，理解亂數挑選與字串組合。
 */
export class RandomNameGenerator {
  /** 每次呼叫產生一個形容詞 + 名詞 + 兩位隨機數字的名稱，例如 SilverDragon42 */
  static generate(): string {
    // 1. 從形容詞字庫中隨機挑一個字。
    // 2. 從名詞字庫中隨機挑一個字。
    // 3. 產生 0~99 的數字。
    // 4. 把三個部分組合成顯示名稱。
    return "";
  }
}

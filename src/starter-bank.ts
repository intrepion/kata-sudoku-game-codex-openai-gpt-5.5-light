export type Difficulty = "easy" | "medium" | "hard";

export type StarterPuzzle = {
  id: string;
  difficulty: Difficulty;
  givens: string;
  solution: string;
};

const BASE_SOLUTION =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

export const STARTER_PUZZLES: StarterPuzzle[] = [
  {
    id: "easy-01",
    difficulty: "easy",
    givens:
      "534078002000100308108042567859000420006000701000924006001030000200009605000000079",
    solution: BASE_SOLUTION,
  },
  {
    id: "easy-02",
    difficulty: "easy",
    givens:
      "030078002002195040190302560009701000426000091000024006001530000080010630000200079",
    solution: BASE_SOLUTION,
  },
  {
    id: "easy-03",
    difficulty: "easy",
    givens:
      "530670012000005000090302567059000020020053700003024050901037084000009000305206070",
    solution: BASE_SOLUTION,
  },
  {
    id: "easy-04",
    difficulty: "easy",
    givens:
      "530000000000105348008302560809700400020800001010904000001007284000010635045006079",
    solution: BASE_SOLUTION,
  },
  {
    id: "medium-01",
    difficulty: "medium",
    givens:
      "030678010000090000100040507800001023400800701010920800060007284207400005000000000",
    solution: BASE_SOLUTION,
  },
  {
    id: "medium-02",
    difficulty: "medium",
    givens:
      "030008010070195040000002567059700003000803090000000800961000000287019005000200070",
    solution: BASE_SOLUTION,
  },
  {
    id: "medium-03",
    difficulty: "medium",
    givens:
      "030608000072190008090042060059001403006800700713000006000507000200009000000280009",
    solution: BASE_SOLUTION,
  },
  {
    id: "medium-04",
    difficulty: "medium",
    givens:
      "500608900602005000000300000000700403406850001000920006061500080207010005045080100",
    solution: BASE_SOLUTION,
  },
  {
    id: "hard-01",
    difficulty: "hard",
    givens:
      "004000000002100308008302560050061400000803000003004000960000000080000035000280109",
    solution: BASE_SOLUTION,
  },
  {
    id: "hard-02",
    difficulty: "hard",
    givens:
      "034070000000000008100042500850001000006003701010900000900530000007010030345000009",
    solution: BASE_SOLUTION,
  },
  {
    id: "hard-03",
    difficulty: "hard",
    givens:
      "000608900070005040008300507009000400406003001703024000060007000000000605300200070",
    solution: BASE_SOLUTION,
  },
  {
    id: "hard-04",
    difficulty: "hard",
    givens:
      "034000000600005000000302000000060403020000001010904806960007204007000000305280070",
    solution: BASE_SOLUTION,
  },
];

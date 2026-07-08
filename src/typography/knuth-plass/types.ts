export type Box = { type: 'box'; width: number; value: string };
export type Glue = { type: 'glue'; width: number; stretch: number; shrink: number; value: string };
export type Penalty = { type: 'penalty'; width: number; penalty: number; flagged: boolean };
export type Item = Box | Glue | Penalty;

export type Breakpoint = {
  position: number;
  line: number;
  fitnessClass: number;
  totalDemerits: number;
  previous: Breakpoint | null;
};

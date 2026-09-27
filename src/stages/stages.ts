import type { Frame } from "../physics/model";
import { text, type LocalText } from "../i18n";
export type CameraView = "Overview" | "Side" | "Center";
export type Stage = {
  title: LocalText;
  subtitle: LocalText;
  question: LocalText;
  takeaway: LocalText;
  observe: LocalText;
  frame: Frame;
  diagram: "minimal" | "lengths" | "tunnel" | "axes" | "projection" | "now";
  formula: string[];
};
export const stages: Stage[] = [
  {
    title: text("先看误区", "The apparent paradox"),
    subtitle: text(
      "两个参考系，矛盾的预测？",
      "Two frames, conflicting predictions?",
    ),
    question: text(
      "同一列车，为什么看起来一个安全、一个会相撞？",
      "Why does one frame look safe and the other predict a collision?",
    ),
    takeaway: text(
      "站台系中，收缩的列车能容纳在隧道内。列车系中，收缩的隧道比列车短。若误以为两门在列车系中也同时落下，就会得出相撞的错误结论。",
      "The contracted train fits in the station frame. The contracted tunnel is shorter than the train in its own frame. Assuming simultaneous drops in both frames creates the false collision prediction.",
    ),
    observe: text(
      "上方播放安全通过；下方故意演示错误的同时落闸，并停在预测的碰撞处。下方不是实际发生的物理过程。",
      "The upper train passes safely. The lower animation deliberately uses the wrong simultaneous-drop assumption and freezes at the predicted impact. It is not a real physical sequence.",
    ),
    frame: "tunnel",
    diagram: "minimal",
    formula: [
      String.raw`\gamma=\frac{1}{\sqrt{1-\beta^2}},\quad\beta=\frac{v}{c}`,
      String.raw`L=\frac{L_0}{\gamma}`,
    ],
  },
  {
    title: text("站台系：同时落闸", "Station: simultaneous drops"),
    subtitle: text("S1 → S2 → 两扇闸门", "S1 → S2 → both gates"),
    question: text(
      "为什么两扇闸门在站台系中同时落下？",
      "Why do both gates drop simultaneously in Station S?",
    ),
    takeaway: text(
      "运动列车在站台系发生尺缩。中央 S2 向两个静止闸门发送等距光信号，使两门在列车进入隧道后同时落下。",
      "The moving train contracts in Station S. Equal light paths from central S2 to stationary gates synchronize the drops when the train is inside.",
    ),
    observe: text(
      "两门在 S 中静止，经过相等的光传播时长后，同时收到中央 S2 的光信号。",
      "Both gates are stationary in S and receive the central relay pulse after equal light-travel times.",
    ),
    frame: "tunnel",
    diagram: "tunnel",
    formula: [
      String.raw`\gamma=\frac{1}{\sqrt{1-\beta^2}}`,
      String.raw`L_{\mathrm{train}}=\frac{300}{\gamma}\,\mathrm{m}`,
      String.raw`\Delta t_{\mathrm{prop},A}=\Delta t_{\mathrm{prop},B}=\frac{100\,\mathrm m}{c}`,
      String.raw`t_B-t_A=0`,
    ],
  },
  {
    title: text("列车系：先后落闸", "Train: different drop times"),
    subtitle: text(
      "出口先落，入口后落，仍然安全",
      "Exit first, entrance later, still safe",
    ),
    question: text(
      "尺缩没有错，错的是把“同时”搬到另一个参考系。",
      "Length contraction is correct. Shared simultaneity is not.",
    ),
    takeaway: text(
      "列车静止，隧道向左运动。出口 B 迎着光靠近，入口 A 背离光远去，所以 B 先落到轨道下方，A 随后在车尾经过后才落下。两个参考系都没有碰撞。",
      "The train is stationary and the tunnel moves left. B approaches the light; A recedes. B drops clear first, then A drops behind the rear. Both frames agree: no collision.",
    ),
    observe: text(
      "光圈中心留在发射事件的位置，不跟随传感器移动。比较两门接收时间，便能解开第一阶段的误区。",
      "Each wave stays centered on its emission event, not its moving sensor. Compare reception times to resolve the first-stage misconception.",
    ),
    frame: "train",
    diagram: "projection",
    formula: [
      String.raw`x'=\gamma(x-vt)`,
      String.raw`t'=\gamma\!\left(t-\frac{vx}{c^2}\right)`,
      String.raw`L'_{\mathrm{tunnel}}=\frac{200}{\gamma}\,\mathrm m`,
      String.raw`\Delta t'_B=\frac{(100\,\mathrm m)/\gamma}{c+v}`,
      String.raw`\Delta t'_A=\frac{(100\,\mathrm m)/\gamma}{c-v}`,
      String.raw`t'_B-t'_A=-\frac{\gamma v(200\,\mathrm m)}{c^2}`,
    ],
  },
];

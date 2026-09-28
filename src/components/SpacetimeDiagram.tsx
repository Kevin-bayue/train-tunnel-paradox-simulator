import { useId } from "react";
import { useLanguage } from "../i18n";
import {
  C,
  lorentzGamma,
  transformEventToTrainFrame,
  fmt,
  type Frame,
} from "../physics/model";
import { MathFormula } from "./MathFormula";

// All plotted coordinates are station S coordinates, with identical x and ct scales.
export function SpacetimeDiagram({
  beta,
  time,
  frame,
}: {
  beta: number;
  time: number;
  frame: Frame;
}) {
  const { t } = useLanguage();
  const uid = useId().replace(/:/g, "");
  const g = lorentzGamma(beta);
  const trainFrame = frame === "train";
  const extent = 320,
    scale = 0.5,
    origin = 190;
  const x = (v: number) => origin + scale * v;
  const y = (v: number) => origin - scale * v;
  const line = (x1: number, ct1: number, x2: number, ct2: number) => ({
    x1: x(x1),
    y1: y(ct1),
    x2: x(x2),
    y2: y(ct2),
  });
  // At the simulator's train-frame time t'=T/gamma, ct = beta*x + c*T/gamma^2.
  const intercept = C * time * (trainFrame ? 1 / (g * g) : 1);
  const slope = trainFrame ? beta : 0;
  const visibleNow = Math.abs(intercept) <= extent * (1 + Math.abs(slope));
  const halfTrain = 150 / g;
  const eventTime = (pos: number) =>
    transformEventToTrainFrame({ x: pos, t: 0 }, beta).t;
  return (
    <section className="minkowski-card">
      <h3>{t("闵可夫斯基时空图", "MINKOWSKI SPACETIME")}</h3>
      <p className="spacetime-intro">
        {t(
          "同一组事件，以站台坐标绘图。向上是时间，向右是空间。",
          "One set of events, drawn in station coordinates. Time runs up; space runs right.",
        )}
      </p>
      <svg
        className="spacetime classic"
        viewBox="0 0 380 380"
        role="img"
        aria-label={t(
          "等比例 x–ct 时空图，包含光锥、列车与闸门世界线、光信号和当前等时线",
          "Equal-scale x–ct diagram with light cone, train and gate worldlines, light signals and the current simultaneity slice",
        )}
      >
        <defs>
          <clipPath id={`${uid}-clip`}>
            <rect x="30" y="30" width="320" height="320" />
          </clipPath>
          <pattern
            id={`${uid}-grid`}
            width="40"
            height="40"
            x="30"
            y="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 H 0 V 40"
              fill="none"
              stroke="#303030"
              strokeWidth="0.5"
            />
          </pattern>
          <marker
            id={`${uid}-arrow`}
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
          >
            <path d="M0 0 L7 3.5 L0 7" fill="#ddd" />
          </marker>
        </defs>
        <rect
          x="30"
          y="30"
          width="320"
          height="320"
          fill={`url(#${uid}-grid)`}
        />
        <g clipPath={`url(#${uid}-clip)`}>
          <path
            d={`M${x(-extent)},${y(-extent)} L${x(extent)},${y(extent)} L${x(-extent)},${y(extent)} L${x(extent)},${y(-extent)} Z`}
            fill="#ffffff05"
          />
          {[-1, 1].map((sign) => (
            <line
              key={sign}
              {...line(-extent, -sign * extent, extent, sign * extent)}
              stroke="#777"
              strokeDasharray="3 5"
            />
          ))}
          <polygon
            points={`${x(-beta * extent - halfTrain)},${y(-extent)} ${x(beta * extent - halfTrain)},${y(extent)} ${x(beta * extent + halfTrain)},${y(extent)} ${x(-beta * extent + halfTrain)},${y(-extent)}`}
            fill="#75cfff12"
          />
          {[-1, 1].map((sign) => (
            <line
              key={sign}
              {...line(
                -beta * extent + sign * halfTrain,
                -extent,
                beta * extent + sign * halfTrain,
                extent,
              )}
              stroke="#75cfff"
              strokeOpacity="0.6"
            />
          ))}
          {[-100, 100].map((pos) => (
            <line
              key={pos}
              {...line(pos, -extent, pos, extent)}
              stroke="#bcbcbc"
              strokeWidth="1.5"
            />
          ))}
          {trainFrame &&
            [-100, 100].map((pos) => (
              <line
                key={pos}
                {...line(
                  -extent,
                  beta * (-extent - pos),
                  extent,
                  beta * (extent - pos),
                )}
                stroke={pos < 0 ? "#75cfff" : "#ffda65"}
                strokeDasharray="6 4"
              />
            ))}
          <line
            {...line(-extent, 0, extent, 0)}
            stroke="#ddd"
            markerEnd={`url(#${uid}-arrow)`}
          />
          <line
            {...line(0, -extent, 0, extent)}
            stroke="#ddd"
            markerEnd={`url(#${uid}-arrow)`}
          />
          {trainFrame && (
            <>
              <line
                data-testid="x-prime-axis"
                {...line(-extent, -beta * extent, extent, beta * extent)}
                stroke="#75cfff"
                strokeWidth="2"
              />
              <line
                data-testid="ct-prime-axis"
                {...line(-beta * extent, -extent, beta * extent, extent)}
                stroke="#75cfff"
                strokeWidth="2"
              />
            </>
          )}
          <path
            d={`M${x(-100)},${y(0)} L${x(0)},${y(-100)} L${x(100)},${y(0)}`}
            fill="none"
            stroke="#ffda65"
            strokeWidth="2.5"
          />
          {visibleNow && (
            <line
              data-testid="current-simultaneity"
              {...line(
                -extent,
                intercept - slope * extent,
                extent,
                intercept + slope * extent,
              )}
              stroke="white"
              strokeWidth="2"
              strokeDasharray="2 4"
            />
          )}
        </g>
        <text x="353" y="207">
          x / m
        </text>
        <text x="196" y="20">
          ct / m
        </text>
        <text x="174" y="205">
          O
        </text>
        <text x="30" y="365">
          −320
        </text>
        <text x="330" y="365">
          320
        </text>
        <text x="7" y="35">
          320
        </text>
        <text x="3" y="350">
          −320
        </text>
        <text x="35" y="21">
          {t("光锥：ct = ±x", "Light cone: ct = ±x")}
        </text>
        {trainFrame && (
          <>
            <text x={x(beta * extent) - 8} y="44" textAnchor="end">
              ct′
            </text>
            <text x="332" y={y(beta * extent) - 7}>
              x′
            </text>
          </>
        )}
        <circle cx={x(0)} cy={y(-100)} r="4" fill="#ffda65" />
        <text x={x(0) + 8} y={y(-100) + 16}>
          S2
        </text>
        {[-100, 100].map((pos, i) => (
          <g key={pos}>
            <circle
              cx={x(pos)}
              cy={y(0)}
              r="5"
              fill={i ? "#ffda65" : "#75cfff"}
            />
            <text x={x(pos)} y={y(0) - 12} textAnchor="middle">
              {i ? "B" : "A"}
            </text>
            <text x={x(pos)} y="338" textAnchor="middle">
              {pos} m
            </text>
          </g>
        ))}
      </svg>
      <ul className="spacetime-legend">
        <li>
          <i className="worldline-key" />
          {t(
            "竖线：闸门 A、B；蓝色带：列车世界管",
            "Vertical lines: gates A, B; blue band: train worldtube",
          )}
        </li>
        <li>
          <i className="signal-key" />
          {t(
            "黄色光路：S2 → A / B（斜率 ±1）",
            "Yellow light paths: S2 → A / B (slope ±1)",
          )}
        </li>
        <li>
          <i className="now-key" />
          {t(
            "白色点线：动画当前的同时截面",
            "White dotted line: the animation’s current time slice",
          )}
          {!visibleNow && t("（当前在图外）", " (currently outside plot)")}
        </li>
      </ul>
      {trainFrame ? (
        <>
          <p>
            {t(
              beta === 0
                ? "β = 0：两个坐标系重合，A、B 位于同一条等时线上。"
                : "穿过 A、B 的虚线均平行于 x′ 轴，但不是同一条等时线。因此 t′B < t′A，出口先落下。",
              beta === 0
                ? "At β = 0 the frames coincide: A and B share the same time slice."
                : "Dashed lines through A and B are parallel to x′, but are different time slices. Thus t′B < t′A: the exit drops first.",
            )}
          </p>
          <MathFormula
            tex={String.raw`t'_A=${fmt(eventTime(-100))},\quad t'_B=${fmt(eventTime(100))}\;\mu\mathrm{s}`}
          />
          <MathFormula
            tex={String.raw`ct'=\gamma(ct-\beta x),\quad x'=\gamma(x-\beta ct)`}
          />
        </>
      ) : (
        <>
          <p>
            {t(
              "A、B 位于同一条水平线 t = 0：两束光同时到达，两门同时开始下落。",
              "A and B lie on the same horizontal line t = 0: both light pulses arrive and both gates start dropping simultaneously.",
            )}
          </p>
          <MathFormula tex={String.raw`t_A=t_B=0,\quad \Delta t=0`} />
        </>
      )}
      <small>
        {t(
          "x 与 ct 等比例，光线呈 45°。本图是事件坐标图，不是相机看到的光学图像。",
          "Equal scales for x and ct make light rays 45°. This is an event-coordinate diagram, not an optical camera view.",
        )}
      </small>
    </section>
  );
}

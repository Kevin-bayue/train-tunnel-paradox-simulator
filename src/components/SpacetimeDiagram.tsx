import { useLanguage } from "../i18n";
import { C, doorEvents, transformEventToTrainFrame } from "../physics/model";
import type { Stage } from "../stages/stages";
export function SpacetimeDiagram({
  beta,
  mode,
}: {
  beta: number;
  mode: Stage["diagram"];
}) {
  const { t } = useLanguage();
  const ox = 140,
    oy = 175,
    s = ["projection", "now"].includes(mode)
      ? Math.min(
          0.65,
          76 /
            Math.max(
              1,
              ...doorEvents.map((e) =>
                Math.abs(
                  (C * transformEventToTrainFrame(e.tunnel, beta).t) /
                    Math.sqrt(1 - beta * beta),
                ),
              ),
            ),
        )
      : 0.65;
  const p = (x: number, ct: number) => `${ox + x * s},${oy - ct * s}`;
  const advanced = ["axes", "projection", "now"].includes(mode);
  return (
    <svg
      className={`spacetime ${advanced ? "prominent" : ""}`}
      viewBox="0 0 280 290"
      role="img"
      aria-label={t(
        `时空图，x 与 ct 等比例，列车系坐标轴斜率参数 β = ${beta}`,
        `Spacetime diagram, equal x and ct scale; train axis parameter beta = ${beta}.`,
      )}
    >
      <defs>
        <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path
            d="M 26 0 L 0 0 0 26"
            fill="none"
            stroke="#2f2f2f"
            strokeWidth=".5"
          />
        </pattern>
      </defs>
      <rect width="280" height="290" fill="url(#grid)" />
      <path d="M 15 175 H 266 M 140 277 V 12" stroke="#a6a6a6" fill="none" />
      <text x="263" y="191">
        x
      </text>
      <text x="147" y="18">
        ct
      </text>
      {mode !== "minimal" && (
        <line
          x1="18"
          y1="175"
          x2="265"
          y2="175"
          stroke="#bcbcbc"
          strokeWidth="2"
        />
      )}
      {advanced && (
        <>
          <line
            data-testid="x-prime-axis"
            x1={ox - 120}
            y1={oy + 120 * beta}
            x2={ox + 120}
            y2={oy - 120 * beta}
            stroke="#b0b0b0"
            strokeWidth="2"
          />
          <line
            data-testid="ct-prime-axis"
            x1={ox - 95 * beta}
            y1={oy + 95}
            x2={ox + 155 * beta}
            y2={oy - 155}
            stroke="#b0b0b0"
            strokeWidth="2"
          />
          <text x={ox + 110} y={oy - 120 * beta - 8} fill="#b0b0b0">
            x′
          </text>
          <text x={Math.min(250, ox + 155 * beta + 5)} y="30" fill="#b0b0b0">
            ct′
          </text>
        </>
      )}
      {["projection", "now"].includes(mode) &&
        doorEvents.map((e) => {
          const t = transformEventToTrainFrame(e.tunnel, beta).t;
          const ct = (C * t) / Math.sqrt(1 - beta * beta);
          return (
            <g key={e.id}>
              <line
                x1={ox + e.tunnel.x * s}
                y1={oy}
                x2={ox + beta * ct * s}
                y2={oy - ct * s}
                stroke={e.id === "A" ? "#58c9f2" : "#ffc66d"}
                strokeDasharray="3 4"
              />
              <circle
                cx={ox + beta * ct * s}
                cy={oy - ct * s}
                r="3"
                fill={e.id === "A" ? "#58c9f2" : "#ffc66d"}
              />
              <text
                x={ox + beta * ct * s + (e.id === "A" ? -6 : 6)}
                y={oy - ct * s - 8}
                textAnchor={e.id === "A" ? "end" : "start"}
              >
                {e.id}: {t.toFixed(3)} μs
              </text>
            </g>
          );
        })}
      {!["minimal", "lengths"].includes(mode) &&
        doorEvents.map((e) => (
          <g key={e.id}>
            <circle
              cx={ox + e.tunnel.x * s}
              cy={oy}
              r="4"
              fill={e.id === "A" ? "#58c9f2" : "#ffc66d"}
            />
            <text x={ox + e.tunnel.x * s - 4} y={oy + 21}>
              {e.id}
            </text>
          </g>
        ))}
      <text x="12" y="269" className="svg-note">
        {advanced
          ? "x′: ct = βx   ·   ct′: x = βct"
          : mode === "minimal"
            ? t("x：位置 · ct：时间 × c", "x: position · ct: time × c")
            : t("站台同时线：t = 0", "Station simultaneity: t = 0")}
      </text>
    </svg>
  );
}

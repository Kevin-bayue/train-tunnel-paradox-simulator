import {
  C,
  D,
  emissions,
  receptionEvents,
  stationToTrainEvent,
} from "../physics/model";
import type { Stage } from "../stages/stages";
export function SpacetimeDiagram({
  beta,
  mode,
}: {
  beta: number;
  mode: Stage["diagram"];
}) {
  const ox = 140,
    oy = 175,
    s = 0.65;
  const p = (x: number, ct: number) => `${ox + x * s},${oy - ct * s}`;
  const advanced = ["axes", "projection", "now"].includes(mode);
  return (
    <svg
      className={`spacetime ${advanced ? "prominent" : ""}`}
      viewBox="0 0 280 290"
      role="img"
      aria-label={`Spacetime axes with equal x and ct scales. Train x prime slope ${beta}; ct prime x over ct ${beta}.`}
    >
      <defs>
        <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path
            d="M 26 0 L 0 0 0 26"
            fill="none"
            stroke="#283034"
            strokeWidth=".5"
          />
        </pattern>
      </defs>
      <rect width="280" height="290" fill="url(#grid)" />
      <path d="M 15 175 H 266 M 140 277 V 12" stroke="#9aabad" fill="none" />
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
          stroke="#d9c398"
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
            stroke="#8cc9bb"
            strokeWidth="2"
          />
          <line
            data-testid="ct-prime-axis"
            x1={ox - 95 * beta}
            y1={oy + 95}
            x2={ox + 155 * beta}
            y2={oy - 155}
            stroke="#8cc9bb"
            strokeWidth="2"
          />
          <text x={ox + 110} y={oy - 120 * beta - 8} fill="#8cc9bb">
            x′
          </text>
          <text x={ox + 155 * beta + 5} y="30" fill="#8cc9bb">
            ct′
          </text>
        </>
      )}
      {["rays", "projection", "now"].includes(mode) &&
        receptionEvents(beta).map((r, i) => (
          <polyline
            key={r.id}
            points={`${p(emissions[i].station.x, 0)} ${p(r.station.x, C * r.station.t)}`}
            stroke={i ? "#dbbb86" : "#8fc5da"}
            strokeDasharray="4 4"
            fill="none"
          />
        ))}
      {mode === "projection" &&
        emissions.map((e) => {
          const t = stationToTrainEvent(e.station, beta).t;
          const ct = (C * t) / Math.sqrt(1 - beta * beta);
          return (
            <line
              key={e.id}
              x1={ox + e.station.x * s}
              y1={oy}
              x2={ox + beta * ct * s}
              y2={oy - ct * s}
              stroke="#8cc9bb"
              strokeDasharray="3 4"
            />
          );
        })}
      {emissions.map((e) => (
        <g key={e.id}>
          <circle
            cx={ox + e.station.x * s}
            cy={oy}
            r="4"
            fill={e.id === "A" ? "#8fc5da" : "#dbbb86"}
          />
          <text x={ox + e.station.x * s - 4} y={oy + 21}>
            {e.id}
          </text>
        </g>
      ))}
      <text x="12" y="269" className="svg-note">
        {advanced ? "x′: ct = βx   ·   ct′: x = βct" : "Station “now”: t = 0"}
      </text>
    </svg>
  );
}

import {
  emissions,
  transformSpaceTime,
  fmt,
  calculateSimultaneityGap,
  emissionOrder,
} from "../physics/model";
import type { Stage } from "../stages/stages";
import { SpacetimeDiagram } from "./SpacetimeDiagram";
export function PhysicsPanel({
  stage,
  beta,
  axes,
}: {
  stage: Stage;
  beta: number;
  axes: boolean;
}) {
  const advanced = ["axes", "projection", "now"].includes(stage.diagram);
  return (
    <aside className="physics panel">
      <section>
        <h3>Key takeaway</h3>
        <p className="takeaway">{stage.takeaway}</p>
      </section>
      <section>
        <h3>Main formula</h3>
        <div className="formula">
          {stage.formula.map((f) => (
            <div key={f}>{f}</div>
          ))}
        </div>
      </section>
      {stage.coordinates && (
        <section className="readout">
          <div className="data-head">
            <span>EMISSION</span>
            <span>t (μs)</span>
            <span>{advanced ? "t′ (μs)" : "x (m)"}</span>
          </div>
          {emissions.map((e) => (
            <div key={e.id}>
              <b className={e.id.toLowerCase()}>{e.id}</b>
              <span>0.000</span>
              <span>
                {advanced
                  ? fmt(transformSpaceTime(e.station, "train", beta).t)
                  : fmt(e.station.x, 0)}
              </span>
            </div>
          ))}
          {advanced && (
            <p>
              Δt′ = <strong>{fmt(calculateSimultaneityGap(beta))} μs</strong>
              <br />
              {emissionOrder(beta)} in the train.
            </p>
          )}
        </section>
      )}
      {axes && (
        <section className="diagram-section">
          <h3>Spacetime axes</h3>
          <SpacetimeDiagram beta={beta} mode={stage.diagram} />
          <small>
            x and ct in meters · equal scales
            <br />
            Station S <i className="gold">—</i> Train S′{" "}
            <i className="mint">—</i>
          </small>
        </section>
      )}
      <section>
        <h3>What to observe</h3>
        <p>{stage.observe}</p>
        <div className="terms">
          {stage.terms.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>
    </aside>
  );
}

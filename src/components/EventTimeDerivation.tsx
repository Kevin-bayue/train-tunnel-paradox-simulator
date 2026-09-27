import { doorEvents, transformSpaceTime, fmt } from "../physics/model";
import { useLanguage } from "../i18n";
import { MathFormula } from "./MathFormula";

export function eventTimeDerivation(beta: number) {
  const events = doorEvents.map((e) => ({
    ...e,
    time: transformSpaceTime(e.tunnel, "train", beta).t,
  }));
  const a = events.find((e) => e.id === "A")!;
  const b = events.find((e) => e.id === "B")!;
  const delta = b.time - a.time;
  return {
    events,
    delta,
    first: delta === 0 ? null : delta < 0 ? "B" : "A",
    a,
    b,
  };
}
export function EventTimeDerivation({ beta }: { beta: number }) {
  const { t } = useLanguage();
  const { events, delta, first, a, b } = eventTimeDerivation(beta);
  const extent = Math.max(Math.abs(a.time), Math.abs(b.time), 0.01);
  return (
    <section className="event-derivation" data-testid="event-derivation">
      <h3>{t("为什么 B 先落下？", "WHY DOES B CLOSE FIRST?")}</h3>
      <div className="derivation-step">
        <h4>{t("1 · 站台系 S：同时发生", "1 · Station S: simultaneous")}</h4>
        {events.map((e) => (
          <div key={e.id} className={`event-${e.id}`}>
            <strong>
              {e.id === "A"
                ? t("A · 左侧入口", "A · Left entrance")
                : t("B · 右侧出口", "B · Right exit")}
            </strong>
            <MathFormula
              tex={String.raw`x_${e.id}=${e.tunnel.x}\,\mathrm m,\quad t_${e.id}=${e.tunnel.t}\,\mu\mathrm s`}
            />
          </div>
        ))}
        <MathFormula
          tex={String.raw`\Delta t=t_B-t_A=${b.tunnel.t - a.tunnel.t}`}
        />
        <small>
          {t(
            "两个闸门在站台系同时开始落下。",
            "Both gates begin dropping simultaneously in S.",
          )}
        </small>
      </div>
      <div className="derivation-step">
        <h4>{t("2 · 变换事件的时间坐标", "2 · Transform the event times")}</h4>
        <MathFormula
          tex={String.raw`t'=\gamma\left(t\boxed{-\frac{vx}{c^2}}\right)`}
        />
        <p>
          {t(
            "位置项 −vx/c²：x 不同，相同的 t 也会得到不同的 t′。",
            "The position term −vx/c² gives different t′ for different x, even at the same t.",
          )}
        </p>
      </div>
      {events.map((e, i) => (
        <div key={e.id} className={`derivation-step event-${e.id}`}>
          <h4>
            {i + 3} ·{" "}
            {e.id === "A"
              ? t("代入左侧 A", "Substitute left A")
              : t("代入右侧 B", "Substitute right B")}
          </h4>
          <MathFormula
            tex={String.raw`\begin{aligned}t'_${e.id}&=\gamma\left(${e.tunnel.t}-\frac{v(${e.tunnel.x})}{c^2}\right)\\&=${e.tunnel.x < 0 ? "+" : "-"}\gamma\frac{${Math.abs(e.tunnel.x)}v}{c^2}\end{aligned}`}
          />
          <MathFormula
            tex={String.raw`t'_${e.id}${e.time === 0 ? "=" : e.time > 0 ? ">" : "<"}0,\quad t'_${e.id}\approx ${e.time > 0 ? "+" : ""}${fmt(e.time, 3)}\,\mu\mathrm s`}
          />
          <strong>
            {first === null
              ? t("同时发生", "Simultaneous")
              : first === e.id
                ? t("更早落下", "Drops earlier")
                : t("更晚落下", "Drops later")}
          </strong>
        </div>
      ))}
      <div className="derivation-step order-result" data-testid="event-order">
        <h4>{t("5 · 比较时间坐标", "5 · Compare time coordinates")}</h4>
        <MathFormula
          tex={String.raw`t'_B ${delta === 0 ? "=" : delta < 0 ? "<" : ">"} t'_A`}
        />
        <strong>
          {first === null
            ? t(
                "β = 0：两门同时，无先后",
                "β = 0: simultaneous; neither is earlier",
              )
            : first === "B"
              ? t("B · 出口先落下", "B · EXIT DROPS FIRST")
              : t("A · 入口先落下", "A · ENTRANCE DROPS FIRST")}
        </strong>
        <div
          className="order-timeline"
          aria-label={t("列车系事件时间轴", "Train-frame event timeline")}
        >
          <span className="timeline-zero">0</span>
          {events.map((e) => (
            <span
              key={e.id}
              className={`timeline-marker event-${e.id}`}
              style={{
                left: `${50 + (36 * e.time) / extent}%`,
                top: e.id === "A" ? 5 : 33,
              }}
            >
              {e.id} ● <b>{fmt(e.time, 3)}</b>
            </span>
          ))}
        </div>
        <small>
          {t("← 更早 · t′ / μs · 更晚 →", "← Earlier · t′ / μs · Later →")}
        </small>
      </div>
      <div className="derivation-step">
        <h4>{t("6 · B 相对 A 的时间差", "6 · B relative to A")}</h4>
        <MathFormula
          tex={String.raw`\begin{aligned}\Delta t'_{B-A}&=t'_B-t'_A\\&=-\gamma\frac{v(${b.tunnel.x - a.tunnel.x}\,\mathrm m)}{c^2}\\&\approx ${fmt(delta, 3)}\,\mu\mathrm s\end{aligned}`}
        />
        <p>
          {delta === 0
            ? t(
                "时间差为零：两个参考系都同时发生。",
                "Zero difference: simultaneous in both frames.",
              )
            : delta < 0
              ? t(
                  "负号表示 B 的时间坐标更小，即 B 先于 A。",
                  "The negative sign means B has the smaller time coordinate: B precedes A.",
                )
              : t(
                  "正号表示 A 先于 B。",
                  "The positive sign means A precedes B.",
                )}
        </p>
        <small>
          {t(
            "光信号用于展示过程；先后顺序由同一组事件坐标的洛伦兹变换决定。",
            "Signals illustrate the process; event order follows from Lorentz-transforming the same event coordinates.",
          )}
        </small>
      </div>
      <div className="derivation-step">
        <h4>
          {t("总结 · 同时性的变换", "Summary · Transforming simultaneity")}
        </h4>
        <MathFormula
          tex={String.raw`\begin{aligned}\Delta t'&=\gamma\left(\Delta t-\frac{v\Delta x}{c^2}\right)\\\Delta t=0\quad&\Longrightarrow\quad\Delta t'=-\frac{\gamma v\Delta x}{c^2}\end{aligned}`}
        />
        <small>
          {t(
            "Δx = xB − xA > 0；当 v > 0 时，Δt′ < 0。",
            "Δx = xB − xA > 0; for v > 0, Δt′ < 0.",
          )}
        </small>
      </div>
    </section>
  );
}

import {
  stationLesson,
  TRAIN_PROPER_LENGTH,
  doorEvents,
  fmt,
} from "../physics/model";
import { useLanguage } from "../i18n";
import { MathFormula } from "./MathFormula";
export function StationDerivation({ beta }: { beta: number }) {
  const { t } = useLanguage();
  const m = stationLesson(beta);
  return (
    <section className="event-derivation" data-testid="station-derivation">
      <h3>{t("物理模型 · 站台系 S", "PHYSICS MODEL · STATION S")}</h3>
      <div className="derivation-step">
        <h4>{t("1 · 洛伦兹因子", "1 · Lorentz factor")}</h4>
        <MathFormula
          tex={String.raw`\gamma=\frac{1}{\sqrt{1-\beta^2}}\approx ${fmt(m.gamma, 4)}`}
        />
      </div>
      <div className="derivation-step">
        <h4>{t("2 · 运动列车的长度收缩", "2 · The moving train contracts")}</h4>
        <MathFormula
          tex={String.raw`\begin{aligned}L_{\mathrm{train},S}&=\frac{L_{\mathrm{train},0}}{\gamma}\\&=\frac{${TRAIN_PROPER_LENGTH}\,\mathrm m}{${fmt(m.gamma, 4)}}\approx ${fmt(m.trainLength, 1)}\,\mathrm m\end{aligned}`}
        />
        <MathFormula
          tex={String.raw`${fmt(m.trainLength, 1)}\,\mathrm m ${Math.abs(m.trainLength - m.tunnelLength) < 1e-8 ? "=" : m.trainLength < m.tunnelLength ? "<" : ">"} ${m.tunnelLength}\,\mathrm m`}
        />
        <strong>
          {m.fits
            ? t("列车可完全容纳", "TRAIN FITS")
            : t("列车过长，无法完全容纳", "TRAIN TOO LONG")}
        </strong>
        <p>
          {t(
            "能否容纳与是否同时是两个问题：低于临界速度时，安全落闸动画停用。",
            "Fit and simultaneity are separate questions. Below the fit threshold, safe gate playback is disabled.",
          )}
        </p>
      </div>
      <div className="derivation-step">
        <h4>
          {t("3 · 中央 S2：等距光传播", "3 · Central S2: equal light paths")}
        </h4>
        <MathFormula tex={String.raw`d_A=d_B=${m.distances[0]}\,\mathrm m`} />
        <MathFormula
          tex={String.raw`\begin{aligned}\Delta t_{\mathrm{prop},A}&=\Delta t_{\mathrm{prop},B}\\&=\frac{${m.distances[0]}\,\mathrm m}{c}\approx ${fmt(m.propagationTimes[0], 3)}\,\mu\mathrm s\end{aligned}`}
        />
        <p>
          {t(
            "这是从 S2 发射到闸门接收的传播时长，不是落闸事件的坐标时间。",
            "These are light-travel durations from S2 to the gates, not gate-event coordinate times.",
          )}
        </p>
        <small>
          {t(
            "S2 提前发射，使光在列车完全进入时同时到达两门；并非等列车装入后才发射。",
            "S2 emits in advance, so both pulses arrive when the train fits inside; emission does not wait until the train is inside.",
          )}
        </small>
      </div>
      <div className="derivation-step order-result">
        <h4>{t("4 · 两个落闸事件", "4 · The two gate-drop events")}</h4>
        <MathFormula
          tex={String.raw`t_A=t_B=${doorEvents[0].tunnel.t}\,\mu\mathrm s`}
        />
        <MathFormula tex={String.raw`\Delta t=t_B-t_A=0`} />
        <strong>{t("站台系 S 中同时发生", "SIMULTANEOUS IN STATION S")}</strong>
        <p>
          {t(
            "选取共同接收时刻为 t = 0。相等的距离和相同的光速，使两个静止闸门同时收到信号。",
            "Choose the common reception time as t = 0. Equal paths at the same light speed give simultaneous reception at the stationary gates.",
          )}
        </p>
      </div>
    </section>
  );
}

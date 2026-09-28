import { StationDerivation } from "./StationDerivation";
import {
  EventTimeDerivation,
  eventTimeDerivation,
} from "./EventTimeDerivation";
import {
  C,
  doorEvents,
  transformSpaceTime,
  fmt,
  calculateDoorTimeDifference,
  getTrainLength,
  getTunnelLength,
  lorentzGamma,
  frameTime,
  gateProgress,
  trainMidpoint,
  tunnelLandmark,
  sensorEvents,
  trainFitsInTunnel,
} from "../physics/model";
import type { Frame } from "../physics/model";
import type { Stage } from "../stages/stages";
import { useLanguage } from "../i18n";
import { SpacetimeDiagram } from "./SpacetimeDiagram";
import { MathFormula } from "./MathFormula";
export function PhysicsPanel({
  stage,
  beta,
  frame,
  time,
  axes,
  paradox,
  introProgress,
}: {
  stage: Stage;
  beta: number;
  frame: Frame;
  time: number;
  axes: boolean;
  paradox: boolean;
  introProgress: number;
}) {
  const { t, local } = useLanguage(),
    g = lorentzGamma(beta),
    q = frameTime(time, frame, beta);
  const derivation = stage.frame === "train";
  const station = stage.diagram === "tunnel";
  const { first } = eventTimeDerivation(beta);
  const rows = [
    ["β", fmt(beta, 3)],
    ["γ", fmt(g, 4)],
    [t("相对速度 v", "Relative v"), `${fmt(beta * C, 2)} m/μs`],
    [frame === "tunnel" ? "t" : "t′", `${fmt(q, 4)} μs`],
    [t("列车长度", "Train length"), `${fmt(getTrainLength(frame, beta), 1)} m`],
    [
      t("隧道长度", "Tunnel length"),
      `${fmt(getTunnelLength(frame, beta), 1)} m`,
    ],
    [
      t(
        `列车中点 ${frame === "train" ? "x′" : "x"}`,
        `Train midpoint ${frame === "train" ? "x′" : "x"}`,
      ),
      `${fmt(trainMidpoint(time, frame, beta), 2)} m`,
    ],
    [
      t(
        `隧道中心 ${frame === "train" ? "x′" : "x"}`,
        `Tunnel centre ${frame === "train" ? "x′" : "x"}`,
      ),
      `${fmt(tunnelLandmark(0, time, frame, beta), 2)} m`,
    ],
  ];
  return (
    <aside className="physics panel">
      <section className="live-card">
        <div className="section-heading">
          <h3>{t("实时参数", "LIVE PARAMETERS")}</h3>
          <span className="live-dot">
            ●{" "}
            {paradox
              ? t("上方实际过程", "Upper physical view")
              : frame === "tunnel"
                ? t("站台 S", "Station S")
                : t("列车 S′", "Train S′")}
          </span>
        </div>
        <dl className="metrics">
          {(derivation || station ? rows.slice(0, 6) : rows).map(
            ([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd
                  data-testid={
                    key === "t" || key === "t′" ? "live-time" : undefined
                  }
                >
                  {value}
                </dd>
              </div>
            ),
          )}
        </dl>
        {station && (
          <strong>
            {trainFitsInTunnel(beta)
              ? t("站台系：列车可容纳", "STATION S: TRAIN FITS")
              : t("站台系：列车过长", "STATION S: TRAIN TOO LONG")}
          </strong>
        )}
        <div className="gate-meters">
          {(["A", "B"] as const).map((id) => {
            const progress = paradox
              ? introProgress
              : gateProgress(id, time, frame, beta);
            return (
              <div key={id}>
                <span>{t(`闸门 ${id}`, `Gate ${id}`)}</span>
                <progress max={1} value={progress} />
                <strong>{fmt(progress * 100, 0)}%</strong>
              </div>
            );
          })}
        </div>
        {paradox ? (
          <small>
            {t(
              "下方动画故意使用错误门序，无实际碰撞事件。",
              "The lower animation uses false timing; no real collision event.",
            )}
          </small>
        ) : !derivation && !station ? (
          <>
            <div className="wave-metrics">
              {sensorEvents(beta).map((e) => (
                <span key={e.id}>
                  {e.id} · r ={" "}
                  {fmt(
                    trainFitsInTunnel(beta)
                      ? Math.max(
                          0,
                          C * (q - transformSpaceTime(e.tunnel, frame, beta).t),
                        )
                      : 0,
                    1,
                  )}{" "}
                  m
                </span>
              ))}
            </div>
            <small>
              {t(
                "光圈半径随当前参考系时间变化。",
                "Wave radii follow the selected frame’s time.",
              )}
            </small>
          </>
        ) : null}
      </section>
      <section>
        <h3>{t("关键结论", "KEY TAKEAWAY")}</h3>
        <p className="takeaway">
          {derivation
            ? first === null
              ? t(
                  "β = 0：A、B 在两个参考系中均同时发生。",
                  "At β = 0, A and B are simultaneous in both frames.",
                )
              : first === "B"
                ? t(
                    "列车系中，出口 B 的时间坐标小于入口 A，因此 B 先落下。",
                    "In the train frame, exit B has a smaller time coordinate than entrance A, so B drops first.",
                  )
                : t(
                    "列车系中 A 的时间坐标更小，因此 A 先落下。",
                    "In the train frame A has the smaller time coordinate, so A drops first.",
                  )
            : station && !trainFitsInTunnel(beta)
              ? t(
                  "此速度下列车无法完全进入隧道。等距光路仍定义同时接收事件，但不能据此演示安全通过。",
                  "At this speed the train does not fit. Equal light paths still define simultaneous receptions, but cannot demonstrate safe passage.",
                )
              : local(stage.takeaway)}
        </p>
      </section>
      {axes && !paradox && (
        <SpacetimeDiagram beta={beta} time={time} frame={frame} />
      )}
      {derivation ? (
        <EventTimeDerivation beta={beta} />
      ) : station ? (
        <StationDerivation beta={beta} />
      ) : (
        <section>
          <h3>{t("相对论公式", "RELATIVITY FORMULAS")}</h3>
          {stage.frame === "train" && (
            <small>
              {t(
                "Δt′A、Δt′B 从 S2 发射时刻开始计时；下表 t′A、t′B 是事件的坐标时间。",
                "Δt′A and Δt′B measure travel from S2 emission; the table lists absolute coordinate times t′A and t′B.",
              )}
            </small>
          )}
          {stage.formula.map((tex) => (
            <MathFormula key={tex} tex={tex} />
          ))}
          <div className="formula-result">
            <MathFormula
              tex={String.raw`\beta=${fmt(beta, 3)}\;\Longrightarrow\;\gamma=${fmt(g, 4)}`}
            />
          </div>
          <small>
            {t(
              "长度单位 m；时间单位 μs；c = 299.792458 m/μs。",
              "Lengths in m; times in μs; c = 299.792458 m/μs.",
            )}
          </small>
        </section>
      )}
      {paradox ? (
        <section>
          <h3>{t("两个参考系的长度", "LENGTHS IN BOTH FRAMES")}</h3>
          <table>
            <thead>
              <tr>
                <th>{t("参考系", "Frame")}</th>
                <th>{t("列车", "Train")}</th>
                <th>{t("隧道", "Tunnel")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>S</td>
                <td>{fmt(300 / g, 1)} m</td>
                <td>200 m</td>
              </tr>
              <tr>
                <td>S′</td>
                <td>300 m</td>
                <td>{fmt(200 / g, 1)} m</td>
              </tr>
            </tbody>
          </table>
        </section>
      ) : !station ? (
        <section>
          <h3>{t("同一接收事件，两种时间", "SAME RECEPTIONS, TWO TIMES")}</h3>
          <table>
            <thead>
              <tr>
                <th>{t("闸门", "Gate")}</th>
                <th>t / μs</th>
                <th>t′ / μs</th>
              </tr>
            </thead>
            <tbody>
              {doorEvents.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{fmt(e.tunnel.t)}</td>
                  <td>{fmt(transformSpaceTime(e.tunnel, "train", beta).t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <MathFormula
            tex={String.raw`t'_B-t'_A=${fmt(calculateDoorTimeDifference(beta))}\,\mu\mathrm{s}`}
          />
        </section>
      ) : null}
      {derivation && (
        <details className="diagram-details">
          <summary>
            {t("事件坐标与模型备注", "Event coordinates & model notes")}
          </summary>
          <small>
            {t(
              "以下 Δt′A、Δt′B 为从 S2 发射起算的传播时长，不是事件坐标时间。",
              "Below, Δt′A and Δt′B are travel durations from S2 emission, not event coordinate times.",
            )}
          </small>
          {stage.formula.map((tex) => (
            <MathFormula key={tex} tex={tex} />
          ))}
        </details>
      )}
      <section>
        <h3>{t("观察提示", "WHAT TO OBSERVE")}</h3>
        <p>{local(stage.observe)}</p>
        {station && (
          <p className="takeaway">
            {t(
              "列车系 S′ 也会认为两门同时落下吗？",
              "Will Train Frame S′ also call these events simultaneous?",
            )}
          </p>
        )}
      </section>
    </aside>
  );
}

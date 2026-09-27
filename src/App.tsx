import { useEffect, useState } from "react";
import { LanguageContext, useLanguage, type Language } from "./i18n";
import { stages, type CameraView } from "./stages/stages";
import {
  C,
  doorEvents,
  openingEvents,
  lorentzGamma,
  fmt,
  frameTime,
  timelineBounds,
  transformSpaceTime,
  calculateFitThreshold,
  trainFitsInTunnel,
  sensorEvents,
  eventAnchor,
  gateProgress,
  shutterDuration,
  playbackRate,
} from "./physics/model";
import type { Frame } from "./physics/model";
import { INTRO_DURATION, introSnapshot } from "./physics/intro";
import { useSimulationClock } from "./hooks/useSimulationClock";
import { useIntroClock } from "./hooks/useIntroClock";
import { RelativityScene } from "./components/RelativityScene";
import { PhysicsPanel } from "./components/PhysicsPanel";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title =
      language === "zh"
        ? "列车与隧道悖论 · 相对论实验室"
        : "Train–Tunnel Paradox · Relativity Lab";
  }, [language]);
  return (
    <LanguageContext.Provider value={language}>
      <Lab setLanguage={setLanguage} />
    </LanguageContext.Provider>
  );
}
function Lab({ setLanguage }: { setLanguage: (language: Language) => void }) {
  const { language, t, local } = useLanguage();
  const [index, setIndex] = useState(0),
    [explore, setExplore] = useState(false),
    [beta, setBeta] = useState(0.8),
    [frame, setFrame] = useState<Frame>("tunnel"),
    [camera, setCamera] = useState<CameraView>("Side");
  const [guides, setGuides] = useState({
    lengths: true,
    signals: true,
    events: true,
    axes: true,
  });
  const paradox = index === 0 && !explore;
  const clock = useSimulationClock(beta, undefined, frame),
    intro = useIntroClock(paradox);
  const stage = stages[index],
    g = lorentzGamma(beta),
    fits = trainFitsInTunnel(beta),
    bounds = timelineBounds(beta),
    sensors = sensorEvents(beta);
  const introState = introSnapshot(intro.time, beta),
    q = frameTime(clock.time, frame, beta);
  const playTime = paradox ? intro.time : clock.time,
    playing = paradox ? intro.playing : clock.playing;
  function go(i: number) {
    setIndex(i);
    setExplore(false);
    setFrame(stages[i].frame);
    setCamera("Side");
    if (i === 0) {
      setBeta(0.8);
      clock.setPlaying(false);
      intro.replay();
    } else if (index === 0) {
      clock.setTime(timelineBounds(beta).start);
      clock.setPlaying(trainFitsInTunnel(beta));
    }
  }
  function mode(value: boolean) {
    setExplore(value);
    if (value && index === 0) {
      setIndex(2);
      setFrame("train");
      clock.setTime(bounds.start);
      clock.setPlaying(false);
    }
  }
  function changeBeta(value: number) {
    if (!Number.isFinite(value) || value < 0 || value > 0.95) return;
    setBeta(value);
    if (!trainFitsInTunnel(value)) clock.setPlaying(false);
  }
  function jump(x: number, t0: number) {
    clock.setPlaying(false);
    clock.setTime(eventAnchor({ x, t: t0 }, frame, beta));
  }
  function togglePlay() {
    if (paradox) {
      if (intro.time >= INTRO_DURATION) intro.replay();
      else intro.setPlaying(!intro.playing);
    } else {
      if (clock.time >= bounds.end) clock.setTime(bounds.start);
      clock.setPlaying(!clock.playing);
    }
  }
  const reception = (id: "A" | "B") => {
    if (!fits) return t("禁止落闸", "Drop disabled");
    if (!shutterDuration(beta))
      return t("零时长理想极限", "Zero-duration limit");
    const event = doorEvents[id === "A" ? 0 : 1],
      time = transformSpaceTime(event.tunnel, frame, beta).t;
    return q < time - 1e-9
      ? t("等待信号", "Awaiting light")
      : gateProgress(id, clock.time, frame, beta) < 1
        ? t("正在下落", "Dropping")
        : t("已落到轨道下方", "Clear below track");
  };
  const relay = transformSpaceTime(sensors[1].tunnel, frame, beta).t,
    trigger = transformSpaceTime(sensors[0].tunnel, frame, beta).t;
  const received = doorEvents.filter(
    (e) => q >= transformSpaceTime(e.tunnel, frame, beta).t - 1e-9,
  ).length;
  const caption = !fits
    ? t(
        "速度尚不足以让列车完全进入隧道，安全落闸流程已禁用。",
        "The train does not fit; the safe gate sequence is disabled.",
      )
    : q < trigger
      ? t(
          "列车接近上游 S1，车身中点的探测器将触发它。",
          "The train approaches S1; its midpoint detector will trigger the sensor.",
        )
      : q < relay - 1e-9
        ? t(
            "S1 发光，光圈以光速向四周扩大。发射中心留在原处，光圈不跟随移动的传感器。",
            "S1 emits. Its wave expands at c about the fixed emission event, not the moving sensor.",
          )
        : received === 0
          ? frame === "tunnel"
            ? t(
                "S2 收到光并转发。两门静止、距离相等，金色光圈将同时到达。",
                "S2 receives and relays. Equal distances to stationary gates give simultaneous arrival.",
              )
            : t(
                "S2 发出金色光圈。出口 B 迎光靠近，入口 A 背光远离：谁先收到？",
                "S2 emits the gold wave. B approaches it; A recedes. Which receives it first?",
              )
          : received === 1
            ? t(
                "出口 B 先收到信号并落下；入口 A 仍在等待。B 会在到达车头前落到轨道下方。",
                "B receives first and drops; A still awaits light. B clears below the track before reaching the nose.",
              )
            : frame === "tunnel"
              ? t(
                  "两门同时接收并下落。列车完全位于隧道内，闸门及时让开，列车安全通过。",
                  "Both gates receive and drop together. The train fits inside and passes safely after the gates clear.",
                )
              : t(
                  "光随后追上入口 A，此时车尾已通过。两门先后落下，没有碰撞；误区就在于假设两系都同时落闸。",
                  "Light later catches A behind the rear. Different drop times prevent a collision: simultaneity was the mistaken assumption.",
                );
  const introCaption = [
    t(
      "① 接近隧道：上方列车运动，下方隧道运动。",
      "① Approach: the train moves above; the tunnel moves below.",
    ),
    t(
      "② 假设两系都同时落闸，比较两种 3D 状态。",
      "② Assume simultaneous drops in both frames. Compare the 3D states.",
    ),
    t(
      "③ 下方出现预测的碰撞——这是错误假设的结果，不是真实事故。",
      "③ The lower frame predicts impact: a false assumption, not a real accident.",
    ),
    t(
      "④ 上方安全通过，下方停在误区处。下一步用光信号解释。",
      "④ Safe passage above; the misconception freezes below. Next, follow the light.",
    ),
  ][introState.phase];
  return (
    <div className="app">
      <header>
        <div>
          <span className="eyebrow">
            {t("现代物理 · 狭义相对论", "MODERN PHYSICS · SPECIAL RELATIVITY")}
          </span>
          <h1>{t("列车与隧道悖论", "Train–Tunnel Paradox")}</h1>
        </div>
        <div className="header-actions">
          <div className="segmented" aria-label={t("模式", "Mode")}>
            <button aria-pressed={!explore} onClick={() => mode(false)}>
              {t("学习模式", "Learn")}
            </button>
            <button aria-pressed={explore} onClick={() => mode(true)}>
              {t("自由探索", "Explore")}
            </button>
          </div>
          <div className="segmented language" aria-label="Language">
            <button
              aria-pressed={language === "zh"}
              onClick={() => setLanguage("zh")}
            >
              中文
            </button>
            <button
              aria-pressed={language === "en"}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>
      <main>
        <nav
          className="process panel"
          aria-label={t("学习阶段", "Learning stages")}
        >
          <span className="rail-brand">SR / 03</span>
          {stages.map((s, i) => (
            <button
              key={i}
              aria-label={t(`前往阶段 ${i + 1}`, `Go to stage ${i + 1}`)}
              aria-current={i === index ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="number">{i + 1}</span>
              <span>
                <b>{local(s.title)}</b>
                <small>{local(s.subtitle)}</small>
              </span>
            </button>
          ))}
          <p className="rail-note">
            {t("一个实验，三个步骤。", "One experiment. Three steps.")}
            <br />
            300 m / 200 m
          </p>
        </nav>
        <section className="center">
          <div className="experiment panel">
            <div className="scene-heading">
              <div>
                <span className="eyebrow">
                  {explore
                    ? t("自由探索", "EXPLORE")
                    : t(`阶段 ${index + 1} / 3`, `STAGE ${index + 1} OF 3`)}
                </span>
                <h2>{local(stage.title)}</h2>
              </div>
              <p>{local(stage.question)}</p>
            </div>
            <div className={`scene ${paradox ? "paradox-scene" : ""}`}>
              <RelativityScene
                beta={beta}
                time={clock.time}
                frame={frame}
                camera={camera}
                events={guides.events}
                signals={guides.signals}
                lengths={guides.lengths}
                paradox={paradox}
                introTime={intro.time}
              />
              {paradox ? (
                <div className="paradox-labels">
                  <div className="paradox-label station">
                    <b>
                      {t(
                        "站台系 S · 实际安全过程",
                        "STATION S · SAFE PHYSICAL SEQUENCE",
                      )}
                    </b>
                    <strong>
                      {t(
                        "列车收缩：180 m < 200 m",
                        "Contracted train: 180 m < 200 m",
                      )}
                    </strong>
                  </div>
                  <div className="paradox-label train">
                    <b>
                      {t(
                        "列车系 S′ · 错误假设动画",
                        "TRAIN S′ · INCORRECT ASSUMPTION",
                      )}
                    </b>
                    <strong>
                      {t(
                        "隧道收缩：120 m < 300 m",
                        "Contracted tunnel: 120 m < 300 m",
                      )}
                    </strong>
                    <span>
                      {introState.impact
                        ? t(
                            "× 预测相撞：错误地假设两门也同时落下",
                            "× Predicted impact: incorrectly assuming simultaneous drops",
                          )
                        : t(
                            "假设两门仍同时落下，会怎样？",
                            "What if both gates still dropped simultaneously?",
                          )}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="frame-banner">
                    <span>{t("当前参考系", "REFERENCE FRAME")}</span>
                    <strong>
                      {frame === "tunnel"
                        ? t("站台系 S", "Station S")
                        : t("列车系 S′", "Train S′")}
                    </strong>
                    <small>
                      {frame === "tunnel"
                        ? t("列车 →", "Train →")
                        : t("隧道 ←", "Tunnel ←")}{" "}
                      {fmt(beta, 2)}c
                    </small>
                  </div>
                  <div className="door-status">
                    <span>A · {reception("A")}</span>
                    <span>B · {reception("B")}</span>
                  </div>
                  <div className="clock-overlay">
                    {frame === "tunnel" ? "t" : "t′"} = {fmt(q)} μs
                  </div>
                </>
              )}
              <div className="scene-note">
                {paradox
                  ? t(
                      "上下为对照示意；下方是待纠正的推断。",
                      "Comparison animation; the lower timing is deliberately incorrect.",
                    )
                  : t(
                      "纵向长度按比例；闸门高度为示意。落闸时整体慢放。",
                      "Longitudinal scale; schematic gate height. Shared-clock slow motion during drops.",
                    )}
              </div>
            </div>
            <div className="playback">
              <button
                className="primary"
                disabled={!paradox && !fits}
                onClick={togglePlay}
              >
                {playing ? t("暂停", "Pause") : t("播放", "Play")}
              </button>
              <button
                onClick={() => {
                  if (paradox) intro.replay();
                  else {
                    clock.setTime(bounds.start);
                    clock.setPlaying(fits);
                  }
                }}
              >
                {t("重播", "Replay")}
              </button>
              <input
                aria-label={t("播放进度", "Playback timeline")}
                type="range"
                min={paradox ? 0 : Math.min(bounds.start, clock.time)}
                max={
                  paradox ? INTRO_DURATION : Math.max(bounds.end, clock.time)
                }
                step="any"
                value={playTime}
                onChange={(e) => {
                  if (paradox) {
                    intro.setTime(+e.target.value);
                  } else {
                    clock.setTime(+e.target.value);
                  }
                }}
              />
              <output data-testid="anchor-time">
                {paradox
                  ? `${fmt(intro.time, 1)} / 12 s`
                  : `T = ${fmt(clock.time)} μs`}
              </output>
            </div>
            <div className="signal-story" aria-live="polite">
              <p>{paradox ? introCaption : caption}</p>
            </div>
            {!paradox && (
              <>
                <div className="circuit-steps">
                  {[...sensors, ...doorEvents].map((e) => (
                    <button
                      key={e.id}
                      disabled={!fits}
                      className={
                        q >= transformSpaceTime(e.tunnel, frame, beta).t - 1e-9
                          ? "reached"
                          : ""
                      }
                      onClick={() => jump(e.tunnel.x, e.tunnel.t)}
                    >
                      {e.id} ·{" "}
                      {e.id === "S1"
                        ? t("发射", "Emit")
                        : e.id === "S2"
                          ? t("转发", "Relay")
                          : t("接收", "Receive")}
                    </button>
                  ))}
                </div>
                <div className="controls">
                  <div className="velocity">
                    <label htmlFor="beta">
                      {t("相对速度", "Relative speed")}{" "}
                      <strong>β = {fmt(beta, 3)}</strong>
                    </label>
                    <input
                      id="beta"
                      aria-label={t("相对速度 beta", "Relative velocity beta")}
                      type="range"
                      min="0"
                      max=".95"
                      step=".001"
                      value={beta}
                      onChange={(e) => changeBeta(+e.target.value)}
                    />
                  </div>
                  <div className="control-group">
                    <label>{t("参考系", "Frame")}</label>
                    <div className="segmented">
                      <button
                        aria-pressed={frame === "tunnel"}
                        onClick={() => setFrame("tunnel")}
                      >
                        {t("站台", "Station")}
                      </button>
                      <button
                        aria-pressed={frame === "train"}
                        onClick={() => setFrame("train")}
                      >
                        {t("列车", "Train")}
                      </button>
                    </div>
                  </div>
                  <div className="control-group">
                    <label htmlFor="camera">{t("视角", "Camera")}</label>
                    <select
                      id="camera"
                      value={camera}
                      onChange={(e) => setCamera(e.target.value as CameraView)}
                    >
                      <option value="Side">{t("侧面", "Side")}</option>
                      <option value="Overview">{t("全景", "Overview")}</option>
                      <option value="Center">{t("中心", "Center")}</option>
                    </select>
                  </div>
                </div>
                <div className="event-jumps">
                  {doorEvents.map((e) => (
                    <button
                      key={e.id}
                      disabled={!fits || !shutterDuration(beta)}
                      onClick={() =>
                        jump(e.tunnel.x, shutterDuration(beta) / 2)
                      }
                    >
                      {t(`查看 ${e.id} 落闸`, `Inspect ${e.id} drop`)}
                    </button>
                  ))}
                  <small>
                    {!clock.playing
                      ? t(
                          "已暂停 · 点击播放继续",
                          "Paused · press Play to continue",
                        )
                      : playbackRate(clock.time, frame, beta) < 0.25
                        ? t("落闸慢动作", "Gate slow motion")
                        : t("正常速度", "Normal speed")}
                  </small>
                </div>
                {explore && (
                  <div className="explore-controls">
                    <label>
                      β{" "}
                      <input
                        aria-label={t("精确 beta", "Exact beta")}
                        type="number"
                        min="0"
                        max=".95"
                        step=".001"
                        value={beta}
                        onChange={(e) =>
                          changeBeta(e.currentTarget.valueAsNumber)
                        }
                      />
                    </label>
                    <button
                      onClick={() => {
                        changeBeta(calculateFitThreshold());
                        clock.setPlaying(false);
                        clock.setTime(0);
                      }}
                    >
                      {t("临界速度", "Fit threshold")}
                    </button>
                    {Object.entries(guides).map(([key, value]) => (
                      <label key={key}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setGuides({ ...guides, [key]: e.target.checked })
                          }
                        />
                        {
                          {
                            lengths: t("长度标线", "Lengths"),
                            signals: t("光信号", "Light signals"),
                            events: t("事件标记", "Events"),
                            axes: t("时空图", "Spacetime"),
                          }[key as keyof typeof guides]
                        }
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <footer className="navigation panel">
            <button disabled={index === 0} onClick={() => go(index - 1)}>
              {t("上一步", "Previous")}
            </button>
            <div className="progress">
              {stages.map((_, i) => (
                <button
                  key={i}
                  aria-label={t(`阶段 ${i + 1}`, `Stage ${i + 1}`)}
                  aria-current={i === index ? "step" : undefined}
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <button
              className="primary"
              onClick={() => (index === 2 ? mode(true) : go(index + 1))}
            >
              {index === 2 ? t("自由探索", "Explore") : t("下一步", "Next")}
            </button>
          </footer>
          <details className="event-records panel">
            <summary>
              {t("事件坐标与模型说明", "Event coordinates & model notes")}
            </summary>
            <p>
              {t(
                "S1 由车身中点触发，位置按速度标定。S2 向两门转发光；闸门收到后下落到轨道下方。低于临界速度禁止落闸，临界速度下不存在有限落闸时间。",
                "S1 is calibrated to the train midpoint. S2 relays light to both gates, which then drop below the track. Drops are disabled below threshold; no finite drop is possible at the threshold.",
              )}
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t("事件", "Event")}</th>
                    <th>x / m</th>
                    <th>t / μs</th>
                    <th>x′ / m</th>
                    <th>t′ / μs</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sensors, ...doorEvents, ...openingEvents(beta)].map(
                    (e) => {
                      const prime = transformSpaceTime(e.tunnel, "train", beta);
                      return (
                        <tr key={e.id}>
                          <td>
                            {e.id}
                            {e.kind === "door-open"
                              ? t(" 已让开", " cleared")
                              : ""}
                          </td>
                          <td>{fmt(e.tunnel.x)}</td>
                          <td>{fmt(e.tunnel.t, 5)}</td>
                          <td>{fmt(prime.x)}</td>
                          <td>{fmt(prime.t, 5)}</td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <PhysicsPanel
          stage={stage}
          beta={beta}
          frame={frame}
          time={paradox ? introState.time : clock.time}
          axes={!paradox && guides.axes}
          paradox={paradox}
          introProgress={introState.progress}
        />
      </main>
    </div>
  );
}

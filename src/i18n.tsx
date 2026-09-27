import { createContext, useContext } from "react";
export type Language = "zh" | "en";
export const LanguageContext = createContext<Language>("en");
export type LocalText = { zh: string; en: string };
export const text = (zh: string, en: string): LocalText => ({ zh, en });
export function useLanguage() {
  const language = useContext(LanguageContext);
  return {
    language,
    t: (zh: string, en: string) => (language === "zh" ? zh : en),
    local: (value: LocalText) => value[language],
  };
}
export function sceneLabel(value: string, language: Language) {
  if (language === "en") return value;
  return value
    .replace("← TUNNEL + SENSORS MOVE", "← 隧道与传感器运动")
    .replace("A · ENTRANCE", "A · 入口")
    .replace("B · EXIT", "B · 出口")
    .replace("S1 · TRIGGER", "S1 · 上游传感器")
    .replace("S2 · RELAY", "S2 · 中央传感器")
    .replace("RECEIVED HERE", "在此接收")
    .replace("FRONT →", "车头 →")
    .replace("REAR", "车尾")
    .replace("TUNNEL", "隧道")
    .replace("TRAIN", "列车");
}

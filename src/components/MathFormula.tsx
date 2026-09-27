import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
export function MathFormula({ tex }: { tex: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: true,
        throwOnError: true,
        trust: false,
        output: "htmlAndMathml",
      }),
    [tex],
  );
  return (
    <div
      className="math-formula"
      data-tex={tex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

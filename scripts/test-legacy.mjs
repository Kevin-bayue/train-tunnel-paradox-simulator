import fs from "node:fs";
import vm from "node:vm";
const source = fs
  .readFileSync(
    new URL("../legacy/relativity-lab.html", import.meta.url),
    "utf8",
  )
  .split("<script>")[1]
  .split("</script>")[0]
  .split("/* K. Bootstrap")[0];
const context = vm.createContext({
  window: {},
  console,
  localStorage: { getItem: () => null },
  performance: { now: () => 0 },
});
vm.runInContext(source, context);
const result = vm.runInContext("runPhysicsTests(false)", context);
console.log(`Legacy physics: ${result.passed}/${result.total} passed`);
if (result.failed) {
  console.error(result.results.filter((r) => !r.passed));
  process.exitCode = 1;
}

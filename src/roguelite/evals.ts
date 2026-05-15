import type { BuildStats } from "../gameplay/upgrades";

export interface EvalProtocol {
  id: string;
  name: string;
  severity: number;
  body: string;
  applyPreRun?: (build: BuildStats) => void;
}

export const EVAL_PROTOCOLS: EvalProtocol[] = [
  {
    id: "low_context_window",
    name: "Low Context Window",
    severity: 1,
    body: "-0.3 pickup range. The patch has to survive with less memory, also known as leadership.",
    applyPreRun: (build) => {
      build.pickupRange = Math.max(0.7, build.pickupRange - 0.3);
    }
  },
  {
    id: "hostile_benchmark",
    name: "Hostile Benchmark",
    severity: 2,
    body: "Enemy pressure ramps as if one extra pilot joined the run and immediately made enemies."
  },
  {
    id: "regression_suite",
    name: "Regression Suite",
    severity: 2,
    body: "Oath-Eater arrives with more HP and extra Broken Promise pressure. The treaty has become a gym.",
  },
  {
    id: "compute_starvation",
    name: "Compute Starvation",
    severity: 1,
    body: "Draft choices lose one slot unless Kernel modules restore it. Scarcity builds character, allegedly.",
    applyPreRun: (build) => {
      build.draftChoicesBonus -= 1;
    }
  }
];

export function selectedEvalProtocols(ids: readonly string[]): EvalProtocol[] {
  return ids
    .map((id) => EVAL_PROTOCOLS.find((protocol) => protocol.id === id))
    .filter((protocol): protocol is EvalProtocol => Boolean(protocol));
}

export function evalSummary(ids: readonly string[]) {
  const protocols = selectedEvalProtocols(ids);
  return {
    id: "adversarial_eval_protocols",
    severity: protocols.reduce((sum, protocol) => sum + protocol.severity, 0),
    protocols: protocols.map((protocol) => ({
      id: protocol.id,
      name: protocol.name,
      severity: protocol.severity,
      body: protocol.body
    }))
  };
}

export function applyEvalPreRun(build: BuildStats, ids: readonly string[]): void {
  for (const protocol of selectedEvalProtocols(ids)) protocol.applyPreRun?.(build);
}

export function hasEvalProtocol(ids: readonly string[], id: string): boolean {
  return ids.includes(id);
}

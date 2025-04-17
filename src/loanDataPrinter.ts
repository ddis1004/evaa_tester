function formatWithDecimals(value: bigint, decimals: number): string {
  // 1) 음수 처리
  if (value < 0n) {
    return "-" + formatWithDecimals(-value, decimals);
  }
  // 2) 절대값을 문자열로, 최소 digits = decimals + 1
  const s = value.toString().padStart(decimals + 1, "0");
  const intPart = s.slice(0, -decimals);
  let fracPart = s.slice(-decimals).replace(/0+$/, ""); // 우측 0 제거
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}
export function printLendData(data: any, assetConfig: { assetId: bigint; name: string }[]) {
  console.log("=== LENDING SUMMARY ===\n");

  console.log(`Health Factor: ${data.healthFactor}\n`);

  // 2) 총 예치·차입 (이자 반영된 토큰 개수)
  console.log(`총 예치 (이자 반영) ($): ${formatWithDecimals(data.supplyBalance.toString(), 9)}`);
  console.log(`총 차입 (이자 반영) ($): ${formatWithDecimals(data.borrowBalance.toString(), 9)}\n`);

  console.log("--- Real Principals (원금) ---");
  for (const cfg of assetConfig) {
    const p = data.realPrincipals.get(cfg.assetId) ?? 0n;
    if (p === 0n) continue;
    console.log(`자산: ${cfg.name}`);
    console.log(`  • 원금: ${formatWithDecimals(p, ["USDT", "jUSDT"].includes(cfg.name) ? 6 : 9)}`);
  }

  console.log("\n--- Balances (이자 반영된 결과) ---");
  for (const cfg of assetConfig) {
    const bal = data.balances.get(cfg.assetId);
    if (!bal || bal.amount === 0n) continue;

    const decimals = ["USDT", "jUSDT"].includes(cfg.name) ? 6 : 9;
    const formatted = formatWithDecimals(bal.amount, decimals);
    console.log(`자산: ${cfg.name}`);
    console.log(`타입: ${bal.type}`);
    console.log(`  • balance: ${formatted}`);
  }
}

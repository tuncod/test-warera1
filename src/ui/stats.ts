import type { AllianceEdge } from '@/types';

export class StatsDisplay {
  private countriesEl: HTMLElement;
  private alliancesEl: HTMLElement;
  private warsEl: HTMLElement;
  private alliancesAvgEl: HTMLElement;
  private warsAvgEl: HTMLElement;

  constructor() {
    this.countriesEl = document.getElementById('stat-countries')!;
    this.alliancesEl = document.getElementById('stat-alliances')!;
    this.warsEl = document.getElementById('stat-wars')!;
    this.alliancesAvgEl = document.getElementById('stat-alliances-avg')!;
    this.warsAvgEl = document.getElementById('stat-wars-avg')!;
  }

  update(countryCount: number, edges: AllianceEdge[]): void {
    this.countriesEl.textContent = String(countryCount);

    let allianceCount = 0;
    let warCount = 0;

    for (const edge of edges) {
      if (edge.type === 'alliance') {
        allianceCount++;
      } else {
        warCount++;
      }
    }

    this.alliancesEl.textContent = String(allianceCount);
    this.warsEl.textContent = String(warCount);

    // Calculate averages
    const avgAlliances = countryCount > 0 ? (allianceCount * 2 / countryCount).toFixed(1) : '0.0';
    const avgWars = countryCount > 0 ? (warCount * 2 / countryCount).toFixed(1) : '0.0';

    this.alliancesAvgEl.textContent = `(${avgAlliances}/country)`;
    this.warsAvgEl.textContent = `(${avgWars}/country)`;
  }

  setLoading(): void {
    this.countriesEl.textContent = '…';
    this.alliancesEl.textContent = '…';
    this.warsEl.textContent = '…';
    this.alliancesAvgEl.textContent = '';
    this.warsAvgEl.textContent = '';
  }
}

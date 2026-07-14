import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface FormulaItem {
  name: string;
  formula: string;
  substitution: string;
  result: any;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  chart?: Chart;
  loading = false;
  result: any = null;
  h0 = '';
  h1 = '';
  
  formulaList: FormulaItem[] = [];

  testConfig = {
    type: 'one' as 'one' | 'two',
    alpha: 0.05,
    sampleSize: 50,
    populationMean: 200,
    alternative: 'different' as 'less' | 'greater' | 'different'
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.updateHypothesis();
  }

  ngAfterViewInit(): void { }

  changeMode(mode: 'one' | 'two'): void {
    this.testConfig.type = mode;
    this.updateHypothesis();
  }

  updateHypothesis(): void {
    if (this.testConfig.type === 'one') {
      this.h0 = `H₀: μ = ${this.testConfig.populationMean}`;
      switch (this.testConfig.alternative) {
        case 'less':
          this.h1 = `H₁: μ < ${this.testConfig.populationMean}`;
          break;
        case 'greater':
          this.h1 = `H₁: μ > ${this.testConfig.populationMean}`;
          break;
        default:
          this.h1 = `H₁: μ ≠ ${this.testConfig.populationMean}`;
          break;
      }
    } else {
      this.h0 = 'H₀: μA = μB';
      this.h1 = 'H₁: μA ≠ μB';
    }
  }

  executeTest(): void {
    this.loading = true;
    this.dashboardService.runHypothesis({ ...this.testConfig }).subscribe({
      next: (response) => {
        console.log('Respuesta de la API:', response);
        this.result = response;
        
        if (response && response.formulas) {
          this.formulaList = this.parseFormulas(response.formulas);
        } else {
          this.formulaList = [];
        }
        
        this.loading = false;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.createChart();
        }, 50);
      },
      error: (error) => {
        console.error('Error al ejecutar la prueba:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Limpia y simplifica las sustituciones matemáticas largas directamente en el cliente.
   * Si encuentra un patrón del tipo "(num + num + num) / divisor", calcula la suma de inmediato.
   */
  private sanitizeSubstitution(sub: string): string {
    if (!sub || typeof sub !== 'string') return sub;

    // 1. Detectar expresiones tipo: (187 + 180 + ... + 196) / 50 o (187 + 180 + ... + 196) / (50 - 1)
    const match = sub.match(/\(([^)]+)\)\s*\/\s*(\([^)]+\)|[0-9.-]+)/);
    
    if (match) {
      const insideParenthesis = match[1]; // "187 + 180 + ..."
      const divisor = match[2];           // "50" o "(50 - 1)"

      // Validar si solo contiene números, espacios y signos '+'
      if (/^[0-9.+\s-]+$/.test(insideParenthesis)) {
        // Ejecutar la sumatoria de manera segura
        const numbers = insideParenthesis.split('+').map(num => parseFloat(num.trim()));
        const sum = numbers.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);
        
        // Retornar la versión limpia redondeada a 4 decimales si es flotante
        const formattedSum = Number.isInteger(sum) ? sum : Number(sum.toFixed(4));
        
        // Determinar prefijo si existía (ej: "x̄ = " o "s² = ")
        const prefixMatch = sub.match(/^([a-zA-Z̄²\s]+=\s*)/);
        const prefix = prefixMatch ? prefixMatch[1] : '';

        return `${prefix}${formattedSum} / ${divisor}`;
      }
    }

    return sub;
  }

  private parseFormulas(formulasObj: any): FormulaItem[] {
    const list: FormulaItem[] = [];
    
    const nameMap: { [key: string]: string } = {
      mean: 'Media (API A)',
      variance: 'Varianza (API A)',
      standardDeviation: 'Desviación Estándar (API A)',
      standardError: 'Error Estándar (API A)',
      meanA: 'Media (API A)',
      varianceA: 'Varianza (API A)',
      deviationA: 'Desviación Estándar (API A)',
      errorA: 'Error Estándar (API A)',
      meanB: 'Media (API B)',
      varianceB: 'Varianza (API B)',
      deviationB: 'Desviación Estándar (API B)',
      errorB: 'Error Estándar (API B)',
      tStudent: 'Estadístico de Prueba (T-Student)'
    };

    for (const key of Object.keys(formulasObj)) {
      const item = formulasObj[key];
      if (item && typeof item === 'object') {
        const standardSubstitution = item.substitution || 'No especificada';
        list.push({
          name: item.name || nameMap[key] || key.toUpperCase(),
          formula: item.formula || 'No especificada',
          // Aplicamos la limpieza automática aquí
          substitution: this.sanitizeSubstitution(standardSubstitution),
          result: item.result !== undefined ? item.result : 'N/D'
        });
      }
    }
    
    return list;
  }

  createChart(): void {
    if (!this.chartCanvas || !this.result || !this.result.chart) {
      return;
    }
    
    if (this.chart) {
      this.chart.destroy();
    }

    const chartData = this.result.chart;
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: chartData.apiA.map((_: number, index: number) => index + 1),
        datasets: [
          {
            label: 'API A',
            data: chartData.apiA,
            borderColor: '#222222',
            backgroundColor: 'rgba(34, 34, 34, 0.05)',
            tension: 0.3,
            fill: true
          },
          ...(chartData.apiB && chartData.apiB.length > 0
            ? [{
                label: 'API B',
                data: chartData.apiB,
                borderColor: '#0055ff',
                backgroundColor: 'rgba(0, 85, 255, 0.05)',
                tension: 0.3,
                fill: true
              }]
            : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
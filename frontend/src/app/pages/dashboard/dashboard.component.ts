import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
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
  explanation: string; // Soporta descripciones dinámicas para tooltips
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
  @ViewChild('floatingCard') floatingCard!: ElementRef;

  chart?: Chart;
  loading = false;
  result: any = null;
  h0 = '';
  h1 = '';

  formulaList: FormulaItem[] = [];

  // Estado para la tarjeta flotante de resumen
  floatingCardCollapsed = false;

  // Propiedades para la funcionalidad de arrastrar (Drag and Drop)
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialLeft = 0;
  private initialTop = 0;
  private hasDragged = false; // Diferencia un "click" de un "arrastre"

  testConfig = {
    type: 'one' as 'one' | 'two',
    alpha: 0.05,
    sampleSize: null as number | null,       // Inicia vacío para mostrar el placeholder
    populationMean: null as number | null,   // Inicia vacío para mostrar el placeholder
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

  // --- LÓGICA DE ARRASTRE DE LA TARJETA ---
  onDragStart(event: MouseEvent | TouchEvent): void {
    if (!this.floatingCard) return;

    event.preventDefault();

    this.isDragging = true;
    this.hasDragged = false;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.startX = clientX;
    this.startY = clientY;

    const rect = this.floatingCard.nativeElement.getBoundingClientRect();
    this.initialLeft = rect.left;
    this.initialTop = rect.top;

    this.floatingCard.nativeElement.classList.add('is-dragging');
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.floatingCard) return;

    this.hasDragged = true;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;

    let newLeft = this.initialLeft + deltaX;
    let newTop = this.initialTop + deltaY;

    const cardEl = this.floatingCard.nativeElement;
    const cardRect = cardEl.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (newLeft < 0) newLeft = 0;
    if (newLeft + cardRect.width > windowWidth) {
      newLeft = windowWidth - cardRect.width;
    }

    if (newTop < 0) newTop = 0;
    if (newTop + cardRect.height > windowHeight) {
      newTop = windowHeight - cardRect.height;
    }

    cardEl.style.left = `${newLeft}px`;
    cardEl.style.top = `${newTop}px`;
    cardEl.style.bottom = 'auto';
    cardEl.style.right = 'auto';
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd(): void {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.floatingCard) {
        this.floatingCard.nativeElement.classList.remove('is-dragging');
      }
    }
  }

  handleHeaderClick(): void {
    if (!this.hasDragged) {
      this.toggleFloatingCard();
    }
  }

  toggleFloatingCard(): void {
    this.floatingCardCollapsed = !this.floatingCardCollapsed;
  }

  // --- CONEXIÓN DE TABLA CON EL GRÁFICO (HOVER EN TIEMPO REAL) ---
  triggerChartHover(datasetIndex: number, dataIndex: number): void {
    if (!this.chart) return;

    this.chart.setActiveElements([
      {
        datasetIndex: datasetIndex,
        index: dataIndex
      }
    ]);

    const tooltip = this.chart.tooltip;
    if (tooltip) {
      const meta = this.chart.getDatasetMeta(datasetIndex);
      const point = meta.data[dataIndex];

      if (point) {
        tooltip.setActiveElements([
          { datasetIndex, index: dataIndex }
        ], {
          x: point.x,
          y: point.y
        });
      }
    }

    this.chart.update();
  }

  clearChartHover(): void {
    if (!this.chart) return;

    this.chart.setActiveElements([]);
    if (this.chart.tooltip) {
      this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    }

    this.chart.update();
  }

  // --- BUSCADOR ULTRA-FLEXIBLE DE MÉTRICAS ---
  getSummaryValue(key: string, decimals: number = 2, fallback: any = null): string | any {
    if (!this.result) return fallback;

    const targetKeyNormalized = key.toLowerCase().replace(/[-_]/g, '');

    const findValueInObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return undefined;

      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }

      for (const k of Object.keys(obj)) {
        if (k.toLowerCase().replace(/[-_]/g, '') === targetKeyNormalized) {
          if (obj[k] && typeof obj[k] === 'object' && 'result' in obj[k]) {
            return obj[k].result;
          }
          return obj[k];
        }
      }

      return undefined;
    };

    const searchTargets = [
      this.result,
      this.result.metrics,
      this.result.formulas,
      this.result.formulas?.tStudent,
      this.result.formulas?.pValue,
      this.result.formulas?.['p-value'],
      this.result.formulas?.p_value
    ];

    for (const target of searchTargets) {
      const found = findValueInObject(target);
      if (found !== undefined && found !== null) {
        const finalVal = (found && typeof found === 'object' && 'result' in found) ? found.result : found;

        if (finalVal !== undefined && finalVal !== null && finalVal !== 'N/D') {
          return typeof finalVal === 'number' ? finalVal.toFixed(decimals) : finalVal.toString();
        }
      }
    }

    return fallback;
  }

  updateHypothesis(): void {
    if (this.testConfig.type === 'one') {
      this.h0 = `H₀: μ = ${this.testConfig.populationMean ?? ''}`;
      switch (this.testConfig.alternative) {
        case 'less':
          this.h1 = `H₁: μ < ${this.testConfig.populationMean ?? ''}`;
          break;
        case 'greater':
          this.h1 = `H₁: μ > ${this.testConfig.populationMean ?? ''}`;
          break;
        default:
          this.h1 = `H₁: μ ≠ ${this.testConfig.populationMean ?? ''}`;
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

  private sanitizeSubstitution(sub: string): string {
    if (!sub || typeof sub !== 'string') return sub;

    const match = sub.match(/\(([^)]+)\)\s*\/\s*(\([^)]+\)|[0-9.-]+)/);

    if (match) {
      const insideParenthesis = match[1];
      const divisor = match[2];

      if (/^[0-9.+\s-]+$/.test(insideParenthesis)) {
        const numbers = insideParenthesis.split('+').map(num => parseFloat(num.trim()));
        const sum = numbers.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);
        const formattedSum = Number.isInteger(sum) ? sum : Number(sum.toFixed(2));
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

    const explanationMap: { [key: string]: string } = {
      mean: 'El valor promedio obtenido al sumar todos los datos de la muestra A y dividirlos entre el tamaño de la muestra.',
      meanA: 'El valor promedio obtenido al sumar todos los datos de la muestra A y dividirlos entre el tamaño de la muestra.',
      meanB: 'El valor promedio obtenido al sumar todos los datos de la muestra B y dividirlos entre el tamaño de la muestra.',
      variance: 'Mide la variabilidad o dispersión de los datos de la muestra A respecto a su media aritmética elevada al cuadrado.',
      varianceA: 'Mide la variabilidad o dispersión de los datos de la muestra A respecto a su media aritmética elevada al cuadrado.',
      varianceB: 'Mide la variabilidad o dispersión de los datos de la muestra B respecto a su media aritmética elevada al cuadrado.',
      standardDeviation: 'La raíz cuadrada de la varianza. Indica, en promedio, qué tan alejados están los datos de la muestra A respecto a la media.',
      deviationA: 'La raíz cuadrada de la varianza. Indica, en promedio, qué tan alejados están los datos de la muestra A respecto a la media.',
      deviationB: 'La raíz cuadrada de la varianza. Indica, en promedio, qué tan alejados están los datos de la muestra B respecto a la media.',
      standardError: 'Estima la desviación estándar de la distribución de medias muestrales. Representa la variabilidad esperada de la media de la muestra A.',
      errorA: 'Estima la desviación estándar de la distribución de medias muestrales. Representa la variabilidad esperada de la media de la muestra A.',
      errorB: 'Estima la desviación estándar de la distribución de medias muestrales. Representa la variabilidad esperada de la media de la muestra B.',
      tStudent: 'Valor numérico que mide cuántas desviaciones estándar se aleja la media muestral de la hipótesis nula bajo una distribución t de Student.'
    };

    const meanAVal = formulasObj['mean']?.result ?? formulasObj['meanA']?.result;
    const meanBVal = formulasObj['meanB']?.result;

    const errorVal = this.testConfig.type === 'one'
      ? (formulasObj['standardError']?.result ?? formulasObj['errorA']?.result)
      : (formulasObj['tStudent']?.se ?? formulasObj['standardError']?.result ?? formulasObj['errorA']?.result);

    for (const key of Object.keys(formulasObj)) {
      const item = formulasObj[key];
      if (item && typeof item === 'object') {
        console.log(`Clave: ${key} -> Contenido real:`, item);

        let standardSubstitution = item.substitution || 'No especificada';

        if (key === 'tStudent') {
          const parsedMeanA = typeof meanAVal === 'number' ? meanAVal.toFixed(2) : meanAVal;
          const parsedError = typeof errorVal === 'number' ? errorVal.toFixed(2) : errorVal;

          if (this.testConfig.type === 'two' && meanBVal !== undefined) {
            const parsedMeanB = typeof meanBVal === 'number' ? meanBVal.toFixed(2) : meanBVal;
            standardSubstitution = `(${parsedMeanA} - ${parsedMeanB}) / ${parsedError}`;
          } else {
            const popMean = typeof this.testConfig.populationMean === 'number'
              ? this.testConfig.populationMean.toFixed(2)
              : this.testConfig.populationMean;
            standardSubstitution = `(${parsedMeanA} - ${popMean}) / ${parsedError}`;
          }
        }

        list.push({
          name: item.name || nameMap[key] || key.toUpperCase(),
          formula: item.formula || 'No especificada',
          substitution: key === 'tStudent' ? standardSubstitution : this.sanitizeSubstitution(standardSubstitution),
          result: item.result !== undefined ? item.result : 'N/D',
          explanation: item.explanation || item.description || item.descripcion || item.desc || explanationMap[key] || 'Métrica de análisis para la prueba de hipótesis.'
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
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 3,
            pointBackgroundColor: '#0f172a',
            pointHoverRadius: 7,
            tension: 0.3,
            fill: true
          },
          ...(chartData.apiB && chartData.apiB.length > 0
            ? [{
              label: 'API B',
              data: chartData.apiB,
              borderColor: '#bf44ef',
              backgroundColor: 'rgba(191, 68, 239, 0.08)',
              borderWidth: 3,
              pointBackgroundColor: '#0f172a',
              pointHoverRadius: 7,
              tension: 0.3,
              fill: true
            }]
            : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: {
                family: 'system-ui',
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: '#1e293b'
            },
            ticks: {
              color: '#94a3b8'
            }
          },
          y: {
            grid: {
              color: '#1e293b'
            },
            ticks: {
              color: '#94a3b8'
            }
          }
        }
      }
    });
  }
}
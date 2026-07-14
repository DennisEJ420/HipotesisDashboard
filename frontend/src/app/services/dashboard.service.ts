import {
  Injectable
} from '@angular/core';


import {
  HttpClient
} from '@angular/common/http';


import {
  Observable
} from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class DashboardService {



  private readonly apiUrl =
    'http://localhost:3000/api';




  constructor(
    private http: HttpClient
  ) {}





  // ==================================
  // DASHBOARD GENERAL
  // ==================================


  getDashboard(): Observable<any> {


    return this.http.get<any>(

      `${this.apiUrl}/dashboard`

    );


  }





  // ==================================
  // ESTADÍSTICAS GENERALES
  // ==================================


  getStatistics(): Observable<any> {


    return this.http.get<any>(

      `${this.apiUrl}/statistics`

    );


  }





  // ==================================
  // AUDITORÍA
  // ==================================


  getAudit(): Observable<any> {


    return this.http.get<any>(

      `${this.apiUrl}/audit`

    );


  }





  // ==================================
  // PRUEBA DE HIPÓTESIS PRINCIPAL
  // ==================================


  runHypothesis(
    body: any
  ): Observable<any> {



    return this.http.post<any>(


      `${this.apiUrl}/hypothesis`,


      body


    );


  }







  // ==================================
  // PRUEBA UNA MEDIA
  // (Mantenemos compatibilidad)
  // ==================================


  runOneSampleTest(
    body: any
  ): Observable<any> {



    return this.http.post<any>(


      `${this.apiUrl}/hypothesis/one-sample`,


      body


    );


  }







  // ==================================
  // PRUEBA DOS MEDIAS
  // (Mantenemos compatibilidad)
  // ==================================


  runTwoSampleTest(
    body: any
  ): Observable<any> {



    return this.http.post<any>(


      `${this.apiUrl}/hypothesis/two-sample`,


      body


    );


  }





}
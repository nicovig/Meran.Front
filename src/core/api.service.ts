import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL_TOKEN } from './api.config';
import { endpoints } from './app.endpoints';
import type {
  ApplicationDto,
  CreateApplicationRequestDto,
  UpdateApplicationRequestDto,
  AddApplicationUserRequestDto,
  ApplicationUserDto,
  LoginRequestDto,
  AuthResponseDto,
  ApplicationUserPaymentIssueDto,
  CreatePaymentEventRequestDto,
  PaymentEventDto,
  PaymentsOverviewDto,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL_TOKEN) baseUrl: string,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  getApplications(): Observable<ApplicationDto[]> {
    return this.http.get<ApplicationDto[]>(this.url(endpoints.applications.list));
  }

  createApplication(body: CreateApplicationRequestDto): Observable<ApplicationDto> {
    return this.http.post<ApplicationDto>(this.url(endpoints.applications.list), body);
  }

  updateApplication(id: string, body: UpdateApplicationRequestDto): Observable<ApplicationDto> {
    return this.http.put<ApplicationDto>(this.url(endpoints.applications.byId(id)), body);
  }

  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(this.url(endpoints.applications.byId(id)));
  }

  addApplicationUser(
    applicationId: string,
    body: AddApplicationUserRequestDto,
  ): Observable<ApplicationUserDto> {
    return this.http.post<ApplicationUserDto>(
      this.url(endpoints.applications.addUser(applicationId)),
      body,
    );
  }

  login(body: LoginRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(this.url(endpoints.auth.login), body);
  }

  getPaymentIssues(): Observable<ApplicationUserPaymentIssueDto[]> {
    return this.http.get<ApplicationUserPaymentIssueDto[]>(
      this.url(endpoints.notification.paymentIssues),
    );
  }

  runPaymentIssues(): Observable<ApplicationUserPaymentIssueDto[]> {
    return this.http.post<ApplicationUserPaymentIssueDto[]>(
      this.url(endpoints.notification.paymentIssuesRun),
      {},
    );
  }

  createPaymentEvent(
    applicationId: string,
    userId: string,
    body: CreatePaymentEventRequestDto,
  ): Observable<PaymentEventDto> {
    return this.http.post<PaymentEventDto>(
      this.url(endpoints.payments.create(applicationId, userId)),
      body,
    );
  }

  getPaymentsOverview(applicationId?: string): Observable<PaymentsOverviewDto> {
    let params = new HttpParams();
    if (applicationId != null && applicationId !== '') {
      params = params.set('applicationId', applicationId);
    }
    return this.http.get<PaymentsOverviewDto>(this.url(endpoints.payments.overview), {
      params,
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskDto, UpdateTaskDto } from '../domain/task.dto';
import { SprintTask } from '../domain/sprint-task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  getAll(): Observable<SprintTask[]> {
    return this.http.get<SprintTask[]>(this.baseUrl);
  }

  getById(id: string): Observable<SprintTask> {
    return this.http.get<SprintTask>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateTaskDto): Observable<SprintTask> {
    return this.http.post<SprintTask>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateTaskDto): Observable<SprintTask> {
    return this.http.put<SprintTask>(`${this.baseUrl}/${id}`, dto);
  }
}

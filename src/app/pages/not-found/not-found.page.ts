import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="not-found card" aria-labelledby="not-found-title">
      <span class="not-found__code" aria-hidden="true">404</span>
      <h1 id="not-found-title" class="page-title">Página no encontrada</h1>
      <p class="page-subtitle">La ruta solicitada no existe en IAS Sprint Board.</p>
      <a routerLink="/tasks" class="btn btn--primary">Ir al dashboard</a>
    </section>
  `,
  styles: `
    .not-found {
      text-align: center;
      padding: 3.5rem 2rem;
      max-width: 32rem;
      margin: 2.5rem auto;
      border-top: 4px solid transparent;
      border-image: linear-gradient(90deg, var(--primary), var(--accent)) 1;
    }

    .not-found__code {
      display: block;
      font-size: clamp(4rem, 12vw, 5.5rem);
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      line-height: 1;
      margin-bottom: 0.75rem;
      letter-spacing: -0.04em;
    }

    .page-subtitle {
      margin-bottom: 1.5rem;
    }
  `,
})
export class NotFoundPage {}

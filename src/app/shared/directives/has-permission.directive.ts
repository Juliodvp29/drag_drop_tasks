import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '@services/auth-service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() hasPermission: string | string[] = [];
  @Input() hasPermissionRequireAll = false;

  ngOnInit() {
    this.updateView();
  }

  private updateView(): void {
    const permissions = Array.isArray(this.hasPermission)
      ? this.hasPermission
      : [this.hasPermission];

    const hasPermission = this.hasPermissionRequireAll
      ? this.authService.hasAllPermissions(permissions)
      : this.authService.hasAnyPermission(permissions);

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

// Ejemplo de uso en template:
/*
<button *hasPermission="'tasks.create'">
  Crear Tarea
</button>

<div *hasPermission="['tasks.edit', 'tasks.delete']">
  Opciones avanzadas
</div>

<div *hasPermission="['users.view', 'users.edit']" [hasPermissionRequireAll]="true">
  Panel de administración
</div>
*/
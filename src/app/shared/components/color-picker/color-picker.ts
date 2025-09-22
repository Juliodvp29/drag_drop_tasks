import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, HostListener, Input, Output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColorChangeEvent, ColorOption } from '@models/color-picker';


@Component({
  selector: 'app-color-picker',
  imports: [CommonModule],
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPicker),
      multi: true
    }
  ],
})
export class ColorPicker {

  @Input() label?: string;
  @Input() placeholder = 'Selecciona un color';
  @Input() allowEmpty = true;
  @Input() allowCustomColor = false;
  @Input() colorOptions: ColorOption[] = [
    { name: 'Azul Primario', value: 'primary', class: 'bg-primary', code: '#A8B5D1', description: 'Color principal' },
    { name: 'Azul Claro', value: 'primary-light', class: 'bg-primary-light', code: '#C5D0E8', description: 'Azul suave' },
    { name: 'Azul Oscuro', value: 'primary-dark', class: 'bg-primary-dark', code: '#8A9BBF', description: 'Azul profundo' },
    { name: 'Verde Secundario', value: 'secondary', class: 'bg-secondary', code: '#B8D4C7', description: 'Verde natural' },
    { name: 'Naranja Acento', value: 'accent', class: 'bg-accent', code: '#E8C4A0', description: 'Naranja vibrante' },
    { name: 'Rosa Suave', value: 'soft-pink', class: 'bg-soft-pink', code: '#F4D1C7', description: 'Rosa delicado' },
    { name: 'Lavanda', value: 'soft-lavender', class: 'bg-soft-lavender', code: '#DFD3E8', description: 'Púrpura suave' },
    { name: 'Verde Éxito', value: 'success', class: 'bg-success', code: '#9AE6B4', description: 'Verde positivo' },
    { name: 'Amarillo Advertencia', value: 'warning', class: 'bg-warning', code: '#F6E05E', description: 'Amarillo llamativo' },
    { name: 'Rojo Error', value: 'error', class: 'bg-error', code: '#FEB2B2', description: 'Rojo de alerta' },
    { name: 'Azul Información', value: 'info', class: 'bg-info', code: '#BEE3F8', description: 'Azul informativo' },
    { name: 'Gris Claro', value: 'gray-200', class: 'bg-gray-200', code: '#E8E8E8', description: 'Gris neutral' }
  ];

  @Output() colorChange = new EventEmitter<ColorChangeEvent>();

  selectedColor = signal<string | null>(null);
  customColorInput = signal<string>('#000000');
  isOpen = signal<boolean>(false);

  // ControlValueAccessor implementation
  private onChange = (value: string | null) => { };
  private onTouched = () => { };

  writeValue(value: string | null): void {
    this.selectedColor.set(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.onTouched();
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  selectColor(color: string | null): void {
    this.selectedColor.set(color);
    this.onChange(color);

    // Preparar el evento con información completa
    const colorEvent: ColorChangeEvent = {
      value: color,
      hex: color ? this.getColorCode(color) : null,
      name: color ? this.getColorName(color) : undefined
    };

    this.colorChange.emit(colorEvent);
    this.closeDropdown();
  }

  getColorClass(color: string): string {
    const colorOption = this.colorOptions.find(c => c.value === color);
    return colorOption?.class || 'bg-gray-300';
  }

  getColorName(color: string): string {
    const colorOption = this.colorOptions.find(c => c.value === color);
    return colorOption?.name || color;
  }

  getColorCode(color: string): string {
    const colorOption = this.colorOptions.find(c => c.value === color);
    return colorOption?.code || color;
  }

  getColorDescription(color: string): string {
    const colorOption = this.colorOptions.find(c => c.value === color);
    return colorOption?.description || '';
  }

  onCustomColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.customColorInput.set(target.value);
  }

  onCustomColorInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.customColorInput.set(target.value);
  }

  applyCustomColor(): void {
    const customColor = this.customColorInput();
    if (this.isValidHexColor(customColor)) {
      // Para colores personalizados, el hex es el mismo valor
      const colorEvent: ColorChangeEvent = {
        value: customColor,
        hex: customColor,
        name: 'Color personalizado'
      };

      this.selectedColor.set(customColor);
      this.onChange(customColor);
      this.colorChange.emit(colorEvent);
      this.closeDropdown();
    }
  }

  isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // Cerrar dropdown cuando se hace click fuera
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.closeDropdown();
    }
  }

}

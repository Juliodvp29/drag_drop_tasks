import { Loader } from "@/app/shared/components/loader/loader";
import { Toast } from "@/app/shared/components/toast/toast";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNav } from '../side-nav/side-nav';
import { Confirmation } from "@/app/shared/components/confirmation/confirmation";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SideNav, Loader, Toast, Confirmation],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {

}

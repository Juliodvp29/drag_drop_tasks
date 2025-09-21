import { Loader } from "@/app/shared/components/loader/loader";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNav } from '../side-nav/side-nav';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SideNav, Loader],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {



}

import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Task } from '../../models/task.model'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  tasks = signal <Task[]>([
  ]);

  filter = signal<'all' | 'pending' | 'completed'>('all');
  tasksByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if(filter == 'pending'){
      return tasks.filter(task => !task.completed);
    }
    if(filter == 'completed'){
      return tasks.filter(task => task.completed);
    }
    return tasks;
  })

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
    ]
  });
    
    ngOnInit() {
      if (typeof window !== 'undefined' && localStorage) {
        const storage = localStorage.getItem('tasks');
        if (storage) {
          this.tasks.set(JSON.parse(storage));
        }
      }
    }

    constructor() {    
      if (typeof window !== 'undefined' && localStorage) {
        effect(() => {      
          localStorage.setItem('tasks', JSON.stringify(this.tasks()));
        });
      }
    }
  
  changeHandler(){
    if(this.newTaskCtrl.valid){
      const value = this.newTaskCtrl.value.trim();
      if(value !== ''){
        this.addTask(value);
        this.newTaskCtrl.setValue('');
      }
    }
  }

  addTask(title: string){
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    };
    this.tasks.update(prevState => [...prevState, newTask]);
  }

  deleteTask(index: number) {
    this.tasks.update((tasks) => tasks.filter((_, i) => i !== index));
  }

  updateTask(index: number) {
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if(position == index){
          return {
            ...task,
            completed: !task.completed
          }
        }
        return task;
      }) 
    }) 
  }

  updateTaskEditingMode(index: number) {
      this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if(position == index){
          return {
            ...task,
            editing: true
          }
        }
        return {
          ...task,
          editing: false
        };
      }) 
    })
  }

  updateTaskText(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if(position == index){
          return {
            ...task,
            title: input.value,
            editing: false
          }
        }
        return task;
      }) 
    })
  }

  changeFilter(filter: 'all' | 'pending' | 'completed') {
    this.filter.set(filter)
  }
} 

import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '@models/task.model';
import { TaskUtils } from '@utils/task.utils';

@Pipe({
  name: 'sortTasks'
})
export class SortTasksPipe implements PipeTransform {

  transform(tasks: Task[]): Task[] {
    return TaskUtils.sortTasksByPriority(tasks);
  }

}

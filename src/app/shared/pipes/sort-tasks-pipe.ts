import { Pipe, PipeTransform } from '@angular/core';
import { TaskUtils } from '@utils/task.utils';
import { ApiTask } from '../models/task.model';

@Pipe({
  name: 'sortTasks'
})
export class SortTasksPipe implements PipeTransform {

  transform(tasks: ApiTask[]): ApiTask[] {
    return TaskUtils.sortTasksByPriority(tasks);
  }

}

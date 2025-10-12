import { ApiTask, TaskComment } from '@/app/shared/models/task.model';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task-service';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss'
})
export class TaskDetail implements OnInit {

  @Input() task!: ApiTask;
  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();

  private taskService = inject(TaskService);

  comments = signal<TaskComment[]>([]);
  newComment = signal('');
  editingCommentId: number | null = null;
  editingContent = signal('');

  ngOnInit() {
    if (this.task) {
      this.loadComments();
    }
  }

  ngOnChanges() {
    if (this.task && this.isOpen) {
      this.loadComments();
    }
  }

  async loadComments() {
    if (this.task) {
      const comments = await this.taskService.getComments(this.task.id);
      console.log('Loaded comments:', comments);
      this.comments.set(comments);
    }
  }

  async addComment() {
    if (this.newComment().trim() && this.task) {
      await this.taskService.createComment(this.task.id, this.newComment().trim());
      this.newComment.set('');
      await this.loadComments();
    }
  }

  startEditing(comment: TaskComment) {
    this.editingCommentId = comment.id;
    this.editingContent.set(comment.content);
  }

  cancelEditing() {
    this.editingCommentId = null;
    this.editingContent.set('');
  }

  async saveComment() {
    if (this.editingCommentId && this.task) {
      await this.taskService.updateComment(this.task.id, this.editingCommentId, this.editingContent().trim());
      this.cancelEditing();
      await this.loadComments();
    }
  }

  async deleteComment(commentId: number) {
    if (this.task) {
      await this.taskService.deleteComment(this.task.id, commentId);
      await this.loadComments();
    }
  }

  close() {
    this.closePanel.emit();
  }
}

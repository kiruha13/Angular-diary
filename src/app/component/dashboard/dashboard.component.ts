import {Component, HostListener} from '@angular/core';
import {AuthService} from "../../shared/auth.service";
import {AngularFirestore, AngularFirestoreCollection, QueryFn} from "@angular/fire/compat/firestore";
import {Observable} from 'rxjs';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {OutputData} from '@editorjs/editorjs';
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  posts: any[] = [];
  private postsCollection: AngularFirestoreCollection<any> | null = null;
  posts$: Observable<any[]> | null = null;

  constructor(private auth: AuthService, private firestore: AngularFirestore, private router: Router, private fireauth: AngularFireAuth) {
    this.fetchPosts();
  }

  async fetchPosts() {
    const currentUser = await this.fireauth.currentUser;
    const author_uid = currentUser ? currentUser.uid : 'unknown';

    const query: QueryFn = ref => ref.where("author_id", "==", author_uid).orderBy("text.time", "desc");
    this.postsCollection = this.firestore.collection<any>('posts', query);
    this.posts$ = this.postsCollection.valueChanges({idField: 'id'});
  }

  ngOnInit(): void {
    // @ts-ignore
    this.posts$.subscribe((posts) => {
      this.posts = posts;
    });
  }

  parseEditorJS(editorData: OutputData): string {
    let html = '';
    if (editorData && editorData.blocks) {
      editorData.blocks.forEach(block => {
        switch (block.type) {
          case 'header':
            html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
            break;
          case 'paragraph':
            html += `<p>${block.data.text}</p>`;
            break;
          case 'image':
            const imageUrl = block.data.url;
            html += `<img src='${imageUrl}' alt=''>`;
            break;
          case 'list':
            if (block.data.style === 'unordered') {
              html += '<ul>';
            } else if (block.data.style === 'ordered') {
              html += '<ol>';
            }

            block.data.items.forEach((item: string) => {
              html += `<li>${item}</li>`;
            });

            if (block.data.style === 'unordered') {
              html += '</ul>';
            } else if (block.data.style === 'ordered') {
              html += '</ol>';
            }
            break;
        }
      });
    }
    return html;
  }

  DateConvert(str: any) {
    let date = new Date(str);
    return date.toLocaleDateString('en-us', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      hour12: false,
      minute: '2-digit'
    });
  }
  editPost(post: any) {
    // Set the 'isEditing' flag to true for the post being edited
    post.isEditing = true;
  }

  async deletePost(postId: string) {
    try {
      // Get a reference to the post document in the Firestore collection
      const postDocRef = this.postsCollection?.doc(postId).ref;
      if (!postDocRef) {
        console.log('Post not found.');
        return;
      }
      const postDocSnapshot = await postDocRef.get();
      if (!postDocSnapshot.exists) {
        console.log('Post not found.');
        return;
      }
// Delete the post document
      await postDocRef.delete();
      console.log('Post deleted successfully.');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }

  logoutfunc() {
    this.auth.logout();
  }

  adding() {
    this.router.navigate(['/add-post']);
  }
}

import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import EditorJS from '@editorjs/editorjs';
import Header from "@editorjs/header";
// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import SimpleImage from "@editorjs/simple-image";
// @ts-ignore
import Marker from '@editorjs/marker';
// @ts-ignore

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent {
  @Input() post: any;
  @ViewChild('editor') editorElement!: ElementRef<HTMLDivElement>;
  myForm: FormGroup;
  editor: EditorJS | undefined;
  originalCreationTime : number = 0;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private fireauth: AngularFireAuth
  ) {
    this.myForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }
  async ngOnInit(): Promise<void> {
      await this.fetchPost();
  }
  postId = this.route.snapshot.paramMap.get('id');

  async fetchPost() {
    try {
      if (!this.postId) {
        console.log('Post ID not provided.');
        return;
      }
      const currentUser = await this.fireauth.currentUser;
      if (!currentUser) {
        console.log('User not logged in.');
        return;
      }

      const postDocRef = this.firestore.collection('posts').doc(this.postId).ref;
      const postDocSnapshot = await postDocRef.get();

      if (!postDocSnapshot.exists) {
        console.log('Post not found.');
        return;
      }

      const postAuthorId = postDocSnapshot.get('author_id');
      if (postAuthorId !== currentUser.uid) {
        console.log('You are not authorized to edit this post.');
        return;
      }

      this.post = {...postDocSnapshot.data() as object, id: postDocSnapshot.id};
      this.myForm.patchValue({name: this.post.name});
      if (this.post.text){
        this.editor = new EditorJS({
          holder: this.editorElement.nativeElement,
          data: this.post.text,
          tools: {
            header: Header,
            list: List,
            image: SimpleImage,
            marker: Marker
            // Add other plugins as needed
          }
        });
        this.originalCreationTime = this.post.text.time;
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }

  async updatePost() {
    if (!this.postId) {
      console.log('Post ID not provided.');
      return;
    }
    if (!this.myForm.valid) {
      console.log('Please fill in all the required fields.');
      return;
    }

    try {
      if (this.editor != null) {
        const editorData = await this.editor.save();
        await this.firestore.collection('posts').doc(this.postId).update({
          name: this.myForm.value.name,
          text: editorData,
          'text.time': this.originalCreationTime
        });
        console.log('Post updated successfully.');
        this.router.navigate(['/dashboard']);
      }

    } catch (error) {
      console.error('Error updating post:', error);
    }
  }

  redirectToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

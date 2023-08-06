import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import EditorJS, {OutputData} from '@editorjs/editorjs';
import Header from "@editorjs/header";
import {Router} from "@angular/router";
// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import SimpleImage from "@editorjs/simple-image";
// @ts-ignore
import Marker from '@editorjs/marker';
// @ts-ignore
import InlineCode from '@editorjs/inline-code';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent implements AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef<HTMLDivElement>;
  editor: EditorJS | undefined;
  myForm: FormGroup;

  constructor(private toastr: ToastrService, private formBuilder: FormBuilder, private firestore: AngularFirestore, private fireauth: AngularFireAuth, private router: Router) {
    this.myForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.editor = new EditorJS({
      holder: this.editorElement.nativeElement,
      tools: {
        header: Header,
        list: List,
        image: SimpleImage,
        marker: Marker,
        inlineCode: InlineCode
        // Add other plugins as needed
      }
    });
  }

  async submitForm() {
    if (this.myForm.invalid || this.myForm.value.text =='') {
      return;
    }

    try {
      // Get the current user's UID
      const currentUser = await this.fireauth.currentUser;
      const author_uid = currentUser ? currentUser.uid : 'unknown';

      // Get form data and add the user's UID
      const formData = this.myForm.value;
      formData.author_id = author_uid;
      formData.text = await this.editor?.save() as OutputData;

      // Create a new document in the "posts" collection in Firestore
      await this.firestore.collection('posts').add(formData);
      this.toastr.success('Data added successfully!', 'Success');
      console.log('Data added successfully!');
      // You can also redirect the user or show a success message here
    } catch (error) {
      this.toastr.error('An error occurred while adding data.', 'Error');
      console.error('Error adding data:', error);
    }
  }

  redirtodash() {
    this.router.navigate(['/dashboard']);
  }
}


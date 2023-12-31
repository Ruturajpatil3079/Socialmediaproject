import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component,OnInit,Inject } from '@angular/core';
import { FirebaseTSFirestore, OrderBy } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrl: './reply.component.css'
})
export class ReplyComponent implements OnInit {

  firebase = new FirebaseTSFirestore();

  comments : Comment [] = [];

  constructor(@Inject(MAT_DIALOG_DATA)private postId: string){ }

  ngOnInit(): void {
    this.getComments();
  }

  // isCommentCreator(comment : Comment){
  //   try{
  //     return comment.creatorId == AppComponent.getUserDocument().userId;
  //   } catch (err){

  //   }
  // }

  isCommentCreator(comment: Comment): boolean {
    try {
      const userDocument = AppComponent.getUserDocument();
  
      if (userDocument) {
        return comment.creatorId === userDocument.userId;
      } else {
        // Handle the case when userDocument is undefined
        return false;
      }
    } catch (err) {
      console.error(err);
      // Handle the error case
      return false;
    }
  }

  getComments(){
    this.firebase.listenToCollection(
      {
        name: "Post Comments",
        path: ["Posts",this.postId,"PostComments"],
        where: [new OrderBy("timestamp","asc")],
        onUpdate : (result) =>{
          result.docChanges().forEach(
            postCommentDoc => {
              if(postCommentDoc.type == "added") {
                this.comments.unshift(<Comment>postCommentDoc.doc.data());
              }
            }
          )
        }
      }
    );
  }

  onSendClick(commentInput : HTMLInputElement){
    if(!(commentInput.value.length > 0)) return;
    this.firebase.create(
      {
        path:["Posts", this.postId,"PostComments"],
        data:{
          comment : commentInput.value,
          creatorID: AppComponent.getUserDocument().userId,
          creatorName:AppComponent.getUserDocument().publicName,
          timestamp: FirebaseTSApp.getFirestoreTimestamp(),
        },
        onComplete:(docId) => {
          commentInput.value= "";
        }
      }
    )
  }
}

export interface Comment {
  creatorId:string;
  creatorName:string;
  comment:string;
  timestamp:firebase.default.firestore.Timestamp;
}
